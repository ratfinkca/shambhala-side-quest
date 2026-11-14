import test from 'node:test';
import assert from 'node:assert/strict';
import {registerHooks} from 'node:module';
import {EventEmitter} from 'node:events';
import {BONUSES,createTourProfile,createFestival,beginBonus,returnBonus,collectInvitation,endFestival,closeResults} from '../src/smf-tour/model.js';
import {invitedBonusVisit,legacyExploreVisit} from './fixtures/smf-bonus-profile.mjs';
import {createTourStore} from '../src/smf-tour/store.js';
import {bonusConfig,INVITATIONS} from '../src/smf-tour/content.js';
import {createAvatar} from '../src/Avatar.js';
import {Crowd} from '../src/Crowd.js';
import {createCrowdSocial} from '../src/crowd-social.js';
import {crowdPosition} from '../src/festival.js';
import {elapsedMs,roundTiming} from '../src/stage-clock.js';
import {getTiming} from '../src/stage-clock.js';
import {createSMFStageView} from '../src/editions/smf-stage-view.js';
import {createAMPBackstageView} from '../src/amp-delivery-view.js';
import {createSouvenirView} from '../src/smf-tour/cosmetic-view.js';
import {createPlayerCamera} from '../src/player-camera.js';
import {PUTTING_HOLES,PUTTING_PHYSICS} from '../src/bonus-practice/putting-state.js';
import * as rabbit from '../src/bonus-practice/views/rabbit-hole.js';
import * as garden from '../src/bonus-practice/views/secret-garden.js';
import * as ikigai from '../src/bonus-practice/views/ikigai-mori.js';
import * as prism from '../src/prism-practice/view.js';
import {isOpen} from '../src/geometry.js';
import {smfPreviewStage} from '../src/editions/smf-stages.js';

const splineURL=new URL('../node_modules/phaser/src/curves/SplineCurve.js',import.meta.url).href;
registerHooks({resolve(s,c,next){return s==='phaser'?{url:'test:tour-scene-phaser',shortCircuit:true}:next(s,c);},load(url,c,next){return url==='test:tour-scene-phaser'?{format:'module',source:`import Spline from ${JSON.stringify(splineURL)};export default {Scene: class {},Curves:{Spline},Math:{Distance:{Between:(x,y,a,b)=>Math.hypot(x-a,y-b)},Between:(a,b)=>(a+b)/2}}`,shortCircuit:true}:next(url,c);}});
const {tourScene}=await import('../src/smf-tour/scene.js');
const villagio=await import('../src/bonus-practice/views/villagio.js');

// Only Phaser's display/input boundary is replaced. TourScene, GameScene,
// venue views, activity views, controllers and storage all run unchanged.
function display(scene,x=0,y=0){
 let node;const value={x,y,scene,visible:true,list:[],rotation:0,draws:[],
  clear(){this.draws=[];return node;},fillCircle(...args){this.draws.push(['circle',...args]);return node;},fillTriangle(...args){this.draws.push(['triangle',...args]);return node;},fillRect(...args){this.draws.push(['rect',...args]);return node;},setDepth(value){this.depth=value;return node;},
  setPosition(a,b){this.x=a;this.y=b;return node;},setVisible(v){this.visible=v;return node;},
  setText(v){this.text=v;return node;},setZoom(v){this.zoom=v;return node;},centerOn(x,y){this.center={x,y};return node;},
  add(items){this.list.push(...(Array.isArray(items)?items:[items]));return node;},
  destroy(){this.scene=null;this.destroyed=true;},
 };
 node=new Proxy(value,{get:(target,key)=>key in target?target[key]:(...args)=>node});return node;
}
function harness(initial){
 let profile=initial,frames=0,invitations=0;const canvasListeners=new Map(),textLabels=[],graphics=[],activities=[],roundEnds=[];
 const Scene=tourScene({profile:()=>profile,onReady(){},onFrame(){frames++;},onInvitation(){invitations++;profile=collectInvitation(profile);},onActivity(event){activities.push(event);},onRoundEnd(round){roundEnds.push(round);},onAim(){}}),scene=new Scene();
 scene.add=new Proxy({},{get:(_,kind)=>(x=0,y=0,content)=>{
  const node=display(scene,typeof x==='number'?x:0,typeof y==='number'?y:0);
  if(kind==='text'){node.text=content;textLabels.push(node);}
  if(kind==='graphics')graphics.push(node);
  if(kind==='container'&&Array.isArray(content))node.add(content);
  return node;
 }});
 scene.textures={exists:()=>false};scene.cameras={main:display(scene)};
 scene.game={events:new EventEmitter(),canvas:{addEventListener(name,fn){if(!canvasListeners.has(name))canvasListeners.set(name,new Set());canvasListeners.get(name).add(fn);},removeEventListener(name,fn){canvasListeners.get(name)?.delete(fn);},hasPointerCapture:()=>false}};
 scene.input={keyboard:{resetKeys(){}}};scene.keys=Object.fromEntries('W A S D UP DOWN LEFT RIGHT'.split(' ').map(k=>[k,{isDown:false}]));
 scene.effects={clear(){},add(){}};scene.tweens={killAll(){},pauseAll(){},resumeAll(){},add(){}};scene.reducedMotion=true;
 scene.background={fireflies:[],show(stage){this.venueView=createSMFStageView(scene,stage)||createAMPBackstageView(scene,stage)||[rabbit,garden,ikigai,villagio,prism].map(v=>v.createView(scene,stage)).find(Boolean);},update(...args){this.venueView?.update(...args);}};
 scene.fireflies=[];scene.crowd=new Crowd(scene);scene.dancer=display(scene);scene.avatar=createAvatar(scene);scene.bassFeedback=display(scene);scene.halo=display(scene);scene.dropWash=display(scene);
 scene.sparks=Array.from({length:12},(_,i)=>Object.assign(display(scene,120+i*50,570),{art:display(scene)}));scene.allSparks=scene.sparks;
 scene.flowPickup=display(scene);scene.mysteryView={reset(){},update(){},pickup:display(scene),art:display(scene),placed:false};scene.invitation=display(scene);scene.souvenirView=createSouvenirView(scene);
 scene.placeSpark=()=>{};
 scene.crowdSocial=createCrowdSocial(scene,{getOptions:()=>scene.crowdOptions()});
 return {scene,textLabels,graphics,activities,roundEnds,get profile(){return profile;},set profile(v){profile=v;},get frames(){return frames;},get invitations(){return invitations;},listenerCount:()=>[...canvasListeners.values()].reduce((n,set)=>n+set.size,0)};
}
function visit(id){return invitedBonusVisit(id);}
function memory(){const data=new Map();return {getItem:key=>data.get(key)??null,setItem:(key,value)=>data.set(key,value)};}
function advanceScene(scene,ms){for(let remaining=ms;remaining>0;remaining-=50){const step=Math.min(50,remaining);scene.update(elapsedMs(scene.round)+step,step);}}
function sinkCurrentPutt(scene){
 const practice=scene.practice,cup=PUTTING_HOLES[practice.state.holeIndex].cup;
 const dx=cup.x-practice.state.ball.x,dy=cup.y-practice.state.ball.y,distance=Math.hypot(dx,dy),power=Math.sqrt(2*PUTTING_PHYSICS.friction*distance)/PUTTING_PHYSICS.maxSpeed;
 scene.shoot({x:dx/distance*power,y:dy/distance*power});
 for(let frame=0;frame<100&&practice.state.phase==='rolling';frame++)advanceScene(scene,50);
 assert.equal(practice.state.phase,'between');
}
function walkPast(scene,index){
 const id=`dancer-${index}`,bond=scene.crowdSocial.friendships.get(id),point=crowdPosition(index,elapsedMs(scene.round),scene.stage.crowdAnchors,scene.stage.crowdSpeed??1,roundTiming(scene.round));
 scene.dancer.setPosition(point.x-80,point.y+bond.radius+12);
 scene.update(elapsedMs(scene.round),0);
 // Follow the dancer's slow vertical drift while crossing the real scene with
 // destination movement. Keeping a safe relative lane avoids turning this
 // friendship/recovery check into a brittle authored-path timing test.
 for(let step=0;step<20;step++){
  const next=crowdPosition(index,elapsedMs(scene.round)+50,scene.stage.crowdAnchors,scene.stage.crowdSpeed??1,roundTiming(scene.round));
  scene.target={x:next.x+100,y:next.y+bond.radius+12};advanceScene(scene,50);
 }
 scene.target=null;
 return scene.crowdSocial.friendships.get(id).passes;
}

for(const {id} of BONUSES)test(`${id}: real scene loads, paints, checkpoints, restores paused and returns cleanly`,()=>{
 const h=harness(visit(id)),s=h.scene;assert.doesNotThrow(()=>s.loadActive());
 assert.equal(s.stage.id,bonusConfig(id).stage.id);assert.equal(s.practice.status,'playing');assert.equal(s.sparks.length,0);assert.equal(s.allSparks.every(p=>!p.visible),true);
 // The actual AMP backdrop deliberately has no activity progress callback.
 if(id==='amp-backstage')assert.equal(s.background.venueView.setProgress,undefined);
 assert.doesNotThrow(()=>s.paint());s.pauseTour();s.update(1000,1000);assert.equal(h.frames,1);
 const snapshot=s.capture();assert.equal(snapshot.scene.sparks.length,12);assert.equal(s.sparks.length,0);
 h.profile.active.bonus.scene=snapshot.scene;h.profile.active.bonus.activity=snapshot.activity;
 const store=createTourStore(memory());assert.equal(store.write(h.profile),true);h.profile=store.read();
 assert.doesNotThrow(()=>s.loadActive({paused:true}));assert.equal(s.running,false);assert.equal(s.practice.status,'paused');
 const restored=s.capture();assert.deepEqual(restored,snapshot);s.update(6000,5000);assert.deepEqual(s.capture(),restored);
 h.profile=returnBonus(h.profile);s.clearVisit();assert.equal(h.profile.active.bonus,null);assert.equal(s.sparks.length,12);assert.equal(s.allSparks.every(p=>p.visible),true);assert.equal(s.dancer.visible,true);assert.equal(h.listenerCount(),0);
 h.profile=createFestival(closeResults(endFestival(h.profile)),'next-main');s.loadActive();assert.equal(s.stage.id,'smf-living-room');assert.equal(s.sparks.length,12);assert.equal(s.practice,null);
 assert.ok(s.crowdSocial.captureCounts().every(count=>count===0),'a new main round starts without visit friendships');
});

test('main-scene clean passes survive store recovery and the fourth friendship is awarded once',()=>{
 const h=harness(createFestival(createTourProfile(),'social-main')),s=h.scene;s.loadActive();
 assert.equal(walkPast(s,9),1);advanceScene(s,3200);assert.equal(walkPast(s,9),2);
 s.pauseTour();const checkpoint=s.capture();assert.equal(checkpoint.scene.crowd[9].friendPasses,2);
 h.profile.active.needsIntro=false;h.profile.active.scene=checkpoint.scene;
 const store=createTourStore(memory());assert.equal(store.write(h.profile),true);h.profile=store.read();assert.ok(h.profile.active);
 s.loadActive({paused:true});assert.equal(s.running,false);assert.equal(s.crowdSocial.friendships.get('dancer-9').passes,2);
 assert.deepEqual(s.capture(),checkpoint);advanceScene(s,1000);assert.deepEqual(s.capture(),checkpoint);
 s.resumeTour();advanceScene(s,3200);assert.equal(walkPast(s,9),3);advanceScene(s,3200);assert.equal(walkPast(s,9),4);
 assert.equal(s.crowdSocial.friendships.get('dancer-9').radius,0);
 const awards=h.textLabels.filter(label=>label.text==='New friend! ♥').length,friendCount=s.crowdSocial.friendships.summary().friends;
 assert.equal(friendCount,1);assert.ok(awards<=1,'crowd chatter can suppress a label but cannot duplicate the milestone');
 const closePasses=s.round.closePasses;
 advanceScene(s,3200);assert.equal(walkPast(s,9),4);
 assert.ok(s.round.closePasses>closePasses,'a subsequent real clean pass is still processed');assert.equal(s.crowdSocial.friendships.summary().friends,friendCount);
 assert.equal(h.textLabels.filter(label=>label.text==='New friend! ♥').length,awards);
 h.profile=createFestival(createTourProfile(),'fresh-social-main');s.loadActive();assert.ok(s.crowdSocial.captureCounts().every(count=>count===0));
});

test('a bonus visit learns through real movement, recovers paused and resets for a new visit',()=>{
 const h=harness(visit('rabbit-hole')),s=h.scene;s.loadActive();
 assert.equal(walkPast(s,3),1);advanceScene(s,3200);assert.equal(walkPast(s,3),2);
 s.pauseTour();const checkpoint=s.capture();h.profile.active.bonus.scene=checkpoint.scene;h.profile.active.bonus.activity=checkpoint.activity;
 const store=createTourStore(memory());assert.equal(store.write(h.profile),true);h.profile=store.read();assert.ok(h.profile.active);
 s.loadActive({paused:true});assert.equal(s.running,false);assert.equal(s.practice.status,'paused');assert.equal(s.crowdSocial.friendships.get('dancer-3').passes,2);
 assert.deepEqual(s.capture(),checkpoint);advanceScene(s,1000);assert.deepEqual(s.capture(),checkpoint);
 h.profile=returnBonus(h.profile);s.clearVisit();h.profile=invitedBonusVisit('rabbit-hole','second-social-visit',closeResults(endFestival(h.profile)));s.loadActive();
 assert.ok(s.crowdSocial.captureCounts().every(count=>count===0));
});

test('the main-scene invitation hides after collection but appears again for a known venue',()=>{
 const h=harness(createFestival(createTourProfile(),'invitation-tour')),s=h.scene;s.loadActive();const duration=getTiming(s.stage.timingId).durationMs;
 s.round.remainingMs=duration-17999;s.paint();assert.equal(s.invitation.visible,false);
 s.round.remainingMs=duration-18000;s.paint();assert.equal(s.invitation.visible,true);assert.deepEqual({x:s.invitation.x,y:s.invitation.y},INVITATIONS['smf-living-room']);
 s.dancer.setPosition(s.invitation.x,s.invitation.y);s.update(18000,0);assert.equal(h.invitations,1);assert.equal(h.profile.active.pendingInvitation,true);assert.equal(s.invitation.visible,false);
 s.update(18000,0);assert.equal(h.invitations,1);
 h.profile.active.pendingInvitation=false;h.profile.discoveries=['rabbit-hole'];s.paint();assert.equal(s.invitation.visible,true);
});

test('putting responds immediately when reduced-motion preference changes',()=>{
 const {scene}=harness(visit('villagio'));scene.loadActive();scene.motionQuery={matches:false};
 scene.update(100,100);assert.equal(scene.reducedMotion,false);
 scene.motionQuery.matches=true;scene.update(200,100);assert.equal(scene.reducedMotion,true);
 scene.pauseTour();const saved=scene.capture();scene.update(5000,4800);assert.deepEqual(scene.capture(),saved);
});

test('Villagio crowd, collision and recovery share the same walking clock',()=>{
 const h=harness(visit('villagio')),s=h.scene;s.loadActive();
 s.update(50,50);
 const at=elapsedMs(s.round),timing=roundTiming(s.round);
 assert.equal(at,s.practice.state.elapsedMs);
 const positions=s.crowd.people.map((person,index)=>{
  const expected=crowdPosition(index,at,s.stage.crowdAnchors,s.stage.crowdSpeed??1,timing);
  assert.deepEqual({x:person.node.x,y:person.node.y},expected);
  return {x:person.node.x,y:person.node.y};
 });
 s.pauseTour();const checkpoint=s.capture();h.profile.active.bonus.scene=checkpoint.scene;h.profile.active.bonus.activity=checkpoint.activity;
 s.loadActive({paused:true});
 assert.deepEqual(s.crowd.people.map(p=>({x:p.node.x,y:p.node.y})),positions);
});

for(const season of ['smf-v1','smf-v2'])test(`${season}: returning from a long putt does not replay hidden crowd motion or earn a phantom pass`,()=>{
 const profile=visit('villagio');profile.active.scoringVersion=season;
 const {scene}=harness(profile);scene.loadActive();advanceScene(scene,15000);
 scene.dancer.setPosition(330,350);scene.update(15000,0);
 assert.equal(scene.practice.state.phase,'aim');
 const player={x:scene.dancer.x,y:scene.dancer.y},passes=scene.round.closePasses,friendships=scene.crowdSocial.captureCounts();
 sinkCurrentPutt(scene);advanceScene(scene,45000-scene.practice.state.elapsedMs);
 assert.equal(scene.practice.nextHole(),true);scene.resumeTour();scene.update(45050,50);
 assert.deepEqual({x:scene.dancer.x,y:scene.dancer.y},player,'only the current walking frame may push the player');
 assert.equal(scene.round.closePasses,passes);assert.deepEqual(scene.crowdSocial.captureCounts(),friendships);
 assert.equal(typeof scene.resolveMovementStep,season==='smf-v2'?'function':'undefined');
});

test('putting hides social marks and chatter, then restores marks without replaying a friendship',()=>{
 const h=harness(visit('villagio')),scene=h.scene;scene.loadActive();
 const counts=scene.crowd.people.map((_,index)=>index===0?4:0);scene.crowdSocial.reset(counts,0);
 scene.crowdSocial.afterEncounters([{id:'dancer-0',contactStarted:true}]);
 const marks=h.graphics.find(g=>g.depth===33),reaction=h.textLabels.findLast(label=>label.text==='Oop!');
 assert.ok(marks.draws.some(command=>command[0]==='rect'));assert.ok(reaction);
 scene.dancer.setPosition(330,350);scene.update(50,50);
 assert.equal(scene.practice.state.phase,'aim');assert.ok(scene.crowd.people.every(person=>!person.node.visible));
 assert.deepEqual(marks.draws,[]);assert.equal(reaction.destroyed,true);
 advanceScene(scene,1000);assert.deepEqual(marks.draws,[]);
 sinkCurrentPutt(scene);
 assert.ok(scene.crowd.people.every(person=>person.node.visible));assert.ok(marks.draws.some(command=>command[0]==='rect'));
 assert.equal(h.textLabels.filter(label=>label.text==='New friend! ♥').length,0);assert.deepEqual(scene.crowdSocial.captureCounts(),counts);
});

test('an aiming checkpoint preserves friendship and remains unchanged while paused after recovery',()=>{
 const h=harness(visit('villagio')),scene=h.scene;scene.loadActive();assert.equal(walkPast(scene,3),1);
 scene.dancer.setPosition(218,366);advanceScene(scene,50);assert.equal(scene.practice.state.phase,'aim');
 const counts=scene.crowdSocial.captureCounts();scene.pauseTour();const checkpoint=scene.capture();
 h.profile.active.bonus.scene=checkpoint.scene;h.profile.active.bonus.activity=checkpoint.activity;
 const store=createTourStore(memory());assert.equal(store.write(h.profile),true);h.profile=store.read();assert.ok(h.profile.active);
 scene.loadActive({paused:true});assert.deepEqual(scene.capture(),checkpoint);assert.deepEqual(scene.crowdSocial.captureCounts(),counts);
 advanceScene(scene,3000);assert.deepEqual(scene.capture(),checkpoint);assert.equal(scene.resolveMovementStep,undefined);
 scene.resumeTour();advanceScene(scene,1000);assert.deepEqual(scene.crowdSocial.captureCounts(),counts);assert.equal(scene.running,false);
});

for(const season of ['smf-v1','smf-v2','smf-v3'])for(const phase of ['aim','rolling'])test(`${season}: Villagio ${phase} time preserves a recoverable checkpoint`,()=>{
 const profile=visit('villagio');profile.active.scoringVersion=season;
 const h=harness(profile),scene=h.scene;scene.loadActive();advanceScene(scene,1000);
 scene.dancer.setPosition(218,366);advanceScene(scene,50);assert.equal(scene.practice.state.phase,'aim');
 advanceScene(scene,1000);
 if(phase==='rolling'){scene.shoot({x:.8,y:.12});advanceScene(scene,137);}
 assert.equal(scene.practice.state.phase,phase);
 assert.notEqual(elapsedMs(scene.round),scene.round.mystery.elapsedMs,'putting music advances while the disabled candy clock stays parked');
 scene.pauseTour();const checkpoint=scene.capture();
 h.profile.active.bonus.scene=checkpoint.scene;h.profile.active.bonus.activity=checkpoint.activity;
 const store=createTourStore(memory());assert.equal(store.write(h.profile),true);h.profile=store.read();assert.ok(h.profile.active);
 scene.loadActive({paused:true});assert.deepEqual(scene.capture(),checkpoint);assert.equal(scene.running,false);assert.equal(scene.practice.status,'paused');
 advanceScene(scene,1000);assert.deepEqual(scene.capture(),checkpoint);
});

test('restored original-season runs retain pass-through rules through their bonus visits',()=>{
 const p=createFestival(createTourProfile(),'original-season');p.active.scoringVersion='smf-v1';
 const h=harness(p),s=h.scene;s.loadActive();s.update(50,50);
 assert.equal(s.resolveMovementStep,undefined);assert.equal(s.crowdOptions().enabled,false);
 h.profile=legacyExploreVisit('rabbit-hole','original-bonus');h.profile.active.scoringVersion='smf-v1';
 s.loadActive();s.update(50,50);assert.equal(s.resolveMovementStep,undefined);
 h.profile=createFestival(createTourProfile(),'crowd-season');h.profile.active.scoringVersion='smf-v2';
 s.loadActive();s.update(50,50);assert.equal(typeof s.resolveMovementStep,'function');
 assert.deepEqual(s.crowd.people.slice(0,3).map(p=>s.crowdSocial.friendships.get(p.id).radius),[18,26,34]);
});

test('Villagio walking survives a music wrap and enters a green without spending a shot',()=>{
 const {scene}=harness(visit('villagio'));scene.loadActive();
 assert.equal(scene.practice.state.phase,'walking');assert.equal(scene.running,true);assert.equal(scene.dancer.visible,true);
 assert.equal(walkPast(scene,3),1);const learned=scene.crowdSocial.captureCounts();
 const duration=getTiming(scene.config.timingId).durationMs;for(let remaining=duration-scene.practice.state.elapsedMs-1;remaining>0;remaining-=1000)scene.practice.advance(Math.min(1000,remaining));scene.round.remainingMs=1;
 scene.update(1000,50);assert.equal(scene.round.ended,false);assert.equal(scene.practice.state.phase,'walking');
 assert.deepEqual(scene.crowdSocial.captureCounts(),learned,'wrapping the bonus music does not reset a friendship');
 scene.dancer.setPosition(218,366);scene.update(1050,50);
 assert.equal(scene.practice.state.phase,'aim');assert.equal(scene.running,false);assert.equal(scene.practice.state.strokes,0);assert.equal(scene.cameras.main.zoom,2.35);
 const position={x:scene.dancer.x,y:scene.dancer.y},passes=scene.round.closePasses,aimCounts=scene.crowdSocial.captureCounts();
 scene.keys.D.isDown=true;scene.target={x:900,y:500};advanceScene(scene,1000);
 assert.deepEqual({x:scene.dancer.x,y:scene.dancer.y},position);assert.equal(scene.round.closePasses,passes);assert.deepEqual(scene.crowdSocial.captureCounts(),aimCounts,'aiming never runs crowd movement or learning');scene.keys.D.isDown=false;
 scene.pauseTour();const before=scene.capture();scene.update(2000,950);assert.deepEqual(scene.capture(),before);
 scene.resumeTour();assert.equal(scene.running,false,'putting does not also move the player');
});

test('Villagio temporarily frames the whole green and returns to the selected mobile camera',()=>{
 const {scene}=harness(visit('villagio'));
 scene.game.scale={gameSize:{width:390,height:620}};
 scene.playerCamera=createPlayerCamera(scene,{mode:'follow'});scene.loadActive();
 const walkingZoom=scene.cameras.main.zoom;assert.equal(walkingZoom,620/640);
 scene.dancer.setPosition(218,366);scene.update(50,50);
 assert.equal(scene.practice.state.phase,'aim');assert.equal(scene.running,false);
 assert.equal(scene.cameras.main.zoom,390/300,'entire first green and its padding fit portrait width');
 scene.game.scale.gameSize={width:844,height:220};scene.playerCamera.resize();
 assert.equal(scene.cameras.main.zoom,220/116,'landscape rotation still shows the complete green');
 scene.practice.state.phase='between';scene.paint();
 assert.equal(scene.cameras.main.zoom,844/960,'leaving the green restores follow framing');
 scene.clearVisit();assert.equal(scene.cameras.main.zoom,844/960);
});

test('Fractal invitation is reachable in an unobstructed side lane',()=>{
 const stage=smfPreviewStage('smf-fractal'),point=INVITATIONS[stage.id];
 assert.ok(point,'Fractal has an invitation');
 assert.ok(point.x>=stage.playBounds.minX+32&&point.x<=stage.playBounds.maxX-32);
 assert.ok(point.y>=stage.playBounds.minY+32&&point.y<=stage.playBounds.maxY-32);
 assert.ok(isOpen(point,32,stage.obstacles));
 assert.ok(stage.flowSpawns.every(flow=>Math.hypot(point.x-flow.x,point.y-flow.y)>80));
});

function enterPrism(scene){
 scene.dancer.setPosition(480,510);scene.target={x:480,y:490};advanceScene(scene,50);
 assert.equal(scene.practice.state.phase,'party');
}

test('Prism uses its own cues and keeps the party running through the music wrap',()=>{
 assert.doesNotThrow(()=>bonusConfig('prism-party'),'Prism has production content');
 const h=harness(visit('prism-party')),scene=h.scene;scene.loadActive();
 assert.equal(scene.stage.id,'smf-prism-party');assert.equal(scene.crowd.people.length,9);
 assert.equal(scene.activityView,null,'the Prism venue owns its face cues');
 assert.equal(typeof scene.background.venueView.setProgress,'function');
 advanceScene(scene,1000);enterPrism(scene);
 assert.deepEqual(h.activities.map(event=>event.type),['entered']);
 assert.ok(elapsedMs(scene.round)<50,'entry restarts the music at the exact ramp crossing');
 assert.equal(elapsedMs(scene.round),scene.practice.state.partyMs);
 scene.target=null;advanceScene(scene,65000);
 assert.equal(scene.running,true);assert.equal(scene.round.ended,false);assert.equal(h.roundEnds.length,0);
 assert.equal(scene.practice.state.progress,0);assert.equal(scene.practice.state.phase,'party');
 assert.equal(h.activities.filter(event=>event.type==='phrase').length,8);
 assert.equal(elapsedMs(scene.round),scene.practice.state.partyMs%64000);
 assert.equal(scene.round.mystery.elapsedMs,elapsedMs(scene.round));
});

test('Prism checkpoints resume with the same musical cue and recover paused',()=>{
 const h=harness(visit('prism-party')),scene=h.scene;scene.loadActive();advanceScene(scene,1000);enterPrism(scene);
 scene.target=null;advanceScene(scene,9700);scene.pauseTour();const saved=scene.capture();
 h.profile.active.bonus.scene=saved.scene;h.profile.active.bonus.activity=saved.activity;
 const store=createTourStore(memory());assert.equal(store.write(h.profile),true);h.profile=store.read();assert.ok(h.profile.active?.bonus);
 scene.loadActive({paused:true});assert.deepEqual(scene.capture(),saved);assert.equal(scene.running,false);assert.equal(scene.practice.status,'paused');
 advanceScene(scene,2000);assert.deepEqual(scene.capture(),saved);
 scene.resumeTour();advanceScene(scene,50);assert.equal(elapsedMs(scene.round),scene.practice.state.partyMs%64000);
});

test('Prism confines movement to the ramp and removes both bounds and camera focus on return',()=>{
 const h=harness(visit('prism-party')),scene=h.scene;scene.game.scale={gameSize:{width:844,height:390}};
 scene.playerCamera=createPlayerCamera(scene,{mode:'follow'});scene.loadActive();
 scene.dancer.setPosition(300,550);scene.target={x:300,y:470};advanceScene(scene,100);
 assert.equal(scene.dancer.y,540,'the floor cannot be entered through a side wall');assert.equal(scene.practice.state.entered,false);
 enterPrism(scene);assert.equal(scene.cameras.main.zoom,844/780,'short landscape frames the floor after entry');
 scene.game.scale.gameSize={width:390,height:844};scene.playerCamera.resize();scene.paint();
 assert.equal(scene.cameras.main.zoom,844/640,'portrait resumes player following');
 scene.game.scale.gameSize={width:844,height:390};scene.playerCamera.resize();scene.paint();assert.equal(scene.cameras.main.zoom,844/780);
 h.profile=createFestival(createTourProfile(),'after-prism');scene.loadActive();
 assert.equal(scene.cameras.main.zoom,844/960,'main venue restores the chosen follow camera');
 scene.dancer.setPosition(300,550);scene.target={x:300,y:470};advanceScene(scene,100);
 assert.ok(scene.dancer.y<540,'main venue does not retain pyramid walls');
});

function lightPrismFaces(scene){
 enterPrism(scene);
 // Use an original-season visit so this focused completion/recovery test
 // measures player motion without a randomly timed crowd bump changing it.
 const centers=[{x:370,y:410},{x:590,y:410},{x:480,y:465}];
 for(let face=0;face<3;face++){
  const center=centers[face];scene.dancer.setPosition(center.x,center.y);
  for(let frame=0;frame<60;frame++){
   scene.target={x:center.x+(frame%2?-20:20),y:center.y};advanceScene(scene,50);
  }
  assert.equal(scene.practice.state.progress,face+1);
  scene.target=null;
  if(face<2)advanceScene(scene,(face+1)*8000-scene.practice.state.partyMs);
 }
 assert.equal(scene.practice.state.phase,'celebrating');
}

test('Prism finale recovers paused and completes once after its remaining celebration',()=>{
 const profile=visit('prism-party');profile.active.scoringVersion='smf-v1';
 const h=harness(profile),scene=h.scene;scene.loadActive();lightPrismFaces(scene);
 assert.equal(h.activities.filter(event=>event.type==='finale').length,1);assert.equal(h.activities.some(event=>event.type==='complete'),false);
 advanceScene(scene,1000);scene.pauseTour();const checkpoint=scene.capture();
 h.profile.active.bonus.scene=checkpoint.scene;h.profile.active.bonus.activity=checkpoint.activity;
 const store=createTourStore(memory());assert.equal(store.write(h.profile),true);h.profile=store.read();assert.ok(h.profile.active?.bonus);
 scene.loadActive({paused:true});assert.deepEqual(scene.capture(),checkpoint);advanceScene(scene,4000);assert.deepEqual(scene.capture(),checkpoint);
 scene.resumeTour();advanceScene(scene,2499);assert.equal(scene.practice.state.complete,false);assert.equal(scene.running,true);
 advanceScene(scene,1);assert.equal(scene.practice.state.complete,true);assert.equal(scene.running,false);assert.equal(h.activities.filter(event=>event.type==='complete').length,1);
 advanceScene(scene,5000);assert.equal(h.activities.filter(event=>event.type==='complete').length,1);assert.equal(h.roundEnds.length,0);
 assert.equal(elapsedMs(scene.round),scene.practice.state.partyMs+3500);
});

test('Prism respects overview mode while the player is inside the pyramid',()=>{
 const {scene}=harness(visit('prism-party'));scene.game.scale={gameSize:{width:844,height:390}};
 scene.setControlPreferences({mode:'tap',camera:'overview'});scene.playerCamera=createPlayerCamera(scene,{mode:'overview'});
 scene.loadActive();enterPrism(scene);assert.equal(scene.cameras.main.zoom,390/640);
});

test('a tiny movement beyond the Prism boundary is clipped and remains recoverable',()=>{
 const h=harness(visit('prism-party')),scene=h.scene;scene.loadActive();
 scene.dancer.setPosition(300,540);scene.target={x:300,y:539.995};scene.update(16,16);
 scene.pauseTour();const checkpoint=scene.capture();
 h.profile.active.bonus.scene=checkpoint.scene;h.profile.active.bonus.activity=checkpoint.activity;
 const store=createTourStore(memory());assert.equal(store.write(h.profile),true,'a clipped wall movement must remain a valid saved visit');
 assert.deepEqual(checkpoint.scene.player,{x:300,y:540});assert.equal(scene.target,null);
 h.profile=store.read();assert.ok(h.profile.active?.bonus);scene.loadActive({paused:true});
 assert.deepEqual(scene.capture(),checkpoint);assert.equal(scene.running,false);
});
