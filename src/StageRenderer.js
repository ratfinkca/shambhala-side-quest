import Phaser from 'phaser';
const W=960,H=640;
export class StageRenderer {
 constructor(scene){this.scene=scene;this.objects=[];}
 show(stage){
  this.destroy();this.stageName=stage.name;const before=new Set(this.scene.children.list);this.drawForest();
  if(stage.id!=='forest')this.scene.add.rectangle(480,320,960,640,stage.palette.wash,.12).setDepth(.1);
  this.beams=[this.scene.add.triangle(340,240,0,0,140,420,280,0,stage.palette.accent,.035).setDepth(.2),this.scene.add.triangle(630,240,0,0,140,420,280,0,stage.palette.accent,.035).setDepth(.2)];
  for(const o of stage.mud){this.scene.add.rectangle(o.x+o.width/2,o.y+o.height/2,o.width,o.height,0x89684f,.7).setStrokeStyle(2,0xcfaa72,.7).setDepth(2);this.scene.add.text(o.x+o.width/2,o.y+o.height/2,'MUD',{fontFamily:'Arial',fontSize:'11px',color:'#ffe0ad'}).setOrigin(.5).setDepth(3);}
  for(const o of stage.obstacles){const g=this.scene.add.graphics().setDepth(4);g.fillStyle(0x071820).fillRoundedRect(o.x,o.y,o.width,o.height,7);g.lineStyle(2,stage.palette.accent,.65).strokeRoundedRect(o.x,o.y,o.width,o.height,7);g.lineStyle(3,0x6c8990,.7).strokeCircle(o.x+o.width/2,o.y+o.height/2,20).strokeCircle(o.x+o.width/2,o.y+o.height/2,9);}
  this.objects=this.scene.children.list.filter(o=>!before.has(o));
 }
 update(elapsed,phase,reduced){this.beams?.forEach((b,i)=>{b.rotation=reduced?0:Math.sin(elapsed*.0004+i)*.18;b.setAlpha(reduced?.035:phase==='drop'?.12:.05)});}
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
    g.fillStyle(0xc2b5e7, .13).fillTriangle(480, 64, 228, 446, 388, 446);
    g.fillStyle(0x9beec2, .10).fillTriangle(480, 64, 574, 446, 734, 446);
    g.fillStyle(0xd7a3cb, .065).fillTriangle(480, 64, 303, 402, 643, 402);
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
