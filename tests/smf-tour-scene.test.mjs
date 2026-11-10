import test from 'node:test';
import assert from 'node:assert/strict';
import {registerHooks} from 'node:module';
import {EventEmitter} from 'node:events';
import {BONUSES,createTourProfile,createFestival,beginBonus,returnBonus,collectInvitation} from '../src/smf-tour/model.js';
import {createTourStore} from '../src/smf-tour/store.js';
import {bonusConfig,INVITATIONS} from '../src/smf-tour/content.js';
import {createAvatar} from '../src/Avatar.js';
import {Crowd} from '../src/Crowd.js';
import {getTiming} from '../src/stage-clock.js';
import {createSMFStageView} from '../src/editions/smf-stage-view.js';
import {createAMPBackstageView} from '../src/amp-delivery-view.js';
import {createSouvenirView} from '../src/smf-tour/cosmetic-view.js';
import * as rabbit from '../src/bonus-practice/views/rabbit-hole.js';
import * as garden from '../src/bonus-practice/views/secret-garden.js';
import * as ikigai from '../src/bonus-practice/views/ikigai-mori.js';

const splineURL=new URL('../node_modules/phaser/src/curves/SplineCurve.js',import.meta.url).href;
registerHooks({resolve(s,c,next){return s==='phaser'?{url:'test:tour-scene-phaser',shortCircuit:true}:next(s,c);},load(url,c,next){return url==='test:tour-scene-phaser'?{format:'module',source:`import Spline from ${JSON.stringify(splineURL)};export default {Scene: class {},Curves:{Spline},Math:{Distance:{Between:(x,y,a,b)=>Math.hypot(x-a,y-b)},Between:(a,b)=>(a+b)/2}}`,shortCircuit:true}:next(url,c);}});
const {tourScene}=await import('../src/smf-tour/scene.js');
const villagio=await import('../src/bonus-practice/views/villagio.js');

// Only Phaser's display/input boundary is replaced. TourScene, GameScene,
// venue views, activity views, controllers and storage all run unchanged.
function display(scene,x=0,y=0){
 let node;const value={x,y,scene,visible:true,list:[],rotation:0,
  setPosition(a,b){this.x=a;this.y=b;return node;},setVisible(v){this.visible=v;return node;},
  setText(v){this.text=v;return node;},setZoom(v){this.zoom=v;return node;},centerOn(x,y){this.center={x,y};return node;},
  add(items){this.list.push(...(Array.isArray(items)?items:[items]));return node;},
  destroy(){this.scene=null;this.destroyed=true;},
 };
 node=new Proxy(value,{get:(target,key)=>key in target?target[key]:(...args)=>node});return node;
}
function harness(initial){
 let profile=initial,frames=0,invitations=0;const canvasListeners=new Map();
 const Scene=tourScene({profile:()=>profile,onReady(){},onFrame(){frames++;},onInvitation(){invitations++;profile=collectInvitation(profile);},onActivity(){},onRoundEnd(){},onAim(){}}),scene=new Scene();
 scene.add=new Proxy({},{get:(_,kind)=>(x=0,y=0)=>display(scene,typeof x==='number'?x:0,typeof y==='number'?y:0)});
 scene.textures={exists:()=>false};scene.cameras={main:display(scene)};
 scene.game={events:new EventEmitter(),canvas:{addEventListener(name,fn){if(!canvasListeners.has(name))canvasListeners.set(name,new Set());canvasListeners.get(name).add(fn);},removeEventListener(name,fn){canvasListeners.get(name)?.delete(fn);},hasPointerCapture:()=>false}};
 scene.input={keyboard:{resetKeys(){}}};scene.keys=Object.fromEntries('W A S D UP DOWN LEFT RIGHT'.split(' ').map(k=>[k,{isDown:false}]));
 scene.effects={clear(){},add(){}};scene.tweens={killAll(){},pauseAll(){},resumeAll(){},add(){}};scene.reducedMotion=true;
 scene.background={fireflies:[],show(stage){this.venueView=createSMFStageView(scene,stage)||createAMPBackstageView(scene,stage)||[rabbit,garden,ikigai,villagio].map(v=>v.createView(scene,stage)).find(Boolean);},update(...args){this.venueView?.update(...args);}};
 scene.fireflies=[];scene.crowd=new Crowd(scene);scene.dancer=display(scene);scene.avatar=createAvatar(scene);scene.bassFeedback=display(scene);scene.halo=display(scene);scene.dropWash=display(scene);
 scene.sparks=Array.from({length:12},(_,i)=>Object.assign(display(scene,120+i*50,570),{art:display(scene)}));scene.allSparks=scene.sparks;
 scene.flowPickup=display(scene);scene.mysteryView={reset(){},update(){},pickup:display(scene),art:display(scene),placed:false};scene.invitation=display(scene);scene.souvenirView=createSouvenirView(scene);
 scene.placeSpark=()=>{};
 return {scene,get profile(){return profile;},set profile(v){profile=v;},get frames(){return frames;},get invitations(){return invitations;},listenerCount:()=>[...canvasListeners.values()].reduce((n,set)=>n+set.size,0)};
}
function visit(id){let p=createTourProfile();p.discoveries=[id];return beginBonus(p,id,`visit-${id}`,{explore:true});}
function memory(){const data=new Map();return {getItem:key=>data.get(key)??null,setItem:(key,value)=>data.set(key,value)};}

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
 h.profile=returnBonus(h.profile);s.clearVisit();assert.equal(h.profile.active,null);assert.equal(s.sparks.length,12);assert.equal(s.allSparks.every(p=>p.visible),true);assert.equal(s.dancer.visible,true);assert.equal(h.listenerCount(),0);
 h.profile=createFestival(h.profile,'next-main');s.loadActive();assert.equal(s.stage.id,'smf-living-room');assert.equal(s.sparks.length,12);assert.equal(s.practice,null);
});

test('the main-scene sealed invitation waits for active time and hides after collection or discovery',()=>{
 const h=harness(createFestival(createTourProfile(),'invitation-tour')),s=h.scene;s.loadActive();const duration=getTiming(s.stage.timingId).durationMs;
 s.round.remainingMs=duration-17999;s.paint();assert.equal(s.invitation.visible,false);
 s.round.remainingMs=duration-18000;s.paint();assert.equal(s.invitation.visible,true);assert.deepEqual({x:s.invitation.x,y:s.invitation.y},INVITATIONS['smf-living-room']);
 s.dancer.setPosition(s.invitation.x,s.invitation.y);s.update(18000,0);assert.equal(h.invitations,1);assert.equal(h.profile.active.pendingInvitation,true);assert.equal(s.invitation.visible,false);
 s.update(18000,0);assert.equal(h.invitations,1);
 h.profile.active.pendingInvitation=false;h.profile.discoveries=['rabbit-hole'];s.paint();assert.equal(s.invitation.visible,false);
});

test('putting responds immediately when reduced-motion preference changes',()=>{
 const {scene}=harness(visit('villagio'));scene.loadActive();scene.motionQuery={matches:false};
 scene.update(100,100);assert.equal(scene.reducedMotion,false);
 scene.motionQuery.matches=true;scene.update(200,100);assert.equal(scene.reducedMotion,true);
 scene.pauseTour();const saved=scene.capture();scene.update(5000,4800);assert.deepEqual(scene.capture(),saved);
});
