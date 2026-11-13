import test from 'node:test';import assert from 'node:assert/strict';
import {createPlaytestSession} from '../src/playtest/session.js';
import {createConsent} from '../src/playtest/consent.js';import {createStorage} from '../src/storage.js';
const id=n=>`00000000-0000-4000-8000-${String(n).padStart(12,'0')}`;
const run={id:id(99),mode:'rush',themeId:'forest-freakout',stageIndex:0,stagesCleared:1,totalScore:50};
const setup=(enabled=true)=>{let n=0;const batches=[];const consent=createConsent({storage:createStorage(),uuid:()=>id(++n)});const s=createPlaytestSession({config:{enabled,buildId:'dev'},consent,uuid:()=>id(++n),width:()=>390,send:async es=>{batches.push(...es);return true;}});return {s,consent,batches}};
test('playtest events retain each run season while menus describe the current game',async()=>{
 const {validatePlaytestBatch}=await import('../supabase/functions/_shared/playtest.js');
 for(const version of [undefined,'arcade-v1','arcade-v2']){
  const {s,batches}=setup();s.setConsent('accepted');
  const active={...run,...(version?{scoringVersion:version}:{})};
  s.start(active);s.stageStart(0);s.finishStage(0,{score:0,qualified:true});s.end(active);s.menu('instructions',run.themeId);await s.flush();
  assert.ok(batches.filter(e=>e.type!=='menu').every(e=>e.scoringVersion===(version??'arcade-v1')));
  assert.equal(batches.find(e=>e.type==='menu').scoringVersion,'arcade-v2');
  assert.ok(batches.every(e=>validatePlaytestBatch([e]).ok));
 }
});
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
test('stale measurements and completion cannot contaminate a replay',async()=>{
 const {s,batches}=setup();s.setConsent('accepted');s.start(run);s.stageStart(0);const replay={...run,id:id(100),totalScore:0};s.start(replay,true);s.stageStart(0);
 s.record('pickup',{runId:run.id,chain:9});s.end(run);s.finishStage(0,{score:0,qualified:true});s.end(replay);await s.flush();
 const stage=batches.find(e=>e.type==='stage_end');assert.equal(stage.payload.pickups,0);
 const ending=batches.find(e=>e.type==='run_end');assert.equal(ending.runId,replay.id);assert.equal(ending.payload.totalScore,0);
});

test('consenting Endless tracks late stages, one accepted choice per clear and banked/failed/exit outcomes',async()=>{
 const {validatePlaytestBatch}=await import('../supabase/functions/_shared/playtest.js');
 for(const outcome of ['banked','failed','exit']){
  const {s,batches}=setup();s.setConsent('accepted');const r={...run,mode:'endless'};s.start(r);s.input('touch');
  for(let i=0;i<7;i++){s.stageStart(i);s.record('tick',{activeMs:60000,bassMs:0,chargeMs:0});s.finishStage(i,{score:0,qualified:true});
   const next={...r,stageIndex:i+1,perks:i<4?['boots','noodle','moth','bracelet'].slice(0,i+1):['boots','surfer','moth','bracelet']};
   const action=i<4?'add':i===4?'swap':'keep';const perk=i<4?next.perks.at(-1):i===4?'surfer':null;const replaced=i===4?'noodle':null;
   s.choice(next,action,perk,replaced);s.choice(next,action,perk,replaced);await s.flush();
  }
  const finished={...r,endedVoluntarily:outcome==='banked',stagesCleared:7,totalScore:0};s.end(finished,outcome==='exit'?'exit':'complete');s.end(finished);await s.flush();
  const end=batches.filter(e=>e.type==='run_end');assert.equal(end.length,1);assert.equal(end[0].payload.outcome,outcome);assert.equal(end[0].inputType,'touch');
  assert.equal(batches.filter(e=>e.type==='perk_choice').length,7);assert.ok(batches.some(e=>e.type==='stage_end'&&e.payload.stageIndex===6));
  assert.ok(batches.every(e=>e.schemaVersion===2&&validatePlaytestBatch([e]).ok));assert.ok(!JSON.stringify(batches).includes('initials'));
 }
});
test('Endless consent is non-retroactive and opt-out suppresses choices and terminal events',async()=>{
 const {s,batches}=setup();const r={...run,mode:'endless'};s.start(r);s.setConsent('accepted');s.stageStart(0);s.end(r);await s.flush();assert.equal(batches.length,0);
 s.start(r);s.stageStart(0);s.finishStage(0,{score:0,qualified:true});s.setConsent('declined');s.choice({...r,stageIndex:1,perks:['boots']},'add','boots');s.end({...r,endedVoluntarily:true});await s.flush();assert.equal(batches.length,0);
 s.input('touch');assert.equal(s.inputType(),'touch');
});

test('Endless stage telemetry carries layout identity while legacy payloads remain valid',async()=>{
 const {validatePlaytestBatch}=await import('../supabase/functions/_shared/playtest.js');
 const {s,batches}=setup();s.setConsent('accepted');s.start({...run,mode:'endless'});
 for(let i=0;i<4;i++){s.stageStart(i,i<3?'original':'forest-creekside');s.finishStage(i,{score:0,qualified:true});await s.flush();}
 const stage=batches.find(e=>e.type==='stage_end'&&e.payload.stageIndex===3);assert.equal(stage.payload.variationId,'forest-creekside');assert.ok(validatePlaytestBatch([stage]).ok);
 const old=structuredClone(stage);delete old.payload.variationId;assert.ok(validatePlaytestBatch([old]).ok);
 for(const variationId of ['unknown','neon-stereo','original'])assert.equal(validatePlaytestBatch([{...stage,payload:{...stage.payload,variationId}}]).ok,false);
});

test('recovered sessions never impute missing stage measurements or duplicate a start, even when consent changes',async()=>{
 const {s,batches}=setup();s.setConsent('accepted');s.start(run);s.stageStart(0);await s.flush();const before=batches.length;
 s.recover();s.input('touch');s.record('pickup',{runId:run.id,chain:3});s.stageStart(1);s.finishStage(1,{score:50,qualified:true});s.end(run);s.menu('instructions','forest-freakout');s.setConsent('declined');s.setConsent('accepted');await s.flush();assert.equal(batches.length,before);
 s.start({...run,id:id(101)});s.stageStart(0);await s.flush();assert.equal(batches.filter(e=>e.type==='run_start').length,2);
});
