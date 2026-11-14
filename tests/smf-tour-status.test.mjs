import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRound,advanceRound} from '../src/game.js';
import {activateFlow} from '../src/flow.js';
import {collectMystery} from '../src/mystery.js';
import {createTourStatus} from '../src/smf-tour/status.js';
function fixture(){
 let text='';const status=createTourStatus(message=>{text=message;});
 const round=createRound();advanceRound(round,8000);activateFlow(round);
 return {status,round,get text(){return text;},advance(ms){advanceRound(round,ms);status.update(round);}};
}
test('Flow pickup announcement expires during active play while the real boost continues',()=>{
 const f=fixture();f.status.show('FLOW · Sparks come to you',{round:f.round,kind:'flow'});
 f.advance(2399);assert.equal(f.text,'FLOW · Sparks come to you');assert.equal(f.round.flowMs,2601);
 f.advance(1);assert.equal(f.text,'');assert.equal(f.round.flowMs,2600);
 f.advance(2600);assert.equal(f.round.flowMs,0);assert.equal(f.text,'');
});
test('an early Flow expiry clears its announcement immediately',()=>{
 const f=fixture();f.status.show('FLOW · Sparks come to you',{round:f.round,kind:'flow'});
 f.round.flowMs=50;f.advance(50);assert.equal(f.text,'');
});
test('paused updates do not consume a pickup announcement',()=>{
 const f=fixture();f.status.show('FLOW · Sparks come to you',{round:f.round,kind:'flow'});
 f.advance(1000);for(let i=0;i<600;i++)f.status.update(f.round,{paused:true});
 assert.equal(f.text,'FLOW · Sparks come to you');f.advance(1400);assert.equal(f.text,'');
});
test('a newer bonus message owns its lifetime independently of the old effect',()=>{
 const f=fixture();f.status.show('FLOW · Sparks come to you',{round:f.round,kind:'flow'});
 f.advance(2300);f.status.show('Seed in hand → smooth-pass into the garden bed.',{round:f.round});
 f.advance(2700);assert.equal(f.round.flowMs,0);assert.equal(f.text,'Seed in hand → smooth-pass into the garden bed.');
 f.advance(300);assert.equal(f.text,'');
});
test('new pickups replace the prior announcement without inheriting its expiry',()=>{
 const f=fixture();f.status.show('FLOW',{round:f.round,kind:'flow'});f.advance(2300);
 f.round.mystery.phase='available';assert.equal(collectMystery(f.round,()=>.99),'waves');
 f.status.show('Wavy Colours · Ride the colours.',{round:f.round,kind:'candy'});
 f.advance(100);assert.equal(f.text,'Wavy Colours · Ride the colours.');
 f.advance(2300);assert.equal(f.text,'');assert.ok(f.round.mystery.effectMs>0);
});
test('candy announcements clear with effect expiry and new rounds discard old transient messages',()=>{
 const f=fixture();f.round.mystery.phase='available';collectMystery(f.round,()=>.99);
 f.status.show('Wavy Colours',{round:f.round,kind:'candy'});f.round.mystery.effectMs=50;f.advance(50);assert.equal(f.text,'');
 f.status.show('FLOW',{round:f.round,kind:'flow'});f.status.update(createRound());assert.equal(f.text,'');
 f.status.show('Round instructions');f.status.clear();assert.equal(f.text,'');
});
test('invitation and ordinary activity notices expire after three active seconds',()=>{
 for(const kind of ['invitation',undefined]){
  const f=fixture();f.status.show('Invitation found. Clear this stage.',{round:f.round,kind});
  f.advance(2999);assert.equal(f.text,'Invitation found. Clear this stage.');
  f.advance(1);assert.equal(f.text,'');
 }
});
test('unlinked notices also expire and pause does not consume their display time',()=>{
 let clock=100,text='';const status=createTourStatus(message=>{text=message;},{now:()=>clock});
 status.show('Picked up!');clock+=1000;status.update();
 clock+=10000;status.update(undefined,{paused:true});assert.equal(text,'Picked up!');
 clock+=1999;status.update();assert.equal(text,'Picked up!');
 clock++;status.update();assert.equal(text,'');
});
test('putting notices use the active practice clock while the round clock is frozen or wraps',()=>{
 const f=fixture();f.status.show('On the green.',{round:f.round,clockMs:10000});
 f.status.update(f.round,{clockMs:12000});assert.equal(f.text,'On the green.');
 // Walking around Villagio wraps the underlying musical round clock.
 f.round.remainingMs+=60000;
 f.status.update(f.round,{clockMs:12999});assert.equal(f.text,'On the green.');
 f.status.update(f.round,{clockMs:13000});assert.equal(f.text,'');
});
test('round changes and explicit clearing remove activity notices and their styling metadata',()=>{
 const writes=[];const status=createTourStatus((text,meta)=>writes.push({text,...meta}));
 const round=createRound();status.show('Invitation found.',{round,kind:'invitation'});
 assert.deepEqual(writes.at(-1),{text:'Invitation found.',kind:'invitation'});
 status.update(createRound());assert.deepEqual(writes.at(-1),{text:'',kind:null});
 status.show('Delivery made.',{round,kind:'delivery'});status.clear();
 assert.deepEqual(writes.at(-1),{text:'',kind:null});
});
