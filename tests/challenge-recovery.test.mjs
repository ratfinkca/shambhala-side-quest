import test from 'node:test';
import assert from 'node:assert/strict';
import {createRun,startStage,finishStage,chooseUpgrade,rulesFor} from '../src/run.js';
import {createRound,advanceRound,collect} from '../src/game.js';
import {createEncounter} from '../src/festival.js';
import {createMystery,collectMystery} from '../src/mystery.js';
import {activateFlow,availableFlow} from '../src/flow.js';
import {makeRecovery,readRecovery} from '../src/recovery.js';
import {recoveryFixture} from './helpers/recovery-fixtures.mjs';
function checkpoint(challenge='seasoned-vet'){
 const run=createRun('endless','00000000-0000-4000-8000-000000000001',undefined,challenge);run.buildId='test';run.displayName='Moon Dancer';run.displayNameDraft='Moon Dancer';
 for(const perk of ['candy-magnet','flow-finder']){const c=startStage(run),round=createRound(c.rules);while(round.pickups<c.stage.target)collect(round);advanceRound(round,60000);finishStage(run,round);assert.equal(chooseUpgrade(run,perk),true);}
 const config=startStage(run),round=createRound(config.rules);round.runId=run.id;round.mystery=createMystery(()=>0,{rules:config.rules,durationMs:60000});
 advanceRound(round,12000);activateFlow(round);collectMystery(round,()=>0);delete round.rules;
 const scene={round,player:{x:480,y:400},sparks:Array.from({length:12},(_,i)=>({x:100+i*50,y:200})),candy:{placed:true,x:300,y:300},crowd:config.stage.crowdAnchors.map(()=>createEncounter())};
 return makeRecovery({run,screen:{name:'playing'},scene,inputType:'touch',now:1000});
}
test('v3 recovery retains challenge, editable name and consumed drop schedules without restarting effects',()=>{
 for(const challenge of ['first-timer','been-around','seasoned-vet']){
  const raw=checkpoint(challenge),loaded=readRecovery(raw);assert.equal(loaded.ok,true);
  assert.equal(loaded.value.run.challenge,challenge);assert.equal(loaded.value.run.displayName,'Moon Dancer');
  assert.deepEqual(loaded.value.scene.round.flowTaken,[0]);assert.deepEqual(loaded.value.scene.round.mystery.schedule.consumed,[0]);
  const rules=rulesFor(raw.run.perks,raw.run.scoringVersion),r={...loaded.value.scene.round,rules};
  advanceRound(r,12000);assert.equal(availableFlow(r),-1);advanceRound(r,4000);assert.equal(availableFlow(r),1);
 }
});
test('v3 rejects missing schedules, altered cooldowns, duplicate consumption and challenge corruption',()=>{
 const raw=checkpoint();
 for(const mutate of [r=>delete r.scene.round.flowSchedule,r=>delete r.scene.round.mystery.schedule,r=>r.scene.round.flowSchedule.cooldownUntilMs=0,r=>r.scene.round.mystery.schedule.cooldownUntilMs=0,r=>r.scene.round.mystery.schedule.consumed.push(0),r=>r.run.challenge='unknown',r=>r.scene.round.flowTaken.push(9)]){
  const bad=structuredClone(raw);mutate(bad);assert.equal(readRecovery(bad).ok,false);
 }
});
test('v1/v2 saves with old drop shapes remain recoverable',()=>{
 for(const season of ['arcade-v1','arcade-v2']){
  const input=recoveryFixture();input.run.scoringVersion=season;delete input.run.challenge;
  const round=createRound(rulesFor([],season));round.runId=input.run.id;advanceRound(round,16000);delete round.rules;
  input.scene.round=round;const raw=makeRecovery(input),loaded=readRecovery(raw);assert.equal(loaded.ok,true);assert.equal(loaded.value.scene.round.flowSchedule,undefined);assert.equal(loaded.value.scene.round.mystery.schedule,undefined);
 }
});

test('generic v1/v2 recovery keeps mystery time aligned with the round clock',()=>{
 for(const season of ['arcade-v1','arcade-v2']){
  const raw=makeRecovery(recoveryFixture(0,season));
  assert.equal(raw.scene.round.mystery.elapsedMs,60000-raw.scene.round.remainingMs);
  assert.equal(readRecovery(raw).ok,true,`${season} valid clock`);
  for(const elapsedMs of [15000,17000,60001]){
   const mismatched=structuredClone(raw);mismatched.scene.round.mystery.elapsedMs=elapsedMs;
   assert.equal(readRecovery(mismatched).ok,false,`${season} mismatched mystery clock ${elapsedMs}`);
  }
 }
});
