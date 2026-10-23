import test from 'node:test';import assert from 'node:assert/strict';
import {createOnlineClient} from '../src/online/client.js';
import {createSubmission} from '../src/online/submission.js';
test('disabled config makes no request; failures and malformed responses are safe',async()=>{
 let calls=0;const fetch=async()=>{calls++;throw Error('offline')};
 assert.equal((await createOnlineClient({fetch}).startRun({})).code,'unavailable');assert.equal(calls,0);
 assert.equal((await createOnlineClient({baseUrl:'https://example.com',fetch}).startRun({})).code,'unavailable');
 const bad=createOnlineClient({baseUrl:'https://example.com',fetch:async()=>({ok:true,json:async()=>({ticket:'bad'})})});
 assert.equal((await bad.startRun({})).code,'unavailable');
});
test('submission belongs to one run and freezes payload for explicit retries',async()=>{
 const s=createSubmission('run-a');assert.equal(s.setTicket('run-b',{ticket:'a'.repeat(64)}),false);
 s.setTicket('run-a',{ticket:'a'.repeat(64)});
 let release;let calls=0;const send=async()=>{calls++;return new Promise(r=>release=r)};
 const pending=s.post({initials:'AAA'},send);await s.post({initials:'BBB'},send);assert.equal(calls,1);
 release({ok:false,code:'unavailable'});await pending;assert.equal(s.status,'error');
 await s.post({initials:'BBB'},async payload=>{assert.equal(payload.initials,'AAA');return {ok:true,data:{accepted:true}}});assert.equal(s.status,'succeeded');
});
