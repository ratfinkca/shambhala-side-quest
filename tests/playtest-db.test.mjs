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
