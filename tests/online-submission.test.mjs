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
