import test from 'node:test';
import assert from 'node:assert/strict';
import {createRound,advanceRound} from '../src/game.js';
import {createMystery,collectMystery,mysteryDirection,mysterySpeed,findCandySpawn} from '../src/mystery.js';
import {moveInArena,isOpen} from '../src/geometry.js';
import {STAGES} from '../src/stages.js';

function roundWithCandy(){const r=createRound();r.mystery=createMystery(()=>0);return r;}
test('candy has one 80 percent opportunity per stage and expires after ten active seconds',()=>{
 assert.equal(createMystery(()=>.8).phase,'absent');
 assert.equal(createMystery(()=>.799).phase,'waiting');
 const r=roundWithCandy();
 advanceRound(r,11999);assert.equal(r.mystery.phase,'waiting');
 assert.equal(collectMystery(r,()=>0),null);
 advanceRound(r,1);assert.equal(r.mystery.phase,'available');
 advanceRound(r,9999);assert.equal(r.mystery.phase,'available');
 advanceRound(r,1);assert.equal(r.mystery.phase,'spent');
 assert.equal(collectMystery(r,()=>0),null);
 advanceRound(r,20000);assert.equal(r.mystery.phase,'spent');
 const skipped=roundWithCandy();advanceRound(skipped,30000);assert.equal(skipped.mystery.phase,'spent');
});
test('all effects last five active seconds, award no points, cannot stack and clear at round end',()=>{
 for(const [roll,effect] of [[0,'speed'],[.4,'dizzy'],[.9,'waves']]){
  const r=roundWithCandy();advanceRound(r,12000);
  assert.equal(collectMystery(r,()=>roll),effect);
  assert.equal(collectMystery(r,()=>roll),null);
  assert.equal(r.score,0);assert.equal(r.pickups,0);assert.equal(r.chain,0);
  advanceRound(r,0);assert.equal(r.mystery.effectMs,5000);
  advanceRound(r,4999);assert.equal(r.mystery.effectMs,1);
  advanceRound(r,1);assert.equal(r.mystery.effect,null);
  assert.equal(r.mystery.phase,'spent');
 }
 const r=roundWithCandy();advanceRound(r,12000);collectMystery(r,()=>0);
 advanceRound(r,60000);assert.equal(r.mystery.effectMs,0);assert.equal(r.mystery.effect,null);
 assert.equal(collectMystery(r),null);assert.equal(createRound().mystery.effect,null);
});
test('speed preserves collision safety and dizzy preserves forward progress and stops at rest',()=>{
 const r=roundWithCandy();advanceRound(r,12000);collectMystery(r,()=>0);
 assert.equal(mysterySpeed(r.mystery),750);
 const p={x:80,y:100},obstacles=[{x:100,y:50,width:30,height:200}];
 moveInArena(p,{x:1,y:0},1000,{obstacles,speed:mysterySpeed(r.mystery)});
 assert.ok(isOpen(p,14,obstacles));assert.ok(p.x<=86);
 r.mystery.effect='dizzy';assert.equal(mysterySpeed(r.mystery),300);
 let changed=false;
 for(let elapsedMs=0;elapsedMs<5000;elapsedMs+=100){
  r.mystery.elapsedMs=elapsedMs;
  const d=mysteryDirection(r.mystery,{x:1,y:0});
  assert.ok(d.x>.9);assert.ok(Math.abs(Math.hypot(d.x,d.y)-1)<1e-10);
  if(Math.abs(d.y)>.01)changed=true;
  assert.deepEqual(mysteryDirection(r.mystery,{x:0,y:0}),{x:0,y:0});
  assert.deepEqual(mysteryDirection(r.mystery,{x:1,y:0},0),{x:1,y:0});
 }
 assert.ok(changed);
});
test('optional candy avoids hazards, other pickups and the player, or skips an unsafe spawn',()=>{
 let seed=12;const rng=()=>((seed=(seed*1664525+1013904223)>>>0)/4294967296);
 for(const stage of STAGES)for(let i=0;i<100;i++){
  const avoid=[{...stage.spawn,radius:100},...stage.flowSpawns.map(p=>({...p,radius:45}))];
  const p=findCandySpawn(stage,avoid,rng);
  if(p){assert.ok(isOpen(p,24,stage.obstacles));for(const a of avoid)assert.ok(Math.hypot(p.x-a.x,p.y-a.y)>a.radius);}
 }
 assert.equal(findCandySpawn(STAGES[0],[{x:480,y:320,radius:2000}],()=>.5),null);
});
