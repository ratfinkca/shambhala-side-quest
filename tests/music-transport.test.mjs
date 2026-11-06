import test from 'node:test';import assert from 'node:assert/strict';
import {createMusicTransport} from '../src/music-transport.js';
import {getTiming} from '../src/stage-clock.js';
function harness(){let cancelled=0;const scheduled=[],seen=[];const transport=createMusicTransport({voices:event=>{seen.push(event);return [{step:event.step}]},schedule:(voice,at)=>scheduled.push({...voice,at}),cancel:()=>cancelled++});const sync=(elapsed,audio=elapsed/1000,timing=getTiming('smf-living-room-clock-preview-1'))=>transport.sync({timing,elapsedMs:elapsed,audioNowSec:audio,multiplier:1,flowActive:false});return {transport,sync,seen,scheduled,get cancelled(){return cancelled}};}
test('transport deduplicates bounded lookahead and skips stalls without a catch-up burst',()=>{
 const h=harness();h.sync(0);assert.deepEqual(h.scheduled,[{step:0,at:0}]);h.sync(0);assert.equal(h.scheduled.length,1);
 h.sync(100);assert.equal(h.scheduled.at(-1).step,1);assert.equal(h.scheduled.at(-1).at,.134);
 const before=h.scheduled.length;h.sync(5000);assert.ok(h.scheduled.length-before<=1);assert.ok(h.seen.slice(before).every(e=>Math.round(e.step*60000/(112*4))>=5000));
});
test('transport rounds phrase steps once and uses the same phase at a score boundary',()=>{
 const h=harness();h.sync(17140,20);const event=h.seen.find(e=>e.step===128);assert.equal(event.phase,'drop');assert.equal(h.scheduled.find(e=>e.step===128).at,20.003);
});
test('stop, backward seek and profile changes cancel the prior generation',()=>{
 const h=harness();h.sync(1000);h.transport.stop();assert.equal(h.cancelled,1);h.sync(0);assert.equal(h.scheduled.at(-1).step,0);
 h.sync(5000);h.sync(0);assert.equal(h.cancelled,2);h.sync(0,0,getTiming('smf-amp-clock-preview-1'));assert.equal(h.cancelled,3);
 h.sync(54857,54.857,getTiming('smf-amp-clock-preview-1'));assert.equal(h.cancelled,4);const count=h.scheduled.length;h.sync(60000);assert.equal(h.scheduled.length,count+1); // new longer profile resumes at its current position
});
test('no event is queued at or beyond canonical end and invalid clocks cannot schedule',()=>{
 const h=harness(),t=getTiming('smf-amp-clock-preview-1');h.sync(t.durationMs-50,0,t);assert.ok(h.seen.every(e=>Math.round(e.step*60000/(140*4))<t.durationMs));h.sync(t.durationMs,1,t);const n=h.scheduled.length;h.sync(t.durationMs+1,2,t);assert.equal(h.scheduled.length,n);assert.throws(()=>h.sync(0,0,{...t}));
});
