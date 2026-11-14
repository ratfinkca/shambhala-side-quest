import test from 'node:test';
import assert from 'node:assert/strict';
import {genericTarget} from '../supabase/functions/_shared/edition-rules.js';
import {smfRuleStage} from '../supabase/functions/_shared/smf-rules.js';
import * as generic from '../supabase/functions/_shared/score.js';
import * as smf from '../supabase/functions/_shared/smf-score.js';
import {createArcadeHandler} from '../supabase/functions/_shared/arcade.js';
import {createSmfArcadeHandler} from '../supabase/functions/_shared/smf-arcade.js';
import {validatePlaytestBatch} from '../supabase/functions/_shared/playtest.js';
import {validSmfEvents} from '../supabase/functions/_shared/smf-playtest.js';
import {smfSeasonRows,limitSeasonBoard} from '../src/smf-tour/seasons.js';
import {limitRushBoard} from '../src/smf-tour/rush-rotation.js';

export function challengeScore(edition='generic',challenge='first-timer',mode='endless'){
 const isSmf=edition==='smf';
 return {...(isSmf?{editionId:'smf'}:{}),runId:'00000000-0000-4000-8000-000000000001',ticket:'a'.repeat(64),mode,scoringVersion:isSmf?'smf-v3':'arcade-v3',buildId:'challenge-test',challenge,displayName:'Moss Dancer',inputType:'touch',totalScore:170,stagesCleared:1,
  stages:[{stageIndex:0,...(isSmf?{stageId:mode==='rush'?'smf-pagoda':'smf-living-room'}:{}),activeMs:isSmf&&mode!=='rush'?68571:60000,pickups:17,closePasses:0,score:170,perks:[],sparks:[17,...Array(19).fill(0)],passes:[0,0]}]};
}
const run=p=>Object.fromEntries(['editionId','runId','mode','scoringVersion','buildId','challenge'].filter(k=>Object.hasOwn(p,k)).map(k=>[k,p[k]]));
const request=body=>new Request('https://example.test',{method:'POST',headers:{origin:'https://example.test','content-type':'application/json'},body:JSON.stringify(body)});

test('v3 scales musical targets after rounding and caps each challenge crowd while legacy stages stay unchanged',()=>{
 assert.equal(genericTarget(0,false,'first-timer','arcade-v3'),14);
 assert.equal(genericTarget(100,true,'seasoned-vet','arcade-v3'),59);
 assert.equal(genericTarget(0,false,'first-timer','arcade-v2'),20);
 const easy=smfRuleStage('endless',0,undefined,'first-timer','smf-v3');
 assert.equal(easy.target,17);assert.equal(easy.crowdCount,7);
 assert.equal(smfRuleStage('endless',0,undefined,'seasoned-vet','smf-v3').target,30);
 for(const [challenge,cap] of [['first-timer',16],['been-around',22],['seasoned-vet',28]])assert.equal(smfRuleStage('endless',300,undefined,challenge,'smf-v3').crowdCount,cap);
 assert.equal(smfRuleStage('endless',0,undefined,'first-timer','smf-v2').target,23);
});

test('v3 receipts require names and exact challenge and bind the challenge to the ticket',()=>{
 for(const [edition,validator] of [['generic',generic],['smf',smf]]){
  const p=challengeScore(edition),ticket={...run(p),elapsedMs:120000};
  assert.equal(validator.validRun(run(p)),true);assert.equal(validator.validateScore(p,ticket).ok,true);
  assert.equal(validator.validateScore(p,{...ticket,challenge:'seasoned-vet'}).code,'invalid_ticket');
  assert.equal(validator.validateScore({...p,challenge:'been-around'}).ok,false);
  assert.equal(validator.validateScore({...p,challenge:'unknown'}).ok,false);
  assert.equal(validator.validateScore({...p,displayName:'<script>'}).code,'invalid_name');
  assert.equal(validator.validateScore({...p,displayName:'  Moss   Dancer  '}).record.displayName,'Moss Dancer');
  const noName={...p};delete noName.displayName;assert.equal(validator.validateScore(noName).ok,false);
  assert.equal(validator.validateScore({...p,initials:'ABC'}).ok,false);
  const row={...(edition==='smf'?{editionId:'smf'}:{}),displayName:p.displayName,challenge:p.challenge,score:170,stagesCleared:1,inputType:'touch',mode:p.mode,scoringVersion:p.scoringVersion,receivedAt:'2026-11-13T00:00:00Z'};
  const board=rows=>edition==='smf'?validator.validBoard(rows,p.mode,p.scoringVersion,undefined,p.challenge):validator.validBoard(rows,p.mode,p.scoringVersion,p.challenge);
  assert.equal(board([row]),true);assert.equal(board([{...row,challenge:'seasoned-vet'}]),false);assert.equal(board([{...row,initials:'ABC'}]),false);
 }
});

test('only v3 permits the frequency perks and challenge targets decide later-stage eligibility',()=>{
 for(const [edition,validator] of [['generic',generic],['smf',smf]])for(const perk of ['candy-magnet','flow-finder']){
  const p=challengeScore(edition),next={...p.stages[0],stageIndex:1,...(edition==='smf'?{stageId:'smf-fractal',activeMs:64000}:{}),pickups:0,score:0,perks:[perk],sparks:Array(20).fill(0)};
  p.stages.push(next);assert.equal(validator.validateScore(p).ok,true);
  const legacy={...p,scoringVersion:edition==='smf'?'smf-v2':'arcade-v2',initials:'ABC'};delete legacy.displayName;delete legacy.challenge;
  assert.equal(validator.validateScore(legacy).ok,false);
 }
});

test('invalid v3 names can be corrected before the HTTP handler consumes a ticket and telemetry fields are rejected',async()=>{
 for(const [edition,create] of [['generic',createArcadeHandler],['smf',createSmfArcadeHandler]]){
  let writes=0;const p=challengeScore(edition),server=create({kind:'submit-score',origins:['https://example.test'],secret:'test',rpc:async()=>{writes++;return {accepted:true};}});
  const bad=await server(request({...p,displayName:'<b>'}));assert.equal(bad.status,400);assert.equal((await bad.json()).code,'invalid_name');assert.equal(writes,0);
  const corrected=await server(request({...p,displayName:'New Moss'}));assert.equal(corrected.status,200);assert.equal(writes,1);
  assert.equal((await server(request({...p,characterSlot:1}))).status,400);
 }
});

test('v3 perk telemetry accepts new perks without admitting names or character slots',()=>{
 const id='00000000-0000-4000-8000-000000000001';
 for(const perk of ['candy-magnet','flow-finder']){
  const generic={schemaVersion:1,eventId:id,installationId:id,sessionId:id,runId:id,type:'perk',mode:'festival',buildId:'test',scoringVersion:'arcade-v3',theme:'forest-freakout',viewport:'small',inputType:'touch',payload:{perk}};
  const smf={editionId:'smf',scoringVersion:'smf-v3',eventId:id,guestId:id,buildId:'test',mode:'festival',type:'perk',stageIndex:1,action:'take',perk,replaced:null};
  assert.equal(validatePlaytestBatch([generic]).ok,true);assert.equal(validSmfEvents([smf]),true);
  assert.equal(validatePlaytestBatch([{...generic,scoringVersion:'arcade-v2'}]).ok,false);assert.equal(validSmfEvents([{...smf,scoringVersion:'smf-v2'}]),false);
  for(const extra of [{displayName:'Moss'},{characterSlot:1}]){assert.equal(validatePlaytestBatch([{...generic,...extra}]).ok,false);assert.equal(validSmfEvents([{...smf,...extra}]),false);}
 }
});

test('local SMF boards retain twenty scores per challenge and venue without mixing legacy seasons',()=>{
 const rows=[];
 for(const challenge of ['first-timer','been-around','seasoned-vet'])for(let i=0;i<25;i++)rows.push({id:`${challenge}-${i}`,scoringVersion:'smf-v3',challenge,rushStageId:'smf-pagoda',score:i,cleared:1});
 rows.push({id:'old',scoringVersion:'smf-v2',rushStageId:'smf-pagoda',score:100,cleared:1});
 assert.equal(limitSeasonBoard(rows,'festival').length,61);assert.equal(limitRushBoard(rows).length,61);
 assert.equal(smfSeasonRows(rows,'smf-v3','first-timer').length,25);assert.equal(smfSeasonRows(rows,'smf-v2','first-timer').length,1);
 assert.equal(limitRushBoard([...rows,...rows.filter(row=>row.scoringVersion==='smf-v3').map(row=>({...row,rushStageId:'smf-amp'}))]).length,121);
});
