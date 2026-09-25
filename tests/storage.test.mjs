import test from 'node:test';
import assert from 'node:assert/strict';
import { createStorage } from '../src/storage.js';

test('blocked storage preserves in-memory best and preference', () => {
  const denied = { getItem() { throw new Error('denied'); }, setItem() { throw new Error('denied'); } };
  const saved = createStorage(denied);
  assert.equal(saved.best, 0);
  saved.saveBest(120); saved.saveBest(90); saved.saveSound(true);
  assert.equal(saved.best, 120); assert.equal(saved.sound, true);
});
test('malformed persisted scores fall back to zero', () => {
  for (const value of ['NaN', 'Infinity', '-20', 'oops']) {
    const saved = createStorage({ getItem() { return value; }, setItem() {} });
    assert.equal(saved.best, 0);
  }
});
test('best and sound survive a new session', () => {
  const data = new Map();
  const storage = { getItem: key => data.get(key), setItem: (key, value) => data.set(key, value) };
  const first = createStorage(storage); first.saveBest(450); first.saveSound(true);
  const second = createStorage(storage);
  assert.equal(second.best, 450); assert.equal(second.sound, true);
});
