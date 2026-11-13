import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {PGlite} from '@electric-sql/pglite';
import {createSmfTelemetry} from '../src/smf-tour/telemetry.js';
import {validSmfEvents,createSmfPlaytestHandler} from '../supabase/functions/_shared/smf-playtest.js';

const id='123e4567-e89b-42d3-a456-426614174000';
const common={editionId:'smf',scoringVersion:'smf-v1',eventId:id,guestId:id,buildId:'controls-test',mode:'rush'};
const run={type:'run',outcome:'complete',stagesCleared:1,totalScore:50};
const stage={type:'stage',stageIndex:0,stageId:'smf-pagoda',pickups:3,closePasses:1,bassUses:0};
const perk={type:'perk',stageIndex:0,action:'take',perk:'boots',replaced:null};

test('SMF run and stage events accept only the three optional movement selections; old events remain valid',()=>{
 for(const event of [run,stage]){
  assert.equal(validSmfEvents([{...common,...event}]),true);
  for(const movementMode of ['tap','swipe','stick'])assert.equal(validSmfEvents([{...common,...event,movementMode}]),true);
  for(const movementMode of ['keyboard','touch','unknown','thumbstick','',null,undefined,0,['tap'],{}])assert.equal(validSmfEvents([{...common,...event,movementMode}]),false);
  assert.equal(validSmfEvents([{...common,...event,movementMode:'tap',pointerPath:[1,2]}]),false);
 }
 assert.equal(validSmfEvents([{...common,...perk}]),true);
 assert.equal(validSmfEvents([{...common,...perk,movementMode:'tap'}]),false);
});

test('movement style is snapshotted at record time, independently at stage and run completion',async()=>{
 let selection='swipe';const sent=[];
 const telemetry=createSmfTelemetry({config:{enabled:true},consent:()=>true,uuid:()=>id,getMovementMode:()=>selection,send:async batch=>{sent.push(...batch);return true;}});
 assert.equal(telemetry.record({mode:'rush',...stage}),true);
 selection='stick';assert.equal(telemetry.record({mode:'rush',...run}),true);
 selection='tap';await telemetry.flush();
 assert.deepEqual(sent.map(e=>e.movementMode),['swipe','stick']);
 assert.equal(sent.every(e=>!Object.hasOwn(e,'inputType')&&!Object.hasOwn(e,'switches')),true);
});

test('selection is never read or sent before opt-in or when telemetry is unavailable',async()=>{
 let consent=false,reads=0,sends=0;
 const config={enabled:true};
 const telemetry=createSmfTelemetry({config,consent:()=>consent,uuid:()=>id,getMovementMode:()=>{reads++;return 'tap';},send:async()=>{sends++;return true;}});
 assert.equal(telemetry.record({mode:'rush',...run}),false);await telemetry.flush();assert.equal(reads,0);assert.equal(sends,0);
 consent=true;config.enabled=false;assert.equal(telemetry.record({mode:'rush',...run}),false);assert.equal(reads,0);
 config.enabled=true;assert.equal(telemetry.record({mode:'rush',...run}),true);assert.equal(reads,1);
 consent=false;telemetry.stop();await telemetry.flush();assert.equal(telemetry.size(),0);assert.equal(sends,0);
});

test('omitted getter keeps legacy events, explicit valid selection wins, and perk events stay unchanged',async()=>{
 const sent=[];
 const legacy=createSmfTelemetry({config:{enabled:true},consent:()=>true,uuid:()=>id,send:async batch=>{sent.push(...batch);return true;}});
 assert.equal(legacy.record({mode:'rush',...run}),true);await legacy.flush();assert.equal(Object.hasOwn(sent[0],'movementMode'),false);
 let reads=0;
 const telemetry=createSmfTelemetry({config:{enabled:true},consent:()=>true,uuid:()=>id,getMovementMode:()=>{reads++;return 'swipe';},send:async batch=>{sent.push(...batch);return true;}});
 assert.equal(telemetry.record({mode:'rush',...stage,movementMode:'stick'}),true);
 assert.equal(telemetry.record({mode:'festival',...perk}),true);await telemetry.flush();
 assert.equal(sent[1].movementMode,'stick');assert.equal(Object.hasOwn(sent[2],'movementMode'),false);assert.equal(reads,0);
 assert.equal(telemetry.record({mode:'rush',...run,movementMode:'keyboard'}),false);
});

test('SMF ingest preserves the selection in existing private JSON storage without changing legacy rows',async()=>{
 const db=new PGlite();
 try{
  await db.exec("create role anon;create role authenticated;create role service_role;create schema cron;create function cron.schedule(text,text,text) returns bigint language sql as 'select 1::bigint';");
  await db.exec(await readFile(new URL('../supabase/migrations/202611100001_smf_services.sql',import.meta.url),'utf8'));
  const events=[{...common,...stage,movementMode:'stick'},{...common,...run,eventId:'123e4567-e89b-42d3-a456-426614174001'}];
  const handler=createSmfPlaytestHandler({origins:['https://example.test'],secret:'test-only',rpc:async(name,args)=>{
   assert.equal(name,'smf_ingest');
   return (await db.query('select public.smf_ingest($1,$2) as result',[args.p_events,args.p_bucket])).rows[0].result;
  }});
  const response=await handler(new Request('https://example.test/smf-playtest',{method:'POST',headers:{origin:'https://example.test','content-type':'application/json'},body:JSON.stringify(events)}));
  assert.equal(response.status,200);assert.deepEqual((await response.json()).accepted,events.map(e=>e.eventId));
  const rows=await db.query('select event from smf_private.events order by id');assert.deepEqual(rows.rows.map(r=>r.event),events);
 }finally{await db.close();}
});
