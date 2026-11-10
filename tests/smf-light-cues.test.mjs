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
   assert.equal(frame.beams.length,8);assert.equal(frame.lasers.length,24);
   for(const ray of frame.lasers){assert.ok(Math.abs(ray.angle)<=1.35);assert.ok(ray.alpha>=0&&ray.alpha<=.8);assert.ok(ray.width>=.6&&ray.width<=1.8);assert.ok(ray.length>=.35&&ray.length<=1.2);}
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

test('laser shows remain energetic beyond the short scoring bonus and differ by venue',()=>{
 const signatures=[];
 for(const stage of SMF_PREVIEW_STAGES){const timing=getTiming(stage.timingId),bar=240000/timing.bpm;
  const late=smfLightCue(stage.id,stage.id==='smf-village'?34*bar:11*bar,timing);
  const arrival=smfLightCue(stage.id,0,timing);
  assert.ok(late.energy>arrival.energy+.2);
  assert.ok(late.lasers.reduce((sum,l)=>sum+l.alpha,0)>arrival.lasers.reduce((sum,l)=>sum+l.alpha,0)*1.4);
  signatures.push(JSON.stringify(late.lasers));
 }
 assert.equal(new Set(signatures).size,6);
});
test('Village eases its dense DnB show into half-time and dawn',()=>{
 const timing=getTiming('smf-village-clock-preview-1'),bar=240000/timing.bpm;
 const cue=b=>smfLightCue('smf-village',b*bar,timing);
 assert.ok(cue(34).energy>cue(20).energy+.2);
 assert.ok(cue(34).energy>cue(46).energy+.2);
});

for(const stage of SMF_PREVIEW_STAGES)test(`${stage.id} sweeps beam endpoints vertically while preserving a stable reduced-motion pose`,()=>{
 const timing=getTiming(stage.timingId),bar=240000/timing.bpm,frames=Array.from({length:65},(_,i)=>smfLightCue(stage.id,i/4*bar,timing));
 for(const key of ['beams','lasers']){
  const reaches=frames.map(frame=>frame[key][0].length);
  assert.ok(reaches.every(length=>length>=.35&&length<=1.2));
  assert.ok(Math.max(...reaches)-Math.min(...reaches)>.20,`${key} must visibly rise and fall`);
 }
 assert.deepEqual(smfLightCue(stage.id,3*bar,timing,true),smfLightCue(stage.id,29*bar,timing,true));
});

test('Village flower-top sky salutes are rare, smooth and absent with reduced motion',()=>{
 const timing=getTiming('smf-village-clock-preview-1'),bar=240000/timing.bpm,cue=b=>smfLightCue('smf-village',b*bar,timing);
 assert.equal(cue(0).skyBeams.length,6);
 for(const b of [0,4,8,12,20,24,28,36,40,44,48])assert.ok(cue(b).skyBeams.every(beam=>beam.alpha===0));
 for(const b of [15.8,31.8])assert.ok(cue(b).skyBeams.every(beam=>beam.alpha>.5));
 for(let b=0;b<=48;b+=.05)for(const beam of cue(b).skyBeams){assert.ok(beam.alpha>=0&&beam.alpha<=.8);assert.ok(Math.abs(beam.angle-Math.PI)<.65);}
 assert.ok(smfLightCue('smf-village',16*bar,timing,true).skyBeams.every(beam=>beam.alpha===0));
 for(const stage of SMF_PREVIEW_STAGES.filter(stage=>stage.id!=='smf-village'))assert.deepEqual(smfLightCue(stage.id,0,getTiming(stage.timingId)).skyBeams,[]);
});
