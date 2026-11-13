import test from 'node:test';
import assert from 'node:assert/strict';
import {createBoard} from '../src/online/board.js';
import {createSmfOnlineClient,smfRushFields} from '../src/smf-tour/online.js';

test('venue fields bind Rush tickets, scores and telemetry while preserving legacy Pagoda',()=>{
 assert.deepEqual(smfRushFields({mode:'rush',rushStageId:'smf-amp'}),{rushStageId:'smf-amp'});
 assert.deepEqual(smfRushFields({mode:'rush'}),{rushStageId:'smf-pagoda'});
 for(const mode of ['festival','endless'])assert.deepEqual(smfRushFields({mode,rushStageId:'smf-amp'}),{});
 assert.deepEqual(smfRushFields(null),{});
});

test('Rush board cache partitions venues and keeps legacy requests separate',async()=>{
 const requests=[];
 const board=createBoard(async request=>{requests.push(request);return {ok:true,data:[{venue:request.rushStageId||'legacy'}]};});
 await board.select('rush','smf-v1','smf-grove');
 await board.select('rush','smf-v1','smf-village');
 assert.deepEqual(requests.map(r=>r.rushStageId),['smf-grove','smf-village']);
 assert.deepEqual(board.rows,[{venue:'smf-village'}]);
 await board.select('rush','smf-v1','smf-grove');
 assert.equal(requests.length,2);assert.equal(board.rushStageId,'smf-grove');
 assert.deepEqual(board.rows,[{venue:'smf-grove'}]);
 await board.select('rush','smf-v1');
 assert.deepEqual(requests[2],{mode:'rush',scoringVersion:'smf-v1'});
 await board.select('festival','smf-v1','smf-grove');
 assert.deepEqual(requests[3],{mode:'festival',scoringVersion:'smf-v1'});
});

test('a late venue result cannot replace the newly selected venue',async()=>{
 const pending={};const board=createBoard(({rushStageId})=>new Promise(resolve=>pending[rushStageId]=resolve));
 const old=board.select('rush','smf-v1','smf-amp');
 const current=board.select('rush','smf-v1','smf-fractal');
 pending['smf-fractal']({ok:true,data:[{venue:'smf-fractal'}]});await current;
 pending['smf-amp']({ok:true,data:[{venue:'smf-amp'}]});assert.equal(await old,false);
 assert.equal(board.rushStageId,'smf-fractal');assert.deepEqual(board.rows,[{venue:'smf-fractal'}]);
});

test('SMF client rejects a well-formed board for a different venue',async()=>{
 const row={editionId:'smf',initials:'ABC',score:100,stagesCleared:1,inputType:'touch',mode:'rush',scoringVersion:'smf-v1',receivedAt:'2026-11-13T00:00:00Z',rushStageId:'smf-grove'};
 const requests=[];const client=createSmfOnlineClient({baseUrl:'https://example.test',fetch:async(_url,options)=>{requests.push(JSON.parse(options.body));return {ok:true,json:async()=>[row]};}});
 const request={editionId:'smf',mode:'rush',scoringVersion:'smf-v1',rushStageId:'smf-grove'};
 assert.equal((await client.getBoard(request)).ok,true);
 assert.equal((await client.getBoard({...request,rushStageId:'smf-village'})).ok,false);
 assert.deepEqual(requests[0],request);
});
