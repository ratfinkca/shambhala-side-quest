import Phaser from 'phaser';
// An original comic miniature resort, not a reconstruction of backstage.
export function preload(){}
export function createView(scene,stage){
 if(stage.id!=='smf-villagio')return null;
 const g=scene.add.graphics().setDepth(-2);
 g.fillStyle(0x102a30).fillRect(0,0,960,640);
 for(let i=0;i<15;i++){
  const x=i*72-20;
  g.fillStyle(i%2?0x16453c:0x193b37).fillTriangle(x,0,x-80,250,x+80,250);
  g.lineStyle(2,0x9ccda1,.08).lineBetween(x,20,x,260);
 }
 // Tiny, gloriously overblown country-club facade and gold tower crowns.
 g.fillStyle(0x13282e).fillRoundedRect(270,80,420,140,10);
 g.fillStyle(0x493c39).fillRect(290,94,380,108);
 g.lineStyle(3,0xd3af6c,.7).strokeRect(290,94,380,108);
 for(const x of [245,645]){
  g.fillStyle(0x745844).fillRoundedRect(x,46,70,175,10);
  g.fillStyle(0x152e31).fillRect(x+12,95,46,110);
  for(let j=0;j<4;j++)g.lineStyle(4,0xddc188,.8).strokeTriangle(x+35,62+j*29,x+10,87+j*29,x+60,87+j*29);
  for(let petal=0;petal<8;petal++){const a=petal*Math.PI/4;g.fillStyle(0xe0af62,.7).fillCircle(x+35+Math.cos(a)*23,46+Math.sin(a)*17,9);}
  g.fillStyle(0xffdfa1).fillCircle(x+35,46,9);
 }
 g.fillStyle(0x14282b).fillRoundedRect(357,143,246,65,7);
 g.lineStyle(2,0xffd890,.6).strokeRoundedRect(357,143,246,65,7);
 scene.add.text(480,109,'V I L L A G I O',{fontFamily:'Georgia',fontSize:'26px',color:'#f9d99e'}).setOrigin(.5).setDepth(-1);
 scene.add.text(480,170,'SUBVERT  /  AFTER HOURS',{fontFamily:'Arial',fontSize:'11px',color:'#e1cfac'}).setOrigin(.5).setDepth(-1);
 // Decorative, walkable putting greens; no pretend golf physics.
 for(const [x,y,w,h,n] of [[220,355,250,140,1],[720,500,290,155,2]]){
  g.fillStyle(0x11272c).fillEllipse(x+5,y+9,w+28,h+26);
  g.lineStyle(6,0xb09b74,.65).strokeEllipse(x,y,w+16,h+15);
  g.fillStyle(0x285c4e).fillEllipse(x,y,w,h);
  for(let k=0;k<4;k++)g.lineStyle(1,0x79b98c,.13).strokeEllipse(x,y,w-k*31,h-k*17);
  g.fillStyle(0x091e25).fillEllipse(x,y+6,20,9);
  g.lineStyle(3,0xddc8a0).lineBetween(x,y+4,x,y-45);
  g.fillStyle(n===1?0xf3b866:0x88dbcc).fillTriangle(x,y-45,x+32,y-37,x,y-28);
  scene.add.text(x+10,y-43,String(n),{fontFamily:'Arial',fontSize:'12px',color:'#192e30'}).setDepth(0);
 }
 // The chicken tube exits beside the dancefloor. Everything here is scenery.
 const tube=new Phaser.Curves.Spline([795,60,867,87,825,139,744,164,812,209,801,268]).getPoints(72);
 g.lineStyle(48,0x0b252d).strokePoints(tube);g.lineStyle(37,0x8e60a5).strokePoints(tube);
 g.lineStyle(22,0xbe81bb,.55).strokePoints(tube);g.lineStyle(3,0xf3b8db,.5).strokePoints(tube);
 g.fillStyle(0x312f47).fillEllipse(801,270,65,31);g.lineStyle(5,0xd5aecc).strokeEllipse(801,270,65,31);
 const chickens=Array.from({length:4},()=>{
  const c=scene.add.container(0,0).setDepth(1),b=scene.add.graphics();
  b.fillStyle(0xf8eed4).fillEllipse(0,0,22,17).fillCircle(8,-7,8);
  b.fillStyle(0xe26d63).fillCircle(7,-15,3).fillCircle(12,-14,3);
  b.fillStyle(0xf6bd56).fillTriangle(14,-9,23,-6,14,-3);
  b.fillStyle(0x182c31).fillCircle(11,-9,1.7);c.add(b);return c;
 });
 const light=scene.add.graphics().setDepth(.3);let found=0;
 return {ownsLighting:true,setProgress(state){found=state.progress;},update(elapsed,phase,reduced){
  light.clear();const t=reduced?0:elapsed/1000;
  for(const [i,x] of [280,680].entries()){
   for(let j=0;j<3;j++){
    const tip=x+Math.sin(t*.5+i+j*.4)*170;
    light.fillStyle(j%2?0x8de8db:0xffd895,phase==='drop'?.065:.035).fillTriangle(x,45,tip-12,0,tip+12,0);
   }
  }
  // A miniature fountain of light, kept within the stage lip.
  for(let i=0;i<9;i++){
   const x=390+i*22,h=12+(reduced?12:(1+Math.sin(t*2-i*.8))*14)+found*4;
   light.lineStyle(2,i%2?0x8be9e4:0xf5d19d,.65).lineBetween(x,209,x,209-h);
  }
  chickens.forEach((c,i)=>{
   const p=((reduced?i/4:(elapsed/7000+i/4))%1)*(tube.length-1),j=Math.floor(p),u=p-j;
   const a=tube[j],b=tube[Math.min(j+1,tube.length-1)];c.setPosition(a.x+(b.x-a.x)*u,a.y+(b.y-a.y)*u);c.setRotation(reduced?0:Math.sin(t*4+i)*.2);
  });
 }};
}
