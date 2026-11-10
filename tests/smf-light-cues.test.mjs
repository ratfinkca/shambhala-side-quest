import test from 'node:test';
import assert from 'node:assert/strict';
import {smfLightCue} from '../src/editions/smf-light-cues.js';
import {SMF_PREVIEW_STAGES} from '../src/editions/smf-stages.js';
import {getTiming} from '../src/stage-clock.js';

const numbers=value=>typeof value==='number'?[value]:Object.values(value).flatMap(numbers);
for(const stage of SMF_PREVIEW_STAGES){
 const timing=getTiming(stage.timingId);
 const cue=(time,reduced=false)=>smfLightCue(stage.id,time,timing,reduced);
 test(`${stage.id} lighting is reproducible, bounded and frozen for reduced motion`,()=>{
  const frozen=cue(0,true),reference=cue(1000);
  for(let t=0;t<=timing.durationMs;t+=137){
   const frame=cue(t);
   assert.equal(frame.beams.length,8);
   assert.ok(numbers(frame).every(Number.isFinite));
   for(const field of ['energy','colourMix','architecture'])assert.ok(frame[field]>=0&&frame[field]<=1);
   assert.ok(Math.abs(frame.poolDrift)<=1);
   for(const beam of frame.beams){
    assert.ok(Math.abs(beam.angle)<=1);
    assert.ok(beam.width>=.5&&beam.width<=1.6);
    assert.ok(beam.alpha>=0&&beam.alpha<=.16);
    assert.ok(beam.glow>=0&&beam.glow<=.8);
   }
   assert.deepEqual(cue(t,true),frozen);
  }
  assert.deepEqual(cue(1000),reference,'seeking or resuming does not depend on update history');
  assert.deepEqual(cue(-10),cue(0));
  assert.deepEqual(cue(timing.durationMs+1000),cue(timing.durationMs));
  assert.notDeepEqual(cue(1000),cue(2000));
 });
 test(`${stage.id} lights cross bars, builds and drops without a brightness or aim jump`,()=>{
  const barMs=240000/timing.bpm;
  const boundaries=[...Array.from({length:49},(_,i)=>i*barMs),...timing.dropStartsMs.flatMap(t=>[t-timing.buildMs,t,t+timing.dropDurationMs])];
  for(const t of boundaries.filter(t=>t>0&&t<timing.durationMs)){
   const before=numbers(cue(t-.5)),after=numbers(cue(t+.5));
   assert.ok(before.every((value,i)=>Math.abs(value-after[i])<.002),`discontinuous cue at ${t}ms`);
  }
 });
}
test('all six venues have distinct movement at the same musical positions',()=>{
 const signatures=SMF_PREVIEW_STAGES.map(stage=>{
  const timing=getTiming(stage.timingId);
  return JSON.stringify([0,3,8,11].map(bar=>smfLightCue(stage.id,bar*240000/timing.bpm,timing).beams));
 });
 assert.equal(new Set(signatures).size,6);
});
test('lighting rejects unknown rigs, invalid time and untrusted clocks',()=>{
 const timing=getTiming(SMF_PREVIEW_STAGES[0].timingId);
 assert.throws(()=>smfLightCue('forest',0,timing),/Unknown SMF light rig/);
 assert.throws(()=>smfLightCue('smf-living-room',NaN,timing),/Invalid lighting time/);
 assert.throws(()=>smfLightCue('smf-living-room',0,{...timing}),/Untrusted stage clock/);
});
