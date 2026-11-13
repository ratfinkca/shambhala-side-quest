import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {PGlite} from '@electric-sql/pglite';
import {createSmfArcadeHandler} from '../supabase/functions/_shared/smf-arcade.js';

const bucket='b'.repeat(64),version='smf-v1',build='rush-test';
const venues=[['smf-living-room',68571],['smf-fractal',64000],['smf-grove',58182],['smf-amp',54857],['smf-pagoda',60000],['smf-village',66977]];
const runId=n=>`123e4567-e89b-42d3-a456-426614174${String(n).padStart(3,'0')}`;
const hash=n=>n.toString(16).padStart(64,'0');
const record=(n,rushStageId,durationMs=60000)=>({editionId:'smf',runId:runId(n),mode:'rush',scoringVersion:version,buildId:build,...(rushStageId?{rushStageId}:{}),initials:'ABC',inputType:'touch',totalScore:n*10,stagesCleared:1,stages:[{stageIndex:0,stageId:rushStageId??'smf-pagoda',activeMs:durationMs,pickups:n,closePasses:0,score:n*10,perks:[],sparks:[n,...Array(19).fill(0)],passes:[0,0]}]});
const baseMigration=new URL('../supabase/migrations/202611100001_smf_services.sql',import.meta.url);
const venueMigration=new URL('../supabase/migrations/202611130001_smf_rush_venues.sql',import.meta.url);
async function startDatabase(){
 const db=new PGlite();
 await db.exec("create role anon;create role authenticated;create role service_role;create schema cron;create function cron.schedule(text,text,text) returns bigint language sql as 'select 1::bigint';");
 await db.exec(await readFile(baseMigration,'utf8'));
 return db;
}
async function migrateVenues(db){
 await db.exec(await readFile(venueMigration,'utf8'));
 const columns=await db.query("select table_name from information_schema.columns where table_schema='smf_private' and column_name='rush_stage_id' order by table_name");
 assert.deepEqual(columns.rows.map(row=>row.table_name),['scores','tickets']);
}
async function rpc(db,name,args){
 const entries=Object.entries(args);
 return (await db.query(`select public.${name}(${entries.map(([key],i)=>`${key} => $${i+1}`).join(',')}) as result`,entries.map(([,value])=>value))).rows[0].result;
}
const ticketArgs=(n,mode='rush')=>({p_hash:hash(n),p_run:runId(n),p_mode:mode,p_version:version,p_build:build,p_bucket:bucket});
const submitArgs=(n,p_record=record(n))=>({p_hash:hash(n),p_digest:hash(1000+n),p_record,p_bucket:bucket});
const ageTickets=db=>db.exec("update smf_private.tickets set issued_at=now()-interval '3 minutes'");

test('venue migration backfills Pagoda without altering legacy receipts and old RPCs still work',async()=>{
 const db=await startDatabase();
 try{
  await rpc(db,'smf_ticket',ticketArgs(1));await ageTickets(db);
  assert.equal((await rpc(db,'smf_submit',submitArgs(1))).accepted,true);
  await rpc(db,'smf_ticket',ticketArgs(2,'endless'));
  await migrateVenues(db);
  const tickets=await db.query('select run_id,rush_stage_id from smf_private.tickets order by run_id');
  assert.deepEqual(tickets.rows.map(row=>row.rush_stage_id),['smf-pagoda',null]);
  const existing=await db.query('select rush_stage_id,record from smf_private.scores');
  assert.equal(existing.rows[0].rush_stage_id,'smf-pagoda');assert.deepEqual(existing.rows[0].record,record(1));
  assert.equal((await rpc(db,'smf_submit',submitArgs(1))).accepted,true);
  assert.equal((await rpc(db,'smf_submit',{...submitArgs(1),p_digest:hash(777)})).code,'conflict');
  await rpc(db,'smf_ticket',ticketArgs(3));await ageTickets(db);
  assert.equal((await rpc(db,'smf_submit',submitArgs(3))).accepted,true);
  const legacy=await rpc(db,'smf_board',{p_mode:'rush',p_version:version});
  assert.deepEqual(legacy.map(row=>row.score),[30,10]);assert.equal(legacy.every(row=>!Object.hasOwn(row,'rushStageId')),true);
  const explicit=await rpc(db,'smf_board',{p_mode:'rush',p_version:version,p_rush_stage_id:'smf-pagoda'});
  assert.deepEqual(explicit.map(row=>row.rushStageId),['smf-pagoda','smf-pagoda']);
 }finally{await db.close();}
});

test('Festival and Endless keep their legacy submissions and ranking after the venue upgrade',async()=>{
 const db=await startDatabase();
 try{
  await migrateVenues(db);
  for(const [n,mode,initials,totalScore,stagesCleared] of [[50,'endless','LOW',1000,2],[51,'endless','HIH',10,3],[52,'festival','LOW',1000,2],[53,'festival','HIH',10,3]]){
   await rpc(db,'smf_ticket',ticketArgs(n,mode));await ageTickets(db);
   const p_record={...record(n),mode,initials,totalScore,stagesCleared};
   assert.equal((await rpc(db,'smf_submit',{...submitArgs(n,p_record),p_rush_stage_id:'smf-pagoda'})).code,'invalid_ticket');
   assert.equal((await rpc(db,'smf_submit',submitArgs(n,{...p_record,rushStageId:'smf-pagoda'}))).code,'invalid_ticket');
   assert.equal((await rpc(db,'smf_submit',submitArgs(n,p_record))).accepted,true);
  }
  for(const [mode,winner] of [['endless','HIH'],['festival','LOW']]){
   const board=await rpc(db,'smf_board',{p_mode:mode,p_version:version});
   assert.equal(board[0].initials,winner);assert.equal(board.every(row=>!Object.hasOwn(row,'rushStageId')),true);
  }
  const rows=await db.query('select rush_stage_id from smf_private.scores');assert.equal(rows.rows.every(row=>row.rush_stage_id===null),true);
 }finally{await db.close();}
});

test('all six Rush boards stay isolated and database ticket checks reject venue and clock tampering',async()=>{
 const db=await startDatabase();
 try{
  await migrateVenues(db);
  for(const [index,[rushStageId,durationMs]] of venues.entries()){
   const n=index+10,p_record=record(n,rushStageId,durationMs);
   assert.ok((await rpc(db,'smf_ticket',{...ticketArgs(n),p_rush_stage_id:rushStageId})).expiresAt);
   await ageTickets(db);
   const other=rushStageId==='smf-pagoda'?'smf-fractal':'smf-pagoda';
   const args={...submitArgs(n,p_record),p_rush_stage_id:rushStageId};
   assert.equal((await rpc(db,'smf_submit',{...args,p_rush_stage_id:other})).code,'invalid_ticket');
   assert.equal((await rpc(db,'smf_submit',{...args,p_record:{...p_record,rushStageId:other}})).code,'invalid_ticket');
   assert.equal((await rpc(db,'smf_submit',{...args,p_record:{...p_record,stages:[{...p_record.stages[0],stageId:other}]}})).code,'invalid_ticket');
   assert.equal((await rpc(db,'smf_submit',{...args,p_record:{...p_record,stages:[{...p_record.stages[0],activeMs:durationMs+1}]}})).code,'invalid_ticket');
   if(rushStageId!=='smf-pagoda')assert.equal((await rpc(db,'smf_submit',submitArgs(n))).code,'invalid_ticket');
   assert.equal((await rpc(db,'smf_submit',args)).accepted,true);
   assert.equal((await rpc(db,'smf_submit',args)).accepted,true);
   assert.equal((await rpc(db,'smf_submit',{...args,p_rush_stage_id:other})).code,'invalid_ticket');
  }
  for(const [index,[rushStageId]] of venues.entries()){
   const rows=await rpc(db,'smf_board',{p_mode:'rush',p_version:version,p_rush_stage_id:rushStageId});
   assert.deepEqual(rows.map(row=>[row.score,row.rushStageId]),[[(index+10)*10,rushStageId]]);
  }
  assert.deepEqual((await rpc(db,'smf_board',{p_mode:'rush',p_version:version})).map(row=>row.score),[140]);
  for(const mode of ['festival','endless'])assert.equal((await rpc(db,'smf_ticket',{...ticketArgs(30,mode),p_rush_stage_id:'smf-amp'})).code,'invalid');
  assert.equal((await rpc(db,'smf_ticket',{...ticketArgs(30),p_rush_stage_id:'smf-somewhere'})).code,'invalid');
  assert.deepEqual(await rpc(db,'smf_board',{p_mode:'rush',p_version:version,p_rush_stage_id:'smf-somewhere'}),[]);
  assert.deepEqual(await rpc(db,'smf_board',{p_mode:'endless',p_version:version,p_rush_stage_id:'smf-amp'}),[]);
 }finally{await db.close();}
});

test('venue RPC overloads retain private access, RLS, expiry and retention',async()=>{
 const db=await startDatabase();
 try{
  await migrateVenues(db);
  const signatures=['smf_ticket(text,uuid,text,text,text,text)','smf_ticket(text,uuid,text,text,text,text,text)','smf_submit(text,text,jsonb,text)','smf_submit(text,text,jsonb,text,text)','smf_board(text,text)','smf_board(text,text,text)'];
  for(const role of ['anon','authenticated','service_role'])for(const signature of signatures){
   const result=await db.query('select has_function_privilege($1,$2,\'EXECUTE\') as allowed',[role,`public.${signature}`]);
   assert.equal(result.rows[0].allowed,role==='service_role',`${role}: ${signature}`);
  }
  const rls=await db.query("select relname,relrowsecurity from pg_class where oid in ('smf_private.tickets'::regclass,'smf_private.scores'::regclass,'smf_private.events'::regclass,'smf_private.limits'::regclass)");
  assert.equal(rls.rows.length,4);assert.equal(rls.rows.every(row=>row.relrowsecurity),true);
  await db.exec('set role anon');
  await assert.rejects(()=>rpc(db,'smf_board',{p_mode:'rush',p_version:version,p_rush_stage_id:'smf-amp'}),/permission denied/);
  await assert.rejects(()=>db.query('select * from smf_private.tickets'),/permission denied/);
  await db.exec('reset role');
  await rpc(db,'smf_ticket',{...ticketArgs(40),p_rush_stage_id:'smf-amp'});
  await db.exec("update smf_private.tickets set expires_at=now()-interval '1 minute'");
  assert.equal((await rpc(db,'smf_submit',{...submitArgs(40,record(40,'smf-amp',54857)),p_rush_stage_id:'smf-amp'})).code,'expired');
  await db.exec('select public.maintain_smf()');assert.equal((await db.query('select count(*)::integer as n from smf_private.tickets')).rows[0].n,0);
 }finally{await db.close();}
});

test('HTTP tickets and score receipts reach the selected database board while legacy clients stay Pagoda',async()=>{
 const db=await startDatabase();
 try{
  await migrateVenues(db);
  const handler=kind=>createSmfArcadeHandler({kind,origins:['https://example.test'],secret:'test-only',rpc:(name,args)=>rpc(db,name,args)});
  const send=(kind,payload)=>handler(kind)(new Request('https://example.test',{method:'POST',headers:{origin:'https://example.test','content-type':'application/json'},body:JSON.stringify(payload)}));
  for(const [n,rushStageId,durationMs] of [[1,'smf-grove',58182],[2,undefined,60000]]){
   const score=record(n,rushStageId,durationMs),run={editionId:'smf',runId:score.runId,mode:'rush',scoringVersion:version,buildId:build,...(rushStageId?{rushStageId}:{})};
   const issued=await send('run-ticket',run);assert.equal(issued.status,200);const {ticket}=await issued.json();await ageTickets(db);
   const posted=await send('submit-score',{...score,ticket});assert.equal(posted.status,200);assert.equal((await posted.json()).accepted,true);
  }
  const base={editionId:'smf',mode:'rush',scoringVersion:version};
  const grove=await send('leaderboard',{...base,rushStageId:'smf-grove'});assert.equal(grove.status,200);assert.deepEqual((await grove.json()).map(row=>[row.score,row.rushStageId]),[[10,'smf-grove']]);
  const legacy=await send('leaderboard',base);assert.equal(legacy.status,200);const rows=await legacy.json();assert.deepEqual(rows.map(row=>row.score),[20]);assert.equal(Object.hasOwn(rows[0],'rushStageId'),false);
 }finally{await db.close();}
});
