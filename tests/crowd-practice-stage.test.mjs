import test from 'node:test';
import assert from 'node:assert/strict';
import {crowdPracticeStage} from '../src/crowd-practice-stage.js';
import {SMF_PREVIEW_STAGES,smfPreviewStage} from '../src/editions/smf-stages.js';
import {crowdPosition} from '../src/festival.js';
import {getTiming} from '../src/stage-clock.js';
import {isOpen} from '../src/geometry.js';

test('each frozen venue receives exactly six or twelve deterministic extra dancers without changing its rules',()=>{
 for(const stage of SMF_PREVIEW_STAGES){
  const before=structuredClone(stage);
  for(const extra of [0,6,12]){
   const result=crowdPracticeStage(stage,extra),{crowdAnchors,...rules}=result,{crowdAnchors:original,...originalRules}=stage;
   assert.equal(crowdAnchors.length,original.length+extra,stage.id);
   assert.deepEqual(crowdAnchors.slice(0,original.length),original);
   assert.deepEqual(rules,originalRules);
   assert.deepEqual(result,crowdPracticeStage(stage,extra));
   assert.notEqual(result,stage);assert.notEqual(crowdAnchors,original);assert.notEqual(crowdAnchors[0],original[0]);
   result.spawn.x=-1;result.palette.accent=0;crowdAnchors[0][0]=-1;
   assert.deepEqual(stage,before,'preview edits must not reach the frozen authored venue');
  }
  const six=crowdPracticeStage(stage,6).crowdAnchors.slice(stage.crowdAnchors.length);
  const twelve=crowdPracticeStage(stage,12).crowdAnchors.slice(stage.crowdAnchors.length);
  assert.deepEqual(twelve.slice(0,6),six,'increasing density preserves the first added dancers');
 }
});

test('unsupported density values leave a cloned baseline',()=>{
 const stage=smfPreviewStage('smf-fractal');
 for(const extra of [undefined,null,-6,1,7,18,Infinity,NaN,'6','12',true,{},[]]){
  const result=crowdPracticeStage(stage,extra);assert.deepEqual(result,stage);assert.notEqual(result,stage);
 }
});

test('added dancers stay inside the floor and clear cabinets for their full wander envelopes',()=>{
 for(const stage of SMF_PREVIEW_STAGES){
  const result=crowdPracticeStage(stage,12),timing=getTiming(stage.timingId),b=stage.playBounds;
  for(let index=stage.crowdAnchors.length;index<result.crowdAnchors.length;index++){
   const [x,y]=result.crowdAnchors[index],wanderX=index%3===0?52:15,wanderY=index%3===0?30:12;
   assert.ok(x-wanderX>=b.minX+14&&x+wanderX<=b.maxX-14,`${stage.id}: horizontal envelope ${index}`);
   assert.ok(y-wanderY>=b.minY+14&&y+wanderY<=b.maxY-14,`${stage.id}: vertical envelope ${index}`);
   for(const cabinet of stage.obstacles)assert.ok(
    x+wanderX<=cabinet.x-14||x-wanderX>=cabinet.x+cabinet.width+14||y+wanderY<=cabinet.y-14||y-wanderY>=cabinet.y+cabinet.height+14,
    `${stage.id}: wander envelope overlaps a cabinet for dancer ${index}`,
   );
   const initial=crowdPosition(index,0,result.crowdAnchors,stage.crowdSpeed??1,timing);
   assert.ok(Math.hypot(initial.x-stage.spawn.x,initial.y-stage.spawn.y)>=60,`${stage.id}: initial spawn clearance ${index}`);
   for(let elapsed=0;elapsed<=timing.durationMs;elapsed+=137){
    const point=crowdPosition(index,elapsed,result.crowdAnchors,stage.crowdSpeed??1,timing);
    assert.ok(point.x>=b.minX+14&&point.x<=b.maxX-14&&point.y>=b.minY+14&&point.y<=b.maxY-14);
    assert.ok(isOpen(point,14,stage.obstacles),`${stage.id}: authored path enters a cabinet`);
   }
  }
 }
});

test('existing NPC anchors do not repel or disqualify added anchors, including exact overlaps',()=>{
 const stage=smfPreviewStage('smf-fractal');
 const additions=crowdPracticeStage(stage,12).crowdAnchors.slice(stage.crowdAnchors.length);
 const crowded={...structuredClone(stage),crowdAnchors:structuredClone(additions)};
 const result=crowdPracticeStage(crowded,12);
 assert.deepEqual(result.crowdAnchors.slice(12),additions);
 assert.deepEqual(result.crowdAnchors.slice(0,12),result.crowdAnchors.slice(12),'overlap is permitted rather than repelled');
});
