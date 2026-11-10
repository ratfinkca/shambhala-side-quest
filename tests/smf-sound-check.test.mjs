import test from 'node:test';import assert from 'node:assert/strict';
import {soundCheckWindow,soundCheckEvents,measureAudio,audioWav} from '../src/editions/smf-sound-check.js';
import {SMF_PREVIEW_STAGES} from '../src/editions/smf-stages.js';import {getTiming} from '../src/stage-clock.js';
test('comparison passages use complete bars spanning the first build and drop for all six tempos',()=>{
 for(const stage of SMF_PREVIEW_STAGES){
  const timing=getTiming(stage.timingId),window=soundCheckWindow(timing),bar=240000/timing.bpm;
  assert.ok(Math.abs(window.startMs/bar-Math.round(window.startMs/bar))<1e-9);
  assert.equal(window.durationMs/bar,8);
  assert.ok(window.startMs<timing.dropStartsMs[0]-timing.buildMs);
  assert.ok(window.startMs+window.durationMs>timing.dropStartsMs[0]+timing.dropDurationMs);
  assert.ok(window.startMs+window.durationMs<timing.durationMs);
 }
});
test('eight-bar clips exclude the ninth downbeat at fractional tempos and schedule swing in time order',()=>{
 for(const stage of SMF_PREVIEW_STAGES){
  const timing=getTiming(stage.timingId),steps=[];
  const events=soundCheckEvents(timing,({step})=>{steps.push(step);return [{offsetMs:24},{offsetMs:0}];});
  assert.equal(steps.length,128);assert.equal(steps.at(-1)-steps[0],127);
  assert.equal(steps[0]%16,0);assert.equal(steps.at(-1)%16,15);
  assert.ok(events.every((e,i)=>i===0||e.at>=events[i-1].at));
  assert.equal(events[0].voice.offsetMs,0);
  assert.ok(events.at(-1).at<soundCheckWindow(timing).durationMs/1000);
 }
});
test('audio analysis rejects invalid samples and measures both stereo channels',()=>{
 const buffer={numberOfChannels:2,getChannelData:i=>i?[.5,-.5]:[1,-1]};
 assert.deepEqual(measureAudio(buffer),{peak:1,rms:Math.sqrt(.625)});
 assert.throws(()=>measureAudio({numberOfChannels:1,getChannelData:()=>[NaN]}),/Non-finite/);
});
test('saved WAV has a valid stereo PCM header and preserves channel order with safe headroom',()=>{
 const buffer={numberOfChannels:2,length:2,sampleRate:44100,getChannelData:i=>i?[.5,-.5]:[1,-1]},wav=audioWav(buffer,.9),view=new DataView(wav),text=(start,end)=>String.fromCharCode(...new Uint8Array(wav).slice(start,end));
 assert.equal(text(0,4),'RIFF');assert.equal(text(8,12),'WAVE');assert.equal(view.getUint32(4,true),44);
 assert.equal(view.getUint16(22,true),2);assert.equal(view.getUint32(24,true),44100);assert.equal(view.getUint32(40,true),8);
 assert.equal(view.getInt16(44,true),Math.round(32767*.9));assert.equal(view.getInt16(46,true),Math.round(32767*.45));
 assert.equal(view.getInt16(48,true),Math.round(-32768*.9));assert.equal(view.getInt16(50,true),Math.round(-32768*.45));
});
