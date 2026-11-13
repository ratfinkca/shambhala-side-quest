import test from 'node:test';
import assert from 'node:assert/strict';
import {CONTROL_PREFERENCES,sanitizeControlPreferences,createControlPreferences} from '../src/control-preferences.js';

test('existing players retain tap movement and automatic camera defaults',()=>{
 assert.deepEqual(createControlPreferences(undefined,{key:'generic.controls'}).value,{mode:'tap',sensitivity:1,camera:'auto',zoom:1,hand:'left'});
});
test('malformed preferences do not change defaults or escape allowed bounds',()=>{
 for(const raw of [null,[],42,'swipe'])assert.deepEqual(sanitizeControlPreferences(raw),CONTROL_PREFERENCES);
 assert.deepEqual(sanitizeControlPreferences({mode:'<script>',camera:'rotate',sensitivity:NaN,zoom:Infinity}),CONTROL_PREFERENCES);
 assert.deepEqual(sanitizeControlPreferences({mode:'swipe',camera:'follow',sensitivity:80,zoom:-3}),{mode:'swipe',camera:'follow',sensitivity:1.6,zoom:.8,hand:'left'});
 const broken=createControlPreferences({getItem:()=>'{bad',setItem(){}},{key:'generic.controls'});
 assert.deepEqual(broken.value,CONTROL_PREFERENCES);
});
test('preferences persist independently per edition and updates retain other settings',()=>{
 const data=new Map(),storage={getItem:key=>data.get(key),setItem:(key,value)=>data.set(key,value)};
 const generic=createControlPreferences(storage,{key:'generic.controls'}),smf=createControlPreferences(storage,{key:'smf.controls'});
 assert.equal(smf.update({mode:'stick',sensitivity:1.25}).persisted,true);
 smf.update({camera:'overview',zoom:1.2});
 assert.deepEqual(createControlPreferences(storage,{key:'smf.controls'}).value,{mode:'stick',sensitivity:1.25,camera:'overview',zoom:1.2,hand:'left'});
 assert.deepEqual(generic.value,CONTROL_PREFERENCES);
 assert.deepEqual(createControlPreferences(storage,{key:'generic.controls'}).value,CONTROL_PREFERENCES);
});
test('blocked or unavailable storage retains changes for this session',()=>{
 for(const storage of [undefined,{getItem(){throw Error('denied');},setItem(){throw Error('denied');}}]){
  const preferences=createControlPreferences(storage,{key:'controls'});
  assert.equal(preferences.update({mode:'swipe'}).persisted,false);
  assert.equal(preferences.value.mode,'swipe');
 }
});
test('callers cannot mutate stored preferences without an update',()=>{
 const preferences=createControlPreferences(undefined,{key:'controls'});
 assert.throws(()=>{preferences.value.mode='stick';},TypeError);
 preferences.update({mode:'swipe'});
 assert.equal(preferences.value.mode,'swipe');
});


test('old preferences gain left-hand layout without changing movement or camera, and handedness saves independently',()=>{
 const data=new Map([['controls',JSON.stringify({mode:'swipe',sensitivity:1.2,camera:'follow',zoom:1.1})]]),storage={getItem:key=>data.get(key),setItem:(key,value)=>data.set(key,value)};
 const preferences=createControlPreferences(storage,{key:'controls'});assert.equal(preferences.value.hand,'left');assert.equal(preferences.value.mode,'swipe');assert.equal(preferences.value.zoom,1.1);
 assert.equal(preferences.update({hand:'right'}).persisted,true);assert.equal(createControlPreferences(storage,{key:'controls'}).value.hand,'right');
 assert.equal(sanitizeControlPreferences({hand:'unexpected'}).hand,'left');assert.equal(sanitizeControlPreferences({hand:null}).hand,'left');
});
