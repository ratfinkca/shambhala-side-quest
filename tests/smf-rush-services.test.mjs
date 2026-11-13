import test from 'node:test';
import assert from 'node:assert/strict';
import {smfRuleStage} from '../supabase/functions/_shared/smf-rules.js';
import {validRun,validateScore,validBoard} from '../supabase/functions/_shared/smf-score.js';
import {createSmfArcadeHandler} from '../supabase/functions/_shared/smf-arcade.js';
import {validSmfEvents} from '../supabase/functions/_shared/smf-playtest.js';

const venues=[['smf-living-room',68571,10],['smf-fractal',64000,12],['smf-grove',58182,14],['smf-amp',54857,16],['smf-pagoda',60000,18],['smf-village',66977,20]];
const run={editionId:'smf',runId:'123e4567-e89b-42d3-a456-426614174000',mode:'rush',scoringVersion:'smf-v1',buildId:'rush-test'};
const makeScore=(rushStageId,durationMs)=>({...run,...(rushStageId?{rushStageId}:{}),ticket:'a'.repeat(64),initials:'ABC',inputType:'touch',totalScore:0,stagesCleared:1,stages:[{stageIndex:0,stageId:rushStageId??'smf-pagoda',activeMs:durationMs??60000,pickups:0,closePasses:0,score:0,perks:[],sparks:Array(20).fill(0),passes:[0,0]}]});
const request=body=>new Request('https://example.test',{method:'POST',headers:{origin:'https://example.test','content-type':'application/json'},body:JSON.stringify(body)});

test('Quick Rush selects the venue clock and crowd while keeping the legacy Pagoda default',()=>{
 assert.equal(smfRuleStage('rush',0).id,'smf-pagoda');
 for(const [id,durationMs,crowdCount] of venues){
  const stage=smfRuleStage('rush',0,id);
  assert.deepEqual([stage.id,stage.durationMs,stage.crowdCount,stage.target,stage.timingId],[id,durationMs,crowdCount,0,`${id}-clock-preview-1`]);
 }
});

test('Quick Rush rejects unknown, secret and cross-mode venue selections',()=>{
 for(const id of ['',null,0,{},['smf-pagoda'],'smf-somewhere'])assert.throws(()=>smfRuleStage('rush',0,id),RangeError);
 for(const mode of ['festival','endless'])assert.throws(()=>smfRuleStage(mode,0,'smf-pagoda'),RangeError);
 assert.throws(()=>smfRuleStage('rush',1,'smf-fractal'),RangeError);
});

test('Rush receipts match their declared venue, exact clock and ticket venue',()=>{
 assert.equal(validRun(run),true);
 assert.equal(validateScore(makeScore()).ok,true);
 for(const [rushStageId,durationMs] of venues){
  const score=makeScore(rushStageId,durationMs);
  assert.equal(validRun({...run,rushStageId}),true);
  assert.equal(validateScore(score,{...run,rushStageId,elapsedMs:durationMs}).ok,true);
  assert.equal(validateScore({...score,stages:[{...score.stages[0],activeMs:durationMs+1}]}).ok,false);
  assert.equal(validateScore({...score,stages:[{...score.stages[0],stageId:'smf-somewhere'}]}).ok,false);
  const other=rushStageId==='smf-pagoda'?'smf-fractal':'smf-pagoda';
  assert.equal(validateScore(score,{...run,rushStageId:other,elapsedMs:120000}).code,'invalid_ticket');
 }
 const pagoda=makeScore('smf-pagoda',60000);
 assert.equal(validateScore(pagoda,{...run,elapsedMs:60000}).ok,true);
 assert.equal(validateScore(makeScore(),{...run,rushStageId:'smf-pagoda',elapsedMs:60000}).ok,true);
 for(const rushStageId of [null,0,['smf-pagoda'],'smf-somewhere'])assert.equal(validRun({...run,rushStageId}),false);
 for(const mode of ['festival','endless']){
  assert.equal(validRun({...run,mode,rushStageId:'smf-pagoda'}),false);
  assert.equal(validateScore({...pagoda,mode}).ok,false);
 }
});

test('explicit Rush board rows require the requested venue and legacy rows stay untagged',()=>{
 const row={editionId:'smf',initials:'ABC',score:10,stagesCleared:1,inputType:'touch',mode:'rush',scoringVersion:'smf-v1',receivedAt:'2026-11-13T00:00:00Z'};
 assert.equal(validBoard([row],'rush','smf-v1'),true);
 assert.equal(validBoard([{...row,rushStageId:'smf-amp'}],'rush','smf-v1','smf-amp'),true);
 assert.equal(validBoard([row],'rush','smf-v1','smf-amp'),false);
 assert.equal(validBoard([{...row,rushStageId:'smf-fractal'}],'rush','smf-v1','smf-amp'),false);
 assert.equal(validBoard([{...row,rushStageId:'smf-pagoda'}],'rush','smf-v1'),false);
 assert.equal(validBoard([],'rush','smf-v1','smf-somewhere'),false);
 assert.equal(validBoard([],'festival','smf-v1','smf-pagoda'),false);
});

test('SMF handlers pass explicit venues to the corresponding RPC and retain legacy call shapes',async()=>{
 for(const [kind,base,name] of [['run-ticket',run,'smf_ticket'],['submit-score',makeScore(),'smf_submit'],['leaderboard',{editionId:'smf',mode:'rush',scoringVersion:'smf-v1'},'smf_board']]){
  const seen=[];
  const handler=createSmfArcadeHandler({kind,origins:['https://example.test'],secret:'test-only',rpc:async(rpcName,args)=>{seen.push([rpcName,args]);return kind==='leaderboard'?[]:{accepted:true};}});
  assert.equal((await handler(request(base))).status,200);
  assert.equal(seen[0][0],name);assert.equal(Object.hasOwn(seen[0][1],'p_rush_stage_id'),false);
  const explicit=kind==='submit-score'?makeScore('smf-fractal',64000):{...base,rushStageId:'smf-fractal'};
  assert.equal((await handler(request(explicit))).status,200);
  assert.equal(seen[1][1].p_rush_stage_id,'smf-fractal');
  const before=seen.length;
  for(const bad of [{...explicit,rushStageId:'smf-somewhere'},{...explicit,rushStageId:null},{...explicit,mode:'festival'},{...explicit,mode:'endless'}])assert.equal((await handler(request(bad))).status,400);
  assert.equal(seen.length,before);
 }
});

test('optional Rush telemetry preserves venue identity and movement choice without accepting mismatched stages',()=>{
 const common={...run,eventId:run.runId,guestId:run.runId};delete common.runId;
 const stage={...common,type:'stage',stageIndex:0,stageId:'smf-pagoda',pickups:1,closePasses:0,bassUses:0};
 const summary={...common,type:'run',outcome:'complete',stagesCleared:1,totalScore:10};
 assert.equal(validSmfEvents([stage,summary]),true);
 for(const [rushStageId] of venues){
  const selected={...stage,stageId:rushStageId,rushStageId,movementMode:'swipe'};
  assert.equal(validSmfEvents([selected,{...summary,rushStageId,movementMode:'stick'}]),true);
  assert.equal(validSmfEvents([{...selected,stageId:'smf-somewhere'}]),false);
  assert.equal(validSmfEvents([{...selected,stageIndex:1}]),false);
 }
 assert.equal(validSmfEvents([{...stage,stageId:'smf-amp'}]),false);
 for(const event of [stage,summary]){
  assert.equal(validSmfEvents([{...event,rushStageId:'smf-somewhere'}]),false);
  assert.equal(validSmfEvents([{...event,rushStageId:'smf-amp',mode:'festival'}]),false);
  assert.equal(validSmfEvents([{...event,rushStageId:'smf-amp',movementMode:'mouse'}]),false);
 }
});
