import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {PIXEL_CLIPS,PIXEL_SHEETS,pixelFrame} from '../src/pixel-lab/atlas.js';
import {FRAME_WIDTH,FRAME_HEIGHT,FOOT_X,FOOT_Y} from '../src/pixel-art/actor-wardrobe.js';
import {actorPose,createActorMotion} from '../src/pixel-art/actor-motion.js';

test('pixel sheets have the reviewed PNG dimensions and alpha channel',()=>{
  for(const [key,file]of Object.entries({effects:'pickups-friendship-v1.png'})){
    const png=readFileSync(new URL(`../src/pixel-lab/assets/${file}`,import.meta.url));
    assert.equal(png.subarray(1,4).toString(),'PNG');
    assert.equal(png.readUInt32BE(16),PIXEL_SHEETS[key].width);
    assert.equal(png.readUInt32BE(20),PIXEL_SHEETS[key].height);
    assert.equal(png[25],6,'RGBA, with a real alpha channel');
  }
});

test('all 65 named frames fit their sheet and share anchors across pose changes',()=>{
  let frames=0;
  for(const [name,clip]of Object.entries(PIXEL_CLIPS)){
    for(let i=0;i<clip.frames;i++){
      const f=pixelFrame(name,i),s=PIXEL_SHEETS[clip.type];frames++;
      assert.ok(f.x>=0&&f.y>=0&&f.x+f.width<=s.width&&f.y+f.height<=s.height);
      assert.ok(f.width>0&&f.height>0);
      assert.equal(f.anchorY,pixelFrame(name,0).anchorY);
      if(clip.type==='raver')assert.equal(f.anchorY,pixelFrame('idle',0).anchorY);
    }
  }
  assert.equal(frames,65);
});

test('loop frames wrap and a friendship one-shot holds its last frame',()=>{
  assert.deepEqual(pixelFrame('dance',7),pixelFrame('dance',1));
  assert.deepEqual(pixelFrame('dance',-1),pixelFrame('dance',5));
  assert.deepEqual(pixelFrame('friend',99),pixelFrame('friend',3));
  assert.deepEqual(pixelFrame('friend',-2),pixelFrame('friend',0));
  assert.throws(()=>pixelFrame('missing'),/Unknown pixel clip/);
});

test('portable effects atlas names every source frame without changing the anchor',()=>{
  for(const [type,file]of Object.entries({effects:'pickups-friendship-v1'})){
    const atlas=JSON.parse(readFileSync(new URL(`../src/pixel-lab/assets/${file}.atlas.json`,import.meta.url),'utf8'));
    const names=[];
    for(const [name,clip]of Object.entries(PIXEL_CLIPS))if(clip.type===type)for(let i=0;i<clip.frames;i++){
      const key=`${name}-${i}`,f=pixelFrame(name,i);names.push(key);
      assert.deepEqual(atlas.frames[key].frame,{x:f.x,y:f.y,w:f.width,h:f.height});
      if(type==='raver')assert.equal(atlas.frames[key].poseMirror,f.mirror);
      // Variable rounded source-cell widths/heights need slightly different
      // normalized pivots to resolve to the same absolute foot anchor.
      assert.ok(Math.abs(atlas.frames[key].pivot.x*f.displayWidth-f.anchorX)<1e-10);
      assert.ok(Math.abs(atlas.frames[key].pivot.y*f.displayHeight-f.anchorY)<1e-10);
      assert.equal(atlas.frames[key].trimmed,false);
    }
    assert.deepEqual(Object.keys(atlas.frames),names);
  }
});

test('manual frame stepping resolves reconstructed alternate foot poses exactly once',()=>{
 for(const clip of ['walkDown','walkUp','runDown','runUp'])for(let i=0;i<3;i++){
  const a=pixelFrame(clip,i),b=pixelFrame(clip,i+3);
  assert.equal(a.source,b.source);assert.equal(a.x,b.x);
  assert.equal(a.mirror,false);assert.equal(b.mirror,true);
 }
});

// The inspector must show the production atlas, not a separate lookalike sheet.
test('inspector frames match production row, source pose, mirror and foot origin',()=>{
 for(const [name,clip] of Object.entries(PIXEL_CLIPS))if(clip.type==='raver')for(let step=0;step<clip.frames;step++){
  const state=createActorMotion();state.speed=100;state.sprinting=name.startsWith('run');state.facing=name.endsWith('Right')?'right':name.endsWith('Up')?'up':'down';state.gait=(step+.01)/6;
  if(name==='idle'||name==='dance'||name==='restRight'){state.speed=0;state.dancing=name==='dance';}
  const pose=actorPose(state,clip.fps?(step+.01)*1000/clip.fps:0),frame=pixelFrame(name,step);
  assert.equal(frame.x,(pose.frame%6)*FRAME_WIDTH);assert.equal(frame.y,Math.floor(pose.frame/6)*FRAME_HEIGHT);
  assert.equal(frame.mirror,pose.poseMirror);assert.equal(frame.width,FRAME_WIDTH);assert.equal(frame.height,FRAME_HEIGHT);
  assert.equal(frame.anchorX,FOOT_X);assert.equal(frame.anchorY,FOOT_Y);
 }
});
