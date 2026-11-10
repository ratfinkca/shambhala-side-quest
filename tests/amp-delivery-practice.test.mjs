import test from 'node:test';
import assert from 'node:assert/strict';
import {createDeliveryPractice} from '../src/amp-delivery-practice.js';
import {backstagePracticeRequested,startEdition} from '../src/editions/registry.js';

test('AMP backstage can only enter through explicit DEV SMF rehearsal',async()=>{
 for(const DEV of [true,false])for(const VITE_EDITION of ['generic','smf'])for(const search of ['', '?backstage=amp','?rehearsal&backstage=village','?rehearsal&backstage=amp']){
  assert.equal(backstagePracticeRequested({DEV,VITE_EDITION},search),DEV&&VITE_EDITION==='smf'&&search==='?rehearsal&backstage=amp');
 }
 for(const [env,expected] of [[{DEV:false,VITE_EDITION:'smf'},'scaffold'],[{DEV:true,VITE_EDITION:'generic'},'game'],[{DEV:true,VITE_EDITION:'smf'},'backstage']]){
  const calls=[];await startEdition(env,Object.fromEntries(['backstage','venues','clock','game','scaffold'].map(key=>[key,()=>calls.push(key)])),{backstagePractice:true});
  assert.deepEqual(calls,[expected]);
 }
});

const pickup={atVendor:true,encounters:[]};
const pass=id=>({atVendor:false,encounters:[{id,bumped:false,closePass:true,active:false}]});
test('ready, pause and timeout cannot deliver; completed work survives pause, fresh clears it',()=>{
 const practice=createDeliveryPractice({recipientIds:['a','b','c']});
 assert.equal(practice.status,'ready');assert.equal(practice.step(pickup),null);
 practice.start();assert.equal(practice.step(pickup).type,'pickup');
 practice.step(pass('a'));assert.equal(practice.state.delivered,1);
 practice.step(pickup);practice.pause();const before=JSON.stringify(practice.state);
 assert.equal(practice.step(pass('b')),null);assert.equal(JSON.stringify(practice.state),before);
 practice.resume();assert.equal(practice.step(pass('b')).type,'delivered');
 practice.finish();assert.equal(practice.status,'ended');assert.equal(practice.state.complete,false);
 practice.resume();practice.step(pickup);practice.step(pass('c'));assert.equal(practice.state.delivered,2);
 practice.start();assert.equal(practice.status,'playing');assert.equal(practice.state.delivered,0);assert.equal(practice.state.carrying,false);
});
test('only three correct deliveries finish the preview and award once, without accessing persistence or network',()=>{
 const fetch=globalThis.fetch,storage=Object.getOwnPropertyDescriptor(globalThis,'localStorage');
 globalThis.fetch=()=>{throw new Error('Preview attempted network')};
 Object.defineProperty(globalThis,'localStorage',{configurable:true,get(){throw new Error('Preview attempted persistence')}});
 try{
  const practice=createDeliveryPractice({recipientIds:['a','b','c']});practice.start();
  for(const id of ['a','b','c']){practice.step(pickup);practice.step(pass(id));}
  assert.equal(practice.status,'complete');assert.equal(practice.state.complete,true);assert.equal(practice.state.delivered,3);
  const snapshot=JSON.stringify(practice.state);practice.pause();practice.resume();practice.finish();practice.step(pickup);
  assert.equal(practice.status,'complete');assert.equal(JSON.stringify(practice.state),snapshot);
 }finally{globalThis.fetch=fetch;if(storage)Object.defineProperty(globalThis,'localStorage',storage);else delete globalThis.localStorage;}
});
