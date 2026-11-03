import test from 'node:test';import assert from 'node:assert/strict';
import {endlessStage} from '../src/endless.js';
import {STAGES} from '../src/stages.js';
import {isOpen,findSpawn,bassFactor,pointInPolygon} from '../src/geometry.js';
import {crowdPosition} from '../src/festival.js';
test('first loop stays original; later loops cycle six deterministic stage-specific layouts',()=>{
 const before=structuredClone(STAGES),ids=[];
 for(let i=0;i<3;i++){const s=endlessStage(i);assert.deepEqual(s.obstacles,STAGES[i].obstacles);assert.deepEqual(s.mud,STAGES[i].mud);assert.deepEqual(s.crowdAnchors,STAGES[i].crowdAnchors);assert.equal(s.variationId,'original');}
 for(let i=3;i<9;i++){const s=endlessStage(i);assert.equal(s.id,STAGES[i%3].id);assert.equal(s.target,[23,28,33,26,31,36][i-3]);assert.ok(s.variationName);assert.notEqual(s.variationId,'original');ids.push(s.variationId);assert.deepEqual(endlessStage(i),s);assert.equal(endlessStage(i+6).variationId,s.variationId);}
 assert.equal(new Set(ids).size,6);assert.deepEqual(STAGES,before);
});
test('every variation has safe spawn/Flow, exact capped crowds and cabinet-free dancer movement',()=>{
 for(let index=3;index<39;index++){
  const s=endlessStage(index);assert.equal(s.crowdAnchors.length,Math.min(22,STAGES[index%3].crowdAnchors.length+Math.floor(index/3)*2));
  assert.ok(isOpen(s.spawn,40,s.obstacles));assert.equal(bassFactor(s.spawn,s.obstacles),1);assert.ok(!s.mud.some(m=>pointInPolygon(s.spawn,m.points)));
  for(const f of s.flowSpawns)assert.ok(isOpen(f,28,s.obstacles));
  for(let time=0;time<=60000;time+=500)for(let i=0;i<s.crowdAnchors.length;i++)assert.ok(isOpen(crowdPosition(i,time,s.crowdAnchors,s.crowdSpeed),14,s.obstacles),`${s.variationId}:dancer${i}`);
 }
});
test('pickup space remains connected with room for the player and seeded spark spawns stay reachable',()=>{
 let seed=29;const rng=()=>((seed=(seed*1664525+1013904223)>>>0)/4294967296);
 for(let index=3;index<9;index++){
  const s=endlessStage(index),open=new Set();for(let x=140;x<=820;x+=10)for(let y=170;y<=590;y+=10)if(isOpen({x,y},18,s.obstacles))open.add(`${x},${y}`);
  const start=`${Math.round(s.spawn.x/10)*10},${Math.round(s.spawn.y/10)*10}`,todo=[start],seen=new Set(todo);assert.ok(open.has(start));
  for(let i=0;i<todo.length;i++){const [x,y]=todo[i].split(',').map(Number);for(const [dx,dy] of [[10,0],[-10,0],[0,10],[0,-10]]){const key=`${x+dx},${y+dy}`;if(open.has(key)&&!seen.has(key)){seen.add(key);todo.push(key);}}}
  assert.equal(seen.size,open.size,s.variationId);
  for(let i=0;i<250;i++){const p=findSpawn(s,rng,[],i%3===0);assert.ok(isOpen(p,24,s.obstacles));assert.ok(seen.has(`${Math.round(p.x/10)*10},${Math.round(p.y/10)*10}`),`${s.variationId}:pickup`);}
 }
});

test('preview links resolve only authored layouts to their proper loop/stage',async()=>{
 const {layoutPreviewIndex}=await import('../src/rehearsal.js');
 for(const [id,index] of [['forest-creekside',3],['forest-weave',6],['neon-stereo',4],['neon-crossfade',7],['sunrise-islands',5],['sunrise-lane',8]])assert.equal(layoutPreviewIndex(id),index);
 for(const id of ['unknown','0','999',null])assert.equal(layoutPreviewIndex(id),null);
});
