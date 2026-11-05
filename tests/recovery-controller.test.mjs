import test from 'node:test';import assert from 'node:assert/strict';import {createRecoveryController} from '../src/recovery-controller.js';import {makeRecovery} from '../src/recovery.js';import {recoveryFixture} from './helpers/recovery-fixtures.mjs';
test('checkpoint cadence, transition forcing and ownership invalidation protect the authoritative save',()=>{
 let now=1000,writes=0,state;const owner={held:true,supported:true,release(){this.held=false}},storage={saveRecovery(){writes++;return {persisted:true}}};
 const c=createRecoveryController({owner,storage,capture:()=>makeRecovery(recoveryFixture()),clock:()=>now,onStatus:s=>state=s});
 assert.equal(c.save(),true);now=1500;assert.equal(c.save(),false);assert.equal(writes,1);assert.equal(c.save(true),true);const ticket=c.token();c.release();assert.equal(c.valid(ticket),false);assert.equal(c.save(true),false);assert.equal(writes,2);
 owner.held=true;now=2000;assert.equal(c.save(),true);assert.equal(state,'saved');
});
test('invalid/quota saves are visible while absent snapshots do not overwrite a prior checkpoint',()=>{
 let snapshot;let message,writes=0;const c=createRecoveryController({owner:{held:true,supported:true},storage:{saveRecovery(){writes++;return {persisted:false}}},capture:()=>snapshot,onStatus:s=>message=s});
 assert.equal(c.save(true),false);assert.equal(writes,0);snapshot={version:99};assert.equal(c.save(true),false);assert.equal(message,'unavailable');snapshot=makeRecovery(recoveryFixture());assert.equal(c.save(true),false);assert.equal(writes,1);assert.equal(message,'unavailable');
});
