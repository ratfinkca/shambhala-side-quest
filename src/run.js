import {STAGES} from './stages.js';
export const PERKS={
 boots:{name:'Disco Boots',icon:'✧',description:'Clean passes earn 25 points instead of 15.'},
 noodle:{name:'Pool Noodle',icon:'◡',description:'Ignore the slowdown from your first bump each stage.'},
 moth:{name:'Moth Charm',icon:'✦',description:'Flow State lasts 7 seconds instead of 5.'},
 bracelet:{name:'Friendship Bracelet',icon:'◎',description:'Keep your combo for 3 seconds instead of 2.'},
};
export function rulesFor(perks=[]){return {comboGraceMs:perks.includes('bracelet')?3000:2000,flowDurationMs:perks.includes('moth')?7000:5000,closePassPoints:perks.includes('boots')?25:15,bumpShields:perks.includes('noodle')?1:0};}
export function createRun(mode,id){return {id,mode:mode==='festival'?'festival':'rush',stageIndex:0,totalScore:0,stagesCleared:0,perks:[],status:'ready',submitted:false};}
export function startStage(run){if(run.status!=='ready')return null;run.status='playing';return {stage:STAGES[run.stageIndex],rules:rulesFor(run.perks)};}
export function finishStage(run,round){
 if(run.status!=='playing'||!round.ended||round.remainingMs!==0)return null;
 const qualified=run.mode==='rush'||round.pickups>=STAGES[run.stageIndex].target;
 run.totalScore+=round.score;if(qualified)run.stagesCleared++;
 run.status=run.mode==='festival'&&qualified&&run.stageIndex<2?'upgrade':'ended';
 return {qualified,pickups:round.pickups,target:STAGES[run.stageIndex].target,score:round.score,totalScore:run.totalScore};
}
export function upgradeChoices(run){return Object.keys(PERKS).filter(id=>!run.perks.includes(id)).slice(0,3);}
export function chooseUpgrade(run,id){if(run.status!=='upgrade'||!upgradeChoices(run).includes(id))return false;run.perks.push(id);run.stageIndex++;run.status='ready';return true;}
