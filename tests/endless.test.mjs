import test from 'node:test';import assert from 'node:assert/strict';
import {stageFor,createRun,startStage,finishStage,chooseUpgrade,keepPerks,upgradeChoices} from '../src/run.js';
import {createRound} from '../src/game.js';
import {createStorage} from '../src/storage.js';
import {STAGES} from '../src/stages.js';
const clear=run=>{const config=startStage(run),r=createRound(config.rules);r.pickups=config.stage.target;r.remainingMs=0;r.ended=true;return finishStage(run,r);};
test('Endless loops through all stages with bounded scaling and leaves Festival untouched',()=>{
 const r=createRun('endless','one');assert.equal(r.mode,'endless');
 for(const [index,target] of [[0,20],[1,25],[2,30],[3,23],[4,28],[5,33],[30,45],[300,45]]){
  r.stageIndex=index;const s=stageFor(r);assert.equal(s.id,STAGES[index%3].id);assert.equal(s.target,target);
  assert.ok(s.crowdAnchors.length<=22);assert.ok(s.crowdSpeed<=1.2);
 }
 assert.deepEqual(STAGES.map(s=>s.target),[20,25,30]);assert.equal(stageFor(createRun('festival','f')),STAGES[0]);
});
test('four perk slots support safe swapping, keeping and endless continuation without duplicates',()=>{
 const r=createRun('endless','one');r.availablePerks=['boots','moth','noodle','bracelet','surfer'];
 for(const id of ['boots','moth','noodle','bracelet']){clear(r);assert.equal(chooseUpgrade(r,id),true);}
 assert.equal(r.stageIndex,4);assert.equal(r.perks.length,4);clear(r);
 assert.equal(chooseUpgrade(r,'surfer'),false);assert.equal(chooseUpgrade(r,'surfer','bad'),false);
 assert.equal(chooseUpgrade(r,'surfer','moth'),true);assert.ok(!r.perks.includes('moth'));assert.equal(r.perks.length,4);
 clear(r);assert.equal(keepPerks(r),true);assert.equal(keepPerks(r),false);assert.equal(r.stageIndex,6);
 assert.equal(r.scoreStages.length,6);
});
test('early limited perk pools can keep going; failure ends; stage resets preserve only Bass charge and perks',()=>{
 const r=createRun('endless','one');r.availablePerks=['boots'];clear(r);chooseUpgrade(r,'boots');clear(r);
 assert.deepEqual(upgradeChoices(r),[]);assert.ok(keepPerks(r));
 const config=startStage(r),round=createRound(config.rules);assert.equal(round.shieldsRemaining,0);
 round.bass.chargeMs=5000;round.remainingMs=0;round.ended=true;round.pickups=config.stage.target-1;
 assert.equal(finishStage(r,round).qualified,false);assert.equal(r.status,'ended');assert.equal(finishStage(r,round),null);
 assert.equal(keepPerks(r),false);
 const festival=createRun('festival','f');clear(festival);assert.equal(keepPerks(festival),false);
});
test('Endless scores persist separately, rank survival first and allow more than three clears',()=>{
 const data=new Map(),raw={getItem:k=>data.get(k),setItem:(k,v)=>data.set(k,v)};
 const s=createStorage(raw);const entry=(id,stagesCleared,score)=>({id,initials:'AAA',score,stagesCleared,completedAt:1,outfit:{}});
 assert.ok(s.submitScore('endless',entry('a',10,100)).accepted);assert.ok(s.submitScore('endless',entry('b',9,9999)).accepted);
 assert.equal(s.submitScore('endless',entry('a',10,100)).accepted,false);
 assert.ok(!s.submitScore('festival',entry('bad',10,100)).accepted);
 const restored=createStorage(raw);assert.equal(restored.profile.boards.endless[0].id,'a');assert.equal(restored.profile.boards.rush.length,0);
});

test('long Endless runs keep bounded histories and reject unavailable or duplicate swaps',()=>{
 const run=createRun('endless','long');run.availablePerks=['boots','moth','noodle','bracelet','surfer'];
 for(let i=0;i<100;i++){
  clear(run);if(i<4)chooseUpgrade(run,run.availablePerks[i]);else keepPerks(run);
 }
 assert.equal(run.stageIndex,100);assert.equal(run.perks.length,4);assert.equal(run.scoreStages.length,100);
 clear(run);assert.equal(chooseUpgrade(run,'battery','boots'),false);assert.equal(chooseUpgrade(run,'moth','boots'),false);
 assert.ok(chooseUpgrade(run,'surfer','boots'));assert.equal(new Set(run.perks).size,4);
});
test('Endless resets per-stage shields and Flow while retaining unspent Bass charge',()=>{
 const run=createRun('endless','carry');run.perks=['noodle','moth','encore'];
 const first=startStage(run),r=createRound(first.rules);r.bass.chargeMs=7500;r.pickups=first.stage.target;r.remainingMs=0;r.ended=true;
 finishStage(run,r);keepPerks(run);const next=startStage(run),round=createRound(next.rules);
 assert.equal(next.bassChargeMs,7500);assert.equal(round.shieldsRemaining,1);assert.equal(round.flowMs,0);assert.deepEqual(round.flowTaken,[]);
});

test('each loop adds the intended crowd count up to 22 with safe extra anchors',async()=>{
 const {isOpen}=await import('../src/geometry.js');const r=createRun('endless','crowds');
 for(let index=0;index<36;index++){
  r.stageIndex=index;const base=STAGES[index%3],s=stageFor(r);
  assert.equal(s.crowdAnchors.length,Math.min(22,base.crowdAnchors.length+Math.floor(index/3)*2));
  for(const [x,y] of s.crowdAnchors.slice(base.crowdAnchors.length)){
   assert.ok(isOpen({x,y},75,s.obstacles));assert.ok(Math.hypot(x-s.spawn.x,y-s.spawn.y)>110);
  }
  assert.equal(stageFor(r),s);
 }
});

test('voluntary finish banks only completed stages from every Endless checkpoint',async()=>{
 const {finishRun}=await import('../src/run.js');
 for(const checkpoint of ['upgrade','ready','playing']){
  const run=createRun('endless','finish');clear(run);
  if(checkpoint!=='upgrade')keepPerks(run);
  if(checkpoint==='playing'){const c=startStage(run),partial=createRound(c.rules);partial.score=9999;partial.pickups=99;}
  const score=run.totalScore,history=structuredClone(run.scoreStages);
  assert.equal(finishRun(run),true);assert.equal(run.status,'ended');assert.equal(run.endedVoluntarily,true);
  assert.equal(run.totalScore,score);assert.equal(run.stagesCleared,1);assert.deepEqual(run.scoreStages,history);
  assert.equal(finishRun(run),false);assert.equal(startStage(run),null);
 }
 assert.equal(finishRun(createRun('endless','empty')),false);
 const festival=createRun('festival','festival');clear(festival);assert.equal(finishRun(festival),false);
});
