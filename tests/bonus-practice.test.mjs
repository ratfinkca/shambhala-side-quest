import test from 'node:test';
import assert from 'node:assert/strict';
import {BONUS_VENUES,getBonusVenue} from '../src/bonus-practice/config.js';
import {createBonusPractice} from '../src/bonus-practice/state.js';
import {getTiming} from '../src/stage-clock.js';
import {crowdPosition} from '../src/festival.js';

const setup=id=>{const config=getBonusVenue(id),practice=createBonusPractice(config);practice.start();return {config,practice};};
test('four disposable venues have reachable objectives and whole phrase clocks',()=>{
 assert.equal(BONUS_VENUES.length,4);
 for(const c of BONUS_VENUES){
  const timing=getTiming(c.timingId),bounds=c.stage.playBounds;
  assert.equal(Math.round(timing.durationMs*timing.bpm/240000)%8,0);
  for(const p of [...c.points,...(c.bed?[c.bed]:[])]){
   assert.ok(p.x>bounds.minX+30&&p.x<bounds.maxX-30);
   assert.ok(p.y>=bounds.minY+25&&p.y<bounds.maxY-25);
   assert.ok(Math.hypot(p.x-c.stage.spawn.x,p.y-c.stage.spawn.y)>p.radius);
  }
  for(let t=0;t<timing.durationMs;t+=500)for(let i=0;i<c.stage.crowdAnchors.length;i++){
   const p=crowdPosition(i,t,c.stage.crowdAnchors,c.stage.crowdSpeed,timing);
   assert.ok(p.x>bounds.minX+20&&p.x<bounds.maxX-20&&p.y>bounds.minY+20&&p.y<bounds.maxY-20,`${c.id} dancer ${i}`);
  }
 }
 assert.throws(()=>getBonusVenue('unknown'));
});
test('rabbit trail is sequential, each trinket once, completion includes temporary souvenir',()=>{
 const {config:c,practice:p}=setup('rabbit-hole');
 assert.equal(p.step({player:c.points[2]}),null);
 for(let i=0;i<c.points.length;i++){
  const event=p.step({player:c.points[i]});
  assert.equal(event.type,i===5?'complete':'collected');assert.equal(p.state.progress,i+1);
  assert.equal(p.step({player:c.points[i]}),null);
  if(i===5)assert.equal(event.reward,c.reward);
 }
 assert.equal(p.status,'complete');
});
test('garden must carry one seed back to the bed and cannot plant twice or collect ahead',()=>{
 const {config:c,practice:p}=setup('secret-garden');
 assert.equal(p.step({player:c.bed}),null);
 for(let i=0;i<3;i++){
  assert.equal(p.step({player:c.points[i]}).type,'pickup');
  assert.equal(p.state.progress,i);assert.equal(p.state.carrying,c.points[i].id);
  assert.equal(p.step({player:c.points[(i+1)%3]}),null);
  assert.equal(p.step({player:c.bed}).type,i===2?'complete':'planted');
  assert.equal(p.state.carrying,null);assert.equal(p.state.progress,i+1);
  assert.equal(p.step({player:c.bed}),null);
 }
});
test('Ikigai counts distinct real dancers and prioritizes any physical bump in a frame',()=>{
 const {practice:p}=setup('ikigai-mori'),pass=id=>({id,closePass:true});
 assert.equal(p.step({encounters:[pass('invented')]}),null);
 assert.equal(p.step({encounters:[pass('dancer-0'),{id:'dancer-2',bumped:true}]}),null);
 assert.equal(p.step({encounters:[pass('dancer-0'),pass('dancer-1')]}).type,'greeted');
 assert.equal(p.state.progress,1);
 assert.equal(p.step({encounters:[pass('dancer-0')]}),null);
 for(let i=1;i<5;i++)p.step({encounters:[pass(`dancer-${i}`)]});
 assert.equal(p.state.progress,5);assert.equal(p.status,'complete');
});
test('Villagio exploration gives no cosmetic or putting win',()=>{
 const {config:c,practice:p}=setup('villagio');
 for(const point of [...c.points].reverse()){
  const e=p.step({player:point});assert.equal(e.reward,undefined);
  assert.equal(p.step({player:point}),null);
 }
 assert.equal(p.status,'complete');assert.equal(p.state.progress,3);assert.equal(c.reward,null);
});
test('ready, pause, timeout and reset gate progress and clear temporary rewards',()=>{
 for(const c of BONUS_VENUES){
  const p=createBonusPractice(c),frame={player:c.points[0],encounters:[{id:'dancer-0',closePass:true}]};
  assert.equal(p.step(frame),null);p.start();p.pause();assert.equal(p.step(frame),null);
  p.resume();assert.ok(p.step(frame));p.finish();assert.equal(p.status,'ended');assert.equal(p.step(frame),null);
  p.start();assert.equal(p.state.progress,0);assert.equal(p.state.carrying,null);assert.equal(p.state.complete,false);
  assert.deepEqual(p.state.greetedIds,[]);assert.deepEqual(p.state.collectedIds,[]);
 }
});
