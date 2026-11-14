import {GENERIC_RULES,GENERIC_SCORING_VERSIONS,genericTarget} from '../supabase/functions/_shared/edition-rules.js';
import {PERKS,rulesFor,stageFor,modernSeason} from './run.js';
import {WARDROBE,normalizeOutfit} from './wardrobe.js';
import {THEMES} from './themes.js';
import {UUID,INPUTS,MAX_ONLINE_STAGES,validateScore} from '../supabase/functions/_shared/score.js';
import {CHALLENGES,isChallenge} from '../supabase/functions/_shared/challenges.js';
import {validatePlayerName} from '../supabase/functions/_shared/player-name.js';
import {flowRecoveryOK} from './flow.js';
import {mysteryRecoveryOK} from './mystery.js';
export const RECOVERY_VERSION=1,RECOVERY_RULES='endless-recovery-1',RECOVERY_LIMIT=2*1024*1024;
const runKeys='id scoringVersion themeId mode stageIndex totalScore stagesCleared perks scoreStages bassChargeMs status submitted availablePerks pendingPerk remixStageIndex scoreOverflow endedVoluntarily initials initialsDraft displayName displayNameDraft challenge submissionMessage buildId'.split(' ');
const roundKeys='surferMs scoreComponents bass mystery shieldsRemaining remainingMs score chain multiplier bestMultiplier pickups closePasses slowedMs flowMs flowTaken flowSchedule sincePickupMs ended runId bassUses stamina'.split(' ');
const encounterKeys='active spoiled travel cooldownUntil previousPlayer previousDancer touching nearest protected friendPasses'.split(' ');
const pick=(v,keys)=>Object.fromEntries(keys.filter(k=>Object.hasOwn(v,k)).map(k=>[k,v[k]]));
const object=v=>v&&typeof v==='object'&&!Array.isArray(v);
const allowed=(v,keys)=>object(v)&&Object.keys(v).every(k=>keys.includes(k));
const finite=(n,min=0,max=Number.MAX_SAFE_INTEGER)=>typeof n==='number'&&Number.isFinite(n)&&n>=min&&n<=max;
const integer=(n,min=0,max=Number.MAX_SAFE_INTEGER)=>Number.isSafeInteger(n)&&n>=min&&n<=max;
const bool=v=>typeof v==='boolean';
const rewardKey=key=>{if(typeof key!=='string')return false;const parts=key.split(':');if(parts.length!==2)return false;const [category,id]=parts;return category==='perk'?Object.hasOwn(PERKS,id):Object.hasOwn(WARDROBE,category)&&WARDROBE[category].some(item=>item.id===id);};
const point=p=>allowed(p,['x','y'])&&finite(p.x,0,960)&&finite(p.y,0,640);
const perks=p=>Array.isArray(p)&&p.length<=10&&new Set(p).size===p.length&&p.every(k=>Object.hasOwn(PERKS,k));
const counts=(a,n)=>Array.isArray(a)&&a.length===n&&a.every(v=>integer(v));
export function recoveryScreen(s,run){
 if(run.status==='playing')return 'paused';
 if(run.status==='ended')return 'results';
 if(run.status==='ready')return 'rules';
 return (s.name==='confirmExit'?s.returnTo:s.name)==='upgrade'?'upgrade':'summary';
}
export function makeRecovery({run,screen,scene,summary=null,resultSnapshot=null,progressReward=null,submission=null,inputType='unknown',buildId='dev',now=Date.now()}){
 if(scene?.round&&Object.hasOwn(scene.round,'timingId'))return null;
 if(run?.mode!=='endless'||run.status==='ready'&&run.stageIndex===0)return null;
 const logical=scene?{round:pick(scene.round,roundKeys),player:scene.player,sparks:scene.sparks,candy:scene.candy,crowd:scene.crowd.map(e=>pick(e,encounterKeys))}:null;
 if(logical&&logical.round.sincePickupMs===Infinity)logical.round.sincePickupMs=null;
 return structuredClone({version:RECOVERY_VERSION,rules:RECOVERY_RULES,scoringVersion:run.scoringVersion??GENERIC_RULES.id,savedAt:now,run:{...pick(run,runKeys),scoringVersion:run.scoringVersion??GENERIC_RULES.id,buildId:run.buildId||buildId},screen:recoveryScreen(screen,run),scene:run.status==='playing'?logical:null,summary:summary?pick(summary,['qualified','pickups','target','score','totalScore']):null,resultSnapshot:resultSnapshot?{...resultSnapshot,outfit:normalizeOutfit(resultSnapshot.outfit)}:null,progressReward,submission:submission?.snapshot?submission.snapshot():submission,inputType});
}
function historyOK(r){
 if(!Array.isArray(r.scoreStages))return false;
 const len=r.scoreStages.length;if(!integer(len,0,MAX_ONLINE_STAGES))return false;
 if(!len)return r.perks.length===0&&r.totalScore===0&&r.stagesCleared===0&&r.stageIndex===0&&['playing','ready'].includes(r.status);
 const cleared=r.scoreStages.filter((s,i)=>s.pickups>=genericTarget(i,true,r.challenge,r.scoringVersion)).length;
 const total=r.scoreStages.reduce((a,s)=>a+s.score,0);
 if(!validateScore({runId:r.id,ticket:'a'.repeat(64),...(modernSeason(r.scoringVersion)?{displayName:'Raver',challenge:r.challenge}:{initials:'AAA'}),mode:'endless',scoringVersion:r.scoringVersion??GENERIC_RULES.id,buildId:r.buildId,inputType:'unknown',totalScore:total,stagesCleared:cleared,stages:r.scoreStages}).ok)return false;
 if(r.scoreOverflow){if(len!==MAX_ONLINE_STAGES||r.stageIndex<len||r.totalScore<total||r.stagesCleared<cleared)return false;}
 else {
  if(r.totalScore!==total||r.stagesCleared!==cleared)return false;
  const indices=r.status==='ended'&&r.endedVoluntarily?[len-1,len]:[['upgrade','ended'].includes(r.status)?len-1:len];
  if(!indices.includes(r.stageIndex))return false;
 }
 if(r.status!=='ended'&&cleared!==len)return false;
 // After the cap, unrecorded stages may add/swap perks; the retained prefix cannot validate those transitions.
 if(r.scoreOverflow)return true;
 const prev=r.scoreStages.at(-1).perks;
 const added=r.perks.filter(p=>!prev.includes(p)).length,removed=prev.filter(p=>!r.perks.includes(p)).length;
 const nextStage=['playing','ready'].includes(r.status)||r.status==='ended'&&r.endedVoluntarily&&r.stageIndex===len;
 return !nextStage?added===0&&removed===0:added===0&&removed===0||prev.length<4&&added===1&&removed===0||prev.length===4&&added===1&&removed===1;
}
function roundOK(s,r){
 if(!allowed(s,['round','player','sparks','candy','crowd'])||!point(s.player)||!Array.isArray(s.sparks)||s.sparks.length!==12||!s.sparks.every(point)||!allowed(s.candy,['placed','x','y'])||!bool(s.candy.placed)||!point({x:s.candy.x,y:s.candy.y}))return false;
 const q=s.round,rules=rulesFor(r.perks,r.scoringVersion);
 if(q?.stamina!==undefined&&!finite(q.stamina,0,100))return false;
 if(!allowed(q,roundKeys)||q.runId!==r.id||q.ended!==false||!finite(q.remainingMs,.001,60000)||!integer(q.score)||!integer(q.chain)||!integer(q.multiplier,1,5)||q.multiplier!==Math.min(5,1+Math.floor(q.chain/5))||!integer(q.bestMultiplier,q.multiplier,5)||!integer(q.pickups)||!integer(q.closePasses)||!integer(q.shieldsRemaining,0,rules.bumpShields)||!finite(q.slowedMs,0,600)||!finite(q.surferMs,0,rules.surferDurationMs)||!finite(q.flowMs,0,rules.flowDurationMs+rules.firstFlowBonusMs)||!(q.sincePickupMs===null||finite(q.sincePickupMs))||q.bassUses!==undefined&&!integer(q.bassUses))return false;
 if(!flowRecoveryOK(q,{rules,durationMs:60000}))return false;
 const c=q.scoreComponents;if(!allowed(c,['sparks','passes'])||!counts(c.sparks,20)||!counts(c.passes,2))return false;
 const pickups=c.sparks.reduce((a,b)=>a+b,0),passes=c.passes[0]+c.passes[1];
 const points=c.sparks.reduce((a,n,i)=>a+n*10*(Math.floor(i/4)+1)*(Math.floor(i%4/2)+1)*(i%2+1),0)+rules.closePassPoints*(c.passes[0]+2*c.passes[1]);
 const tiers=Array.from({length:5},(_,i)=>c.sparks.slice(i*4,i*4+4).reduce((a,b)=>a+b,0));
 if(pickups!==q.pickups||passes!==q.closePasses||points!==q.score||q.chain>q.pickups||tiers[4]>0&&tiers[3]<5||tiers[2]<5*Math.ceil(tiers[3]/5)||tiers[1]<5*Math.ceil(tiers[2]/5)||tiers[0]<4*Math.ceil(tiers[1]/5))return false;
 const b=q.bass;if(!allowed(b,['chargeMs','exposureMs','activeMs','activeDurationMs'])||!finite(b.chargeMs,0,10000)||!finite(b.exposureMs,0,6000)||!finite(b.activeMs,0,6000)||!finite(b.activeDurationMs,0,6000)||b.activeMs>b.activeDurationMs||b.activeMs>0&&b.chargeMs!==0)return false;
 if(!finite(q.mystery?.elapsedMs,0,60000)||Math.abs(q.mystery.elapsedMs-(60000-q.remainingMs))>1||!mysteryRecoveryOK(q.mystery,{rules,durationMs:60000,elapsed:60000-q.remainingMs}))return false;
 const stage=stageFor(r);
 return Array.isArray(s.crowd)&&s.crowd.length===stage.crowdAnchors.length&&s.crowd.every(e=>allowed(e,encounterKeys)&&bool(e.active)&&bool(e.spoiled)&&finite(e.travel)&&finite(e.cooldownUntil,0,63000)&&[e.previousPlayer,e.previousDancer].every(p=>p===null||point(p))&&(e.previousPlayer===null)===(e.previousDancer===null)&&(!e.active||finite(e.nearest))&&['touching','protected'].every(k=>e[k]===undefined||bool(e[k]))&&(e.nearest===undefined||finite(e.nearest))&&(!Object.hasOwn(e,'friendPasses')||integer(e.friendPasses,0,modernSeason(r.scoringVersion)?CHALLENGES[r.challenge].friendPasses:4)))&&s.crowd.reduce((sum,e)=>sum+(Object.hasOwn(e,'friendPasses')?e.friendPasses:0),0)<=q.closePasses;
}
export function readRecovery(raw,{editionId='generic'}={}){
 const fail=code=>({ok:false,code});
 if(editionId!=='generic')return fail('incompatible');
 try{
  if(!object(raw))return fail('invalid');
  if(raw.version!==RECOVERY_VERSION||raw.rules!==RECOVERY_RULES||!GENERIC_SCORING_VERSIONS.includes(raw.scoringVersion??GENERIC_RULES.id))return fail('incompatible');
  if(new TextEncoder().encode(JSON.stringify(raw)).length>RECOVERY_LIMIT)return fail('oversized');
  if(!allowed(raw,['version','rules','scoringVersion','savedAt','run','screen','scene','summary','resultSnapshot','progressReward','submission','inputType'])||!finite(raw.savedAt)||!INPUTS.includes(raw.inputType))return fail('invalid');
  const r=raw.run;
  if(modernSeason(r?.scoringVersion)&&!isChallenge(r.challenge)||r?.displayName!==undefined&&!validatePlayerName(r.displayName).ok||r?.displayNameDraft!==undefined&&(typeof r.displayNameDraft!=='string'||r.displayNameDraft.length>128))return fail('invalid');
  if(!allowed(r,runKeys)||(r.scoringVersion??GENERIC_RULES.id)!==(raw.scoringVersion??GENERIC_RULES.id)||!UUID.test(r.id)||r.mode!=='endless'||!THEMES.some(t=>t.id===r.themeId)||!integer(r.stageIndex,0,1e6)||!integer(r.totalScore)||!integer(r.stagesCleared,0,r.stageIndex+1)||!perks(r.perks)||r.perks.length>4||r.availablePerks!==undefined&&!perks(r.availablePerks)||!finite(r.bassChargeMs,0,10000)||!['playing','upgrade','ready','ended'].includes(r.status)||!bool(r.submitted)||!(/^[\w.-]{1,100}$/).test(r.buildId)||r.pendingPerk!=null&&!Object.hasOwn(PERKS,r.pendingPerk)||r.remixStageIndex!==undefined&&!integer(r.remixStageIndex,0,r.stageIndex+1)||['scoreOverflow','endedVoluntarily'].some(k=>r[k]!==undefined&&!bool(r[k]))||r.initials!==undefined&&!/^[A-Z0-9]{3}$/.test(r.initials)||r.initialsDraft!==undefined&&!/^[A-Z0-9]{0,3}$/.test(r.initialsDraft)||r.submissionMessage!==undefined&&(typeof r.submissionMessage!=='string'||r.submissionMessage.length>250)||!historyOK(r))return fail('invalid');
  if(!['paused','rules','summary','upgrade','results'].includes(raw.screen)||raw.screen!==recoveryScreen({name:raw.screen},r))return fail('invalid');
  if(r.status==='playing'?!roundOK(raw.scene,r):raw.scene!==null)return fail('invalid');
  if(raw.summary!==null&&(!allowed(raw.summary,['qualified','pickups','target','score','totalScore','progressContext'])||!bool(raw.summary.qualified)||!['pickups','target','score','totalScore'].every(k=>integer(raw.summary[k]))))return fail('invalid');
  if(['summary','upgrade'].includes(raw.screen)&&!raw.summary)return fail('invalid');
  if(raw.resultSnapshot!==null&&(!allowed(raw.resultSnapshot,['id','score','stagesCleared','inputType','outfit','completedAt','scoringVersion','displayName','challenge'])||raw.resultSnapshot.scoringVersion!==undefined&&raw.resultSnapshot.scoringVersion!==(r.scoringVersion??GENERIC_RULES.id)||raw.resultSnapshot.id!==r.id||raw.resultSnapshot.score!==r.totalScore||raw.resultSnapshot.stagesCleared!==r.stagesCleared||!finite(raw.resultSnapshot.completedAt)))return fail('invalid');
  if(raw.resultSnapshot?.displayName!==undefined&&!validatePlayerName(raw.resultSnapshot.displayName).ok||raw.resultSnapshot?.challenge!==undefined&&raw.resultSnapshot.challenge!==r.challenge)return fail('invalid');
  if(r.status==='ended'&&(!raw.resultSnapshot||!r.endedVoluntarily&&!raw.summary))return fail('invalid');
  if(raw.progressReward!==null&&(!allowed(raw.progressReward,['xp','rewards','persisted','progress'])||!integer(raw.progressReward.xp)||!Array.isArray(raw.progressReward.rewards)||!raw.progressReward.rewards.every(rewardKey)))return fail('invalid');
  const sub=raw.submission;
  if(sub!==null){
   if(!allowed(sub,['runId','status','code','ticket','expiresAt','payload'])||sub.runId!==r.id||!['waiting','ready','pending','succeeded','ineligible','error'].includes(sub.status)||sub.ticket!==null&&!/^[a-f0-9]{64}$/.test(sub.ticket)||sub.expiresAt!==null&&!finite(sub.expiresAt)||sub.code!==null&&!['expired','conflict','limited','invalid','unfinished','invalid_ticket','invalid_name','unavailable'].includes(sub.code))return fail('invalid');
   if(sub.payload!==null&&(!validateScore(sub.payload).ok||sub.payload.scoringVersion!==(r.scoringVersion??GENERIC_RULES.id)||sub.payload.runId!==r.id||sub.payload.ticket!==sub.ticket||sub.payload.buildId!==r.buildId||modernSeason(r.scoringVersion)&&sub.payload.challenge!==r.challenge||sub.payload.totalScore!==r.totalScore||sub.payload.stagesCleared!==r.stagesCleared||JSON.stringify(sub.payload.stages)!==JSON.stringify(r.scoreStages)))return fail('invalid');
   if(['pending','succeeded'].includes(sub.status)&&!sub.payload)return fail('invalid');
  }
  const value=structuredClone(raw);value.scoringVersion??=GENERIC_RULES.id;value.run.scoringVersion??=GENERIC_RULES.id;
  if(value.resultSnapshot){value.resultSnapshot.scoringVersion??=value.run.scoringVersion;value.resultSnapshot.outfit=normalizeOutfit(value.resultSnapshot.outfit);}
  return {ok:true,value};
 }catch{return fail('invalid');}
}
