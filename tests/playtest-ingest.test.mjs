import test from 'node:test';import assert from 'node:assert/strict';
import {validatePlaytestBatch} from '../supabase/functions/_shared/playtest.js';
const id='00000000-0000-4000-8000-000000000001';
const event=()=>({schemaVersion:1,eventId:id,installationId:id,sessionId:id,runId:id,type:'stage_end',mode:'rush',buildId:'dev',scoringVersion:'arcade-v1',theme:'forest-freakout',viewport:'small',inputType:'touch',payload:{stageIndex:0,activeMs:60000,bassMs:0,chargeMs:0,pickups:12,bumps:1,closePasses:2,clearanceBins:[1,1,0],minClearance:1,peakCombo:4,flowUses:1,bassUses:0,candies:{speed:0,dizzy:0,waves:0},score:250,qualified:true,finished:true}});
test('ingestion validates allowed schema and rejects identifiers/coordinates and invalid numbers',()=>{
 assert.equal(validatePlaytestBatch([event()]).ok,true);
 for(const modify of [e=>e.initials='ABC',e=>e.payload.x=5,e=>e.payload.score=NaN,e=>e.eventId='bad',e=>e.type='arbitrary',e=>e.payload.candies.secret=1,e=>e.payload.clearanceBins=[1,2],e=>e.payload.activeMs=60001]){const e=event();modify(e);assert.equal(validatePlaytestBatch([e]).ok,false);}
 assert.equal(validatePlaytestBatch(Array.from({length:21},event)).ok,false);
});
test('ingestion preserves legacy clearances and accepts the complete friendship pass range',()=>{
 for(const minClearance of [0,7,14,21,30,48]){
  const e=event();e.payload={...e.payload,closePasses:1,clearanceBins:minClearance<7?[1,0,0]:minClearance<14?[0,1,0]:[0,0,1],minClearance};
  assert.equal(validatePlaytestBatch([e]).ok,true,String(minClearance));
 }
 for(const minClearance of [-1,48.001,Infinity,NaN,null]){
  const e=event();e.payload.minClearance=minClearance;assert.equal(validatePlaytestBatch([e]).ok,false,String(minClearance));
 }
});

test('a real clean pass through a zero-radius friend remains counted and ingestible',async()=>{
 const {createEncounter,updateEncounter}=await import('../src/festival.js');
 const {createRunSummary}=await import('../src/playtest/summary.js');
 const encounter=createEncounter(),dancer={x:100,y:100},summary=createRunSummary({runId:id,mode:'rush',buildId:'dev',scoringVersion:'arcade-v1'});
 summary.record('start',{runId:id,stageIndex:0});
 for(const [index,x] of [40,100,160].entries()){
  const hit=updateEncounter(encounter,{x,y:140},dancer,index*100,{contactRadius:0,nearest:40,physicalContact:false,travel:index?60:0});
  if(hit.closePass)summary.record('closepass',{runId:id,clearance:hit.clearance});
 }
 const e=event();e.payload=summary.finishStage(0,{score:15,qualified:true});
 assert.equal(e.payload.closePasses,1);assert.equal(e.payload.minClearance,40);assert.deepEqual(e.payload.clearanceBins,[0,0,1]);
 assert.equal(validatePlaytestBatch([e]).ok,true);
});

test('playtest ingestion accepts current perks and rejects unknown IDs',async()=>{
 const {PERKS}=await import('../src/run.js');
 for(const perk of [...Object.keys(PERKS),'unknown']){
  const e={...event(),scoringVersion:'arcade-v3',type:'perk',payload:{perk}};
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

test('schema2 Endless accepts late stages and rejects personal fields, invalid choices and legacy-mode broadening',()=>{
 const e={...event(),schemaVersion:2,mode:'endless'};e.payload.stageIndex=120;
 assert.equal(validatePlaytestBatch([e]).ok,true);
 for(const change of [{schemaVersion:1},{schemaVersion:2,mode:'festival'}])assert.equal(validatePlaytestBatch([{...e,...change}]).ok,false);
 const choice={...e,type:'perk_choice',payload:{stageIndex:120,action:'swap',perk:'surfer',replaced:'moth',activePerks:['boots','surfer','noodle','bracelet']}};
 assert.equal(validatePlaytestBatch([choice]).ok,true);
 for(const mutate of [p=>p.activePerks.push('sweet'),p=>p.activePerks[0]='surfer',p=>p.replaced='surfer',p=>p.replaced=null,p=>p.stageIndex=1000000,p=>p.x=1,p=>p.perk='unknown']){const q=structuredClone(choice);mutate(q.payload);assert.equal(validatePlaytestBatch([q]).ok,false);}
 for(const outcome of ['banked','failed','exit'])assert.equal(validatePlaytestBatch([{...e,type:'run_end',payload:{outcome,stagesCleared:123,totalScore:2000000}}]).ok,true);
 assert.equal(validatePlaytestBatch([{...choice,schemaVersion:1,mode:'festival'}]).ok,false);
});

test('Endless choices cannot claim an impossible early build or swap before four perks were earned',()=>{
 const base={...event(),schemaVersion:2,mode:'endless',type:'perk_choice',payload:{stageIndex:0,action:'add',perk:'boots',replaced:null,activePerks:['boots','moth','noodle','bracelet']}};
 assert.equal(validatePlaytestBatch([base]).ok,false);
 base.payload={stageIndex:3,action:'swap',perk:'surfer',replaced:'moth',activePerks:['surfer','boots','noodle','bracelet']};assert.equal(validatePlaytestBatch([base]).ok,false);
 base.payload.stageIndex=4;assert.equal(validatePlaytestBatch([base]).ok,true);
});
