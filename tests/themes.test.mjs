import test from 'node:test';
import assert from 'node:assert/strict';
import {createStorage} from '../src/storage.js';
import {createRun,startStage,finishStage,chooseUpgrade} from '../src/run.js';
import {createRound} from '../src/game.js';
import {createScreenState,transition} from '../src/screens.js';
const memory=initial=>{const data=new Map(Object.entries(initial??{}));return {getItem:k=>data.get(k),setItem:(k,v)=>data.set(k,v)};};
test('legacy profile gains forest theme without losing existing data',()=>{
 const s=createStorage(memory({'sidequest.profile.v1':JSON.stringify({version:1,bestRush:123,audio:{enabled:false,music:.2,effects:.7},outfit:{onesie:'rainbow',hat:'wizard',totem:'star'}})}));
 assert.equal(s.profile.themePreference,'forest-freakout');assert.equal(s.best,123);assert.equal(s.sound,false);assert.equal(s.profile.outfit.hat,'wizard');
});
test('theme preferences persist, reject unavailable choices and survive blocked storage in memory',()=>{
 const m=memory(),s=createStorage(m);assert.deepEqual(s.saveTheme('surprise'),{accepted:true,persisted:true});assert.equal(createStorage(m).profile.themePreference,'surprise');
 assert.deepEqual(s.saveTheme('unknown-theme'),{accepted:false,persisted:false});assert.equal(s.profile.themePreference,'surprise');
 const blocked=createStorage({getItem(){throw Error()},setItem(){throw Error()}});assert.deepEqual(blocked.saveTheme('surprise'),{accepted:true,persisted:false});assert.equal(blocked.profile.themePreference,'surprise');
});
test('theme screen is title-only and returns safely without starting a run',()=>{
 const style=transition(createScreenState(),{type:'STYLE'});assert.equal(style.name,'style');assert.equal(transition(style,{type:'BACK'}).name,'title');
 const playing={name:'playing',returnTo:'title'};assert.equal(transition(playing,{type:'STYLE'}),playing);
});
test('run keeps its concrete theme across qualification and perk choice',()=>{
 const run=createRun('festival','one','forest-freakout');assert.equal(run.themeId,'forest-freakout');startStage(run);const r=createRound();Object.assign(r,{pickups:20,ended:true,remainingMs:0});finishStage(run,r);chooseUpgrade(run,'boots');startStage(run);assert.equal(run.themeId,'forest-freakout');
});

test('Surprise selects only complete themes, supports multiple styles and fixed choices',async()=>{
 const {resolveTheme,normalizeThemePreference}=await import('../src/themes.js');
 const registry=[{id:'forest-freakout',ready:true},{id:'moon',ready:false},{id:'neon',ready:true}];
 assert.equal(resolveTheme('surprise',()=>0,registry),'forest-freakout');
 assert.equal(resolveTheme('surprise',()=>.999,registry),'neon');
 assert.equal(resolveTheme('neon',()=>0,registry),'neon');
 assert.equal(resolveTheme('surprise',()=>.9),'neon-field-trip');
 for(const invalid of [null,{},'bad','unknown-theme'])assert.equal(normalizeThemePreference(invalid),'forest-freakout');
});

test('Moonlit selection persists and stays concrete through a festival stage',()=>{
 const m=memory(),s=createStorage(m);
 assert.deepEqual(s.saveTheme('moonlit-mycelium'),{accepted:true,persisted:true});
 assert.equal(createStorage(m).profile.themePreference,'moonlit-mycelium');
 const run=createRun('festival','moon','moonlit-mycelium');startStage(run);
 const round=createRound();Object.assign(round,{pickups:20,ended:true,remainingMs:0});
 finishStage(run,round);chooseUpgrade(run,'moth');startStage(run);
 assert.equal(run.themeId,'moonlit-mycelium');
});

test('all three shipped themes persist and Surprise reaches each without changing a run',async()=>{
 const {resolveTheme}=await import('../src/themes.js');
 const ids=['forest-freakout','moonlit-mycelium','neon-field-trip'];
 for(const [i,id] of ids.entries()){
  const m=memory(),s=createStorage(m);assert.deepEqual(s.saveTheme(id),{accepted:true,persisted:true});
  assert.equal(createStorage(m).profile.themePreference,id);
  assert.equal(resolveTheme('surprise',()=> (i+.5)/3),id);
  const run=createRun('festival',id,id);startStage(run);
  const r=createRound();Object.assign(r,{pickups:20,ended:true,remainingMs:0});
  finishStage(run,r);chooseUpgrade(run,'boots');startStage(run);assert.equal(run.themeId,id);
 }
});

test('selectable themes ship every referenced illustration',async()=>{
 const {THEMES}=await import('../src/themes.js');
 const {access}=await import('node:fs/promises');
 for(const theme of THEMES.filter(t=>t.ready)){
  for(const asset of [theme.preview,theme.backdrop,...Object.values(theme.perks)]){
   await access(new URL('../public/'+asset,import.meta.url));
  }
 }
});
