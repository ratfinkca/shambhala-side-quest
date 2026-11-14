import test from 'node:test';
import assert from 'node:assert/strict';
import {CHARACTER_OPTIONS,CHARACTER_PRESETS,applyCharacterPreset} from '../src/wardrobe.js';
import {renderCharacterControls,updateCharacterControls} from '../src/character-view.js';
import {createScreens} from '../src/screens.js';
import {createStorage} from '../src/storage.js';
import {createTourProfile} from '../src/smf-tour/model.js';
import {wardrobeHTML,titleHTML} from '../src/smf-tour/view.js';
import {renderTitle} from '../src/theme-screens.js';

function screenHarness(){
 const content={innerHTML:'',querySelector:()=>null},events={};
 const root={querySelector:()=>content,addEventListener:(event,handler)=>{events[event]=handler;},dataset:{},parentElement:{}};
 return {root,content,events};
}

test('both Character screens keep existing wardrobe routes and XP-locked clothes',()=>{
 const old=globalThis.requestAnimationFrame;globalThis.requestAnimationFrame=fn=>fn();
 try{
  const {root,content}=screenHarness(),profile=createStorage(null).profile;
  createScreens(root,{}).show('wardrobe',{profile});
  for(const html of [content.innerHTML,wardrobeHTML(createTourProfile())]){
   assert.match(html,/<h2>Character<\/h2>/);
   assert.equal((html.match(/data-action="character-preset"/g)||[]).length,4);
   assert.equal((html.match(/data-action="character-skin"/g)||[]).length,6);
   assert.match(html,/<option value="cosmic" disabled/,'existing locked outfit remains locked');
   assert.match(html,/data-action="preview-outfit"/,'locked wardrobe preview remains available');
   assert.match(html,/data-outfit="totem"/);
  }
  for(const html of [renderTitle('forest-freakout'),titleHTML(createTourProfile())])assert.match(html,/data-action="wardrobe"[^>]*>Character<\/button>/);
 }finally{if(old===undefined)delete globalThis.requestAnimationFrame;else globalThis.requestAnimationFrame=old;}
});

test('appearance changes use a separate handler and skin choices have visible accessible names',()=>{
 const {root,events}=screenHarness(),seen=[];
 createScreens(root,{appearance:(...value)=>seen.push(['appearance',...value]),outfit:(...value)=>seen.push(['outfit',...value])});
 events.change({target:{matches:selector=>selector==='[data-appearance]',dataset:{appearance:'hair'},value:'locs'}});
 assert.deepEqual(seen,[['appearance','hair','locs']]);
 const html=renderCharacterControls(applyCharacterPreset({},'night-bloom'));
 for(const option of CHARACTER_OPTIONS.skinTone){assert.ok(html.includes(`aria-label="${option.name} skin tone"`));assert.ok(html.includes(`<span>${option.name}</span>`));}
 assert.match(html,/data-value="night-bloom"[^>]*aria-pressed="true"/);
 assert.match(html,/data-value="rich"[^>]*aria-pressed="true"/);
});

test('editing a preset updates existing controls without replacing the focused selector',()=>{
 const node=(value,extra={})=>({dataset:{value,...extra},setAttribute(key,val){this[key]=val;}});
 const selects=Object.keys(CHARACTER_OPTIONS).map(key=>node('',{appearance:key}));
 const presets=CHARACTER_PRESETS.map(preset=>node(preset.id)),skin=CHARACTER_OPTIONS.skinTone.map(option=>node(option.id));
 const angles=['down','right','up','left'].map(id=>node(id)),summary={};
 const root={querySelector:()=>summary,querySelectorAll:selector=>({'[data-appearance]':selects,'[data-action="character-preset"]':presets,'[data-action="character-skin"]':skin,'[data-action="character-facing"]':angles})[selector]};
 const outfit=applyCharacterPreset({},'night-bloom');outfit.appearance.hair='crop';
 updateCharacterControls(root,outfit,{facing:'up'});
 assert.equal(selects.find(n=>n.dataset.appearance==='hair').value,'crop');
 assert.equal(presets.filter(n=>n['aria-pressed']==='true').length,0);
 assert.equal(skin.find(n=>n.dataset.value==='rich')['aria-pressed'],'true');
 assert.equal(angles.find(n=>n.dataset.value==='up')['aria-pressed'],'true');
 assert.equal(summary.textContent,'Custom look');
});
