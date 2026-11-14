import test from 'node:test';
import assert from 'node:assert/strict';
import {registerHooks} from 'node:module';
import {STAGES} from '../src/stages.js';
import {speakerCones} from '../src/geometry.js';
import {getTiming} from '../src/stage-clock.js';

registerHooks({
 resolve(specifier,context,next){return specifier==='phaser'?{url:'test:pixel-stage-phaser',shortCircuit:true}:next(specifier,context);},
 load(url,context,next){return url==='test:pixel-stage-phaser'?{format:'module',shortCircuit:true,source:`
  class RandomDataGenerator {
   constructor(){this.seed=12345;}
   realInRange(min,max){this.seed=(Math.imul(this.seed,1664525)+1013904223)>>>0;return min+(max-min)*this.seed/4294967296;}
   between(min,max){return Math.floor(this.realInRange(min,max+1));}
  }
  export default {Math:{RandomDataGenerator}};
 `}:next(url,context);},
});
const {StageRenderer}=await import('../src/StageRenderer.js');

function drawing(){
 const nodes=[],calls=[];
 const scene={children:{list:nodes},add:new Proxy({}, {get:(_,kind)=>(...args)=>{
  const data={kind,args,x:0,y:0,dead:false,destroy(){this.dead=true;}};
  let node;
  node=new Proxy(data,{get(target,key){
   if(key in target)return target[key];
   return (...values)=>{
    if(key==='setPosition')[target.x,target.y]=values;
    if(key==='setScale')[target.scaleX,target.scaleY=values[0]]=values;
    if(key==='setAlpha')target.alpha=values[0];
    calls.push([key,...values]);return node;
   };
  }});
  nodes.push(node);return node;
 }})};
 return {scene,nodes,calls};
}

for(const stage of STAGES)test(`pixel ${stage.id} scenery preserves obstacle geometry and disposes cleanly`,()=>{
 const before=structuredClone(stage),d=drawing(),renderer=new StageRenderer(d.scene);
 renderer.show(stage);
 assert.equal(renderer.fireflies.length,28);
 assert.equal(renderer.concertBeams.length,6);
 const cones=stage.obstacles.flatMap(speakerCones);
 assert.deepEqual(renderer.speakerCones.map(({x,y})=>({x,y})),cones.map(({x,y})=>({x,y})));
 assert.deepEqual(renderer.bassPulses.map(({x,y})=>({x,y})),cones.map(({x,y})=>({x,y})));
 for(const box of stage.obstacles)assert.ok(d.calls.some(c=>c[0]==='fillRect'&&c[1]===box.x&&c[2]===box.y&&c[3]===box.width&&c[4]===box.height));
 const state=()=>renderer.concertBeams.map(n=>[n.rotation,n.alpha,n.scaleX,n.scaleY]);
 renderer.update(1000,'drop',true,getTiming());const quiet=state();
 renderer.update(30000,'drop',true,getTiming());assert.deepEqual(state(),quiet);
 renderer.update(1600,'drop',false,getTiming());assert.notDeepEqual(state(),quiet);
 assert.deepEqual(stage,before);
 const owned=[...d.nodes];renderer.show(STAGES[(STAGES.indexOf(stage)+1)%STAGES.length]);
 assert.ok(owned.every(n=>n.dead));renderer.destroy();renderer.destroy();
 assert.ok(d.nodes.every(n=>n.dead));
});
