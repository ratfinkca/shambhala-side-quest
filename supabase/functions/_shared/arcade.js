import {validRun,validateScore,MODES} from './score.js';
const hex=b=>[...new Uint8Array(b)].map(v=>v.toString(16).padStart(2,'0')).join('');
const encode=s=>new TextEncoder().encode(s);
const hash=async s=>hex(await crypto.subtle.digest('SHA-256',encode(s)));
const canonical=o=>Array.isArray(o)?o.map(canonical):o&&typeof o==='object'?Object.fromEntries(Object.keys(o).sort().map(k=>[k,canonical(o[k])])):o;
export function createArcadeHandler({kind,origins,secret,rpc}){
 return async request=>{
  const origin=request.headers.get('origin'),allowed=origins.includes(origin);
  const headers={'Content-Type':'application/json',Vary:'Origin','Cache-Control':'no-store',...(allowed?{'Access-Control-Allow-Origin':origin,'Access-Control-Allow-Methods':'POST, OPTIONS','Access-Control-Allow-Headers':'Content-Type'}:{})};
  const reply=(status,body)=>new Response(JSON.stringify(body),{status,headers});
  if(!allowed)return reply(403,{code:'forbidden'});
  if(request.method==='OPTIONS')return new Response(null,{status:204,headers});
  if(request.method!=='POST')return reply(405,{code:'invalid'});
  if(!secret)return reply(503,{code:'unavailable'});
  if(!request.headers.get('content-type')?.startsWith('application/json'))return reply(415,{code:'invalid'});
  let p;try{
   const reader=request.body?.getReader();if(!reader)throw Error();let bytes=0,text='';const decoder=new TextDecoder();
   for(;;){const {done,value}=await reader.read();if(done)break;bytes+=value.length;if(bytes>32768){await reader.cancel();return reply(413,{code:'invalid'});}text+=decoder.decode(value,{stream:true});}p=JSON.parse(text+decoder.decode());
  }catch{return reply(400,{code:'invalid'});}
  if(kind==='run-ticket'&&!validRun(p)||kind==='submit-score'&&!validateScore(p).ok||kind==='leaderboard'&&(!p||Object.keys(p).length!==2||!MODES.includes(p.mode)||!/^arcade-v[1-9][0-9]{0,3}$/.test(p.scoringVersion)))return reply(400,{code:'invalid'});
  try{
   if(kind==='leaderboard'){const rows=await rpc('arcade_board',{p_mode:p.mode,p_version:p.scoringVersion});headers['Cache-Control']='public, max-age=30';return reply(200,rows);}
   const key=await crypto.subtle.importKey('raw',encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign']);
   const ip=(request.headers.get('x-forwarded-for')||'unknown').split(',')[0].trim().slice(0,128);
   const bucket=hex(await crypto.subtle.sign('HMAC',key,encode(new Date().toISOString().slice(0,10)+':'+ip)));
   let result;
   if(kind==='run-ticket'){
    const ticket=hex(crypto.getRandomValues(new Uint8Array(32)));
    result=await rpc('arcade_ticket',{p_hash:await hash(ticket),p_run:p.runId,p_mode:p.mode,p_version:p.scoringVersion,p_build:p.buildId,p_bucket:bucket});
    if(!result.code)result={...result,ticket};
   }else result=await rpc('arcade_submit',{p_hash:await hash(p.ticket),p_digest:await hash(JSON.stringify(canonical(p))),p_record:{...p,ticket:undefined},p_bucket:bucket});
   return reply(result.code?result.code==='limited'?429:400:200,result);
  }catch{return reply(503,{code:'unavailable'});}
 };
}
