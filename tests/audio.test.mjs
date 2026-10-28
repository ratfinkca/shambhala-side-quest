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
