import {createRunId} from './run-id.js';
import {genericContext} from './editions/storage-context.js';
// DEV-only, imported conditionally by main. Never accesses the real profile keys.
import {createRun,startStage,finishStage,chooseUpgrade,keepPerks,stageFor,PERKS,finishRun} from './run.js';
import {createRound,collect} from './game.js';
import {createMystery} from './mystery.js';
import {createEncounter} from './festival.js';
import {makeRecovery} from './recovery.js';
export function practiceStorage(local,context=genericContext){return {getItem:k=>local?.getItem(context.labPrefix+k),setItem(k,v){if(!local)throw Error('storage unavailable');local.setItem(context.labPrefix+k,v)}};}
export function resetPractice(local,context=genericContext){for(const k of [context.profileKey,'sidequest.best','sidequest.sound'])local?.removeItem(context.labPrefix+k);}
export function recoveryPreview(preset,themeId){
 if(!['live','bass','swap','results'].includes(preset))return null;
 const run=createRun('endless',createRunId(),themeId);run.buildId='recovery-practice';run.displayName='Practice Raver';run.availablePerks=Object.keys(PERKS);
 const clears=preset==='swap'?5:2;
 let summary;
 for(let i=0;i<clears;i++){const config=startStage(run),round=createRound(config.rules);while(round.pickups<config.stage.target)collect(round);round.remainingMs=0;round.ended=true;summary=finishStage(run,round);if(i<clears-1){if(i<4)chooseUpgrade(run,['boots','moth','noodle','bracelet'][i]);else keepPerks(run);}}
 if(preset==='results'){finishRun(run);return makeRecovery({run,screen:{name:'results'},summary,resultSnapshot:{id:run.id,score:run.totalScore,stagesCleared:run.stagesCleared,inputType:'keyboard',outfit:{onesie:'lime',hat:'bucket',totem:'star',flair:'none'},completedAt:Date.now()},inputType:'keyboard'});}
 if(preset==='swap'){run.pendingPerk='surfer';return makeRecovery({run,screen:{name:'upgrade'},summary,inputType:'keyboard'});}
 keepPerks(run);const config=startStage(run),round=createRound(config.rules);round.runId=run.id;round.remainingMs=preset==='bass'?40000:44000;round.mystery.elapsedMs=60000-round.remainingMs;round.mystery.phase='spent';
 if(preset==='bass'){round.mystery=createMystery(()=>0,{rules:config.rules,durationMs:60000});round.mystery.elapsedMs=20000;round.mystery.phase='spent';round.mystery.schedule.consumed=[0];round.mystery.schedule.cooldownUntilMs=32000;round.bass={chargeMs:0,exposureMs:6000,activeMs:3000,activeDurationMs:3000};round.mystery.effect='dizzy';round.mystery.effectMs=4000;round.mystery.effectStartedAtMs=19000;}
 collect(round);const stage=stageFor(run),p=stage.spawn;
 return makeRecovery({run,screen:{name:'playing'},scene:{round,player:{...p},sparks:Array.from({length:12},(_,i)=>({x:160+(i%6)*120,y:250+Math.floor(i/6)*240})),candy:{placed:false,x:0,y:0},crowd:stage.crowdAnchors.map(()=>createEncounter())},summary,inputType:'keyboard'});
}
