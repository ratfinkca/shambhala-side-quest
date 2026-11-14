import test from 'node:test';
import assert from 'node:assert/strict';
import {BONUSES,ROUTE,createTourProfile,createTourRun,stageForRun,endFestival,saveTourScore,closeResults} from '../src/smf-tour/model.js';
import {createTourStore,normalizeTourProfile} from '../src/smf-tour/store.js';
import {boardsHTML,rulesHTML,summaryHTML} from '../src/smf-tour/view.js';
import {smfRunFields,resumeSmfSubmission} from '../src/smf-tour/online.js';
import {createBoard} from '../src/online/board.js';
import {createSmfTelemetry} from '../src/smf-tour/telemetry.js';
import {createRound,advanceRound} from '../src/game.js';
import {createEncounter} from '../src/festival.js';
import {invitedBonusVisit} from './fixtures/smf-bonus-profile.mjs';

const original='smf-v1',crowd='smf-v2',current='smf-v3';
const memory=()=>{const data=new Map();return {getItem:key=>data.get(key)??null,setItem:(key,value)=>data.set(key,value)};};
function localRow(id,score,scoringVersion,rushStageId){return {id,...(scoringVersion===current?{displayName:'NEW',challenge:'been-around'}:{initials:'OLD'}),score,cleared:0,stagesCleared:0,...(scoringVersion?{scoringVersion}:{}),...(rushStageId?{rushStageId}:{})};}

test('new runs and invited bonus visits use the crowd season; omitted saved seasons remain original',()=>{
 for(const mode of ['rush','festival','endless']){
  const p=createTourRun(createTourProfile(),mode,`new-${mode}`);
  assert.equal(p.active.scoringVersion,current);
  assert.equal(normalizeTourProfile(p).active.scoringVersion,current);
  delete p.active.scoringVersion;
  assert.equal(normalizeTourProfile(p).active.scoringVersion,original);
  p.active.scoringVersion='smf-v4';assert.equal(normalizeTourProfile(p).active,null);
 }
 for(const bonus of BONUSES)assert.equal(invitedBonusVisit(bonus.id).active.scoringVersion,current);
});

test('legacy queued posts preserve their ticket, season, and exact payload across reload and retry',async()=>{
 const p=endFestival(createTourRun(createTourProfile(),'festival','legacy-retry'));delete p.active.scoringVersion;
 const a=p.active,ticket='a'.repeat(64),payload={editionId:'smf',runId:a.id,ticket,initials:'OLD',mode:a.mode,scoringVersion:original,buildId:a.buildId,inputType:a.inputType,totalScore:a.score,stagesCleared:a.cleared,stages:[]};
 a.submission={runId:a.id,status:'pending',code:null,ticket,expiresAt:123,payload};
 const store=createTourStore(memory());assert.equal(store.write(p),true);
 const loaded=store.read();assert.equal(loaded.active.scoringVersion,original);assert.deepEqual(loaded.active.submission,a.submission);
 const submission=resumeSmfSubmission(loaded.active,null),sent=[];
 await submission.post({...payload,scoringVersion:current,initials:'NEW'},async value=>{sent.push(value);return {ok:true};});
 assert.deepEqual(sent,[payload]);assert.equal(submission.status,'succeeded');
 assert.equal(closeResults(loaded).lastResult.scoringVersion,original);
 loaded.active.scoringVersion=current;assert.equal(normalizeTourProfile(loaded).active,null,'mismatched retry season is rejected');
});

test('a parked original run keeps its clock, crowd layout, and unposted ticket through migration',()=>{
 const p=createTourRun(createTourProfile(),'endless','original-parked'),a=p.active,stage=stageForRun(a);
 delete a.scoringVersion;a.needsIntro=false;
 const round=createRound({},stage.timingId);round.runId=a.id;advanceRound(round,12000);delete round.rules;round.sincePickupMs=null;
 a.scene={round,player:{...stage.spawn},sparks:Array.from({length:12},()=>({...stage.spawn})),candy:{placed:false,x:0,y:0},crowd:stage.crowdAnchors.map(()=>createEncounter())};
 a.submission={runId:a.id,status:'ready',code:null,ticket:'b'.repeat(64),expiresAt:Date.now()+10000,payload:null};
 const originalScene=structuredClone(a.scene),store=createTourStore(memory());assert.equal(store.write(p),true);
 const loaded=store.read().active;assert.equal(loaded.scoringVersion,original);assert.deepEqual(loaded.scene,originalScene);assert.deepEqual(stageForRun(loaded).crowdAnchors,stage.crowdAnchors);assert.deepEqual(loaded.submission,a.submission);
 assert.equal(resumeSmfSubmission(loaded,null).status,'ready');assert.equal(smfRunFields(loaded).scoringVersion,original);
});

test('ticket and score fields follow the run season, including restored original Rush venue',()=>{
 assert.deepEqual(smfRunFields({mode:'rush'}),{scoringVersion:original,rushStageId:'smf-pagoda'});
 for(const scoringVersion of [original,crowd,current])for(const mode of ['festival','endless','rush']){
  const run={mode,scoringVersion,rushStageId:'smf-amp'};
  assert.deepEqual(smfRunFields(run),{scoringVersion,...(mode==='rush'?{rushStageId:'smf-amp'}:{}),...(scoringVersion===current?{challenge:'been-around'}:{})});
 }
});

test('new local scores preserve the full original archive and retain twenty scores per season and Rush venue',()=>{
 for(const mode of ['festival','endless','rush']){
  const p=createTourProfile(),venues=mode==='rush'?ROUTE:[undefined];
  p.boards[mode]=venues.flatMap(venue=>Array.from({length:20},(_,i)=>localRow(`old-${venue??mode}-${i}`,i,undefined,venue==='smf-pagoda'?undefined:venue)));
  const before=structuredClone(p.boards[mode]);let result=normalizeTourProfile(p);
  for(const venue of venues)for(let i=0;i<24;i++){
   result=createTourRun(result,mode,`new-${venue??mode}-${i}`);
   if(venue)result.active.rushStageId=venue;
   result.active.score=1000+i;result=endFestival(result);result=saveTourScore(result,'NEW');result=closeResults(result);
  }
  const store=createTourStore(memory());assert.equal(store.write(result),true);const rows=store.read().boards[mode];
  const archive=rows.filter(row=>row.scoringVersion===original);
  assert.equal(archive.length,before.length);
  assert.deepEqual(new Set(archive.map(row=>row.id)),new Set(before.map(row=>row.id)));
  for(const venue of venues)for(const scoringVersion of [original,current])assert.equal(rows.filter(row=>row.scoringVersion===scoringVersion&&(!venue||row.rushStageId===venue)).length,20);
 }
});

test('local and online boards default to current and switch both sources together without stale season rows',()=>{
 const p=createTourProfile();p.boards.rush=[localRow('old',900),{...localRow('new',100,current),initials:'NEW'}];
 const board={mode:'rush',rushStageId:'smf-pagoda',scoringVersion:original,status:'ready',rows:[{...localRow('web',800,original),initials:'WEB'}]};
 let html=boardsHTML(p,{onlineEnabled:true,board});
 assert.match(html,/<select[^>]*id="tour-board-season"[^>]*data-board-season/);
 assert.match(html,/<option value="smf-v3" selected>Challenge season<\/option>/);
 assert.match(html,/>NEW</);assert.doesNotMatch(html,/>OLD<|>WEB<|900 points/);assert.match(html,/Loading online scores/);
 html=boardsHTML(p,{boardVersion:original,onlineEnabled:true,board});
 assert.match(html,/<option value="smf-v1" selected>Original season<\/option>/);assert.match(html,/>OLD</);assert.match(html,/>WEB</);assert.doesNotMatch(html,/>NEW<|100 points/);
 for(const mode of ['festival','endless']){p.boards[mode]=p.boards.rush;const selected=boardsHTML(p,{boardMode:mode,boardVersion:original});assert.match(selected,/>OLD</);assert.doesNotMatch(selected,/>NEW</);}
});

test('original saved runs explain original play and label their result season',()=>{
 const p=createTourRun(createTourProfile(),'festival','saved');delete p.active.scoringVersion;
 const html=rulesHTML(p);assert.match(html,/Original season/);assert.match(html,/without crowd collisions or friendship/);assert.doesNotMatch(html,/Four clean passes/);
 assert.match(summaryHTML(endFestival(p)),/Original season/);
 p.active.scoringVersion=current;assert.match(rulesHTML(p),/(?:Four|4) clean passes/);assert.match(summaryHTML(endFestival(p)),/Challenge season/);
});

test('online board identity and cache include season, so late results cannot replace the selected season',async()=>{
 const requests=[],pending={};
 const board=createBoard(request=>{requests.push(request);return new Promise(resolve=>pending[request.scoringVersion]=resolve);});
 const old=board.select('rush',original,'smf-amp'),now=board.select('rush',current,'smf-amp');
 assert.equal(board.scoringVersion,current);assert.equal(board.status,'loading');
 pending[current]({ok:true,data:[{season:current}]});await now;pending[original]({ok:true,data:[{season:original}]});assert.equal(await old,false);
 assert.equal(board.scoringVersion,current);assert.deepEqual(board.rows,[{season:current}]);
 await board.select('rush',original,'smf-amp');assert.equal(requests.length,2);assert.equal(board.scoringVersion,original);assert.deepEqual(board.rows,[{season:original}]);
 assert.deepEqual(requests.map(r=>r.scoringVersion),[original,current]);
});

test('opt-in telemetry snapshots the active run season before it can change',async()=>{
 let scoringVersion=original,consent=false,reads=0;const sent=[],id='123e4567-e89b-42d3-a456-426614174000';
 const telemetry=createSmfTelemetry({config:{enabled:true},consent:()=>consent,uuid:()=>id,getScoringVersion:()=>{reads++;return scoringVersion;},send:async batch=>{sent.push(...batch);return true;}});
 const event={mode:'festival',type:'run',outcome:'complete',stagesCleared:6,totalScore:100};
 assert.equal(telemetry.record(event),false);assert.equal(reads,0);
 consent=true;assert.equal(telemetry.record(event),true);scoringVersion=current;assert.equal(telemetry.record(event),true);scoringVersion=original;await telemetry.flush();
 assert.deepEqual(sent.map(e=>e.scoringVersion),[original,current]);
});
