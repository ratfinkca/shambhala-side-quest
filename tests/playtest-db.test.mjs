import test from 'node:test';import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';
import {PGlite} from '@electric-sql/pglite';
const id='00000000-0000-4000-8000-000000000001';
const event={schemaVersion:1,eventId:id,installationId:id,sessionId:id,runId:id,type:'run_start',mode:'rush',buildId:'dev',scoringVersion:'arcade-v1',theme:'forest-freakout',viewport:'small',inputType:'unknown',payload:{}};
test('private SQL rejects public access, deduplicates uploads, limits traffic and preserves retained aggregates',async()=>{
 const db=new PGlite();
 try{
  await db.exec('create role anon;create role authenticated;create role service_role;');
  await db.exec(await readFile(new URL('../supabase/migrations/202610200001_playtest.sql',import.meta.url),'utf8'));
  const ingest=()=>db.query('select public.ingest_playtest($1::jsonb,$2) as result',[JSON.stringify([event]),'a'.repeat(64)]);
  await ingest();await ingest();assert.equal((await db.query('select count(*)::int n from playtest_private.events')).rows[0].n,1);
  for(const role of ['anon','authenticated']){
   await db.exec(`set role ${role}`);
   await assert.rejects(db.query('select * from playtest_private.events'),/permission denied/);
   await assert.rejects(ingest(),/permission denied/);
   await assert.rejects(db.query('select public.maintain_playtest()'),/permission denied/);
   await db.exec('reset role');
  }
  for(let n=2;n<120;n++)await ingest();assert.equal((await ingest()).rows[0].result.limited,true);
  await db.exec("update playtest_private.events set received_at=now()-interval '31 days'; update playtest_private.rate_limits set window_start=now()-interval '25 hours';select public.maintain_playtest();");
  assert.equal((await db.query('select count(*)::int n from playtest_private.events')).rows[0].n,0);
  assert.equal((await db.query('select count(*)::int n from playtest_private.rate_limits')).rows[0].n,0);
  const before=(await db.query('select * from playtest_private.daily order by metric')).rows;
  assert.equal(before.find(x=>x.metric==='unknown_completions').value,1);
  await db.exec('select public.maintain_playtest();');assert.deepEqual((await db.query('select * from playtest_private.daily order by metric')).rows,before);
 }finally{await db.close();}
});
test('hourly cleanup schedule limits hashes to at most 25 hours',async()=>{
 const db=new PGlite();
 try{
  await db.exec('create role anon;create role authenticated;create role service_role;');
  await db.exec(await readFile(new URL('../supabase/migrations/202610200001_playtest.sql',import.meta.url),'utf8'));
  // Stub only the unavailable scheduler, then execute the actual scheduled SQL.
  await db.exec(`create schema cron;create table cron.job(jobname text,schedule text,command text);create function cron.schedule(text,text,text) returns bigint language sql as 'insert into cron.job values($1,$2,$3);select 1::bigint';`);
  const sql=await readFile(new URL('../supabase/migrations/202610200002_playtest_schedule.sql',import.meta.url),'utf8');
  await db.exec(sql.replace('create extension if not exists pg_cron;',''));
  const jobs=(await db.query("select * from cron.job where jobname='playtest-rate-cleanup'")).rows;
  assert.equal(jobs.length,1);assert.equal(jobs[0].schedule,'10 * * * *');
  await db.exec("insert into playtest_private.rate_limits values('old',now()-interval '25 hours',1),('recent',now()-interval '23 hours',1)");
  await db.exec(jobs[0].command);
  assert.deepEqual((await db.query('select bucket from playtest_private.rate_limits')).rows,[{bucket:'recent'}]);
 }finally{await db.close();}
});

test('Endless metrics separate banked/failed/exit/unknown and choices while retaining old aggregates and access',async()=>{
 const db=new PGlite();try{
 await db.exec('create role anon;create role authenticated;create role service_role;');
 await db.exec(await readFile(new URL('../supabase/migrations/202610200001_playtest.sql',import.meta.url),'utf8'));
 await db.exec("insert into playtest_private.daily values('2020-01-01','rush','touch','arcade-v1','run_samples',5)");
 await db.exec(await readFile(new URL('../supabase/migrations/202611030001_endless_playtest.sql',import.meta.url),'utf8'));
 let n=100;const uuid=()=>`00000000-0000-4000-8000-${String(n++).padStart(12,'0')}`;
 async function emit(run,type,payload,mode='endless'){const e={...event,eventId:uuid(),runId:run,mode,schemaVersion:mode==='endless'?2:1,type,inputType:'touch',payload};await db.query('select ingest_playtest($1,$2)',[JSON.stringify([e]),'c'.repeat(64)]);}
 for(const outcome of ['banked','failed','exit',null]){const run=uuid();await emit(run,'run_start',{});if(outcome)await emit(run,'run_end',{outcome,stagesCleared:outcome==='exit'?0:6,totalScore:100});}
 const run=uuid();for(const action of ['add','swap','keep'])await emit(run,'perk_choice',{stageIndex:3,action,perk:action==='keep'?null:'boots',replaced:action==='swap'?'moth':null,activePerks:['boots','noodle','bracelet','surfer']});
 const old=uuid();await emit(old,'run_start',{},'rush');await emit(old,'run_end',{outcome:'complete',stagesCleared:1,totalScore:10},'rush');
 const metrics=(await db.query("select metric,value from playtest_private.metrics where mode='endless'")).rows;
 const value=metric=>metrics.find(x=>x.metric===metric)?.value;
 assert.equal(value('run_samples'),4);for(const metric of ['banked_runs','failed_runs','explicit_exits','unknown_completions','perk_add','perk_swap','perk_keep'])assert.equal(value(metric),1,metric);
 assert.equal(value('completed_runs'),0);assert.equal(value('perk_boots'),2);
 assert.equal((await db.query("select value from playtest_private.metrics where mode='rush' and metric='completed_runs'")).rows[0].value,1);
 await db.exec('select maintain_playtest();');const before=(await db.query('select * from playtest_private.daily order by day,mode,metric')).rows;await db.exec('select maintain_playtest();');assert.deepEqual((await db.query('select * from playtest_private.daily order by day,mode,metric')).rows,before);
 assert.equal((await db.query("select value from playtest_private.daily where day='2020-01-01' and metric='run_samples'")).rows[0].value,5);
 await emit(run,'stage_end',{stageIndex:3,qualified:true,activeMs:60000,pickups:23,bassUses:0,variationId:'forest-creekside'});
 await emit(run,'stage_end',{stageIndex:3,qualified:true,activeMs:60000,pickups:23,bassUses:0});
 const layoutReport=await db.exec(await readFile(new URL('../supabase/reports/endless.sql',import.meta.url),'utf8'));
 assert.deepEqual(layoutReport[1].rows.map(r=>r.layout).sort(),['forest-creekside','legacy-unknown']);
 await db.exec("insert into playtest_private.daily values('2020-01-01','rush','touch','arcade-v1','stage_samples',7),('2020-01-01','rush','touch','arcade-v1','perk_boots',3)");
 const report=await db.exec(await readFile(new URL('../supabase/reports/playtest.sql',import.meta.url),'utf8'));
 const archived=report.at(-1).rows.filter(r=>r.mode==='rush'&&['stage_samples','perk_boots'].includes(r.metric));
 assert.equal(archived.length,2);assert.equal(archived.find(r=>r.metric==='stage_samples').value,7);assert.equal(archived.find(r=>r.metric==='perk_boots').value,3);
 for(const role of ['anon','authenticated']){await db.exec(`set role ${role}`);await assert.rejects(db.query('select * from playtest_private.metrics'),/permission denied/);await db.exec('reset role');}
 }finally{await db.close();}
});
