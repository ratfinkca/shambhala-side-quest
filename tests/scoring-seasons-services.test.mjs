import test from 'node:test';
import assert from 'node:assert/strict';
import * as genericRules from '../supabase/functions/_shared/edition-rules.js';
import * as smfRules from '../supabase/functions/_shared/smf-rules.js';
import * as generic from '../supabase/functions/_shared/score.js';
import * as smf from '../supabase/functions/_shared/smf-score.js';
import {createArcadeHandler} from '../supabase/functions/_shared/arcade.js';
import {createSmfArcadeHandler} from '../supabase/functions/_shared/smf-arcade.js';
import {validatePlaytestBatch} from '../supabase/functions/_shared/playtest.js';
import {validSmfEvents} from '../supabase/functions/_shared/smf-playtest.js';

const id='00000000-0000-4000-8000-000000000001';
function score(edition,version,mode='rush'){
 const rule=edition==='smf'?smfRules.smfRuleStage(mode,0):null;
 return {...(rule?{editionId:'smf'}:{}),runId:id,ticket:'a'.repeat(64),initials:'ABC',mode,scoringVersion:version,buildId:'season-test',inputType:'touch',totalScore:25,stagesCleared:mode==='rush'?1:0,
  stages:[{stageIndex:0,...(rule?{stageId:rule.id}:{}),activeMs:rule?.durationMs??60000,pickups:1,closePasses:1,score:25,perks:[],sparks:[1,...Array(19).fill(0)],passes:[1,0]}]};
}
const run=score=>Object.fromEntries(['editionId','runId','mode','scoringVersion','buildId'].filter(key=>Object.hasOwn(score,key)).map(key=>[key,score[key]]));
const request=body=>new Request('https://example.test',{method:'POST',headers:{origin:'https://example.test','content-type':'application/json'},body:JSON.stringify(body)});

test('season exports select v2 while legacy rule identities remain stable',()=>{
 assert.equal(genericRules.GENERIC_RULES.id,'arcade-v1');assert.equal(smfRules.SMF_RULES.id,'smf-v1');
 assert.equal(genericRules.GENERIC_SCORING_VERSION,'arcade-v2');assert.equal(smfRules.SMF_SCORING_VERSION,'smf-v2');
 assert.deepEqual(genericRules.GENERIC_SCORING_VERSIONS,['arcade-v1','arcade-v2']);assert.deepEqual(smfRules.SMF_SCORING_VERSIONS,['smf-v1','smf-v2']);
 assert.equal(Object.isFrozen(genericRules.GENERIC_SCORING_VERSIONS),true);assert.equal(Object.isFrozen(smfRules.SMF_SCORING_VERSIONS),true);
});

test('both seasons validate unchanged score arithmetic across all modes and bind ticket versions',()=>{
 for(const [edition,validator,prefix] of [['generic',generic,'arcade'],['smf',smf,'smf']])for(const mode of ['rush','festival','endless'])for(const n of [1,2]){
  const p=score(edition,`${prefix}-v${n}`,mode),ticket={...run(p),elapsedMs:120000};
  assert.equal(validator.validRun(run(p)),true);
  assert.equal(validator.validateScore(p,ticket).ok,true,`${edition} ${mode} v${n}`);
  assert.equal(validator.validateScore({...p,totalScore:26}).ok,false);
  assert.equal(validator.validateScore(p,{...ticket,scoringVersion:`${prefix}-v${n===1?2:1}`}).code,'invalid_ticket');
  for(const version of [`${prefix}-v3`,'unknown',null])assert.equal(validator.validateScore({...p,scoringVersion:version}).ok,false);
 }
});

test('legacy and current HTTP routes forward the selected version without changing receipt shapes',async()=>{
 for(const [edition,handler,prefix] of [['generic',createArcadeHandler,'arcade'],['smf',createSmfArcadeHandler,'smf']])for(const n of [1,2])for(const kind of ['run-ticket','submit-score','leaderboard']){
  const p=score(edition,`${prefix}-v${n}`),seen=[];
  const server=handler({kind,origins:['https://example.test'],secret:'test-only',rpc:async(name,args)=>{
   seen.push({name,args});return kind==='leaderboard'?[]:kind==='run-ticket'?{expiresAt:'2027-01-01T00:00:00Z'}:{accepted:true};
  }});
  const body=kind==='submit-score'?p:kind==='run-ticket'?run(p):{...(edition==='smf'?{editionId:'smf'}:{}),mode:p.mode,scoringVersion:p.scoringVersion};
  assert.equal((await server(request(body))).status,200,`${edition} ${kind} v${n}`);
  assert.equal(seen.length,1);
  assert.equal(kind==='submit-score'?seen[0].args.p_record.scoringVersion:seen[0].args.p_version,p.scoringVersion);
  const wrong={...body,scoringVersion:`${prefix}-v3`};
  assert.equal((await server(request(wrong))).status,400);assert.equal(seen.length,1);
 }
});

test('generic telemetry accepts both seasons with unchanged schemas and wide friendship clearance',()=>{
 for(const scoringVersion of ['arcade-v1','arcade-v2'])for(const mode of ['rush','festival','endless']){
  const e={schemaVersion:mode==='endless'?2:1,eventId:id,installationId:id,sessionId:id,runId:id,type:'stage_end',mode,buildId:'season-test',scoringVersion,theme:'forest-freakout',viewport:'small',inputType:'touch',payload:{stageIndex:0,activeMs:60000,bassMs:0,chargeMs:0,pickups:0,bumps:0,closePasses:1,clearanceBins:[0,0,1],minClearance:48,peakCombo:0,flowUses:0,bassUses:0,candies:{speed:0,dizzy:0,waves:0},score:15,qualified:mode==='rush',finished:true}};
  assert.equal(validatePlaytestBatch([e]).ok,true);
  assert.equal(validatePlaytestBatch([{...e,scoringVersion:'arcade-v3'}]).ok,false);
  assert.equal(validatePlaytestBatch([{...e,friendship:{id}}]).ok,false);
 }
});

test('SMF telemetry accepts legacy/current run and venue stage events without adding personal fields',()=>{
 for(const scoringVersion of ['smf-v1','smf-v2']){
  const base={editionId:'smf',scoringVersion,eventId:id,guestId:id,buildId:'season-test',mode:'rush',rushStageId:'smf-fractal',movementMode:'stick'};
  const stage={...base,type:'stage',stageIndex:0,stageId:'smf-fractal',pickups:1,closePasses:1,bassUses:0};
  const finished={...base,type:'run',outcome:'complete',stagesCleared:1,totalScore:25};
  for(const e of [stage,finished]){
   assert.equal(validSmfEvents([e]),true);
   assert.equal(validSmfEvents([{...e,scoringVersion:'smf-v3'}]),false);
   assert.equal(validSmfEvents([{...e,friendId:id}]),false);
  }
 }
});
