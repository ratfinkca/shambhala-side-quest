import test from 'node:test';import assert from 'node:assert/strict';
import {validateScore} from '../supabase/functions/_shared/score.js';
import {fixture,endlessFixture} from './helpers/score-fixtures.mjs';
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
test('multipliers must be earned, including multiple combo chains after resets',()=>{
 const p=fixture();p.stages[0].sparks=Array(20).fill(0);p.stages[0].sparks[16]=1;p.stages[0].score=p.totalScore=50;assert.equal(validateScore(p).ok,false);
 const stage=p.stages[0];stage.sparks=Array(20).fill(0);
 for(const [i,n] of [[0,8],[4,10],[8,10],[12,10],[16,2]])stage.sparks[i]=n;
 stage.pickups=40;stage.score=p.totalScore=8*10+10*20+10*30+10*40+2*50;assert.equal(validateScore(p).ok,true);
 stage.sparks[0]=4;stage.pickups-=4;stage.score=p.totalScore-=40;assert.equal(validateScore(p).ok,false);
});

test('every new perk can appear in a valid scored Festival and unknown perks still fail',async()=>{
 const {createRound,collect}=await import('../src/game.js');
 const {createRun,startStage,finishStage,chooseUpgrade}=await import('../src/run.js');
 for(const chosen of [['surfer','battery'],['encore','sweet']]){
  const run=createRun('festival',fixture().runId);
  for(let i=0;i<3;i++){
   const config=startStage(run),r=createRound(config.rules);
   for(let n=0;n<[20,25,30][i];n++)collect(r);
   r.remainingMs=0;r.ended=true;finishStage(run,r);
   if(i<2)assert.equal(chooseUpgrade(run,chosen[i]),true);
  }
  const p={...fixture(),mode:'festival',totalScore:run.totalScore,stagesCleared:3,stages:run.scoreStages};
  assert.equal(validateScore(p).ok,true);
  p.stages[1].perks=['unknown'];assert.equal(validateScore(p).ok,false);
 }
});

test('Endless submits real scaled stages with four perks, a swap, keeps and a final failed stage',async()=>{
 const p=await endlessFixture();assert.equal(p.stages.length,9);assert.equal(p.stagesCleared,8);
 assert.equal(validateScore(p).ok,true);
 assert.equal(validateScore(p,{mode:'endless',scoringVersion:'arcade-v1',runId:p.runId,elapsedMs:540000}).ok,true);
 assert.equal(validateScore(p,{mode:'endless',scoringVersion:'arcade-v1',runId:p.runId,elapsedMs:534000}).ok,false);
 for(const mutate of [q=>q.stagesCleared++,q=>q.stages[3].perks.push('sweet'),q=>q.stages[5].perks=['sweet','battery','encore','noodle'],q=>q.stages[5].perks.push('boots'),q=>q.stages[5].perks[1]='boots',q=>q.stages[0].perks=['boots'],q=>q.stages[7].stageIndex=8]){
  const q=structuredClone(p);mutate(q);assert.equal(validateScore(q).ok,false);
 }
 const unfinished=structuredClone(p);unfinished.stages.pop();unfinished.stagesCleared=8;
 unfinished.totalScore=unfinished.stages.reduce((n,s)=>n+s.score,0);assert.equal(validateScore(unfinished).ok,true);
 // Stage four requires23, not20. Dropping to20 must prevent later stages.
 const q=structuredClone(p);q.stages[3].pickups=20;q.stages[3].sparks=Array(20).fill(0);q.stages[3].sparks[0]=20;q.stages[3].score=200;q.totalScore=q.stages.reduce((n,s)=>n+s.score,0);
 assert.equal(validateScore(q).ok,false);
});
test('Endless online history is bounded without ending gameplay',async()=>{
 const {createRun,startStage,finishStage,keepPerks}=await import('../src/run.js');const {createRound}=await import('../src/game.js');
 const run=createRun('endless','bounded');
 for(let i=0;i<1442;i++){const config=startStage(run),r=createRound(config.rules);r.pickups=config.stage.target;r.remainingMs=0;r.ended=true;finishStage(run,r);keepPerks(run);}
 assert.equal(run.stageIndex,1442);assert.equal(run.scoreStages.length,1440);assert.equal(run.scoreOverflow,true);
});

test('Endless accepts capped45 targets and rejects oversized and skipped-award histories',async()=>{
 const p=await endlessFixture();const prior=p.stages[7],failed=p.stages.at(-1);p.stages=p.stages.slice(0,-1);
 while(p.stages.length<40){const s=structuredClone(prior);s.stageIndex=p.stages.length;s.pickups=45;s.sparks=Array(20).fill(0);s.sparks[0]=45;s.score=450;p.stages.push(s);}
 failed.stageIndex=40;p.stages.push(failed);p.stagesCleared=40;p.totalScore=p.stages.reduce((n,s)=>n+s.score,0);
 assert.equal(validateScore(p).ok,true);
 const low=structuredClone(p);low.stages[39].pickups=44;low.stages[39].sparks[0]=44;low.stages[39].score=440;low.totalScore-=10;assert.equal(validateScore(low).ok,false);
 const oversized=structuredClone(p);oversized.stages=Array(1441).fill(failed);assert.equal(validateScore(oversized).ok,false);
 const chain=structuredClone(p);chain.stages[40].sparks[16]=1;chain.stages[40].pickups=1;chain.stages[40].score=50;chain.totalScore+=50;assert.equal(validateScore(chain).ok,false);
});

test('voluntarily banked Endless accepts complete stages but never an unfinished round or invented clear',async()=>{
 const p=await endlessFixture();p.stages.pop();p.totalScore=p.stages.reduce((n,s)=>n+s.score,0);
 assert.equal(validateScore(p).ok,true);
 for(const mutate of [q=>q.stages.at(-1).activeMs=30000,q=>q.stagesCleared++,q=>q.stages=[],q=>q.totalScore++]){const q=structuredClone(p);mutate(q);assert.equal(validateScore(q).ok,false);}
 const single=structuredClone(p);single.stages=single.stages.slice(0,1);single.totalScore=single.stages[0].score;single.stagesCleared=1;assert.equal(validateScore(single).ok,true);
 single.mode='festival';assert.equal(validateScore(single).code,'unfinished');
});
