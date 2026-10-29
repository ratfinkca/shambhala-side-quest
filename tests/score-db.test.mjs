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

test('Endless migration preserves existing boards, allows tickets and ranks survival first with stable ties',async()=>{
 const db=new PGlite();try{
 await db.exec('create role anon;create role authenticated;create role service_role;');
 await db.exec(await readFile(new URL('../supabase/migrations/202610220001_scores.sql',import.meta.url),'utf8'));
 // Existing Rush data survives the additive migration.
 await db.exec(`insert into arcade_private.tickets(hash,run_id,mode,version,build) values(repeat('f',64),'00000000-0000-4000-8000-000000000001','rush','arcade-v1','test');
 insert into arcade_private.scores(ticket_hash,initials,score,stages_cleared,record,input_type,mode,version) values(repeat('f',64),'OLD',99,1,'{}','mouse','rush','arcade-v1');`);
 await db.exec(await readFile(new URL('../supabase/migrations/202610290001_endless_scores.sql',import.meta.url),'utf8'));
 for(const [i,initials,clears,score,age] of [[1,'LOW',4,9999,4],[2,'TOP',5,200,3],[3,'TIE',5,200,2],[4,'NEW',5,100,1],[5,'HID',99,99999,5]]){
  const hash=String(i).repeat(64),bucket='b'.repeat(64),run=`00000000-0000-4000-8000-${String(i).padStart(12,'0')}`;
  const ticket=await db.query("select arcade_ticket($1,$2,'endless','arcade-v1','test',$3) value",[hash,run,bucket]);assert.ok(ticket.rows[0].value.expiresAt);
  await db.query("update arcade_private.tickets set issued_at=now()-interval '2 hours' where hash=$1",[hash]);
  const record={runId:run,mode:'endless',scoringVersion:'arcade-v1',buildId:'test',initials,totalScore:score,stagesCleared:clears,inputType:'touch',stages:Array(clears+1).fill({})};
  const submit=()=>db.query('select arcade_submit($1,$2,$3,$4) value',[hash,'same',JSON.stringify(record),bucket]);
  assert.equal((await submit()).rows[0].value.accepted,true);assert.equal((await submit()).rows[0].value.accepted,true);
  await db.query("update arcade_private.scores set received_at=now()-$1*interval '1 minute',hidden=$2 where ticket_hash=$3",[age,initials==='HID',hash]);
 }
 const board=()=>db.query("select arcade_board('endless','arcade-v1') value");
 assert.deepEqual((await board()).rows[0].value.map(r=>r.initials),['TOP','TIE','NEW','LOW']);
 assert.equal((await db.query("select arcade_board('rush','arcade-v1') value")).rows[0].value[0].initials,'OLD');
 assert.deepEqual((await db.query("select arcade_board('endless','other') value")).rows[0].value,[]);
 for(const role of ['anon','authenticated']){await db.exec(`set role ${role}`);await assert.rejects(board(),/permission denied/);await assert.rejects(db.query('select * from arcade_private.scores'),/permission denied/);await db.exec('reset role');}
 await db.exec('set role service_role');assert.equal((await board()).rows[0].value.length,4);
 }finally{await db.close();}
});

test('banked Endless score posts through real handler and SQL with idempotent retry',async()=>{
 const {endlessFixture}=await import('./helpers/score-fixtures.mjs');const {createArcadeHandler}=await import('../supabase/functions/_shared/arcade.js');
 const db=new PGlite();try{
 await db.exec('create role anon;create role authenticated;create role service_role;');
 for(const migration of ['202610220001_scores.sql','202610290001_endless_scores.sql'])await db.exec(await readFile(new URL('../supabase/migrations/'+migration,import.meta.url),'utf8'));
 const p=await endlessFixture();p.stages.pop();p.totalScore=p.stages.reduce((n,s)=>n+s.score,0);
 const handler=createArcadeHandler({kind:'submit-score',origins:['http://localhost'],secret:'test',rpc:async(name,args)=>{
  const r=await db.query('select arcade_submit($1,$2,$3,$4) value',[args.p_hash,args.p_digest,JSON.stringify(args.p_record),args.p_bucket]);return r.rows[0].value;
 }});
 const hash=Buffer.from(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(p.ticket))).toString('hex');
 await db.query("select arcade_ticket($1,$2,'endless','arcade-v1','test',$3)",[hash,p.runId,'b'.repeat(64)]);
 await db.exec("update arcade_private.tickets set issued_at=now()-interval '8 minutes'");
 const request=()=>new Request('http://server',{method:'POST',headers:{origin:'http://localhost','content-type':'application/json'},body:JSON.stringify(p)});
 for(let i=0;i<2;i++){const r=await handler(request());assert.equal(r.status,200);assert.equal((await r.json()).accepted,true);}
 const board=(await db.query("select arcade_board('endless','arcade-v1') value")).rows[0].value;assert.equal(board.length,1);assert.equal(board[0].stagesCleared,8);assert.equal(board[0].score,p.totalScore);
 }finally{await db.close();}
});
