import {pixelVenueTexture} from '../../pixel-art/venue-texture.js';
// Original Ikigai Mori rehearsal interpretation. The replaceable plate is not
// a surveyed recreation of the real crew space; all gameplay lives elsewhere.
const ART_KEY='bonus-ikigai-mori-v1';
const ART_URL=new URL('../assets/ikigai-mori-pixel-v1.webp',import.meta.url).href;
const GOLD=0xffcd83,MINT=0x9be4cb,AMBER=0xd88847;

export function preload(scene){
 if(!scene.textures.exists(ART_KEY))scene.load.image(ART_KEY,ART_URL);
}

function lantern(scene,x){
 const body=scene.add.graphics();
 body.fillStyle(AMBER,.85).fillRect(-1,-20,2,8);
 body.fillStyle(AMBER,.8).fillRect(-8,-12,16,26).fillRect(-11,-8,22,18);
 body.fillStyle(0x11262b).fillRect(-7,-10,14,22).fillRect(-9,-6,18,14);
 body.fillStyle(0x6f4b32).fillRect(-11,-14,22,4).fillRect(-11,13,22,4);
 body.fillStyle(AMBER,.5).fillRect(-5,-10,2,22).fillRect(3,-10,2,22);
 const core=scene.add.graphics();
 core.fillStyle(GOLD,.92).fillRect(-6,-9,12,20).fillRect(-8,-5,16,12);
 core.fillStyle(0xfff2c9,.8).fillRect(-4,-7,2,16).fillRect(2,-7,2,16);
 const glow=scene.add.graphics();
 for(let i=5;i>0;i--)glow.fillStyle(GOLD,.018).fillEllipse(0,1,i*13,i*16);
 const node=scene.add.container(x,184,[glow,body,core]).setDepth(.65);
 core.setAlpha(.06);glow.setAlpha(0);
 return {node,core,glow};
}

export function createView(scene,stage){
 if(stage.id!=='smf-ikigai-mori')return null;
 scene.add.rectangle(480,320,960,640,0x10272e).setDepth(-.2);
 // Shift the illustrated stage lip above the 250px playable boundary.
 if(scene.textures.exists(ART_KEY))scene.add.image(0,-12,pixelVenueTexture(scene,ART_KEY)).setOrigin(0).setDisplaySize(960,640).setDepth(0);
 else{
  const fallback=scene.add.graphics().setDepth(0);
  fallback.fillStyle(0x153037).fillRect(0,0,960,640);
  fallback.fillStyle(0x5d402b).fillRoundedRect(330,95,300,120,6);
  fallback.fillStyle(0x242c2b).fillRect(348,114,264,59);
  fallback.lineStyle(8,0x8d613d).strokeTriangle(300,100,480,35,660,100);
 }
 const lip=scene.add.graphics().setDepth(.1);
 lip.lineStyle(1,GOLD,.14).lineBetween(110,220,850,220);
 const pools=scene.add.graphics().setDepth(.12);
 const beams=scene.add.graphics().setDepth(.24);
 const boothGlow=scene.add.graphics().setDepth(.3);
 const lanterns=[384,432,480,528,576].map(x=>lantern(scene,x));
 const flecks=Array.from({length:12},(_,i)=>({
  x:145+(i*167%670),y:38+(i*43%130),
  node:scene.add.rectangle(145+(i*167%670),38+(i*43%130),i%3?2:3,i%3?2:3,GOLD,.22).setDepth(.7),
 }));
 let progress=0,complete=false;
 return {
  ownsLighting:true,
  setProgress(state){
   progress=Math.max(0,Math.min(5,Number.isFinite(state?.progress)?Math.floor(state.progress):0));
   complete=state?.complete===true;
  },
  update(elapsed,phase,reducedMotion,timing){
   const ms=Number.isFinite(elapsed)?Math.max(0,elapsed):0;
   const t=ms*.001,beat=ms*(timing?.bpm??124)/60000;
   const breathing=reducedMotion?0:(.5+.5*Math.sin(t*.8));
   const energy=phase==='drop'?1:phase==='build'?.7:.45;
   const beatGlow=reducedMotion?.5:Math.pow(.5+.5*Math.cos(beat*Math.PI*2),3);
   pools.clear();
   for(const [i,x] of [230,480,730].entries()){
    const color=i%2?GOLD:MINT;
    for(let r=5;r>0;r--)pools.fillStyle(color,.006+(progress/5)*.0018).fillEllipse(x,390+i%2*110,r*58,r*39);
   }
   boothGlow.clear();
   boothGlow.lineStyle(2,complete?MINT:GOLD,.2+progress*.04+beatGlow*.07).lineBetween(352,208,609,208);
   // Restrained upward/crossing fans originate at the small booth. They never
   // replace the readable dancefloor with a full-screen flash.
   beams.clear();
   if(!reducedMotion){
    for(const side of [-1,1]){
     const x=480+side*154,y=162,sweep=Math.sin(t*.35+side)*.45;
     for(let ray=0;ray<4;ray++){
      const endX=x+side*(50+ray*57)+Math.sin(t*.23+ray)*55+sweep*80;
      const endY=12+ray*15+Math.sin(t*.43+ray)*14;
      beams.lineStyle(ray===1?1.3:.8,side<0?MINT:GOLD,.07+energy*.065).lineBetween(x,y,endX,endY);
     }
     beams.fillStyle(side<0?MINT:GOLD,.009+energy*.009).fillTriangle(x,y,x+side*190+sweep*80,8,x+side*70+sweep*80,20);
    }
   }
   lanterns.forEach(({node,core,glow},i)=>{
    const lit=i<progress;
    core.setAlpha(lit?.8+beatGlow*.15:.06);
    glow.setAlpha(lit?.55+breathing*.2+(complete?.15:0):0);
    node.rotation=reducedMotion?0:Math.sin(t*.7+i*.8)*.025;
   });
   flecks.forEach(({node,x,y},i)=>{
    node.setPosition(reducedMotion?x:x+Math.sin(t*.23+i)*4,reducedMotion?y:y+Math.sin(t*.34+i*1.4)*5);
    node.setAlpha(reducedMotion?.18:.14+(.5+.5*Math.sin(t*.6+i))*.22);
   });
  },
 };
}
