import test from 'node:test';import assert from 'node:assert/strict';
import {createPlaytestHandler} from '../supabase/functions/_shared/http.js';
const id='00000000-0000-4000-8000-000000000001';
const event={schemaVersion:1,eventId:id,installationId:id,sessionId:id,runId:null,type:'menu',mode:null,buildId:'dev',scoringVersion:'arcade-v1',theme:'forest-freakout',viewport:'small',inputType:'unknown',payload:{action:'instructions'}};
const req=(body=[event],origin='https://game.example')=>new Request('https://api.example',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json','x-forwarded-for':'192.0.2.1'},body:JSON.stringify(body)});
test('endpoint rejects origins, methods, malformed and oversized bodies before storage',async()=>{
 let calls=0;const h=createPlaytestHandler({origins:['https://game.example'],secret:'test-secret',ingest:async()=>{calls++;return {accepted:[id]}}});
 assert.equal((await h(req([], 'https://evil.example'))).status,403);
 assert.equal((await h(new Request('https://api.example',{headers:{Origin:'https://game.example'}}))).status,405);
 assert.equal((await h(req([{...event,initials:'AAA'}]))).status,400);
 assert.equal((await h(req('x'.repeat(33000)))).status,413);assert.equal(calls,0);
 const response=await h(req());assert.equal(response.status,200);assert.deepEqual(await response.json(),{accepted:[id]});assert.equal(calls,1);
});
test('storage receives a daily keyed network hash, no IP; limits and storage errors are generic',async()=>{
 let bucket;const h=createPlaytestHandler({origins:['https://game.example'],secret:'test-secret',ingest:async(_events,key)=>{bucket=key;return {limited:true}}});
 assert.equal((await h(req())).status,429);assert.match(bucket,/^[0-9a-f]{64}$/);assert.ok(!bucket.includes('192.0.2.1'));
 const broken=createPlaytestHandler({origins:['https://game.example'],secret:'test-secret',ingest:async()=>{throw Error('private secret')}});
 const response=await broken(req());assert.equal(response.status,503);assert.doesNotMatch(await response.text(),/private secret/);
});
