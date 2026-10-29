import test from 'node:test';import assert from 'node:assert/strict';import {createArcadeHandler} from '../supabase/functions/_shared/arcade.js';
const run={runId:'00000000-0000-4000-8000-000000000001',mode:'rush',scoringVersion:'arcade-v1',buildId:'test'};
test('ticket HTTP generates opaque capabilities and stores only hashes; rejects unsafe requests',async()=>{
 let calls=0;let args;const handler=createArcadeHandler({kind:'run-ticket',origins:['http://localhost'],secret:'test',rpc:async(_,p)=>{calls++;args=p;return {expiresAt:new Date(Date.now()+86400000).toISOString()}}});
 const request=(payload,origin='http://localhost')=>new Request('http://server',{method:'POST',headers:{origin,'content-type':'application/json'},body:JSON.stringify(payload)});
 assert.equal((await handler(request(run,'http://evil'))).status,403);assert.equal((await handler(request({...run,installationId:'x'}))).status,400);assert.equal(calls,0);
 const r=await handler(request(run)),body=await r.json();assert.equal(r.status,200);assert.match(body.ticket,/^[a-f0-9]{64}$/);assert.notEqual(args.p_hash,body.ticket);assert.ok(!JSON.stringify(args).includes(body.ticket));
 assert.equal((await handler(request('x'.repeat(33000)))).status,413);
});

test('Endless tickets and boards are accepted and submit bodies can exceed32KiB within1MiB',async()=>{
 const {endlessFixture}=await import('./helpers/score-fixtures.mjs');
 const {createOnlineClient}=await import('../src/online/client.js');
 const p=await endlessFixture();const failed=p.stages.at(-1);p.stages=p.stages.slice(0,-1);
 while(p.stages.length<200){const s=structuredClone(p.stages[7]);s.stageIndex=p.stages.length;s.pickups=45;s.sparks=Array(20).fill(0);s.sparks[0]=45;s.score=450;p.stages.push(s);}
 failed.stageIndex=200;p.stages.push(failed);p.stagesCleared=200;p.totalScore=p.stages.reduce((sum,s)=>sum+s.score,0);
 let boardRows=[];
 const handlers=Object.fromEntries(['run-ticket','submit-score','leaderboard'].map(kind=>[kind,createArcadeHandler({kind,origins:['http://localhost'],secret:'test',rpc:async(name,args)=>{
  if(name==='arcade_ticket')return {expiresAt:new Date(Date.now()+86400000).toISOString()};
  if(name==='arcade_submit'){boardRows=[{initials:args.p_record.initials,score:args.p_record.totalScore,stagesCleared:args.p_record.stagesCleared,inputType:args.p_record.inputType,mode:'endless',scoringVersion:'arcade-v1',receivedAt:new Date().toISOString()}];return {accepted:true};}
  return boardRows;
 }})]));
 const fetch=async(url,init)=>handlers[url.split('/').at(-1)](new Request(url,{...init,headers:{...init.headers,origin:'http://localhost'}}));
 const client=createOnlineClient({baseUrl:'http://server',fetch});
 const ticket=await client.startRun({runId:p.runId,mode:'endless',scoringVersion:p.scoringVersion,buildId:p.buildId});assert.equal(ticket.ok,true);
 p.ticket=ticket.data.ticket;assert.ok(JSON.stringify(p).length>32768);
 assert.equal((await client.submitScore(p)).ok,true);
 const board=await client.getBoard({mode:'endless',scoringVersion:'arcade-v1'});assert.equal(board.ok,true);assert.equal(board.data[0].stagesCleared,200);
 const tooBig=new Request('http://server',{method:'POST',headers:{origin:'http://localhost','content-type':'application/json'},body:JSON.stringify('x'.repeat(1048576))});
 assert.equal((await handlers['submit-score'](tooBig)).status,413);
});
