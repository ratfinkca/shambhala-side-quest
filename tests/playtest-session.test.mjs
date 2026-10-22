import test from 'node:test';import assert from 'node:assert/strict';
import {createPlaytestSession} from '../src/playtest/session.js';
import {createConsent} from '../src/playtest/consent.js';import {createStorage} from '../src/storage.js';
const id=n=>`00000000-0000-4000-8000-${String(n).padStart(12,'0')}`;
const run={id:id(99),mode:'rush',themeId:'forest-freakout',stageIndex:0,stagesCleared:1,totalScore:50};
const setup=(enabled=true)=>{let n=0;const batches=[];const consent=createConsent({storage:createStorage(),uuid:()=>id(++n)});const s=createPlaytestSession({config:{enabled,buildId:'dev'},consent,uuid:()=>id(++n),width:()=>390,send:async es=>{batches.push(...es);return true;}});return {s,consent,batches}};
test('accept mid-run waits for next run, opt-out stops immediately',async()=>{
 const {s,batches}=setup();s.start(run);s.setConsent('accepted');s.record('pickup',{chain:2});s.finishStage(0,{score:50,qualified:true});s.end(run);await s.flush();assert.equal(batches.length,0);
 s.start({...run,id:id(100)},true);s.stageStart(0);s.record('tick',{activeMs:100,bassMs:0,chargeMs:0});s.record('pickup',{chain:1});s.finishStage(0,{score:10,qualified:true});await s.flush();assert.ok(batches.some(e=>e.type==='stage_end'));assert.equal(batches.find(e=>e.type==='stage_end').payload.pickups,1);
 s.setConsent('declined');s.record('pickup',{chain:5});s.end(run);await s.flush();assert.equal(batches.filter(e=>e.type==='run_end').length,0);
});
test('configured off generates no identity, events or requests, even accepting',async()=>{
 const {s,consent,batches}=setup(false);s.setConsent('accepted');s.start(run);s.menu('instructions',run.themeId);await s.flush();assert.equal(consent.identity(),null);assert.equal(batches.length,0);
});
test('normal lifecycle deduplicates end, records mixed input, never emits initials',async()=>{
 const {s,batches}=setup();s.setConsent('accepted');s.start(run);s.stageStart(0);s.input('touch');s.input('keyboard');s.record('tick',{activeMs:60000,bassMs:0,chargeMs:0});s.finishStage(0,{score:50,qualified:true});s.end(run);s.end(run);await s.flush();
 assert.equal(batches.filter(e=>e.type==='run_end').length,1);assert.equal(batches.find(e=>e.type==='run_end').inputType,'mixed');assert.equal(batches.some(e=>'initials' in e),false);
});
