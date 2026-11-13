import test from 'node:test';
import assert from 'node:assert/strict';
import {createCrowdFriendships} from '../src/crowd-friendship.js';
import {createRun,stageFor} from '../src/run.js';
import {BONUSES,createTourProfile,createTourRun,stageForRun} from '../src/smf-tour/model.js';
import {bonusConfig} from '../src/smf-tour/content.js';

function checkMix(stage){
 const people=stage.crowdAnchors.map((_,i)=>({id:`dancer-${i}`})),bonds=createCrowdFriendships(people);
 assert.deepEqual(new Set(people.map(p=>bonds.get(p.id).radius)),new Set([18,26,34]),stage.id);
 return people.length;
}
test('every main venue and bonus party has mixed personal space, with denser later stages',()=>{
 for(const [run,getStage,length] of [
  [createRun('festival','generic'),stageFor,3],
  [createTourRun(createTourProfile(),'festival','smf').active,stageForRun,6],
 ]){
  let previous=0;
  for(let i=0;i<length;i++){run.stageIndex=i;const count=checkMix(getStage(run));assert.ok(count>previous);previous=count;}
 }
 for(const bonus of BONUSES)checkMix(bonusConfig(bonus.id).stage);
});
test('Endless revisits increase crowd density without replacing the mix or exceeding the cap',()=>{
 for(const [run,getStage,length] of [
  [createRun('endless','generic'),stageFor,3],
  [createTourRun(createTourProfile(),'endless','smf').active,stageForRun,6],
 ]){
  for(let venue=0;venue<length;venue++){
   let previous=0;
   for(const loop of [0,1,2,3,4,10,100]){
    run.stageIndex=loop*length+venue;const count=checkMix(getStage(run));
    assert.equal(count,previous?Math.min(22,previous+2*(loop===10?6:loop===100?90:1)):count);
    assert.ok(count<=22);previous=count;
   }
  }
 }
});
