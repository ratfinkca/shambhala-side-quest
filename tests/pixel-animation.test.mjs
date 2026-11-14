import test from 'node:test';
import assert from 'node:assert/strict';
import {createPixelMotion,advancePixelMotion,pixelFacing,pixelFrame,pixelLabRequested} from '../src/pixel-lab/animation.js';
const clips=Object.fromEntries(['idle','dance','walkDown','walkRight','walkUp','runDown','runRight','runUp','restRight'].map(name=>[name,{frames:6,fps:8}]));
test('pixel preview needs development and both explicit rehearsal flags',()=>{
 assert.equal(pixelLabRequested({DEV:true},'?rehearsal&pixels'),true);
 for(const search of ['','?pixels','?rehearsal'])assert.equal(pixelLabRequested({DEV:true},search),false);
 assert.equal(pixelLabRequested({DEV:false},'?rehearsal&pixels'),false);
});
test('facing keeps its axis around diagonals but turns and reverses decisively',()=>{
 assert.equal(pixelFacing('right',1,1.05),'right');
 assert.equal(pixelFacing('right',1,1.3),'down');
 assert.equal(pixelFacing('down',1.05,1),'down');
 assert.equal(pixelFacing('down',1.3,1),'right');
 assert.equal(pixelFacing('right',-1,0),'left');
 assert.equal(pixelFacing('up',0,0),'up');
});
test('walk and sprint retain gait phase while changing clips immediately',()=>{
 const state=createPixelMotion();
 advancePixelMotion(state,{vector:{x:1,y:0}},100);
 assert.equal(pixelFrame(state,clips).clip,'walkRight');
 const before=state.gait;
 advancePixelMotion(state,{vector:{x:1,y:0},sprint:true},16);
 assert.equal(pixelFrame(state,clips).clip,'runRight');
 assert.ok(state.gait>before);assert.ok(state.gait<before+.5);
});
test('pause and returning background frames do not advance position or animation',()=>{
 const state=createPixelMotion();advancePixelMotion(state,{vector:{x:1,y:0}},100);
 const before=structuredClone(state);
 advancePixelMotion(state,{vector:{x:1,y:0},paused:true},100);
 assert.deepEqual(state,before);
 advancePixelMotion(state,{vector:{x:1,y:0}},1000);
 assert.deepEqual(state,before);
});
test('a completed destination stops without passing through the target',()=>{
 const state=createPixelMotion();const target={x:state.x+4,y:state.y};
 for(let i=0;i<20;i++)advancePixelMotion(state,{target},16);
 assert.equal(state.x,target.x);assert.equal(state.y,target.y);assert.equal(state.speed,0);
 assert.equal(pixelFrame(state,clips).clip,'restRight');assert.equal(pixelFrame(state,clips).index,0);assert.equal(pixelFrame(state,clips).resting,true);
});
test('left uses the right sheet mirrored; reduced motion still shows locomotion',()=>{
 const state=createPixelMotion();advancePixelMotion(state,{vector:{x:-1,y:0}},100);
 const frame=pixelFrame(state,clips,{reducedMotion:true});assert.equal(frame.clip,'walkRight');assert.equal(frame.flipX,true);
 state.speed=0;assert.equal(pixelFrame(state,clips,{manualClip:'dance',reducedMotion:true}).index,0);
});
test('movement normalizes diagonal speed and stopping never locks new input',()=>{
 const a=createPixelMotion(),b=createPixelMotion();
 advancePixelMotion(a,{vector:{x:1,y:0}},100);advancePixelMotion(b,{vector:{x:1,y:1}},100);
 assert.ok(Math.abs(a.speed-b.speed)<.0001);
 advancePixelMotion(a,{},100);advancePixelMotion(a,{vector:{x:0,y:-1}},16);
 assert.equal(pixelFrame(a,clips).clip,'walkUp');
});

test('stopping retains back or side facing on a still neutral frame',()=>{
 for(const facing of ['left','right','up']){
  const state=createPixelMotion();state.facing=facing;state.elapsed=400;
  const first=pixelFrame(state,clips);state.elapsed=1900;const second=pixelFrame(state,clips);
  assert.equal(first.clip,facing==='up'?'walkUp':'restRight');assert.equal(first.index,0);assert.equal(second.index,0);assert.equal(second.flipX,facing==='left');assert.equal(second.resting,true);
 }
});
test('pushing against the floor boundary stops the feet while sliding still animates',()=>{
 const state=createPixelMotion();state.x=492;const bounds={left:28,right:492,top:124,bottom:394};
 advancePixelMotion(state,{vector:{x:1,y:0},bounds},100);
 assert.equal(state.x,492);assert.equal(state.speed,0);assert.equal(state.gait,0);assert.equal(pixelFrame(state,clips).resting,true);
 advancePixelMotion(state,{vector:{x:1,y:1},bounds},100);
 assert.equal(state.x,492);assert.ok(state.y>245);assert.ok(state.speed>0);assert.ok(state.gait>0);
});

test('preview walking and running cadence respect eight/twelve fps at settled speed',()=>{
 for(const [sprint,speed,fps]of [[false,78,8],[true,145,12]]){
  const state=createPixelMotion();state.vx=speed;state.speed=speed;
  for(let i=0;i<60;i++)advancePixelMotion(state,{vector:{x:1,y:0},sprint},1000/60);
  assert.ok(Math.abs(state.gait*6-fps)<1e-8,`${fps} authored poses per second`);
 }
});
