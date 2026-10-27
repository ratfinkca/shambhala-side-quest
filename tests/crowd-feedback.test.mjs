import test from 'node:test';
import assert from 'node:assert/strict';
import {Crowd} from '../src/Crowd.js';
import {createRound} from '../src/game.js';
import {crowdPosition} from '../src/festival.js';
function fixture(){
 // Chainable drawing stub: exercise actual encounter and Crowd update logic.
 function node(){const target={};const proxy=new Proxy(target,{get(t,k){if(k in t)return t[k];return (...args)=>{if(k==='setAlpha')t.alpha=args[0];if(k==='setScale')t.scale=args[0];return proxy;};}});return proxy;}
 const scene={add:new Proxy({},{get:()=>node}),game:{events:{emit(){}}},effect(){}};
 const crowd=new Crowd(scene);crowd.configure({crowdAnchors:[[300,300]],obstacles:[]});
 return {crowd,round:createRound()};
}
function pass(clearance,reduced=false){
 const {crowd,round}=fixture();
 for(const [i,x] of [-60,-20,20,60].entries()){
  round.remainingMs=60000-i*100;
  const pos=crowdPosition(0,i*100,crowd.stage.crowdAnchors);
  crowd.update({x:pos.x+x,y:pos.y+clearance},round,reduced);
 }
 return {crowd,round};
}
test('clean passes light concentric feedback; tighter passes glow stronger; collisions do not',()=>{
 const tight=pass(30),wide=pass(44),bump=pass(0);
 assert.equal(tight.round.closePasses,1);assert.equal(wide.round.closePasses,1);
 assert.ok(tight.crowd.people[0].smooth.alpha>wide.crowd.people[0].smooth.alpha);
 assert.equal(bump.crowd.people[0].smooth.alpha,0);
 const {crowd,round}=tight;
 round.remainingMs-=700;crowd.update({x:900,y:900},round,false);
 assert.equal(crowd.people[0].smooth.alpha,0);
 crowd.reset();assert.equal(crowd.people[0].smooth.alpha,0);
 const reduced=pass(30,true);assert.equal(reduced.crowd.people[0].smooth.scale,1);
});
