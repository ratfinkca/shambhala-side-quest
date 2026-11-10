import test from 'node:test';
import assert from 'node:assert/strict';
import {createSMFStageLighting} from '../src/editions/smf-stage-lighting.js';
import {getTiming} from '../src/stage-clock.js';
import {SMF_PREVIEW_STAGES} from '../src/editions/smf-stages.js';

const stage={id:'smf-fractal',timingId:'smf-fractal-clock-preview-1'},timing=getTiming(stage.timingId);
const lamps=[300,370,440,510,580,650].map(x=>[x,140]);
function drawing({failBake=0,rendererType=1}={}){
 const nodes=[],textures=new Map(),removed=[],bakes=[];
 class Node{
  constructor(type,x=0,y=0,key){Object.assign(this,{type,x,y,key,alpha:1,scaleX:1,scaleY:1,rotation:0,ops:[],dead:false});nodes.push(this);}
  setPosition(x,y){this.x=x;this.y=y;return this;}
  setDepth(depth){this.depth=depth;return this;}
  setBlendMode(blend){this.blend=blend;return this;}
  setOrigin(x,y){this.origin=[x,y];return this;}
  setAlpha(alpha){this.alpha=alpha;return this;}
  setScale(x,y=x){this.scaleX=x;this.scaleY=y;return this;}
  fillStyle(...args){this.ops.push(['fillStyle',...args]);return this;}
  fillPoints(...args){this.ops.push(['fillPoints',...args]);return this;}
  fillEllipse(...args){this.ops.push(['fillEllipse',...args]);return this;}
  generateTexture(key,width,height){
   const bake={key,width,height,blend:this.blend,ops:structuredClone(this.ops),node:this};
   textures.set(key,bake);bakes.push(bake);
   if(bakes.length===failBake)throw new Error('Texture creation failed');
   return this;
  }
  destroy(){this.dead=true;}
 }
 const scene={
  sys:{game:{renderer:{type:rendererType}}},
  add:{graphics:()=>new Node('graphics'),image:(x,y,key)=>new Node('image',x,y,key),circle:(x,y)=>new Node('circle',x,y)},
  textures:{createCanvas(){},exists:key=>textures.has(key),remove(key){
   assert.ok(nodes.filter(n=>n.key===key).every(n=>n.dead),'display images must be released before their texture');
   removed.push(key);textures.delete(key);
  }},
 };
 return {scene,nodes,textures,removed,bakes};
}
function dispose(d,rig){d.nodes.forEach(n=>n.destroy());rig.destroy();}

test('a paused new rig already has its quiet aimed composition and honours reduced motion',()=>{
 const d=drawing();d.scene.reducedMotion=true;
 const rig=createSMFStageLighting(d.scene,stage,lamps),rays=d.nodes.filter(n=>n.type==='image');
 assert.ok(rays.every(n=>n.alpha>=0&&n.alpha<.5),'no beam is left at its full-strength default');
 assert.ok(rays.some(n=>n.rotation!==0),'the beams are aimed before the first game update');
 const state=()=>d.nodes.filter(n=>!n.dead).map(({x,y,rotation,alpha,scaleX,scaleY})=>({x,y,rotation,alpha,scaleX,scaleY}));
 const initial=state();rig.update(30000,true,timing);assert.deepEqual(state(),initial);
 dispose(d,rig);
});

test('four small baked textures replace beam paths and remain unchanged while lighting moves',()=>{
 const d=drawing(),rig=createSMFStageLighting(d.scene,stage,lamps);
 assert.equal(d.bakes.length,4);assert.equal(d.textures.size,4);
 for(const bake of d.bakes){
  assert.equal(bake.width,320);assert.equal(bake.height,760);assert.equal(bake.blend,1);
  assert.ok(bake.node.dead,'temporary drawing is removed from the live scene');
  const polygons=bake.ops.filter(o=>o[0]==='fillPoints');assert.equal(polygons.length,42);
  assert.ok(polygons.every(([,points])=>points.every(p=>p.x>=0&&p.x<=320&&p.y>=0&&p.y<=760)),'the complete feathered shaft fits its texture');
 }
 const rays=d.nodes.filter(n=>n.type==='image');assert.equal(rays.length,16);
 assert.equal(new Set(rays.map(n=>n.key)).size,4);
 assert.ok(rays.every(n=>n.origin[0]===.5&&n.origin[1]===0&&n.blend===1));
 assert.ok(d.nodes.filter(n=>!n.dead&&n.type==='graphics').every(n=>!n.ops.some(o=>o[0]==='fillPoints')),'live graphics contain no shaft polygons');
 const drawCount=d.nodes.reduce((n,node)=>n+node.ops.length,0);
 rig.update(1000,false,timing);const first=rays.map(n=>[n.rotation,n.alpha]);
 for(let t=2000;t<20000;t+=37)rig.update(t,false,timing);
 assert.notDeepEqual(rays.map(n=>[n.rotation,n.alpha]),first);
 assert.equal(d.bakes.length,4,'animation does not regenerate textures');
 assert.equal(d.nodes.reduce((n,node)=>n+node.ops.length,0),drawCount,'animation only transforms the existing drawings');
 dispose(d,rig);assert.equal(d.textures.size,0);
});

test('WebGL keeps native additive vectors instead of baking with its incompatible Canvas blend table',()=>{
 const d=drawing({rendererType:2}),rig=createSMFStageLighting(d.scene,stage,lamps);
 assert.equal(d.bakes.length,0);assert.equal(d.textures.size,0);
 assert.equal(d.nodes.filter(n=>n.type==='image').length,0);
 const rays=d.nodes.filter(n=>n.ops.some(o=>o[0]==='fillPoints'));
 assert.equal(rays.length,16);
 assert.ok(rays.every(n=>n.blend===1&&n.ops.filter(o=>o[0]==='fillPoints').length===42));
 assert.ok(rays.every(n=>n.alpha>=0&&n.alpha<.5),'the fallback is initialized as quietly as cached beams');
 const before=rays.map(n=>[n.rotation,n.alpha]);rig.update(4000,false,timing);
 assert.notDeepEqual(rays.map(n=>[n.rotation,n.alpha]),before);
 dispose(d,rig);assert.equal(d.removed.length,0);
});

test('coexisting rigs use independent texture keys and idempotent disposal',()=>{
 const d=drawing(),a=createSMFStageLighting(d.scene,stage,lamps),aNodes=[...d.nodes];
 const aKeys=new Set(d.textures.keys()),b=createSMFStageLighting(d.scene,stage,lamps);
 const bKeys=[...d.textures.keys()].filter(key=>!aKeys.has(key));assert.equal(bKeys.length,4);
 aNodes.forEach(n=>n.destroy());a.destroy();a.destroy();
 assert.equal(d.removed.length,4);assert.deepEqual([...d.textures.keys()],bKeys);
 dispose(d,b);assert.equal(d.textures.size,0);assert.equal(d.removed.length,8);
});

test('repeated venue switches release every generated texture',()=>{
 const d=drawing();
 for(let i=0;i<20;i++){
  const rig=createSMFStageLighting(d.scene,stage,lamps);
  assert.equal(d.textures.size,4);rig.update(i*500,false,timing);dispose(d,rig);
  assert.equal(d.textures.size,0);
 }
 assert.equal(new Set(d.removed).size,80);
});

test('reduced motion fixes the cached images to a stable composition',()=>{
 const d=drawing(),rig=createSMFStageLighting(d.scene,stage,lamps);
 const state=()=>d.nodes.filter(n=>!n.dead).map(({x,y,rotation,alpha,scaleX,scaleY})=>({x,y,rotation,alpha,scaleX,scaleY}));
 rig.update(0,true,timing);const first=state();rig.update(30000,true,timing);assert.deepEqual(state(),first);
 dispose(d,rig);
});

test('a failed bake removes temporary drawings and any partially created textures',()=>{
 const d=drawing({failBake:3});
 assert.throws(()=>createSMFStageLighting(d.scene,stage,lamps),/Texture creation failed/);
 assert.equal(d.textures.size,0);assert.ok(d.nodes.every(n=>n.dead));
});

for(const venue of SMF_PREVIEW_STAGES)test(`${venue.id} keeps every live light finite, below gameplay and within opacity limits`,()=>{
 const d=drawing(),clock=getTiming(venue.timingId),rig=createSMFStageLighting(d.scene,venue,lamps);
 for(let t=0;t<=clock.durationMs;t+=311){
  rig.update(t,false,clock);
  for(const node of d.nodes.filter(n=>!n.dead)){
   assert.ok([node.x,node.y,node.rotation,node.alpha,node.scaleX,node.scaleY].every(Number.isFinite));
   assert.ok(node.alpha>=0&&node.alpha<=1);assert.ok(node.depth<1);
   assert.ok(node.scaleX>0&&node.scaleY>0);
  }
 }
 const state=()=>d.nodes.filter(n=>!n.dead).map(({x,y,rotation,alpha,scaleX,scaleY})=>({x,y,rotation,alpha,scaleX,scaleY}));
 rig.update(0,true,clock);const frozen=state();
 rig.update(clock.dropStartsMs[0]+1000,true,clock);assert.deepEqual(state(),frozen);
 dispose(d,rig);assert.equal(d.textures.size,0);
});
