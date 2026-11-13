import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {PGlite} from '@electric-sql/pglite';
import {createArcadeHandler} from '../supabase/functions/_shared/arcade.js';
import {createSmfArcadeHandler} from '../supabase/functions/_shared/smf-arcade.js';

const bucket='b'.repeat(64),build='seasons-test';
const runId=n=>`00000000-0000-4000-8000-${String(n).padStart(12,'0')}`;
const hash=n=>n.toString(16).padStart(64,'0');
const initialMigrations=['202610220001_scores.sql','202610290001_endless_scores.sql','202611100001_smf_services.sql','202611130001_smf_rush_venues.sql'];
const seasonMigration='202611130002_scoring_seasons.sql';
async function migrate(db,name){await db.exec(await readFile(new URL(`../supabase/migrations/${name}`,import.meta.url),'utf8'));}
async function database(){
 const db=new PGlite();
 await db.exec("create role anon;create role authenticated;create role service_role;create schema cron;create function cron.schedule(text,text,text) returns bigint language sql as 'select 1::bigint';");
 for(const migration of initialMigrations)await migrate(db,migration);
 return db;
}
async function rpc(db,name,args){
 const entries=Object.entries(args);
 return (await db.query(`select public.${name}(${entries.map(([key],index)=>`${key} => $${index+1}`).join(',')}) as result`,entries.map(([,value])=>value))).rows[0].result;
}
function record(edition,n,version,mode='rush',rushStageId){
 const smf=edition==='smf',stageId=mode==='rush'?rushStageId??'smf-pagoda':'smf-living-room';
 const activeMs=smf?(stageId==='smf-living-room'?68571:stageId==='smf-amp'?54857:60000):60000;
 return {...(smf?{editionId:'smf'}:{}),runId:runId(n),mode,scoringVersion:version,buildId:build,
  ...(rushStageId?{rushStageId}:{}),initials:version.endsWith('v1')?'OLD':'NEW',inputType:'touch',totalScore:n*15,stagesCleared:mode==='rush'?1:0,
  stages:[{stageIndex:0,...(smf?{stageId}:{}),activeMs,pickups:0,closePasses:n,score:n*15,perks:[],sparks:Array(20).fill(0),passes:[n,0]}]};
}
const prefix=edition=>edition==='smf'?'smf':'arcade';
function ticketArgs(n,p){return {p_hash:hash(n),p_run:p.runId,p_mode:p.mode,p_version:p.scoringVersion,p_build:p.buildId,p_bucket:bucket,...(p.rushStageId?{p_rush_stage_id:p.rushStageId}:{})};}
function submitArgs(n,p){return {p_hash:hash(n),p_digest:hash(1000+n),p_record:p,p_bucket:bucket,...(p.rushStageId?{p_rush_stage_id:p.rushStageId}:{})};}
async function age(db){await db.exec("update arcade_private.tickets set issued_at=now()-interval '3 minutes';update smf_private.tickets set issued_at=now()-interval '3 minutes';");}
const boardArgs=p=>({p_mode:p.mode,p_version:p.scoringVersion,...(p.rushStageId?{p_rush_stage_id:p.rushStageId}:{})});

test('season migration preserves v1 records, open tickets and expired accepted receipts unchanged',async()=>{
 const db=await database();
 try{
  const accepted=[],pending=[],before={};
  for(const [edition,version,offset] of [['generic','arcade-v1',0],['smf','smf-v1',10]]){
   const name=prefix(edition),n=offset+1,p=record(edition,n,version);
   assert.ok((await rpc(db,`${name}_ticket`,ticketArgs(n,p))).expiresAt);
   await age(db);assert.equal((await rpc(db,`${name}_submit`,submitArgs(n,p))).accepted,true);
   const later=record(edition,n+1,version);
   assert.ok((await rpc(db,`${name}_ticket`,ticketArgs(n+1,later))).expiresAt);
   await db.query(`update ${name}_private.tickets set expires_at=now()-interval '1 hour' where hash=$1`,[hash(n)]);
   accepted.push([name,n,p]);pending.push([name,n+1,later]);
  }
  for(const name of ['arcade','smf']){
   before[name]={
    tickets:(await db.query(`select * from ${name}_private.tickets order by hash`)).rows,
    scores:(await db.query(`select * from ${name}_private.scores order by id`)).rows,
   };
  }
  await migrate(db,seasonMigration);
  for(const name of ['arcade','smf']){
   assert.deepEqual((await db.query(`select * from ${name}_private.tickets order by hash`)).rows,before[name].tickets);
   assert.deepEqual((await db.query(`select * from ${name}_private.scores order by id`)).rows,before[name].scores);
  }
  for(const [name,n,p] of accepted){
   assert.equal((await rpc(db,`${name}_submit`,submitArgs(n,p))).accepted,true);
   assert.equal((await rpc(db,`${name}_submit`,{...submitArgs(n,p),p_digest:hash(9000+n)})).code,'conflict');
   const rows=await rpc(db,`${name}_board`,boardArgs(p));
   assert.equal(rows.length,1);assert.equal(rows[0].scoringVersion,p.scoringVersion);assert.equal(rows[0].score,p.totalScore);
  }
  await age(db);
  for(const [name,n,p] of pending)assert.equal((await rpc(db,`${name}_submit`,submitArgs(n,p))).accepted,true);
  for(const name of ['arcade','smf'])assert.equal((await db.query(`select count(*)::integer as n from ${name}_private.scores`)).rows[0].n,2);
 }finally{await db.close();}
});

test('legacy and current HTTP tickets, score posts and boards work for all modes without crossing seasons or Rush venues',async()=>{
 const db=await database();
 try{
  await migrate(db,seasonMigration);
  const handlers={};
  for(const edition of ['generic','smf']){
   const create=edition==='smf'?createSmfArcadeHandler:createArcadeHandler;
   handlers[edition]=Object.fromEntries(['run-ticket','submit-score','leaderboard'].map(kind=>[kind,create({kind,origins:['https://example.test'],secret:'test-only',rpc:(name,args)=>rpc(db,name,args)})]));
  }
  const send=(edition,kind,body)=>handlers[edition][kind](new Request('https://example.test',{method:'POST',headers:{origin:'https://example.test','content-type':'application/json'},body:JSON.stringify(body)}));
  const cases=[];let next=100;
  for(const edition of ['generic','smf'])for(const season of [1,2])for(const mode of ['rush','festival','endless'])cases.push([edition,record(edition,++next,`${edition==='smf'?'smf':'arcade'}-v${season}`,mode)]);
  for(const season of [1,2])cases.push(['smf',record('smf',++next,`smf-v${season}`,'rush','smf-amp')]);
  for(const [edition,p] of cases){
   const start={...(edition==='smf'?{editionId:'smf'}:{}),runId:p.runId,mode:p.mode,scoringVersion:p.scoringVersion,buildId:p.buildId,...(p.rushStageId?{rushStageId:p.rushStageId}:{})};
   const issued=await send(edition,'run-ticket',start);assert.equal(issued.status,200,JSON.stringify(start));
   const ticket=(await issued.json()).ticket;assert.match(ticket,/^[a-f0-9]{64}$/);await age(db);
   const other=p.scoringVersion.endsWith('v1')?p.scoringVersion.replace('v1','v2'):p.scoringVersion.replace('v2','v1');
   const wrong=await send(edition,'submit-score',{...p,ticket,scoringVersion:other});
   assert.equal(wrong.status,400);assert.equal((await wrong.json()).code,'invalid_ticket');
   for(let retry=0;retry<2;retry++){
    const posted=await send(edition,'submit-score',{...p,ticket});assert.equal(posted.status,200);assert.equal((await posted.json()).accepted,true);
   }
  }
  for(const [edition,p] of cases){
   const request={...(edition==='smf'?{editionId:'smf'}:{}),mode:p.mode,scoringVersion:p.scoringVersion,...(p.rushStageId?{rushStageId:p.rushStageId}:{})};
   const response=await send(edition,'leaderboard',request);assert.equal(response.status,200);
   const rows=await response.json();assert.equal(rows.length,1,JSON.stringify(request));
   assert.equal(rows[0].score,p.totalScore);assert.equal(rows[0].scoringVersion,p.scoringVersion);
   assert.equal(Object.hasOwn(rows[0],'rushStageId'),!!p.rushStageId);
   if(p.rushStageId)assert.equal(rows[0].rushStageId,p.rushStageId);
  }
  // All original payload JSON is stored as sent, with no friendship or season fields added.
  for(const [edition,p] of cases){
   const rows=(await db.query(`select record from ${prefix(edition)}_private.scores where record->>'runId'=$1`,[p.runId])).rows;
   assert.deepEqual(rows.map(row=>row.record),[p]);
  }
 }finally{await db.close();}
});

test('season ticket allowlists reject unknown versions and preserve service-only signatures, RLS and expiry',async()=>{
 const db=await database();
 try{
  await migrate(db,seasonMigration);
  for(const [edition,good,bad] of [['generic','arcade-v2',['arcade-v0','arcade-v3','smf-v2']],['smf','smf-v2',['smf-v0','smf-v3','arcade-v2']]]){
   const name=prefix(edition);
   for(const [index,version] of bad.entries()){
    const p=record(edition,200+index,version);assert.equal((await rpc(db,`${name}_ticket`,ticketArgs(200+index,p))).code,'invalid');
   }
   const p=record(edition,210,good);assert.ok((await rpc(db,`${name}_ticket`,ticketArgs(210,p))).expiresAt);
   await db.exec(`update ${name}_private.tickets set expires_at=now()-interval '1 minute'`);
   assert.equal((await rpc(db,`${name}_submit`,submitArgs(210,p))).code,'expired');
   await db.exec(`select public.maintain_${name}()`);
   assert.equal((await db.query(`select count(*)::integer as n from ${name}_private.tickets`)).rows[0].n,0);
  }
  const signatures=['arcade_ticket(text,uuid,text,text,text,text)','arcade_submit(text,text,jsonb,text)','arcade_board(text,text)',
   'smf_ticket(text,uuid,text,text,text,text)','smf_ticket(text,uuid,text,text,text,text,text)','smf_submit(text,text,jsonb,text)','smf_submit(text,text,jsonb,text,text)','smf_board(text,text)','smf_board(text,text,text)'];
  for(const role of ['anon','authenticated','service_role'])for(const signature of signatures){
   const row=(await db.query("select has_function_privilege($1,$2,'EXECUTE') as allowed",[role,`public.${signature}`])).rows[0];
   assert.equal(row.allowed,role==='service_role',`${role} ${signature}`);
  }
  const tables=(await db.query("select c.relrowsecurity from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname in ('arcade_private','smf_private') and c.relkind='r'")).rows;
  assert.equal(tables.length,7);assert.equal(tables.every(row=>row.relrowsecurity),true);
  await db.exec('set role anon');
  await assert.rejects(()=>rpc(db,'arcade_board',{p_mode:'rush',p_version:'arcade-v2'}),/permission denied/);
  await assert.rejects(()=>rpc(db,'smf_board',{p_mode:'rush',p_version:'smf-v2',p_rush_stage_id:'smf-pagoda'}),/permission denied/);
  await assert.rejects(()=>db.query('select * from arcade_private.scores'),/permission denied/);
  await assert.rejects(()=>db.query('select * from smf_private.scores'),/permission denied/);
  await db.exec('reset role');
 }finally{await db.close();}
});
