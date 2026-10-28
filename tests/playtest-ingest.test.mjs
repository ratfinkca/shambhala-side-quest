import test from 'node:test';import assert from 'node:assert/strict';
import {validatePlaytestBatch} from '../supabase/functions/_shared/playtest.js';
const id='00000000-0000-4000-8000-000000000001';
const event=()=>({schemaVersion:1,eventId:id,installationId:id,sessionId:id,runId:id,type:'stage_end',mode:'rush',buildId:'dev',scoringVersion:'arcade-v1',theme:'forest-freakout',viewport:'small',inputType:'touch',payload:{stageIndex:0,activeMs:60000,bassMs:0,chargeMs:0,pickups:12,bumps:1,closePasses:2,clearanceBins:[1,1,0],minClearance:1,peakCombo:4,flowUses:1,bassUses:0,candies:{speed:0,dizzy:0,waves:0},score:250,qualified:true,finished:true}});
test('ingestion validates allowed schema and rejects identifiers/coordinates and invalid numbers',()=>{
 assert.equal(validatePlaytestBatch([event()]).ok,true);
 for(const modify of [e=>e.initials='ABC',e=>e.payload.x=5,e=>e.payload.score=NaN,e=>e.eventId='bad',e=>e.type='arbitrary',e=>e.payload.candies.secret=1,e=>e.payload.clearanceBins=[1,2],e=>e.payload.activeMs=60001]){const e=event();modify(e);assert.equal(validatePlaytestBatch([e]).ok,false);}
 assert.equal(validatePlaytestBatch(Array.from({length:21},event)).ok,false);
});

test('playtest ingestion accepts the eight known perks and rejects unknown IDs',async()=>{
 const {PERKS}=await import('../src/run.js');
 for(const perk of [...Object.keys(PERKS),'unknown']){
  const e={...event(),type:'perk',payload:{perk}};
  assert.equal(validatePlaytestBatch([e]).ok,perk!=='unknown');
 }
});

test('Bass Battery reports real charging time within bass exposure and remains ingestible',async()=>{
 const {createRound}=await import('../src/game.js');const {rulesFor}=await import('../src/run.js');
 const {advanceBass,activateBass}=await import('../src/bass-head.js');
 const round=createRound(rulesFor(['battery']));
 const chargeMs=advanceBass(round,6000,true);assert.equal(round.bass.chargeMs,9000);assert.equal(chargeMs,6000);
 const e=event();e.payload.bassMs=6000;e.payload.chargeMs=chargeMs;assert.equal(validatePlaytestBatch([e]).ok,true);
 const final=advanceBass(round,1000,true);assert.ok(final<=1000);assert.equal(round.bass.chargeMs,10000);
 activateBass(round);assert.equal(advanceBass(round,6000,true),0);
});
