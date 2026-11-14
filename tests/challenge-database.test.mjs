import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,readdir} from 'node:fs/promises';
import {PGlite} from '@electric-sql/pglite';
import {createArcadeHandler} from '../supabase/functions/_shared/arcade.js';
import {createSmfArcadeHandler} from '../supabase/functions/_shared/smf-arcade.js';

async function database({withChallenge=true}={}){
 const db=new PGlite();
 await db.exec("create role anon;create role authenticated;create role service_role;create schema cron;create function cron.schedule(text,text,text) returns bigint language sql as 'select 1::bigint';");
 const dir=new URL('../supabase/migrations/',import.meta.url);
 for(const name of (await readdir(dir)).sort().filter(name=>/scores|smf_services|smf_rush_venues|scoring_seasons|names_challenges/.test(name)&&(withChallenge||!name.includes('names_challenges'))))await db.exec(await readFile(new URL(name,dir),'utf8'));
 return db;
}
async function rpc(db,name,args){const entries=Object.entries(args);return (await db.query(`select public.${name}(${entries.map(([key],i)=>`${key} => $${i+1}`).join(',')}) result`,entries.map(([,v])=>v))).rows[0].result;}
function receipt(edition,n,version,challenge,mode='rush',venue){
 const smf=edition==='smf',v3=version.endsWith('v3'),stageId=mode==='rush'?venue??'smf-pagoda':'smf-living-room';
 return {...(smf?{editionId:'smf'}:{}),runId:`00000000-0000-4000-8000-${String(n).padStart(12,'0')}`,mode,scoringVersion:version,buildId:'test',...(venue?{rushStageId:venue}:{}),...(v3?{displayName:'Moss Dancer',challenge}:{initials:'OLD'}),inputType:'touch',totalScore:n*15,stagesCleared:mode==='rush'?1:0,
  stages:[{stageIndex:0,...(smf?{stageId}:{}),activeMs:smf&&stageId==='smf-living-room'?68571:60000,pickups:0,closePasses:n,score:n*15,perks:[],sparks:Array(20).fill(0),passes:[n,0]}]};
}
const start=p=>Object.fromEntries(['editionId','runId','mode','scoringVersion','buildId','challenge','rushStageId'].filter(k=>Object.hasOwn(p,k)).map(k=>[k,p[k]]));
const board=p=>Object.fromEntries(['editionId','mode','scoringVersion','challenge','rushStageId'].filter(k=>Object.hasOwn(p,k)).map(k=>[k,p[k]]));

test('HTTP and SQL isolate v3 names/challenges, retain old clients and bind challenges even on accepted retries',async()=>{
 const db=await database();try{
  const send=(edition,kind,p)=>{const create=edition==='smf'?createSmfArcadeHandler:createArcadeHandler;return create({kind,origins:['https://example.test'],secret:'test',rpc:(name,args)=>rpc(db,name,args)})(new Request('https://example.test',{method:'POST',headers:{origin:'https://example.test','content-type':'application/json'},body:JSON.stringify(p)}));};
  let n=0;const posted=[];
  for(const edition of ['generic','smf'])for(const mode of ['rush','festival','endless'])for(const version of [1,2,3])for(const challenge of version===3?['first-timer','been-around','seasoned-vet']:[null]){
   const p=receipt(edition,++n,`${edition==='smf'?'smf':'arcade'}-v${version}`,challenge,mode);
   const issued=await send(edition,'run-ticket',start(p));assert.equal(issued.status,200,JSON.stringify(p));p.ticket=(await issued.json()).ticket;
   await db.exec("update arcade_private.tickets set issued_at=now()-interval '3 minutes';update smf_private.tickets set issued_at=now()-interval '3 minutes';");
   if(version===3){
    const bad=await send(edition,'submit-score',{...p,displayName:'<bad>'});assert.equal(bad.status,400);assert.equal((await bad.json()).code,'invalid_name');
    const swapped=await send(edition,'submit-score',{...p,challenge:challenge==='first-timer'?'seasoned-vet':'first-timer'});assert.equal((await swapped.json()).code,'invalid_ticket');
   }
   for(let attempt=0;attempt<2;attempt++){const r=await send(edition,'submit-score',p);assert.equal(r.status,200);assert.equal((await r.json()).accepted,true);}
   if(version===3){const swapped=await send(edition,'submit-score',{...p,challenge:challenge==='first-timer'?'seasoned-vet':'first-timer'});assert.equal((await swapped.json()).code,'invalid_ticket');}
   posted.push([edition,p]);
  }
  for(const [edition,p] of posted){
   const response=await send(edition,'leaderboard',board(p));assert.equal(response.status,200);const rows=await response.json();assert.equal(rows.length,1);assert.equal(rows[0].score,p.totalScore);
   assert.equal(Object.hasOwn(rows[0],'rushStageId'),false);
   if(p.challenge){assert.equal(rows[0].displayName,'Moss Dancer');assert.equal(rows[0].challenge,p.challenge);assert.equal(Object.hasOwn(rows[0],'initials'),false);}
   else{assert.equal(rows[0].initials,'OLD');assert.equal(Object.hasOwn(rows[0],'challenge'),false);assert.equal(Object.hasOwn(rows[0],'displayName'),false);}
  }
  const venue=receipt('smf',++n,'smf-v3','first-timer','rush','smf-living-room');venue.ticket=(await (await send('smf','run-ticket',start(venue))).json()).ticket;
  await db.exec("update smf_private.tickets set issued_at=now()-interval '3 minutes'");assert.equal((await send('smf','submit-score',venue)).status,200);
  const rows=await (await send('smf','leaderboard',board(venue))).json();assert.equal(rows.length,1);assert.equal(rows[0].rushStageId,'smf-living-room');assert.equal(rows[0].score,venue.totalScore);
  for(const name of ['arcade','smf']){
   const values=(await db.query(`select initials,display_name,challenge from ${name}_private.scores where version=$1`,[`${name}-v3`])).rows;
   assert.ok(values.length);assert.equal(values.every(row=>row.initials===null&&row.display_name==='Moss Dancer'&&row.challenge),true);
   await db.exec(`update ${name}_private.scores set hidden=true where version='${name}-v3'`);
  }
  for(const [edition,p] of posted.filter(([,p])=>p.challenge))assert.deepEqual(await (await send(edition,'leaderboard',board(p))).json(),[]);
 }finally{await db.close();}
});

test('v3 database constraints and service-only permissions reject missing challenge, invalid identities and direct public access',async()=>{
 const db=await database();try{
  const bucket='b'.repeat(64),hash='a'.repeat(64),id='00000000-0000-4000-8000-000000000001';
  for(const name of ['arcade','smf']){
   const args={p_hash:hash,p_run:id,p_mode:'rush',p_version:`${name}-v3`,p_build:'test',p_bucket:bucket,...(name==='smf'?{p_rush_stage_id:'smf-pagoda'}:{})};
   assert.equal((await rpc(db,`${name}_ticket`,args)).code,'invalid');
   assert.equal((await rpc(db,`${name}_ticket`,{...args,p_challenge:'unknown'})).code,'invalid');
   assert.ok((await rpc(db,`${name}_ticket`,{...args,p_challenge:'first-timer'})).expiresAt);
   await assert.rejects(()=>db.query(`update ${name}_private.tickets set challenge=null where hash=$1`,[hash]),/check constraint/);
  }
  const signatures=['arcade_ticket(text,uuid,text,text,text,text,text)','arcade_board(text,text,text)','smf_ticket(text,uuid,text,text,text,text,text,text)','smf_board(text,text,text,text)'];
  for(const role of ['anon','authenticated','service_role'])for(const signature of signatures)assert.equal((await db.query("select has_function_privilege($1,$2,'EXECUTE') allowed",[role,`public.${signature}`])).rows[0].allowed,role==='service_role');
 }finally{await db.close();}
});

test('name migration preserves accepted legacy payloads and lets pre-migration tickets finish',async()=>{
 const db=await database({withChallenge:false});try{
  const bucket='b'.repeat(64),before=[],pending=[];let n=100;
  for(const name of ['arcade','smf'])for(const version of [1,2]){
   const edition=name==='smf'?'smf':'generic';
   for(const accepted of [true,false]){
    const p=receipt(edition,++n,`${name}-v${version}`,null),hash=n.toString(16).padStart(64,'0');
    await rpc(db,`${name}_ticket`,{p_hash:hash,p_run:p.runId,p_mode:p.mode,p_version:p.scoringVersion,p_build:p.buildId,p_bucket:bucket});
    await db.query(`update ${name}_private.tickets set issued_at=now()-interval '3 minutes' where hash=$1`,[hash]);
    const args={p_hash:hash,p_digest:`receipt-${n}`,p_record:p,p_bucket:bucket};
    if(accepted){assert.equal((await rpc(db,`${name}_submit`,args)).accepted,true);await db.query(`update ${name}_private.tickets set expires_at=now()-interval '1 minute' where hash=$1`,[hash]);before.push([name,args]);}
    else pending.push([name,args]);
   }
  }
  await db.exec(await readFile(new URL('../supabase/migrations/202611130003_names_challenges.sql',import.meta.url),'utf8'));
  for(const [name,args] of [...before,...pending]){
   assert.equal((await rpc(db,`${name}_submit`,args)).accepted,true);
   const row=(await db.query(`select initials,display_name,challenge,record from ${name}_private.scores where ticket_hash=$1`,[args.p_hash])).rows[0];
   assert.deepEqual(row,{initials:'OLD',display_name:null,challenge:null,record:args.p_record});
  }
 }finally{await db.close();}
});
