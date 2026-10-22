import {validatePlaytestBatch} from './playtest.js';
async function readBody(request){
 const reader=request.body?.getReader();if(!reader)throw new Error('empty');
 let bytes=0;const chunks=[];
 try{for(;;){const {done,value}=await reader.read();if(done)break;bytes+=value.length;if(bytes>32768){await reader.cancel();throw new RangeError('large');}chunks.push(value);}}finally{reader.releaseLock();}
 const all=new Uint8Array(bytes);let offset=0;for(const chunk of chunks){all.set(chunk,offset);offset+=chunk.length;}
 return JSON.parse(new TextDecoder().decode(all));
}
async function networkBucket(request,secret,now){
 const address=(request.headers.get('x-forwarded-for')||'unknown').split(',')[0].trim().slice(0,128);
 const encoder=new TextEncoder(),key=await crypto.subtle.importKey('raw',encoder.encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign']);
 const signed=await crypto.subtle.sign('HMAC',key,encoder.encode(`${now.toISOString().slice(0,10)}:${address}`));
 return [...new Uint8Array(signed)].map(n=>n.toString(16).padStart(2,'0')).join('');
}
export function createPlaytestHandler({origins,secret,ingest,clock=()=>new Date()}){
 return async request=>{
  const origin=request.headers.get('origin');
  const allowed=origins.includes(origin);
  const headers={'Content-Type':'application/json','Cache-Control':'no-store',Vary:'Origin',...(allowed?{'Access-Control-Allow-Origin':origin,'Access-Control-Allow-Methods':'POST, OPTIONS','Access-Control-Allow-Headers':'Content-Type'}:{})};
  const reply=(status,body)=>new Response(JSON.stringify(body),{status,headers});
  if(!allowed)return reply(403,{error:'Origin not allowed'});
  if(request.method==='OPTIONS')return new Response(null,{status:204,headers});
  if(request.method!=='POST')return reply(405,{error:'Method not allowed'});
  if(!secret)return reply(503,{error:'Collection unavailable'});
  if(!request.headers.get('content-type')?.startsWith('application/json'))return reply(415,{error:'JSON required'});
  let body;try{body=await readBody(request);}catch(e){return reply(e instanceof RangeError?413:400,{error:'Invalid request'});}
  const checked=validatePlaytestBatch(body);if(!checked.ok)return reply(400,{error:checked.error});
  try{
   const result=await ingest(checked.events,await networkBucket(request,secret,clock()));
   if(result.limited)return reply(429,{error:'Try later'});
   return reply(200,{accepted:result.accepted});
  }catch{return reply(503,{error:'Collection unavailable'});}
 };
}
