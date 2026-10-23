import test from 'node:test';import assert from 'node:assert/strict';
import {validateScore} from '../supabase/functions/_shared/score.js';
export const fixture=()=>({runId:'00000000-0000-4000-8000-000000000001',ticket:'a'.repeat(64),initials:'ABC',mode:'rush',scoringVersion:'arcade-v1',buildId:'test',inputType:'mixed',totalScore:10,stagesCleared:1,stages:[{stageIndex:0,activeMs:60000,pickups:1,closePasses:0,score:10,perks:[],sparks:[1,...Array(19).fill(0)],passes:[0,0]}]});
test('valid Rush accepts pauses and rejects tampering, unknown fields and early submission',()=>{
 const p=fixture();assert.equal(validateScore(p).ok,true);
 assert.equal(validateScore(p,{mode:'rush',scoringVersion:'arcade-v1',runId:p.runId,elapsedMs:7200000}).ok,true);
 for(const change of [{initials:'<b>'},{totalScore:11},{inputType:'bot'},{installationId:'tracking'},{scoringVersion:'future'}])assert.equal(validateScore({...p,...change}).ok,false);
 assert.equal(validateScore(p,{mode:'rush',scoringVersion:'arcade-v1',runId:p.runId,elapsedMs:1000}).ok,false);
 p.stages[0].sparks[0]=-1;assert.equal(validateScore(p).ok,false);
});
test('Festival requires qualified prior stages and distinct earned perks',()=>{
 const p=fixture();p.mode='festival';p.stagesCleared=0;assert.equal(validateScore(p).ok,true);
 p.stages.push({...p.stages[0],stageIndex:1,perks:['boots']});p.totalScore=20;assert.equal(validateScore(p).ok,false);
});

test('award counters reconcile real spark/drop/bass and boots points, including full Festival',async()=>{
 const {createRound,collect}=await import('../src/game.js');const {awardClosePass}=await import('../src/festival.js');
 const {createRun,startStage,finishStage,chooseUpgrade}=await import('../src/run.js');
 const run=createRun('festival',fixture().runId);
 for(let i=0;i<3;i++){
  const config=startStage(run),round=createRound(config.rules);round.remainingMs=44000;round.bass.activeMs=6000;
  for(let n=0;n<[20,25,30][i];n++)collect(round,{playerInBass:true,sparkInBass:true});awardClosePass(round);
  round.remainingMs=0;round.ended=true;finishStage(run,round);if(i<2)chooseUpgrade(run,['boots','bracelet'][i]);
 }
 const p={...fixture(),mode:'festival',totalScore:run.totalScore,stagesCleared:3,stages:run.scoreStages};assert.equal(validateScore(p).ok,true);
 p.stages[2].perks=['boots','boots'];assert.equal(validateScore(p).ok,false);
});
