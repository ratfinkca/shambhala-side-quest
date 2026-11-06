import test from 'node:test';import assert from 'node:assert/strict';
import {getEdition,editionServices,startEdition} from '../src/editions/registry.js';
import {renderScaffold} from '../src/editions/scaffold-view.js';
import {renderTitle} from '../src/theme-screens.js';
const live={VITE_ARCADE_ENABLED:'true',VITE_ARCADE_URL:'https://example.com/functions',VITE_PLAYTEST_ENABLED:'true',VITE_PLAYTEST_URL:'https://example.com/events',VITE_PLAYTEST_NOTICE_URL:'https://example.com/notice'};
test('edition services require actual config and never enable SMF/rehearsal connections',()=>{
 assert.deepEqual(editionServices(getEdition('smf'),live),{arcadeEnabled:false,playtestEnabled:false});
 assert.deepEqual(editionServices(getEdition(),live),{arcadeEnabled:true,playtestEnabled:true});
 assert.deepEqual(editionServices(getEdition(),{}),{arcadeEnabled:false,playtestEnabled:false});
 assert.deepEqual(editionServices(getEdition(),live,{rehearsal:true}),{arcadeEnabled:false,playtestEnabled:false});
 assert.deepEqual(editionServices(getEdition(),{...live,VITE_ARCADE_URL:'bad',VITE_PLAYTEST_NOTICE_URL:'bad'}),{arcadeEnabled:false,playtestEnabled:false});
});
test('edition-first boot rejects bad context before side effects and never initializes the game for SMF',async()=>{
 const calls=[];const actions={game:e=>calls.push('game:'+e.id),scaffold:e=>calls.push('scaffold:'+e.id)};
 await assert.rejects(()=>startEdition({VITE_EDITION:'invalid'},actions),/Unknown edition/);assert.deepEqual(calls,[]);
 await startEdition({VITE_EDITION:'smf',...live},actions);assert.deepEqual(calls,['scaffold:smf']);
 await startEdition({},actions);assert.deepEqual(calls,['scaffold:smf','game:generic']);
});
test('scaffold renders all nine planned stages and parent relationships without playable or posting actions',()=>{
 const classes=new Set(),root={innerHTML:'',classList:{add:v=>classes.add(v),remove:v=>classes.delete(v)}},dispose=renderScaffold(root,getEdition('smf'));
 assert.ok(classes.has('edition-scaffold'));
 assert.match(root.innerHTML,/Content preview — gameplay coming next/);
 for(const c of getEdition('smf').catalogue)assert.ok(root.innerHTML.includes(`data-stage-id="${c.id}"`));
 assert.equal((root.innerHTML.match(/data-stage-id=/g)||[]).length,9);
 assert.match(root.innerHTML,/Discovered from The Living Room/);assert.match(root.innerHTML,/Discovered from The Grove/);assert.match(root.innerHTML,/Discovered from The Pagoda/);
 assert.doesNotMatch(root.innerHTML,/data-action=|<canvas|<button|Share playtest data|Post score/);
 dispose();assert.equal(root.innerHTML,'');assert.equal(classes.size,0);
 const generic=renderTitle('forest-freakout','unknown',false);assert.match(generic,/Three stages/);assert.match(generic,/Festival Side Quest/);
});
