import {pixelLine,pixelizeGraphics,snapPixel} from '../pixel-art/shapes.js';
import {pixelVenueTexture} from '../pixel-art/venue-texture.js';
import {PRISM,PRISM_ZONES} from './model.js';

const ART_KEY='practice-prism-party-pixel-v1';
const A={x:480,y:240},B={x:150,y:500},C={x:810,y:500},TIP={x:480,y:20};
// Decorative anchors follow the illustration. Gameplay polygons deliberately
// stay a little inside the outer timber footings.
const FEET=[{x:88,y:490},{x:870,y:490}];
const WHITE=0xf2f8e0,INK=0x07151d;
const ROOF_FACES=[[TIP,A,B],[TIP,C,A],[TIP,B,C]];
const ROOF_EDGES=[[TIP,FEET[0]],[TIP,FEET[1]],[TIP,A]];
const clamp=(v,min=0,max=1)=>Math.max(min,Math.min(max,Number(v)||0));
const mix=(a,b,p)=>({x:a.x+(b.x-a.x)*p,y:a.y+(b.y-a.y)*p});
const stepped=points=>points.flatMap((p,i)=>{
 const next=points[(i+1)%points.length];
 return pixelLine(p.x,p.y,next.x,next.y,3);
});
const FLOOR_PATHS=PRISM_ZONES.map(zone=>stepped(zone.points));
const ROOF_PATHS=ROOF_FACES.map(stepped);

export function preload(scene){
 if(!scene.textures.exists(ART_KEY))scene.load.image(ART_KEY,new URL('./assets/prism-party-pixel-v1.webp',import.meta.url).href);
}

function line(g,a,b,color,alpha=1,width=2){
 g.lineStyle(width,color,alpha).strokePoints(pixelLine(a.x,a.y,b.x,b.y,3));
}

function glyph(g,shape,x,y,color,alpha=1,size=1){
 const px=n=>snapPixel(n,2),r=(dx,dy,w,h)=>g.fillRect(px(x+dx*size),px(y+dy*size),Math.max(2,px(w*size)),Math.max(2,px(h*size)));
 g.fillStyle(color,alpha);
 if(shape==='diamond'){
  r(-2,-12,4,4);r(-6,-8,12,4);r(-10,-4,20,8);r(-6,4,12,4);r(-2,8,4,4);
  g.fillStyle(INK,alpha*.8);r(-2,-4,4,8);
 }else if(shape==='star'){
  r(-2,-14,4,28);r(-12,-2,24,4);r(-6,-6,12,12);
  g.fillStyle(WHITE,alpha*.5);r(-2,-4,4,8);
 }else{
  r(-6,-6,12,12);r(-2,-14,4,4);r(-2,10,4,4);r(-14,-2,4,4);r(10,-2,4,4);
  r(-10,-10,4,4);r(6,-10,4,4);r(-10,6,4,4);r(6,6,4,4);
  g.fillStyle(WHITE,alpha*.4);r(-2,-2,4,4);
 }
}

function fallback(g){
 g.fillStyle(0x06151c).fillRect(0,0,960,640);
 g.fillStyle(0x0d242c).fillRect(0,500,960,140);
 // Silhouettes are intentionally quiet: the playable floor, not a loading
 // placeholder, is the focal point when the optional illustration is absent.
 for(let i=0;i<16;i++){
  const x=i*65-18,y=20+(i*37%88),width=50+(i*19%40);
  g.fillStyle(i%2?0x102e32:0x0b222b).fillRect(x+width/2-5,y,10,560-y);
  for(let layer=0;layer<5;layer++){
   const w=width+layer*10;
   g.fillStyle(i%2?0x102e32:0x0b222b).fillTriangle(x+width/2,y+layer*55,x+width/2-w/2,y+110+layer*55,x+width/2+w/2,y+110+layer*55);
  }
 }
 g.fillStyle(0x173436,.65).fillEllipse(480,534,750,95);
}

function chargeMarks(g,x,y,color,charge,active){
 const full=clamp(charge/PRISM.chargeMs),w=8,gap=3,start=x-31;
 g.fillStyle(INK,.88).fillRect(start-5,y-4,72,16);
 for(let i=0;i<6;i++){
  const fraction=clamp(full*6-i);
  g.fillStyle(color,.15).fillRect(start+i*(w+gap),y,w,6);
  if(fraction>0)g.fillStyle(color,.75).fillRect(start+i*(w+gap),y,Math.max(2,Math.round(w*fraction/2)*2),6);
 }
 if(active){
  g.fillStyle(WHITE,.7).fillRect(start-7,y+1,3,4).fillRect(start+68,y+1,3,4);
 }
}

export function createView(scene,stage){
 if(!['smf-prism-party-preview','smf-prism-party'].includes(stage?.id))return null;
 const nodes=[],graphics=depth=>{
  const g=pixelizeGraphics(scene.add.graphics(),3).setDepth(depth);nodes.push(g);return g;
 };
 const base=graphics(-5);
 fallback(base);
 const hasArt=scene.textures.exists(ART_KEY);
 if(hasArt){
  const image=scene.add.image(0,0,pixelVenueTexture(scene,ART_KEY)).setOrigin(0).setDisplaySize(960,640).setDepth(-4);
  nodes.push(image);
 }
 const floor=graphics(-2),lights=graphics(-1),architecture=graphics(0),roof=graphics(22),confetti=graphics(23);
 let state={phase:'approach',entered:false,partyMs:0,activeZone:-1,charges:[0,0,0],progress:0,celebrationMs:0};
 let destroyed=false;

 function setProgress(next={}){
  if(destroyed)return;
  state={...state,...next,charges:[0,1,2].map(i=>clamp(next.charges?.[i],0,PRISM.chargeMs))};
 }

 function update(elapsed=0,phase='normal',reduced=false,timing){
  if(destroyed)return;
  const t=reduced?0:elapsed/1000,bpm=timing?.bpm??PRISM.bpm;
  const beat=reduced?0:(1-Math.cos(t*bpm/60*Math.PI*2))*.5;
  // Musical elapsed resets on entry and wraps with the arrangement. The
  // cutaway follows monotonic party time so it cannot re-close at a loop.
  const entering=state.entered?(reduced?1:clamp(state.partyMs/700)):0;
  const finale=state.phase==='celebrating',done=state.phase==='complete'||state.complete;
  const finaleTime=clamp(state.celebrationMs,0,PRISM.celebrationMs)/1000;
  const active=state.entered&&state.phase==='party'?state.activeZone:-1;
  floor.clear();lights.clear();architecture.clear();roof.clear();confetti.clear();

  // The three actual collision regions are drawn from the model's polygons;
  // their shape and symbol, as well as their colour, identify the active face.
  floor.fillStyle(0x0b2029,hasArt?.28:.88).fillPoints(stepped([A,B,C]),true);
  for(let i=0;i<PRISM_ZONES.length;i++){
   const zone=PRISM_ZONES[i],selected=i===active,charged=state.charges[i]>=PRISM.chargeMs;
   const alpha=selected?.23+beat*.045:charged?.12:.035;
   floor.fillStyle(zone.color,alpha).fillPoints(FLOOR_PATHS[i],true);
   floor.lineStyle(selected?3:2,zone.color,selected?.85:charged?.5:.23).strokePoints(FLOOR_PATHS[i],true);
   // Small nested triangles travel outwards only in the currently lit region.
   // No screen-wide colour flashes, and no movement in reduced-motion mode.
   if(selected){
    for(let k=0;k<3;k++){
     const p=reduced?.3+k*.22:.18+((t*.16+k/3)%1)*.72;
     const path=zone.points.map(point=>mix(zone.center,point,p));
     lights.lineStyle(2,zone.color,reduced?.2:.24*(1-p)).strokePoints(stepped(path),true);
    }
   }
   const symbolY=zone.center.y-10;
   glyph(lights,zone.shape,zone.center.x,symbolY,zone.color,selected?.85:charged?.65:.34,selected?1.1:.9);
   chargeMarks(lights,zone.center.x,symbolY+24,zone.color,state.charges[i],selected);
   if(charged){
    // A white pixel pip stays lit once earned, even between cue phrases.
    lights.fillStyle(WHITE,.85).fillRect(zone.center.x-3,symbolY-24,6,4);
   }
  }
  // A generously lit doorway/ramp directs the approach without another label.
  if(!hasArt)floor.fillStyle(0x23363a,.92).fillRect(430,500,100,65);
  line(lights,{x:430,y:500},{x:430,y:565},0x85e5bc,.65,3);
  line(lights,{x:530,y:500},{x:530,y:565},0x85e5bc,.65,3);
  for(let i=0;i<5;i++){
   const y=508+i*12,brightness=state.entered?.15:reduced?.55:.28+.28*Math.max(0,Math.sin(t*3+i*.8));
   lights.fillStyle(0xa0f6ce,brightness).fillRect(437,y,86,3);
  }
  if(!state.entered){
   const offset=reduced?0:Math.round((1+Math.sin(t*2))*2);
   line(lights,{x:468,y:551+offset},{x:480,y:541+offset},WHITE,.85,3);
   line(lights,{x:480,y:541+offset},{x:492,y:551+offset},WHITE,.85,3);
  }

  // Front face becomes a cutaway on entry. Its very low alpha preserves the
  // player silhouette even while approaching from beneath the structure.
  const cover=.095*(1-entering)+.009;
  roof.fillStyle(0x11202b,cover).fillPoints(ROOF_PATHS[2],true);
  for(let i=0;i<3;i++){
   const color=PRISM_ZONES[i].color,charged=state.charges[i]>=PRISM.chargeMs;
   const glow=(charged?.035:.007)+(finale?.012:0);
   roof.fillStyle(color,glow).fillPoints(ROOF_PATHS[i],true);
  }

  // Heavy dark timber/metal supports frame bright pixel LED strips. Main
  // diagonals lie at the silhouette; they do not draw through the crowd.
  for(let i=0;i<ROOF_EDGES.length;i++){
   const [from,to]=ROOF_EDGES[i],color=PRISM_ZONES[i].color;
   const charged=state.charges[i]>=PRISM.chargeMs;
   if(!hasArt){
    line(architecture,from,to,0x020c13,.94,12);
    line(architecture,from,to,0x40515b,.85,7);
   }
   line(architecture,from,to,color,charged||done?.95:.58,3);
   const count=i===2?12:30;
   for(let k=0;k<count;k++){
    const p=(k+.5)/count,point=mix(from,to,p),chase=reduced?0:((t*(finale?9:5)-k)%9+9)%9;
    const on=reduced?k%4===0:chase>=0&&chase<2.5;
    if(on){
     architecture.fillStyle(color,.12).fillRect(snapPixel(point.x)-6,snapPixel(point.y)-6,12,12);
     architecture.fillStyle(WHITE,charged?.95:.8).fillRect(snapPixel(point.x)-2,snapPixel(point.y)-2,4,4);
    }
   }
  }
  // Two short front rails leave the entrance open. They read as the edge of
  // a dance platform rather than another obstacle across the doorway.
  line(architecture,B,{x:430,y:500},PRISM_ZONES[0].color,.6,4);
  line(architecture,{x:530,y:500},C,PRISM_ZONES[1].color,.6,4);
  for(const point of FEET){
   if(!hasArt)architecture.fillStyle(0x09101a).fillRect(point.x-9,point.y-21,18,28);
   architecture.fillStyle(0xd9eedb,.8).fillRect(point.x-4,point.y-23,8,4);
  }
  // A small prism crown signals collected faces above the playable space.
  for(let i=0;i<3;i++)glyph(architecture,PRISM_ZONES[i].shape,442+i*38,110,PRISM_ZONES[i].color,state.charges[i]>=PRISM.chargeMs?.95:.3,.55);
  glyph(architecture,'diamond',TIP.x,TIP.y-8,WHITE,.95,.75);

  // Perimeter lasers point outward/upward through the trees. Their origins
  // remain outside the interactive triangle, keeping movement cues distinct.
  for(let side=0;side<2;side++){
   const origin={x:side?830:130,y:442},direction=side?1:-1;
   for(let beam=0;beam<4;beam++){
    const wave=reduced?0:Math.sin(t*.48+side+beam*.2)*26;
    const target={x:origin.x+direction*(30+beam*22)+wave,y:105+beam*26};
    const color=PRISM_ZONES[(beam+side)%3].color;
    line(lights,origin,target,color,finale?.23:.13,2);
   }
   architecture.fillStyle(0x14242e).fillRect(origin.x-8,origin.y-8,16,14);
   architecture.fillStyle(WHITE,.75).fillRect(origin.x-3,origin.y-10,6,4);
  }
  for(let i=0;i<14;i++){
   const x=i<7?36+(i*29%104):820+(i*31%104),y=180+(i*61%255);
   const alpha=reduced?.3:.18+.16*(1+Math.sin(t*.9+i));
   lights.fillStyle(PRISM_ZONES[i%3].color,alpha).fillRect(x,y,3,3);
  }

  if(finale&&!reduced){
   // Finite, seeded celebration: no emitters, timers, allocations that outlive
   // the venue, or flashes when the success overlay opens.
   const fade=clamp((PRISM.celebrationMs/1000-finaleTime)/.55);
   for(let i=0;i<42;i++){
    const age=Math.max(0,finaleTime-(i%7)*.045),velocity=(i*37%190)-95;
    const x=snapPixel(480+velocity*age,3),y=snapPixel(130-(90+i*13%110)*age+91*age*age,3);
    if(y<80||y>520||x<120||x>840)continue;
    confetti.fillStyle(PRISM_ZONES[i%3].color,.85*fade).fillRect(x,y,i%2?3:6,i%2?6:3);
   }
  }
 }

 function destroy(){
  if(destroyed)return;
  destroyed=true;
  // StageRenderer ordinarily destroys its captured children first. Checking
  // scene keeps direct disposal useful without double-destroying those nodes.
  for(const node of nodes)if(node.scene)node.destroy();
 }
 update(0,'normal',true);
 return {ownsLighting:true,update,setProgress,destroy};
}
