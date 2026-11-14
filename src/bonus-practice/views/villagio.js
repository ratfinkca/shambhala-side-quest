import {pixelVenueTexture} from '../../pixel-art/venue-texture.js';
import Phaser from 'phaser';

// Original pixel-art miniature resort; not a reconstruction of backstage.
// Art and accents share the fixed 960 × 640 rehearsal coordinates.
const ART_KEY='bonus-villagio-art-v1';
const FOUNTAINS=[{x:315,y:205},{x:637,y:205}];

export function preload(scene){
 if(!scene.textures.exists(ART_KEY))scene.load.image(ART_KEY,new URL('../assets/villagio-pixel-v1.webp',import.meta.url).href);
}

export function createView(scene,stage){
 if(stage.id!=='smf-villagio')return null;
 const base=scene.add.graphics().setDepth(-5);
 base.fillStyle(0x142a35).fillRect(0,0,960,640);
 if(scene.textures.exists(ART_KEY)){
  scene.add.image(0,0,pixelVenueTexture(scene,ART_KEY)).setOrigin(0).setDisplaySize(960,640).setDepth(-4);
 }
 scene.add.text(480,66,'V I L L A G I O',{
  fontFamily:'monospace',fontStyle:'bold',fontSize:'20px',color:'#ffe2a3',
  shadow:{offsetX:2,offsetY:2,color:'#452016',blur:0,fill:true},
 }).setOrigin(.5).setDepth(-1);

 // Follow the painted tube, with small silhouettes visible through its shell.
 const tube=new Phaser.Curves.Spline([
  775,91,854,107,878,133,830,153,770,173,793,197,834,218,800,251,
 ]).getPoints(96);
 const chickens=Array.from({length:4},()=>{
  const c=scene.add.container(0,0).setDepth(1).setScale(.66).setAlpha(.82);
  const b=scene.add.graphics();
  // Chunky stepped silhouette reads as a chicken even inside the purple tube.
  b.fillStyle(0x182c31).fillRect(-13,-7,23,14).fillRect(-9,7,14,3).fillRect(3,-16,14,15);
  b.fillStyle(0xf8eed4).fillRect(-10,-5,20,12).fillRect(-13,-9,7,5).fillRect(5,-14,10,14);
  b.fillStyle(0xd6c79e).fillRect(-7,0,10,5).fillRect(-8,7,12,2);
  b.fillStyle(0xe26d63).fillRect(5,-19,4,5).fillRect(11,-18,4,4);
  b.fillStyle(0xf6bd56).fillRect(15,-10,7,4).fillRect(15,-6,4,2);
  b.fillStyle(0x182c31).fillRect(11,-12,2,2);c.add(b);return c;
 });
 const light=scene.add.graphics().setDepth(-2);
 const accents=scene.add.graphics().setDepth(0);
 let found=0;

 function setProgress(state){found=Math.max(0,Math.min(3,Number(state?.progress)||0));}

 function update(elapsed=0,phase='normal',reduced=false){
  light.clear();accents.clear();
  const t=reduced?0:elapsed/1000,energy=phase==='drop'?1:phase==='build'?.8:.55;
  // Sweeping fans come from the two illustrated tower crowns.
  for(const [i,x] of [262,691].entries()){
   for(let j=0;j<3;j++){
    const tip=x+Math.sin(t*.5+i+j*.4)*125;
    light.fillStyle(j%2?0x8de8db:0xffd895,.025+energy*.025).fillTriangle(x,35,tip-12,0,tip+12,0);
   }
   for(let r=4;r>0;r--)light.fillStyle(0xffc26a,.012+found*.002).fillCircle(x,151,r*9);
  }
  // Water-light arcs stay on the two painted fountains, above the dancefloor.
  FOUNTAINS.forEach(({x,y},index)=>{
   for(let j=-2;j<=2;j++){
    const height=15+(reduced?5:(1+Math.sin(t*1.8+index+j*.65))*4)+found*1.5;
    const points=Array.from({length:19},(_,k)=>{
     const u=k/18;
     return {x:x+j*2+j*5*u,y:y-Math.sin(u*Math.PI)*height};
    });
    accents.lineStyle(1,j%2?0xffe2a3:0xb0f5ef,.38).strokePoints(points);
   }
  });
  // Tiny gold chasers trace the carved pavilion arch rather than drawing a new facade.
  for(let i=0;i<44;i++){
   const a=Math.PI+i/43*Math.PI;
   const x=480+183*Math.cos(a),y=211+126*Math.sin(a);
   const chase=reduced?.24:.15+.55*Math.pow(Math.max(0,Math.cos(i*.36-t*1.1)),6);
   accents.fillStyle(i%4?0xffcb76:0xa2eee0,chase).fillRect(Math.round(x)-1,Math.round(y)-1,3,3);
  }
  for(let j=0;j<3;j++){
   const points=Array.from({length:32},(_,i)=>({x:395+i*5.3,y:192+j*5+Math.sin(i*.35+t*.65+j)*3}));
   accents.lineStyle(1,0xffd48a,.09+energy*.07).strokePoints(points);
  }
  chickens.forEach((c,i)=>{
   const p=((reduced?i/4:(elapsed/8500+i/4))%1)*(tube.length-1),j=Math.floor(p),u=p-j;
   const a=tube[j],b=tube[Math.min(j+1,tube.length-1)];
   c.setPosition(a.x+(b.x-a.x)*u,a.y+(b.y-a.y)*u);
   c.setRotation(reduced?0:Math.sin(t*4+i)*.2);
  });
 }

 update(0,'normal',true);
 return {ownsLighting:true,setProgress,update};
}
