import test from 'node:test';
import assert from 'node:assert/strict';
import {createTourProfile,createTourRun,stageForRun,mainStageId,finishMain,endFestival,closeResults,saveTourScore} from '../src/smf-tour/model.js';
import {normalizeTourProfile,createTourStore} from '../src/smf-tour/store.js';
import {createRound,advanceRound} from '../src/game.js';
import {createEncounter} from '../src/festival.js';

const venues=['smf-living-room','smf-fractal','smf-grove','smf-amp','smf-pagoda','smf-village'];
const high=()=>.999999;
function selectedRun(stageId,id='rush-test'){
 const p=createTourProfile();p.rushRotation={remaining:[stageId],lastStageId:venues.find(v=>v!==stageId)};
 return createTourRun(p,'rush',id,'forest-freakout',high);
}
function parkScene(p){
 const stage=stageForRun(p.active),round=createRound({},stage.timingId);round.runId=p.active.id;advanceRound(round,1234);delete round.rules;round.sincePickupMs=null;
 p.active.needsIntro=false;p.active.scene={round,player:{...stage.spawn},sparks:Array.from({length:12},()=>({...stage.spawn})),candy:{placed:false,x:0,y:0},crowd:stage.crowdAnchors.map(()=>createEncounter())};return p;
}
const row=(rushStageId,index)=>({id:`${rushStageId}-${index}`,initials:'ABC',score:index,cleared:1,completedAt:index,...(rushStageId===undefined?{}:{rushStageId})});

test('new Rush runs draw every venue once per bag and persist draws after abandoned runs',()=>{
 let p=createTourProfile();const selected=[];
 for(let i=0;i<12;i++){
  p=createTourRun(p,'rush',`draw-${i}`,'forest-freakout',high);selected.push(p.active.rushStageId);
  assert.equal(mainStageId(p.active),p.active.rushStageId);assert.equal(stageForRun(p.active).id,p.active.rushStageId);
  p=normalizeTourProfile(closeResults(endFestival(p)));
 }
 assert.deepEqual([...new Set(selected.slice(0,6))].sort(),[...venues].sort());
 assert.deepEqual([...new Set(selected.slice(6))].sort(),[...venues].sort());
 assert.ok(selected.every((v,i)=>i===0||v!==selected[i-1]));assert.equal(p.rushRotation.remaining.length,0);
});

test('refilling an empty bag never repeats the previous venue',()=>{
 const p=createTourProfile();p.rushRotation={remaining:[],lastStageId:'smf-living-room'};
 const next=createTourRun(p,'rush','boundary','forest-freakout',high);
 assert.notEqual(next.active.rushStageId,'smf-living-room');assert.equal(next.rushRotation.remaining.length,5);
 assert.deepEqual([next.active.rushStageId,...next.rushRotation.remaining].sort(),[...venues].sort());
});

test('different random draws change the venue order while keeping a full six-venue bag',()=>{
 const first=[];
 for(const value of [0,.2,.4,.6,.8,.999999]){const p=createTourRun(createTourProfile(),'rush','random','forest-freakout',()=>value);first.push(p.active.rushStageId);assert.deepEqual([p.active.rushStageId,...p.rushRotation.remaining].sort(),[...venues].sort());}
 assert.ok(new Set(first).size>1);
});

test('invalid and repeated starts do not consume a venue or call randomness',()=>{
 const p=selectedRun('smf-grove'),before=structuredClone(p);let calls=0;const rng=()=>{calls++;return 0;};
 assert.equal(createTourRun(p,'rush','another','forest-freakout',rng),p);
 const idle=createTourProfile();assert.equal(createTourRun(idle,'rush','','forest-freakout',rng),idle);
 assert.equal(createTourRun(idle,'invalid','x','forest-freakout',rng),idle);
 assert.equal(calls,0);assert.deepEqual(p,before);
 for(const mode of ['festival','endless']){const next=createTourRun(idle,mode,'x','forest-freakout',rng);assert.equal(Object.hasOwn(next.active,'rushStageId'),false);assert.deepEqual(next.rushRotation,idle.rushRotation);}
});

test('every selected Rush venue restores its exact scene and clock without drawing again',()=>{
 for(const stageId of venues){const p=parkScene(selectedRun(stageId)),before=structuredClone(p),loaded=normalizeTourProfile(p);
  assert.equal(loaded.active?.rushStageId,stageId);assert.deepEqual(loaded.active.scene,p.active.scene);assert.deepEqual(loaded.rushRotation,p.rushRotation);assert.deepEqual(p,before);
  assert.deepEqual(normalizeTourProfile(loaded),loaded);
 }
});

test('old Rush snapshots and results retain Pagoda and seed the next draw',()=>{
 let p=parkScene(selectedRun('smf-pagoda'));delete p.active.rushStageId;delete p.rushRotation;
 let loaded=normalizeTourProfile(p);assert.equal(loaded.active?.rushStageId,'smf-pagoda');assert.equal(loaded.rushRotation.lastStageId,'smf-pagoda');assert.deepEqual(loaded.active.scene,p.active.scene);
 p=closeResults(endFestival(loaded));delete p.lastResult.rushStageId;delete p.rushRotation;loaded=normalizeTourProfile(p);
 assert.equal(loaded.lastResult.rushStageId,'smf-pagoda');assert.equal(loaded.rushRotation.lastStageId,'smf-pagoda');
});

test('legacy rotation inference prefers the active run then last result then newest saved Rush',()=>{
 const p=selectedRun('smf-amp');delete p.rushRotation;p.lastResult={id:'last',mode:'rush',rushStageId:'smf-grove',score:1,cleared:1,completed:false};
 p.boards.rush=[row('smf-fractal',3),row('smf-village',10)];assert.equal(normalizeTourProfile(p).rushRotation.lastStageId,'smf-amp');
 p.active=null;assert.equal(normalizeTourProfile(p).rushRotation.lastStageId,'smf-grove');p.lastResult=null;assert.equal(normalizeTourProfile(p).rushRotation.lastStageId,'smf-village');
});

test('legacy next-venue inference uses the newest saved run even when its score is below the retained top twenty',()=>{
 const p=createTourProfile();delete p.rushRotation;p.boards.rush=Array.from({length:20},(_,i)=>({...row('smf-pagoda',i),score:100+i,completedAt:i+20}));
 p.boards.rush.push({...row('smf-grove',50),score:1},...Array.from({length:20},(_,i)=>({...row('smf-grove',i),score:200+i})));
 const loaded=normalizeTourProfile(p);assert.equal(loaded.rushRotation.lastStageId,'smf-grove');
 assert.equal(loaded.boards.rush.some(r=>r.id==='smf-grove-50'),false);
});

test('corrupted rotation entries are removed and never become a playable venue',()=>{
 const p=createTourProfile();p.rushRotation={remaining:['smf-amp','smf-amp','smf-rabbit-hole',null,...venues,...venues],lastStageId:'smf-fractal'};
 const loaded=normalizeTourProfile(p);assert.equal(loaded.rushRotation.lastStageId,'smf-fractal');assert.equal(loaded.rushRotation.remaining.length,5);
 assert.ok(loaded.rushRotation.remaining.every(v=>venues.includes(v)&&v!=='smf-fractal'));assert.equal(new Set(loaded.rushRotation.remaining).size,5);
 p.rushRotation={remaining:'smf-pagoda',lastStageId:'smf-rabbit-hole'};assert.deepEqual(normalizeTourProfile(p).rushRotation,{remaining:[],lastStageId:null});
});

test('invalid persisted Rush selection fails safe without losing permanent progress',()=>{
 for(const stageId of [null,'','smf-rabbit-hole','smf-made-up',{},42]){const p=selectedRun('smf-pagoda');p.active.rushStageId=stageId;p.progress.xp=321;const loaded=normalizeTourProfile(p);assert.equal(loaded.active,null);assert.equal(loaded.progress.xp,321);}
 const p=createTourRun(createTourProfile(),'festival','festival');p.active.rushStageId='smf-pagoda';assert.equal(normalizeTourProfile(p).active,null);
 const mismatch=parkScene(selectedRun('smf-grove'));mismatch.active.rushStageId='smf-pagoda';assert.equal(normalizeTourProfile(mismatch).active,null);
});

test('saved Rush scores retain twenty entries for each venue and remain explicitly saved',()=>{
 let p=selectedRun('smf-grove','new-best');p.boards.rush=venues.flatMap(v=>Array.from({length:20},(_,i)=>row(v,i)));
 p.active.score=999;p=endFestival(p);assert.equal(p.boards.rush.length,120);p=saveTourScore(p,'new');
 assert.equal(p.boards.rush.length,120);assert.equal(p.boards.rush.find(r=>r.id==='new-best').rushStageId,'smf-grove');
 assert.equal(p.boards.rush.filter(r=>r.rushStageId==='smf-grove').length,20);assert.equal(p.boards.rush.some(r=>r.id==='smf-grove-0'),false);
 assert.equal(saveTourScore(p,'ZZZ'),p);const closed=closeResults(p);assert.equal(closed.lastResult.rushStageId,'smf-grove');
 const unsaved=closeResults(endFestival(selectedRun('smf-amp')));assert.equal(unsaved.boards.rush.length,0);
});

test('normalization keeps top twenty scores per venue and upgrades untagged rows to Pagoda',()=>{
 const p=createTourProfile();p.boards.rush=venues.flatMap(v=>Array.from({length:25},(_,i)=>row(v,i))).reverse();
 p.boards.rush.push({...row(undefined,1000),id:'legacy-best'},row('smf-rabbit-hole',9999),row(null,9999));
 const loaded=normalizeTourProfile(p);assert.equal(loaded.boards.rush.length,120);assert.equal(loaded.boards.rush.find(r=>r.id==='legacy-best').rushStageId,'smf-pagoda');
 for(const stageId of venues){const rows=loaded.boards.rush.filter(r=>r.rushStageId===stageId);assert.equal(rows.length,20);assert.equal(Math.min(...rows.map(r=>r.score)),stageId==='smf-pagoda'?6:5);}
 const memory=new Map(),store=createTourStore({getItem:k=>memory.get(k),setItem:(k,v)=>memory.set(k,v)});assert.equal(store.write(loaded),true);assert.deepEqual(store.read(),loaded);
});

test('Rush finish receipts and retry payloads stay bound to the selected venue',()=>{
 let p=selectedRun('smf-amp');const stage=stageForRun(p.active),round=createRound({},stage.timingId);round.runId=p.active.id;advanceRound(round,round.remainingMs);p=finishMain(p,round);
 assert.equal(p.active.scoreStages[0].stageId,'smf-amp');assert.equal(p.active.scoreStages[0].activeMs,54857);
 const a=p.active,ticket='a'.repeat(64);a.submission={runId:a.id,status:'error',code:'unavailable',ticket,expiresAt:123456,payload:{runId:a.id,ticket,mode:'rush',rushStageId:'smf-amp',buildId:a.buildId,totalScore:a.score,stagesCleared:a.cleared,stages:structuredClone(a.scoreStages)}};
 assert.deepEqual(normalizeTourProfile(p).active?.submission,a.submission);
 for(const value of ['smf-grove',undefined,null]){const corrupt=structuredClone(p);if(value===undefined)delete corrupt.active.submission.payload.rushStageId;else corrupt.active.submission.payload.rushStageId=value;assert.equal(normalizeTourProfile(corrupt).active,null);}
 const corrupt=structuredClone(p);corrupt.active.scoreStages[0].stageId='smf-pagoda';corrupt.active.submission=null;assert.equal(normalizeTourProfile(corrupt).active,null);
});

test('legacy Pagoda retry payloads without a venue survive recovery unchanged',()=>{
 let p=selectedRun('smf-pagoda');const stage=stageForRun(p.active),round=createRound({},stage.timingId);round.runId=p.active.id;advanceRound(round,round.remainingMs);p=finishMain(p,round);
 const a=p.active,ticket='a'.repeat(64);a.submission={runId:a.id,status:'error',code:'unavailable',ticket,expiresAt:123456,payload:{runId:a.id,ticket,mode:'rush',buildId:a.buildId,totalScore:a.score,stagesCleared:a.cleared,stages:structuredClone(a.scoreStages)}};
 delete a.rushStageId;delete p.rushRotation;const loaded=normalizeTourProfile(p);assert.equal(loaded.active?.rushStageId,'smf-pagoda');assert.deepEqual(loaded.active.submission,a.submission);
});
