import {challengeFields} from '../player-setup-view.js';
import {validBoard} from '../../supabase/functions/_shared/smf-score.js';
import {SMF_DEFAULT_RUSH_STAGE_ID} from '../../supabase/functions/_shared/smf-rules.js';
import {createSubmission} from '../online/submission.js';
import {resolveSmfScoringVersion} from './seasons.js';
export function smfRushFields(run){return run?.mode==='rush'?{rushStageId:run.rushStageId??SMF_DEFAULT_RUSH_STAGE_ID}:{};}
export function smfRunFields(run){return {scoringVersion:resolveSmfScoringVersion(run?.scoringVersion),...smfRushFields(run),...challengeFields(run)};}
export function resumeSmfSubmission(active,current){
 if(!active)return null;
 if(current?.runId===active.id)return current;
 return active.submission?createSubmission(active.id,active.submission):null;
}
export function readSmfArcadeConfig(env={}){
 try{const url=new URL(env.VITE_SMF_ARCADE_URL);if(env.VITE_SMF_ARCADE_ENABLED!=='true'||url.username||url.password||!(url.protocol==='https:'||env.DEV===true&&url.protocol==='http:'&&['localhost','127.0.0.1'].includes(url.hostname)))return {};
 return {baseUrl:url.href.replace(/\/$/,''),buildId:env.VITE_BUILD_ID||'dev'};}catch{return {};}
}
export function createSmfOnlineClient({baseUrl,fetch:send=globalThis.fetch,timeoutMs=5000}={}){
 async function request(path,body,validate){
  if(!baseUrl)return {ok:false,code:'unavailable'};
  const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),timeoutMs);
  try{const response=await Promise.race([send(`${baseUrl}/${path}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body),signal:controller.signal}),new Promise((_,reject)=>controller.signal.addEventListener('abort',()=>reject(Error('timeout')),{once:true}))]);const data=await response.json();
   if(!response.ok)return {ok:false,code:['expired','conflict','limited','invalid','unfinished','invalid_ticket','invalid_name'].includes(data.code)?data.code:'unavailable'};
   return validate(data)?{ok:true,data}:{ok:false,code:'unavailable'};
  }catch{return {ok:false,code:'unavailable'};}finally{clearTimeout(timeout);}
 }
 return {startRun:p=>request('smf-run-ticket',p,d=>typeof d?.ticket==='string'&&/^[a-f0-9]{64}$/.test(d.ticket)&&Number.isFinite(Date.parse(d.expiresAt))),submitScore:p=>request('smf-submit-score',p,d=>d?.accepted===true),getBoard:p=>request('smf-leaderboard',p,d=>validBoard(d,p.mode,p.scoringVersion,p.rushStageId,p.challenge))};
}
