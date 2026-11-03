import test from 'node:test';import assert from 'node:assert/strict';
import {createRunSummary,createInputTracker} from '../src/playtest/summary.js';
const make=()=>createRunSummary({runId:'r',mode:'festival',buildId:'dev',scoringVersion:'arcade-v1'});
test('run summaries reject stale data and finish a stage once',()=>{
 const s=make();s.record('start',{runId:'r',stageIndex:0});s.record('pickup',{runId:'old',chain:9});s.record('pickup',{runId:'r',chain:3});
 s.record('tick',{runId:'r',activeMs:16,bassMs:16,chargeMs:16});
 const end=s.finishStage(0);assert.equal(end.pickups,1);assert.equal(end.activeMs,16);assert.equal(end.peakCombo,3);assert.equal(s.finishStage(0),null);
 s.record('pickup',{runId:'r',chain:4});assert.equal(s.snapshot().stages[0].pickups,1);
});
test('close pass distribution excludes invalid values and summarizes minimum',()=>{
 const s=make();s.record('start',{runId:'r',stageIndex:0});for(const clearance of [0,7,14,21,-1,NaN])s.record('closepass',{runId:'r',clearance});
 assert.deepEqual(s.finishStage(0).clearanceBins,[1,1,2]);assert.equal(s.snapshot().stages[0].minClearance,0);
});
test('pauses and hidden pages do not add active time or exits',()=>{
 const s=make();s.record('start',{runId:'r',stageIndex:0});s.record('hidden',{runId:'r',activeMs:5000});assert.equal(s.snapshot().outcome,'unknown');assert.equal(s.snapshot().stages[0].activeMs,0);
 s.record('exit',{runId:'r'});assert.equal(s.snapshot().outcome,'exit');
});
test('input tracks accepted game actions and does not infer from hardware',()=>{
 const t=createInputTracker();assert.equal(t.inputType(),'unknown');t.recordInput('menu');assert.equal(t.inputType(),'unknown');t.recordInput('touch');t.recordInput('touch');assert.equal(t.inputType(),'touch');t.recordInput('keyboard');assert.equal(t.inputType(),'mixed');
});

test('Endless keeps only its current sequential stage while preserving accurate long-run counters',()=>{
 const s=createRunSummary({runId:'r',mode:'endless',buildId:'dev',scoringVersion:'arcade-v1'});
 for(let i=0;i<5000;i++){s.record('start',{runId:'r',stageIndex:i});s.record('pickup',{runId:'r',chain:1});const stage=s.finishStage(i,{score:10,qualified:true});assert.equal(stage?.stageIndex,i);assert.equal(stage.pickups,1);assert.ok(s.snapshot().stages.length<=1);}
 s.record('start',{runId:'r',stageIndex:5001});assert.equal(s.snapshot().stages[0].stageIndex,4999);
});
