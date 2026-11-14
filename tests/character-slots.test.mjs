import test from 'node:test';
import assert from 'node:assert/strict';
import {createStorage} from '../src/storage.js';
import {normalizeOutfit} from '../src/wardrobe.js';
import * as model from '../src/smf-tour/model.js';
import {createTourStore,normalizeTourProfile} from '../src/smf-tour/store.js';
const memory=()=>{const values=new Map();return {getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,v)};};

test('both editions start with empty names and four device-local character slots',()=>{
 for(const profile of [createStorage(memory()).profile,model.createTourProfile()]){assert.equal(profile.playerName,'');assert.deepEqual(profile.characterSlots,[null,null,null,null]);}
});
test('generic slots load a saved name and appearance without replacing shared progress or scores',()=>{
 const data=memory(),s=createStorage(data);assert.equal(s.savePlayerName('  Moon   Dancer ').accepted,true);
 const first=normalizeOutfit({appearance:{face:'grin',hair:'locs',skinTone:'rich'}});s.saveOutfit(first);
 assert.equal(s.saveCharacterSlot(2).persisted,true);s.awardProgress({id:'earned',pickups:5});s.savePlayerName('Second Name');s.saveOutfit({appearance:{hair:'crop'}});
 const before=s.profile;assert.equal(s.loadCharacterSlot(2).accepted,true);
 assert.equal(s.profile.playerName,'Moon Dancer');assert.deepEqual(s.profile.outfit,first);assert.deepEqual(s.profile.progress,before.progress);assert.deepEqual(s.profile.boards,before.boards);
 const reloaded=createStorage(data);assert.equal(reloaded.profile.characterSlots[2].id,2);assert.equal(reloaded.profile.playerName,'Moon Dancer');
 assert.equal(reloaded.deleteCharacterSlot(2).persisted,true);assert.equal(createStorage(data).profile.characterSlots[2],null);assert.equal(reloaded.profile.playerName,'Moon Dancer');
});
test('invalid names and slot IDs are no-ops, and blocked storage keeps session changes',()=>{
 const s=createStorage({getItem(){return null;},setItem(){throw Error('blocked');}});
 assert.equal(s.saveCharacterSlot(0).accepted,false);assert.equal(s.savePlayerName('f_u_c_k').accepted,false);assert.equal(s.profile.playerName,'');
 assert.deepEqual(s.savePlayerName('Good Name'),{accepted:true,persisted:false});
 assert.deepEqual(s.saveCharacterSlot(0),{accepted:true,persisted:false});
 for(const id of [-1,4,'0',0.5,null])assert.equal(s.saveCharacterSlot(id).accepted,false);
 s.savePlayerName('Other Name');assert.deepEqual(s.loadCharacterSlot(0),{accepted:true,persisted:false});assert.equal(s.profile.playerName,'Good Name');
 assert.equal(s.loadCharacterSlot(1).accepted,false);assert.deepEqual(s.deleteCharacterSlot(0),{accepted:true,persisted:false});
});
test('malformed slots cannot equip locked cosmetics or unowned souvenirs',()=>{
 const slot={id:1,name:'Saved Name',outfit:{onesie:'cosmic',hat:'cat',totem:'ufo',flair:'aurora',appearance:{hair:'locs'}},souvenir:'golden-chicken'};
 const raw={version:1,playerName:'<svg>',characterSlots:[null,slot,{id:2,name:'f_u_c_k'},null],progress:{legacyWardrobe:false}};
 const data=memory();data.setItem('sidequest.profile.v1',JSON.stringify(raw));const s=createStorage(data);
 assert.equal(s.profile.playerName,'');assert.equal(s.profile.characterSlots[2],null);assert.equal(s.loadCharacterSlot(1).accepted,true);
 for(const key of ['onesie','hat','totem','flair'])assert.equal(s.profile.outfit[key],normalizeOutfit()[key]);assert.equal(s.profile.outfit.appearance.hair,'locs');assert.equal(s.profile.characterSlots[1].souvenir,null);
 const p=normalizeTourProfile(raw);assert.equal(p.characterSlots[1].souvenir,null);assert.equal(p.characterSlots[1].outfit.onesie,'lime');
});
test('SMF pure character transitions preserve shared progress and reload earned souvenirs',()=>{
 let p=model.createTourProfile();p.discoveries=['rabbit-hole'];p.rewards=['rabbit-ears'];p.souvenir='rabbit-ears';
 const original=p;p=model.setTourPlayerName(p,'Tour Name');assert.notEqual(p,original);assert.equal(original.playerName,'');
 p=model.saveTourCharacterSlot(p,3);p=model.setTourPlayerName(p,'Another');p.souvenir=null;p.progress.xp=250;
 const store=createTourStore(memory());assert.equal(store.write(p),true);p=store.read();const progress=structuredClone(p.progress);
 p=model.loadTourCharacterSlot(p,3);assert.equal(p.playerName,'Tour Name');assert.equal(p.souvenir,'rabbit-ears');assert.deepEqual(p.progress,progress);
 assert.equal(model.setTourPlayerName(p,'f_u_c_k'),p);assert.equal(model.saveTourCharacterSlot(p,4),p);
 p=model.deleteTourCharacterSlot(p,3);assert.equal(p.characterSlots[3],null);assert.equal(p.playerName,'Tour Name');
});
test('SMF slots retain Mycelium earned across all six SMF venues without generic layout credit',()=>{
 let p=model.createTourProfile();p.playerName='Forest Dancer';p.progress.endless.smfVenues=[...model.ROUTE];p.outfit=normalizeOutfit({onesie:'mycelium'});
 p=model.saveTourCharacterSlot(p,0);assert.equal(p.characterSlots[0].outfit.onesie,'mycelium');p.outfit=normalizeOutfit();
 const restored=normalizeTourProfile(p);assert.equal(model.loadTourCharacterSlot(restored,0).outfit.onesie,'mycelium');
 const notEarned=structuredClone(p);notEarned.progress.endless.smfVenues=model.ROUTE.slice(0,5);assert.equal(normalizeTourProfile(notEarned).characterSlots[0].outfit.onesie,'lime');
});
