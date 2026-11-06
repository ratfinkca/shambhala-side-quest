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

test('an invalid recovery state cannot suppress earned XP or local score saving at a commit boundary',()=>{
 let progress=0,score=0,cleared=false;const storage={commitStage(stage,value){assert.equal(value,null);progress+=stage.pickups;return {persisted:true,xp:40}},commitScore(mode,entry,value){assert.equal(value,null);score=entry.score;return {accepted:true,persisted:true}}};
 const c=createRecoveryController({owner:{held:true,supported:true},storage,capture:()=>({version:99}),onStatus:s=>cleared=s==='unavailable'});
 assert.equal(c.commitStage({pickups:10}).xp,40);assert.equal(progress,10);assert.equal(c.commitScore('endless',{score:30}).accepted,true);assert.equal(score,30);assert.equal(cleared,true);
});
