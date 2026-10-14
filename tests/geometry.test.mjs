import test from 'node:test';
import assert from 'node:assert/strict';
import {moveInArena,isOpen,findSpawn,movementFactor} from '../src/geometry.js';
import {STAGES} from '../src/stages.js';
import {crowdPosition,createEncounter,updateEncounter,applyBump} from '../src/festival.js';
import {createRound} from '../src/game.js';
test('bass slows progressively, never stacks with mud or bumps, and allows escape',()=>{
 const speakers=[{x:100,y:100,width:60,height:60}],mud=[{x:0,y:0,width:300,height:300}];
 assert.equal(movementFactor({x:181,y:134},[],0,speakers),.2);
 assert.equal(movementFactor({x:240,y:134},[],0,speakers),.5);
 assert.equal(movementFactor({x:241,y:134},[],0,speakers),1);
 assert.equal(movementFactor({x:210,y:214},[],0,speakers),1);
 assert.equal(movementFactor({x:130,y:244},[],0,speakers),.5);
 assert.equal(movementFactor({x:181,y:134},mud,600,[...speakers,...speakers]),.2);
 assert.ok(movementFactor({x:210,y:134},[],0,speakers)>.2);
 const p={x:174,y:134};
 for(let i=0;i<200;i++)moveInArena(p,{x:1,y:0},16*movementFactor(p,[],0,speakers),{obstacles:speakers});
 assert.ok(p.x>240);assert.equal(movementFactor(p,[],0,speakers),1);
});
test('bass-biased sparks stay accessible near speakers and fall back when occupied',()=>{
 const stage={obstacles:[{x:300,y:300,width:60,height:60}],spawn:{x:480,y:410}};
 const p=findSpawn(stage,()=>.5,[],true);
 assert.ok(isOpen(p,24,stage.obstacles));
 assert.ok(movementFactor(p,[],0,stage.obstacles)<1);
 const blocked=findSpawn(stage,()=>.5,[{x:330,y:330,radius:160}],true);
 assert.ok(Math.hypot(blocked.x-330,blocked.y-330)>160);
});
test('mud follows its visible polygon, including edges and concave gaps, without stacking slowdown',()=>{
 const mud=[{points:[{x:0,y:0},{x:20,y:0},{x:20,y:8},{x:8,y:8},{x:8,y:20},{x:0,y:20}]}];
 for(const p of [{x:4,y:4},{x:16,y:4},{x:4,y:16},{x:8,y:12},{x:0,y:0}]){
  assert.equal(movementFactor(p,mud,0),.5);
  assert.equal(movementFactor(p,mud,600),.5);
 }
 for(const p of [{x:16,y:16},{x:-1,y:4},{x:21,y:4}])assert.equal(movementFactor(p,mud,0),1);
 assert.equal(movementFactor({x:16,y:16},mud,600),.5);
});
test('wall collision slides and long frames cannot tunnel or escape bounds',()=>{
 const obstacles=[{x:100,y:50,width:30,height:200}],p={x:80,y:100};
 for(let i=0;i<30;i++)moveInArena(p,{x:1,y:1},1000,{width:300,height:300,obstacles,speed:300});
 assert.ok(isOpen(p,14,obstacles));assert.ok(p.y>100);assert.ok(p.x<100||p.y>264);
 const q={x:80,y:100};moveInArena(q,{x:1,y:0},10000,{width:300,height:300,obstacles,speed:300});assert.ok(q.x<=86);
 moveInArena(q,{x:-1,y:-1},10000,{width:300,height:300,obstacles,speed:300});assert.ok(q.x>=14&&q.y>=14);
 assert.equal(movementFactor({x:5,y:5},[{x:0,y:0,width:10,height:10}],600),.5);
});
test('all stages have connected open pickup space and safe crowd movement',()=>{
 let seed=10;const rng=()=>((seed=(seed*1664525+1013904223)>>>0)/4294967296);
 for(const s of STAGES){
  assert.ok(isOpen(s.spawn,14,s.obstacles));for(const f of s.flowSpawns)assert.ok(isOpen(f,28,s.obstacles));
  for(let i=0;i<1000;i++)assert.ok(isOpen(findSpawn(s,rng,[]),24,s.obstacles));
  assert.ok(isOpen(findSpawn(s,()=>.4,[]),24,s.obstacles));
  for(let t=0;t<=60000;t+=1000)for(let i=0;i<s.crowdAnchors.length;i++)assert.ok(isOpen(crowdPosition(i,t,s.crowdAnchors),14,s.obstacles));
  const open=new Set();for(let x=140;x<=820;x+=20)for(let y=180;y<=580;y+=20)if(isOpen({x,y},14,s.obstacles))open.add(`${x},${y}`);
  const todo=[open.values().next().value],seen=new Set(todo);for(let i=0;i<todo.length;i++){const [x,y]=todo[i].split(',').map(Number);for(const [dx,dy] of [[20,0],[-20,0],[0,20],[0,-20]]){const key=`${x+dx},${y+dy}`;if(open.has(key)&&!seen.has(key)){seen.add(key);todo.push(key)}}}assert.equal(seen.size,open.size);
 }
});
test('noodle protects a whole contact, not just one frame, and cannot earn a pass',()=>{
 const round=createRound({bumpShields:1}),e=createEncounter(),d={x:100,y:100};
 for(let i=0;i<10;i++){const hit=updateEncounter(e,{x:100,y:100},d,i*16);applyBump(round,e,hit);assert.equal(round.slowedMs,0)}
 assert.equal(round.shieldsRemaining,0);
 const exit=updateEncounter(e,{x:200,y:100},d,200);applyBump(round,e,exit);assert.equal(exit.closePass,false);
 applyBump(round,e,updateEncounter(e,{x:200,y:100},d,216));
 applyBump(round,e,updateEncounter(e,{x:100,y:100},d,232));assert.equal(round.slowedMs,600);
});
