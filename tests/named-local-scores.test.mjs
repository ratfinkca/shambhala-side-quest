import test from 'node:test';
import assert from 'node:assert/strict';
import {createStorage} from '../src/storage.js';
import {rankScores} from '../src/profile.js';
import {createTourProfile,createTourRun,endFestival,saveTourScore,setTourPlayerName} from '../src/smf-tour/model.js';
import {normalizeTourProfile} from '../src/smf-tour/store.js';
const memory=()=>{const values=new Map();return {getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,v)};};
const row=(id,challenge='been-around',score=100)=>({id,scoringVersion:'arcade-v3',displayName:'Moon Dancer',challenge,score,stagesCleared:1,completedAt:100});
test('v3 local names are immutable snapshots, legacy initials stay unchanged',()=>{
 const s=createStorage(memory());s.savePlayerName('Moon Dancer');assert.equal(s.submitScore('rush',row('one')).accepted,true);s.savePlayerName('New Name');assert.equal(s.profile.boards.rush[0].displayName,'Moon Dancer');
 assert.equal(s.submitScore('rush',{id:'old',initials:'OLD',score:50,stagesCleared:1,completedAt:100}).accepted,true);
 assert.equal(s.profile.boards.rush.find(e=>e.id==='old').initials,'OLD');assert.equal(s.submitScore('rush',{...row('bad'),displayName:'sh1t'}).accepted,false);
});
test('v3 rankings retain ten scores per challenge and default missing challenge',()=>{
 const rows=[];for(const challenge of ['first-timer','been-around','seasoned-vet'])for(let i=0;i<12;i++)rows.push(row(`${challenge}:${i}`,challenge,i));
 const ranked=rankScores(rows);assert.equal(ranked.length,30);assert.equal(ranked.filter(e=>e.challenge==='first-timer').length,10);
 const missing=row('missing');delete missing.challenge;assert.equal(rankScores([missing])[0].challenge,'been-around');
 assert.deepEqual(rankScores([row('forged','unknown')]),[]);
});
test('challenge preferences and v3 best scores persist independently of legacy bests',()=>{
 const data=memory(),s=createStorage(data);assert.equal(s.profile.challengePreference,'been-around');assert.equal(s.saveChallenge('first-timer').persisted,true);assert.equal(s.saveChallenge('bad').accepted,false);
 s.saveBest(99,'arcade-v1');s.saveBest(123,'arcade-v2');s.saveBest(456,'arcade-v3','first-timer');s.saveBest(321,'arcade-v3','seasoned-vet');
 const again=createStorage(data);assert.equal(again.profile.challengePreference,'first-timer');assert.equal(again.bestFor('arcade-v1'),99);assert.equal(again.bestFor('arcade-v2'),123);assert.equal(again.bestFor('arcade-v3','first-timer'),456);assert.equal(again.bestFor('arcade-v3','seasoned-vet'),321);assert.equal(again.bestFor('arcade-v3'),0);
});
test('SMF v3 saves names and challenge while legacy runs still save initials',()=>{
 let p=setTourPlayerName(createTourProfile(),'Tour Name');p=endFestival(createTourRun(p,'festival','named-run'));p.active.challenge='first-timer';p=saveTourScore(p,'Tour Name');assert.equal(p.active.scoreSaved,true);assert.equal(p.boards.festival[0].displayName,'Tour Name');assert.equal(p.boards.festival[0].challenge,'first-timer');
 p=setTourPlayerName(p,'Changed');assert.equal(p.boards.festival[0].displayName,'Tour Name');assert.equal(normalizeTourProfile(p).boards.festival[0].displayName,'Tour Name');
 let old=createTourRun(createTourProfile(),'festival','legacy');old.active.scoringVersion='smf-v2';old=endFestival(old);old=saveTourScore(old,'old');assert.equal(old.boards.festival[0].initials,'OLD');assert.equal(Object.hasOwn(old.boards.festival[0],'displayName'),false);
});
