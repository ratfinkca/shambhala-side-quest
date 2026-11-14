import test from 'node:test';
import assert from 'node:assert/strict';
import {actorAnchors} from '../src/pixel-art/actor-wardrobe.js';
import {actorPose,createActorMotion} from '../src/pixel-art/actor-motion.js';
import {sideRigPose,sideRigRestPose} from '../src/pixel-art/actor-side-pose.js';
import {ACTOR_SOURCE_ATTACHMENTS} from '../src/pixel-art/actor-attachments.js';
const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-8,`${a} != ${b}`);

test('idle and raised palms follow measured skin centres instead of constant guessed offsets',()=>{
 const idle=actorAnchors({row:0,index:0}),raised=actorAnchors({row:0,index:2});
 close(idle.hand.x,9.6);close(idle.hand.y,13/7);
 close(raised.hand.x,10.8);close(raised.hand.y,-38.8/7);
 close(idle.headwear.y,-22);close(idle.headwear.width,134/7);
 assert.ok(raised.hand.y<idle.hand.y-7,'raised fists carry the pole with them');
});

test('every source pose supplies finite cap, crown, brow, ears and palm geometry',()=>{
 for(const [row,entries]of Object.entries(ACTOR_SOURCE_ATTACHMENTS))for(let index=0;index<entries.length;index++)for(const flipX of [false,true]){
  const a=actorAnchors({row:Number(row),index,flipX});
  for(const p of [a.head,a.hand,a.headwear,a.headwear.crown,a.headwear.brow,a.headwear.ears.near,a.headwear.ears.far])assert.ok(Number.isFinite(p.x)&&Number.isFinite(p.y));
  assert.ok(a.headwear.width>=17&&a.headwear.width<=20);
  assert.ok(a.headwear.crown.y<a.headwear.y&&a.headwear.brow.y>a.headwear.y);
  assert.deepEqual(a.feet,{x:0,y:16});
 }
});

test('reconstructed mirrored halves use the opposite source palm to keep the carrying side',()=>{
 for(const facing of ['down','up']){
  const state=createActorMotion();state.speed=300;state.facing=facing;
  for(let step=0;step<6;step++){
   state.gait=step/6;const pose=actorPose(state),a=actorAnchors(pose);
   assert.ok(facing==='down'?a.hand.x>7:a.hand.x< -7,'no mid-cycle hand-side swap');
   assert.equal(a.headwear.flipX,false,'asymmetric hat art does not flip each reconstructed half-step');assert.equal(a.facing,facing==='up'?'back':'front');
  }
 }
});

test('carrying variants retain the same gait and keep a real palm beside the face in both side facings',()=>{
 for(const [row,clip]of [[3,'walkRight'],[6,'runRight'],[8,'restRight']])for(let index=0;index<(row===8?1:6);index++){
  const empty=row===8?sideRigRestPose():sideRigPose(clip,index),held=row===8?sideRigRestPose({carrying:true}):sideRigPose(clip,index,{carrying:true});
  assert.deepEqual(held.near.foot,empty.near.foot);assert.deepEqual(held.far.foot,empty.far.foot);assert.equal(held.bob,empty.bob);
  for(const flipX of [false,true]){
   const a=actorAnchors({row,index,carrying:true,flipX}),sign=flipX?-1:1;
   assert.equal(a.hand.x,10*sign);assert.equal(a.hand.y,-1+held.bob);
   close(Math.hypot(held.near.elbow.x-held.shoulder.x,held.near.elbow.y-held.shoulder.y),6.25);
   close(Math.hypot(held.near.wrist.x-held.near.elbow.x,held.near.wrist.y-held.near.elbow.y),6.25);
   close(a.headwear.y,-21.941176470588236+held.bob);assert.equal(a.headwear.side,true);assert.equal(a.facing,flipX?'left':'right');
   assert.equal(a.grip.x,a.hand.x);assert.equal(a.grip.y,a.hand.y);
  }
 }
});
