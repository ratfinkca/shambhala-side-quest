import test from 'node:test';import assert from 'node:assert/strict';import {practiceStorage,resetPractice,recoveryPreview} from '../src/recovery-practice.js';import {readRecovery} from '../src/recovery.js';import {createStorage} from '../src/storage.js';
test('practice reloads retain only disposable progress, and reset never removes the real profile',()=>{
 const data=new Map([['sidequest.profile.v1','real profile']]);const local={getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v),removeItem:k=>data.delete(k)};
 const a=createStorage(practiceStorage(local));a.saveRecovery(recoveryPreview('bass'));a.awardProgress({id:'demo',pickups:5});const b=createStorage(practiceStorage(local));assert.equal(b.profile.progress.xp,30);assert.equal(readRecovery(b.recovery).ok,true);assert.equal(data.get('sidequest.profile.v1'),'real profile');resetPractice(local);assert.equal(createStorage(practiceStorage(local)).recovery,null);assert.equal(data.get('sidequest.profile.v1'),'real profile');
});
test('each recovery preset is a fully valid live, decision or results snapshot',()=>{
 for(const id of ['live','bass','swap','results']){const r=recoveryPreview(id);assert.equal(readRecovery(r).ok,true,id);}
 assert.equal(recoveryPreview('unknown'),null);const bass=recoveryPreview('bass');assert.equal(bass.scene.round.bass.activeMs,3000);assert.equal(bass.scene.round.mystery.effect,'dizzy');
});
