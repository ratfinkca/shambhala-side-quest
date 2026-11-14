import test from 'node:test';
import assert from 'node:assert/strict';
import {createPixelPickup,updatePixelPickup} from '../src/pixel-art/items.js';
import {createPixelProp,setPixelProp} from '../src/pixel-art/props.js';
import {pixelEllipse,pixelLine,pixelizeGraphics} from '../src/pixel-art/shapes.js';
import {playerAvatarAnchors} from '../src/pixel-art/player-anchors.js';
import {getAvatarAnchors} from '../src/Avatar.js';

function harness(){
 const scene={game:{},textures:{keys:new Map(),exists(key){return this.keys.has(key);},addImage(key){const t={frames:[],add(...args){this.frames.push(args);},setFilter(value){this.filter=value;}};this.keys.set(key,t);return t;}}};
 const node=()=>{let display;display=new Proxy({scene,active:true,x:0,y:0,list:[],draws:[],setPosition(x,y){this.x=x;this.y=y;return this;},add(child){this.list.push(child);return this;},destroy(){this.scene=null;this.active=false;},setFrame(frame){this.frame=frame;return this;}},{get(object,key){if(key in object)return object[key];return (...args)=>{object.draws.push([key,...args]);return display;};}});return display;};
 scene.add={container:node,graphics:node,sprite(...args){const n=node();n.frame=args[3];return n;},image(...args){const n=node();n.frame=args[3];return n;}};return scene;
}
test('pixel outlines form finite, stepped paths and preserve a real graphics identity',()=>{
 for(const path of [pixelEllipse(41,18,50,29),pixelLine(-8,12,31,-20)])for(let i=1;i<path.length;i++){
  assert.ok(Number.isFinite(path[i].x)&&Number.isFinite(path[i].y));
  assert.ok(path[i].x===path[i-1].x||path[i].y===path[i-1].y);
 }
 const g=harness().add.graphics();assert.equal(pixelizeGraphics(g),g);assert.equal(pixelizeGraphics(g),g);
 g.strokeCircle(0,0,30);assert.ok(g.draws.some(([name])=>name==='strokePoints'));
});
test('pixel pickup animation changes only its frame and reduced motion freezes it',()=>{
 const node=createPixelPickup(harness(),'spark');node.setPosition(123,456);
 updatePixelPickup(node,350);assert.equal(node.pixelFrame,2);assert.deepEqual([node.x,node.y],[123,456]);
 updatePixelPickup(node,20000,true);assert.equal(node.pixelFrame,0);
 assert.throws(()=>createPixelPickup(harness(),'unknown'),/Unknown/);
 assert.throws(()=>setPixelProp(createPixelProp(harness(),'seed'),'unknown'),/Unknown/);
});
test('generated sheets share decoding, keep current state on arrival, and never attach to destroyed scenes',async()=>{
 const previous=globalThis.Image,loads=[];
 globalThis.Image=class {set src(value){this.url=value;loads.push(this);}};
 try{
  const scene=harness(),live=createPixelPickup(scene,'flow'),dead=createPixelPickup(scene,'flow');dead.destroy();
  const prop=createPixelProp(scene,'lantern-off'),deadProp=createPixelProp(scene,'seed');deadProp.destroy();
  updatePixelPickup(live,350);setPixelProp(prop,'lantern-on');
  assert.equal(loads.length,2);loads.forEach(image=>image.onload());await Promise.resolve();
  assert.equal(live.pixelSprite.frame,'flow-2');assert.equal(prop.propSprite.frame,'lantern-on');
  assert.equal(dead.list.length,1);assert.equal(deadProp.list.length,1);
  assert.equal(scene.textures.keys.size,2);
  for(const texture of scene.textures.keys.values()){assert.equal(texture.filter,1);assert.ok(texture.frames.length>=12);}
 }finally{if(previous===undefined)delete globalThis.Image;else globalThis.Image=previous;}
});
test('player-held props use the nested avatar facing, pose and bass offset without moving the physics body',()=>{
 const scene={dancer:{x:500,y:300},avatar:{x:3,y:-2,pixelPose:{row:3,index:0,facingFlipX:true}}};
 const before=structuredClone(scene),anchors=playerAvatarAnchors(scene);
 const local=getAvatarAnchors(scene.avatar);
 assert.deepEqual(anchors.hand,{x:local.hand.x+3,y:local.hand.y-2});assert.equal(anchors.head.x,2);assert.equal(anchors.head.y,getAvatarAnchors(scene.avatar).head.y-2);
 assert.equal(anchors.headwear.x,local.headwear.x+3);assert.equal(anchors.headwear.y,local.headwear.y-2);
 assert.deepEqual(anchors.headwear.crown,{x:local.headwear.crown.x+3,y:local.headwear.crown.y-2});
 assert.deepEqual(scene,before);
 scene.avatar.pixelPose.index=2;assert.equal(playerAvatarAnchors(scene).head.y,anchors.head.y-1);
 const standalone={dancer:{x:500,y:300}};assert.equal(playerAvatarAnchors(standalone).hand.x,getAvatarAnchors(standalone.dancer).hand.x,'standalone fallback must not double world coordinates');
});
