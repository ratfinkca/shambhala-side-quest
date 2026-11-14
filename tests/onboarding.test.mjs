import test from 'node:test';
import assert from 'node:assert/strict';
import {createStorage} from '../src/storage.js';
import {createTourProfile} from '../src/smf-tour/model.js';
import {normalizeTourProfile} from '../src/smf-tour/store.js';
import {createCharacterOnboarding,normalizeCharacterConfirmed} from '../src/onboarding.js';
import {THEMES,THEME_DEFAULT,getTheme} from '../src/themes.js';
const memory=()=>{const values=new Map();return {getItem:k=>values.get(k),setItem:(k,v)=>values.set(k,v)};};

test('new players start Neon with an unconfirmed character in both isolated profiles',()=>{
 const generic=createStorage(memory()).profile,smf=createTourProfile();
 for(const p of [generic,smf]){assert.equal(p.themePreference,'neon-field-trip');assert.equal(p.characterConfirmed,false);}
 assert.equal(THEME_DEFAULT,'neon-field-trip');assert.equal(new Set(THEMES.map(t=>t.id)).size,3);assert.equal(getTheme('bad').id,THEME_DEFAULT);
});
test('old saves retain their look and theme, and are not forced through first-use again',()=>{
 const m=memory(),look={onesie:'rainbow',hat:'wizard',totem:'star',appearance:{face:'grin',hair:'locs',skinTone:'rich'}};
 m.setItem('sidequest.profile.v1',JSON.stringify({version:1,outfit:look,themePreference:'moonlit-mycelium'}));
 const generic=createStorage(m).profile;
 const smf=normalizeTourProfile({version:1,outfit:look,themePreference:'surprise'});
 assert.equal(generic.themePreference,'moonlit-mycelium');assert.equal(smf.themePreference,'surprise');
 for(const p of [generic,smf]){assert.equal(p.characterConfirmed,true);assert.deepEqual(p.outfit.appearance,look.appearance);}
 assert.equal(normalizeTourProfile({version:1}).themePreference,'forest-freakout');
});
test('character confirmation persists, including session-only fallback',()=>{
 const m=memory(),s=createStorage(m);s.saveCharacterConfirmed();assert.equal(createStorage(m).profile.characterConfirmed,true);
 const blocked=createStorage({getItem(){throw Error();},setItem(){throw Error();}});
 assert.equal(blocked.saveCharacterConfirmed().persisted,false);assert.equal(blocked.profile.characterConfirmed,true);
 const p=createTourProfile();p.characterConfirmed=true;assert.equal(normalizeTourProfile(p).characterConfirmed,true);
 assert.equal(normalizeCharacterConfirmed('true'),false);assert.equal(normalizeCharacterConfirmed(undefined,true),true);
});
test('first-play remembers mode, cancellation does not confirm and confirmation is consumed once',()=>{
 const flow=createCharacterOnboarding();
 assert.equal(flow.request('bad',false),false);assert.equal(flow.pendingMode,null);
 assert.equal(flow.request('endless',false),true);assert.equal(flow.pendingMode,'endless');
 flow.cancel();assert.equal(flow.confirm(),null);
 assert.equal(flow.request('rush',false),true);assert.equal(flow.confirm(),'rush');assert.equal(flow.confirm(),null);
 assert.equal(flow.request('festival',true),false);assert.equal(flow.pendingMode,null);
});
