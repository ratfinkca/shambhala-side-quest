import test from 'node:test';import assert from 'node:assert/strict';
import {makeRecovery,readRecovery,recoveryScreen} from '../src/recovery.js';
import {recoveryFixture} from './helpers/recovery-fixtures.mjs';
test('live checkpoint roundtrips stage time, points and logical objects without object aliasing',()=>{
 const source=recoveryFixture(),r=makeRecovery(source),result=readRecovery(JSON.parse(JSON.stringify(r)));
 assert.equal(result.ok,true);assert.equal(result.value.screen,'paused');assert.equal(result.value.scene.round.remainingMs,44000);assert.equal(result.value.scene.round.score,20);assert.equal(result.value.inputType,'touch');assert.equal(result.value.run.themeId,'moonlit-mycelium');
 source.scene.player.x=10;assert.equal(result.value.scene.player.x,480);assert.equal(result.value.scene.round.sincePickupMs,null);
});
test('unstarted Endless and other modes never create a checkpoint; transient screens restore safely',()=>{
 const f=recoveryFixture();f.run.status='ready';f.run.stageIndex=0;assert.equal(makeRecovery(f),null);
 assert.equal(recoveryScreen({name:'confirmExit',returnTo:'paused'}, {status:'playing'}),'paused');
 f.run.mode='rush';assert.equal(makeRecovery(f),null);
});
test('malformed versions, scores, timers, perks, positions and encounter fields are rejected independently',()=>{
 const valid=makeRecovery(recoveryFixture());
 for(const mutate of [v=>v.version=2,v=>v.run.totalScore=10,v=>v.scene.round.remainingMs=-1,v=>v.run.perks=['unknown'],v=>v.scene.player.x=NaN,v=>v.scene.sparks.pop(),v=>v.scene.round.bass.activeMs=99999,v=>v.scene.round.mystery.effect='bad',v=>v.scene.crowd[0].cooldownUntil=-2,v=>v.scene.round.score++,v=>v.scene.round.extra='arbitrary']){
  const bad=structuredClone(valid);mutate(bad);assert.equal(readRecovery(bad).ok,false);
 }
 assert.equal(readRecovery({...valid,version:2}).code,'incompatible');
});
test('a 257-stage recovery retains cumulative totals and receipt identities without shortening history',()=>{
 const r=makeRecovery(recoveryFixture(257));assert.equal(readRecovery(r).ok,true);assert.equal(r.run.scoreStages.length,257);assert.equal(r.run.stagesCleared,257);assert.equal(r.run.stageIndex,257);assert.equal(r.run.scoreStages[256].stageIndex,256);
});

test('banking after a new perk keeps valid results without pretending the perk applied to the last completed stage',async()=>{
 const {chooseUpgrade,finishRun}=await import('../src/run.js');const f=recoveryFixture(1);f.run.status='upgrade';f.run.stageIndex=0;f.run.availablePerks=['boots'];chooseUpgrade(f.run,'boots');finishRun(f.run);
 f.summary={qualified:true,pickups:20,target:20,score:f.run.totalScore,totalScore:f.run.totalScore};f.resultSnapshot={id:f.run.id,score:f.run.totalScore,stagesCleared:1,inputType:'touch',outfit:{onesie:'lime',hat:'none',totem:'none',flair:'none'},completedAt:1000};
 const r=makeRecovery(f);assert.equal(r.screen,'results');assert.equal(readRecovery(r).ok,true);
});
