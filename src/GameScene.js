import {getTiming,roundTiming,elapsedMs} from './stage-clock.js';
import {createBass,advanceBass,activateBass,bassMovementFactor} from './bass-head.js';
import Phaser from 'phaser';
import { createRound, advanceRound, collect } from './game.js';
import { cycleAt } from './festival.js';
import { availableFlow, activateFlow, attractSpark } from './flow.js';
import { StageRenderer } from './StageRenderer.js';
import { createAvatar, setOutfit, animateAvatar, setAvatarMotion, resetAvatarMotion } from './Avatar.js';
import {createPixelPickup,updatePixelPickup} from './pixel-art/items.js';
import { STAGES } from './stages.js';
import { moveInArena, findSpawn, movementFactor, bassFactor, isOpen } from './geometry.js';
import { Crowd } from './Crowd.js';
import {MysteryRenderer} from './MysteryRenderer.js';
import {collectMystery,skipMystery,findCandySpawn,mysteryDirection,mysteryTarget,mysterySpeed} from './mystery.js';
import {bassOffset} from './bass-motion.js';
import {drawPlayerBass} from './bass-feedback.js';
import {createGameControls,normalizeMovementPreferences} from './game-controls.js';
import {createCrowdSocial} from './crowd-social.js';

const W = 960, H = 640;
const COLORS = [0xcff598, 0x93ffd6, 0xfaa5d6, 0xc6b0ff];

export class GameScene extends Phaser.Scene {
  constructor() { super('Forest'); this.running = false; this.round = createRound(); }
  create() {
    this.motionQuery=window.matchMedia('(prefers-reduced-motion: reduce)');
    this.reducedMotion=this.motionQuery.matches;
    this.stage = STAGES[0];
    this.background = new StageRenderer(this,this.stageRendererOptions);
    this.background.show(this.stage);
    this.fireflies = this.background.fireflies;
    this.dropWash = this.add.rectangle(W / 2, H / 2, W, H, 0xb2efbd, 1).setDepth(1).setAlpha(0);
    this.crowd = new Crowd(this);
    this.effects = this.add.group();
    this.sparks = Array.from({ length: 12 }, (_, i) => this.makeSpark(i));
    this.dancer = this.add.container(480, 380).setDepth(20);
    this.dancer.add(this.add.rectangle(0, 13, 30, 8, 0x041519, .65));
    this.halo = this.add.circle(0, 0, 26, 0xcfffad, .09);
    this.dancer.add(this.halo);
    this.dancer.add(this.add.circle(0, 0, 17, 0x92dfb2, .15));
    this.bassFeedback=this.add.graphics();this.dancer.add(this.bassFeedback);
    this.avatar = createAvatar(this);
    this.dancer.add(this.avatar);
    this.flowPickup = this.add.container(0, 0).setDepth(15).setVisible(false);
    this.flowPickup.art=createPixelPickup(this,'flow');
    this.flowPickup.add(this.flowPickup.art);
    this.flowPickup.add(this.add.text(0, 32, 'FLOW', {fontFamily:'Silkscreen, monospace',fontSize:'12px',color:'#ffe3a3'}).setOrigin(.5));
    this.flowSlot = -1;
    this.mysteryView = new MysteryRenderer(this);
    this.target = null;
    this.keys = this.input.keyboard.addKeys('W,A,S,D,UP,DOWN,LEFT,RIGHT');
    this.input.keyboard.removeCapture(['W', 'A', 'S', 'D', 'UP', 'DOWN', 'LEFT', 'RIGHT']);
    this.input.on('pointerdown', this.pointTo, this);
    this.crowdSocial=createCrowdSocial(this,{getOptions:()=>this.crowdOptions()});
    this.crowdSocial.reset();
    if(this.controlPreferences)this.setControlPreferences(this.controlPreferences);
    const disposeControls=()=>{this.gameControls?.dispose();this.gameControls=null;this.playerCamera?.dispose();this.playerCamera=null;this.crowdSocial?.destroy();this.crowdSocial=null;};
    this.events?.once('shutdown',disposeControls);
    this.events?.once('destroy',disposeControls);
    this.game.events.emit('forest:ready', this);
  }
  crowdOptions(){return {enabled:this.crowdEnabled!==false,requiredPasses:this.friendPasses??4};}
  setControlPreferences(value) {
    this.controlPreferences=normalizeMovementPreferences(value);
    if(!this.gameControls&&this.keys&&this.game.canvas?.ownerDocument)this.gameControls=createGameControls(this);
    this.gameControls?.setPreferences(this.controlPreferences);
    this.target=null;
  }
  pointTo(pointer) {
    if (!this.running || this.controlPreferences&&this.controlPreferences.mode!=='tap' || pointer.event?.target !== this.game.canvas || pointer.x < 0 || pointer.y < 0 || pointer.x > (this.scale?.width??W) || pointer.y > (this.scale?.height??H)) return;
    const point=this.cameras?.main?.getWorldPoint?.(pointer.x,pointer.y)??{x:pointer.x,y:pointer.y};
    if(point.x<0||point.y<0||point.x>W||point.y>H)return;
    this.target = mysteryTarget(this.round.mystery,this.dancer,point,{playBounds:this.stage.playBounds});
    this.game.events.emit('round:input',{kind:pointer.wasTouch?'touch':'mouse',runId:this.round.runId});
    document.querySelector('#game').focus({ preventScroll: true });
  }
  makeSpark(i) {
    const color = COLORS[i % COLORS.length];
    const spark = this.add.container(0, 0).setDepth(10);
    spark.art=createPixelPickup(this,'spark');spark.add(spark.art);
    spark.color = color; spark.phase = i * 1.7; spark.preferBass = i < 3;
    this.placeSpark(spark);
    return spark;
  }
  placeSpark(spark) {
    const avoid = this.crowd.people.map(p=>({x:p.node.x,y:p.node.y,radius:38}));
    if(this.dancer)avoid.push({x:this.dancer.x,y:this.dancer.y,radius:80});
    const pos=findSpawn(this.stage,Math.random,avoid,spark.preferBass);spark.setPosition(pos.x,pos.y);spark.art.setPosition(0,0);
  }
  clearInput() { this.target = null; this.gameControls?.cancel(); this.input.keyboard.resetKeys(); }
  startRound({stage = STAGES[0], rules = {}, outfit, bassChargeMs=0,runId=null,timingId='generic-60-v1',stamina=100,crowdEnabled=true,friendPasses=4} = {}) {
    getTiming(timingId);
    this.stage = stage;this.crowdEnabled=crowdEnabled;this.friendPasses=friendPasses;
    this.background.show(stage); this.fireflies = this.background.fireflies;
    this.crowd.configure(stage); setOutfit(this.avatar, outfit);
    this.round = createRound(rules,timingId); this.round.runId=runId; this.round.bass=createBass(bassChargeMs); this.clearInput(); this.effects.clear(true,true); this.tweens.killAll(); this.tweens.resumeAll();
    if(this.gameControls)this.round.stamina=Math.max(0,Math.min(100,stamina));
    this.mysteryView.reset(this.round.mystery.wrapper);this.candySlot=this.round.mystery.schedule?.slot??0;
    this.avatar.setPosition(0,0);this.bassFeedback.clear();
    this.dancer.setPosition(stage.spawn.x, stage.spawn.y); this.dancer.setRotation(0);
    resetAvatarMotion(this.avatar,{x:this.dancer.x,y:this.dancer.y,elapsed:0});
    this.playerCamera?.reset();
    this.crowd.reset();
    this.crowdSocial?.reset([],0);
    this.flowSlot = -1; this.flowPickup.setVisible(false);
    this.phase = 'cruise';
    this.dropWash.setAlpha(0);
    this.sparks.forEach(s=>this.placeSpark(s));
    this.running = true; this.lastTrail = 0;
    this.gameControls?.refresh();
    this.game.events.emit('round:update', this.round);
  }
  captureRecovery() {
    const {rules,...round}=this.round;
    const copy=structuredClone(round);if(copy.sincePickupMs===Infinity)copy.sincePickupMs=null;
    const friendship=this.crowdSocial?.captureCounts()??[];
    return {round:copy,player:{x:this.dancer.x,y:this.dancer.y},sparks:this.sparks.map(s=>({x:s.x,y:s.y})),candy:{placed:this.mysteryView.placed,x:this.mysteryView.pickup.x,y:this.mysteryView.pickup.y},crowd:this.crowd.people.map((p,index)=>({...structuredClone(p.encounter),friendPasses:friendship[index]??0}))};
  }
  restoreRecovery(value,{stage,rules,outfit,crowdEnabled=true,friendPasses=4}) {
    const timing=roundTiming(value.round);
    this.running=false;this.stage=stage;this.crowdEnabled=crowdEnabled;this.friendPasses=friendPasses;this.background.show(stage);this.fireflies=this.background.fireflies;
    this.crowd.configure(stage);setOutfit(this.avatar,outfit);this.clearInput();this.effects.clear(true,true);this.tweens.killAll();this.tweens.pauseAll();
    this.round={...structuredClone(value.round),rules};if(this.round.sincePickupMs===null)this.round.sincePickupMs=Infinity;
    const elapsed=elapsedMs(this.round),cycle=cycleAt(elapsed,timing);this.phase=cycle.phase;
    this.dancer.setPosition(value.player.x,value.player.y);this.dancer.setRotation(0);this.avatar.setPosition(0,0);
    resetAvatarMotion(this.avatar,{x:this.dancer.x,y:this.dancer.y,elapsed});
    this.playerCamera?.reset();
    this.sparks.forEach((s,i)=>{s.setPosition(value.sparks[i].x,value.sparks[i].y);s.art?.setPosition(0,0);});
    this.mysteryView.reset(this.round.mystery.wrapper);this.candySlot=this.round.mystery.schedule?.slot??0;this.mysteryView.placed=value.candy.placed;this.mysteryView.pickup.setPosition(value.candy.x,value.candy.y);this.mysteryView.update(this.round.mystery,this.reducedMotion);
    this.crowd.restoreRecovery(value.crowd,elapsed,timing);
    this.crowdSocial?.reset(value.crowd.map(person=>person.friendPasses??0),elapsed);
    this.flowSlot=availableFlow(this.round);this.flowPickup.setVisible(this.flowSlot>=0);if(this.flowSlot>=0){const p=stage.flowSpawns[this.flowSlot%stage.flowSpawns.length];this.flowPickup.setPosition(p.x,p.y);}
    this.background.update(elapsed,cycle.phase,this.reducedMotion,timing);this.dropWash.setAlpha(0);
    this.halo.setRadius(this.round.flowMs>0?42:26);this.bassFeedback.clear();drawPlayerBass(this.bassFeedback,this.round.bass,bassFactor(this.dancer,stage.obstacles),elapsed,this.reducedMotion);
    this.lastTrail=0;this.game.events.emit('round:update',this.round);
  }
  activateBassHead(){if(!this.running||!activateBass(this.round))return false;this.game.events.emit('round:bass',{runId:this.round.runId,durationMs:this.round.bass.activeDurationMs});return true;}
  takeCandy(rng=Math.random){
    if(!this.running)return null;
    const effect=collectMystery(this.round,rng);
    if(effect){
      if(effect==='dizzy'&&this.target)this.target=mysteryTarget(this.round.mystery,this.dancer,this.target,{playBounds:this.stage?.playBounds});
      this.game.events.emit('round:mystery',effect);this.game.events.emit('playtest:candy',{effect,runId:this.round.runId});
    }
    return effect;
  }
  pauseRound() { this.running = false; this.clearInput(); this.tweens.pauseAll(); }
  resumeRound() { if (!this.round.ended) { this.running = true; this.clearInput(); this.tweens.resumeAll(); } }
  effect(x,y,color,points,celebrate,label) {
    const text = this.add.text(x,y-19,label || `+${points}`,{fontFamily:'Silkscreen, monospace',fontSize:label?'12px':'16px',color:'#edffd2'}).setOrigin(.5).setDepth(30);
    this.effects.add(text);
    this.tweens.add({targets:text,y:this.reducedMotion?y-19:y-48,alpha:0,duration:800,onComplete:()=>text.destroy()});
    if (this.reducedMotion) return;
    for (let i=0;i<(celebrate?22:7);i++) {
      const angle=Math.random()*Math.PI*2, distance=celebrate?Phaser.Math.Between(40,120):Phaser.Math.Between(15,45);
      const size=Phaser.Math.Between(2,5),p=this.add.rectangle(x,y,size,size,color,.9).setDepth(25); this.effects.add(p);
      this.tweens.add({targets:p,x:x+Math.cos(angle)*distance,y:y+Math.sin(angle)*distance,alpha:0,duration:celebrate?800:450,onComplete:()=>p.destroy()});
    }
  }
  // Practice scenes may supply a different controller without replacing the
  // shared clock, pickups, crowd encounters, hazards or stage rendering.
  movePlayer(delta) {
    const movementDelta = Math.min(delta, 50) * movementFactor(this.dancer,this.stage.mud,this.round.slowedMs,this.stage.obstacles,bassMovementFactor(this.round.bass,bassFactor(this.dancer,this.stage.obstacles)));
    const speed=mysterySpeed(this.round.mystery)*(this.round.surferMs>0?1.25:1);
    const k=this.keys;
    let direction={x:Number(k.D.isDown||k.RIGHT.isDown)-Number(k.A.isDown||k.LEFT.isDown),y:Number(k.S.isDown||k.DOWN.isDown)-Number(k.W.isDown||k.UP.isDown)};
    if(this.gameControls){
      if(direction.x||direction.y)this.game.events.emit('round:input',{kind:'keyboard',runId:this.round.runId});
      return this.gameControls.move(delta,direction);
    }
    if(this.resolveMovementStep){
      if(direction.x||direction.y){this.game.events.emit('round:input',{kind:'keyboard',runId:this.round.runId});this.target=null;direction=mysteryDirection(this.round.mystery,direction);}
      else if(this.target)direction={x:this.target.x-this.dancer.x,y:this.target.y-this.dancer.y};
      const step=this.target?Math.min(movementDelta,Math.hypot(direction.x,direction.y)/speed*1000):movementDelta;
      this.resolveMovementStep(this.dancer,direction,step,{width:W,height:H,playBounds:this.stage.playBounds,obstacles:this.stage.obstacles,speed});
      if(this.target&&Math.hypot(this.target.x-this.dancer.x,this.target.y-this.dancer.y)<1)this.target=null;
      return direction;
    }
    if(direction.x||direction.y) {
      this.game.events.emit('round:input',{kind:'keyboard',runId:this.round.runId});
      this.target=null;
      direction=mysteryDirection(this.round.mystery,direction);
      moveInArena(this.dancer,direction,movementDelta,{width:W,height:H,playBounds:this.stage.playBounds,obstacles:this.stage.obstacles,speed});
    } else if(this.target) {
      direction={x:this.target.x-this.dancer.x,y:this.target.y-this.dancer.y};
      const distance=Math.hypot(direction.x,direction.y),step=Math.min(movementDelta,distance/speed*1000);
      moveInArena(this.dancer,direction,step,{width:W,height:H,playBounds:this.stage.playBounds,obstacles:this.stage.obstacles,speed});
      if(Math.hypot(this.target.x-this.dancer.x,this.target.y-this.dancer.y)<1)this.target=null;
    }
    return direction;
  }
  update(time, delta) {
    this.reducedMotion=this.motionQuery?.matches??this.reducedMotion;
    this.playerCamera?.update(delta);
    if (!this.reducedMotion && (this.running || this.menuAmbient)) {
      this.fireflies.forEach((f,i)=>f.setAlpha(.2+Math.sin(time*.001+i)*.15));
      this.halo.setScale(1+Math.sin(time*.004)*.08);
    }
    if (!this.running) { if(this.menuAmbient)this.background.update(time,'cruise',this.reducedMotion);return; }
    const activeMs=Math.max(0,Math.min(delta,this.round.remainingMs)),inBass=bassFactor(this.dancer,this.stage.obstacles)<1;
    const chargeMs=advanceBass(this.round,activeMs,inBass);
    this.game.events.emit('round:measure',{runId:this.round.runId,activeMs,bassMs:inBass?activeMs:0,chargeMs});
    advanceRound(this.round, delta);
    if (this.round.ended) { this.running=false; this.clearInput(); this.crowdSocial?.paint(); this.mysteryView.update(this.round.mystery,this.reducedMotion); this.game.events.emit('round:update',this.round); this.game.events.emit('round:end',this.round); return; }
    const cycle = cycleAt(elapsedMs(this.round),roundTiming(this.round));
    if (cycle.phase !== this.phase) {
      this.phase = cycle.phase;
      this.game.events.emit('round:phase', cycle.phase);
    }
    this.background.update(elapsedMs(this.round),cycle.phase,this.reducedMotion,roundTiming(this.round));
    this.dropWash.setAlpha(this.reducedMotion ? 0 : cycle.phase === 'drop' ? .045 : 0);
    this.crowdSocial?.beforeMove(delta);
    const beforeMove={x:this.dancer.x,y:this.dancer.y};
    const direction=this.movePlayer(delta),motion=this.gameControls?.motion;
    const drivenSpeed=motion?.actualSpeed??((direction.x||direction.y)&&delta>0?Math.hypot(this.dancer.x-beforeMove.x,this.dancer.y-beforeMove.y)*1000/Math.min(50,delta):0);
    setAvatarMotion(this.avatar,{x:this.dancer.x,y:this.dancer.y,speed:drivenSpeed,sprinting:drivenSpeed>330,elapsed:elapsedMs(this.round)});
    this.dancer.rotation=0;
    if(!this.reducedMotion&&drivenSpeed>1&&time-this.lastTrail>65){this.lastTrail=time;const size=this.round.flowMs>0?6:3,p=this.add.rectangle(this.dancer.x,this.dancer.y+10,size,size,this.round.flowMs>0?0xffd886:0xbdeca6,this.round.flowMs>0?.6:.25).setDepth(8);this.effects.add(p);this.tweens.add({targets:p,alpha:0,duration:450,onComplete:()=>p.destroy()});}
    animateAvatar(this.avatar,elapsedMs(this.round),this.reducedMotion,cycle.phase==='drop');
    const encounters=this.crowd.update(this.dancer, this.round, this.reducedMotion);
    this.crowdSocial?.afterEncounters(encounters);
    this.onCrowdEncounters?.(encounters);
    const mystery=this.round.mystery;
    const candySlot=mystery.schedule?.slot??0;if(candySlot!==this.candySlot){this.candySlot=candySlot;this.mysteryView.reset(mystery.wrapper);}
    if(mystery.phase==='available'&&!this.mysteryView.placed){
      const avoid=[{x:this.dancer.x,y:this.dancer.y,radius:100},...this.sparks.map(s=>({x:s.x,y:s.y,radius:45})),...this.stage.flowSpawns.map(p=>({...p,radius:50})),...this.crowd.people.map(p=>({x:p.node.x,y:p.node.y,radius:38}))];
      const pos=findCandySpawn(this.stage,avoid);
      if(pos){this.mysteryView.pickup.setPosition(pos.x,pos.y);this.mysteryView.placed=true;}
      else skipMystery(mystery);
    }
    if(mystery.phase==='available'&&this.mysteryView.placed&&Phaser.Math.Distance.Between(this.dancer.x,this.dancer.y,this.mysteryView.pickup.x,this.mysteryView.pickup.y)<23){
      this.takeCandy();
    }
    this.mysteryView.update(mystery,this.reducedMotion);
    const slot = availableFlow(this.round);
    if (slot !== this.flowSlot) {
      this.flowSlot = slot;
      this.flowPickup.setVisible(slot >= 0);
      if (slot >= 0) this.flowPickup.setPosition(this.stage.flowSpawns[slot%this.stage.flowSpawns.length].x,this.stage.flowSpawns[slot%this.stage.flowSpawns.length].y);
    }
    if (slot >= 0 && Phaser.Math.Distance.Between(this.dancer.x, this.dancer.y, this.flowPickup.x, this.flowPickup.y) < 29 && activateFlow(this.round)) {
      this.flowPickup.setVisible(false);
      this.effect(this.dancer.x, this.dancer.y, 0xffd886, 0, true, 'FLOW STATE');
      this.game.events.emit('round:flow',{runId:this.round.runId});
    }
    this.halo.setRadius(this.round.flowMs > 0 ? 42 : 26);
    this.halo.setFillStyle(this.round.flowMs > 0 ? 0xffd886 : this.round.slowedMs > 0 ? 0xf2b59b : cycle.phase === 'drop' ? 0xe5ff8c : 0xcfffad, this.round.flowMs > 0 ? .2 : this.round.slowedMs > 0 ? .2 : .09);
    this.bassFeedback.clear();drawPlayerBass(this.bassFeedback,this.round.bass,bassFactor(this.dancer,this.stage.obstacles),elapsedMs(this.round),this.reducedMotion);
    this.sparks.forEach(spark => {
      if (this.round.flowMs > 0) { const old={x:spark.x,y:spark.y};attractSpark(spark,this.dancer,delta);if(!isOpen(spark,8,this.stage.obstacles))spark.setPosition(old.x,old.y); }
      spark.setAlpha(cycle.phase === 'drop' ? 1 : .85);
      updatePixelPickup(spark.art,elapsedMs(this.round)+spark.phase*100,this.reducedMotion);
    });
    for(const spark of this.sparks){if(Phaser.Math.Distance.Between(this.dancer.x,this.dancer.y,spark.x,spark.y)<25){const result=collect(this.round,{playerInBass:bassFactor(this.dancer,this.stage.obstacles)<1,sparkInBass:bassFactor(spark,this.stage.obstacles)<1});this.effect(spark.x,spark.y,spark.color,result.points,result.celebrate);this.game.events.emit('round:pickup',{...result,runId:this.round.runId,chain:this.round.chain,multiplier:this.round.multiplier,pickups:this.round.pickups});this.placeSpark(spark);}}
    const elapsed=elapsedMs(this.round);
    const shakeArt=(position,art)=>{if(typeof art?.setPosition!=='function')return;const offset=bassOffset(position,this.stage.obstacles,elapsed,cycle.phase,this.reducedMotion,roundTiming(this.round));art.setPosition(Math.round(offset.x),Math.round(offset.y))};
    if(this.round.bass.activeMs>0)this.avatar.setPosition(0,0);else shakeArt(this.dancer,this.avatar);
    for(const spark of this.sparks)shakeArt(spark,spark.art);
    shakeArt(this.mysteryView.pickup,this.mysteryView.art);
    // The Flow label stays still; only its central artwork vibrates.
    updatePixelPickup(this.flowPickup.art,elapsed,this.reducedMotion);
    if(this.flowPickup.art)shakeArt(this.flowPickup,this.flowPickup.art);
    this.game.events.emit('round:update',this.round);
  }
}
