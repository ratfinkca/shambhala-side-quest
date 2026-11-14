import test from 'node:test';
import assert from 'node:assert/strict';
import {createRun,startStage} from '../src/run.js';
import {makeRecovery,readRecovery} from '../src/recovery.js';
import {createStorage} from '../src/storage.js';
import {createSubmission} from '../src/online/submission.js';
import {recoveryFixture} from './helpers/recovery-fixtures.mjs';
import {createScreens} from '../src/screens.js';
import {renderOnlineBoard} from '../src/online/view.js';
import {runScoringVersion,SCORING_VERSION} from '../src/online/version.js';

const memory=()=>{const data=new Map();return {getItem:key=>data.get(key)??null,setItem:(key,value)=>data.set(key,value)};};
const entry=(id,score,scoringVersion)=>({id,initials:'AAA',score,stagesCleared:1,completedAt:1000,...(scoringVersion?{scoringVersion}:{})});

test('new generic runs enable the current crowd season while missing-version stages stay original',()=>{
 const current=createRun('endless','current');assert.equal(current.scoringVersion,'arcade-v3');assert.equal(startStage(current).crowdEnabled,true);
 const old=createRun('endless','old');delete old.scoringVersion;assert.equal(startStage(old).crowdEnabled,false);
 const pinned=createRun('rush','pinned');pinned.scoringVersion='arcade-v1';assert.equal(startStage(pinned).crowdEnabled,false);
});

test('generic recovery pins new seasons and normalizes old missing versions without changing ticket state',()=>{
 const current=makeRecovery(recoveryFixture());assert.equal(current.scoringVersion,'arcade-v3');assert.equal(readRecovery(current).value.run.scoringVersion,'arcade-v3');
 const legacy=makeRecovery(recoveryFixture(0,'arcade-v1'));delete legacy.scoringVersion;delete legacy.run.scoringVersion;
 legacy.submission={runId:legacy.run.id,status:'ready',code:null,ticket:'a'.repeat(64),expiresAt:999999,payload:null};
 const restored=readRecovery(legacy);assert.equal(restored.ok,true);assert.equal(restored.value.scoringVersion,'arcade-v1');assert.equal(restored.value.run.scoringVersion,'arcade-v1');
 assert.deepEqual(restored.value.submission,legacy.submission);assert.equal(startStage({...restored.value.run,status:'ready'}).crowdEnabled,false);
 const mismatch=structuredClone(current);mismatch.run.scoringVersion='arcade-v1';assert.equal(readRecovery(mismatch).ok,false);
 const unsupported=structuredClone(current);unsupported.scoringVersion='arcade-v99';assert.equal(readRecovery(unsupported).ok,false);
});

test('local original scores and bests survive a full current-season board and reload',()=>{
 const mem=memory();mem.setItem('sidequest.profile.v1',JSON.stringify({version:1,bestRush:9000,boards:{rush:Array.from({length:10},(_,i)=>entry(`old-${i}`,100+i))}}));
 const saved=createStorage(mem);
 for(let i=0;i<12;i++)assert.equal(saved.submitScore('rush',entry(`new-${i}`,200+i,'arcade-v2')).accepted,true);
 saved.saveBest(321,'arcade-v2');
 const reloaded=createStorage(mem),rows=reloaded.profile.boards.rush;
 assert.equal(rows.filter(row=>row.scoringVersion==='arcade-v1').length,10);
 assert.equal(rows.filter(row=>row.scoringVersion==='arcade-v2').length,10);
 assert.equal(rows.filter(row=>row.scoringVersion==='arcade-v2')[0].score,211);
 assert.equal(reloaded.bestFor('arcade-v1'),9000);assert.equal(reloaded.bestFor('arcade-v2'),321);
 assert.equal(reloaded.submitScore('rush',entry('bad',1,'unknown')).accepted,false);
});

test('saved original submission retries keep their exact original payload after season rollover',async()=>{
 const first=createSubmission('old');first.setTicket('old',{ticket:'a'.repeat(64),expiresAt:'2030-01-01T00:00:00Z'});
 await first.post({initials:'AAA',scoringVersion:'arcade-v1',mode:'rush'},async()=>({ok:false,code:'unavailable'}));
 const snapshot=first.snapshot(),restored=createSubmission('old',snapshot);
 await restored.post({initials:'BBB',scoringVersion:'arcade-v2'},async payload=>{assert.deepEqual(payload,snapshot.payload);assert.equal(payload.scoringVersion,'arcade-v1');return {ok:true,data:{accepted:true}};});
 assert.equal(restored.status,'succeeded');
});

test('completed original recovery retains a validated pending payload and rejects a cross-season payload',async()=>{
 const source=recoveryFixture(1,'arcade-v1');
 const submission=createSubmission(source.run.id);submission.setTicket(source.run.id,{ticket:'a'.repeat(64),expiresAt:'2030-01-01T00:00:00Z'});
 const payload={initials:'AAA',mode:'endless',scoringVersion:runScoringVersion(source.run),buildId:source.run.buildId,inputType:'touch',totalScore:source.run.totalScore,stagesCleared:source.run.stagesCleared,stages:source.run.scoreStages};
 await submission.post(payload,async()=>({ok:false,code:'unavailable'}));source.submission=submission;
 const checkpoint=makeRecovery(source);delete checkpoint.run.scoringVersion;delete checkpoint.scoringVersion;
 const restored=readRecovery(checkpoint);assert.equal(restored.ok,true);assert.deepEqual(restored.value.submission.payload,submission.snapshot().payload);
 const retry=createSubmission(restored.value.run.id,restored.value.submission);
 await retry.post({...payload,scoringVersion:SCORING_VERSION},async sent=>{assert.deepEqual(sent,submission.snapshot().payload);return {ok:true};});
 const bad=structuredClone(checkpoint);bad.submission.payload.scoringVersion='arcade-v2';assert.equal(readRecovery(bad).ok,false);
});

test('offline score screen defaults to current season and original scores remain selectable',t=>{
 const originals={document:globalThis.document,requestAnimationFrame:globalThis.requestAnimationFrame};
 const node=()=>({children:[],textContent:'',append(...children){this.children.push(...children);}}),lists=new Map(),listeners=new Map(),actions=[];
 const content={set innerHTML(value){this.html=value;lists.clear();},get innerHTML(){return this.html;},querySelector(selector){if(selector.startsWith('#board-')){if(!lists.has(selector))lists.set(selector,node());return lists.get(selector);}return null;}};
 const root={dataset:{},parentElement:{},querySelector:()=>content,addEventListener:(name,fn)=>listeners.set(name,fn)};
 globalThis.document={createElement:node};globalThis.requestAnimationFrame=()=>{};
 t.after(()=>{for(const [key,value] of Object.entries(originals)){if(value===undefined)delete globalThis[key];else globalThis[key]=value;}});
 const saved=createStorage(memory());saved.submitScore('rush',{...entry('old',900),initials:'OLD'});saved.submitScore('rush',{...entry('new',10,'arcade-v3'),displayName:'New Dancer',challenge:'been-around'});
 const screens=createScreens(root,{action:(...args)=>actions.push(args)}),profile=saved.profile;
 screens.show('scores',{profile});
 assert.match(content.html,/Challenge season/);assert.match(content.html,/Original season/);
 assert.match(content.html,/data-value="arcade-v3" aria-pressed="true"/);
 assert.deepEqual(lists.get('#board-rush').children.map(row=>row.children[0]?.textContent),['New Dancer']);
 listeners.get('click')({target:{closest:()=>({dataset:{action:'score-season',value:'arcade-v1'},disabled:false})}});
 assert.deepEqual(actions,[['score-season','arcade-v1']]);
 screens.show('scores',{profile,scoreSeason:actions[0][1]});
 assert.match(content.html,/data-value="arcade-v1" aria-pressed="true"/);
 assert.deepEqual(lists.get('#board-rush').children.map(row=>row.children[0]?.textContent),['OLD']);
});

test('online board caption identifies the selected scoring season',()=>{
 const board={mode:'rush',status:'ready',rows:[]};
 assert.match(renderOnlineBoard({...board,scoringVersion:'arcade-v3',challenge:'been-around'}),/Casual scores · Challenge season · all control types/);
 assert.match(renderOnlineBoard({...board,scoringVersion:'arcade-v2'}),/Casual scores · Crowd season · all control types/);
 assert.match(renderOnlineBoard({...board,scoringVersion:'arcade-v1'}),/Casual scores · Original season · all control types/);
});
