import test from 'node:test';import assert from 'node:assert/strict';import {createArcadeHandler} from '../supabase/functions/_shared/arcade.js';
const run={runId:'00000000-0000-4000-8000-000000000001',mode:'rush',scoringVersion:'arcade-v1',buildId:'test'};
test('ticket HTTP generates opaque capabilities and stores only hashes; rejects unsafe requests',async()=>{
 let calls=0;let args;const handler=createArcadeHandler({kind:'run-ticket',origins:['http://localhost'],secret:'test',rpc:async(_,p)=>{calls++;args=p;return {expiresAt:new Date(Date.now()+86400000).toISOString()}}});
 const request=(payload,origin='http://localhost')=>new Request('http://server',{method:'POST',headers:{origin,'content-type':'application/json'},body:JSON.stringify(payload)});
 assert.equal((await handler(request(run,'http://evil'))).status,403);assert.equal((await handler(request({...run,installationId:'x'}))).status,400);assert.equal(calls,0);
 const r=await handler(request(run)),body=await r.json();assert.equal(r.status,200);assert.match(body.ticket,/^[a-f0-9]{64}$/);assert.notEqual(args.p_hash,body.ticket);assert.ok(!JSON.stringify(args).includes(body.ticket));
 assert.equal((await handler(request('x'.repeat(33000)))).status,413);
});
