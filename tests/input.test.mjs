import test from 'node:test';
import assert from 'node:assert/strict';
import { preventGameKeyDefault } from '../src/input.js';

test('Space retains normal activation for focused buttons during play', () => {
  assert.equal(preventGameKeyDefault(' ', true, false), false);
});
test('arrow scroll is blocked only while playing with arena focus', () => {
  assert.equal(preventGameKeyDefault('ArrowDown', true, true), true);
  assert.equal(preventGameKeyDefault('ArrowDown', false, true), false);
  assert.equal(preventGameKeyDefault('ArrowDown', true, false), false);
});
