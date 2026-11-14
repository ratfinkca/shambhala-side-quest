import {loadActorSource,recolourActorFrame} from '../pixel-art/actor-textures.js';
import {FRAME_WIDTH,FRAME_HEIGHT,actorAnchors} from '../pixel-art/actor-wardrobe.js';
import {loadCharacterHeadLayers,drawCharacterHeadLayer} from '../pixel-art/actor-heads.js';
import {DEFAULT_APPEARANCE} from '../character.js';
import effectsURL from './assets/pickups-friendship-v1.png?url';
import {PIXEL_CLIPS,PIXEL_SHEETS,pixelFrame} from './atlas.js';
export {PIXEL_CLIPS};

export const PIXEL_ART_URLS={effects:effectsURL};

export async function loadPixelArtwork(){
  const loaded=await Promise.all(Object.entries(PIXEL_ART_URLS).map(async([key,url])=>{
    const image=new Image();
    image.src=url;
    await image.decode();
    const sheet=PIXEL_SHEETS[key];
    if(image.naturalWidth!==sheet.width||image.naturalHeight!==sheet.height)throw new Error(`Pixel ${key} sheet dimensions do not match its atlas.`);
    return [key,image];
  }));
  // Inspect exactly the production frames, including the authored side rig.
  // The original generated study sheet remains reference material only.
  const source=await loadActorSource();
  if(!source)throw new Error('Production actor source could not load.');
  const raver=document.createElement('canvas');
  raver.width=FRAME_WIDTH*6;raver.height=FRAME_HEIGHT*9;
  const ctx=raver.getContext('2d');
  source.frames.forEach((frame,index)=>ctx.putImageData(recolourActorFrame(frame,'lime','light'),(index%6)*FRAME_WIDTH,Math.floor(index/6)*FRAME_HEIGHT));
  const heads=Object.fromEntries(await Promise.all(['front','right','back'].map(async facing=>[facing,await loadCharacterHeadLayers(DEFAULT_APPEARANCE,facing)])));
  return {...Object.fromEntries(loaded),raver,heads};
}

export function drawPixelFrame(ctx,artwork,name,index,x,y,scale=1,flipX=false){
  const f=pixelFrame(name,index),image=artwork[f.type];
  if(!image||!Number.isFinite(scale)||scale<=0)return;
  ctx.save();
  ctx.imageSmoothingEnabled=false;
  ctx.translate(Math.round(x),Math.round(y));
  ctx.scale(scale,scale);
  // Body mirroring reconstructs opposite footsteps; the haircut keeps the
  // player's facing. The lab's origin is the foot, 16px below Avatar's origin.
  const bodyFlip=Boolean(flipX)!==f.mirror;
  const fit=f.type==='raver'?actorAnchors({row:PIXEL_CLIPS[name].row,index:f.source,flipX:bodyFlip,facingFlipX:Boolean(flipX),poseMirror:f.mirror}).headwear:null;
  const head=fit?artwork.heads?.[fit.side?'right':fit.back?'back':'front']:null;
  const drawHead=layer=>drawCharacterHeadLayer(ctx,layer,fit.x,fit.y-16,{flipX:fit.side&&bodyFlip});
  if(head)drawHead(head.hairRear);
  ctx.save();ctx.scale(bodyFlip?-1:1,1);
  ctx.drawImage(image,f.x,f.y,f.width,f.height,-f.anchorX,-f.anchorY,f.displayWidth,f.displayHeight);
  ctx.restore();
  if(head){drawHead(head.face);drawHead(head.hairFront);}
  ctx.restore();
}
