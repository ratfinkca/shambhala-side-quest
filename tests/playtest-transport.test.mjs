import test from 'node:test';import assert from 'node:assert/strict';
import {createPlaytestTransport} from '../src/playtest/transport.js';
import {readOnlineConfig} from '../src/online/config.js';
const id=n=>`00000000-0000-4000-8000-${String(n).padStart(12,'0')}`;
export const event=(n=1)=>({schemaVersion:1,eventId:id(n),installationId:id(0),sessionId:id(0),runId:null,type:'menu',mode:null,buildId:'dev',scoringVersion:'arcade-v1',theme:'forest-freakout',viewport:'small',inputType:'unknown',payload:{action:'instructions'}});
test('configuration stays off without endpoint AND notice, rejects insecure production endpoints',()=>{
 assert.equal(readOnlineConfig({}).enabled,false);assert.equal(readOnlineConfig({VITE_PLAYTEST_URL:'https://example.com'}).enabled,false);
 assert.equal(readOnlineConfig({VITE_PLAYTEST_URL:'http://example.com',VITE_PLAYTEST_NOTICE_URL:'https://example.com/privacy'}).enabled,false);
 assert.equal(readOnlineConfig({VITE_PLAYTEST_URL:'https://example.com',VITE_PLAYTEST_NOTICE_URL:'https://example.com/privacy',VITE_PLAYTEST_ENABLED:'true'}).enabled,true);
});
test('off consent queues and sends nothing; bounded batches discard oldest',async()=>{
 let on=false;const batches=[];const t=createPlaytestTransport({consent:()=>on,send:async es=>{batches.push(es);return true}});
 t.enqueue(event());await t.flush();assert.equal(batches.length,0);on=true;
 for(let n=1;n<=105;n++)t.enqueue(event(n));await t.flush();assert.equal(batches[0].length,20);assert.equal(batches[0][0].eventId,id(6));assert.equal(t.size(),80);
});
test('failures retry once on a later flush and revoke kills queued/pending retry',async()=>{
 let on=true,attempts=0;const t=createPlaytestTransport({consent:()=>on,send:async()=>{attempts++;return false}});
 t.enqueue(event());await t.flush();assert.equal(t.size(),1);await t.flush();assert.equal(t.size(),0);assert.equal(attempts,2);
 let resolve;const pending=createPlaytestTransport({consent:()=>on,send:()=>new Promise(r=>resolve=r)});
 pending.enqueue(event());const work=pending.flush();on=false;pending.stop();resolve(false);await work;assert.equal(pending.size(),0);
});
test('malformed event is rejected and concurrent flush does not duplicate batch',async()=>{
 let resolve,calls=0;const t=createPlaytestTransport({consent:()=>true,send:()=>{calls++;return new Promise(r=>resolve=r)}});
 assert.equal(t.enqueue({...event(),initials:'AAA'}),false);t.enqueue(event());const a=t.flush();await t.flush();assert.equal(calls,1);resolve(true);await a;assert.equal(t.size(),0);
});
