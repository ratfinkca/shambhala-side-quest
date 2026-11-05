import test from 'node:test';import assert from 'node:assert/strict';import {createRecoveryOwner} from '../src/recovery-owner.js';
function lockService(){const busy=new Set();return {async request(name,opts,cb){if(busy.has(name))return cb(null);busy.add(name);try{return await cb({name})}finally{busy.delete(name)}}}}
test('second profile owner cannot acquire until release, and delayed callbacks cannot resurrect a released owner',async()=>{
 const locks=lockService(),a=createRecoveryOwner({locks,name:'profile'}),b=createRecoveryOwner({locks,name:'profile'});assert.equal(await a.acquire(),'owned');assert.equal(await b.acquire(),'busy');a.release();await new Promise(r=>setImmediate(r));assert.equal(await b.acquire(),'owned');assert.equal(a.held,false);b.release();
 let deliver;const delayed=createRecoveryOwner({locks:{request:(name,opt,cb)=>new Promise(r=>deliver=()=>Promise.resolve(cb({name})).then(r))},name:'late'});const pending=delayed.acquire();await Promise.resolve();delayed.release();deliver();assert.notEqual(await pending,'owned');assert.equal(delayed.held,false);
});
test('missing or failed browser locks visibly falls back to unsupported without falsely owning recovery',async()=>{
 for(const locks of [null,{request:async()=>{throw Error('denied')}}]){const o=createRecoveryOwner({locks,name:'profile'});assert.equal(await o.acquire(),'unsupported');assert.equal(o.held,false);assert.equal(o.supported,false);}
});
