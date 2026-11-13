import {normalizeProgress,awardStage,availablePerks} from '../progression.js';
import {normalizeOutfit} from '../wardrobe.js';
import {smfPreviewStage} from '../editions/smf-stages.js';
import {smfRuleStage} from '../../supabase/functions/_shared/smf-rules.js';
import {isOpen} from '../geometry.js';
import {resolveTheme,THEME_DEFAULT} from '../themes.js';
import {MAX_ONLINE_STAGES} from '../../supabase/functions/_shared/score.js';
import {drawRushStage,normalizeRushRotation,lastRushStageId,resolveRushStageId,limitRushBoard} from './rush-rotation.js';

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
const parentBonus=run=>run.mode==='rush'?null:BONUSES.find(bonus=>bonus.parentId===mainStageId(run));
export const mainStageId=run=>smfRuleStage(run.mode||'festival',run.stageIndex,run.rushStageId).id;
export function stageForRun(run){
 const rule=smfRuleStage(run.mode||'festival',run.stageIndex,run.rushStageId),base=smfPreviewStage(rule.id),anchors=base.crowdAnchors.map(p=>[...p]);
 for(const spacing of [70,55,40])for(let y=base.playBounds.minY+30;y<=590&&anchors.length<rule.crowdCount;y+=25)for(let x=130;x<=830&&anchors.length<rule.crowdCount;x+=25){
  if(isOpen({x,y},75,base.obstacles)&&Math.hypot(x-base.spawn.x,y-base.spawn.y)>110&&anchors.every(([ax,ay])=>Math.hypot(x-ax,y-ay)>spacing))anchors.push([x,y]);
 }
 return {...base,...rule,crowdAnchors:anchors};
}
const freshRun=(id,mode='festival',themeId=THEME_DEFAULT)=>({id,mode,themeId,stageIndex:0,status:'playing',score:0,cleared:0,perks:[],bassChargeMs:0,pendingInvitation:false,summary:null,bonus:null,scene:null,scoreStages:[],initialsDraft:'',inputType:'unknown',submission:null,buildId:'dev',scoreSaved:false,needsIntro:true,remixPending:false});

export function createTourProfile(){
 const progress=normalizeProgress();progress.endless.smfVenues=[];
 return {version:1,progress,discoveries:[],rewards:[],outfit:normalizeOutfit(),souvenir:null,active:null,lastResult:null,rushRotation:{remaining:[],lastStageId:null},audio:{enabled:true,music:.45,effects:.65},themePreference:THEME_DEFAULT,boards:{rush:[],festival:[],endless:[]},initials:'',playtestConsent:'unknown'};
}

/** Model transitions return a new profile; invalid or repeated actions are no-ops. */
export function createTourRun(profile,mode,id,themeId=THEME_DEFAULT,rng=Math.random){
 if(!profile||profile.active||!validId(id)||!['rush','festival','endless'].includes(mode))return profile;
 const next=structuredClone(profile);next.active=freshRun(id,mode,resolveTheme(themeId));
 if(mode==='rush'){const draw=drawRushStage(normalizeRushRotation(profile.rushRotation,lastRushStageId(profile)),rng);next.active.rushStageId=draw.rushStageId;next.rushRotation=draw.rotation;}
 return next;
}
export function createFestival(profile,id){return createTourRun(profile,'festival',id);}

export function collectInvitation(profile){
 const run=profile?.active;
 if(!run||run.status!=='playing'||run.bonus||run.pendingInvitation)return profile;
 const bonus=parentBonus(run);
 if(!bonus||profile.discoveries.includes(bonus.id))return profile;
 const next=structuredClone(profile);next.active.pendingInvitation=true;return next;
}

export function finishMain(profile,round){
 const run=profile?.active;
 if(!run||run.status!=='playing'||run.bonus||!mainStageId(run)
  ||!round||round.ended!==true||round.remainingMs!==0||!count(round.score)||!count(round.pickups)
  ||!Number.isSafeInteger(run.score+round.score))return profile;
 const stage=stageForRun(run);
 if(round.runId!=null&&round.runId!==run.id||round.timingId!==stage.timingId)return profile;
 const next=structuredClone(profile),active=next.active;
 const qualified=run.mode==='rush'||round.pickups>=stage.target,festivalComplete=run.mode==='festival'&&qualified&&run.stageIndex===ROUTE.length-1;
 const bonus=parentBonus(active);
 if(qualified&&active.pendingInvitation&&bonus&&!next.discoveries.includes(bonus.id))next.discoveries.push(bonus.id);
 active.score+=round.score;active.cleared+=qualified?1:0;
 if(active.scoreStages.length<MAX_ONLINE_STAGES)active.scoreStages.push({stageIndex:active.stageIndex,stageId:stage.id,activeMs:stage.durationMs,pickups:round.pickups,closePasses:round.closePasses||0,score:round.score,perks:[...active.perks],sparks:[...(round.scoreComponents?.sparks||[])],passes:[...(round.scoreComponents?.passes||[])]});else active.scoreOverflow=true;
 const award=awardStage(next.progress,{
  id:active.stageIndex<ROUTE.length?`${active.id}:main:${stage.id}`:`${active.id}:main:${active.stageIndex}:${stage.id}`,pickups:round.pickups,passes:round.closePasses,
  flows:Array.isArray(round.flowTaken)?round.flowTaken.length:0,bass:round.bassUses,
  qualified,festivalComplete,mode:active.mode,stagesCleared:active.cleared,remixed:active.remixPending,
 });
 next.progress=award.progress;
 if(active.mode==='endless'&&qualified){next.progress.endless.smfVenues=[...new Set([...(next.progress.endless.smfVenues||[]),stage.id])];}
 active.remixPending=false;
 const bonusId=qualified&&bonus&&next.discoveries.includes(bonus.id)?bonus.id:null;
 active.summary={stageId:stage.id,qualified,score:round.score,xp:award.xp,bonusId,bonusOffered:!!bonusId,target:stage.target,pickups:round.pickups,totalScore:active.score};
 active.status=!qualified||festivalComplete||active.mode==='rush'?'results':'summary';
 active.bassChargeMs=Number.isFinite(round.bass?.chargeMs)?Math.max(0,Math.min(10000,round.bass.chargeMs)):0;
 active.pendingInvitation=false;active.scene=null;
 return next;
}

export function choosePerk(profile,perkId,replaceId){
 const run=profile?.active;
 if(!run||run.status!=='summary'||run.bonus||!run.summary?.qualified||run.mode==='rush'||run.mode==='festival'&&run.stageIndex>=ROUTE.length-1)return profile;
 if(perkId!==null){
  if(!availablePerks(profile.progress).includes(perkId)||run.perks.includes(perkId))return profile;
  if(run.perks.length>=4?!run.perks.includes(replaceId):replaceId!=null)return profile;
 }else if(replaceId!=null)return profile;
 const next=structuredClone(profile),active=next.active;
 if(perkId!==null){
  if(active.perks.length===4){active.perks[active.perks.indexOf(replaceId)]=perkId;active.remixPending=active.mode==='endless';}
  else active.perks.push(perkId);
 }
 active.stageIndex++;active.needsIntro=true;active.status='playing';active.summary=null;active.pendingInvitation=false;active.scene=null;
 return next;
}

export function beginBonus(profile,bonusId,visitId,{explore=false}={}){
 const bonus=bonusFor(bonusId),run=profile?.active;
 if(!profile||!bonus||!validId(visitId)||!profile.discoveries.includes(bonusId))return profile;
 if(explore){if(run)return profile;}
 else if(!run||run.bonus||!['summary','results'].includes(run.status)
  ||!run.summary?.qualified||!run.summary.bonusOffered||run.summary.bonusId!==bonusId
  ||mainStageId(run)!==bonus.parentId)return profile;
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
 next.lastResult={id:run.id,mode:run.mode,score:run.score,cleared:run.cleared,completed:run.mode==='festival'&&run.cleared===ROUTE.length};
 if(run.mode==='rush')next.lastResult.rushStageId=resolveRushStageId(run.rushStageId);
 next.active=null;return next;
}

export function saveTourScore(profile,initials){
 const run=profile?.active;if(!run||run.status!=='results'||run.bonus||run.scoreSaved)return profile;
 const name=typeof initials==='string'?initials.trim().toUpperCase():'';if(!/^[A-Z0-9]{3}$/.test(name))return profile;
 const next=structuredClone(profile),a=next.active;next.initials=name;a.initialsDraft=name;a.scoreSaved=true;
 const row={id:a.id,mode:a.mode,initials:name,score:a.score,cleared:a.cleared,stagesCleared:a.cleared,inputType:a.inputType,outfit:structuredClone(next.outfit),completedAt:Date.now()};
 if(a.mode==='rush')row.rushStageId=resolveRushStageId(a.rushStageId);
 const board=next.boards[a.mode].filter(item=>item.id!==a.id);board.push(row);board.sort((x,y)=>a.mode==='endless'?(y.cleared-x.cleared||y.score-x.score):(y.score-x.score||y.cleared-x.cleared));next.boards[a.mode]=a.mode==='rush'?limitRushBoard(board):board.slice(0,20);return next;
}
