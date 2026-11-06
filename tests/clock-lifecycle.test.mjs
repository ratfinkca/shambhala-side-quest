import test from 'node:test';import assert from 'node:assert/strict';
import {createPracticeEngine,handlePracticePageHide,createClockPractice,CLOCK_CHOICES} from '../src/clock-practice.js';
import config from '../vite.config.js';
test('clock switches reuse a single engine and keep document listener registration flat',()=>{
 let created=0,listeners=0,destroyed=0,starts=0;
 const pool=createPracticeEngine(()=>{created++;listeners++;return {start(){starts++},pause(){},resume(){},destroy(){destroyed++}}});
 const lab=createClockPractice({createSession:pool.createSession});lab.start();for(let i=0;i<10;i++)lab.select(CLOCK_CHOICES[i%CLOCK_CHOICES.length].id);
 assert.equal(created,1);assert.equal(listeners,1);assert.equal(starts,11);assert.equal(destroyed,0);lab.destroy();pool.destroy();pool.destroy();assert.equal(destroyed,1);
});
test('cached pagehide pauses intact state while permanent pagehide disposes it',()=>{
 let paused=0,disposed=0;const actions={pause(){paused++},dispose(){disposed++}};handlePracticePageHide({persisted:true},actions);assert.equal(paused,1);assert.equal(disposed,0);handlePracticePageHide({persisted:false},actions);assert.equal(disposed,1);
});
test('simultaneous edition previews do not invalidate each others optimized dependencies',()=>{
 const previous=process.env.VITE_EDITION;try{process.env.VITE_EDITION='generic';const generic=config({mode:'development'});process.env.VITE_EDITION='smf';const smf=config({mode:'development'});assert.equal(typeof generic.cacheDir,'string');assert.equal(typeof smf.cacheDir,'string');assert.notEqual(generic.cacheDir,smf.cacheDir);}finally{if(previous===undefined)delete process.env.VITE_EDITION;else process.env.VITE_EDITION=previous;}
});
