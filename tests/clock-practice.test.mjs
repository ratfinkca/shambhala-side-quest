import test from 'node:test';import assert from 'node:assert/strict';
import {clockPracticeRequested,startEdition} from '../src/editions/registry.js';
import {createClockPractice,CLOCK_CHOICES,diagnosticVoices} from '../src/clock-practice.js';
import {getTiming} from '../src/stage-clock.js';
test('clock practice requires DEV, SMF and both flags; production and generic cannot be forced',async()=>{
 for(const DEV of [true,false])for(const VITE_EDITION of ['generic','smf'])for(const query of ['','?clock','?rehearsal','?clock&rehearsal'])assert.equal(clockPracticeRequested({DEV,VITE_EDITION},query),DEV&&VITE_EDITION==='smf'&&query==='?clock&rehearsal');
 for(const [env,expected] of [[{DEV:false,VITE_EDITION:'smf'},'tour'],[{DEV:true,VITE_EDITION:'generic'},'game'],[{DEV:true,VITE_EDITION:'smf'},'clock']]){const calls=[];await startEdition(env,Object.fromEntries(['game','scaffold','tour','clock'].map(key=>[key,()=>calls.push(key)])),{clockPractice:true});assert.deepEqual(calls,[expected]);}
});
test('memory-only lab resets, switches and tears down every old session without persistence or requests',()=>{
 const oldFetch=globalThis.fetch,oldStorage=Object.getOwnPropertyDescriptor(globalThis,'localStorage');let calls=0;globalThis.fetch=()=>{calls++;throw Error('network forbidden')};Object.defineProperty(globalThis,'localStorage',{configurable:true,get(){calls++;throw Error('storage forbidden')}});
 try{const sessions=[];const lab=createClockPractice({createSession:()=>{const s={destroyed:0,start(c){this.config=c},pause(){this.paused=true},resume(){this.paused=false},destroy(){this.destroyed++}};sessions.push(s);return s;}});
 assert.equal(lab.timing.id,'smf-living-room-clock-preview-1');assert.equal(sessions.length,0);lab.start();lab.pause();assert.equal(lab.state,'paused');lab.resume();assert.equal(lab.state,'playing');
 for(let i=0;i<10;i++)lab.select(CLOCK_CHOICES[i%CLOCK_CHOICES.length].id);
 assert.equal(sessions.length,11);assert.ok(sessions.slice(0,-1).every(s=>s.destroyed===1));assert.equal(sessions.at(-1).config.stage.id,'clock-lab');assert.equal(sessions.at(-1).config.stage.name,'Clock practice');assert.throws(()=>lab.select('unknown'));assert.equal(sessions.at(-1).destroyed,0);lab.destroy();assert.ok(sessions.every(s=>s.destroyed===1));assert.equal(calls,0);
 }finally{globalThis.fetch=oldFetch;if(oldStorage)Object.defineProperty(globalThis,'localStorage',oldStorage);else delete globalThis.localStorage;}
});
test('lab choices contain only seven main/legacy clocks and diagnostics follow their beat grid',()=>{
 assert.equal(CLOCK_CHOICES.length,7);for(const c of CLOCK_CHOICES){const timing=getTiming(c.id);assert.doesNotMatch(c.id,/rabbit|garden|ikigai/);const beat=diagnosticVoices({timing,step:0,phase:'cruise'});assert.ok(beat.some(v=>v.kind==='kick'));assert.deepEqual(diagnosticVoices({timing,step:0,phase:'ended'}),[]);assert.ok(diagnosticVoices({timing,step:timing.stepsPerBeat,phase:'drop'}).length>0);}
});
