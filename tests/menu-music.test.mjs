import test from 'node:test';
import assert from 'node:assert/strict';
import {createMenuTransport,menuVoices,MENU_STEPS,MENU_STEP_MS} from '../src/menu-music.js';

test('menu groove introduces a hook, varies the response, breaks down, and returns at 32 bars',()=>{
 const frame=step=>menuVoices(step);
 const phrase=bar=>Array.from({length:16},(_,i)=>frame(bar*16+i));
 assert.equal(MENU_STEPS,32*16);
 assert.notDeepEqual(phrase(0),phrase(4));
 assert.notDeepEqual(phrase(0),phrase(16));
 assert.deepEqual(frame(0),frame(MENU_STEPS));
 assert.deepEqual(frame(17),frame(MENU_STEPS+17));
 assert.ok(phrase(0).flat().some(voice=>voice.kind==='melody'));
 assert.ok(phrase(24).flat().some(voice=>voice.kind==='kick'));
 assert.ok(phrase(16).flat().filter(voice=>voice.kind==='kick').length<phrase(0).flat().filter(voice=>voice.kind==='kick').length);
 for(let step=0;step<MENU_STEPS;step++) {
  for(const voice of frame(step)) {
   assert.ok(voice.volume>0 && voice.volume<.09);
   assert.ok(voice.duration>0);
   assert.ok(step*MENU_STEP_MS+(voice.offsetMs??0)+voice.duration*1000<MENU_STEPS*MENU_STEP_MS);
  }
 }
});

test('the menu transport crosses the phrase boundary without overlap and drops its queue on a stalled audio clock',()=>{
 const scheduled=[];
 let cancels=0;
 const transport=createMenuTransport({
  schedule(voice,at){scheduled.push({voice,at});},
  cancel(){cancels++;scheduled.length=0;}
 });
 const end=MENU_STEP_MS*MENU_STEPS;
 transport.sync(end-30,2);
 assert.ok(scheduled.length>0);
 assert.ok(scheduled.every(item=>Math.abs(item.at-2.03)<1e-9));
 const count=scheduled.length;
 transport.sync(end-15,2.015);
 assert.equal(scheduled.length,count);
 transport.sync(end+5,2.015);
 assert.equal(cancels,1);
 assert.equal(scheduled.length,0);
 transport.sync(end+200,2.21);
 assert.ok(scheduled.length>0,'once the clock runs again a future onset can be queued');
 transport.sync(0,3);
 assert.equal(cancels,2);
 assert.ok(scheduled.every(item=>item.at===3));
 transport.stop();
 assert.equal(scheduled.length,0);
});
