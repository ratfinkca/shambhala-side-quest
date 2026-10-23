import test from 'node:test';import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';import {PGlite} from '@electric-sql/pglite';
test('tickets enforce expiry, exact retry, conflicts, permissions, moderation and ranking',async()=>{
 const db=new PGlite();try{
 await db.exec('create role anon;create role authenticated;create role service_role;');await db.exec(await readFile(new URL('../supabase/migrations/202610220001_scores.sql',import.meta.url),'utf8'));
 const run='00000000-0000-4000-8000-000000000001',ticket='a'.repeat(64),bucket='b'.repeat(64);
 const issue=()=>db.query('select arcade_ticket($1,$2,$3,$4,$5,$6) as value',[ticket,run,'rush','arcade-v1','test',bucket]);await issue();
 const record={runId:run,mode:'rush',scoringVersion:'arcade-v1',buildId:'test',initials:'ABC',totalScore:10,stagesCleared:1,inputType:'touch',stages:[{}]};
 const submit=digest=>db.query('select arcade_submit($1,$2,$3,$4) as value',[ticket,digest,JSON.stringify(record),bucket]);
 assert.equal((await submit('c')).rows[0].value.code,'invalid_ticket');
 await db.exec("update arcade_private.tickets set issued_at=now()-interval '2 hours'");
 const outcomes=await Promise.all([submit('c'),submit('c')]);assert.ok(outcomes.every(r=>r.rows[0].value.accepted));
 assert.equal((await db.query('select count(*)::int n from arcade_private.scores')).rows[0].n,1);
 assert.equal((await submit('d')).rows[0].value.code,'conflict');
 await db.exec("update arcade_private.tickets set expires_at=now()-interval '1 hour'");assert.equal((await submit('c')).rows[0].value.accepted,true);
 const board=()=>db.query("select arcade_board('rush','arcade-v1') as value");const rows=(await board()).rows[0].value;assert.equal(rows.length,1);assert.equal(rows[0].initials,'ABC');assert.deepEqual(Object.keys(rows[0]).sort(),['initials','score','stagesCleared','inputType','mode','scoringVersion','receivedAt'].sort());
 await db.exec('update arcade_private.scores set hidden=true');assert.deepEqual((await board()).rows[0].value,[]);
 for(const role of ['anon','authenticated']){await db.exec(`set role ${role}`);await assert.rejects(board(),/permission denied/);await assert.rejects(db.query('select * from arcade_private.tickets'),/permission denied/);await assert.rejects(submit('c'),/permission denied/);await db.exec('reset role');}
 await db.exec('select maintain_arcade()');assert.equal((await db.query('select count(*)::int n from arcade_private.tickets')).rows[0].n,1);
 }finally{await db.close();}
});
test('unsubmitted tickets expire and ticket issuance rate is bounded',async()=>{
 const db=new PGlite();try{await db.exec('create role anon;create role authenticated;create role service_role;');await db.exec(await readFile(new URL('../supabase/migrations/202610220001_scores.sql',import.meta.url),'utf8'));
 for(let i=0;i<61;i++){const r=await db.query('select arcade_ticket($1,$2,$3,$4,$5,$6) as value',[i.toString(16).padStart(64,'0'),'00000000-0000-4000-8000-000000000001','rush','arcade-v1','test','b'.repeat(64)]);if(i===60)assert.equal(r.rows[0].value.code,'limited');}
 await db.exec("update arcade_private.tickets set expires_at=now()-interval '1 hour'");
 const r=await db.query('select arcade_submit($1,$2,$3,$4) as value',['0'.repeat(64),'digest','{}','b'.repeat(64)]);assert.equal(r.rows[0].value.code,'expired');
 await db.exec('select maintain_arcade()');assert.equal((await db.query('select count(*)::int n from arcade_private.tickets')).rows[0].n,0);
 }finally{await db.close();}
});
