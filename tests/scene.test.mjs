import test from 'node:test';
import assert from 'node:assert/strict';
import {registerHooks} from 'node:module';
import {STAGES} from '../src/stages.js';
import {rulesFor} from '../src/run.js';
registerHooks({resolve(s,c,next){return s==='phaser'?{url:'test:phaser',shortCircuit:true}:next(s,c)},load(url,c,next){return url==='test:phaser'?{format:'module',source:'export default {Scene: class {}}',shortCircuit:true}:next(url,c)}});
const {GameScene}=await import('../src/GameScene.js');
test('scene start configures stage, outfit, rules and resets transient state',()=>{
 const scene=new GameScene(),calls=[];
 const node=new Proxy({},{get:(_,key)=> (...args)=>{calls.push([key,...args]);return node}});
 Object.assign(scene,{background:{show(s){calls.push(['stage',s.id])},fireflies:[]},crowd:{configure(s){calls.push(['crowd',s.crowdAnchors.length])},reset(){}},avatar:{art:node},clearInput(){},effects:{clear(){}},tweens:{paused:true,killAll(){},resumeAll(){this.paused=false}},dancer:node,flowPickup:node,dropWash:node,sparks:[],game:{events:{emit(){}}}});
 scene.startRound({stage:STAGES[1],rules:rulesFor(['moth','noodle']),outfit:{onesie:'moth',hat:'wizard',totem:'star'}});
 assert.equal(scene.tweens.paused,false);assert.equal(scene.stage.id,'neon');assert.equal(scene.round.rules.flowDurationMs,7000);assert.equal(scene.round.shieldsRemaining,1);assert.equal(scene.round.remainingMs,60000);assert.equal(scene.running,true);
 assert.ok(calls.some(c=>c[0]==='stage'&&c[1]==='neon'));assert.ok(calls.some(c=>c[0]==='crowd'&&c[1]===14));assert.ok(calls.some(c=>c[0]==='fillTriangle'));
 scene.startRound();assert.equal(scene.stage.id,'forest');assert.equal(scene.round.shieldsRemaining,0);
});
