import test from 'node:test';
import assert from 'node:assert/strict';
import {createView,preload} from '../src/prism-practice/view.js';
import {PRISM} from '../src/prism-practice/model.js';

function sceneDouble(hasArt=false){
 const nodes=[],loads=[],filters=[];
 const scene={
  textures:{exists:()=>hasArt,get:()=>({setFilter:value=>filters.push(value)})},
  load:{image:(...args)=>loads.push(args)},
  add:{},
 };
 function node(kind){
  const result={kind,scene,depth:0,calls:[],destroyed:0,
   setDepth(depth){this.depth=depth;return this;},
   clear(){this.calls=[];return this;},
   destroy(){this.destroyed++;this.scene=null;},
  };
  for(const name of ['fillStyle','fillRect','fillPoints','strokePoints','lineStyle','strokeRect','setOrigin','setDisplaySize']){
   result[name]=function(...args){this.calls.push([name,...args]);return this;};
  }
  nodes.push(result);return result;
 }
 scene.add.graphics=()=>node('graphics');
 scene.add.image=(...args)=>{const image=node('image');image.args=args;return image;};
 return {scene,nodes,loads,filters};
}
const venue={id:'smf-prism-party-preview'};
const progress={phase:'party',entered:true,activeZone:1,charges:[3000,1200,0],progress:1};

test('Prism view handles preview and production stages and preloads its lossless delivery art',()=>{
 const fixture=sceneDouble();
 assert.equal(createView(fixture.scene,{id:'smf-fractal-forest'}),null);
 assert.equal(fixture.nodes.length,0);
 preload(fixture.scene);
 assert.equal(fixture.loads.length,1);
 assert.match(fixture.loads[0][1],/prism-party-pixel-v1\.webp$/);
 for(const id of ['smf-prism-party-preview','smf-prism-party']){
  const supported=sceneDouble();
  assert.equal(createView(supported.scene,{id}).ownsLighting,true);
  assert.ok(supported.nodes.length>0);
 }
 const loaded=sceneDouble(true);preload(loaded.scene);
 assert.equal(loaded.loads.length,0);
});

test('Prism illustration keeps nearest-neighbour filtering and gameplay scale',()=>{
 const fixture=sceneDouble(true),view=createView(fixture.scene,venue);
 assert.equal(view.ownsLighting,true);
 const image=fixture.nodes.find(n=>n.kind==='image');
 assert.deepEqual(image.calls.find(call=>call[0]==='setDisplaySize'),['setDisplaySize',960,640]);
 assert.deepEqual(fixture.filters,[1]);
 assert.equal(image.depth,-4);
});

test('reduced-motion Prism lighting stays still across musical beats and the finale',()=>{
 const fixture=sceneDouble(true),view=createView(fixture.scene,venue);
 view.setProgress(progress);
 view.update(3000,'drop',true,{bpm:120});
 const still=JSON.stringify(fixture.nodes.map(n=>n.calls));
 view.update(18000,'drop',true,{bpm:120});
 assert.equal(JSON.stringify(fixture.nodes.map(n=>n.calls)),still);
 view.setProgress({...progress,phase:'celebrating',charges:[3000,3000,3000],celebrationMs:500});
 view.update(19000,'drop',true,{bpm:120});
 const finale=JSON.stringify(fixture.nodes.map(n=>n.calls));
 view.setProgress({...progress,phase:'celebrating',charges:[3000,3000,3000],celebrationMs:3000});
 view.update(21500,'drop',true,{bpm:120});
 assert.equal(JSON.stringify(fixture.nodes.map(n=>n.calls)),finale);
 assert.equal(fixture.nodes.find(n=>n.depth===23).calls.length,0,'reduced motion omits moving confetti');
});

test('the roof reveals after a long approach and stays open when the music loops',()=>{
 const fixture=sceneDouble(true),view=createView(fixture.scene,venue);
 const roof=fixture.nodes.find(node=>node.depth===22);
 const coverAlpha=()=>roof.calls.find(call=>call[0]==='fillStyle')[2];
 view.update(50000,'normal',false);
 const covered=coverAlpha();
 // Entry restarts the musical clock, but the player's approach duration must
 // not delay the reveal or get subtracted from time spent inside.
 view.setProgress({...progress,partyMs:0});
 view.update(0,'normal',false);
 assert.equal(coverAlpha(),covered);
 view.setProgress({...progress,partyMs:350});
 view.update(350,'normal',false);
 const halfway=coverAlpha();
 assert.ok(halfway<covered&&halfway>0);
 view.setProgress({...progress,partyMs:1000});
 view.update(1000,'normal',false);
 const open=coverAlpha();
 assert.ok(open<halfway);
 view.setProgress({...progress,partyMs:64500});
 view.update(500,'normal',false);
 assert.equal(coverAlpha(),open,'arrangement loop must not re-close the roof');
});

test('celebration particles stop on completion and disposal remains safe after renderer disposal',()=>{
 const fixture=sceneDouble(),view=createView(fixture.scene,venue);
 view.setProgress({...progress,phase:'celebrating',charges:[3000,3000,3000],celebrationMs:1700});
 view.update(20000,'drop',false);
 const confetti=fixture.nodes.find(n=>n.depth===23);
 assert.ok(confetti.calls.some(call=>call[0]==='fillRect'));
 view.setProgress({...progress,phase:'complete',complete:true,charges:[3000,3000,3000],celebrationMs:PRISM.celebrationMs});
 view.update(24000,'normal',false);
 assert.equal(confetti.calls.length,0);
 // StageRenderer owns the nodes and destroys them before view.destroy().
 fixture.nodes.forEach(n=>n.destroy());
 const before=JSON.stringify(fixture.nodes.map(n=>n.calls));
 view.destroy();view.destroy();view.update(25000);view.setProgress(progress);
 assert.ok(fixture.nodes.every(n=>n.destroyed===1));
 assert.equal(JSON.stringify(fixture.nodes.map(n=>n.calls)),before);
});
