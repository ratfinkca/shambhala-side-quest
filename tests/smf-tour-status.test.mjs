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
test('a newer bonus instruction or aiming message cannot be erased by old Flow expiry',()=>{
 const f=fixture();f.status.show('FLOW · Sparks come to you',{round:f.round,kind:'flow'});
 f.status.show('Seed in hand → smooth-pass into the garden bed.');f.advance(5000);
 assert.equal(f.text,'Seed in hand → smooth-pass into the garden bed.');
 f.status.show('60% power');f.status.update(createRound());assert.equal(f.text,'60% power');
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
