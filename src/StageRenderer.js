import {getTiming} from './stage-clock.js';
import Phaser from 'phaser';
import {concertLighting,LIGHT_SHOWS} from './concert-lighting.js';
import {BASS_RADIUS,BASS_CORE,speakerCones} from './geometry.js';
import {bassBeat} from './bass-motion.js';
import {drawSpeakerBass} from './bass-feedback.js';
import {pixelEllipse,pixelLine,pixelLantern,pixelizeGraphics,snapPixel} from './pixel-art/shapes.js';
const W=960,H=640;
const steppedOutline=points=>points.flatMap((point,index)=>{
 const next=points[(index+1)%points.length];
 return pixelLine(point.x,point.y,next.x,next.y,2);
});
export class StageRenderer {
 constructor(scene,{venueView}={}){this.scene=scene;this.venueViewFactory=venueView;this.objects=[];}
 show(stage){
  this.destroy();this.stageId=stage.id;this.stageName=stage.name;const before=new Set(this.scene.children.list);this.venueView=this.venueViewFactory?.(this.scene,stage);if(this.venueView)this.fireflies=[];else if(stage.id==='clock-lab')this.drawPractice();else this.drawForest();
  this.lightShow=stage.lighting||LIGHT_SHOWS[stage.id]||LIGHT_SHOWS.forest;
  if(stage.id!=='forest'&&!this.venueView?.ownsLighting)this.scene.add.rectangle(480,320,960,640,stage.palette.wash,.12).setDepth(.1);
  this.concertBeams=[];this.lamps=[];this.canopyLights=[];
  if(!this.venueView?.ownsLighting){
    const show=this.lightShow;
    const lampPositions=this.venueView?.lampPositions??[330,390,450,510,570,630].map(x=>[x,92]);
    for(const [i,[x,y]] of lampPositions.entries()){
      const color=show.colours[i];
      const beam=pixelizeGraphics(this.scene.add.graphics().setPosition(x,y).setDepth(.2));
      beam.fillStyle(color,.55).fillTriangle(0,0,-show.width,760,show.width,760);
      beam.fillStyle(color,.45).fillTriangle(0,0,-show.core,760,show.core,760).setAlpha(.045);
      this.concertBeams.push(beam);
      this.lamps.push(this.scene.add.rectangle(x,y,8,6,color,.3).setDepth(.3));
    }
    for(const [i,x,y] of [[0,95,240],[1,865,240],[2,135,510],[3,825,510]]){
      const pool=pixelizeGraphics(this.scene.add.graphics().setPosition(x,y).setDepth(.15),4);
      const color=show.pools[i];
      for(let r=5;r>0;r--)pool.fillStyle(color,.025).fillEllipse(0,0,r*65,r*95);
      this.canopyLights.push(pool);
    }
  }
  for(const o of stage.mud){
   const g=this.scene.add.graphics().setDepth(2),cx=o.x+o.width/2,cy=o.y+o.height/2;
   // The physics polygon stays untouched. Only the painted edge is stepped.
   const edge=steppedOutline(o.points);
   g.fillStyle(0x89684f,.9).fillPoints(edge,true);
   g.lineStyle(2,0xcfaa72,.7).strokePoints(edge,true);
   const inner=o.points.map(p=>({x:cx+(p.x-cx)*.7,y:cy+(p.y-cy)*.65}));
   g.fillStyle(0x594b3c,.65).fillPoints(steppedOutline(inner),true);
   for(const [dx,dy,w] of [[-22,-13,15],[12,15,19],[25,-9,10]]){
    g.fillStyle(0xe1bd88,.35).fillRect(snapPixel(cx+dx),snapPixel(cy+dy),w,2);
    g.fillStyle(0x352f2b,.45).fillRect(snapPixel(cx+dx+4),snapPixel(cy+dy+4),6,2);
   }
  }
  this.bassPulses=[];this.speakerCones=[];
  for(const o of stage.obstacles){
   for(const {x,y} of speakerCones(o)){
    const zone=this.scene.add.graphics().setDepth(1);
    zone.fillStyle(0xf0b96b,.018).fillPoints(pixelEllipse(x,y,BASS_RADIUS*2,BASS_RADIUS*2),true);
    zone.lineStyle(1,0xf0c986,.18).strokePoints(pixelEllipse(x,y,BASS_RADIUS*2,BASS_RADIUS*2),true);
    zone.lineStyle(1,0xf0c986,.07).strokePoints(pixelEllipse(x,y,BASS_CORE*2,BASS_CORE*2),true);
    const pulse=this.scene.add.graphics().setPosition(x,y).setDepth(1.1);
    this.bassPulses.push(pulse);
   }
   const g=this.scene.add.graphics().setDepth(4);
   g.fillStyle(0x071820).fillRect(o.x,o.y,o.width,o.height);
   g.lineStyle(2,stage.palette.accent,.65).strokeRect(o.x,o.y,o.width,o.height);
   g.fillStyle(0x344b54).fillRect(o.x+2,o.y+2,o.width-4,3);
   g.fillStyle(0x030e17).fillRect(o.x+o.width-5,o.y+5,3,o.height-7);
   for(const x of [o.x+4,o.x+o.width-6])for(const y of [o.y+6,o.y+o.height-6])g.fillStyle(0x7f9597,.7).fillRect(x,y,2,2);
   const bins=o.width>=90?2:1,binWidth=o.width/bins;
   for(let i=0;i<bins;i++){
    const {x:cx,y:cy,radius:r}=speakerCones(o)[i];
    g.fillStyle(0x132c37).fillPoints(pixelEllipse(cx,cy,r*2,r*2),true);
    g.lineStyle(2,0x6c8990,.7).strokePoints(pixelEllipse(cx,cy,r*2,r*2),true);
    const cone=this.scene.add.graphics().setPosition(cx,cy).setDepth(4.1);
    cone.lineStyle(2,0x9cb9bb,.8).strokePoints(pixelEllipse(0,0,r*1.3,r*1.3),true).strokePoints(pixelEllipse(0,0,r*.6,r*.6),true);
    cone.fillStyle(0x071820).fillRect(-2,-2,4,4);
    this.speakerCones.push(cone);
    g.fillStyle(0x344b54).fillRect(cx-binWidth*.28,o.y+8,binWidth*.56,5);
    if(i)g.lineStyle(1,0x6c8990,.4).lineBetween(o.x+i*binWidth,o.y+4,o.x+i*binWidth,o.y+o.height-4);
   }
  }
  this.objects=this.scene.children.list.filter(o=>!before.has(o));
 }
 update(elapsed,phase,reduced,timing=getTiming()){
  this.venueView?.update(elapsed,phase,reduced,timing);
  if(!this.venueView?.ownsLighting){
    const light=concertLighting(elapsed,reduced,this.stageId,timing,this.lightShow);
    this.concertBeams.forEach((b,i)=>{b.rotation=(i-2.5)*.17*light.spread+light.sweep*(i%2?1:-1);b.setAlpha(light.alpha);b.setScale(1+light.fan*.25,1);});
    this.lamps.forEach(l=>l.setAlpha(light.glow));
    this.canopyLights.forEach((l,i)=>{l.setAlpha(reduced?.65:.65+.25*Math.sin(elapsed*.0007+i*1.5));l.setScale(reduced?1:1+.09*Math.sin(elapsed*.0004+i));});
  }
  const pulse=bassBeat(elapsed,timing),strength=phase==='drop'?1.5:1;
  this.bassPulses?.forEach(p=>{p.clear();drawSpeakerBass(p,elapsed,phase,reduced,timing);});
  this.speakerCones?.forEach(c=>c.setScale(reduced?1:1+pulse*.1*strength));
 }
 destroy(){this.objects.forEach(o=>o.destroy());this.objects=[];this.venueView?.destroy?.();this.venueView=null;}
  drawPractice(){
    const g=this.scene.add.graphics();g.fillStyle(0x14252c).fillRect(0,0,W,H);
    g.lineStyle(1,0x91b8c1,.09);
    for(let x=0;x<W;x+=80)g.lineBetween(x,0,x,H);
    for(let y=0;y<H;y+=80)g.lineBetween(0,y,W,y);
    g.lineStyle(2,0xa9cfd2,.25).strokeRect(40,40,W-80,H-80);
    this.fireflies=[];
  }
  drawForest() {
    const g = this.scene.add.graphics();
    // Flat colour ramps and clustered dither keep the clearing quiet enough
    // for dancers and pickups, while matching the new pixel venue plates.
    g.fillStyle(0x102430).fillRect(0,0,W,H);
    for(const [y,h,color] of [[112,128,0x122b34],[240,160,0x153437],[400,160,0x163736],[560,80,0x12312f]])g.fillStyle(color).fillRect(0,y,W,h);
    for(let i=5;i>0;i--)g.fillStyle(0x76b6a0,.018).fillPoints(pixelEllipse(505,335,i*150,i*87,6),true);
    const river=[{x:0,y:60},{x:110,y:180},{x:76,y:310},{x:190,y:485},{x:144,y:640},{x:0,y:640}];
    g.fillStyle(0x0b2534,.9).fillPoints(steppedOutline(river),true);
    for(let i=0;i<17;i++){
      const y=130+i*29,x=snapPixel(35+Math.sin(i*.7)*28+i*4);
      g.fillStyle(0x477d88,.32).fillRect(x,snapPixel(y),22+i%4*7,2);
      g.fillStyle(0x70a9a7,.18).fillRect(x+8,snapPixel(y+4),8,2);
    }
    g.lineStyle(2,0x92b8a7,.045);
    for(let i=0;i<4;i++)g.strokePoints(pixelEllipse(515,357,400+i*88,250+i*51,6),true);
    const rnd=new Phaser.Math.RandomDataGenerator(['sidequest-forest']);
    for(let i=0;i<260;i++){
      const x=snapPixel(rnd.between(0,W)),y=snapPixel(rnd.between(80,H));
      const alpha=rnd.realInRange(.04,.13),wide=i%5===0?4:2;
      g.fillStyle(i%3?0x90a998:0xc0b796,alpha).fillRect(x,y,wide,2);
      if(i%4===0)g.fillRect(x+4,y+4,2,2);
    }
    // Keep the original booth and lamp anchors; redraw their materials.
    g.fillStyle(0x091b23).fillRect(351,29,258,101);
    g.lineStyle(3,0x83b9a6,.6).strokePoints(steppedOutline([{x:345,y:99},{x:480,y:12},{x:615,y:99}]),true);
    g.lineStyle(2,0xa8dbaf,.35).strokePoints(steppedOutline([{x:379,y:98},{x:480,y:31},{x:581,y:98}]),true);
    g.fillStyle(0x344c48).fillRect(395,98,170,23);
    g.fillStyle(0x779b81,.45).fillRect(395,98,170,3);
    for(let x=401;x<562;x+=12)g.fillStyle(0x1d3736).fillRect(x,104,8,14);
    for(const x of [369,565]){
      g.fillStyle(0x101d25).fillRect(x,66,25,51);
      g.lineStyle(2,0x708985,.5).strokePoints(pixelEllipse(x+12,80,14,14),true).strokePoints(pixelEllipse(x+12,103,16,16),true);
    }
    g.lineStyle(2,0xe4d8a6,.7).strokePoints(pixelEllipse(480,66,44,44),true).strokePoints(steppedOutline([{x:480,y:48},{x:464,y:76},{x:496,y:76}]),true);
    this.scene.add.text(480,137,this.stageName.toUpperCase(),{fontFamily:'monospace',fontStyle:'bold',fontSize:'10px',color:'#b4c6ac',letterSpacing:3}).setOrigin(.5).setAlpha(.6);
    const tree=(x,y,s,color)=>{
      x=snapPixel(x);y=snapPixel(y);
      g.fillStyle(0x071c21,.35).fillPoints(pixelEllipse(x+8,y+6,s*.85,s*.23,4),true);
      g.fillStyle(0x172b2b).fillRect(x-4,snapPixel(y-s*.28),8,snapPixel(s*.34));
      g.fillStyle(0x587062,.55).fillRect(x-2,snapPixel(y-s*.25),2,snapPixel(s*.3));
      // Seven flat, stepped boughs give a full silhouette at phone scale.
      for(let tier=6;tier>=0;tier--){
        const yy=snapPixel(y-s*1.1+tier*s*.14,4),half=Math.max(4,snapPixel(s*(.035+tier*.055),4));
        const h=Math.max(4,snapPixel(s*.19,4));
        g.fillStyle(0x0c262c).fillRect(x-half-4,yy+4,half*2+8,h);
        g.fillStyle(color).fillRect(x-half,yy,half*2,h);
        g.fillStyle(0x719582,.16).fillRect(x-half,yy,half,4);
        if(tier%2===0)g.fillStyle(0x102c31,.45).fillRect(x+4,yy+8,Math.max(4,half-4),4);
      }
    };
    for(let i=0;i<25;i++){const x=i*43-25;if(x>325&&x<635)continue;tree(x,rnd.between(105,180),rnd.between(100,165),i%2?0x1b3c3d:0x173035);}
    for(let i=0;i<11;i++){tree(rnd.between(-12,58),230+i*45,rnd.between(65,110),0x183a36);tree(rnd.between(907,973),205+i*48,rnd.between(70,120),0x1d3d38);}
    for(let i=0;i<14;i++)tree(i*78-18,685+rnd.between(-5,15),rnd.between(65,110),0x102d29);
    for(const [x,y]of [[202,242],[783,200],[811,481],[239,516],[680,556],[126,373]]){
      g.fillStyle(0x14252d).fillRect(x-4,y-2,8,15).fillRect(x-11,y-4,22,6);
      g.fillStyle(0xf3c4aa,.9).fillRect(x-2,y+1,4,10);
      g.fillStyle(0xa3649b).fillRect(x-10,y-3,20,5);
      g.fillStyle(0xd695b9).fillRect(x-7,y-6,14,4).fillRect(x-4,y-8,8,3);
      g.fillStyle(0xffe7c5,.9).fillRect(x-4,y-5,2,2).fillRect(x+4,y-2,2,2);
    }
    // Lantern strings retain their original canopy positions.
    for(const side of [-1,1]){
      const points=Array.from({length:25},(_,i)=>({x:480+side*i*20,y:24+Math.sin(i/24*Math.PI)*32}));
      g.lineStyle(1,0xa9bc95,.25);
      for(let i=1;i<points.length;i++)g.strokePoints(pixelLine(points[i-1].x,points[i-1].y,points[i].x,points[i].y));
      points.filter((_,i)=>i%3===0).forEach(p=>{
        g.fillStyle(0xf9ce8c,.045).fillPoints(pixelEllipse(p.x,p.y+4,24,24,4),true);
        pixelLantern(g,snapPixel(p.x),snapPixel(p.y+5),{scale:.22,alpha:.85});
      });
    }
    this.fireflies=Array.from({length:28},()=>this.scene.add.rectangle(rnd.between(85,875),rnd.between(140,585),2,2,0xccebab,.3));
  }
}
