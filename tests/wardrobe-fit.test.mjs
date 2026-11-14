import test from 'node:test';
import assert from 'node:assert/strict';
import {wardrobeFitRequested,fitPoseInput,FIT_FACINGS} from '../src/wardrobe-fit/model.js';
import {actorPose} from '../src/pixel-art/actor-motion.js';

test('fitting room requires a development build and both explicit query flags',()=>{
 assert.equal(wardrobeFitRequested({DEV:true},'?rehearsal&wardrobe-fit'),true);
 for(const env of [{},{DEV:false},{DEV:'true'}])assert.equal(wardrobeFitRequested(env,'?rehearsal&wardrobe-fit'),false);
 for(const search of ['','?rehearsal','?wardrobe-fit','?rehearsal&pixels'])assert.equal(wardrobeFitRequested({DEV:true},search),false);
});
test('fitting poses resolve through production motion clips, including neutral side rest',()=>{
 for(const [facing]of FIT_FACINGS)for(const mode of ['rest','dance','walk','run'])for(let index=0;index<6;index++){
  const input=fitPoseInput(mode,facing,index),pose=actorPose({...input.motion,dancing:input.dancing},input.elapsed,{reduced:input.reduced});
  const side=['left','right'].includes(facing);
  if(mode==='rest')assert.equal(pose.frame,side?48:facing==='up'?24:0);
  else{
   assert.equal(pose.step,index,`${mode}/${facing}: manual cycle step`);
   assert.match(pose.clip,mode==='dance'?/^dance$/:new RegExp(`^${mode}`));
  }
  assert.equal(pose.facingFlipX,facing==='left'&&mode!=='dance');
 }
});
