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
test('scaffold keeps nine tiles but conceals undiscovered stage identities',()=>{
 const classes=new Set(),root={innerHTML:'',classList:{add:v=>classes.add(v),remove:v=>classes.delete(v)}},dispose=renderScaffold(root,getEdition('smf'));
 assert.ok(classes.has('edition-scaffold'));
 assert.match(root.innerHTML,/Content preview — gameplay coming next/);
 for(const c of getEdition('smf').catalogue){
  if(c.kind==='main')assert.ok(root.innerHTML.includes(`data-stage-id="${c.id}"`));
  else{assert.ok(!root.innerHTML.includes(c.name));assert.ok(!root.innerHTML.includes(c.id));}
 }
 assert.equal((root.innerHTML.match(/<article class="stage-preview/g)||[]).length,9);
 assert.equal((root.innerHTML.match(/aria-label="Undiscovered stage"/g)||[]).length,3);
 assert.equal((root.innerHTML.match(/Somewhere secret/g)||[]).length,3);
 assert.doesNotMatch(root.innerHTML,/data-action=|<canvas|<button|Share playtest data|Post score/);
 dispose();assert.equal(root.innerHTML,'');assert.equal(classes.size,0);
 const generic=renderTitle('forest-freakout','unknown',false);assert.match(generic,/Three stages/);assert.match(generic,/Festival Side Quest/);
});

test('only discovered secrets reveal their name and parent while others remain concealed',()=>{
 const root={innerHTML:'',classList:{add(){},remove(){}}},edition=getEdition('smf');
 renderScaffold(root,edition,{discoveredStageIds:['smf-rabbit-hole','not-a-stage']});
 assert.match(root.innerHTML,/Rabbit Hole/);assert.match(root.innerHTML,/Discovered from The Living Room/);
 assert.doesNotMatch(root.innerHTML,/Secret Garden|Ikigai Mori|smf-secret-garden|smf-ikigai-mori/);
 assert.equal((root.innerHTML.match(/aria-label="Undiscovered stage"/g)||[]).length,2);
});
