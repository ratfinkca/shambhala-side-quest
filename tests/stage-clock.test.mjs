import test from 'node:test';
import assert from 'node:assert/strict';
import {getTiming,phaseAt,musicalPosition,roundTiming,elapsedMs,phaseProgress} from '../src/stage-clock.js';
import {cycleAt} from '../src/festival.js';
const rows=[['living-room',112,68571,[17143,34286,51429],2143],['fractal',120,64000,[16000,32000,48000],2000],['grove',132,58182,[14545,29091,43636],1818],['amp',140,54857,[13714,27429,41143],1714],['pagoda',128,60000,[15000,30000,45000],1875],['village',172,66977,[22326,44651,55814],1395]];
for(const [stage,bpm,duration,starts,build] of rows)test(`${stage} has canonical phrase timing and half-open scoring windows`,()=>{
 const t=getTiming(`smf-${stage}-clock-preview-1`);
 assert.equal(t.bpm,bpm);assert.equal(t.durationMs,duration);assert.deepEqual(t.dropStartsMs,starts);assert.equal(t.buildMs,build);assert.equal(t.stepsPerBeat,4);
 assert.ok(Object.isFrozen(t)&&Object.isFrozen(t.dropStartsMs));assert.throws(()=>t.dropStartsMs.push(1));
 for(const start of starts){assert.equal(phaseAt(start-1,t).phase,'build');assert.equal(phaseAt(start-build,t).phase,'build');assert.equal(phaseAt(start,t).bonus,2);assert.equal(phaseAt(start+3999,t).bonus,2);assert.equal(phaseAt(start+4000,t).bonus,1);assert.equal(phaseProgress(start,t),0);assert.equal(phaseProgress(start+2000,t),.5);}
 assert.notEqual(phaseAt(duration-1,t).phase,'ended');assert.equal(phaseAt(duration,t).phase,'ended');assert.equal(phaseProgress(duration,t),1);
 assert.deepEqual(phaseAt(-100,t),phaseAt(0,t));assert.equal(elapsedMs({timingId:t.id,remainingMs:duration-100}),100);
 const end=musicalPosition(duration+1000,t);assert.deepEqual(end,musicalPosition(duration,t));assert.equal(musicalPosition(-10,t).step,0);
});
test('legacy phases match the original at every millisecond including final cruise',()=>{
 const t=getTiming();for(let ms=-1;ms<=60001;ms++)assert.deepEqual(phaseAt(ms,t),cycleAt(ms));
 assert.equal(roundTiming({}),t);assert.equal(elapsedMs({remainingMs:61000}),0);assert.equal(elapsedMs({remainingMs:-1}),60000);
});
test('timing rejects unknown IDs, forged profiles and nonfinite elapsed',()=>{
 for(const id of [null,'','bad']){assert.throws(()=>getTiming(id));assert.throws(()=>roundTiming({timingId:id}));}
 assert.throws(()=>roundTiming({timingId:undefined}));assert.throws(()=>phaseAt(0,{...getTiming()}));assert.throws(()=>elapsedMs({remainingMs:NaN}));
 assert.throws(()=>phaseAt(Infinity,getTiming()));
});
test('musical grid derives rational positions without accumulating rounded beats',()=>{
 const t=getTiming('smf-village-clock-preview-1');assert.equal(t.dropStartsMs[1],Math.round(128*60000/172));assert.notEqual(t.dropStartsMs[1],128*Math.round(60000/172));
 const m=musicalPosition(10000,t);assert.equal(m.beat,28);assert.equal(m.step,114);assert.equal(m.bar,7);assert.ok(m.beatPhase>=0&&m.beatPhase<1);
 const g=getTiming();assert.equal(phaseProgress(6000,g),.5);assert.equal(phaseProgress(54500,g),.5);
});

test('ended phrase position stays in the final bar instead of displaying an unplayed next bar',()=>{
 for(const id of ['smf-fractal-clock-preview-1','smf-grove-clock-preview-1','smf-pagoda-clock-preview-1']){const t=getTiming(id);assert.equal(musicalPosition(t.durationMs,t).bar,31);assert.equal(musicalPosition(t.durationMs,t).beat,127);}
});
