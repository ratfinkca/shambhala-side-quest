import {pixelVenueTexture} from '../../pixel-art/venue-texture.js';
// Original Secret Garden interpretation, not a surveyed 2026 venue replica.
// Pixel plate redrawn with ImageGen from the original Garden illustration.
const ART_KEY='bonus-secret-garden-v1';
const COLOURS=[0x79f5cb,0xeaa0ff,0xffd991];
const POTS=[[395,196],[480,200],[565,196]];

export function preload(scene){
 if(!scene.textures.exists(ART_KEY))scene.load.image(ART_KEY,new URL('../assets/secret-garden-pixel-v1.webp',import.meta.url).href);
}

function flower(scene,x,y,colour,index){
 const node=scene.add.container(x,y).setDepth(.8);
 const g=scene.add.graphics();
 g.fillStyle(0x70c5a3,.95).fillRect(-2,-13,3,13).fillRect(-4,-28,3,15).fillRect(-2,-39,3,11);
 g.fillStyle(0x54b395,.95).fillRect(-15,-21,9,4).fillRect(-12,-17,11,4).fillRect(2,-31,11,4).fillRect(2,-27,7,4);
 g.fillStyle(colour,.1).fillRect(-17,-59,34,36).fillRect(-23,-53,46,24);
 for(let i=0;i<8;i++){
  const angle=i*Math.PI/4,px=Math.round(Math.cos(angle)*10),py=Math.round(-41+Math.sin(angle)*10);
  g.fillStyle(colour,.85).fillRect(px-4,py-7,8,14).fillRect(px-6,py-4,12,8);
  g.fillStyle(0xffffff,.22).fillRect(px-3,py-6,3,5);
 }
 g.fillStyle(0xffcf72).fillRect(-5,-46,10,10);
 g.fillStyle(0xfff3c5).fillRect(-3,-46,6,8).fillRect(-5,-44,10,4);
 g.fillStyle(0xffffff,.65).fillRect(-3,-44,3,3);
 node.add(g);node.setVisible(false);
 return {node,index,openedAt:0};
}

export function createView(scene,stage){
 if(stage.id!=='smf-secret-garden')return null;
 if(scene.textures.exists(ART_KEY))scene.add.image(480,320,pixelVenueTexture(scene,ART_KEY)).setDisplaySize(960,640).setDepth(0);
 else{
  // Legible fallback if a local art request is interrupted.
  scene.add.rectangle(480,320,960,640,0x083039).setDepth(0);
  scene.add.rectangle(480,135,280,120,0x40583a).setDepth(.1);
 }
 const foliage=scene.add.graphics().setDepth(.25);
 const lights=scene.add.graphics().setDepth(.4);
 const flowers=POTS.map(([x,y],index)=>flower(scene,x,y,COLOURS[index],index));
 let progress=0,lastElapsed=0,complete=false;
 function setProgress(state){
  complete=!!state.complete;
  const next=Math.max(0,Math.min(3,Math.floor(state.progress||0)));
  for(const f of flowers){
   if(f.index>=progress&&f.index<next)f.openedAt=lastElapsed;
   f.node.setVisible(f.index<next);
  }
  progress=next;
 }
 function update(elapsed,phase,reducedMotion,timing){
  lastElapsed=elapsed;
  const t=reducedMotion?0:elapsed*.001,beat=reducedMotion?0:(elapsed*(timing?.bpm??100)/60000)%1;
  const breath=reducedMotion?.6:.55+.18*Math.sin(t*.7);
  const lift=phase==='drop'?.035:0;
  foliage.clear();lights.clear();
  // Broad, very faint reflected pools keep the floor readable. Most movement
  // belongs to the canopy, distinct from the collectible/planting-bed cues.
  for(const [i,x] of [110,850].entries()){
   const colour=COLOURS[(i+progress)%3];
   for(let ring=4;ring>0;ring--)foliage.fillStyle(colour,.008+lift*.12).fillEllipse(x,340,ring*76,ring*112);
  }
  for(let i=0;i<18;i++){
   const x=180+i*35.3,y=130-72*Math.sin(i/17*Math.PI);
   const shimmer=reducedMotion?.5:.45+.35*Math.sin(t*1.25-i*.6);
   const colour=COLOURS[Math.floor(i/6)];
   lights.fillStyle(colour,.035+shimmer*.04).fillEllipse(x,y,29,15);
   lights.lineStyle(1.5,colour,.15+shimmer*.28).beginPath().moveTo(x-8,y+2).lineTo(x,y-3).lineTo(x+8,y+2).strokePath();
  }
  for(const [i,[x,y]] of [[307,106],[480,87],[653,106]].entries()){
   const glow=breath+(1-beat)*.08+lift;
   for(let r=4;r>0;r--)lights.fillStyle(0xffc572,glow*.018).fillCircle(x,y,r*12);
   lights.fillStyle(0xffe4a8,.25+glow*.3).fillCircle(x,y,2.5);
  }
  // Small fireflies stay in the scenery, away from the activity pickups.
  for(let i=0;i<15;i++){
   const x=145+(i*89%674)+(reducedMotion?0:Math.sin(t*.3+i)*7);
   const y=38+(i*43%150)+(reducedMotion?0:Math.cos(t*.4+i*.9)*5);
   lights.fillStyle(i%2?0xaff9b5:0xffda9d,reducedMotion?.45:.3+.2*Math.sin(t+i)).fillRect(Math.round(x)-1,Math.round(y)-1,2,2);
  }
  for(const f of flowers){
   if(f.index>=progress)continue;
   const growth=reducedMotion||complete?1:Math.min(1,Math.max(0,(elapsed-f.openedAt)/750));
   f.node.setScale(.3+.7*growth,.18+.82*growth);
   f.node.rotation=reducedMotion?0:Math.sin(t*1.2+f.index)*.035;
   f.node.setAlpha(.65+.35*growth);
  }
 }
 return {ownsLighting:true,update,setProgress};
}
