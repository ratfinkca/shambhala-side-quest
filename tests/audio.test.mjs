import test from 'node:test';
import assert from 'node:assert/strict';
import { createAudio } from '../src/audio.js';
function fake(){
 const gains=[],voices=[];let resumes=0;
 const param=()=>({value:0,setValueAtTime(v){this.value=v},linearRampToValueAtTime(){},exponentialRampToValueAtTime(){}});
 const ctx={sampleRate:100,createBuffer(){return {getChannelData(){return new Float32Array(100)}}},createBufferSource(){const n={connect(){},disconnect(){},start(){},stop(){this.stopped=true}};voices.push(n);return n},createBiquadFilter(){return {frequency:param(),connect(){},disconnect(){}}},state:'running',currentTime:0,destination:{},resume(){resumes++;return Promise.resolve()},createGain(){const n={gain:param(),connect(to){this.to=to},disconnect(){}};gains.push(n);return n},createOscillator(){const n={frequency:param(),connect(to){this.to=to},disconnect(){},start(){},stop(){this.stopped=true}};voices.push(n);return n}};
 return {ctx,gains,voices,get resumes(){return resumes}};
}
test('audio remains lazy and routes music and effects through separate adjustable buses',()=>{
 const f=fake();let created=0;const a=createAudio(()=>{created++;return f.ctx});
 assert.equal(created,0);a.setVolumes({music:.2,effects:.7});a.setEnabled(true);
 a.sync({remainingMs:60000,multiplier:1,flowMs:0});const music=f.voices[0].to.to;
 a.pickup(1);const effects=f.voices.at(-1).to.to;
 assert.notEqual(music,effects);assert.equal(music.gain.value,.2);assert.equal(effects.gain.value,.7);
 a.setVolumes({music:.6,effects:.1});assert.equal(music.gain.value,.6);assert.equal(effects.gain.value,.1);
 a.setEnabled(false);assert.ok(f.voices.every(v=>v.stopped));
});
test('failed resume is caught and the next sound gesture retries',async()=>{
 const f=fake();let tries=0;f.ctx.resume=()=>{tries++;return Promise.reject(Error('blocked'))};
 const a=createAudio(()=>f.ctx);a.setEnabled(true);await Promise.resolve();a.setEnabled(true);await Promise.resolve();assert.equal(tries,2);
});

test('forest percussion is deduplicated per step and all music stops on pause or mute',()=>{
 const f=fake(),a=createAudio(()=>f.ctx);a.setEnabled(true);
 const round={remainingMs:59750,multiplier:1,flowMs:0};
 a.sync(round,'forest');const count=f.voices.length;
 assert.ok(count>=2);a.sync(round,'forest');assert.equal(f.voices.length,count);
 a.stop();assert.ok(f.voices.every(v=>v.stopped));
 a.sync(round,'forest');assert.ok(f.voices.length>count);
 a.setEnabled(false);const mutedCount=f.voices.length;a.sync({...round,remainingMs:59000},'forest');
 assert.equal(f.voices.length,mutedCount);assert.ok(f.voices.every(v=>v.stopped));
});

test('stage transitions select their own instrument voices and stop previous sources',()=>{
 const f=fake(),audio=createAudio(()=>f.ctx);audio.setEnabled(true);
 const round={remainingMs:60000,multiplier:1,flowMs:0};
 for(const [stage,kick] of [['forest',120],['neon',140],['sunrise',105]]){
  audio.stop();const before=f.voices.length;audio.sync(round,stage);
  assert.equal(f.voices[before].frequency.value,kick);
  // Each arrangement begins with its own kick; one tick cannot duplicate voices.
  const count=f.voices.length;audio.sync(round,stage);assert.equal(f.voices.length,count);
  audio.stop();assert.ok(f.voices.every(v=>v.stopped));
 }
});

test('timed audio queues absolute onsets, stays silent without injected voices, and cancels on stop',()=>{
 const f=fake();const starts=[];const create=f.ctx.createOscillator;f.ctx.createOscillator=()=>{const n=create();n.start=at=>starts.push(at);return n};
 const timingId='smf-living-room-clock-preview-1',round={timingId,remainingMs:68571-17140,multiplier:1,flowMs:0};f.ctx.currentTime=20;
 const audio=createAudio(()=>f.ctx,{timedVoices:()=>[{frequency:120,duration:.1,type:'sine',volume:.02}]});audio.setEnabled(true);audio.sync(round,'clock-lab');assert.deepEqual(starts,[20.003]);audio.sync(round,'clock-lab');assert.equal(starts.length,1);audio.stop();assert.ok(f.voices.every(v=>v.stopped));
 const silent=fake(),s=createAudio(()=>silent.ctx);s.setEnabled(true);s.sync(round,'smf-living-room');assert.equal(silent.voices.length,0);
 f.ctx.state='suspended';audio.sync(round);assert.equal(starts.length,1);f.ctx.state='running';audio.setEnabled(true);audio.sync({...round,remainingMs:68571-18000});assert.ok(starts.length>1);audio.setEnabled(false);assert.ok(f.voices.every(v=>v.stopped));
});

test('diagnostic transport can exercise the legacy clock without changing default legacy music',()=>{
 const f=fake(),audio=createAudio(()=>f.ctx,{useTransport:true,timedVoices:()=>[{frequency:333,type:'sine',duration:.1,volume:.02}]});audio.setEnabled(true);audio.sync({remainingMs:60000,multiplier:1,flowMs:0},'clock-lab');assert.equal(f.voices[0].frequency.value,333);
});
