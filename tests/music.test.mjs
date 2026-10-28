import test from 'node:test';
import assert from 'node:assert/strict';
import { beatVoices } from '../src/music.js';

test('drop adds bass weight while combo unlocks a melodic layer', () => {
  const cruise=beatVoices(0,'cruise',1), drop=beatVoices(0,'drop',1), flow=beatVoices(0,'drop',3);
  assert.ok(cruise.some(v=>v.kind==='kick'));
  assert.ok(drop.find(v=>v.kind==='bass').volume>cruise.find(v=>v.kind==='bass').volume);
  assert.ok(!cruise.some(v=>v.kind==='melody'));
  assert.ok(flow.some(v=>v.kind==='melody'));
});
test('build includes rising notes and ended rounds are silent', () => {
  assert.ok(beatVoices(49,'build',1).some(v=>v.kind==='build'));
  assert.deepEqual(beatVoices(240,'ended',5),[]);
});

test('Flow State adds its own musical layer and stops when inactive', () => {
  assert.ok(beatVoices(1, 'cruise', 1, true).some(v => v.kind === 'flow'));
  assert.ok(!beatVoices(1, 'cruise', 1, false).some(v => v.kind === 'flow'));
  assert.deepEqual(beatVoices(240, 'ended', 5, true), []);
});

import {forestVoices} from '../src/music.js';
import {concertLighting} from '../src/concert-lighting.js';
test('forest arrangement supplies chords and percussion independently of score',()=>{
 const phrase=Array.from({length:32},(_,i)=>forestVoices(i,'cruise',1)).flat();
 for(const kind of ['kick','bass','hat','snare','wood','pad','melody'])assert.ok(phrase.some(v=>v.kind===kind),kind);
 assert.ok(phrase.filter(v=>v.kind==='hat'||v.kind==='snare').every(v=>v.noise));
 assert.deepEqual(forestVoices(0,'ended',5,true),[]);
 assert.ok(forestVoices(1,'drop',1).find(v=>v.kind==='bass').volume>forestVoices(1,'cruise',1).find(v=>v.kind==='bass').volume);
});
test('concert lighting is bounded and static under reduced motion across a full run',()=>{
 const fixed=concertLighting(0,true);
 for(let ms=0;ms<=60000;ms+=50){
  assert.deepEqual(concertLighting(ms,true),fixed);
  const light=concertLighting(ms);
  assert.ok(light.alpha>=0&&light.alpha<=.1);
  assert.ok(Number.isFinite(light.sweep));
 }
 assert.ok(concertLighting(16000).spread>concertLighting(1000).spread);
});
