import test from 'node:test';
import assert from 'node:assert/strict';
import { createStorage } from '../src/storage.js';
const memory = (initial={}) => { const data = new Map(Object.entries(initial)); return {getItem:k=>data.get(k),setItem:(k,v)=>data.set(k,v)}; };
const entry = (id,score=100,stagesCleared=1,completedAt=1000) => ({id,score,stagesCleared,completedAt,initials:'AAA',outfit:{onesie:'lime',hat:'bucket',totem:'none'}});
test('new profile defaults sound on, migrates explicit mute and historical best',()=>{
  assert.deepEqual(createStorage(memory()).profile.audio,{enabled:true,music:.45,effects:.65});
  const s=createStorage(memory({'sidequest.sound':'false','sidequest.best':'123'}));
  assert.equal(s.sound,false);assert.equal(s.best,123);assert.deepEqual(s.profile.boards.rush,[]);
});
test('malformed profile safely defaults and normalizes saved fields',()=>{
  assert.equal(createStorage(memory({'sidequest.profile.v1':'{'})).profile.version,1);
  const s=createStorage(memory({'sidequest.profile.v1':JSON.stringify({version:1,audio:{music:3,effects:-1},outfit:{hat:'bad'}})}));
  assert.equal(s.profile.audio.music,1);assert.equal(s.profile.audio.effects,0);assert.equal(s.profile.outfit.hat,'bucket');
});
test('boards validate, rank, bound and deduplicate entries',()=>{
  const s=createStorage(memory());
  for(let i=0;i<12;i++) s.submitScore('festival',entry(String(i),i));
  assert.equal(s.profile.boards.festival.length,10);assert.equal(s.profile.boards.festival[0].score,11);
  assert.equal(s.submitScore('festival',entry('11',900)).accepted,false);
  assert.equal(s.submitScore('festival',entry('bad',Infinity)).accepted,false);
  assert.equal(s.submitScore('rush',entry('bad',-1)).accepted,false);
  s.submitScore('rush',entry('a',100,1,100));s.submitScore('rush',entry('b',100,2,200));s.submitScore('rush',entry('c',100,2,50));
  assert.deepEqual(s.profile.boards.rush.map(e=>e.id),['c','b','a']);
});
test('storage failure keeps session scores and returns a clear persistence result',()=>{
  const s=createStorage({getItem(){throw Error('blocked')},setItem(){throw Error('blocked')}});
  assert.deepEqual(s.submitScore('rush',entry('one')),{accepted:true,persisted:false});
  assert.equal(s.profile.boards.rush.length,1);
  s.saveAudio({enabled:false,music:.2,effects:.7});assert.equal(s.sound,false);
  const copy=s.profile;copy.boards.rush.length=0;assert.equal(s.profile.boards.rush.length,1);
});
