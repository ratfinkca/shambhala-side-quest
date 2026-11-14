import test from 'node:test';
import assert from 'node:assert/strict';
import {rulesFor} from '../src/run.js';
import {createRound,advanceRound} from '../src/game.js';
import {availableFlow,activateFlow} from '../src/flow.js';
import {createMystery,collectMystery} from '../src/mystery.js';
const round=(perks=[])=>createRound(rulesFor(perks,'arcade-v3'));
test('Flow Finder offers up to three pickups with actual Moth + Encore expiry and eight second spacing',()=>{
 const r=round(['flow-finder','moth','encore']);
 advanceRound(r,19000);assert.equal(activateFlow(r),true);assert.equal(r.flowMs,10000);
 advanceRound(r,9000);assert.equal(availableFlow(r),-1);
 advanceRound(r,8999);assert.equal(r.flowMs,0);assert.equal(availableFlow(r),-1);
 advanceRound(r,1);assert.equal(availableFlow(r),1);assert.equal(activateFlow(r),true);
 advanceRound(r,15000);assert.equal(availableFlow(r),-1,'third is skipped when a full pickup and effect window cannot fit');
 assert.equal(r.flowTaken.length,2);
});
test('Flow Finder has three useful early opportunities and serializes consumed/cooldown state',()=>{
 const r=round(['flow-finder']);
 for(const at of [8000,28000,44000]){advanceRound(r,at-(60000-r.remainingMs));assert.equal(activateFlow(r),true);}
 assert.deepEqual(r.flowTaken,[0,1,2]);const saved=structuredClone(r);assert.equal(availableFlow(saved),-1);
 advanceRound(saved,10000);assert.equal(availableFlow(saved),-1);
});
test('Candy Magnet guarantees one, adds a fifty percent second, and spaces actual effects',()=>{
 const rules=rulesFor(['candy-magnet','sweet'],'arcade-v3');
 for(const [roll,count] of [[0,2],[.499,2],[.5,1],[.999,1]]){
  const r=round();r.rules=rules;r.mystery=createMystery(()=>roll,{rules,durationMs:60000});
  assert.equal(r.mystery.schedule.windows.length,count);assert.equal(r.mystery.phase,'waiting');
 }
 const r=round();r.rules=rules;r.mystery=createMystery(()=>0,{rules,durationMs:60000});
 advanceRound(r,21000);assert.equal(collectMystery(r,()=>0),'speed');
 advanceRound(r,10999);assert.notEqual(r.mystery.phase,'available');
 advanceRound(r,4001);assert.equal(r.mystery.phase,'available');assert.equal(collectMystery(r,()=>.5),'dizzy');
 assert.deepEqual(r.mystery.schedule.consumed,[0,1]);advanceRound(r,20000);assert.equal(collectMystery(r),null);
});
test('legacy seasons retain original single-candy and two-flow schedules even with invalid new perks',()=>{
 const r=createRound(rulesFor(['candy-magnet','flow-finder'],'arcade-v2'));
 assert.equal(r.flowSchedule,undefined);assert.equal(r.mystery.schedule,undefined);
 advanceRound(r,28000);assert.equal(availableFlow(r),-1);advanceRound(r,5000);assert.equal(availableFlow(r),1);
});
