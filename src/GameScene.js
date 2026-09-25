import Phaser from 'phaser';
import { createRound, advanceRound, collect, movePlayer, moveToward } from './game.js';
import { cycleAt } from './festival.js';
import { Crowd } from './Crowd.js';

const W = 960, H = 640;
const COLORS = [0xcff598, 0x93ffd6, 0xfaa5d6, 0xc6b0ff];

export class GameScene extends Phaser.Scene {
  constructor() { super('Forest'); this.running = false; this.round = createRound(); }
  create() {
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.drawForest();
    this.dropWash = this.add.rectangle(W / 2, H / 2, W, H, 0xb2efbd, 1).setDepth(1).setAlpha(0);
    this.crowd = new Crowd(this);
    this.effects = this.add.group();
    this.sparks = Array.from({ length: 12 }, (_, i) => this.makeSpark(i));
    this.dancer = this.add.container(480, 380).setDepth(20);
    this.dancer.add(this.add.ellipse(0, 13, 32, 12, 0x041519, .65));
    this.halo = this.add.circle(0, 0, 26, 0xcfffad, .09);
    this.dancer.add(this.halo);
    this.dancer.add(this.add.circle(0, 0, 17, 0x92dfb2, .15));
    const body = this.add.graphics();
    body.lineStyle(4, 0xf4efc5).lineBetween(-4, 8, -7, 16).lineBetween(4, 8, 7, 16);
    body.fillStyle(0xc8f68c).fillRoundedRect(-8, -5, 16, 18, 5);
    body.fillStyle(0xffdab7).fillCircle(0, -11, 7);
    body.fillStyle(0xb997d7).fillEllipse(0, -16, 23, 7).fillRoundedRect(-7, -23, 14, 8, 3);
    body.lineStyle(3, 0xc8f68c).lineBetween(-7, 0, -14, -4).lineBetween(7, 0, 14, -4);
    this.dancer.add(body);
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
  drawForest() {
    const g = this.add.graphics();
    g.fillGradientStyle(0x102430, 0x162036, 0x183c37, 0x153133).fillRect(0, 0, W, H);
    // A soft clearing, hand-drawn terrain rings, and a ribbon of river.
    for (let i = 10; i > 0; i--) g.fillStyle(0x76b6a0, .012).fillEllipse(505, 335, i * 78, i * 45);
    g.fillStyle(0x0b2534, .8).fillPoints([{x:0,y:60},{x:110,y:180},{x:76,y:310},{x:190,y:485},{x:144,y:640},{x:0,y:640}], true);
    g.lineStyle(2, 0x477d88, .25);
    for (let i = 0; i < 17; i++) { const y = 130 + i * 29; const x = 35 + Math.sin(i * .7) * 28 + i * 4; g.lineBetween(x, y, x + 22 + i % 4 * 7, y - 3); }
    g.lineStyle(1, 0x92b8a7, .055);
    for (let i = 0; i < 5; i++) g.strokeEllipse(515, 357, 360 + i * 78, 220 + i * 51);
    const rnd = new Phaser.Math.RandomDataGenerator(['sidequest-forest']);
    for (let i = 0; i < 260; i++) { const x = rnd.between(0, W), y = rnd.between(80, H); g.fillStyle(i % 3 ? 0x90a998 : 0xc0b796, rnd.realInRange(.04, .13)).fillCircle(x, y, rnd.realInRange(.6, 1.6)); }
    // The small geometric stage sits between two banks of trees.
    g.fillStyle(0x091b23).fillRoundedRect(351, 29, 258, 101, 8);
    g.lineStyle(2, 0x83b9a6, .35).strokeTriangle(345, 99, 480, 12, 615, 99);
    g.lineStyle(1, 0xa8dbaf, .3).strokeTriangle(379, 98, 480, 31, 581, 98);
    g.fillStyle(0xc2b5e7, .13).fillTriangle(480, 64, 228, 446, 388, 446);
    g.fillStyle(0x9beec2, .10).fillTriangle(480, 64, 574, 446, 734, 446);
    g.fillStyle(0xd7a3cb, .065).fillTriangle(480, 64, 303, 402, 643, 402);
    g.fillStyle(0x344c48).fillRoundedRect(395, 98, 170, 23, 3);
    for (const x of [369, 565]) { g.fillStyle(0x101d25).fillRoundedRect(x, 66, 25, 51, 3); g.lineStyle(1, 0x708985, .5).strokeCircle(x + 12, 80, 7).strokeCircle(x + 12, 103, 8); }
    g.lineStyle(2, 0xe4d8a6, .7).strokeCircle(480, 66, 22).strokeTriangle(480, 48, 464, 76, 496, 76);
    this.add.text(480, 137, 'THE LIVING FOREST', { fontFamily: 'Arial', fontSize: '9px', color: '#b4c6ac', letterSpacing: 4 }).setOrigin(.5).setAlpha(.6);
    const tree = (x, y, s, color) => {
      g.fillStyle(0x071c21, .35).fillEllipse(x + 8, y + 6, s * .85, s * .23);
      g.fillStyle(0x34443b).fillRect(x - 2, y - s * .26, 4, s * .33);
      g.fillStyle(color).fillTriangle(x, y - s, x - s * .4, y - s * .12, x + s * .4, y - s * .12);
      g.fillStyle(0x719582, .08).fillTriangle(x, y - s, x - s * .32, y - s * .19, x, y - s * .19);
      g.fillStyle(color).fillTriangle(x, y - s * 1.12, x - s * .29, y - s * .43, x + s * .29, y - s * .43);
    };
    for (let i = 0; i < 25; i++) { const x = i * 43 - 25; if (x > 325 && x < 635) continue; tree(x, rnd.between(105, 180), rnd.between(100, 165), i % 2 ? 0x1b3c3d : 0x173035); }
    for (let i = 0; i < 11; i++) { tree(rnd.between(-12, 58), 230 + i * 45, rnd.between(65, 110), 0x183a36); tree(rnd.between(907, 973), 205 + i * 48, rnd.between(70, 120), 0x1d3d38); }
    for (let i = 0; i < 14; i++) tree(i * 78 - 18, 685 + rnd.between(-5, 15), rnd.between(65, 110), 0x102d29);
    for (const [x,y] of [[202,242],[783,200],[811,481],[239,516],[680,556],[126,373]]) {
      g.fillStyle(0xf3c4aa,.7).fillRoundedRect(x-2,y,4,12,2);
      g.fillStyle(0xd695b9,.75).fillEllipse(x,y,19,10);
      g.fillStyle(0xffe7c5,.8).fillCircle(x-3,y-1,1.5).fillCircle(x+4,y,1.5);
    }
    // Lantern strings bridge the canopy.
    for (const side of [-1, 1]) {
      const points = Array.from({length:25},(_,i)=>({x:480+side*i*20,y:24+Math.sin(i/24*Math.PI)*32}));
      g.lineStyle(1,0xa9bc95,.25).strokePoints(points);
      points.filter((_,i)=>i%3===0).forEach(p=>{g.fillStyle(0xf9ce8c,.06).fillCircle(p.x,p.y+4,13);g.fillStyle(0xf9dcaa,.8).fillCircle(p.x,p.y+4,2);});
    }
    this.fireflies = Array.from({length:28},()=>this.add.circle(rnd.between(85,875),rnd.between(140,585),rnd.realInRange(.7,1.7),0xccebab,.3));
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
    for (let attempts = 0; attempts < 30; attempts++) {
      spark.x = Phaser.Math.Between(160, 810); spark.y = Phaser.Math.Between(180, 565);
      const awayFromPlayer = !this.dancer || Phaser.Math.Distance.Between(spark.x,spark.y,this.dancer.x,this.dancer.y) > 80;
      const awayFromCrowd = this.crowd.people.every(person => Phaser.Math.Distance.Between(spark.x,spark.y,person.node.x,person.node.y) > 38);
      if (awayFromPlayer && awayFromCrowd) break;
    }
  }
  clearInput() { this.target = null; this.input.keyboard.resetKeys(); }
  startRound() {
    this.round = createRound(); this.clearInput(); this.effects.clear(true,true); this.tweens.killAll();
    this.dancer.setPosition(480, 380); this.dancer.setRotation(0);
    this.crowd.reset();
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
    if (!this.reducedMotion && this.running) {
      this.sparks.forEach(s=>s.setScale(1+Math.sin(time*.003+s.phase)*.12));
      this.fireflies.forEach((f,i)=>f.setAlpha(.2+Math.sin(time*.001+i)*.15));
      this.halo.setScale(1+Math.sin(time*.004)*.08);
    }
    if (!this.running) return;
    advanceRound(this.round, delta);
    if (this.round.ended) { this.running=false; this.clearInput(); this.game.events.emit('round:update',this.round); this.game.events.emit('round:end',this.round); return; }
    const cycle = cycleAt(60000 - this.round.remainingMs);
    if (cycle.phase !== this.phase) {
      this.phase = cycle.phase;
      this.game.events.emit('round:phase', cycle.phase);
    }
    this.dropWash.setAlpha(this.reducedMotion ? 0 : cycle.phase === 'drop' ? .045 : 0);
    const movementDelta = Math.min(delta, 50) * (this.round.slowedMs > 0 ? .5 : 1);
    const k=this.keys;
    let direction={x:Number(k.D.isDown||k.RIGHT.isDown)-Number(k.A.isDown||k.LEFT.isDown),y:Number(k.S.isDown||k.DOWN.isDown)-Number(k.W.isDown||k.UP.isDown)};
    if(direction.x||direction.y) {
      this.target=null;
      movePlayer(this.dancer,direction,movementDelta,{width:W,height:H});
    } else if(this.target) {
      direction={x:this.target.x-this.dancer.x,y:this.target.y-this.dancer.y};
      if(moveToward(this.dancer,this.target,movementDelta,{width:W,height:H})) this.target=null;
    }
    if(!this.reducedMotion) this.dancer.rotation=(direction.x||direction.y)?Math.sin(time*.015)*.09:0;
    if(!this.reducedMotion&&(direction.x||direction.y)&&time-this.lastTrail>65){this.lastTrail=time;const p=this.add.circle(this.dancer.x,this.dancer.y+10,3,0xbdeca6,.25).setDepth(8);this.effects.add(p);this.tweens.add({targets:p,alpha:0,scale:0,duration:450,onComplete:()=>p.destroy()});}
    this.crowd.update(this.dancer, this.round, this.reducedMotion);
    this.halo.setFillStyle(this.round.slowedMs > 0 ? 0xf2b59b : cycle.phase === 'drop' ? 0xe5ff8c : 0xcfffad, this.round.slowedMs > 0 ? .2 : .09);
    this.sparks.forEach(spark => {
      spark.setAlpha(cycle.phase === 'drop' ? 1 : .85);
      if (this.reducedMotion) spark.setScale(cycle.phase === 'drop' ? 1.15 : 1);
    });
    for(const spark of this.sparks){if(Phaser.Math.Distance.Between(this.dancer.x,this.dancer.y,spark.x,spark.y)<25){const result=collect(this.round);this.effect(spark.x,spark.y,spark.color,result.points,result.celebrate);this.game.events.emit('round:pickup',{...result,multiplier:this.round.multiplier,pickups:this.round.pickups});this.placeSpark(spark);}}
    this.game.events.emit('round:update',this.round);
  }
}
