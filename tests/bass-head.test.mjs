import test from 'node:test';
import assert from 'node:assert/strict';
import {createRound,collect} from '../src/game.js';
import {createRun,startStage,finishStage,chooseUpgrade,upgradeChoices} from '../src/run.js';
import {advanceBass,activateBass,bassMovementFactor} from '../src/bass-head.js';
test('exposure builds over six seconds and cools over three while charge is retained',()=>{
 const r=createRound();advanceBass(r,3000,true);assert.equal(r.bass.chargeMs,3000);assert.ok(Math.abs(bassMovementFactor(r.bass,.2)-.55)<1e-9);
 advanceBass(r,3000,true);assert.equal(bassMovementFactor(r.bass,.2),.2);
 advanceBass(r,1500,false);assert.equal(bassMovementFactor(r.bass,1),1);assert.equal(r.bass.exposureMs,3000);assert.equal(r.bass.chargeMs,6000);
 advanceBass(r,1500,false);assert.equal(r.bass.exposureMs,0);
});
test('one charge buys six seconds with no recharging during activation',()=>{
 const r=createRound();assert.equal(activateBass(r),false);advanceBass(r,12000,true);assert.equal(r.bass.chargeMs,10000);
 assert.equal(activateBass(r),true);assert.equal(activateBass(r),false);assert.equal(bassMovementFactor(r.bass,.2),1);
 advanceBass(r,6000,true);assert.equal(r.bass.activeMs,0);assert.equal(r.bass.chargeMs,0);
 advanceBass(r,1000,true);assert.equal(r.bass.chargeMs,1000);
 r.ended=true;assert.equal(activateBass(r),false);const old={...r.bass};advanceBass(r,1000,true);assert.deepEqual(r.bass,old);
});
test('bass points require active ability and both locations in bass; pickup count stays single',()=>{
 const r=createRound();r.bass.chargeMs=10000;activateBass(r);r.remainingMs=45000;r.chain=4;
 assert.equal(collect(r,{playerInBass:true,sparkInBass:true}).points,80);assert.equal(r.pickups,1);
 assert.equal(collect(r,{playerInBass:false,sparkInBass:true}).points,40);
 assert.equal(collect(r,{playerInBass:true,sparkInBass:false}).points,40);
 r.bass.activeMs=0;assert.equal(collect(r,{playerInBass:true,sparkInBass:true}).points,40);
});
test('charge carries to next stage, exposure and active effect do not; perks list is complete',()=>{
 const run=createRun('festival','a');startStage(run);const r=createRound();r.bass.chargeMs=7500;r.pickups=20;r.ended=true;r.remainingMs=0;
 finishStage(run,r);assert.deepEqual(upgradeChoices(run),['boots','noodle','moth','bracelet','surfer','battery','encore','sweet']);assert.equal(chooseUpgrade(run,'basshead'),false);chooseUpgrade(run,'boots');
 assert.equal(startStage(run).bassChargeMs,7500);assert.equal(startStage(createRun('festival','b')).bassChargeMs,0);
});
