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

const SHAFT_WIDTH=320,SHAFT_HEIGHT=760,CANVAS_RENDERER=1;
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

function bakeShafts(scene,colours){
 // Phaser generateTexture uses the active renderer's blend table even while
 // drawing to Canvas. Only the Canvas table maps ADD to 'lighter'; WebGL and
 // drawing-only adapters retain native vectors to preserve additive cores.
 if(scene.sys?.game?.renderer?.type!==CANVAS_RENDERER||typeof scene.textures?.createCanvas!=='function'||typeof scene.textures?.remove!=='function')return [];
 const keys=[];
 let brush;
 try{
  for(const colour of colours){
   let key;
   do{key=`smf-light-shaft-${++nextTextureId}`}while(scene.textures.exists(key));
   keys.push(key);
   brush=scene.add.graphics().setBlendMode(1);
   drawShaft(brush,colour,SHAFT_WIDTH/2);
   brush.generateTexture(key,SHAFT_WIDTH,SHAFT_HEIGHT);
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

function halo(scene,x,y,colour,width,height,depth){
 const g=scene.add.graphics().setPosition(x,y).setDepth(depth).setBlendMode(1);
 for(let ring=7;ring>0;ring--)g.fillStyle(colour,.025).fillEllipse(0,0,width*ring/7,height*ring/7);
 return g;
}

export function createSMFStageLighting(scene,stage,lampPositions){
 const colours=PALETTES[stage.id];
 const textures=bakeShafts(scene,colours);
 // Eight rays from the measured six-head rig; outside heads have split fans.
 const rays=[0,0,1,2,3,4,5,5].map((source,i)=>{
  const [x,y]=lampPositions[source];
  return [shaft(scene,x,y,colours[i%2],textures[i%2]),shaft(scene,x,y,colours[2+i%2],textures[2+i%2])];
 });
 const lamps=lampPositions.map(([x,y],i)=>({
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
    node.rotation=beam.angle;
    node.setScale(beam.width,1).setAlpha(beam.alpha*(j?cue.colourMix:1-cue.colourMix)*4.2);
   });
  });
  lamps.forEach((lamp,i)=>{
   const beam=cue.beams[[0,2,3,4,5,7][i]];
   lamp.halo.setAlpha(beam.glow).setScale(1+cue.energy*.28);
   lamp.lens.setAlpha(.35+beam.glow);
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
  // StageRenderer destroys its owned images first, then releases these four
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
