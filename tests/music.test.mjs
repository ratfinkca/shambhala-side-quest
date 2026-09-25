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
