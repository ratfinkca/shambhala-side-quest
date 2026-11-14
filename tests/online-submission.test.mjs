import test from 'node:test';import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';import {runInNewContext} from 'node:vm';
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

test('reload after uncertain posting keeps the exact original ticket, build and payload for explicit retry',async()=>{
 const a=createSubmission('id');a.setTicket('id',{ticket:'a'.repeat(64),expiresAt:new Date(Date.now()+3600000).toISOString()});let finish;
 const pending=a.post({initials:'ABC',buildId:'original',totalScore:30},()=>new Promise(r=>finish=r));
 const b=createSubmission('id',a.snapshot());assert.equal(b.status,'error');assert.equal(b.code,'unavailable');assert.equal(b.initials,'ABC');let sent;
 await b.post({initials:'XYZ',buildId:'new',totalScore:99},async p=>{sent=p;return {ok:true}});
 assert.equal(sent.initials,'ABC');assert.equal(sent.buildId,'original');assert.equal(sent.totalScore,30);assert.equal(sent.ticket,'a'.repeat(64));assert.equal(b.status,'succeeded');finish({ok:true});await pending;
 assert.equal(createSubmission('id',b.snapshot()).status,'succeeded');
});
test('expired unattempted ticket cannot post but an uncertain attempted payload may retry its receipt',async()=>{
 const a=createSubmission('id');a.setTicket('id',{ticket:'b'.repeat(64),expiresAt:'2000-01-01T00:00:00Z'});let sent=0;await a.post({},async()=>{sent++;return {ok:true}});assert.equal(sent,0);assert.equal(a.code,'expired');
 const b=createSubmission('id',{...a.snapshot(),status:'pending',payload:{initials:'ABC',runId:'id',ticket:'b'.repeat(64)}});await b.post({},async()=>{sent++;return {ok:true}});assert.equal(sent,1);assert.equal(b.status,'succeeded');
});

test('restoring while a ticket is still waiting never issues or invents a replacement',()=>{const a=createSubmission('id');const b=createSubmission('id',a.snapshot());assert.equal(b.status,'ineligible');assert.equal(b.setTicket('id',{ticket:'a'.repeat(64)}),false);});

test('challenge boards have separate caches and cannot replace newer selections',async()=>{
 const requests=[],pending={};const board=createBoard(p=>{requests.push(p);return new Promise(resolve=>pending[p.challenge]=resolve);});
 const first=board.select('rush','arcade-v3',undefined,'first-timer');
 const hard=board.select('rush','arcade-v3',undefined,'seasoned-vet');
 pending['seasoned-vet']({ok:true,data:[{displayName:'Hard'}]});await hard;
 pending['first-timer']({ok:true,data:[{displayName:'Easy'}]});assert.equal(await first,false);
 assert.equal(board.challenge,'seasoned-vet');assert.equal(board.rows[0].displayName,'Hard');
 await board.select('rush','arcade-v3',undefined,'first-timer');assert.equal(board.rows[0].displayName,'Easy');assert.equal(requests.length,2);
});
test('a definitive name rejection allows correction; uncertain posts retain their name',async()=>{
 const a=createSubmission('name-run');a.setTicket('name-run',{ticket:'a'.repeat(64)});
 await a.post({displayName:'Rejected'},async()=>({ok:false,code:'invalid_name'}));
 assert.equal(a.displayName,undefined);assert.equal(a.snapshot().payload,null);
 let posted;await a.post({displayName:'Moon Dancer'},async p=>{posted=p;return {ok:false,code:'unavailable'};});
 assert.equal(posted.displayName,'Moon Dancer');assert.equal(a.displayName,'Moon Dancer');
 await a.post({displayName:'Changed'},async p=>{assert.equal(p.displayName,'Moon Dancer');return {ok:true};});
});

test('generic results allow a rejected public name to change after local saving without rewriting the saved name',async()=>{
 const {renderResults}=await import('../src/results-view.js');
 const run={id:'named-local',mode:'rush',scoringVersion:'arcade-v3',challenge:'been-around',totalScore:50,stagesCleared:1,submitted:true,displayName:'Local Name',displayNameDraft:'Local Name'};
 const submission=createSubmission(run.id);submission.setTicket(run.id,{ticket:'a'.repeat(64)});
 const input=()=>renderResults({run,profile:{playerName:'Local Name',bestRush:50},onlineSubmission:submission}).match(/<input id="initials"[^>]*>/)[0];
 assert.match(input(),/\bdisabled\b/);
 await submission.post({displayName:'Local Name'},async()=>({ok:false,code:'invalid_name'}));
 run.displayNameDraft='Moon Dancer';
 assert.doesNotMatch(input(),/\bdisabled\b/);assert.match(input(),/value="Moon Dancer"/);
 await submission.post({displayName:run.displayNameDraft},async()=>({ok:false,code:'unavailable'}));
 run.displayNameDraft='Later Edit';
 assert.match(input(),/\bdisabled\b/);assert.match(input(),/value="Moon Dancer"/);
 await submission.post({displayName:run.displayNameDraft},async payload=>{assert.equal(payload.displayName,'Moon Dancer');return {ok:true};});
 assert.equal(run.displayName,'Local Name');assert.match(input(),/value="Moon Dancer"/);
});

test('SMF results allow a rejected public name to change after local saving and lock uncertain retries',async()=>{
 const {summaryHTML}=await import('../src/smf-tour/view.js');
 const {createTourProfile,createTourRun,endFestival,saveTourScore}=await import('../src/smf-tour/model.js');
 let profile=createTourProfile();profile.playerName='Local Name';
 profile=saveTourScore(endFestival(createTourRun(profile,'festival','named-local')),'Local Name');
 const savedRow=structuredClone(profile.boards.festival[0]);
 const submission=createSubmission(profile.active.id);submission.setTicket(profile.active.id,{ticket:'a'.repeat(64)});
 const input=()=>summaryHTML(profile,{submission,onlineEnabled:true}).match(/<input id="tour-initials"[^>]*>/)[0];
 assert.match(input(),/\bdisabled\b/);
 await submission.post({displayName:'Local Name'},async()=>({ok:false,code:'invalid_name'}));
 profile.active.displayNameDraft='Moon Dancer';
 assert.doesNotMatch(input(),/\bdisabled\b/);assert.match(input(),/value="Moon Dancer"/);
 await submission.post({displayName:profile.active.displayNameDraft},async()=>({ok:false,code:'unavailable'}));
 profile.active.displayNameDraft='Later Edit';
 assert.match(input(),/\bdisabled\b/);assert.match(input(),/value="Moon Dancer"/);
 await submission.post({displayName:profile.active.displayNameDraft},async payload=>{assert.equal(payload.displayName,'Moon Dancer');return {ok:true};});
 assert.deepEqual(profile.boards.festival[0],savedRow);assert.match(input(),/value="Moon Dancer"/);
});

test('replaying a nameless legacy result uses required character setup before creating a new run',async()=>{
 const {createCharacterOnboarding,requiresCharacterSetup}=await import('../src/onboarding.js');
 const {createScreenState,transition}=await import('../src/screens.js');
 const {resultsExitState}=await import('../src/results-view.js');
 const source=readFileSync(new URL('../src/game-entry.js',import.meta.url),'utf8');
 const handlers=source.slice(source.indexOf('function navigateResults('),source.indexOf('function action('));
 assert.match(handlers,/function startFromTitle\(/);
 for(const mode of ['rush','festival','endless'])for(const playerName of ['', 'Moon Dancer']){
  const created=[],characterOnboarding=createCharacterOnboarding();let cleared=0;
  const context={screen:{name:'results'},run:{mode,scoringVersion:'arcade-v2',submitted:true},submission:null,replayPending:false,rehearsal:false,
   saved:{profile:{characterConfirmed:true,playerName}},characterOnboarding,requiresCharacterSetup,createScreenState,resultsExitState,
   recovery:{clear(){cleared++;}},newRun(value){created.push(value);context.run={mode:value};},begin(){context.screen=transition(context.screen,{type:'START'});},
   go(type,extra={}){context.screen=transition(context.screen,{type,...extra});},playtest:{menu(){}},activeTheme:'forest-freakout',toast(){}};
  runInNewContext(`${handlers}\nnavigateResults('replay');`,context);
  assert.equal(cleared,1);assert.equal(context.replayPending,true);
  if(!playerName){assert.equal(context.screen.name,'wardrobe');assert.equal(characterOnboarding.pendingMode,mode);assert.deepEqual(created,[]);assert.equal(context.run,null);}
  else{assert.deepEqual(created,[mode]);assert.equal(characterOnboarding.pendingMode,null);assert.equal(context.screen.name,mode==='rush'?'playing':'rules');}
 }
});
