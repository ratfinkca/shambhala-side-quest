import Phaser from 'phaser';
import { createRound, advanceRound, collect } from './game.js';
import { cycleAt } from './festival.js';
import { availableFlow, activateFlow, attractSpark } from './flow.js';
import { StageRenderer } from './StageRenderer.js';
import { createAvatar, setOutfit } from './Avatar.js';
import { STAGES } from './stages.js';
import { moveInArena, findSpawn, movementFactor, isOpen } from './geometry.js';
import { Crowd } from './Crowd.js';

const W = 960, H = 640;
const COLORS = [0xcff598, 0x93ffd6, 0xfaa5d6, 0xc6b0ff];

export class GameScene extends Phaser.Scene {
  constructor() { super('Forest'); this.running = false; this.round = createRound(); }
  create() {
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.stage = STAGES[0];
    this.background = new StageRenderer(this);
    this.background.show(this.stage);
    this.fireflies = this.background.fireflies;
    this.dropWash = this.add.rectangle(W / 2, H / 2, W, H, 0xb2efbd, 1).setDepth(1).setAlpha(0);
    this.crowd = new Crowd(this);
    this.effects = this.add.group();
    this.sparks = Array.from({ length: 12 }, (_, i) => this.makeSpark(i));
    this.dancer = this.add.container(480, 380).setDepth(20);
    this.dancer.add(this.add.ellipse(0, 13, 32, 12, 0x041519, .65));
    this.halo = this.add.circle(0, 0, 26, 0xcfffad, .09);
    this.dancer.add(this.halo);
    this.dancer.add(this.add.circle(0, 0, 17, 0x92dfb2, .15));
    this.avatar = createAvatar(this);
    this.dancer.add(this.avatar);
    this.flowPickup = this.add.container(0, 0).setDepth(15).setVisible(false);
    this.flowPickup.add(this.add.circle(0, 0, 30, 0xffd886, .12));
    this.flowPickup.add(this.add.star(0, 0, 4, 9, 20, 0xffd886).setStrokeStyle(2, 0xfff8d9));
    this.flowPickup.add(this.add.text(0, 32, 'FLOW', {fontFamily:'Arial',fontSize:'12px',color:'#ffe3a3'}).setOrigin(.5));
    this.flowSlot = -1;
    this.target = null;
    this.keys = this.input.keyboard.addKeys('W,A,S,D,UP,DOWN,LEFT,RIGHT');
    this.input.keyboard.removeCapture(['W', 'A', 'S', 'D', 'UP', 'DOWN', 'LEFT', 'RIGHT']);
    const point = pointer => {
      if (!this.running || pointer.event?.target !== this.game.canvas || pointer.x < 0 || pointer.y < 0 || pointer.x > W || pointer.y > H) return;
      this.target = { x: pointer.x, y: pointer.y };
      document.querySelector('#game').focus({ preventScroll: true });
    };
    this.input.on('pointerdown', point);
    this.input.on('pointermove', pointer => { if (pointer.pointerType !== 'touch' || pointer.isDown) point(pointer); });
    this.game.events.emit('forest:ready', this);
  }
  makeSpark(i) {
    const color = COLORS[i % COLORS.length];
    const spark = this.add.container(0, 0).setDepth(10);
    spark.add(this.add.circle(0, 0, 20, color, .035));
    spark.add(this.add.circle(0, 0, 13, color, .09));
    spark.add(this.add.star(0, 0, 4, 3, 8, color, .95).setRotation(Math.PI / 4));
    spark.add(this.add.circle(0, 0, 2, 0xffffff, .95));
    spark.color = color; spark.phase = i * 1.7;
    this.placeSpark(spark);
    return spark;
  }
  placeSpark(spark) {
    const avoid = this.crowd.people.map(p=>({x:p.node.x,y:p.node.y,radius:38}));
    if(this.dancer)avoid.push({x:this.dancer.x,y:this.dancer.y,radius:80});
    const pos=findSpawn(this.stage,Math.random,avoid);spark.setPosition(pos.x,pos.y);
  }
  clearInput() { this.target = null; this.input.keyboard.resetKeys(); }
  startRound({stage = STAGES[0], rules = {}, outfit} = {}) {
    this.stage = stage;
    this.background.show(stage); this.fireflies = this.background.fireflies;
    this.crowd.configure(stage); setOutfit(this.avatar, outfit);
    this.round = createRound(rules); this.clearInput(); this.effects.clear(true,true); this.tweens.killAll(); this.tweens.resumeAll();
    this.dancer.setPosition(stage.spawn.x, stage.spawn.y); this.dancer.setRotation(0);
    this.crowd.reset();
    this.flowSlot = -1; this.flowPickup.setVisible(false);
    this.phase = 'cruise';
    this.dropWash.setAlpha(0);
    this.sparks.forEach(s=>this.placeSpark(s));
    this.running = true; this.lastTrail = 0;
    this.game.events.emit('round:update', this.round);
  }
  pauseRound() { this.running = false; this.clearInput(); this.tweens.pauseAll(); }
  resumeRound() { if (!this.round.ended) { this.running = true; this.clearInput(); this.tweens.resumeAll(); } }
  effect(x,y,color,points,celebrate,label) {
    const text = this.add.text(x,y-19,label || `+${points}`,{fontFamily:'Arial',fontSize:label?'12px':'17px',fontStyle:'bold',color:'#edffd2'}).setOrigin(.5).setDepth(30);
    this.effects.add(text);
    this.tweens.add({targets:text,y:this.reducedMotion?y-19:y-48,alpha:0,duration:800,onComplete:()=>text.destroy()});
    if (this.reducedMotion) return;
    for (let i=0;i<(celebrate?22:7);i++) {
      const angle=Math.random()*Math.PI*2, distance=celebrate?Phaser.Math.Between(40,120):Phaser.Math.Between(15,45);
      const p=this.add.circle(x,y,Phaser.Math.Between(1,3),color,.9).setDepth(25); this.effects.add(p);
      this.tweens.add({targets:p,x:x+Math.cos(angle)*distance,y:y+Math.sin(angle)*distance,alpha:0,scale:0,duration:celebrate?800:450,onComplete:()=>p.destroy()});
    }
  }
  update(time, delta) {
    if (!this.reducedMotion && (this.running || this.menuAmbient)) {
      this.sparks.forEach(s=>s.setScale(1+Math.sin(time*.003+s.phase)*.12));
      this.fireflies.forEach((f,i)=>f.setAlpha(.2+Math.sin(time*.001+i)*.15));
      this.halo.setScale(1+Math.sin(time*.004)*.08);
    }
    if (!this.running) { if(this.menuAmbient)this.background.update(time,'cruise',this.reducedMotion);return; }
    advanceRound(this.round, delta);
    if (this.round.ended) { this.running=false; this.clearInput(); this.game.events.emit('round:update',this.round); this.game.events.emit('round:end',this.round); return; }
    const cycle = cycleAt(60000 - this.round.remainingMs);
    if (cycle.phase !== this.phase) {
      this.phase = cycle.phase;
      this.game.events.emit('round:phase', cycle.phase);
    }
    this.background.update(60000-this.round.remainingMs,cycle.phase,this.reducedMotion);
    this.dropWash.setAlpha(this.reducedMotion ? 0 : cycle.phase === 'drop' ? .045 : 0);
    const movementDelta = Math.min(delta, 50) * movementFactor(this.dancer,this.stage.mud,this.round.slowedMs);
    const k=this.keys;
    let direction={x:Number(k.D.isDown||k.RIGHT.isDown)-Number(k.A.isDown||k.LEFT.isDown),y:Number(k.S.isDown||k.DOWN.isDown)-Number(k.W.isDown||k.UP.isDown)};
    if(direction.x||direction.y) {
      this.target=null;
      moveInArena(this.dancer,direction,movementDelta,{width:W,height:H,obstacles:this.stage.obstacles});
    } else if(this.target) {
      direction={x:this.target.x-this.dancer.x,y:this.target.y-this.dancer.y};
      const distance=Math.hypot(direction.x,direction.y),step=Math.min(movementDelta,distance/300*1000);
      moveInArena(this.dancer,direction,step,{width:W,height:H,obstacles:this.stage.obstacles});
      if(Math.hypot(this.target.x-this.dancer.x,this.target.y-this.dancer.y)<1)this.target=null;
    }
    if(!this.reducedMotion) this.dancer.rotation=(direction.x||direction.y)?Math.sin(time*.015)*.09:0;
    if(!this.reducedMotion&&(direction.x||direction.y)&&time-this.lastTrail>65){this.lastTrail=time;const p=this.add.circle(this.dancer.x,this.dancer.y+10,this.round.flowMs > 0 ? 6 : 3,this.round.flowMs > 0 ? 0xffd886 : 0xbdeca6,this.round.flowMs > 0 ? .6 : .25).setDepth(8);this.effects.add(p);this.tweens.add({targets:p,alpha:0,scale:0,duration:450,onComplete:()=>p.destroy()});}
    this.crowd.update(this.dancer, this.round, this.reducedMotion);
    const slot = availableFlow(this.round);
    if (slot !== this.flowSlot) {
      this.flowSlot = slot;
      this.flowPickup.setVisible(slot >= 0);
      if (slot >= 0) this.flowPickup.setPosition(this.stage.flowSpawns[slot].x,this.stage.flowSpawns[slot].y);
    }
    if (slot >= 0 && Phaser.Math.Distance.Between(this.dancer.x, this.dancer.y, this.flowPickup.x, this.flowPickup.y) < 29 && activateFlow(this.round)) {
      this.flowPickup.setVisible(false);
      this.effect(this.dancer.x, this.dancer.y, 0xffd886, 0, true, 'FLOW STATE');
      this.game.events.emit('round:flow');
    }
    this.halo.setRadius(this.round.flowMs > 0 ? 42 : 26);
    this.halo.setFillStyle(this.round.flowMs > 0 ? 0xffd886 : this.round.slowedMs > 0 ? 0xf2b59b : cycle.phase === 'drop' ? 0xe5ff8c : 0xcfffad, this.round.flowMs > 0 ? .2 : this.round.slowedMs > 0 ? .2 : .09);
    this.sparks.forEach(spark => {
      if (this.round.flowMs > 0) { const old={x:spark.x,y:spark.y};attractSpark(spark,this.dancer,delta);if(!isOpen(spark,8,this.stage.obstacles))spark.setPosition(old.x,old.y); }
      spark.setAlpha(cycle.phase === 'drop' ? 1 : .85);
      if (this.reducedMotion) spark.setScale(cycle.phase === 'drop' ? 1.15 : 1);
    });
    for(const spark of this.sparks){if(Phaser.Math.Distance.Between(this.dancer.x,this.dancer.y,spark.x,spark.y)<25){const result=collect(this.round);this.effect(spark.x,spark.y,spark.color,result.points,result.celebrate);this.game.events.emit('round:pickup',{...result,multiplier:this.round.multiplier,pickups:this.round.pickups});this.placeSpark(spark);}}
    this.game.events.emit('round:update',this.round);
  }
}
