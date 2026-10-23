import {validBoard} from '../../supabase/functions/_shared/score.js';
export function readArcadeConfig(env={}){
 try{const url=new URL(env.VITE_ARCADE_URL);if(env.VITE_ARCADE_ENABLED!=='true'||url.username||url.password||!(url.protocol==='https:'||env.DEV===true&&url.protocol==='http:'&&['localhost','127.0.0.1'].includes(url.hostname)))return {};
 return {baseUrl:url.href.replace(/\/$/,''),buildId:env.VITE_BUILD_ID||'dev'};}catch{return {};}
}
export function createOnlineClient({baseUrl,fetch:send=globalThis.fetch,timeoutMs=5000}={}){
 async function request(path,body,validate){
  if(!baseUrl)return {ok:false,code:'unavailable'};
  const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),timeoutMs);
  try{const response=await Promise.race([send(`${baseUrl}/${path}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body),signal:controller.signal}),new Promise((_,reject)=>controller.signal.addEventListener('abort',()=>reject(Error('timeout')),{once:true}))]);const data=await response.json();
   if(!response.ok)return {ok:false,code:['expired','conflict','limited','invalid','unfinished','invalid_ticket'].includes(data.code)?data.code:'unavailable'};
   return validate(data)?{ok:true,data}:{ok:false,code:'unavailable'};
  }catch{return {ok:false,code:'unavailable'};}finally{clearTimeout(timeout);}
 }
 return {startRun:p=>request('run-ticket',p,d=>typeof d?.ticket==='string'&&/^[a-f0-9]{64}$/.test(d.ticket)&&Number.isFinite(Date.parse(d.expiresAt))),submitScore:p=>request('submit-score',p,d=>d?.accepted===true),getBoard:p=>request('leaderboard',p,d=>validBoard(d,p.mode,p.scoringVersion))};
}
