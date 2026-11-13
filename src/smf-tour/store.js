import {BONUSES,ROUTE,createTourProfile,stageForRun,mainStageId} from './model.js';
import {mainStage,bonusConfig,bonusController} from './content.js';
import {getTiming} from '../stage-clock.js';
import {PERKS} from '../run.js';
import {MAX_ONLINE_STAGES} from '../../supabase/functions/_shared/score.js';
import {normalizeThemePreference,THEMES} from '../themes.js';
import {WARDROBE} from '../wardrobe.js';
import {createEncounter} from '../festival.js';
import {isRushStageId,resolveRushStageId,normalizeRushRotation,lastRushStageId,limitRushBoard} from './rush-rotation.js';
import {ORIGINAL_SMF_SCORING_VERSION,resolveSmfScoringVersion,limitSeasonBoard} from './seasons.js';

const LIMIT=2*1024*1024;
const object=v=>v!==null&&typeof v==='object'&&!Array.isArray(v);
const allowed=(v,keys)=>object(v)&&Object.keys(v).every(key=>keys.includes(key));
const number=(v,min=0,max=1e9)=>typeof v==='number'&&Number.isFinite(v)&&v>=min&&v<=max;
const integer=(v,min=0,max=1e9)=>Number.isSafeInteger(v)&&v>=min&&v<=max;
const id=v=>typeof v==='string'&&/^[\w:.-]{1,150}$/.test(v);
const count=v=>integer(v)?v:0;
const bool=v=>typeof v==='boolean';
const point=v=>allowed(v,['x','y'])&&number(v.x,0,960)&&number(v.y,0,640);
const unique=(items,known)=>Array.isArray(items)?[...new Set(items.filter(v=>known.includes(v)))]:[];
const perkList=v=>Array.isArray(v)&&v.length<=4&&new Set(v).size===v.length&&v.every(p=>Object.hasOwn(PERKS,p));

// Snapshot payloads are plain, finite JSON, bounded before traversal or writing.
// Activity-specific restore methods validate their own logical state as well.
function boundedJSON(value){
 let nodes=0;const ancestors=new Set();
 function visit(v,depth){
  if(++nodes>200000||depth>16)return false;
  if(v===null||typeof v==='boolean')return true;
  if(typeof v==='number')return Number.isFinite(v)&&Math.abs(v)<=Number.MAX_SAFE_INTEGER;
  if(typeof v==='string')return v.length<=2048;
  if(typeof v!=='object'||ancestors.has(v))return false;
  if(!Array.isArray(v)&&Object.getPrototypeOf(v)!==Object.prototype&&Object.getPrototypeOf(v)!==null)return false;
  const entries=Object.entries(v);if(entries.length>(Array.isArray(v)?MAX_ONLINE_STAGES:256))return false;
  ancestors.add(v);const ok=entries.every(([key,child])=>key.length<=100&&!['__proto__','prototype','constructor'].includes(key)&&visit(child,depth+1));ancestors.delete(v);return ok;
 }
 try{return visit(value,0)&&new TextEncoder().encode(JSON.stringify(value)).length<=LIMIT;}catch{return false;}
}

function sceneOK(scene,stage,runId){
 if(!allowed(scene,['round','player','sparks','candy','crowd'])||!point(scene.player)||!Array.isArray(scene.sparks)||scene.sparks.length!==12||!scene.sparks.every(point)||!allowed(scene.candy,['placed','x','y'])||!bool(scene.candy.placed)||!point({x:scene.candy.x,y:scene.candy.y}))return false;
 const q=scene.round,timing=getTiming(stage.timingId),duration=timing.durationMs;
 const keys=['timingId','surferMs','scoreComponents','bass','mystery','shieldsRemaining','remainingMs','score','chain','multiplier','bestMultiplier','pickups','closePasses','slowedMs','flowMs','flowTaken','sincePickupMs','ended','runId','bassUses','stamina'];
 if(q?.stamina!==undefined&&!number(q.stamina,0,100))return false;
 if(!allowed(q,keys)||q.timingId!==stage.timingId||q.runId!==runId&&q.runId!==null||!number(q.remainingMs,0,duration)||!bool(q.ended)||q.ended!==(q.remainingMs===0))return false;
 if(!['score','chain','pickups','closePasses','shieldsRemaining'].every(key=>integer(q[key]))||!integer(q.multiplier,1,5)||!integer(q.bestMultiplier,q.multiplier,5)||!number(q.surferMs,0,1200)||!number(q.slowedMs,0,600)||!number(q.flowMs,0,10000)||!(q.sincePickupMs===null||number(q.sincePickupMs))||q.bassUses!==undefined&&!integer(q.bassUses))return false;
 if(!Array.isArray(q.flowTaken)||q.flowTaken.length>3||new Set(q.flowTaken).size!==q.flowTaken.length||!q.flowTaken.every(v=>integer(v,0,2)))return false;
 const c=q.scoreComponents;if(!allowed(c,['sparks','passes'])||!Array.isArray(c.sparks)||c.sparks.length!==20||!c.sparks.every(v=>integer(v))||!Array.isArray(c.passes)||c.passes.length!==2||!c.passes.every(v=>integer(v)))return false;
 const b=q.bass;if(!allowed(b,['chargeMs','exposureMs','activeMs','activeDurationMs'])||!number(b.chargeMs,0,10000)||!number(b.exposureMs,0,6000)||!number(b.activeMs,0,6000)||!number(b.activeDurationMs,0,6000)||b.activeMs>b.activeDurationMs)return false;
 const m=q.mystery;if(!allowed(m,['phase','spawnAtMs','elapsedMs','effect','effectMs','wrapper','effectStartedAtMs'])||!['waiting','absent','available','spent'].includes(m.phase)||!integer(m.spawnAtMs,12000,39999)||!number(m.elapsedMs,0,1e9)||!['speed','dizzy','waves',null].includes(m.effect)||!number(m.effectMs,0,7000)||!allowed(m.wrapper,['colour','pattern'])||!integer(m.wrapper.colour,0,3)||!integer(m.wrapper.pattern,0,2)||m.effectStartedAtMs!==undefined&&!number(m.effectStartedAtMs,0,m.elapsedMs))return false;
 const encounterKeys=['active','spoiled','travel','cooldownUntil','previousPlayer','previousDancer','touching','nearest','protected','friendPasses'];
 return Array.isArray(scene.crowd)&&scene.crowd.length===stage.crowdAnchors.length&&scene.crowd.every(e=>allowed(e,encounterKeys)&&bool(e.active)&&bool(e.spoiled)&&number(e.travel)&&number(e.cooldownUntil)&&[e.previousPlayer,e.previousDancer].every(p=>p===null||point(p))&&(e.previousPlayer===null)===(e.previousDancer===null)&&['touching','protected'].every(key=>e[key]===undefined||bool(e[key]))&&(e.nearest===undefined?!e.active:number(e.nearest))&&(!Object.hasOwn(e,'friendPasses')||integer(e.friendPasses,0,4)))&&scene.crowd.reduce((sum,e)=>sum+(Object.hasOwn(e,'friendPasses')?e.friendPasses:0),0)<=q.closePasses;
}

function summaryOK(s,active,discoveries){
 if(s===null)return true;
 return allowed(s,['stageId','qualified','score','xp','bonusId','bonusOffered','target','pickups','totalScore'])&&s.stageId===mainStageId(active)&&bool(s.qualified)&&['score','xp','target','pickups','totalScore'].every(key=>integer(s[key]))&&s.target===stageForRun(active).target&&s.qualified===(active.mode==='rush'||s.pickups>=s.target)&&s.totalScore===active.score&&bool(s.bonusOffered)&&(!s.bonusOffered||s.bonusId!==null)&&(s.bonusId===null||s.qualified&&discoveries.includes(s.bonusId)&&BONUSES.some(b=>b.id===s.bonusId&&b.parentId===s.stageId));
}
function bonusOK(b,active,discoveries){
 if(b===null)return true;
 const config=BONUSES.find(item=>item.id===b?.id);
 if(!config||!discoveries.includes(b.id)||!allowed(b,['id','visitId','status','scene','activity','returnTo','completed','won','rewardId','newReward'])||!id(b.visitId)||!['playing','result'].includes(b.status))return false;
 if(active.status==='explore'?b.returnTo!=='title':b.returnTo!==active.status||!['summary','results'].includes(active.status)||config.parentId!==mainStageId(active))return false;
 if(active.status!=='explore'&&(!active.summary?.qualified||active.summary.bonusId!==b.id||!active.summary.bonusOffered))return false;
 if(active.status==='results'&&(b.id!=='villagio'||active.mode!=='festival'||active.cleared!==6))return false;
 if(b.status==='result'&&(!bool(b.completed)||!bool(b.won)||!bool(b.newReward)||!(b.rewardId===null||b.rewardId===config.reward.id)))return false;
 const content=bonusConfig(b.id);
 if((b.activity===null)!==(b.scene===null))return false;
 if(b.activity!==null&&(!object(b.activity)||!boundedJSON(b.activity)||!bonusController(content).restore(b.activity)))return false;
 return b.scene===null||sceneOK(b.scene,content.stage,b.visitId);
}
function submissionOK(sub,run){
 if(sub===null)return true;
 if(!allowed(sub,['runId','status','code','ticket','expiresAt','payload'])||sub.runId!==run.id||!['waiting','ready','pending','succeeded','ineligible','error'].includes(sub.status)||!(sub.ticket===null||typeof sub.ticket==='string'&&/^[a-f0-9]{64}$/.test(sub.ticket))||!(sub.expiresAt===null||number(sub.expiresAt,0,Number.MAX_SAFE_INTEGER))||!(sub.code===null||typeof sub.code==='string'&&sub.code.length<=100))return false;
 if(sub.payload!==null){const p=sub.payload;if(!object(p)||p.runId!==run.id||p.ticket!==sub.ticket||p.mode!==run.mode||resolveSmfScoringVersion(p.scoringVersion)!==run.scoringVersion||p.buildId!==run.buildId||p.totalScore!==run.score||p.stagesCleared!==run.cleared||JSON.stringify(p.stages)!==JSON.stringify(run.scoreStages))return false;if(run.mode==='rush'?resolveRushStageId(p.rushStageId)!==run.rushStageId:Object.hasOwn(p,'rushStageId'))return false;}
 return !['pending','succeeded'].includes(sub.status)||sub.payload!==null;
}
function activeOK(active,discoveries){
 if(active.mode==='rush'?!isRushStageId(active.rushStageId):Object.hasOwn(active,'rushStageId'))return false;
 if(!allowed(active,['id','stageIndex','status','score','cleared','perks','bassChargeMs','pendingInvitation','summary','bonus','scene','mode','scoringVersion','rushStageId','themeId','scoreStages','scoreOverflow','initialsDraft','inputType','submission','buildId','scoreSaved','needsIntro','remixPending'])||!boundedJSON(active)||!id(active.id)||!integer(active.stageIndex,0,active.mode==='endless'?1000000:active.mode==='rush'?0:ROUTE.length-1)||!['playing','summary','results','explore'].includes(active.status)||!integer(active.score)||!integer(active.cleared,0,active.mode==='endless'?1000000:ROUTE.length)||!perkList(active.perks)||!number(active.bassChargeMs,0,10000)||!bool(active.pendingInvitation)||!summaryOK(active.summary,active,discoveries)||!bonusOK(active.bonus,active,discoveries))return false;
 if(!resolveSmfScoringVersion(active.scoringVersion)||!['rush','festival','endless'].includes(active.mode)||!THEMES.some(t=>t.id===active.themeId)||!Array.isArray(active.scoreStages)||active.scoreStages.length>MAX_ONLINE_STAGES||!['unknown','mouse','touch','keyboard','mixed'].includes(active.inputType)||!/^\w{0,3}$/.test(active.initialsDraft)||!id(active.buildId)||!bool(active.scoreSaved)||!bool(active.needsIntro)||!bool(active.remixPending)||active.scoreOverflow!==undefined&&!bool(active.scoreOverflow)||!submissionOK(active.submission,active))return false;
 if(active.mode==='rush'&&(active.scoreStages.length>1||active.scoreStages.some(stage=>!object(stage)||stage.stageIndex!==0||stage.stageId!==active.rushStageId||stage.activeMs!==stageForRun(active).durationMs)))return false;
 if(active.status==='explore')return active.bonus!==null&&active.score===0&&active.cleared===0&&active.perks.length===0&&active.scene===null&&active.summary===null;
 if(active.cleared>active.stageIndex+1)return false;
 if(active.status==='playing'&&(active.cleared!==active.stageIndex||active.summary!==null||active.bonus!==null))return false;
 if(active.status==='summary'&&(active.mode==='rush'||active.mode==='festival'&&active.stageIndex===ROUTE.length-1||active.cleared!==active.stageIndex+1||active.summary?.qualified!==true))return false;
 return active.scene===null||active.status==='playing'&&sceneOK(active.scene,stageForRun(active),active.id);
}
function resultOK(value){return allowed(value,['id','mode','scoringVersion','rushStageId','score','cleared','completed'])&&resolveSmfScoringVersion(value.scoringVersion)!==null&&id(value.id)&&integer(value.score)&&integer(value.cleared,0,1000000)&&bool(value.completed)&&(!value.completed||value.cleared===6)&&(value.mode==='rush'?resolveRushStageId(value.rushStageId)!==null:!Object.hasOwn(value,'rushStageId'));}

function upgradeBonusCrowd(active){
 const b=active.bonus;
 if(!['secret-garden','ikigai-mori'].includes(b?.id)||b.activity?.version!==1||b.scene?.crowd?.length!==6)return active;
 const count=bonusConfig(b.id).stage.crowdAnchors.length;
 return {...active,bonus:{...b,scene:{...b.scene,crowd:[...b.scene.crowd,...Array.from({length:count-6},()=>createEncounter())]}}};
}

export function normalizeTourProfile(raw){
 const profile=createTourProfile();
 if(!object(raw)||raw.version!==1)return profile;
 const known=BONUSES.map(b=>b.id);
 profile.discoveries=unique(raw.discoveries,known);
 profile.rewards=unique(raw.rewards,BONUSES.filter(b=>profile.discoveries.includes(b.id)).map(b=>b.reward.id));
 profile.souvenir=profile.rewards.includes(raw.souvenir)?raw.souvenir:null;
 const source=object(raw.progress)?raw.progress:{};
 profile.progress.xp=count(source.xp);profile.progress.legacyWardrobe=source.legacyWardrobe===true;
 for(const key of Object.keys(profile.progress.totals))profile.progress.totals[key]=count(source.totals?.[key]);
 // SMF does not inherit the generic edition's layout achievements.
 profile.progress.endless.smfVenues=unique(source.endless?.smfVenues,ROUTE);profile.progress.endless.bestCleared=count(source.endless?.bestCleared);profile.progress.endless.remixed=source.endless?.remixed===true;
 profile.progress.receipts=Array.isArray(source.receipts)?[...new Set(source.receipts.filter(value=>typeof value==='string'&&value.length>0&&value.length<150))].slice(-256):[];
 for(const key of Object.keys(profile.outfit)){if(WARDROBE[key]?.some(item=>item.id===raw.outfit?.[key]))profile.outfit[key]=raw.outfit[key];}
 profile.themePreference=normalizeThemePreference(raw.themePreference);
 if(object(raw.audio)){profile.audio.enabled=raw.audio.enabled!==false;for(const key of ['music','effects'])if(number(raw.audio[key],0,1))profile.audio[key]=raw.audio[key];}
 profile.initials=typeof raw.initials==='string'&&/^[A-Z0-9]{0,3}$/.test(raw.initials)?raw.initials:'';profile.playtestConsent=raw.playtestConsent===true||raw.playtestConsent==='accepted'?'accepted':raw.playtestConsent==='declined'?'declined':'unknown';
 let latestSavedRushStage=null;
 for(const mode of ['rush','festival','endless'])if(Array.isArray(raw.boards?.[mode])){
  const rows=raw.boards[mode].filter(row=>object(row)&&resolveSmfScoringVersion(row.scoringVersion)!==null&&id(row.id)&&/^[A-Z0-9]{3}$/.test(row.initials)&&integer(row.score)&&integer(row.cleared??row.stagesCleared,0,1000000)&&boundedJSON(row)&&(mode==='rush'||!Object.hasOwn(row,'rushStageId')));
  if(mode==='rush')latestSavedRushStage=lastRushStageId({boards:{rush:rows}});
  profile.boards[mode]=(mode==='rush'?limitRushBoard(rows):limitSeasonBoard(rows,mode)).map(row=>structuredClone(row));
 }
 try{if(raw.active!==null&&object(raw.active)){const defaults={mode:'festival',scoringVersion:ORIGINAL_SMF_SCORING_VERSION,themeId:'forest-freakout',scoreStages:[],initialsDraft:'',inputType:'unknown',submission:null,buildId:'dev',scoreSaved:false,needsIntro:false,remixPending:false};const active=upgradeBonusCrowd({...defaults,...raw.active});if(active.mode==='rush')active.rushStageId=resolveRushStageId(active.rushStageId);if(activeOK(active,profile.discoveries))profile.active=structuredClone(active);}}catch{}
 if(resultOK(raw.lastResult)){profile.lastResult={...structuredClone(raw.lastResult),scoringVersion:resolveSmfScoringVersion(raw.lastResult.scoringVersion)};if(profile.lastResult.mode==='rush')profile.lastResult.rushStageId=resolveRushStageId(profile.lastResult.rushStageId);}
 profile.rushRotation=normalizeRushRotation(raw.rushRotation,lastRushStageId({active:profile.active,lastResult:profile.lastResult})||latestSavedRushStage);
 return profile;
}

export function createTourStore(storage,{key='sidequest.smf.profile.v1'}={}){
 return {
  read(){try{const text=storage?.getItem(key);return typeof text==='string'&&text.length<=LIMIT?normalizeTourProfile(JSON.parse(text)):createTourProfile();}catch{return createTourProfile();}},
  write(profile){
   try{
    if(!storage||profile?.version!==1||!boundedJSON(profile))return false;
    const next=normalizeTourProfile(profile);
    if(profile.active!=null&&next.active===null||profile.lastResult!=null&&next.lastResult===null)return false;
    // Discovery, permanent ownership and the parked run share one atomic item.
    storage.setItem(key,JSON.stringify(next));return true;
   }catch{return false;}
  },
 };
}
