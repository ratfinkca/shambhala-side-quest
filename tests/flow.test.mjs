import test from 'node:test';
import assert from 'node:assert/strict';
import { createRound, advanceRound } from '../src/game.js';
import { availableFlow, activateFlow, attractSpark } from '../src/flow.js';

test('rare pickups have two windows and cannot be taken twice', () => {
  const r=createRound();
  assert.equal(availableFlow(r),-1);
  advanceRound(r,8000);
  assert.equal(availableFlow(r),0);
  assert.equal(activateFlow(r),true);
  assert.equal(activateFlow(r),false);
  advanceRound(r,25000);
  assert.equal(availableFlow(r),1);
});
test('flow lasts five active seconds and resets on replay', () => {
  const r=createRound(); advanceRound(r,8000); activateFlow(r);
  advanceRound(r,4999); assert.equal(r.flowMs,1);
  advanceRound(r,1); assert.equal(r.flowMs,0);
  assert.equal(createRound().flowMs,0);
});
test('expired windows and ended rounds cannot activate flow', () => {
  const r=createRound();advanceRound(r,20000);assert.equal(activateFlow(r),false);
  advanceRound(r,40000);assert.equal(activateFlow(r),false);
});
test('magnet draws nearby sparks without overshoot and leaves distant ones alone', () => {
  const p={x:100,y:100}, near={x:150,y:100}, far={x:300,y:100};
  attractSpark(near,p,50);assert.equal(near.x,129);
  attractSpark(far,p,50);assert.equal(far.x,300);
  attractSpark(near,p,1000);assert.equal(near.x,108);
  attractSpark(near,p,50);assert.equal(near.x,100);
});
