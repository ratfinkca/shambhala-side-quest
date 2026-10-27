import test from 'node:test';
import assert from 'node:assert/strict';
import {createStorage} from '../src/storage.js';
import {readProfile,PROFILE_KEY} from '../src/profile.js';
import {createConsent} from '../src/playtest/consent.js';
const memory=()=>{const m=new Map();return {getItem:k=>m.get(k),setItem:(k,v)=>m.set(k,v),removeItem:k=>m.delete(k)}};
test('consent defaults off and retains existing saves',()=>{
 const raw=memory();raw.setItem(PROFILE_KEY,JSON.stringify({version:1,bestRush:123,themePreference:'moonlit',audio:{enabled:false},playtestConsent:'bad'}));
 const p=readProfile(raw);assert.equal(p.bestRush,123);assert.equal(p.audio.enabled,false);assert.equal(p.playtestConsent,'unknown');
});
test('only acceptance creates identity; decline removes it and survives reload',()=>{
 const raw=memory(),storage=createStorage(raw);let ids=0;
 const c=createConsent({storage,uuid:()=>`id-${++ids}`});assert.equal(c.enabled(),false);assert.equal(c.identity(),null);
 c.set('declined');assert.equal(ids,0);c.set('accepted');assert.equal(c.identity(),'id-1');c.set('accepted');assert.equal(ids,1);
 assert.equal(createConsent({storage:createStorage(raw),uuid:()=> 'other'}).identity(),'id-1');
 c.set('declined');assert.equal(c.identity(),null);assert.equal(createStorage(raw).profile.playtestIdentity,null);
 c.set('accepted');assert.equal(c.identity(),'id-2');
});
test('blocked storage retains session choice without crashing',()=>{
 const c=createConsent({storage:createStorage({getItem(){throw Error()},setItem(){throw Error()}}),uuid:()=> 'session'});
 assert.equal(c.set('accepted').persisted,false);assert.equal(c.enabled(),true);c.set('declined');assert.equal(c.identity(),null);
});
import {renderPlaytestConsent} from '../src/playtest/view.js';
test('consent view is nonblocking and unavailable service cannot solicit consent',()=>{
 const disabled=renderPlaytestConsent('unknown',false);assert.doesNotMatch(disabled,/data-action="playtest-accept"/);
 const invite=renderPlaytestConsent('unknown',true);assert.match(invite,/data-action="playtest-accept"/);assert.match(invite,/data-action="playtest-decline"/);assert.doesNotMatch(invite,/primary-button/);
 assert.match(renderPlaytestConsent('accepted',true),/Stop sharing/);
});

import {renderPlaytestShortcut} from '../src/playtest/view.js';
test('title sharing stays discoverable after either choice without silently opting in',()=>{
 for(const choice of ['unknown','declined']){
  const html=renderPlaytestShortcut(choice,true);
  assert.match(html,/currently off/);
  assert.match(html,/data-action="playtest-accept"/);
  assert.match(html,/<details/);
 }
 const on=renderPlaytestShortcut('accepted',true);
 assert.match(on,/Playtest sharing: on/);
 assert.match(on,/data-action="playtest-decline"/);
 assert.doesNotMatch(on,/data-action="playtest-accept"/);
 assert.equal(renderPlaytestShortcut('unknown',false),'');
});
