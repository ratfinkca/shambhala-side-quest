import test from 'node:test';
import assert from 'node:assert/strict';
import {registerHooks} from 'node:module';
import {STAGES} from '../src/stages.js';
import {rulesFor} from '../src/run.js';
registerHooks({resolve(s,c,next){return s==='phaser'?{url:'test:phaser',shortCircuit:true}:next(s,c)},load(url,c,next){return url==='test:phaser'?{format:'module',source:'export default {Scene: class {}}',shortCircuit:true}:next(url,c)}});
const {GameScene}=await import('../src/GameScene.js');
test('scene start configures stage, outfit, rules and resets transient state',()=>{
 const scene=new GameScene(),calls=[];
 scene.mysteryView={reset(){calls.push(['mysteryReset'])}};
 const node=new Proxy({},{get:(_,key)=> (...args)=>{calls.push([key,...args]);return node}});
 Object.assign(scene,{background:{show(s){calls.push(['stage',s.id])},fireflies:[]},crowd:{configure(s){calls.push(['crowd',s.crowdAnchors.length])},reset(){}},avatar:{art:node,setPosition:node.setPosition},bassFeedback:node,clearInput(){},effects:{clear(){}},tweens:{paused:true,killAll(){},resumeAll(){this.paused=false}},dancer:node,flowPickup:node,dropWash:node,sparks:[],game:{events:{emit(){}}}});
 scene.startRound({stage:STAGES[1],rules:rulesFor(['moth','noodle']),bassChargeMs:7500,outfit:{onesie:'moth',hat:'wizard',totem:'star'}});
 assert.equal(scene.round.bass.chargeMs,7500);assert.equal(scene.round.bass.exposureMs,0);assert.equal(scene.round.bass.activeMs,0);
 assert.equal(scene.tweens.paused,false);assert.equal(scene.stage.id,'neon');assert.equal(scene.round.rules.flowDurationMs,7000);assert.equal(scene.round.shieldsRemaining,1);assert.equal(scene.round.remainingMs,60000);assert.equal(scene.running,true);
 assert.ok(calls.some(c=>c[0]==='stage'&&c[1]==='neon'));assert.ok(calls.some(c=>c[0]==='crowd'&&c[1]===14));assert.deepEqual(scene.avatar.outfit,{onesie:'moth',hat:'wizard',totem:'star',flair:'none',appearance:{face:'smile',hair:'bob',skinTone:'light'}});
 scene.round.mystery.effect='speed';scene.round.mystery.effectMs=4000;
 scene.startRound();assert.equal(scene.round.bass.chargeMs,0);assert.equal(scene.stage.id,'forest');assert.equal(scene.round.shieldsRemaining,0);
 assert.equal(scene.round.mystery.effect,null);assert.equal(scene.round.mystery.effectMs,0);
 assert.equal(calls.filter(c=>c[0]==='mysteryReset').length,2);
});
test('collecting Dizzy reverses an existing destination once and cannot retrigger while paused or spent',()=>{
 const scene=new GameScene(),events=[];
 Object.assign(scene,{running:true,dancer:{x:480,y:380},target:{x:580,y:420},game:{events:{emit:(...args)=>events.push(args)}}});
 scene.round.mystery.phase='available';
 assert.equal(scene.takeCandy(()=>.5),'dizzy');assert.deepEqual(scene.target,{x:380,y:340});
 assert.equal(scene.takeCandy(()=>.5),null);assert.deepEqual(scene.target,{x:380,y:340});
 assert.equal(events.filter(([type])=>type==='round:mystery').length,1);
 scene.running=false;scene.round.mystery.phase='available';scene.round.mystery.effectMs=0;
 assert.equal(scene.takeCandy(()=>.9),null);
});
test('collecting Dizzy cannot send the current destination behind the venue stage',()=>{
 const scene=new GameScene();
 Object.assign(scene,{running:true,stage:{playBounds:{minX:0,minY:285,maxX:960,maxY:640}},dancer:{x:480,y:425},target:{x:480,y:630},game:{events:{emit(){}}}});
 scene.round.mystery.phase='available';
 assert.equal(scene.takeCandy(()=>.5),'dizzy');assert.deepEqual(scene.target,{x:480,y:299});
});
test('Bass Head scene activation reports actual partial duration and blocks paused or repeated use',()=>{
 const scene=new GameScene(),events=[];scene.game={events:{emit:(...args)=>events.push(args)}};
 scene.round.bass.chargeMs=5000;assert.equal(scene.activateBassHead(),false);assert.equal(scene.round.bass.chargeMs,5000);
 scene.running=true;assert.equal(scene.activateBassHead(),true);assert.equal(scene.activateBassHead(),false);
 assert.equal(events.length,1);assert.equal(events[0][1].durationMs,3000);
});
test('live reduced-motion preference is adopted without resetting a paused or active Bass Head timer',()=>{
 const scene=new GameScene();scene.motionQuery={matches:false};scene.round.bass.activeMs=1500;
 scene.update(0,16);assert.equal(scene.reducedMotion,false);assert.equal(scene.round.bass.activeMs,1500);
 scene.motionQuery.matches=true;scene.update(100,100);assert.equal(scene.reducedMotion,true);assert.equal(scene.round.bass.activeMs,1500);
 scene.motionQuery.matches=false;scene.update(200,16);assert.equal(scene.reducedMotion,false);
 Object.assign(scene,{running:true,stage:{obstacles:[]},dancer:{x:480,y:400},input:{keyboard:{resetKeys(){}}},mysteryView:{update(){}},game:{events:{emit(){}}}});
 scene.motionQuery.matches=true;
 scene.round.remainingMs=1000;scene.update(1100,1000);
 assert.equal(scene.reducedMotion,true);assert.equal(scene.round.remainingMs,0);assert.equal(scene.round.bass.activeMs,500);
});

test('scene checkpoint captures logical state and restores paused without ordinary round events or new spawns',async()=>{
 const {recoveryFixture}=await import('./helpers/recovery-fixtures.mjs');const f=recoveryFixture();
 const node=(x=0,y=0)=>{let p;return p=new Proxy({x,y,setPosition(a,b){this.x=a;this.y=b;return p}},{get(o,k){return k in o?o[k]:(...args)=>p}});};
 const source=new GameScene();Object.assign(source,{round:{...f.scene.round,rules:rulesFor([]),sincePickupMs:Infinity},dancer:node(480,400),sparks:f.scene.sparks.map(p=>node(p.x,p.y)),mysteryView:{placed:true,pickup:node(600,400)},crowd:{people:f.scene.crowd.map(encounter=>({encounter}))}});
 const cp=source.captureRecovery();assert.equal(cp.round.sincePickupMs,null);assert.equal(cp.candy.x,600);
 const target=new GameScene(),events=[],art=node();Object.assign(target,{background:{show(){},update(){},fireflies:[]},crowd:{configure(){},restoreRecovery(v,t){this.restored=v;this.elapsed=t}},avatar:{art,setPosition:art.setPosition},bassFeedback:art,halo:art,dropWash:art,dancer:node(),sparks:Array.from({length:12},()=>Object.assign(node(),{art})),flowPickup:node(),effects:{clear(){}},tweens:{killAll(){},pauseAll(){}},input:{keyboard:{resetKeys(){}}},mysteryView:{reset(){},update(){},pickup:node(),placed:false},game:{events:{emit:type=>events.push(type)}}});
 target.restoreRecovery(cp,{stage:STAGES[0],rules:rulesFor([]),outfit:{}});
 assert.equal(target.running,false);assert.equal(target.round.remainingMs,44000);assert.equal(target.round.score,20);assert.equal(target.round.sincePickupMs,Infinity);assert.equal(target.dancer.x,480);assert.equal(target.target,null);assert.equal(target.mysteryView.pickup.x,600);assert.equal(target.crowd.elapsed,16000);assert.equal(target.sparks[1].x,150);assert.deepEqual(events,['round:update']);target.update(999999,50000);assert.equal(target.round.remainingMs,44000);
});
