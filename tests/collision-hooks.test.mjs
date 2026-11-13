import test from 'node:test';
import assert from 'node:assert/strict';
import {createMotion,commandStick,advanceMotion} from '../src/movement-motion.js';
import {moveInArena} from '../src/geometry.js';
import {createEncounter,updateEncounter,applyBump} from '../src/festival.js';
import {createRound} from '../src/game.js';

const arena={width:960,height:640,obstacles:[]};

test('movement resolver receives every bounded slice, including idle player time',()=>{
 const state=createMotion(),position={x:200,y:200},slices=[];
 advanceMotion(state,position,12,{arena,resolveStep(p,d,ms,options){
  slices.push([ms,options.progressStart,options.progressEnd,options.speed]);
  p.x+=ms;return {drivenDistance:0};
 }});
 assert.deepEqual(slices,[[5,0,5/12,0],[5,5/12,10/12,0],[2,10/12,1,0]]);
 assert.equal(position.x,212);assert.equal(state.actualSpeed,0);
});

test('external pushes do not spend sprint stamina or prevent blocked movement from stopping',()=>{
 const state=createMotion(),position={x:200,y:200};state.stamina=50;
 commandStick(state,{x:1,y:0},true);state.speed=480;
 for(let i=0;i<3;i++)advanceMotion(state,position,50,{arena,resolveStep(p,d,ms){p.y+=ms;return {drivenDistance:0};}});
 assert.equal(position.y,350);assert.equal(state.actualSpeed,0);assert.equal(state.stamina,50);
 assert.equal(state.speed,0);assert.equal(state.stick,null);
});

test('actual speed and sprint cost use driven sliding distance, excluding external displacement',()=>{
 const state=createMotion(),position={x:200,y:200};state.stamina=50;
 commandStick(state,{x:1,y:0},true);state.speed=480;
 advanceMotion(state,position,20,{arena,resolveStep(p,d,ms,{speed}){
  const drivenDistance=speed*ms/1000/2;p.x+=drivenDistance;p.y+=10;return {drivenDistance};
 }});
 assert.ok(Math.abs(state.actualSpeed-240)<1e-9);assert.ok(Math.abs(state.stamina-49.75)<1e-9);
 assert.equal(position.y,240);
});

test('reaching a tap destination still resolves the remaining idle frame slices',()=>{
 const state=createMotion(),position={x:200,y:200},slices=[];commandStick(state,{x:1,y:0});state.speed=300;
 advanceMotion(state,position,15,{arena,destination:{x:201,y:200},resolveStep(p,d,ms,options){
  const before={...p};moveInArena(p,d,ms,options);slices.push([options.progressEnd,options.speed]);
  return {drivenDistance:Math.hypot(p.x-before.x,p.y-before.y)};
 }});
 assert.equal(position.x,201);assert.equal(state.speed,0);
 assert.deepEqual(slices,[[1/3,200],[2/3,0],[1,0]]);
});

test('a pass-through resolver preserves the ordinary arena movement and stamina path',()=>{
 const ordinary=createMotion(),resolved=createMotion(),a={x:500,y:380},b={...a};
 const options={arena:{...arena,obstacles:[{x:550,y:300,width:100,height:160}]}};
 commandStick(ordinary,{x:1,y:1},true);commandStick(resolved,{x:1,y:1},true);
 for(let i=0;i<50;i++){
  advanceMotion(ordinary,a,16,options);
  advanceMotion(resolved,b,16,{...options,resolveStep(p,d,ms,settings){
   const before={...p};moveInArena(p,d,ms,settings);return {drivenDistance:Math.hypot(p.x-before.x,p.y-before.y)};
  }});
 }
 assert.deepEqual(b,a);assert.deepEqual(resolved,ordinary);
});

test('measured sliding paths use their actual closest approach and selected contact radius',()=>{
 const encounter=createEncounter(),dancer={x:0,y:0};
 updateEncounter(encounter,{x:-60,y:0},dancer,0);
 const exit=updateEncounter(encounter,{x:60,y:0},dancer,100,{contactRadius:22,nearest:25,physicalContact:false,travel:150});
 assert.equal(exit.bumped,false,'a curved safe path must not use the straight endpoint chord');
 assert.equal(exit.closePass,true);assert.equal(exit.clearance,3);
 const repeat=updateEncounter(encounter,{x:0,y:25},dancer,300,{contactRadius:22,nearest:25,physicalContact:false,travel:65});
 assert.equal(repeat.closePass,false);assert.equal(encounter.spoiled,true,'existing pass cooldown still applies');
});

test('physical contact always spoils a pass and a measured overlap cannot be suppressed',()=>{
 for(const measurement of [{nearest:28,physicalContact:true},{nearest:27,physicalContact:false}]){
  const encounter=createEncounter(),dancer={x:0,y:0};
  updateEncounter(encounter,{x:-60,y:40},dancer,0);
  const hit=updateEncounter(encounter,{x:0,y:40},dancer,100,{contactRadius:28,travel:30,...measurement});
  assert.equal(hit.bumped,true);assert.equal(hit.contactStarted,true);
  const exit=updateEncounter(encounter,{x:60,y:40},dancer,200,{contactRadius:28,nearest:40,physicalContact:false,travel:30});
  assert.equal(exit.closePass,false);assert.equal(exit.contactEnded,true);
 }
});

test('externally pushed players cannot earn close passes from their position displacement',()=>{
 const encounter=createEncounter(),dancer={x:0,y:0};
 updateEncounter(encounter,{x:-60,y:40},dancer,0);
 updateEncounter(encounter,{x:0,y:40},dancer,100,{contactRadius:22,nearest:40,physicalContact:false,travel:0});
 const exit=updateEncounter(encounter,{x:60,y:40},dancer,200,{contactRadius:22,nearest:40,physicalContact:false,travel:0});
 assert.equal(exit.closePass,false);
});

test('shield protection lasts through measured continuous contact and ends on separation',()=>{
 const encounter=createEncounter(),dancer={x:0,y:0},round=createRound({bumpShields:1});
 const touching={contactRadius:28,nearest:28,physicalContact:true,travel:0};
 for(const elapsed of [0,100,200]){
  const hit=updateEncounter(encounter,{x:28,y:0},dancer,elapsed,touching);
  assert.equal(hit.contactStarted,elapsed===0);assert.equal(applyBump(round,encounter,hit),false);
 }
 assert.equal(round.shieldsRemaining,0);assert.equal(round.slowedMs,0);
 const exit=updateEncounter(encounter,{x:60,y:0},dancer,300,{...touching,nearest:29,physicalContact:false});
 applyBump(round,encounter,exit);assert.equal(encounter.protected,false);
 const again=updateEncounter(encounter,{x:28,y:0},dancer,400,touching);
 assert.equal(applyBump(round,encounter,again),true);assert.equal(round.slowedMs,600);
});
