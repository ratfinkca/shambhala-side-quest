import {UUID,MODES,validRushSelection} from './smf-score.js';
import {smfRuleStage,SMF_SCORING_VERSIONS} from './smf-rules.js';
const exact=(o,keys)=>o&&typeof o==='object'&&!Array.isArray(o)&&Object.keys(o).length===keys.length&&keys.every(k=>Object.hasOwn(o,k));
const uint=n=>Number.isSafeInteger(n)&&n>=0;
const stages=['smf-living-room','smf-fractal','smf-grove','smf-amp','smf-pagoda','smf-village'];
const perks=['boots','noodle','moth','bracelet','surfer','battery','encore','sweet'];
export function validSmfEvents(events){return Array.isArray(events)&&events.length>0&&events.length<=20&&events.every(e=>{
 const common=['editionId','scoringVersion','eventId','guestId','buildId','mode','type'];
 if(!e||e.editionId!=='smf'||!SMF_SCORING_VERSIONS.includes(e.scoringVersion)||typeof e.eventId!=='string'||!UUID.test(e.eventId)||typeof e.guestId!=='string'||!UUID.test(e.guestId)||typeof e.buildId!=='string'||!/^[\w.-]{1,100}$/.test(e.buildId)||!MODES.includes(e.mode))return false;
 if(Object.hasOwn(e,'movementMode')){
  if(!['run','stage'].includes(e.type)||!['tap','swipe','stick'].includes(e.movementMode))return false;
  common.push('movementMode');
 }
 if(Object.hasOwn(e,'rushStageId')){
  if(!['run','stage'].includes(e.type)||!validRushSelection(e))return false;
  common.push('rushStageId');
 }
 if(e.type==='run')return exact(e,[...common,'outcome','stagesCleared','totalScore'])&&['complete','failed','banked','exit'].includes(e.outcome)&&uint(e.stagesCleared)&&e.stagesCleared<=1440&&uint(e.totalScore);
 if(e.type==='stage')return exact(e,[...common,'stageIndex','stageId','pickups','closePasses','bassUses'])&&uint(e.stageIndex)&&e.stageIndex<1440&&stages.includes(e.stageId)&&(e.mode==='endless'||e.stageIndex<(e.mode==='rush'?1:6))&&smfRuleStage(e.mode,e.stageIndex,e.rushStageId).id===e.stageId&&[e.pickups,e.closePasses,e.bassUses].every(n=>uint(n)&&n<=100000);
 if(e.type==='perk')return exact(e,[...common,'stageIndex','action','perk','replaced'])&&uint(e.stageIndex)&&e.stageIndex<1440&&['keep','take','swap'].includes(e.action)&&(e.perk===null||perks.includes(e.perk))&&(e.replaced===null||perks.includes(e.replaced));
 return false;
});}
export function createSmfPlaytestHandler({origins,secret,rpc}){return async request=>{
 const origin=request.headers.get('origin'),allowed=origins.includes(origin);const headers={'Content-Type':'application/json',Vary:'Origin','Cache-Control':'no-store',...(allowed?{'Access-Control-Allow-Origin':origin,'Access-Control-Allow-Methods':'POST, OPTIONS','Access-Control-Allow-Headers':'Content-Type'}:{})};
 const reply=(status,body)=>new Response(JSON.stringify(body),{status,headers});if(!allowed)return reply(403,{code:'forbidden'});if(request.method==='OPTIONS')return new Response(null,{status:204,headers});if(request.method!=='POST')return reply(405,{code:'invalid'});if(!secret)return reply(503,{code:'unavailable'});if(!request.headers.get('content-type')?.startsWith('application/json'))return reply(415,{code:'invalid'});
 let events;try{const reader=request.body.getReader();let bytes=0,text='';const decoder=new TextDecoder();for(;;){const {done,value}=await reader.read();if(done)break;bytes+=value.length;if(bytes>16384){await reader.cancel();return reply(413,{code:'invalid'});}text+=decoder.decode(value,{stream:true});}events=JSON.parse(text+decoder.decode());}catch{return reply(400,{code:'invalid'});}if(!validSmfEvents(events))return reply(400,{code:'invalid'});
 try{const enc=new TextEncoder(),key=await crypto.subtle.importKey('raw',enc.encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign']);const ip=(request.headers.get('x-forwarded-for')||'unknown').split(',')[0].trim().slice(0,128);const sig=await crypto.subtle.sign('HMAC',key,enc.encode(new Date().toISOString().slice(0,10)+':'+ip));const bucket=[...new Uint8Array(sig)].map(v=>v.toString(16).padStart(2,'0')).join('');const result=await rpc('smf_ingest',{p_events:events,p_bucket:bucket});return reply(result.code?429:200,result);}catch{return reply(503,{code:'unavailable'});}
};}
