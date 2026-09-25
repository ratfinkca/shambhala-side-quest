import test from 'node:test';
import assert from 'node:assert/strict';
import { cycleAt, createEncounter, updateEncounter, awardClosePass, crowdPosition } from '../src/festival.js';
import { createRound, advanceRound, collect } from '../src/game.js';

test('builds before each drop and doubles points only during its four-second window', () => {
  for (const [elapsed, phase, bonus] of [[0,'cruise',1],[11999,'cruise',1],[12000,'build',1],[14999,'build',1],[15000,'drop',2],[18999,'drop',2],[19000,'cruise',1],[27000,'build',1],[30000,'drop',2],[45000,'drop',2],[60000,'ended',1]]) {
    assert.equal(cycleAt(elapsed).phase, phase);
    assert.equal(cycleAt(elapsed).bonus, bonus);
  }
});
test('drop bonus multiplies pickup score and ends cleanly', () => {
  const round = createRound();
  advanceRound(round, 15000);
  assert.equal(collect(round).points, 20);
  advanceRound(round, 4000);
  assert.equal(collect(round).points, 10);
});
test('clean moving pass awards once upon leaving the near zone', () => {
  const encounter = createEncounter();
  const dancer = {x:100,y:100};
  assert.equal(updateEncounter(encounter,{x:40,y:140},dancer,0).closePass,false);
  assert.equal(updateEncounter(encounter,{x:80,y:140},dancer,100).closePass,false);
  assert.equal(updateEncounter(encounter,{x:120,y:140},dancer,200).closePass,false);
  assert.equal(updateEncounter(encounter,{x:160,y:140},dancer,300).closePass,true);
  assert.equal(updateEncounter(encounter,{x:180,y:140},dancer,400).closePass,false);
  updateEncounter(encounter,{x:120,y:140},dancer,500);
  assert.equal(updateEncounter(encounter,{x:40,y:140},dancer,600).closePass,false);
});
test('a collision cancels the pass even if the player subsequently exits cleanly', () => {
  const encounter = createEncounter(), dancer = {x:100,y:100};
  updateEncounter(encounter,{x:40,y:100},dancer,0);
  assert.equal(updateEncounter(encounter,{x:85,y:100},dancer,100).bumped,true);
  assert.equal(updateEncounter(encounter,{x:160,y:100},dancer,200).closePass,false);
});
test('standing still cannot farm bonuses from dancers moving past', () => {
  const encounter = createEncounter(), player = {x:100,y:100};
  updateEncounter(encounter,player,{x:40,y:140},0);
  updateEncounter(encounter,player,{x:100,y:140},100);
  assert.equal(updateEncounter(encounter,player,{x:160,y:140},200).closePass,false);
});
test('close-pass points respect drops and never change pickup chains', () => {
  const round=createRound();
  assert.equal(awardClosePass(round),15);
  assert.equal(round.closePasses,1);
  assert.equal(round.chain,0);
  assert.equal(round.pickups,0);
  advanceRound(round,15000);
  assert.equal(awardClosePass(round),30);
  advanceRound(round,45000);
  assert.equal(awardClosePass(round),0);
});
test('crowd movement is continuous at phase boundaries and remains inside the arena', () => {
  for(let i=0;i<10;i++) {
    for(let ms=0;ms<=60000;ms+=100) {
      const p=crowdPosition(i,ms);
      assert.ok(p.x>=140&&p.x<=820&&p.y>=190&&p.y<=560);
    }
    const a=crowdPosition(i,14999), b=crowdPosition(i,15000);
    assert.ok(Math.hypot(a.x-b.x,a.y-b.y)<1);
  }
});
test('bump slowdown expires without taking points or a pickup chain', () => {
  const round=createRound();
  collect(round);
  round.slowedMs=600;
  advanceRound(round,599);
  assert.equal(round.slowedMs,1);
  assert.equal(round.score,10);
  assert.equal(round.chain,1);
  advanceRound(round,1);
  assert.equal(round.slowedMs,0);
  const fresh=createRound();
  assert.equal(fresh.slowedMs,0);
  assert.equal(fresh.closePasses,0);
});
