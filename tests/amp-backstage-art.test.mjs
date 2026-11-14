import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {AMP_DELIVERY_STAGE,createAMPBackstageView,preloadAMPBackstageArt} from '../src/amp-delivery-view.js';

test('AMP backstage queues its local pixel plate only until the texture exists',()=>{
 const queued=[];
 const scene={textures:{exists:()=>false},load:{image(key,url){queued.push({key,url});}}};
 preloadAMPBackstageArt(scene);
 assert.equal(queued.length,1);
 const [{key,url}]=queued;
 assert.match(url,/amp-backstage-pixel-v1\.webp$/);
 assert.equal(readFileSync(new URL(url)).subarray(8,12).toString(),'WEBP');
 scene.textures.exists=textureKey=>textureKey===key;
 preloadAMPBackstageArt(scene);
 assert.equal(queued.length,1);
});

test('AMP scenery sits behind the playable clearing and does not claim other stages',()=>{
 const drawn=[];
 const frames=[];
 const image={
  setOrigin(){return this;},
  setDisplaySize(width,height){this.width=width;this.height=height;return this;},
  setDepth(depth){this.depth=depth;return this;},
 };
 const scene={
  textures:{exists:()=>true,get:()=>({setFilter(mode){frames.push(mode);}})},
  add:{
   image(x,y,key){drawn.push({x,y,key});return image;},
   graphics(){return drawingStub();},
  },
 };
 assert.equal(createAMPBackstageView(scene,{id:'forest'}),null);
 assert.deepEqual(drawn,[]);
 const view=createAMPBackstageView(scene,AMP_DELIVERY_STAGE);
 assert.equal(view.ownsLighting,true);
 assert.equal(drawn.length,1);
 assert.equal(image.width,960);
 assert.ok(image.depth<0);
 assert.ok(drawn[0].y+320*image.height/1024<AMP_DELIVERY_STAGE.playBounds.minY);
 assert.deepEqual(frames,[1]);
 view.update(150,'drop',false);
 view.update(150,'drop',true);
});

function drawingStub(){
 return new Proxy({},{get:(_,key,graphics)=>typeof key==='symbol'?undefined:()=>graphics});
}
