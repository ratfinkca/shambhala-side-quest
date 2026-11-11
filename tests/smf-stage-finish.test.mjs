import test from 'node:test';
import assert from 'node:assert/strict';
import {createFinishGate,finishHTML} from '../src/smf-tour/finish.js';
import {createTourProfile,createFestival} from '../src/smf-tour/model.js';
import {shellHTML} from '../src/smf-tour/ui.js';

test('end-of-stage held pointer cannot activate Continue; fresh later activation can only proceed once',()=>{
 const gate=createFinishGate();gate.begin(1000);
 gate.pointerDown(1001);assert.equal(gate.accept(1,1100),false);
 assert.equal(gate.accept(1,2500),false,'old dancefloor press is still rejected after the delay');
 gate.pointerDown(2500);assert.equal(gate.accept(1,2501),true);assert.equal(gate.accept(1,2502),false);
});
test('Continue stays guarded and keyboard activation is deliberate after the hold',()=>{
 const gate=createFinishGate();gate.begin(0);assert.equal(gate.ready(500),false);assert.equal(gate.accept(0,500),false);
 assert.equal(gate.ready(1200),true);assert.equal(gate.accept(0,1200),true);
 gate.begin(2000);gate.pointerDown(3500);gate.cancel();assert.equal(gate.accept(1,3501),false);
});
test('finish presentation has summary but no perk, bonus or score actions inside arena',()=>{
 const p=createFestival(createTourProfile(),'finish-test');
 const html=finishHTML({...p,active:{...p.active,score:250,summary:{qualified:true,pickups:25,target:23,xp:100}}},'main');
 assert.match(html,/25.*23/s);assert.match(html,/250/);assert.doesNotMatch(html,/<button|data-action="perk"/);
 const shell=shellHTML();assert.ok(shell.indexOf('id="tour-proceed"')<shell.indexOf('id="tour-running"'));
 assert.match(shell,/id="tour-finish"/);
});
