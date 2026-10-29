import test from 'node:test';import assert from 'node:assert/strict';
import {createBoard} from '../src/online/board.js';import {renderSubmission,renderOnlineBoard} from '../src/online/view.js';import {createSubmission} from '../src/online/submission.js';import {readArcadeConfig,createOnlineClient} from '../src/online/client.js';
test('late Rush response cannot replace selected Festival board',async()=>{const pending={};const board=createBoard(({mode})=>new Promise(r=>pending[mode]=r));const rush=board.select('rush','arcade-v1');const festival=board.select('festival','arcade-v1');pending.festival({ok:true,data:[]});await festival;pending.rush({ok:true,data:[{initials:'BAD'}]});assert.equal(await rush,false);assert.equal(board.mode,'festival');assert.deepEqual(board.rows,[]);});
test('posting is explicit, independent of local saves and analytics, and public strings escape',()=>{
 const state=createSubmission('run');state.setTicket('run',{ticket:'a'.repeat(64)});const html=renderSubmission(state,{totalScore:10,stagesCleared:1,mode:'rush',submitted:true},'mouse');assert.match(html,/Post online/);assert.match(html,/playtest sharing off/);
 assert.doesNotMatch(renderOnlineBoard({mode:'rush',status:'ready',rows:[{initials:'<img>',score:0,stagesCleared:1,inputType:'<script>'}]}),/<img>|<script>/);
 state.status='error';state.code='expired';assert.match(renderSubmission(state,{totalScore:10,stagesCleared:1,mode:'rush'},'touch'),/24-hour/);
});
test('configuration is independent and rejects credentials/insecure public endpoints; request timeout is bounded',async()=>{
 assert.deepEqual(readArcadeConfig({VITE_ARCADE_ENABLED:'true',VITE_ARCADE_URL:'http://example.com'}),{});
 assert.deepEqual(readArcadeConfig({VITE_ARCADE_ENABLED:'true',VITE_ARCADE_URL:'https://user:pass@example.com'}),{});
 assert.ok(readArcadeConfig({VITE_ARCADE_ENABLED:'true',VITE_ARCADE_URL:'https://example.com'}).baseUrl);
 const client=createOnlineClient({baseUrl:'https://example.com',timeoutMs:5,fetch:()=>new Promise(()=>{})});assert.equal((await client.startRun({})).code,'unavailable');
});

test('Endless has its own online tab, survival-first details and explicit initials posting',()=>{
 const html=renderOnlineBoard({mode:'endless',status:'ready',rows:[{initials:'WIN',score:100,stagesCleared:12,inputType:'touch'}]});
 assert.match(html,/data-value="endless" aria-pressed="true"/);assert.match(html,/Stages cleared first/);assert.match(html,/12 cleared · 100 vibes/);
 const state=createSubmission('endless-run');state.setTicket('endless-run',{ticket:'a'.repeat(64)});
 const run={mode:'endless',totalScore:100,stagesCleared:12};const posting=renderSubmission(state,run,'touch');assert.match(posting,/Endless Festival/);assert.match(posting,/Post online/);
 assert.doesNotMatch(renderSubmission(state,{...run,scoreOverflow:true},'touch'),/data-action="post-online"/);
});
test('Endless board accepts more than three clears and stays isolated from earlier board responses',async()=>{
 const row={initials:'AAA',score:100,stagesCleared:12,inputType:'mouse',mode:'endless',scoringVersion:'arcade-v1',receivedAt:'2026-10-29T10:00:00Z'};
 const client=createOnlineClient({baseUrl:'https://example.com',fetch:async()=>({ok:true,json:async()=>[row]})});assert.equal((await client.getBoard({mode:'endless',scoringVersion:'arcade-v1'})).ok,true);
 assert.equal((await client.getBoard({mode:'rush',scoringVersion:'arcade-v1'})).ok,false);
 const pending={};const board=createBoard(({mode})=>new Promise(resolve=>pending[mode]=resolve));const old=board.select('festival','arcade-v1'),current=board.select('endless','arcade-v1');
 pending.endless({ok:true,data:[row]});await current;pending.festival({ok:true,data:[]});await old;assert.equal(board.rows[0].stagesCleared,12);assert.equal(board.mode,'endless');
});

test('save area leads with initials and prominent actions; navigation is secondary and warns only when needed',async()=>{
 const {renderResults,resultsExitState}=await import('../src/results-view.js');
 const run={mode:'endless',totalScore:1234,stagesCleared:3,endedVoluntarily:true};const state=createSubmission('id');state.setTicket('id',{ticket:'a'.repeat(64)});
 const html=renderResults({run,summary:null,profile:{},onlineSubmission:state,onlineInput:'touch'});
 assert.match(html,/Finish|finished|FINISHED/);assert.match(html,/Save on this device/);assert.match(html,/class="primary-button" data-action="post-online"/);
 assert.ok(html.indexOf('data-action="post-online"')<html.indexOf('data-action="replay"'));assert.ok(html.indexOf('id="initials"')<html.indexOf('data-action="submit"'));
 assert.equal(resultsExitState(run,state),'unsaved');assert.equal(resultsExitState({...run,submitted:true},state),'saved');
 state.status='pending';assert.equal(resultsExitState({...run,submitted:true},state),'pending');state.status='succeeded';assert.equal(resultsExitState(run,state),'saved');
 state.status='error';assert.equal(resultsExitState(run,state),'unsaved');
});

test('results retain partially typed or cleared initials when a warning is cancelled',async()=>{
 const {renderResults}=await import('../src/results-view.js');
 for(const initialsDraft of ['ZX','']){const html=renderResults({run:{mode:'endless',endedVoluntarily:true,totalScore:10,stagesCleared:1,initialsDraft},profile:{}});assert.ok(html.includes(`value="${initialsDraft}"`));}
});
