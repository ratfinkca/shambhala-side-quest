import test from 'node:test';
import assert from 'node:assert/strict';
import { fitGameWidth } from '../src/layout.js';

test('arena respects available height as well as width', () => {
  assert.equal(fitGameWidth(1000, 500, 100), 599);
  assert.equal(fitGameWidth(360, 600, 100), 360);
  assert.ok(fitGameWidth(800, 220, 80) < 210);
});
