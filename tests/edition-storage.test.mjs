import test from 'node:test';import assert from 'node:assert/strict';
import {getEdition} from '../src/editions/registry.js';
import {storageContext} from '../src/editions/storage-context.js';
import {createStorage} from '../src/storage.js';
import {makeRecovery,readRecovery} from '../src/recovery.js';
import {practiceStorage,resetPractice} from '../src/recovery-practice.js';
import {recoveryFixture} from './helpers/recovery-fixtures.mjs';
import {finishRun} from '../src/run.js';import {createSubmission} from '../src/online/submission.js';
const context=id=>storageContext(getEdition(id));
const memory=()=>{const data=new Map();return {data,getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v),removeItem:k=>data.delete(k)}};
test('same-origin edition profiles preserve generic consent/wardrobe and isolate writes',()=>{
 const mem=memory();mem.setItem('sidequest.best','123');mem.setItem('sidequest.sound','false');
 const original=createStorage(mem);original.savePlaytestConsent('accepted','legacy-player');original.awardProgress({id:'original-stage',pickups:35,qualified:true});original.saveRecovery(makeRecovery(recoveryFixture()));
 const before=mem.getItem(context('generic').profileKey),generic=createStorage(mem,{context:context('generic')}),smf=createStorage(mem,{context:context('smf')});
 assert.deepEqual(generic.profile,original.profile);assert.deepEqual(generic.recovery,original.recovery);
 assert.equal(smf.best,0);assert.equal(smf.sound,true);assert.equal(smf.profile.progress.xp,0);assert.equal(smf.profile.playtestConsent,'unknown');assert.equal(smf.profile.playtestIdentity,null);assert.equal(smf.recovery,null);
 smf.saveBest(456);smf.savePlaytestConsent('declined');smf.saveRecovery(null);
 assert.equal(mem.getItem(context('generic').profileKey),before);assert.equal(createStorage(mem,{context:context('smf')}).best,456);
 generic.saveSound(true);assert.equal(createStorage(mem,{context:context('smf')}).profile.playtestConsent,'declined');
});
test('edition locks, recovery labs and lab reset stay separate',()=>{
 const mem=memory(),g=storageContext(getEdition('generic'),{recoveryLab:true,rehearsal:true}),s=storageContext(getEdition('smf'),{recoveryLab:true,rehearsal:true});
 assert.equal(context('generic').lockName,'sidequest.profile.v1');assert.equal(context('smf').lockName,'sidequest.smf.profile.v1');
 assert.equal(g.lockName,'sidequest.recovery-practice');assert.equal(s.lockName,'sidequest.smf.recovery-practice');assert.equal(g.allowLegacy,false);
 mem.setItem(context('generic').profileKey,'real generic');mem.setItem(context('smf').profileKey,'real smf');
 practiceStorage(mem,g).setItem(g.profileKey,'generic practice');practiceStorage(mem,s).setItem(s.profileKey,'smf practice');resetPractice(mem,s);
 assert.equal(practiceStorage(mem,g).getItem(g.profileKey),'generic practice');assert.equal(practiceStorage(mem,s).getItem(s.profileKey),null);
 assert.equal(mem.getItem(context('generic').profileKey),'real generic');assert.equal(mem.getItem(context('smf').profileKey),'real smf');
});
test('edition storage errors and ownership refusal retain honest in-memory fallback',()=>{
 for(const mem of [undefined,{getItem(){throw Error('blocked')},setItem(){throw Error('blocked')}}]){
  const s=createStorage(mem,{context:context('smf')});assert.equal(s.savePlaytestConsent('accepted','new').persisted,false);assert.equal(s.profile.playtestConsent,'accepted');
 }
 const mem=memory(),s=createStorage(mem,{context:context('smf'),canWrite:()=>false});s.saveBest(7);assert.equal(mem.data.size,0);
});
test('legacy recovery is generic-only and frozen retries survive profile load byte-for-byte',async()=>{
 const f=recoveryFixture(1);f.run.scoringVersion='arcade-v1';finishRun(f.run);f.scene=null;f.screen={name:'results'};
 f.resultSnapshot={id:f.run.id,score:f.run.totalScore,stagesCleared:f.run.stagesCleared,inputType:'touch',outfit:{onesie:'lime',hat:'bucket',totem:'star',flair:'none'},completedAt:1000};
 const payload={runId:f.run.id,ticket:'a'.repeat(64),initials:'ABC',mode:'endless',scoringVersion:'arcade-v1',buildId:f.run.buildId,inputType:'touch',totalScore:f.run.totalScore,stagesCleared:f.run.stagesCleared,stages:f.run.scoreStages};
 f.submission={runId:f.run.id,status:'pending',code:null,ticket:payload.ticket,expiresAt:2000,payload};
 const cp=makeRecovery(f),bytes=JSON.stringify(payload),mem=memory(),saved=createStorage(mem);
 saved.commitStage({id:f.run.id+':0',pickups:20,qualified:true},cp);const xp=saved.profile.progress.xp;
 const again=createStorage(mem,{context:context('generic')}),result=readRecovery(again.recovery,{editionId:'generic'});assert.equal(result.ok,true);
 assert.equal(readRecovery(cp,{editionId:'smf'}).ok,false);assert.equal(readRecovery(cp,{editionId:'bogus'}).ok,false);
 assert.equal(result.value.run.buildId,'original-build');assert.equal(JSON.stringify(result.value.submission.payload),bytes);
 assert.equal(again.commitStage({id:f.run.id+':0',pickups:20,qualified:true},cp).xp,0);assert.equal(again.profile.progress.xp,xp);
 const sub=createSubmission(f.run.id,result.value.submission);let calls=0;await sub.post({...payload,initials:'NEW'},async p=>{calls++;assert.equal(JSON.stringify(p),bytes);return {ok:true}});await sub.post(payload,async()=>{calls++;});assert.equal(calls,1);
 const live=makeRecovery(recoveryFixture());assert.equal(readRecovery(live).value.scene.round.remainingMs,44000);
});
