import test from 'node:test';
import assert from 'node:assert/strict';
import {createRun,startStage,finishStage,chooseUpgrade,upgradeChoices,rulesFor} from '../src/run.js';
import {STAGES} from '../src/stages.js';
import {createRound,advanceRound,collect} from '../src/game.js';
import {activateFlow} from '../src/flow.js';
import {awardClosePass} from '../src/festival.js';
const completed=(pickups,score=100)=>({...createRound(),ended:true,remainingMs:0,pickups,score});
test('stage thresholds, populations and exactly-once transition guards',()=>{
 assert.deepEqual(STAGES.map(s=>s.target),[20,25,30]);assert.deepEqual(STAGES.map(s=>s.crowdAnchors.length),[10,14,18]);
 const run=createRun('festival','one');assert.ok(startStage(run));assert.equal(startStage(run),null);
 assert.equal(finishStage(run,{...completed(20),ended:false,remainingMs:1}),null);
 assert.ok(finishStage(run,completed(20)).qualified);assert.equal(run.totalScore,100);assert.equal(finishStage(run,completed(20)),null);
 assert.equal(chooseUpgrade(run,'bad'),false);assert.equal(chooseUpgrade(run,'moth'),true);assert.equal(chooseUpgrade(run,'boots'),false);
 assert.equal(run.stageIndex,1);assert.equal(upgradeChoices(run).length,3);assert.ok(!upgradeChoices(run).includes('moth'));
 startStage(run);finishStage(run,completed(25));chooseUpgrade(run,upgradeChoices(run)[0]);startStage(run);finishStage(run,completed(30));
 assert.equal(run.status,'ended');assert.equal(run.stagesCleared,3);assert.equal(run.totalScore,300);
});
test('failed stage contributes score but ends the run; rush always ends',()=>{
 const run=createRun('festival','fail');startStage(run);assert.equal(finishStage(run,completed(19)).qualified,false);assert.equal(run.status,'ended');assert.equal(run.totalScore,100);
 const rush=createRun('rush','rush');assert.deepEqual(startStage(rush).rules,rulesFor([]));finishStage(rush,completed(0));assert.equal(rush.status,'ended');
 assert.deepEqual(createRun('festival','new').perks,[]);
});
test('upgrades alter only their configured rules, respect drops and expire exactly',()=>{
 assert.deepEqual(rulesFor([]),{comboGraceMs:2000,flowDurationMs:5000,closePassPoints:15,bumpShields:0});
 const r=createRound(rulesFor(['bracelet','moth','boots','noodle']));collect(r);advanceRound(r,3000);assert.equal(r.chain,1);advanceRound(r,1);assert.equal(r.chain,0);
 advanceRound(r,4999);activateFlow(r);assert.equal(r.flowMs,7000);assert.equal(r.shieldsRemaining,1);
 advanceRound(r,7000);assert.equal(r.flowMs,0);assert.equal(awardClosePass(r),50);
});
