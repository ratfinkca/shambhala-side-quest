import test from 'node:test';import assert from 'node:assert/strict';import {registerHooks} from 'node:module';
import {getTiming,elapsedMs} from '../src/stage-clock.js';import {createRound,advanceRound} from '../src/game.js';import {availableFlow} from '../src/flow.js';
import {concertLighting} from '../src/concert-lighting.js';import {bassBeat,bassOffset} from '../src/bass-motion.js';import {drawSpeakerBass} from '../src/bass-feedback.js';import {crowdPosition,cycleAt} from '../src/festival.js';import {Crowd} from '../src/Crowd.js';
import {recoveryFixture} from './helpers/recovery-fixtures.mjs';import {STAGES} from '../src/stages.js';import {rulesFor} from '../src/run.js';
registerHooks({resolve(s,c,next){return s==='phaser'?{url:'test:timed-phaser',shortCircuit:true}:next(s,c)},load(url,c,next){return url==='test:timed-phaser'?{format:'module',source:'export default {Scene: class {}}',shortCircuit:true}:next(url,c)}});
const {GameScene}=await import('../src/GameScene.js');
function node(x=0,y=0){let p;return p=new Proxy({x,y,setPosition(a,b){this.x=a;this.y=b;return p}},{get(o,k){return k in o?o[k]:(...args)=>p}});}
function scene(){const s=new GameScene(),art=node();Object.assign(s,{background:{show(){},update(...a){this.args=a},fireflies:[]},crowd:{configure(){},reset(){},restoreRecovery(v,t,clock){this.elapsed=t;this.timing=clock}},avatar:{art,setPosition:art.setPosition},bassFeedback:art,halo:art,dropWash:art,dancer:node(),sparks:Array.from({length:12},()=>Object.assign(node(),{art})),flowPickup:node(),effects:{clear(){}},tweens:{killAll(){},pauseAll(){},resumeAll(){}},input:{keyboard:{resetKeys(){}}},mysteryView:{reset(){},update(){},pickup:node(),placed:false},game:{events:{emit(){}}}});s.placeSpark=()=>{};return s;}
test('long scene starts and restores paused at its own clock without duplicate pickups',()=>{
 const s=scene(),timing=getTiming('smf-living-room-clock-preview-1');s.startRound({stage:STAGES[0],timingId:timing.id});assert.equal(s.round.remainingMs,68571);
 const f=recoveryFixture();const round=createRound({},timing.id);advanceRound(round,20000);f.scene.round={...round};delete f.scene.round.rules;f.scene.round.sincePickupMs=null;
 s.restoreRecovery(f.scene,{stage:STAGES[0],rules:rulesFor([]),outfit:{}});assert.equal(s.running,false);assert.equal(s.round.remainingMs,48571);assert.equal(s.round.timingId,timing.id);assert.equal(s.crowd.elapsed,20000);assert.equal(s.crowd.timing,timing);assert.equal(s.background.args[3],timing);assert.equal(s.target,null);assert.equal(s.round.pickups,0);
 s.update(90000,10000);assert.equal(s.round.remainingMs,48571);assert.equal(s.round.pickups,0);
 const bad=structuredClone(f.scene);bad.round.timingId='unknown';assert.throws(()=>s.restoreRecovery(bad,{stage:STAGES[0],rules:rulesFor([]),outfit:{}}));
});
test('short scene ends exactly without pickup after its final frame',()=>{const s=scene(),t=getTiming('smf-amp-clock-preview-1');s.startRound({stage:STAGES[0],timingId:t.id});s.reducedMotion=true;s.update(100000,100000);assert.equal(s.round.remainingMs,0);assert.equal(elapsedMs(s.round),54857);assert.equal(s.round.pickups,0);assert.equal(s.running,false);});
test('Flow windows use active milliseconds within long and short rounds',()=>{
 for(const id of ['smf-living-room-clock-preview-1','smf-amp-clock-preview-1']){const r=createRound({},id);advanceRound(r,8000);assert.equal(availableFlow(r),0);advanceRound(r,12000);assert.equal(availableFlow(r),-1);advanceRound(r,13000);assert.equal(availableFlow(r),1);}
});
test('beat visuals use selected tempo, preserve logical geometry and become static under reduced motion',()=>{
 const t=getTiming('smf-living-room-clock-preview-1'),at=17143;assert.notEqual(bassBeat(500,t),bassBeat(500));
 assert.notDeepEqual(concertLighting(at,false,'forest',t),concertLighting(at,false));assert.deepEqual(concertLighting(1,true,'forest',t),concertLighting(20000,true,'forest',t));
 const position={x:180,y:134},speakers=[{x:100,y:100,width:60,height:60}],before=structuredClone({position,speakers});bassOffset(position,speakers,at,'drop',false,t);assert.deepEqual({position,speakers},before);assert.deepEqual(bassOffset(position,speakers,at,'drop',true,t),{x:0,y:0});
 const draw=(ms,reduced)=>{const out=[];let g;g=new Proxy({},{get:(_,key)=>(...args)=>{out.push([key,...args]);return g}});drawSpeakerBass(g,ms,'drop',reduced,t);return out};assert.notDeepEqual(draw(at,false),draw(at+200,false));assert.deepEqual(draw(at,true),draw(at+200,true));
});
test('crowd restore/update use identical selected timing at score boundaries',()=>{
 const t=getTiming('smf-living-room-clock-preview-1'),c=Object.create(Crowd.prototype);c.stage=STAGES[0];c.people=[{node:node(),body:node(),ring:node(),smooth:node(),smoothAt:-Infinity,encounter:{active:false,spoiled:false,travel:0,cooldownUntil:0,previousPlayer:null,previousDancer:null}}];c.scene={game:{events:{emit(){}}}};
 for(const ms of [17142,17143,21142,21143]){const r=createRound({},t.id);r.remainingMs=t.durationMs-ms;c.update({x:900,y:600},r,true);const p=crowdPosition(0,ms,c.stage.crowdAnchors,1,t);assert.deepEqual({x:c.people[0].node.x,y:c.people[0].node.y},p);c.restoreRecovery([c.people[0].encounter],ms,t);assert.equal(c.people[0].node.x,p.x);assert.equal(cycleAt(ms,t).bonus,ms>=17143&&ms<21143?2:1);}
});
