import test from 'node:test';import assert from 'node:assert/strict';
import {rulesFor,createRun,startStage,upgradeChoices} from '../src/run.js';
import {createRound,advanceRound} from '../src/game.js';
import {awardClosePass} from '../src/festival.js';
import {advanceBass,activateBass} from '../src/bass-head.js';
import {activateFlow} from '../src/flow.js';
import {collectMystery} from '../src/mystery.js';
import {availablePerks,normalizeProgress,awardStage} from '../src/progression.js';
test('new perks unlock at XP milestones even for legacy players and reset every run',()=>{
 for(const [id,xp] of [['surfer',300],['battery',650],['encore',1200],['sweet',2000]]){
  for(const legacyWardrobe of [false,true]){
   assert.ok(!availablePerks(normalizeProgress({xp:xp-1,legacyWardrobe})).includes(id));
   assert.ok(availablePerks(normalizeProgress({xp,legacyWardrobe})).includes(id));
  }
  for(const legacyWardrobe of [false,true]){const old=normalizeProgress({xp:xp-20,legacyWardrobe});assert.ok(awardStage(old,{id}).rewards.includes(`perk:${id}`));}
 }
 const run=createRun('festival','new');assert.deepEqual(run.perks,[]);assert.equal(startStage(run).rules.surferDurationMs,0);
});
test('Crowd Surfer refreshes without stacking and expires on active round time',()=>{
 const round=createRound(rulesFor(['surfer']));awardClosePass(round);assert.equal(round.surferMs,1200);
 advanceRound(round,600);awardClosePass(round);assert.equal(round.surferMs,1200);
 advanceRound(round,1199);assert.equal(round.surferMs,1);advanceRound(round,1);assert.equal(round.surferMs,0);
 round.ended=true;awardClosePass(round);assert.equal(round.surferMs,0);
});
test('Bass Battery charges faster, respects cap and does not charge while active',()=>{
 const r=createRound(rulesFor(['battery']));advanceBass(r,6000,true);assert.equal(r.bass.chargeMs,9000);
 advanceBass(r,1000,true);assert.equal(r.bass.chargeMs,10000);activateBass(r);
 advanceBass(r,6000,true);assert.equal(r.bass.chargeMs,0);
 advanceBass(r,1000,true);assert.equal(r.bass.chargeMs,1500);
});
test('Encore extends only the first collected Flow each stage and stacks with Moth',()=>{
 const r=createRound(rulesFor(['encore','moth']));r.remainingMs=25000;
 assert.equal(activateFlow(r),true);assert.equal(r.flowMs,10000);
 const second=createRound(rulesFor(['encore']));second.remainingMs=51000;activateFlow(second);assert.equal(second.flowMs,8000);
 second.remainingMs=25000;activateFlow(second);assert.equal(second.flowMs,5000);
});
test('Sweet Tooth extends all candy effects and ends cleanly',()=>{
 for(const rng of [()=>0,()=>.4,()=>.9]){
  const r=createRound(rulesFor(['sweet']));r.mystery.phase='available';collectMystery(r,rng);assert.equal(r.mystery.effectMs,7000);
  advanceRound(r,6999);assert.ok(r.mystery.effect);advanceRound(r,1);assert.equal(r.mystery.effect,null);
 }
});

test('all four new perk cards render themed art without missing assets',async()=>{
 const {renderPerks}=await import('../src/theme-screens.js');
 for(const theme of ['forest-freakout','moonlit-mycelium','neon-field-trip']){
  const html=renderPerks(['surfer','battery','encore','sweet'],theme);
  assert.equal((html.match(/<svg /g)||[]).length,4);assert.doesNotMatch(html,/undefined/);
 }
});
