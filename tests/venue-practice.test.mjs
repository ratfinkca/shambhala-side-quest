import test from 'node:test';import assert from 'node:assert/strict';
import {venuePracticeRequested,startEdition} from '../src/editions/registry.js';import {venuePracticeConfig} from '../src/venue-practice.js';import {createClockPractice,createPracticeEngine} from '../src/clock-practice.js';
test('venue preview is only DEV SMF rehearsal, including forced options',async()=>{
 for(const DEV of [true,false])for(const VITE_EDITION of ['generic','smf'])for(const search of ['','?venues','?rehearsal','?rehearsal&venues'])assert.equal(venuePracticeRequested({DEV,VITE_EDITION},search),DEV&&VITE_EDITION==='smf'&&search==='?rehearsal&venues');
 for(const [env,expected]of [[{DEV:false,VITE_EDITION:'smf'},'scaffold'],[{DEV:true,VITE_EDITION:'generic'},'game'],[{DEV:true,VITE_EDITION:'smf'},'venues']]){const calls=[];await startEdition(env,Object.fromEntries(['venues','clock','scaffold','game'].map(key=>[key,()=>calls.push(key)])),{venuePractice:true});assert.deepEqual(calls,[expected]);}
});
test('six venues share one disposable engine and each starts its own round',()=>{
 const fetch=globalThis.fetch,storage=Object.getOwnPropertyDescriptor(globalThis,'localStorage');
 globalThis.fetch=()=>{throw Error('unexpected network')};
 Object.defineProperty(globalThis,'localStorage',{configurable:true,get(){throw Error('unexpected persistence')}});
 try{
  const config=venuePracticeConfig();
  const expected=[['smf-living-room',68571,23],['smf-fractal',64000,24],['smf-grove',58182,24],['smf-amp',54857,24],['smf-pagoda',60000,28],['smf-village',66977,34]];
  assert.deepEqual(config.choices.map(c=>c.id),expected.map(([id])=>id));
  let created=0,paused=0;
  const started=[];
  const pool=createPracticeEngine(()=>{created++;return {start:c=>started.push(c),pause:()=>paused++,resume(){},destroy(){}}});
  const lab=createClockPractice({createSession:pool.createSession,...config});
  assert.equal(lab.stage.id,'smf-living-room');
  lab.start();
  for(let repeat=0;repeat<3;repeat++)for(const [id,duration,target] of expected){
   lab.select(id);
   assert.equal(lab.timing.durationMs,duration);
   const last=started.at(-1);
   assert.equal(last.stage.id,id);
   assert.equal(last.stage.target,target);
   assert.equal(last.timingId,id+'-clock-preview-1');
  }
  assert.equal(created,1);
  assert.equal(started.length,19);
  assert.ok(paused>=18);
  assert.throws(()=>lab.select('smf-secret-garden'));
  lab.destroy();
  pool.destroy();
 }finally{
  globalThis.fetch=fetch;
  if(storage)Object.defineProperty(globalThis,'localStorage',storage);
  else delete globalThis.localStorage;
 }
});
