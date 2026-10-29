import test from 'node:test';
import assert from 'node:assert/strict';
import {createScreenState,transition} from '../src/screens.js';
test('settings and hidden-page pause require explicit resume',()=>{
 let s=transition(createScreenState(),{type:'START'});assert.equal(s.name,'playing');
 s=transition(s,{type:'SETTINGS'});assert.equal(s.name,'settings');
 s=transition(s,{type:'BACK'});assert.equal(s.name,'paused');s=transition(s,{type:'RESUME'});assert.equal(s.name,'playing');
 s=transition(s,{type:'HIDDEN'});assert.equal(s.name,'paused');
 assert.equal(transition(s,{type:'START'}).name,'paused');
});
test('stage screens guard duplicate transitions and discard is explicit',()=>{
 let s=transition(createScreenState(),{type:'START'});s=transition(s,{type:'END',qualified:true});assert.equal(s.name,'summary');
 assert.equal(transition(s,{type:'END'}),s);s=transition(s,{type:'UPGRADE'});s=transition(s,{type:'CHOOSE'});assert.equal(s.name,'rules');
 assert.equal(transition(s,{type:'CHOOSE'}),s);s=transition(s,{type:'START'});s=transition(s,{type:'PAUSE'});s=transition(s,{type:'EXIT'});assert.equal(s.name,'confirmExit');
 assert.equal(transition(s,{type:'CANCEL'}).name,'paused');assert.equal(transition(s,{type:'CONFIRM'}).name,'title');
});

test('finish confirmation preserves the run for results and unsaved navigation can be cancelled',()=>{
 for(const from of ['paused','rules','summary','upgrade']){
  const confirm=transition({name:from},{type:'EXIT'});
  assert.equal(transition(confirm,{type:'FINISH'}).name,'results');
  assert.equal(transition(confirm,{type:'CANCEL'}).name,from);
 }
 const results={name:'results'};const leave=transition(results,{type:'LEAVE',destination:'replay'});
 assert.equal(leave.name,'confirmLeave');assert.equal(leave.destination,'replay');
 assert.equal(transition(leave,{type:'CANCEL'}).name,'results');
 assert.equal(transition(leave,{type:'LEAVE_CONFIRMED'}).name,'results');
 assert.equal(transition({name:'playing'},{type:'LEAVE'}).name,'playing');
});
