import test from 'node:test';import assert from 'node:assert/strict';
import {createRound,advanceRound,collect} from '../src/game.js';
import {awardClosePass,crowdPosition} from '../src/festival.js';
import {getTiming} from '../src/stage-clock.js';
import {createRunSummary} from '../src/playtest/summary.js';
import {makeRecovery,readRecovery} from '../src/recovery.js';
import {recoveryFixture} from './helpers/recovery-fixtures.mjs';
const clocks=['smf-amp-clock-preview-1','smf-living-room-clock-preview-1'];
for(const id of clocks)test(`${id} controls completion, scoring edges and real-time effects`,()=>{
 const timing=getTiming(id),r=createRound({},id);assert.equal(r.remainingMs,timing.durationMs);assert.equal(r.timingId,id);
 for(const start of timing.dropStartsMs)for(const [ms,bonus] of [[start-1,1],[start,2],[start+3999,2],[start+4000,1]]){
  const q=createRound({},id);q.remainingMs=timing.durationMs-ms;assert.equal(collect(q).points,10*bonus);assert.equal(awardClosePass(q),15*bonus);
 }
 for(const effectMs of [5000,7000]){const q=createRound({},id);q.mystery.effect='speed';q.mystery.effectMs=effectMs;advanceRound(q,effectMs-1);assert.equal(q.mystery.effectMs,1);advanceRound(q,1);assert.equal(q.mystery.effectMs,0);}
 advanceRound(r,100000);assert.equal(r.remainingMs,0);assert.equal(r.ended,true);assert.equal(r.mystery.elapsedMs,timing.durationMs);
 assert.equal(collect(r).points,0);assert.equal(awardClosePass(r),0);
});
test('timed summaries use trusted duration and six sequential finite stages',()=>{
 const t=getTiming(clocks[1]),s=createRunSummary({runId:'r',mode:'festival',stageCount:6,timingForStage:()=>t});
 for(let i=0;i<6;i++){assert.equal(s.record('start',{runId:'r',stageIndex:i}),true);s.record('tick',{runId:'r',activeMs:60001,bassMs:99999,chargeMs:99999});const end=s.finishStage(i);assert.equal(end.activeMs,60001);assert.equal(end.bassMs,t.durationMs);assert.equal(end.chargeMs,t.durationMs);}
 assert.equal(s.record('start',{runId:'r',stageIndex:6}),false);assert.equal(s.snapshot().stages.length,6);
 const bad=createRunSummary({runId:'r',mode:'festival',timingForStage:()=>({...t})});assert.throws(()=>bad.record('start',{runId:'r',stageIndex:0}));
});
test('timed scenes cannot be downgraded into generic recovery',()=>{
 for(const id of [...clocks,'bad',null,undefined]){const f=recoveryFixture();f.scene.round.timingId=id;assert.equal(makeRecovery(f),null);const raw=makeRecovery(recoveryFixture());raw.scene.round.timingId=id;assert.equal(readRecovery(raw).ok,false);}
 assert.throws(()=>createRound({},'unknown'));assert.throws(()=>createRound({},null));assert.equal(Object.hasOwn(createRound(),'timingId'),false);
});
test('timed dancer positions remain continuous and legacy default is unchanged',()=>{
 const t=getTiming(clocks[1]);for(const start of t.dropStartsMs){const a=crowdPosition(0,start-1,undefined,1,t),b=crowdPosition(0,start,undefined,1,t);assert.ok(Math.hypot(a.x-b.x,a.y-b.y)<1);}
 assert.notDeepEqual(crowdPosition(0,16000),crowdPosition(0,16000,undefined,1,t));assert.deepEqual(crowdPosition(0,16000),crowdPosition(0,16000,undefined,1,getTiming()));
});
