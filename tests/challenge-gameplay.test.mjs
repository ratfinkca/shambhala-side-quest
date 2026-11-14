import test from 'node:test';
import assert from 'node:assert/strict';
import {createRun,stageFor,startStage,rulesFor,upgradeChoices} from '../src/run.js';
import {createCrowdFriendships} from '../src/crowd-friendship.js';
import {availablePerks,normalizeProgress} from '../src/progression.js';
import {genericTarget} from '../supabase/functions/_shared/edition-rules.js';

test('v3 challenge scales targets and crowd, keeps speed and locks selection on a new run',()=>{
 for(const [challenge,target,count,passes] of [['first-timer',14,7,2],['been-around',20,10,4],['seasoned-vet',26,13,6]]){
  const run=createRun('festival','run','forest-freakout',challenge),stage=stageFor(run);
  assert.equal(run.challenge,challenge);assert.equal(stage.target,target);assert.equal(stage.crowdAnchors.length,count);
  assert.equal(startStage(run).friendPasses,passes);
 }
 for(const [challenge,cap] of [['first-timer',16],['been-around',22],['seasoned-vet',28]]){
  const run=createRun('endless','run',undefined,challenge);run.stageIndex=300;
  assert.equal(stageFor(run).crowdAnchors.length,cap);assert.equal(stageFor(run).crowdSpeed,1.2);
 }
 const old=createRun('festival','run',undefined,'seasoned-vet');old.scoringVersion='arcade-v2';
 assert.equal(stageFor(old).target,20);assert.equal(stageFor(old).crowdAnchors.length,10);assert.equal(startStage(old).friendPasses,4);
});
test('friendship preserves mixed sizes while requiring the chosen number of passes',()=>{
 for(const requiredPasses of [2,4,6]){
  const people=[{id:'a'},{id:'b'},{id:'c'}],friends=createCrowdFriendships(people,{requiredPasses});
  assert.deepEqual(people.map(p=>friends.get(p.id).radius),[18,26,34]);
  for(let i=1;i<=requiredPasses;i++){friends.record([{id:'a',closePass:true}]);assert.equal(friends.get('a').isFriend,i===requiredPasses);}
  assert.equal(friends.get('a').radius,0);assert.equal(friends.get('b').radius,26);
 }
});
test('drop perks unlock at ranks 3 and 4 and stay out of legacy upgrades',()=>{
 for(const [id,xp] of [['candy-magnet',650],['flow-finder',1200]]){
  assert.equal(availablePerks(normalizeProgress({xp:xp-1})).includes(id),false);
  assert.equal(availablePerks(normalizeProgress({xp})).includes(id),true);
 }
 const run=createRun('endless','run');run.status='upgrade';assert.ok(upgradeChoices(run).includes('flow-finder'));
 run.scoringVersion='arcade-v2';assert.equal(upgradeChoices(run).includes('flow-finder'),false);
 assert.equal(rulesFor(['candy-magnet'],'arcade-v2').candyMagnet,undefined);
});
test('veteran Endless reaches its intended population in every authored variation',()=>{
 const run=createRun('endless','crowds',undefined,'seasoned-vet');
 const baseCounts=[10,14,18];
 for(let i=0;i<36;i++){
  run.stageIndex=i;
  assert.equal(stageFor(run).crowdAnchors.length,Math.min(28,Math.round((baseCounts[i%3]+Math.floor(i/3)*2)*1.3)),`stage ${i}`);
 }
});

test('every Endless challenge uses the same target as score and recovery validation',()=>{
 for(const challenge of ['first-timer','been-around','seasoned-vet']){
  const run=createRun('endless','target-parity',undefined,challenge);
  for(let index=0;index<120;index++){
   run.stageIndex=index;
   assert.equal(stageFor(run).target,genericTarget(index,true,challenge,run.scoringVersion),`${challenge} stage ${index}`);
  }
 }
});
