import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeProgress,awardStage,requirement,availablePerks} from '../src/progression.js';
import {createStorage} from '../src/storage.js';
import {createRun,upgradeChoices} from '../src/run.js';
const memory=(data={})=>({getItem:k=>data[k]??null,setItem:(k,v)=>{data[k]=v}});
test('new saves lock expanded wardrobe; existing saves preserve every old piece and settings',()=>{
 const fresh=createStorage(memory());assert.equal(fresh.profile.progress.legacyWardrobe,false);
 assert.equal(fresh.saveOutfit({onesie:'cosmic'}).accepted,false);
 const old=createStorage(memory({'sidequest.profile.v1':JSON.stringify({version:1,outfit:{onesie:'cosmic',hat:'cat',totem:'ufo'},audio:{enabled:false}})}));
 assert.equal(old.profile.progress.legacyWardrobe,true);assert.equal(old.sound,false);
 assert.equal(requirement(old.profile.progress,'totem:ufo'),null);
 assert.notEqual(requirement(old.profile.progress,'flair:prism'),null);
 old.saveOutfit(old.profile.outfit);assert.equal(old.profile.outfit.onesie,'cosmic');
});
test('completed stages reward failed qualification and deduplicate across reload',()=>{
 const raw=memory(),s=createStorage(raw),stage={id:'run:0',pickups:12,passes:2};
 const result=s.awardProgress(stage);assert.equal(result.xp,54);assert.equal(result.persisted,true);
 const again=createStorage(raw);assert.equal(again.awardProgress(stage).xp,0);assert.equal(again.profile.progress.xp,54);
 assert.equal(again.profile.progress.totals.stages,0);
});
test('achievements and ranks unlock rewards once, with no power from cosmetics',()=>{
 const initial=normalizeProgress();const result=awardStage(initial,{id:'one',pickups:50,passes:25,flows:10,bass:5,qualified:true,festivalComplete:true});
 assert.ok(result.rewards.includes('onesie:cosmic'));assert.ok(result.rewards.includes('flair:stardust'));
 assert.equal(requirement(result.progress,'flair:stardust'),null);
 assert.deepEqual(awardStage(result.progress,{id:'one'}).rewards,[]);
 assert.equal(initial.xp,0);
});
test('corrupt progress normalizes; blocked storage retains session progress; ranks expand perk choices',()=>{
 const bad=normalizeProgress({xp:Infinity,totals:{passes:-3},receipts:['ok',3]});assert.equal(bad.xp,0);assert.equal(bad.totals.passes,0);
 const s=createStorage({getItem(){return null},setItem(){throw Error('blocked')}});assert.equal(s.awardProgress({id:'one',pickups:50}).persisted,false);assert.equal(s.profile.progress.xp,120);
 assert.deepEqual(availablePerks(normalizeProgress()),['boots','bracelet']);
 const run=createRun('festival','run');run.status='upgrade';run.availablePerks=availablePerks(s.profile.progress);assert.ok(upgradeChoices(run).includes('noodle'));assert.ok(!upgradeChoices(run).includes('moth'));
 assert.equal(availablePerks(normalizeProgress({legacyWardrobe:true})).length,4);
});

test('zero-score legacy players keep wardrobe and perks',()=>{const s=createStorage(memory({'sidequest.best':'0'}));assert.equal(s.profile.progress.legacyWardrobe,true);assert.equal(availablePerks(s.profile.progress).length,4);});
