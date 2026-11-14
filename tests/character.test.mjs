import test from 'node:test';
import assert from 'node:assert/strict';
import {WARDROBE,DEFAULT_APPEARANCE,CHARACTER_OPTIONS,CHARACTER_PRESETS,normalizeAppearance,normalizeOutfit,applyCharacterPreset} from '../src/wardrobe.js';
import {createStorage} from '../src/storage.js';
import {createTourProfile,createFestival} from '../src/smf-tour/model.js';
import {createTourStore,normalizeTourProfile} from '../src/smf-tour/store.js';
import {finishRun} from '../src/run.js';
import {makeRecovery,readRecovery} from '../src/recovery.js';
import {recoveryFixture} from './helpers/recovery-fixtures.mjs';
import {createPlaytestSession} from '../src/playtest/session.js';
import {createConsent} from '../src/playtest/consent.js';

const memory=()=>{const data=new Map();return {getItem:key=>data.get(key)??null,setItem:(key,value)=>data.set(key,value)};};
const appearance={face:'chill',hair:'locs',skinTone:'rich'};
const wearables={onesie:'mycelium',hat:'spore',totem:'mixtape',flair:'aurora'};
const score={id:'old-score',initials:'ABC',score:10,stagesCleared:1,completedAt:1000};

test('character choices are separate from unlockable wardrobe categories with six named swatches',()=>{
 assert.deepEqual(Object.keys(WARDROBE),['onesie','hat','totem','flair']);
 assert.deepEqual(CHARACTER_OPTIONS.face.map(v=>v.id),['smile','grin','chill']);
 assert.deepEqual(CHARACTER_OPTIONS.hair.map(v=>v.id),['bob','crop','curls','locs']);
 assert.deepEqual(CHARACTER_OPTIONS.skinTone.map(v=>v.id),['light','fair','medium','tan','deep','rich']);
 for(const option of CHARACTER_OPTIONS.skinTone){assert.match(option.color,/^#[0-9a-f]{6}$/i);assert.ok(option.name.length>3);}
 assert.deepEqual(DEFAULT_APPEARANCE,{face:'smile',hair:'bob',skinTone:'light'});
});

test('legacy and malformed appearance choices normalize independently without retaining unknown data',()=>{
 for(const value of [null,undefined,[],42,'grin',{}])assert.deepEqual(normalizeAppearance(value),DEFAULT_APPEARANCE);
 assert.deepEqual(normalizeAppearance({face:'grin',hair:'not-real',skinTone:'deep',email:'discard'}),{face:'grin',hair:'bob',skinTone:'deep'});
 assert.deepEqual(normalizeOutfit(wearables),{...wearables,appearance:DEFAULT_APPEARANCE});
 const normalized=normalizeOutfit({...wearables,appearance});normalized.appearance.hair='crop';assert.equal(appearance.hair,'locs');
 assert.notEqual(normalizeAppearance(),normalizeAppearance(),'each outfit owns its appearance object');
});

test('four character presets change appearance only and never equip locked clothing',()=>{
 assert.equal(CHARACTER_PRESETS.length,4);assert.equal(new Set(CHARACTER_PRESETS.map(p=>p.id)).size,4);
 const original=normalizeOutfit({...wearables,appearance}),before=structuredClone(original);
 for(const preset of CHARACTER_PRESETS){
  const result=applyCharacterPreset(original,preset.id);
  assert.deepEqual(result.appearance,normalizeAppearance(preset.appearance));
  for(const key of Object.keys(WARDROBE))assert.equal(result[key],original[key]);
  result.appearance.face='changed';assert.notEqual(preset.appearance.face,'changed');
 }
 assert.deepEqual(original,before);assert.deepEqual(applyCharacterPreset(original,'unknown'),original);
});

test('appearance saves for a new generic player without XP and retains wardrobe unlock checks',()=>{
 const mem=memory(),saved=createStorage(mem),outfit=applyCharacterPreset(saved.profile.outfit,CHARACTER_PRESETS[3].id);
 assert.deepEqual(saved.saveOutfit(outfit),{accepted:true,persisted:true});
 assert.deepEqual(createStorage(mem).profile.outfit,outfit);assert.equal(saved.profile.progress.xp,0);
 assert.deepEqual(saved.saveOutfit({...outfit,hat:'spore'}),{accepted:false,persisted:false});
 assert.deepEqual(saved.profile.outfit,outfit);assert.equal(saved.profile.outfit.totem,'none');
});

test('generic local boards retain current appearance and supply defaults for old score rows',()=>{
 const mem=memory();mem.setItem('sidequest.profile.v1',JSON.stringify({version:1,outfit:wearables,boards:{rush:[{...score,outfit:wearables}]}}));
 const saved=createStorage(mem);assert.deepEqual(saved.profile.outfit.appearance,DEFAULT_APPEARANCE);assert.deepEqual(saved.profile.boards.rush[0].outfit.appearance,DEFAULT_APPEARANCE);
 saved.submitScore('rush',{...score,id:'new-score',score:20,outfit:{...wearables,appearance}});
 const restored=createStorage(mem).profile.boards.rush[0];assert.deepEqual(restored.outfit.appearance,appearance);
});

test('SMF appearance and board migration remain edition-local and preserve a parked run',()=>{
 const mem=memory(),generic=createStorage(mem);generic.saveOutfit({...generic.profile.outfit,appearance:{face:'grin',hair:'crop',skinTone:'tan'}});
 const originalGeneric=mem.getItem('sidequest.profile.v1'),profile=createFestival(createTourProfile(),'appearance-run');
 profile.outfit={...profile.outfit,appearance};profile.boards.festival=[{...score,mode:'festival',scoringVersion:'smf-v2',cleared:1}];
 const store=createTourStore(mem);assert.equal(store.write(profile),true);
 const restored=store.read();assert.deepEqual(restored.outfit.appearance,appearance);assert.deepEqual(restored.active,profile.active);
 assert.deepEqual(restored.boards.festival[0].outfit.appearance,DEFAULT_APPEARANCE);assert.equal(mem.getItem('sidequest.profile.v1'),originalGeneric);
 const legacy={...profile,outfit:wearables};assert.deepEqual(normalizeTourProfile(legacy).outfit,{...wearables,appearance:DEFAULT_APPEARANCE});
});

test('result recovery migrates old appearance without changing gameplay or online retry payloads',()=>{
 const fixture=recoveryFixture(1);finishRun(fixture.run);fixture.resultSnapshot={id:fixture.run.id,score:fixture.run.totalScore,stagesCleared:fixture.run.stagesCleared,inputType:'touch',outfit:wearables,completedAt:1000};
 const checkpoint=makeRecovery(fixture);assert.deepEqual(checkpoint.resultSnapshot.outfit.appearance,DEFAULT_APPEARANCE);
 delete checkpoint.resultSnapshot.outfit.appearance;const before=structuredClone(checkpoint.run),restored=readRecovery(checkpoint);
 assert.equal(restored.ok,true);assert.deepEqual(restored.value.resultSnapshot.outfit.appearance,DEFAULT_APPEARANCE);assert.deepEqual(restored.value.run,before);assert.equal(restored.value.submission,null);
 checkpoint.resultSnapshot.outfit.appearance=appearance;assert.deepEqual(readRecovery(checkpoint).value.resultSnapshot.outfit.appearance,appearance);
});

test('character appearance never enters playtest events',async()=>{
 let index=0;const events=[],uuid=()=>`00000000-0000-4000-8000-${String(++index).padStart(12,'0')}`;
 const consent=createConsent({storage:createStorage(memory()),uuid});const session=createPlaytestSession({config:{enabled:true,buildId:'character-test'},consent,uuid,width:()=>390,send:async batch=>{events.push(...batch);return true;}});
 session.setConsent('accepted');const run={id:uuid(),mode:'rush',themeId:'forest-freakout',outfit:{...wearables,appearance},stagesCleared:1,totalScore:10};
 session.start(run);session.stageStart(0);session.finishStage(0,{score:10,qualified:true,outfit:run.outfit});session.end(run);await session.flush();
 assert.ok(events.length>0);assert.doesNotMatch(JSON.stringify(events),/appearance|skinTone|mycelium|locs/);
});
