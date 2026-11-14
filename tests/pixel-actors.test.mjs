import test from 'node:test';
import assert from 'node:assert/strict';
import {ACTOR_CLIPS,locomotionCadence,orderedPose} from '../src/pixel-art/actor-clips.js';
import {createActorMotion,resetActorMotion,advanceActorMotion,actorPose} from '../src/pixel-art/actor-motion.js';
import {OUTFIT_PALETTES,actorAnchors,drawHat,drawTotem,drawFlair} from '../src/pixel-art/actor-wardrobe.js';
import {WARDROBE} from '../src/wardrobe.js';
import {sideRigPose,sideRigRestPose} from '../src/pixel-art/actor-side-rig.js';
import {ACTOR_SIDE_PARTS} from '../src/pixel-art/actor-side-parts.js';
import {readFileSync} from 'node:fs';

test('pose cadence follows authored rates rather than pixels travelled per frame',()=>{
 assert.equal(locomotionCadence(300,false),8);assert.equal(locomotionCadence(450,true),12);
 assert.equal(locomotionCadence(10000,false),10);assert.equal(locomotionCadence(10000,true),15);
 assert.equal(locomotionCadence(0,true),0);
 const state=createActorMotion();advanceActorMotion(state,{x:0,y:0,speed:300,elapsed:0});
 for(let i=1;i<=60;i++)advanceActorMotion(state,{x:i*5,y:0,speed:300,elapsed:i*1000/60});
 assert.ok(Math.abs(state.gait*6-8)<1e-8,'8 frames per second at normal production travel speed');
});
test('walking, sprinting and pause share phase without rotating the sprite',()=>{
 const state=createActorMotion();advanceActorMotion(state,{x:0,y:0,speed:300,elapsed:0});
 advanceActorMotion(state,{x:30,y:0,speed:300,elapsed:100});const before=state.gait;
 advanceActorMotion(state,{x:75,y:0,speed:450,sprinting:true,elapsed:200});
 assert.ok(state.gait>before);assert.equal(actorPose(state,200).clip,'runRight');
 const paused=state.gait;advanceActorMotion(state,{x:75,y:0,speed:450,sprinting:true,elapsed:200});assert.equal(state.gait,paused);
 advanceActorMotion(state,{x:70,y:0,speed:300,elapsed:216});assert.equal(actorPose(state,216).flipX,true);
 advanceActorMotion(state,{x:70,y:0,speed:0,elapsed:240});assert.equal(actorPose(state,240).index,0);assert.equal(actorPose(state,240).flipX,true);assert.equal(actorPose(state,240).clip,'restRight');assert.equal(actorPose(state,240).frame,48);
});
test('a new stage or paused recovery resets stale sprint/facing while priming the next movement sample',()=>{
 const state=createActorMotion();Object.assign(state,{facing:'left',gait:8.2,speed:500,sprinting:true,lastX:800,lastY:100,lastElapsed:40000});
 resetActorMotion(state,{x:480,y:350,elapsed:21000});
 assert.equal(state.speed,0);assert.equal(state.sprinting,false);assert.equal(state.facing,'down');assert.equal(state.gait,0);
 assert.equal(actorPose(state,21000,{reduced:true}).clip,'idle');
 advanceActorMotion(state,{x:480,y:345,speed:300,elapsed:21016});
 assert.equal(state.facing,'up');assert.ok(state.gait>0);assert.equal(actorPose(state).clip,'walkUp');
 resetActorMotion(state,{x:400,y:300,elapsed:0});assert.equal(actorPose(state,0).frame,0);
});
test('front/back cycles deliberately reconstruct the other foot instead of replaying duplicate same-foot poses',()=>{
 for(const name of ['walkDown','walkUp','runDown','runUp']){
  const spec=ACTOR_CLIPS[name];assert.equal(spec.order.length,6);
  for(let step=0;step<3;step++){
   const first=orderedPose(name,step/6),opposite=orderedPose(name,(step+3)/6);
   assert.equal(first.index,opposite.index);assert.equal(first.mirror,false);assert.equal(opposite.mirror,true);
  }
 }
 for(const name of ['walkRight','runRight'])assert.deepEqual(ACTOR_CLIPS[name].order,[0,1,2,3,4,5]);
});
test('mirrored alternate poses preserve facing and wearable hand when gait crosses its half-cycle',()=>{
 const state=createActorMotion();state.speed=300;state.facing='up';state.gait=2/6;
 const before=actorPose(state);state.gait=3/6;const after=actorPose(state);
 assert.equal(before.poseMirror,false);assert.equal(after.poseMirror,true);assert.equal(after.facingFlipX,false);
 state.sprinting=true;const running=actorPose(state);assert.equal(running.step,3);assert.equal(running.poseMirror,true);
 state.facing='left';assert.equal(actorPose(state).flipX,true);assert.equal(actorPose(state).poseMirror,false);
});
test('every existing wardrobe id renders an editable layer with fixed foot anchor',()=>{
 assert.deepEqual(Object.keys(OUTFIT_PALETTES).sort(),WARDROBE.onesie.map(v=>v.id).sort());
 let draws=0;const g=new Proxy({},{get:(_,key)=>(...args)=>{if(key==='fillRect')draws++;return g;}});
 for(const {id}of WARDROBE.hat){const start=draws;drawHat(g,id,{x:0,y:-20});if(id!=='none')assert.ok(draws>start,id);}
 for(const {id}of WARDROBE.totem){const start=draws;drawTotem(g,id,{x:14,y:-4});if(id!=='none')assert.ok(draws>start,id);}
 for(const {id}of WARDROBE.flair){const start=draws;drawFlair(g,id,0,true);if(id!=='none')assert.ok(draws>start,id);}
 for(let row=0;row<8;row++)for(let index=0;index<6;index++)assert.deepEqual(actorAnchors({row,index}).feet,{x:0,y:16});
});

test('a failed image decode can retry on the next actor request',async()=>{
 const originalImage=globalThis.Image,originalDocument=globalThis.document;let attempts=0;
 globalThis.Image=class{get naturalWidth(){return this.src.includes('side-parts')?1536:887;}get naturalHeight(){return this.src.includes('side-parts')?1024:1774;}async decode(){if(++attempts===1)throw new Error('temporary decode failure');}};
 globalThis.document={createElement:()=>({width:0,height:0,getContext:()=>({drawImage(){},putImageData(){},save(){this.rigBaked=true;},restore(){},translate(){},rotate(){},scale(){},getImageData(x,y,width,height){const data=new Uint8ClampedArray(width*height*4);for(let i=3;i<data.length;i+=4)data[i]=255;data[0]=this.rigBaked?9:2;return {data};}})})};
 try{
  const {loadActorSource}=await import('../src/pixel-art/actor-textures.js?decode-retry-test');
  await assert.rejects(loadActorSource(),/temporary decode failure/);
  const source=await loadActorSource();assert.equal(attempts,3);assert.equal(source.frames.length,49);
  source.frames.forEach((frame,index)=>assert.equal(frame.data[0],[3,6,8].includes(Math.floor(index/6))?9:2,'replace the two side rows and add only neutral rest'));
  assert.equal(source.heldFrames.length,49);
  source.frames.forEach((frame,index)=>{if([3,6,8].includes(Math.floor(index/6)))assert.notEqual(source.heldFrames[index],frame,'held arm has its own side pose');else assert.equal(source.heldFrames[index],frame,'reuse front/back art across every totem');});
  assert.equal(await loadActorSource(),source);assert.equal(attempts,3,'successful source is reused');
 }finally{if(originalImage===undefined)delete globalThis.Image;else globalThis.Image=originalImage;if(originalDocument===undefined)delete globalThis.document;else globalThis.document=originalDocument;}
});

test('neutral side rest has both feet grounded close together and stable head/hand anchors',()=>{
 const rest=sideRigRestPose(),anchors=actorAnchors({row:8,index:0});
 assert.equal(rest.near.foot.y,0);assert.equal(rest.far.foot.y,0);assert.ok(Math.abs(rest.near.foot.x-rest.far.foot.x)<=4);
 assert.deepEqual(anchors.hand,{x:rest.near.wrist.x,y:16+rest.near.wrist.y});assert.equal(anchors.head.y,-20);
 const motion=createActorMotion();motion.facing='left';
 for(const elapsed of [0,800,10000])assert.equal(actorPose(motion,elapsed).frame,48);
});

test('visible footwear mask preserves raised dark and light shoes without exempting adjacent clothes',async()=>{
 const original=globalThis.ImageData;
 globalThis.ImageData=class{constructor(data,width,height){this.data=data;this.width=width;this.height=height;}};
 try{
  const {recolourActorFrame}=await import('../src/pixel-art/actor-textures.js');
  const data=new Uint8ClampedArray(64*80*4),mask=new Uint8Array(64*80),pixels=[[20,60,150,true],[21,61,255,true],[22,60,150,false]];
  for(const [x,y,shade,shoe]of pixels){const i=y*64+x;data.set([shade,shade,shade,255],i*4);mask[i]=Number(shoe);}
  const output=recolourActorFrame({data,footwearMask:mask},'lime','light').data;
  for(const [x,y,shade,shoe]of pixels){const i=(y*64+x)*4;if(shoe)assert.deepEqual([...output.slice(i,i+4)],[shade,shade,shade,255]);else assert.notDeepEqual([...output.slice(i,i+3)],[shade,shade,shade]);}
 }finally{if(original===undefined)delete globalThis.ImageData;else globalThis.ImageData=original;}
});

test('side rig alternates legs exactly and preserves walking ground contact and running flight',()=>{
 for(const clip of ['walkRight','runRight']){
  const poses=Array.from({length:6},(_,i)=>sideRigPose(clip,i));
  poses.forEach((pose,i)=>{
   const anchors=actorAnchors({row:clip==='runRight'?6:3,index:i});
   assert.deepEqual(anchors.hand,{x:pose.near.wrist.x,y:16+pose.near.wrist.y});assert.equal(anchors.head.y,-20+pose.bob);
   assert.deepEqual(pose.far.foot,poses[(i+3)%6].near.foot);
   assert.ok(Math.abs(pose.near.foot.x-pose.far.foot.x)>1,'distinct opposing legs in every pose');
   for(const leg of [pose.near,pose.far]){
    assert.ok(Math.abs(Math.hypot(leg.knee.x-pose.hip.x,leg.knee.y-pose.hip.y)-8)<1e-8);
    assert.ok(Math.abs(Math.hypot(leg.ankle.x-leg.knee.x,leg.ankle.y-leg.knee.y)-8)<1e-8);
   }
   if(clip==='walkRight')assert.ok(pose.near.foot.y===0||pose.far.foot.y===0,'one planted foot throughout a walk');
  });
  if(clip==='runRight')assert.equal(poses.filter(p=>p.near.foot.y<0&&p.far.foot.y<0).length,2,'one flight pose per half-cycle');
 }
});

test('side component source rectangles and joint pivots fit the measured RGBA asset',()=>{
 const png=readFileSync(new URL('../src/pixel-art/assets/raver-side-parts-v1.png',import.meta.url));
 assert.equal(png.readUInt32BE(16),ACTOR_SIDE_PARTS.width);assert.equal(png.readUInt32BE(20),ACTOR_SIDE_PARTS.height);assert.equal(png[25],6);
 for(const {rect:[x,y,w,h],pivot,end}of Object.values(ACTOR_SIDE_PARTS.parts)){
  assert.ok(x>=0&&y>=0&&x+w<=ACTOR_SIDE_PARTS.width&&y+h<=ACTOR_SIDE_PARTS.height);
  for(const [px,py]of [pivot,...(end?[end]:[])])assert.ok(px>=x&&px<=x+w&&py>=y&&py<=y+h);
 }
});

test('cat-ear band and headphone cups overlap the top of the authored head',()=>{
 for(const id of ['cat','headphones']){
  const rects=[],g={clear(){return this;},fillStyle(){return this;},fillRect(x,y,w,h){rects.push({x,y,w,h});return this;}};
  drawHat(g,id,{x:0,y:-20});
  assert.ok(rects.some(r=>r.x<8&&r.x+r.w>-8&&r.y<=-27&&r.y+r.h>=-25),`${id} attaches at the hair crown`);
 }
});
