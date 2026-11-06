import test from 'node:test';import assert from 'node:assert/strict';
import {renderReward} from '../src/progression-view.js';
import {createStorage} from '../src/storage.js';import {PROFILE_KEY} from '../src/profile.js';import {makeRecovery} from '../src/recovery.js';import {recoveryFixture} from './helpers/recovery-fixtures.mjs';
const memory=()=>{const data=new Map();let fail=false;return {data,getItem:k=>data.get(k)??null,setItem(k,v){if(fail)throw Error('quota');data.set(k,v)},fail(v){fail=v}}};
test('stage award and checkpoint survive together and quota failure leaves the previous pair intact',()=>{
 const mem=memory(),s=createStorage(mem),old=makeRecovery(recoveryFixture());s.saveRecovery(old);const before=mem.data.get(PROFILE_KEY);mem.fail(true);
 const next={...old,savedAt:2000},r=s.commitStage({id:`${old.run.id}:0`,pickups:10,qualified:true},next);assert.equal(r.persisted,false);assert.equal(mem.data.get(PROFILE_KEY),before);
 mem.fail(false);s.saveRecovery(next);const restored=createStorage(mem);assert.equal(restored.profile.progress.xp,70);assert.equal(restored.recovery.savedAt,2000);
 assert.equal(restored.commitStage({id:`${old.run.id}:0`,pickups:10,qualified:true},next).xp,0);assert.equal(restored.profile.progress.xp,70);
});
test('malformed recovery preserves wardrobe/progression and local score plus result checkpoint are one write',()=>{
 const mem=memory(),s=createStorage(mem);s.saveRecovery({version:999});const loaded=createStorage(mem);assert.equal(loaded.recovery.version,999);assert.equal(loaded.best,0);
 const cp=makeRecovery(recoveryFixture()),entry={id:cp.run.id,score:30,stagesCleared:0,initials:'ABC',completedAt:1};
 assert.equal(loaded.commitScore('endless',entry,cp).accepted,true);const again=createStorage(mem);assert.equal(again.profile.boards.endless.length,1);assert.equal(again.recovery.run.id,cp.run.id);assert.equal(again.commitScore('endless',entry,cp).accepted,false);
 again.saveRecovery(null);assert.equal(createStorage(mem).recovery,null);assert.equal(createStorage(mem).profile.boards.endless.length,1);
});

test('a durably committed reward reports durable progress after abrupt reload without a second checkpoint',()=>{
 const mem=memory(),s=createStorage(mem),value=makeRecovery(recoveryFixture());value.progressReward={xp:40,rewards:[]};s.commitStage({id:'stage',pickups:10},value);
 const restored=createStorage(mem).recovery.progressReward;assert.equal(restored.persisted,true);assert.doesNotMatch(renderReward(restored),/storage unavailable/);
});
