import Phaser from 'phaser';
import {concertLighting} from './concert-lighting.js';
import {BASS_RADIUS,BASS_CORE,speakerCones} from './geometry.js';
import {bassBeat} from './bass-motion.js';
const W=960,H=640;
export class StageRenderer {
 constructor(scene){this.scene=scene;this.objects=[];}
 show(stage){
  this.destroy();this.stageId=stage.id;this.stageName=stage.name;const before=new Set(this.scene.children.list);this.drawForest();
  if(stage.id!=='forest')this.scene.add.rectangle(480,320,960,640,stage.palette.wash,.12).setDepth(.1);
  this.beams=[this.scene.add.triangle(340,240,0,0,140,420,280,0,stage.palette.accent,.035).setDepth(.2),this.scene.add.triangle(630,240,0,0,140,420,280,0,stage.palette.accent,.035).setDepth(.2)];
  this.concertBeams=[];this.lamps=[];this.canopyLights=[];
  if(stage.id==='forest'){
    this.beams.forEach(b=>b.setVisible(false));
    for(const [i,x] of [330,390,450,510,570,630].entries()){
      const color=[0xffd494,0x93dcc4,0xbca2ef,0xff99c8,0x93dcc4,0xffd494][i];
      const beam=this.scene.add.graphics().setPosition(x,92).setDepth(.2);
      beam.fillStyle(color,.55).fillTriangle(0,0,-160,760,160,760);
      beam.fillStyle(color,.45).fillTriangle(0,0,-45,760,45,760).setAlpha(.045);
      this.concertBeams.push(beam);
      this.lamps.push(this.scene.add.circle(x,92,5,color,.3).setDepth(.3));
    }
    for(const [i,x,y] of [[0,95,240],[1,865,240],[2,135,510],[3,825,510]]){
      const pool=this.scene.add.graphics().setPosition(x,y).setDepth(.15);
      const color=[0x79e6bc,0xc19cff,0xffb678,0x91bfff][i];
      for(let r=5;r>0;r--)pool.fillStyle(color,.025).fillEllipse(0,0,r*65,r*95);
      this.canopyLights.push(pool);
    }
  }
  for(const o of stage.mud){
   const g=this.scene.add.graphics().setDepth(2),cx=o.x+o.width/2,cy=o.y+o.height/2;
   g.fillStyle(0x89684f,.8).fillPoints(o.points,true);
   g.lineStyle(2,0xcfaa72,.7).strokePoints(o.points,true);
   const inner=o.points.map(p=>({x:cx+(p.x-cx)*.7,y:cy+(p.y-cy)*.65}));
   g.fillStyle(0x594b3c,.45).fillPoints(inner,true);
   g.lineStyle(1,0xe1bd88,.3);
   for(const [dx,dy,w] of [[-22,-13,15],[12,15,19],[25,-9,10]])g.lineBetween(cx+dx,cy+dy,cx+dx+w,cy+dy-2);
  }
  this.bassPulses=[];this.speakerCones=[];
  for(const o of stage.obstacles){
   for(const {x,y} of speakerCones(o)){
    const zone=this.scene.add.graphics().setDepth(1);
    zone.fillStyle(0xf0b96b,.018).fillCircle(x,y,BASS_RADIUS);
    zone.lineStyle(1,0xf0c986,.18).strokeCircle(x,y,BASS_RADIUS);
    zone.lineStyle(1,0xf0c986,.07).strokeCircle(x,y,BASS_CORE);
    const pulse=this.scene.add.graphics().setPosition(x,y).setDepth(1.1);
    pulse.fillStyle(0xefac68,.025).fillCircle(0,0,BASS_CORE);
    pulse.lineStyle(1,0xf0c986,.14).strokeCircle(0,0,BASS_CORE);
    pulse.lineStyle(1,0xf0c986,.07).strokeCircle(0,0,80);
    this.bassPulses.push(pulse);
   }
   const g=this.scene.add.graphics().setDepth(4);
   g.fillStyle(0x071820).fillRoundedRect(o.x,o.y,o.width,o.height,4);
   g.lineStyle(2,stage.palette.accent,.65).strokeRoundedRect(o.x,o.y,o.width,o.height,4);
   const bins=o.width>=90?2:1,binWidth=o.width/bins;
   for(let i=0;i<bins;i++){
    const {x:cx,y:cy,radius:r}=speakerCones(o)[i];
    g.lineStyle(2,0x6c8990,.7).strokeCircle(cx,cy,r);
    const cone=this.scene.add.graphics().setPosition(cx,cy).setDepth(4.1);
    cone.lineStyle(2,0x9cb9bb,.8).strokeCircle(0,0,r*.65).strokeCircle(0,0,r*.3);
    this.speakerCones.push(cone);
    g.fillStyle(0x344b54).fillRoundedRect(cx-binWidth*.28,o.y+8,binWidth*.56,5,2);
    if(i)g.lineStyle(1,0x6c8990,.4).lineBetween(o.x+i*binWidth,o.y+4,o.x+i*binWidth,o.y+o.height-4);
   }
  }
  this.objects=this.scene.children.list.filter(o=>!before.has(o));
 }
 update(elapsed,phase,reduced){
  this.beams?.forEach((b,i)=>{b.rotation=reduced?0:Math.sin(elapsed*.0004+i)*.18;b.setAlpha(reduced?.035:phase==='drop'?.12:.05)});
  if(this.stageId==='forest'){
    const light=concertLighting(elapsed,reduced);
    this.concertBeams.forEach((b,i)=>{b.rotation=(i-2.5)*.17*light.spread+light.sweep*(i%2?1:-1);b.setAlpha(light.alpha);b.setScale(1+light.fan*.25,1);});
    this.lamps.forEach(l=>l.setAlpha(light.glow));
    this.canopyLights.forEach((l,i)=>{l.setAlpha(reduced?.65:.65+.25*Math.sin(elapsed*.0007+i*1.5));l.setScale(reduced?1:1+.09*Math.sin(elapsed*.0004+i));});
  }
  const pulse=bassBeat(elapsed),strength=phase==='drop'?1.5:1;
  this.bassPulses?.forEach(p=>{p.setAlpha(reduced?1:.35+pulse*.65);p.setScale(reduced?1:1+pulse*.09*strength)});
  this.speakerCones?.forEach(c=>c.setScale(reduced?1:1+pulse*.1*strength));
 }
 destroy(){this.objects.forEach(o=>o.destroy());this.objects=[];}
  drawForest() {
    const g = this.scene.add.graphics();
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
    if(this.stageId!=='forest'){
    g.fillStyle(0xc2b5e7, .13).fillTriangle(480, 64, 228, 446, 388, 446);
    g.fillStyle(0x9beec2, .10).fillTriangle(480, 64, 574, 446, 734, 446);
    g.fillStyle(0xd7a3cb, .065).fillTriangle(480, 64, 303, 402, 643, 402);
    }
    g.fillStyle(0x344c48).fillRoundedRect(395, 98, 170, 23, 3);
    for (const x of [369, 565]) { g.fillStyle(0x101d25).fillRoundedRect(x, 66, 25, 51, 3); g.lineStyle(1, 0x708985, .5).strokeCircle(x + 12, 80, 7).strokeCircle(x + 12, 103, 8); }
    g.lineStyle(2, 0xe4d8a6, .7).strokeCircle(480, 66, 22).strokeTriangle(480, 48, 464, 76, 496, 76);
    this.scene.add.text(480, 137, this.stageName.toUpperCase(), { fontFamily: 'Arial', fontSize: '9px', color: '#b4c6ac', letterSpacing: 4 }).setOrigin(.5).setAlpha(.6);
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
    this.fireflies = Array.from({length:28},()=>this.scene.add.circle(rnd.between(85,875),rnd.between(140,585),rnd.realInRange(.7,1.7),0xccebab,.3));
  }
}
