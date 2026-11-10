import {GameScene} from '../GameScene.js';
import {createSMFStageView} from '../editions/smf-stage-view.js';
import {preloadSMFVenueArt} from '../editions/smf-venue-assets.js';
import {createActivityView} from '../bonus-practice/activity-view.js';
import {createPuttingView} from '../bonus-practice/putting-view.js';
import {attemptPuttingShot} from '../bonus-practice/putting-input.js';
import {createDeliveryView,createAMPBackstageView,VENDOR_POINT} from '../amp-delivery-view.js';
import * as rabbit from '../bonus-practice/views/rabbit-hole.js';
import * as garden from '../bonus-practice/views/secret-garden.js';
import * as ikigai from '../bonus-practice/views/ikigai-mori.js';
import * as villagio from '../bonus-practice/views/villagio.js';
import {elapsedMs,getTiming,phaseAt} from '../stage-clock.js';
import {rulesFor} from '../run.js';
import {BONUSES,ROUTE} from './model.js';
import {mainStage,bonusConfig,bonusController,INVITATIONS} from './content.js';
import {createSouvenirView} from './cosmetic-view.js';

const bonusViews=[rabbit,garden,ikigai,villagio];
export function tourScene({profile,onReady,onFrame,onInvitation,onActivity,onRoundEnd,onAim}){
 return class TourScene extends GameScene{
  preload(){preloadSMFVenueArt(this);bonusViews.forEach(v=>v.preload(this));}
  create(){
   this.stageRendererOptions={venueView:(s,stage)=>createSMFStageView(s,stage)||createAMPBackstageView(s,stage)||bonusViews.map(v=>v.createView(s,stage)).find(Boolean)};
   super.create();this.allSparks=this.sparks;this.souvenirView=createSouvenirView(this);
   this.invitation=this.add.container(0,0).setDepth(19).setVisible(false);
   const seal=this.add.graphics();seal.fillStyle(0xffdea0,.12).fillCircle(0,0,34);
   seal.fillStyle(0x271e3c).fillRoundedRect(-18,-13,36,27,5);seal.lineStyle(2,0xffdea0).strokeRoundedRect(-18,-13,36,27,5).lineBetween(-17,-11,0,2).lineBetween(0,2,17,-11);
   seal.fillStyle(0xe9b2ed).fillCircle(0,1,5);this.invitation.add(seal);
   this.invitation.add(this.add.text(0,33,'SEALED INVITE',{fontFamily:'Arial',fontSize:'12px',color:'#ffedc6',backgroundColor:'#211e30',padding:{x:4,y:3}}).setOrigin(.5));
   this.game.events.on('round:end',r=>{this.endedRound=r;});
   this.pauseRound();onReady(this);
  }
  clearVisit(){
   this.puttingView?.destroy();this.puttingView=null;this.activityView?.destroy();this.activityView=null;
   this.practice=null;this.config=null;this.endedRound=null;this.pendingActivity=null;this.sparks=this.allSparks;
   this.allSparks.forEach(s=>s.setVisible(true));this.dancer.setVisible(true);this.invitation.setVisible(false);
  }
  loadActive({paused=false}={}){
   this.failed=false;this.clearVisit();const p=profile(),a=p.active;if(!a)return;
   const b=a.bonus;
   this.config=b?bonusConfig(b.id):null;
   const stage=b?this.config.stage:mainStage(ROUTE[a.stageIndex]);
   const options={stage,timingId:stage.timingId,rules:rulesFor(a.perks),outfit:p.outfit,bassChargeMs:b?0:a.bassChargeMs,runId:b?b.visitId:a.id};
   const snapshot=b?b.scene:a.scene;
   if(snapshot)this.restoreRecovery(snapshot,options);else super.startRound(options);
   if(b){
    this.practice=bonusController(this.config);
    if(b.activity){if(!this.practice.restore(b.activity))throw new Error('This bonus checkpoint could not be restored.');}
    else this.practice.start();
    this.round.flowTaken=[0,1];this.round.mystery.phase='spent';this.flowPickup.setVisible(false);
    this.sparks=[];this.allSparks.forEach(s=>s.setVisible(false));
    if(this.config.activity==='putt'){
     this.pauseRound();this.puttingView=createPuttingView(this,this.practice,{onShot:v=>this.shoot(v),onAim});
    }else this.activityView=this.config.activity==='delivery'?createDeliveryView(this):createActivityView(this,this.config);
    if(b.status==='result')this.practice.finish();
   }
   if(paused||snapshot||b?.status==='result')this.pauseTour();else this.resumeTour();
   this.paint();
  }
  capture(){
   const live=this.sparks;this.sparks=this.allSparks;const scene=super.captureRecovery();this.sparks=live;
   return {scene,activity:this.practice?.capture()??null};
  }
  pauseTour(){this.puttingView?.cancelAim();this.practice?.pause();this.pauseRound();}
  resumeTour(){
   this.practice?.resume();
   if(this.config?.activity!=='putt')this.resumeRound();
  }
  shoot(vector){
   if(this.config?.activity!=='putt')return;
   const event=attemptPuttingShot(this.practice,vector,()=>this.puttingView.cancelAim());if(event)onActivity(event);
  }
  onCrowdEncounters(encounters){
   if(!this.practice)return;
   const event=this.config.activity==='delivery'?this.practice.step({atVendor:Math.hypot(this.dancer.x-VENDOR_POINT.x,this.dancer.y-VENDOR_POINT.y)<=VENDOR_POINT.radius,encounters}):this.practice.step({player:this.dancer,encounters});
   if(event)this.pendingActivity=event;
  }
  effect(x,y,color,points,celebrate,label){if(this.practice&&label?.startsWith('SMOOTH'))return;super.effect(x,y,color,points,celebrate,label);}
  paint(){
   const elapsed=this.config?.activity==='putt'?this.practice.state.elapsedMs:elapsedMs(this.round);
   if(this.practice){
    this.activityView?.update(this.practice.state,elapsed,this.reducedMotion);this.puttingView?.update(this.practice.state,elapsed,this.reducedMotion);
    this.background.venueView?.setProgress?.(this.practice.state);
   }
   this.souvenirView.update(profile().souvenir,elapsed,this.reducedMotion);
   const a=profile().active,secret=!a?.bonus&&a?.status==='playing'&&BONUSES.find(b=>b.parentId===this.stage.id);
   const show=secret&&!profile().discoveries.includes(secret.id)&&!a.pendingInvitation&&elapsed>=18000;
   this.invitation.setVisible(!!show);
   if(show){const point=INVITATIONS[this.stage.id];this.invitation.setPosition(point.x,point.y);this.invitation.setScale(this.reducedMotion?1:1+Math.sin(elapsed*.003)*.05);}
  }
  update(time,delta){
   if(!this.allSparks||this.failed)return;
   this.reducedMotion=this.motionQuery?.matches??this.reducedMotion;
   const a=profile().active;if(!a)return;
   if(this.config?.activity==='putt'){
    const event=this.practice.advance(delta);if(event)onActivity(event);
    const elapsed=this.practice.state.elapsedMs,timing=getTiming(this.config.timingId),position=elapsed%timing.durationMs;
    this.round.remainingMs=timing.durationMs-position;
    this.background.update(position,phaseAt(position,timing).phase,this.reducedMotion,timing);
   }else super.update(time,delta);
   if(this.pendingActivity){const event=this.pendingActivity;this.pendingActivity=null;this.activityView?.feedback(event);onActivity(event);}
   if(this.endedRound){const r=this.endedRound;this.endedRound=null;onRoundEnd(r);}
   if(this.running&&!a.bonus&&this.invitation.visible&&Math.hypot(this.dancer.x-this.invitation.x,this.dancer.y-this.invitation.y)<32)onInvitation();
   this.paint();onFrame(this.round);
  }
 };
}
