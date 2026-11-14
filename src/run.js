import {GENERIC_RULES,GENERIC_SCORING_VERSION} from '../supabase/functions/_shared/edition-rules.js';
import {MAX_ONLINE_STAGES} from '../supabase/functions/_shared/score.js';
import {endlessStage} from './endless.js';
import {THEME_DEFAULT,resolveTheme} from './themes.js';
import {STAGES} from './stages.js';
import {CHALLENGES,normalizeChallenge} from '../supabase/functions/_shared/challenges.js';
import {challengeStage} from './challenge-stage.js';
export const modernSeason=season=>season==='arcade-v3'||season==='smf-v3';
export const PERKS={
 boots:{name:'Disco Boots',icon:'✧',description:'Clean passes earn 25 points instead of 15.'},
 noodle:{name:'Pool Noodle',icon:'◡',description:'Ignore the slowdown from your first bump each stage.'},
 moth:{name:'Moth Charm',icon:'✦',description:'Flow State lasts 7 seconds instead of 5.'},
 bracelet:{name:'Friendship Bracelet',icon:'◎',description:'Keep your combo for 3 seconds instead of 2.'},
 surfer:{name:'Crowd Surfer',icon:'↝',description:'Clean passes give +25% speed for 1.2 seconds. Refreshes without stacking.'},
 battery:{name:'Bass Battery',icon:'ϟ',description:'Charge Bass Head 50% faster while in bass zones.'},
 encore:{name:'Encore',icon:'☀',description:'Your first Flow pickup each stage lasts 3 seconds longer. Combines with Moth Charm.'},
 'candy-magnet':{name:'Candy Magnet',icon:'◇',description:'Guarantee a candy opportunity, with a 50% chance of a second. Effects stay spaced apart.'},
 'flow-finder':{name:'Flow Finder',icon:'✦',description:'Up to three Flow opportunities, spaced eight seconds after your Flow ends.'},
 sweet:{name:'Sweet Tooth',icon:'◇',description:'All candy effects last 7 seconds instead of 5. More magic, more mayhem.'},
};
export function rulesFor(perks=[],scoringVersion=null){return {comboGraceMs:perks.includes('bracelet')?3000:2000,flowDurationMs:perks.includes('moth')?7000:5000,closePassPoints:perks.includes('boots')?25:15,bumpShields:perks.includes('noodle')?1:0,surferDurationMs:perks.includes('surfer')?1200:0,bassChargeRate:perks.includes('battery')?1.5:1,firstFlowBonusMs:perks.includes('encore')?3000:0,candyDurationMs:perks.includes('sweet')?7000:5000,...(modernSeason(scoringVersion)?{pickupSchedulerVersion:1,candyMagnet:perks.includes('candy-magnet'),flowFinder:perks.includes('flow-finder')}:{})};}
export function createRun(mode,id,themeId=THEME_DEFAULT,challenge='been-around'){return {id,scoringVersion:GENERIC_SCORING_VERSION,challenge:normalizeChallenge(challenge),themeId:resolveTheme(themeId),mode:['festival','endless'].includes(mode)?mode:'rush',stageIndex:0,totalScore:0,stagesCleared:0,perks:[],scoreStages:[],bassChargeMs:0,status:'ready',submitted:false};}
const endlessStages=new WeakMap();
export function stageFor(run){
 const key=`${run.stageIndex}:${run.scoringVersion}:${run.challenge}`;
 let cached=endlessStages.get(run);
 if(cached?.key!==key){const modern=modernSeason(run.scoringVersion),base=run.mode==='endless'?endlessStage(run.stageIndex,modern?CHALLENGES[normalizeChallenge(run.challenge)]:undefined):STAGES[run.stageIndex];cached={key,stage:modern&&run.mode!=='endless'?challengeStage(base,run.challenge):base};endlessStages.set(run,cached);}
 return cached.stage;
}
export function startStage(run){if(run.status!=='ready')return null;run.status='playing';return {stage:stageFor(run),rules:rulesFor(run.perks,run.scoringVersion),bassChargeMs:run.bassChargeMs,friendPasses:modernSeason(run.scoringVersion)?CHALLENGES[normalizeChallenge(run.challenge)].friendPasses:4,crowdEnabled:['arcade-v2','arcade-v3'].includes(run.scoringVersion)};}
export function finishStage(run,round){
 if(run.status!=='playing'||!round.ended||round.remainingMs!==0)return null;
 const qualified=run.mode==='rush'||round.pickups>=stageFor(run).target;
 if(run.scoreStages.length<MAX_ONLINE_STAGES)run.scoreStages.push({stageIndex:run.stageIndex,activeMs:GENERIC_RULES.roundMs,pickups:round.pickups,closePasses:round.closePasses,score:round.score,perks:[...run.perks],sparks:[...round.scoreComponents.sparks],passes:[...round.scoreComponents.passes]});
 else run.scoreOverflow=true;
 run.totalScore+=round.score;if(qualified)run.stagesCleared++;
 run.status=qualified&&(run.mode==='endless'||run.mode==='festival'&&run.stageIndex<GENERIC_RULES.mainStageIds.length-1)?'upgrade':'ended';
 run.bassChargeMs=round.bass.chargeMs;
 return {qualified,pickups:round.pickups,target:stageFor(run).target,score:round.score,totalScore:run.totalScore,progressContext:{mode:run.mode,stagesCleared:run.stagesCleared,variationId:stageFor(run).variationId,remixed:qualified&&run.mode==='endless'&&run.remixStageIndex===run.stageIndex}};
}
export function upgradeChoices(run){return run.status==='upgrade'?Object.keys(PERKS).filter(id=>!run.perks.includes(id)&&(modernSeason(run.scoringVersion)||!['candy-magnet','flow-finder'].includes(id))&&(!run.availablePerks||run.availablePerks.includes(id))):[];}
function nextStage(run){run.pendingPerk=null;run.stageIndex++;run.status='ready';}
export function chooseUpgrade(run,id,replaceId=null){
 if(run.status!=='upgrade'||!upgradeChoices(run).includes(id))return false;
 if(run.mode==='endless'&&run.perks.length>=4){
  const slot=run.perks.indexOf(replaceId);if(slot<0)return false;run.perks[slot]=id;run.remixStageIndex=run.stageIndex+1;
 }else{if(replaceId!==null)return false;run.perks.push(id);}
 nextStage(run);return true;
}
export function keepPerks(run){if(run.mode!=='endless'||run.status!=='upgrade')return false;nextStage(run);return true;}

// Totals/history are committed only by finishStage, so a partial round is excluded.
export function finishRun(run){
 if(run.mode!=='endless'||!['playing','ready','upgrade'].includes(run.status)||run.scoreStages.length===0)return false;
 run.status='ended';run.endedVoluntarily=true;run.pendingPerk=null;return true;
}

export function stageLabel(run){const stage=stageFor(run);return run.mode==='rush'?'QUICK RUSH':`${run.stageIndex+1}${run.mode==='endless'?' · LOOP '+stage.loop:'/'+GENERIC_RULES.mainStageIds.length} · ${stage.name.toUpperCase()}${stage.variationId&&stage.variationId!=='original'?' · '+stage.variationName:''}`;}
