import {smfLightCue} from './smf-light-cues.js';
import {getTiming} from '../stage-clock.js';

// The rig lives with the disposable venue view. Colours describe original
// shows inspired by the venues; positions come from the illustrated fixtures.
const PALETTES={
 'smf-living-room':[0xffd394,0x97ddcb,0xffbe8c,0xb5ded0],
 'smf-fractal':[0x7fffe4,0xed82ff,0xb7ff7e,0x83dfff],
 'smf-grove':[0x8ddbc5,0xba91ed,0xe4c695,0x9fdcc3],
 'smf-amp':[0x6ee7ef,0xc39bff,0xb2fbaa,0xf29bd8],
 'smf-pagoda':[0x9de9ed,0xc6afff,0xffd5a2,0xa9ccff],
 'smf-village':[0x8cdfea,0xdfa7f3,0xffc58b,0x94c4ff],
};

const LASER_COLOURS={
 'smf-living-room':[0xffd16f,0x80ffc9,0xffb96b,0x8fffea],
 'smf-fractal':[0x54ff84,0xff4ce5,0x84ffeb,0xc2ff49],
 'smf-grove':[0x5bffe1,0xbe78ff,0x92ffe8,0xd7a0ff],
 'smf-amp':[0x55fff0,0xb3ff42,0xa679ff,0x85f9ff],
 'smf-pagoda':[0x77ffff,0xd390ff,0xffd68d,0x8bb6ff],
 'smf-village':[0x71e6ff,0xffbe64,0xbb9cff,0x79fff0],
};
const SHAFT_WIDTH=320,SHAFT_HEIGHT=760,LASER_WIDTH=24,LASER_HEIGHT=960,CANVAS_RENDERER=1;
let nextTextureId=0;
function drawShaft(g,colour,offsetX=0){
 // Feather the sides and fade down the floor. Additive drawing into a
 // transparent texture preserves the overlapping cores of the original rig.
 for(const [width,opacity]of [[160,.12],[83,.19],[26,.35]]){
  for(let band=0;band<14;band++){
   const a=band/14,b=(band+1)/14,y0=a*SHAFT_HEIGHT,y1=b*SHAFT_HEIGHT;
   const fade=(1-a)*(1-a*.55);
   g.fillStyle(colour,opacity*fade).fillPoints([
    {x:offsetX-width*a,y:y0},{x:offsetX+width*a,y:y0},
    {x:offsetX+width*b,y:y1},{x:offsetX-width*b,y:y1},
   ],true);
  }
 }
 return g;
}

function drawLaser(g,colour,offsetX=0){
 // A thin luminous core and a feathered halo remain legible when the whole
 // venue is phone-sized. Longitudinal fade keeps the dancefloor contrast.
 for(const [width,opacity]of [[10,.055],[3.6,.26],[1.35,.84]])for(let band=0;band<16;band++){
  const a=band/16,b=(band+1)/16,fade=.2+.8*(1-a)**.7;
  g.fillStyle(colour,opacity*fade).fillPoints([
   {x:offsetX-width,y:a*LASER_HEIGHT},{x:offsetX+width,y:a*LASER_HEIGHT},
   {x:offsetX+width,y:b*LASER_HEIGHT},{x:offsetX-width,y:b*LASER_HEIGHT},
  ],true);
 }
 return g;
}

function bakeLights(scene,colours,laserColours){
 // Phaser generateTexture uses the active renderer's blend table even while
 // drawing to Canvas. Only the Canvas table maps ADD to 'lighter'; WebGL and
 // drawing-only adapters retain native vectors to preserve additive cores.
 if(scene.sys?.game?.renderer?.type!==CANVAS_RENDERER||typeof scene.textures?.createCanvas!=='function'||typeof scene.textures?.remove!=='function')return [];
 const keys=[];
 let brush;
 try{
  for(const [i,colour] of [...colours,...laserColours].entries()){
   const laser=i>=colours.length,width=laser?LASER_WIDTH:SHAFT_WIDTH,height=laser?LASER_HEIGHT:SHAFT_HEIGHT;
   let key;
   do{key=`smf-light-${laser?'laser':'shaft'}-${++nextTextureId}`}while(scene.textures.exists(key));
   keys.push(key);
   brush=scene.add.graphics().setBlendMode(1);
   (laser?drawLaser:drawShaft)(brush,colour,width/2);
   brush.generateTexture(key,width,height);
   brush.destroy();brush=null;
  }
 }catch(error){
  brush?.destroy();
  for(const key of keys)if(scene.textures.exists(key))scene.textures.remove(key);
  throw error;
 }
 return keys;
}

function shaft(scene,x,y,colour,texture){
 const node=texture?scene.add.image(x,y,texture).setOrigin(.5,0):drawShaft(scene.add.graphics().setPosition(x,y),colour);
 return node.setDepth(.21).setBlendMode(1);
}

function laser(scene,x,y,colour,texture){
 const node=texture?scene.add.image(x,y,texture).setOrigin(.5,0):drawLaser(scene.add.graphics().setPosition(x,y),colour);
 return node.setDepth(.23).setBlendMode(1);
}

function halo(scene,x,y,colour,width,height,depth){
 const g=scene.add.graphics().setPosition(x,y).setDepth(depth).setBlendMode(1);
 for(let ring=7;ring>0;ring--)g.fillStyle(colour,.025).fillEllipse(0,0,width*ring/7,height*ring/7);
 return g;
}

export function createSMFStageLighting(scene,stage,lampPositions,sideLampPositions=[],skyLampPositions=[]){
 const colours=PALETTES[stage.id],laserColours=LASER_COLOURS[stage.id];
 const textures=bakeLights(scene,colours,laserColours);
 // Measured side towers widen the rig without adding more beams. When art
 // has no outer fixtures, retain the original split central-head layout.
 const hasSides=sideLampPositions.length===2;
 const beamHeads=hasSides?[sideLampPositions[0],...lampPositions,sideLampPositions[1]]:[0,0,1,2,3,4,5,5].map(i=>lampPositions[i]);
 const rays=beamHeads.map(([x,y],i)=>{
  return [shaft(scene,x,y,colours[i%2],textures[i%2]),shaft(scene,x,y,colours[2+i%2],textures[2+i%2])];
 });
 // Four projector banks, each with six independently aimed scanning rays.
 // All geometry is cached once; the live pass changes only transforms/alpha.
 const projectorHeads=hasSides?[sideLampPositions[0],lampPositions[2],lampPositions[3],sideLampPositions[1]]:[0,2,3,5].map(i=>lampPositions[i]);
 const lasers=Array.from({length:24},(_,i)=>{
  const bank=Math.floor(i/6),[x,y]=projectorHeads[bank];
  return laser(scene,x,y,laserColours[bank],textures[4+bank]);
 });
 const sheets=projectorHeads.map(([x,y],i)=>shaft(scene,x,y,colours[i],textures[i]).setDepth(.22));
 // Village flower crowns occasionally throw an upward salute. Reuse the
 // same cached light strips; dormant heads are transparent between cues.
 const sky=stage.id==='smf-village'?skyLampPositions.slice(0,6).map(([x,y],i)=>({
  wash:shaft(scene,x,y,colours[i%4],textures[i%4]).setDepth(.27),
  core:laser(scene,x,y,laserColours[i%4],textures[4+i%4]).setDepth(.28),
 })):[];
 const lamps=(hasSides?beamHeads:lampPositions).map(([x,y],i)=>({
  halo:halo(scene,x,y,colours[i%2],42,32,.25),
  lens:scene.add.circle(x,y,2.6,colours[i%2],1).setDepth(.26),
 }));
 // Light catches the bordering cedars and low haze instead of scattering
 // bright points that could be confused with collectable sparks.
 const edges=[[65,155],[895,155],[80,330],[880,330],[110,510],[850,510]]
  .map(([x,y],i)=>({x,y,node:halo(scene,x,y,colours[i%4],190,245,.16)}));
 const haze=[0,1,2].map(i=>({x:260+i*220,y:260+i%2*44,
  node:halo(scene,260+i*220,260+i%2*44,colours[i%2],330,74,.18)}));
 const pools=[0,1,2,3].map(i=>({x:160+i*215,y:385+i%2*130,
  node:halo(scene,160+i*215,385+i%2*130,colours[i%4],155,265,.14)}));
 let lastTime,lastReduced,destroyed=false;
 const rig={update(elapsed,reduced,timing){
  if(destroyed||elapsed===lastTime&&reduced===lastReduced)return;
  lastTime=elapsed;lastReduced=reduced;
  const cue=smfLightCue(stage.id,elapsed,timing,reduced);
  rays.forEach((layers,i)=>{
   const beam=cue.beams[i];
   layers.forEach((node,j)=>{
    node.rotation=hasSides&&(i===0||i===7)?beam.angle*.38+(i===0?-.55:.55):beam.angle;
    node.setScale(beam.width,beam.length).setAlpha(beam.alpha*(j?cue.colourMix:1-cue.colourMix)*4.2);
   });
  });
  // Outer lasers cross inward from their towers; retain each bank's fan
  // spread, instead of sending most of its rays out beyond the canvas edge.
  const projectorAim=(angle,bank)=>hasSides&&(bank===0||bank===3)?angle-(cue.lasers[bank*6].angle+cue.lasers[bank*6+5].angle)*.8:angle;
  lasers.forEach((node,i)=>{
   const ray=cue.lasers[i];node.rotation=projectorAim(ray.angle,Math.floor(i/6));node.setScale(ray.width,ray.length).setAlpha(ray.alpha);
  });
  sheets.forEach((node,i)=>{
   const a=cue.lasers[i*6],b=cue.lasers[i*6+5];node.rotation=projectorAim((a.angle+b.angle)/2,i);
   node.setScale(Math.max(.2,Math.abs(a.angle-b.angle)*1.65)*(.7+.3*(a.length+b.length)/2),(a.length+b.length)/2*1.12).setAlpha((a.alpha+b.alpha)*.10);
  });
  sky.forEach((head,i)=>{
   const beam=cue.skyBeams[i];
   head.wash.rotation=beam.angle;head.core.rotation=beam.angle;
   head.wash.setScale(beam.width,beam.length).setAlpha(beam.alpha*.7);
   head.core.setScale(1.25,beam.length).setAlpha(beam.alpha);
  });
  lamps.forEach((lamp,i)=>{
   const beam=cue.beams[hasSides?i:[0,2,3,4,5,7][i]];
   lamp.halo.setAlpha(beam.glow).setScale(1+cue.energy*.28);
   lamp.lens.setAlpha(Math.min(1,.35+beam.glow));
  });
  edges.forEach(({node,x,y},i)=>{
   node.setPosition(x+cue.poolDrift*(i%2?12:-12),y);
   node.setAlpha(.35+cue.architecture*.4).setScale(1+cue.poolDrift*.08,1);
  });
  haze.forEach(({node,x,y},i)=>{
   node.setPosition(x+cue.poolDrift*(i%2?-32:32),y+cue.poolDrift*9);
   node.setAlpha(.30+cue.energy*.38).setScale(1+cue.architecture*.16,1);
  });
  pools.forEach(({node,x,y},i)=>{
   node.setPosition(x+cue.poolDrift*(i%2?-35:35),y);
   node.setAlpha(.16+cue.energy*.2).setScale(1+cue.poolDrift*.12,1);
  });
 },destroy(){
  // StageRenderer destroys its owned images first, then releases the eight
  // rig-local textures. Never remove a texture still used by another venue.
  if(destroyed)return;
  destroyed=true;
  for(const key of textures)if(scene.textures.exists(key))scene.textures.remove(key);
 }};
 // A new or restored scene can remain paused before its first frame update.
 // Establish the quiet composition now rather than exposing default alpha 1.
 rig.update(0,scene.reducedMotion??false,getTiming(stage.timingId));
 return rig;
}
