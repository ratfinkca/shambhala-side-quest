import test from 'node:test';
import assert from 'node:assert/strict';
import { createRound, advanceRound, collect, movePlayer, moveToward } from '../src/game.js';

test('fifth consecutive pickup upgrades multiplier; cap stays at five', () => {
  const round = createRound();
  for (let i = 0; i < 5; i++) collect(round);
  assert.equal(round.score, 60);
  assert.equal(round.multiplier, 2);
  for (let i = 0; i < 50; i++) collect(round);
  assert.equal(round.multiplier, 5);
  assert.equal(round.bestMultiplier, 5);
});
test('chain survives exactly two seconds, then expires without losing score', () => {
  const round = createRound();
  collect(round);
  advanceRound(round, 2000);
  assert.equal(round.chain, 1);
  advanceRound(round, 1);
  assert.equal(round.chain, 0);
  assert.equal(round.score, 10);
});
test('expiry blocks score and never produces negative time', () => {
  const round = createRound();
  advanceRound(round, 61000);
  assert.deepEqual(collect(round), { points: 0, celebrate: false });
  assert.equal(round.remainingMs, 0);
  assert.equal(round.ended, true);
  assert.equal(round.score, 0);
});
test('celebration triggers every fifteen pickups', () => {
  const round = createRound();
  for (let i = 1; i <= 30; i++) assert.equal(collect(round).celebrate, i % 15 === 0);
});
test('fresh round does not inherit previous score, timer, or combo', () => {
  const old = createRound();
  for (let i = 0; i < 8; i++) collect(old);
  advanceRound(old, 50000);
  const fresh = createRound();
  assert.equal(fresh.score, 0);
  assert.equal(fresh.multiplier, 1);
  assert.equal(fresh.remainingMs, 60000);
  assert.equal(fresh.pickups, 0);
});
test('diagonal speed equals straight speed', () => {
  const p = { x: 400, y: 300 };
  movePlayer(p, { x: 1, y: 1 }, 100, { width: 960, height: 640 });
  assert.ok(Math.abs(Math.hypot(p.x - 400, p.y - 300) - 30) < 0.001);
});
test('movement stays within radius-adjusted bounds', () => {
  const p = { x: 950, y: 630 };
  movePlayer(p, { x: 1, y: 1 }, 1000, { width: 960, height: 640 });
  assert.deepEqual(p, { x: 946, y: 626 });
});
test('a long pointer frame cannot snap farther than its capped movement distance', () => {
  const p = { x: 400, y: 300 };
  assert.equal(moveToward(p, { x: 425, y: 300 }, 100, { width: 960, height: 640 }), false);
  assert.equal(p.x, 415);
});
test('pointer reaches nearby target without overshooting', () => {
  const p = { x: 400, y: 300 };
  assert.equal(moveToward(p, { x: 407, y: 300 }, 50, { width: 960, height: 640 }), true);
  assert.equal(p.x, 407);
});
