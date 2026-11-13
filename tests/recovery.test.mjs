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

test('online-history overflow keeps the full local run totals and oversized records fail closed',()=>{
 const r=makeRecovery(recoveryFixture(1441));assert.equal(r.run.scoreStages.length,1440);assert.equal(r.run.scoreOverflow,true);assert.equal(r.run.stagesCleared,1441);assert.equal(readRecovery(r).ok,true);
 const oversized=structuredClone(r);oversized.junk='x'.repeat(2*1024*1024);assert.equal(readRecovery(oversized).code,'oversized');
});

test('perks earned beyond retained online history remain locally recoverable through decisions and results',async()=>{
 const {createRound,collect}=await import('../src/game.js');const {finishStage,chooseUpgrade,startStage,finishRun,rulesFor}=await import('../src/run.js');
 const f=recoveryFixture(1440);f.run.perks=['boots'];const r=createRound(rulesFor(f.run.perks));while(r.pickups<45)collect(r);r.remainingMs=0;r.ended=true;f.summary=finishStage(f.run,r);f.scene=null;f.screen={name:'summary'};
 assert.equal(f.run.scoreOverflow,true);assert.equal(readRecovery(makeRecovery(f)).ok,true);
 chooseUpgrade(f.run,'bracelet');f.screen={name:'rules'};assert.equal(readRecovery(makeRecovery(f)).ok,true);
 finishRun(f.run);f.resultSnapshot={id:f.run.id,score:f.run.totalScore,stagesCleared:f.run.stagesCleared,inputType:'touch',outfit:{onesie:'lime',hat:'none',totem:'none',flair:'none'},completedAt:1000};assert.equal(readRecovery(makeRecovery(f)).ok,true);
});
test('damaged encounter point pairs and incomplete active passes are rejected before resuming',()=>{
 const base=makeRecovery(recoveryFixture());for(const change of [e=>e.previousPlayer={x:480,y:400},e=>e.previousDancer={x:300,y:300},e=>e.active=true]){const r=structuredClone(base);change(r.scene.crowd[0]);assert.equal(readRecovery(r).ok,false);}
});

test('malformed empty history objects and inherited wardrobe reward categories cannot reach gameplay or rendering',()=>{
 for(const mutate of [v=>v.run.scoreStages={length:0},v=>v.progressReward={xp:10,rewards:['constructor:x'],persisted:true},v=>v.progressReward={xp:10,rewards:['onesie:not-real'],persisted:true}]){const r=makeRecovery(recoveryFixture());mutate(r);assert.equal(readRecovery(r).ok,false);}
});

test('interrupted exit confirmation returns to the original between-stage perk choice',()=>{assert.equal(recoveryScreen({name:'confirmExit',returnTo:'upgrade'},{status:'upgrade'}),'upgrade');});

test('stamina survives recovery while legacy checkpoints and invalid resource values are handled safely',()=>{
 const f=recoveryFixture();f.scene.round.stamina=37.5;
 const checkpoint=makeRecovery(f);assert.equal(readRecovery(checkpoint).value.scene.round.stamina,37.5);
 delete checkpoint.scene.round.stamina;assert.equal(readRecovery(checkpoint).ok,true);
 for(const value of [-1,101,NaN,'50']){checkpoint.scene.round.stamina=value;assert.equal(readRecovery(checkpoint).ok,false);}
});
