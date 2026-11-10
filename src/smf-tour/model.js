import {normalizeProgress,awardStage,availablePerks} from '../progression.js';
import {normalizeOutfit} from '../wardrobe.js';
import {smfPreviewStage} from '../editions/smf-stages.js';

export const ROUTE=Object.freeze([
 'smf-living-room','smf-fractal','smf-grove','smf-amp','smf-pagoda','smf-village',
]);

export const BONUSES=Object.freeze([
 {id:'rabbit-hole',parentId:'smf-living-room',name:'Rabbit Hole',reward:{id:'rabbit-ears',name:'Rabbit Ears'},kind:'visit'},
 {id:'secret-garden',parentId:'smf-grove',name:'Secret Garden',reward:{id:'glow-blossom',name:'Glow Blossom'},kind:'visit'},
 {id:'amp-backstage',parentId:'smf-amp',name:'AMP backstage',reward:{id:'cheese-totem',name:'Cheese Totem'},kind:'challenge'},
 {id:'ikigai-mori',parentId:'smf-pagoda',name:'Ikigai Mori',reward:{id:'lantern-totem',name:'Lantern Totem'},kind:'visit'},
 {id:'villagio',parentId:'smf-village',name:'Villagio',reward:{id:'golden-chicken',name:'Golden Chicken Totem'},kind:'challenge'},
].map(bonus=>Object.freeze({...bonus,stageId:`smf-${bonus.id}`,reward:Object.freeze(bonus.reward)})));

const validId=id=>typeof id==='string'&&id.trim().length>0&&id.length<=100;
const count=value=>Number.isSafeInteger(value)&&value>=0;
const bonusFor=id=>BONUSES.find(bonus=>bonus.id===id);
const parentBonus=run=>BONUSES.find(bonus=>bonus.parentId===ROUTE[run.stageIndex]);
const freshRun=id=>({id,stageIndex:0,status:'playing',score:0,cleared:0,perks:[],bassChargeMs:0,pendingInvitation:false,summary:null,bonus:null,scene:null});

export function createTourProfile(){
 return {version:1,progress:normalizeProgress(),discoveries:[],rewards:[],outfit:normalizeOutfit(),souvenir:null,active:null,lastResult:null};
}

/** Model transitions return a new profile; invalid or repeated actions are no-ops. */
export function createFestival(profile,id){
 if(!profile||profile.active||!validId(id))return profile;
 const next=structuredClone(profile);next.active=freshRun(id);return next;
}

export function collectInvitation(profile){
 const run=profile?.active;
 if(!run||run.status!=='playing'||run.bonus||run.pendingInvitation)return profile;
 const bonus=parentBonus(run);
 if(!bonus||profile.discoveries.includes(bonus.id))return profile;
 const next=structuredClone(profile);next.active.pendingInvitation=true;return next;
}

export function finishMain(profile,round){
 const run=profile?.active;
 if(!run||run.status!=='playing'||run.bonus||!ROUTE[run.stageIndex]
  ||!round||round.ended!==true||round.remainingMs!==0||!count(round.score)||!count(round.pickups)
  ||!Number.isSafeInteger(run.score+round.score))return profile;
 const stage=smfPreviewStage(ROUTE[run.stageIndex]);
 if(round.runId!=null&&round.runId!==run.id||round.timingId!==stage.timingId)return profile;
 const next=structuredClone(profile),active=next.active;
 const qualified=round.pickups>=stage.target,festivalComplete=qualified&&run.stageIndex===ROUTE.length-1;
 const bonus=parentBonus(active);
 if(qualified&&active.pendingInvitation&&bonus&&!next.discoveries.includes(bonus.id))next.discoveries.push(bonus.id);
 active.score+=round.score;active.cleared+=qualified?1:0;
 const award=awardStage(next.progress,{
  id:`${active.id}:main:${stage.id}`,pickups:round.pickups,passes:round.closePasses,
  flows:Array.isArray(round.flowTaken)?round.flowTaken.length:0,bass:round.bassUses,
  qualified,festivalComplete,mode:'festival',stagesCleared:active.cleared,
 });
 next.progress=award.progress;
 const bonusId=qualified&&bonus&&next.discoveries.includes(bonus.id)?bonus.id:null;
 active.summary={stageId:stage.id,qualified,score:round.score,xp:award.xp,bonusId,bonusOffered:!!bonusId,target:stage.target,pickups:round.pickups,totalScore:active.score};
 active.status=!qualified||festivalComplete?'results':'summary';
 active.bassChargeMs=Number.isFinite(round.bass?.chargeMs)?Math.max(0,Math.min(10000,round.bass.chargeMs)):0;
 active.pendingInvitation=false;active.scene=null;
 return next;
}

export function choosePerk(profile,perkId,replaceId){
 const run=profile?.active;
 if(!run||run.status!=='summary'||run.bonus||!run.summary?.qualified||run.stageIndex>=ROUTE.length-1)return profile;
 if(perkId!==null){
  if(!availablePerks(profile.progress).includes(perkId)||run.perks.includes(perkId))return profile;
  if(run.perks.length>=4?!run.perks.includes(replaceId):replaceId!=null)return profile;
 }else if(replaceId!=null)return profile;
 const next=structuredClone(profile),active=next.active;
 if(perkId!==null){
  if(active.perks.length===4)active.perks[active.perks.indexOf(replaceId)]=perkId;
  else active.perks.push(perkId);
 }
 active.stageIndex++;active.status='playing';active.summary=null;active.pendingInvitation=false;active.scene=null;
 return next;
}

export function beginBonus(profile,bonusId,visitId,{explore=false}={}){
 const bonus=bonusFor(bonusId),run=profile?.active;
 if(!profile||!bonus||!validId(visitId)||!profile.discoveries.includes(bonusId))return profile;
 if(explore){if(run)return profile;}
 else if(!run||run.bonus||!['summary','results'].includes(run.status)
  ||!run.summary?.qualified||!run.summary.bonusOffered||run.summary.bonusId!==bonusId
  ||ROUTE[run.stageIndex]!==bonus.parentId)return profile;
 const next=structuredClone(profile);
 if(explore)next.active={...freshRun(visitId),status:'explore'};
 next.active.bonus={id:bonusId,visitId,status:'playing',scene:null,activity:null,returnTo:explore?'title':run.status};
 return next;
}

/** Completion receipts live in the same profile update as the parked visit. */
export function finishBonus(profile,{completed=false,won=false}={}){
 const visit=profile?.active?.bonus,bonus=bonusFor(visit?.id);
 if(!visit||visit.status!=='playing'||!bonus)return profile;
 const next=structuredClone(profile),result=next.active.bonus;
 result.status='result';result.completed=completed===true;result.won=won===true;
 const earned=result.won||bonus.kind==='visit'&&result.completed;
 result.rewardId=earned?bonus.reward.id:null;
 result.newReward=earned&&!next.rewards.includes(bonus.reward.id);
 if(result.newReward){next.rewards.push(bonus.reward.id);next.souvenir=bonus.reward.id;}
 return next;
}

export function returnBonus(profile){
 const visit=profile?.active?.bonus;
 if(!visit)return profile;
 const next=structuredClone(profile);
 if(visit.returnTo==='title')next.active=null;
 else {
  next.active.status=visit.returnTo;next.active.bonus=null;
  if(next.active.summary)next.active.summary.bonusOffered=false;
 }
 return next;
}

export function endFestival(profile){
 const run=profile?.active;
 if(!run||run.bonus||!['playing','summary'].includes(run.status))return profile;
 const next=structuredClone(profile),active=next.active;
 active.status='results';active.scene=null;active.pendingInvitation=false;
 if(active.summary)active.summary.bonusOffered=false;
 return next;
}

export function closeResults(profile){
 const run=profile?.active;
 if(!run||run.status!=='results'||run.bonus)return profile;
 const next=structuredClone(profile);
 next.lastResult={id:run.id,score:run.score,cleared:run.cleared,completed:run.cleared===ROUTE.length};
 next.active=null;return next;
}
