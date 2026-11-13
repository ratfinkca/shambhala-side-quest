import test from 'node:test';
import assert from 'node:assert/strict';
import {createCrowdFriendships} from '../src/crowd-friendship.js';
import {createCrowdCollisionFrame} from '../src/crowd-collision.js';
import {createEncounter,updateEncounter} from '../src/festival.js';

test('four earned clean passes open only that dancer and retain the outer pass boundary',()=>{
 const people=[{id:'pal',node:{x:200,y:200}},{id:'stranger',node:{x:700,y:200}}];
 const bonds=createCrowdFriendships(people),encounter=createEncounter();
 function cross(y,at){
  const player={x:120,y},frame=createCrowdCollisionFrame({people,radii:people.map(p=>bonds.get(p.id).radius)});
  frame.resolveStep(player,{x:1,y:0},50,{speed:3200});
  const result=updateEncounter(encounter,player,people[0].node,at,frame.measurement(0));
  bonds.record([{id:'pal',...result}]);return {result,player};
 }
 for(let i=0;i<4;i++){
  const r=bonds.get('pal').radius,{result}=cross(200+r+7,1000+i*4000);
  assert.equal(result.bumped,false);assert.equal(result.closePass,true);
  assert.equal(bonds.get('pal').passes,i+1);
  assert.ok(bonds.get('pal').radius<r);
 }
 assert.equal(bonds.get('pal').radius,0);assert.equal(bonds.get('stranger').radius,26);
 const through=cross(200,18000);assert.equal(through.result.bumped,false);assert.equal(through.result.closePass,true);assert.equal(through.player.x,280);
 const outside=cross(260,23000);assert.equal(outside.result.closePass,false);
 assert.equal(bonds.summary().friends,1);
});

test('a collision cannot earn friendship even when the player pushes through its encounter area',()=>{
 const people=[{id:'pal',node:{x:200,y:200}}],bonds=createCrowdFriendships(people),encounter=createEncounter();
 const position={x:120,y:200};
 const approach=createCrowdCollisionFrame({people,radii:[bonds.get('pal').radius]});
 approach.resolveStep(position,{x:1,y:0},50,{speed:3200});
 bonds.record([{id:'pal',...updateEncounter(encounter,position,people[0].node,1000,approach.measurement(0))}]);
 const leave=createCrowdCollisionFrame({people,radii:[bonds.get('pal').radius]});
 leave.resolveStep(position,{x:-1,y:0},50,{speed:3200});
 bonds.record([{id:'pal',...updateEncounter(encounter,position,people[0].node,1100,leave.measurement(0))}]);
 assert.equal(encounter.active,false);assert.equal(bonds.summary().passes,0);assert.equal(bonds.get('pal').radius,18);
});
