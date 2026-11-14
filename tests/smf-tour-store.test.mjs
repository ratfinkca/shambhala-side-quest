import test from 'node:test';
import assert from 'node:assert/strict';
import {createTourStore,normalizeTourProfile} from '../src/smf-tour/store.js';
import {BONUSES,ROUTE,createTourProfile,createFestival,collectInvitation,finishMain,stageForRun,choosePerk,beginBonus,finishBonus,returnBonus,closeResults} from '../src/smf-tour/model.js';
import {smfPreviewStage} from '../src/editions/smf-stages.js';
import {bonusConfig,bonusController} from '../src/smf-tour/content.js';
import {createRound,collect,advanceRound} from '../src/game.js';
import {createEncounter,awardClosePass} from '../src/festival.js';
import {createCrowdFriendships} from '../src/crowd-friendship.js';
import {rulesFor} from '../src/run.js';
import {activateFlow} from '../src/flow.js';
import {collectMystery,createMystery} from '../src/mystery.js';
import {createBass,activateBass} from '../src/bass-head.js';
import {registerHooks} from 'node:module';
import {invitedBonusVisit,legacyExploreVisit} from './fixtures/smf-bonus-profile.mjs';
import {PRISM_ZONES,createPrismPractice} from '../src/prism-practice/model.js';

registerHooks({resolve(s,c,next){return s==='phaser'?{url:'test:smf-store-phaser',shortCircuit:true}:next(s,c);},load(url,c,next){return url==='test:smf-store-phaser'?{format:'module',source:'export default {Scene: class {}}',shortCircuit:true}:next(url,c);}});
const {GameScene}=await import('../src/GameScene.js');

function graphic(x=0,y=0){let p;return p=new Proxy({x,y,setPosition(a,b){this.x=a;this.y=b;return p;}},{get(o,k){return k in o?o[k]:()=>p;}});}
function gameScene(){
 const scene=new GameScene(),art=graphic(),crowd={configure(stage){this.people=stage.crowdAnchors.map(()=>({encounter:createEncounter()}));},reset(){},restoreRecovery(value){this.people=value.map(encounter=>({encounter:structuredClone(encounter)}));}};
 Object.assign(scene,{background:{show(){},update(){},fireflies:[]},crowd,avatar:{art,setPosition:art.setPosition},bassFeedback:art,halo:art,dropWash:art,dancer:graphic(),sparks:Array.from({length:12},()=>Object.assign(graphic(450,400),{art})),flowPickup:graphic(),effects:{clear(){}},tweens:{killAll(){},pauseAll(){},resumeAll(){}},input:{keyboard:{resetKeys(){}}},mysteryView:{reset(){},update(){},pickup:graphic(),placed:false},game:{events:{emit(){}}},reducedMotion:true});
 scene.placeSpark=()=>{};return scene;
}

const KEY='sidequest.smf.profile.v1';
function memory(){const data=new Map();return {data,getItem:key=>data.get(key)??null,setItem:(key,value)=>data.set(key,value)};}
function snapshot(stage,id,{scoringVersion=null,perks=[]}={}){
 const {rules,...round}=createRound(rulesFor(perks,scoringVersion),stage.timingId);
 round.runId=id;round.sincePickupMs=null;
 return {round,player:{...stage.spawn},sparks:Array.from({length:12},()=>({x:450,y:400})),candy:{placed:false,x:0,y:0},crowd:stage.crowdAnchors.map(()=>createEncounter())};
}
function playing(){
 const profile=createFestival(createTourProfile(),'tour-123');
 profile.active.scene=snapshot(stageForRun(profile.active),profile.active.id,profile.active);
 return profile;
}

test('SMF checkpoints retain stamina and accept older snapshots without it',()=>{
 const profile=playing(),store=createTourStore(memory());profile.active.scene.round.stamina=31.25;
 assert.equal(store.write(profile),true);assert.equal(store.read().active.scene.round.stamina,31.25);
 delete profile.active.scene.round.stamina;assert.equal(store.write(profile),true);
 for(const value of [-1,101,NaN,'50']){profile.active.scene.round.stamina=value;assert.equal(store.write(profile),false);}
});

test('SMF storage commits ownership and checkpoint together without reading or changing generic data',()=>{
 const mem=memory();mem.setItem('sidequest.profile.v1','generic profile bytes');mem.setItem('sidequest.best','999');
 const store=createTourStore(mem);assert.equal(store.read().progress.xp,0);
 const profile=playing();profile.discoveries=['rabbit-hole'];profile.rewards=['rabbit-ears'];profile.souvenir='rabbit-ears';
 assert.equal(store.write(profile),true);
 const loaded=createTourStore(mem).read();
 assert.deepEqual(loaded.active.scene,profile.active.scene);assert.deepEqual(loaded.rewards,['rabbit-ears']);assert.equal(loaded.souvenir,'rabbit-ears');
 assert.equal(mem.getItem('sidequest.profile.v1'),'generic profile bytes');assert.equal(mem.getItem('sidequest.best'),'999');
 loaded.active.scene.player.x=1;assert.notEqual(store.read().active.scene.player.x,1);
});

test('unknown ownership and unowned selections never become equipped permanent rewards',()=>{
 const profile=createTourProfile();profile.discoveries=['rabbit-hole','fake','rabbit-hole'];profile.rewards=['rabbit-ears','root-access','rabbit-ears'];profile.souvenir='cheese-totem';
 const result=normalizeTourProfile(profile);
 assert.deepEqual(result.discoveries,['rabbit-hole']);assert.deepEqual(result.rewards,['rabbit-ears']);assert.equal(result.souvenir,null);
 assert.equal(normalizeTourProfile({version:999,rewards:['rabbit-ears']}).rewards.length,0);
});

test('a reward without its matching discovery cannot survive as owned or equipped',()=>{
 const profile=createTourProfile();profile.rewards=['cheese-totem','rabbit-ears'];profile.discoveries=['rabbit-hole'];profile.souvenir='cheese-totem';
 const result=normalizeTourProfile(profile);assert.deepEqual(result.rewards,['rabbit-ears']);assert.equal(result.souvenir,null);
});

test('corrupt active scenes are discarded while safe ownership and progress survive',()=>{
 const changes=[p=>p.active.scene.player.x=NaN,p=>p.active.scene.round.timingId='generic-60-v1',p=>p.active.scene.round.remainingMs=1e9,p=>p.active.scene.crowd.pop(),p=>p.active.scene.round.bass.activeMs=-1,p=>p.active.stageIndex=6,p=>p.active.scene.extra={anything:true}];
 for(const change of changes){const profile=playing();profile.rewards=['rabbit-ears'];profile.discoveries=['rabbit-hole'];profile.progress.xp=321;change(profile);const result=normalizeTourProfile(profile);assert.equal(result.active,null);assert.deepEqual(result.rewards,['rabbit-ears']);assert.equal(result.progress.xp,321);}
});

test('failed writes and invalid snapshots keep the previous complete record',()=>{
 const mem=memory(),store=createTourStore(mem),profile=playing();assert.equal(store.write(profile),true);const before=mem.getItem(KEY);
 const bad=structuredClone(profile);bad.active.scene.round.remainingMs=-1;assert.equal(store.write(bad),false);assert.equal(mem.getItem(KEY),before);
 mem.setItem=()=>{throw Error('quota')};profile.rewards=['rabbit-ears'];assert.equal(store.write(profile),false);assert.equal(mem.getItem(KEY),before);assert.deepEqual(store.read().rewards,[]);
 const unavailable=createTourStore({getItem(){throw Error('blocked')},setItem(){throw Error('blocked')}});assert.equal(unavailable.read().active,null);assert.equal(unavailable.write(createTourProfile()),false);
});

test('oversized or cyclic records cannot replace an existing save',()=>{
 const mem=memory(),store=createTourStore(mem),profile=playing();assert.equal(store.write(profile),true);const before=mem.getItem(KEY);
 profile.active.scene.round.runId='x'.repeat(3*1024*1024);assert.equal(store.write(profile),false);assert.equal(mem.getItem(KEY),before);
 profile.active.scene.round.runId=profile;assert.equal(store.write(profile),false);assert.equal(mem.getItem(KEY),before);
 mem.data.set(KEY,'{broken');assert.equal(store.read().active,null);
});

test('all five bonus activities preserve legacy Explore checkpoints without reopening catalogue entry',()=>{
 for(const bonus of BONUSES.filter(b=>b.id!=='prism-party')){
  const profile=legacyExploreVisit(bonus.id,`visit-${bonus.id}`);
  const config=bonusConfig(bonus.id),controller=bonusController(config);controller.start();
  profile.active.bonus.activity=controller.capture();profile.active.bonus.scene=snapshot(config.stage,profile.active.bonus.visitId);
  const store=createTourStore(memory());assert.equal(store.write(profile),true,bonus.id);const restored=store.read();
  assert.equal(restored.active.bonus.returnTo,'title');assert.deepEqual(restored.active.bonus.activity,profile.active.bonus.activity);
  assert.equal(bonusController(config).restore(restored.active.bonus.activity),true);
  profile.active.bonus.activity.state.untrusted=true;assert.equal(normalizeTourProfile(profile).active,null,'controller rejects malformed state');
 }
});

function prismAdvance(practice,milliseconds,zone=null){
 for(let remaining=milliseconds;remaining>0;remaining-=Math.min(50,remaining)){
  const deltaMs=Math.min(50,remaining),previous=zone===null?{x:480,y:475}:PRISM_ZONES[zone].center;
  practice.step({previous,player:zone===null?previous:{x:previous.x+deltaMs/25,y:previous.y},deltaMs});
 }
}
function prismCheckpoint({celebrating=false,complete=false,long=false}={}){
 const profile=invitedBonusVisit('prism-party','saved-prism'),practice=createPrismPractice();practice.start();
 practice.step({previous:{x:480,y:500},player:{x:480,y:498},deltaMs:20});
 if(celebrating||complete){
  prismAdvance(practice,3000,0);prismAdvance(practice,5000);prismAdvance(practice,3000,1);prismAdvance(practice,5000);prismAdvance(practice,3000,2);
  prismAdvance(practice,complete?3500:1250);
 }else{prismAdvance(practice,1250,0);if(long)prismAdvance(practice,90000);}
 const scene=snapshot(bonusConfig('prism-party').stage,'saved-prism');
 scene.player={x:480,y:475};scene.round.remainingMs=64000-(practice.state.partyMs+practice.state.celebrationMs)%64000;
 scene.round.mystery.elapsedMs=64000-scene.round.remainingMs;
 profile.active.bonus.scene=scene;profile.active.bonus.activity=practice.capture();
 return complete?finishBonus(profile,{won:true,completed:true}):profile;
}

test('Prism checkpoints preserve the spent invitation and parked run across partial, looped and finale recovery',()=>{
 for(const options of [{},{long:true},{celebrating:true},{complete:true}]){
  const profile=prismCheckpoint(options),store=createTourStore(memory());
  assert.equal(store.write(profile),true,JSON.stringify(options));const loaded=store.read();
  assert.deepEqual(loaded.active,profile.active);assert.equal(loaded.active.summary.bonusOffered,false);
  assert.equal(loaded.active.score,200);assert.equal(loaded.active.cleared,2);
  const controller=createPrismPractice();assert.equal(controller.restore(loaded.active.bonus.activity),true);
  assert.equal(controller.status,options.complete?'complete':'paused');
  assert.deepEqual(controller.state,profile.active.bonus.activity.state);
 }
});

test('Prism rejects impossible scene positions, mismatched clocks and forged wins without replacing the parked save',()=>{
 const profile=prismCheckpoint(),mem=memory(),store=createTourStore(mem);
 assert.equal(store.write(profile),true);const saved=mem.getItem(KEY);
 const changes=[
  p=>p.active.bonus.scene.player={x:200,y:520},
  p=>{p.active.bonus.scene.round.remainingMs-=1;p.active.bonus.scene.round.mystery.elapsedMs+=1;},
  p=>{p.active.bonus.scene.round.remainingMs=0;p.active.bonus.scene.round.ended=true;p.active.bonus.scene.round.mystery.elapsedMs=64000;},
  p=>Object.assign(p.active.bonus,{status:'result',completed:true,won:true,rewardId:'prism-crown',newReward:true}),
  p=>Object.assign(p.active.bonus,{status:'result',completed:false,won:false,rewardId:'prism-crown',newReward:true}),
  p=>{p.active.bonus.activity=null;p.active.bonus.scene=null;Object.assign(p.active.bonus,{status:'result',completed:true,won:true,rewardId:'prism-crown',newReward:true});},
 ];
 for(const change of changes){const bad=structuredClone(profile);change(bad);assert.equal(store.write(bad),false);assert.equal(mem.getItem(KEY),saved);}
 const completed=prismCheckpoint({complete:true});completed.active.bonus.won=false;
 assert.equal(store.write(completed),false);assert.equal(mem.getItem(KEY),saved);
 const exited=finishBonus(profile);assert.equal(store.write(exited),true);
 assert.deepEqual(store.read().rewards,[]);assert.equal(store.read().active.bonus.rewardId,null);
});

test('empty and original five-bonus profiles remain valid after adding the Prism Crown',()=>{
 const store=createTourStore(memory());assert.equal(store.write(createTourProfile()),true);
 assert.deepEqual(store.read().discoveries,[]);assert.deepEqual(store.read().rewards,[]);
 const old=createTourProfile();old.discoveries=['rabbit-hole','secret-garden','amp-backstage','ikigai-mori','villagio'];
 old.rewards=['rabbit-ears','glow-blossom','cheese-totem','lantern-totem','golden-chicken'];old.souvenir='golden-chicken';
 assert.equal(store.write(old),true);assert.deepEqual(store.read().rewards,old.rewards);assert.equal(store.read().souvenir,'golden-chicken');
 const owned=prismCheckpoint({complete:true});assert.equal(store.write(owned),true);
 assert.deepEqual(store.read().rewards,['prism-crown']);assert.equal(store.read().souvenir,'prism-crown');
});

test('partial bonus checkpoints cannot reset an activity or its remaining time on reload',()=>{
 const profile=invitedBonusVisit('secret-garden','garden-visit');
 const config=bonusConfig('secret-garden'),controller=bonusController(config);controller.start();controller.step({player:config.points[0]});controller.pause();
 const scene=snapshot(config.stage,'garden-visit');scene.round.remainingMs-=12000;scene.round.mystery.elapsedMs=12000;
 profile.active.bonus.scene=scene;profile.active.bonus.activity=controller.capture();
 const restored=normalizeTourProfile(profile);assert.equal(restored.active.bonus.scene.round.remainingMs,45600);assert.equal(restored.active.bonus.activity.state.carrying,'seed-1');
 for(const field of ['scene','activity']){const corrupt=structuredClone(profile);corrupt.active.bonus[field]=null;assert.equal(normalizeTourProfile(corrupt).active,null,field);}
});

test('a summary cannot offer a missing or undiscovered bonus, and entered visits retain consumed entry on reload',()=>{
 let profile=collectInvitation(createFestival(createTourProfile(),'invitation-run'));
 const round=createRound({},smfPreviewStage('smf-living-room').timingId);while(round.pickups<23)collect(round);advanceRound(round,round.remainingMs);profile=finishMain(profile,round);
 for(const mutate of [p=>p.active.summary.bonusId=null,p=>p.discoveries=[],p=>p.active.summary.qualified=false]){const corrupt=structuredClone(profile);mutate(corrupt);assert.equal(normalizeTourProfile(corrupt).active,null);}
 profile=beginBonus(profile,'rabbit-hole','rabbit-visit');
 assert.equal(profile.active.summary.bonusOffered,false);
 const store=createTourStore(memory());assert.equal(store.write(profile),true);
 const loaded=store.read();assert.equal(loaded.active.summary.bonusOffered,false);assert.equal(loaded.active.bonus.visitId,'rabbit-visit');
 const back=returnBonus(loaded);assert.equal(beginBonus(back,'rabbit-hole','reuse-after-reload'),back);
 assert.equal(store.write(back),true);assert.equal(store.read().active.summary.bonusOffered,false);
});

test('pre-change entered visits consume their legacy offer without losing the visit or mutating the saved source',()=>{
 const profile=invitedBonusVisit('rabbit-hole','legacy-entered');
 profile.active.summary.bonusOffered=true;
 const before=structuredClone(profile),loaded=normalizeTourProfile(profile);
 assert.ok(loaded.active);assert.equal(loaded.active.bonus.visitId,'legacy-entered');
 assert.equal(loaded.active.summary.bonusOffered,false);assert.deepEqual(profile,before);
});

test('an already-offered saved invitation survives the update once, then is consumed',()=>{
 const profile=invitedBonusVisit('rabbit-hole','offered-before-update');
 profile.active.bonus=null;profile.active.summary.bonusOffered=true;
 const loaded=normalizeTourProfile(profile);assert.ok(loaded.active);
 const entered=beginBonus(loaded,'rabbit-hole','after-update');assert.equal(entered.active.summary.bonusOffered,false);
 const returned=returnBonus(entered);assert.equal(beginBonus(returned,'rabbit-hole','cannot-repeat'),returned);
});

test('the final Village detour restores earned Festival completion and returns to final results',()=>{
 const store=createTourStore(memory());let profile=createFestival(createTourProfile(),'whole-festival');
 for(const stageId of ROUTE){
  const stage=stageForRun(profile.active);profile.active.scene=snapshot(stage,profile.active.id,profile.active);assert.equal(store.write(profile),true,stageId);
  profile=collectInvitation(profile);const round=createRound({},stage.timingId);round.runId=profile.active.id;
  while(round.pickups<stage.target)collect(round);advanceRound(round,round.remainingMs);
  profile=finishMain(profile,round);assert.equal(store.write(profile),true,stageId+' summary');
  if(stageId!=='smf-village')profile=choosePerk(profile,null);
 }
 const mainScore=profile.active.score;
 profile=beginBonus(profile,'villagio','final-village-visit');assert.equal(store.write(profile),true);
 profile=store.read();assert.equal(profile.active.bonus.returnTo,'results');assert.equal(profile.active.cleared,6);assert.equal(profile.active.stageIndex,5);
 profile=finishBonus(profile,{completed:false,won:false});assert.equal(store.write(profile),true);
 profile=returnBonus(store.read());assert.equal(profile.active.status,'results');assert.equal(profile.active.score,mainScore);assert.equal(profile.active.cleared,6);
 profile=closeResults(profile);assert.equal(store.write(profile),true);assert.equal(store.read().lastResult.completed,true);assert.equal(store.read().active,null);
});

test('real GameScene recovery preserves fractional time, long Flow, Wavy Colours and partial Bass Head while paused',()=>{
 const stage=smfPreviewStage('smf-living-room'),profile=createFestival(createTourProfile(),'live-snapshot');profile.active.perks=['moth','encore','sweet','battery'];
 const rules=rulesFor(profile.active.perks,profile.active.scoringVersion),scene=gameScene();scene.startRound({stage,rules,runId:profile.active.id,timingId:stage.timingId});
 scene.round.mystery=createMystery(()=>0,{rules,durationMs:scene.round.remainingMs});advanceRound(scene.round,12000.25);
 assert.equal(activateFlow(scene.round),true);assert.equal(scene.round.flowMs,10000);assert.equal(collectMystery(scene.round,()=>.99),'waves');assert.equal(scene.round.mystery.effectMs,7000);
 scene.round.bass=createBass(5000);assert.equal(activateBass(scene.round),true);collect(scene.round);
 profile.active.scene=scene.captureRecovery();const before=structuredClone(profile.active.scene),store=createTourStore(memory());
 assert.equal(store.write(profile),true);assert.equal(store.read().active.scene.round.remainingMs,56570.75);
 const restored=gameScene();restored.restoreRecovery(store.read().active.scene,{stage,rules,outfit:profile.outfit});
 assert.equal(restored.running,false);restored.update(60000,5000);assert.deepEqual(restored.captureRecovery(),before);
 restored.resumeRound();assert.equal(restored.running,true);advanceRound(restored.round,250);
 assert.equal(restored.round.remainingMs,56320.75);assert.equal(restored.round.flowMs,9750);assert.equal(restored.round.mystery.effectMs,6750);
});

test('legacy six-dancer Garden and Ikigai visits keep checkpoint and ownership as crowds expand',()=>{
 for(const id of ['secret-garden','ikigai-mori']){
  const p=legacyExploreVisit(id,'legacy-visit');p.rewards=[BONUSES.find(b=>b.id===id).reward.id];
  const config=bonusConfig(id),practice=bonusController(config);practice.start();
  p.active.bonus.activity=practice.capture();p.active.bonus.activity.version=1;
  delete p.active.bonus.activity.state.blockedEncounterIds;delete p.active.bonus.activity.state.passEventIds;
  p.active.bonus.scene=snapshot(config.stage,'legacy-visit');p.active.bonus.scene.crowd=p.active.bonus.scene.crowd.slice(0,6);
  p.active.bonus.scene.round.remainingMs-=1234;p.active.bonus.scene.round.mystery.elapsedMs=1234;const before=structuredClone(p),loaded=normalizeTourProfile(p);
  assert.ok(loaded.active);assert.equal(loaded.active.bonus.scene.crowd.length,config.stage.crowdAnchors.length);
  assert.equal(loaded.active.bonus.scene.round.remainingMs,before.active.bonus.scene.round.remainingMs);
  assert.deepEqual(loaded.rewards,p.rewards);assert.deepEqual(p,before,'normalizing does not mutate source data');
  const restored=bonusController(config);assert.equal(restored.restore(loaded.active.bonus.activity),true);assert.equal(restored.status,'paused');
 }
});

function addFriendships(scene){
 scene.round.rules=rulesFor([]);for(let i=0;i<9;i++)awardClosePass(scene.round);delete scene.round.rules;
 scene.crowd.forEach((encounter,index)=>{encounter.friendPasses=index===0?3:index===1?4:0;});
 return scene;
}
function friendshipProfiles(){
 const main=playing();addFriendships(main.active.scene);
 const profiles=[{label:'main',profile:main,getScene:p=>p.active.scene}];
 for(const bonus of BONUSES){
  const profile=invitedBonusVisit(bonus.id,`friends-${bonus.id}`);
  const config=bonusConfig(bonus.id),controller=bonusController(config);controller.start();controller.pause();
  profile.active.bonus.activity=controller.capture();
  profile.active.bonus.scene=addFriendships(snapshot(config.stage,profile.active.bonus.visitId));
  profiles.push({label:bonus.id,profile,getScene:p=>p.active.bonus.scene});
 }
 return profiles;
}

test('SMF main and bonus checkpoints roundtrip third-pass and complete friendships',()=>{
 for(const {label,profile,getScene} of friendshipProfiles()){
  const store=createTourStore(memory()),before=structuredClone(profile);
  assert.equal(store.write(profile),true,label);
  const loaded=store.read(),scene=getScene(loaded);
  assert.deepEqual(scene,getScene(before),label);assert.deepEqual(profile,before,'saving does not mutate the live scene');
  const people=scene.crowd.map((_,index)=>({id:`dancer-${index}`}));
  const friends=createCrowdFriendships(people,{passes:scene.crowd.map(e=>e.friendPasses??0)});
  assert.equal(friends.get('dancer-0').radius,4.5,label);assert.equal(friends.get('dancer-1').isFriend,true,label);
  assert.equal(friends.record([{id:'dancer-0',closePass:true}])[0].befriended,true,label);
  assert.equal(scene.crowd[0].friendPasses,3,'model progress cannot modify a saved snapshot');
  if(loaded.active.bonus){
   const config=bonusConfig(label),controller=bonusController(config);
   assert.equal(controller.restore(loaded.active.bonus.activity),true,label);assert.equal(controller.status,'paused',label);
  }
 }
});

test('SMF main and bonus snapshots reject malformed or unearned friendship counts without overwriting saves',()=>{
 for(const {label,profile,getScene} of friendshipProfiles()){
  const mem=memory(),store=createTourStore(mem);assert.equal(store.write(profile),true,label);const before=mem.getItem(KEY);
  for(const friendPasses of [-1,5,1.5,'3',null,undefined,NaN,Infinity]){
   const bad=structuredClone(profile);getScene(bad).crowd[0].friendPasses=friendPasses;
   assert.equal(store.write(bad),false,`${label}: ${String(friendPasses)}`);assert.equal(normalizeTourProfile(bad).active,null,label);
   assert.equal(mem.getItem(KEY),before,label);
  }
  const unearned=structuredClone(profile);getScene(unearned).crowd[2].friendPasses=4;
  assert.equal(store.write(unearned),false,`${label}: more friendship passes than scored passes`);
  assert.equal(mem.getItem(KEY),before,label);
 }
});

test('SMF main and bonus legacy or partially populated friendship checkpoints stay compatible',()=>{
 for(const {label,profile,getScene} of friendshipProfiles()){
  const scene=getScene(profile);for(const encounter of scene.crowd)delete encounter.friendPasses;
  const store=createTourStore(memory());assert.equal(store.write(profile),true,label);
  assert.ok(store.read().active,label);
  scene.crowd[0].friendPasses=3;assert.equal(store.write(profile),true,label);
  const restored=getScene(store.read());assert.equal(restored.crowd[0].friendPasses,3,label);
  assert.equal(Object.hasOwn(restored.crowd[1],'friendPasses'),false,label);
 }
});
