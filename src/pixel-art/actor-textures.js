import {ACTOR_SOURCE_URL,ACTOR_GRID} from './actor-source.js';
import {ACTOR_SIDE_PARTS} from './actor-side-parts.js';
import {bakeSideActorFrames,bakeSideActorRest} from './actor-side-rig.js';
import {removeEmbeddedHead} from './actor-head-mask.js';
import {OUTFIT_PALETTES,SKIN_PALETTES,FRAME_WIDTH,FRAME_HEIGHT,FOOT_X,FOOT_Y,wardrobePattern} from './actor-wardrobe.js';
let sourcePromise=null;
const managers=new WeakMap();
function canvas(width,height){const node=document.createElement('canvas');node.width=width;node.height=height;return node;}
function rgb(n){return [n>>16&255,n>>8&255,n&255];}
async function sourceImage(url){const image=new Image();image.src=url;await image.decode();return image;}
function sampleFrame(image,{columns,rows},row,col,scale,anchor){
 const cw=image.naturalWidth/columns,ch=image.naturalHeight/rows;
 const c=canvas(FRAME_WIDTH,FRAME_HEIGHT),g=c.getContext('2d',{willReadFrequently:true});g.imageSmoothingEnabled=false;
 const sx=Math.round(col*cw),sy=Math.round(row*ch),sw=Math.round((col+1)*cw)-sx,sh=Math.round((row+1)*ch)-sy;
 const raw=canvas(sw,sh),rawContext=raw.getContext('2d',{willReadFrequently:true});rawContext.drawImage(image,sx,sy,sw,sh,0,0,sw,sh);
 const source=rawContext.getImageData(0,0,sw,sh);removeEmbeddedHead({data:source.data,width:sw,height:sh},{row,index:col});rawContext.putImageData(source,0,0);
 g.drawImage(raw,0,0,sw,sh,FOOT_X-anchor.x*scale,FOOT_Y-anchor.y*scale,sw*scale,sh*scale);
 return g.getImageData(0,0,FRAME_WIDTH,FRAME_HEIGHT);
}
function bounds(data,width,height){
 let x0=width,y0=height,x1=0,y1=0;
 for(let y=0;y<height;y++)for(let x=0;x<width;x++)if(data[(y*width+x)*4+3]>190){x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);}
 return {x0,y0,x1,y1,width:x1-x0+1,height:y1-y0+1};
}
export function loadActorSource(){
 if(typeof Image==='undefined'||typeof document==='undefined')return Promise.resolve(null);
 if(!sourcePromise)sourcePromise=(async()=>{
  const image=await sourceImage(ACTOR_SOURCE_URL);
  const cw=image.naturalWidth/ACTOR_GRID.columns,ch=image.naturalHeight/ACTOR_GRID.rows;
  const probe=canvas(Math.ceil(cw),Math.ceil(ch)),ctx=probe.getContext('2d',{willReadFrequently:true});ctx.drawImage(image,0,0);
  const b=bounds(ctx.getImageData(0,0,probe.width,probe.height).data,probe.width,probe.height);
  // ONE source anchor/scale applies to all 48 frames. Never recenter each pose.
  const scale=Math.min(44/b.height,44/b.width),sourceFoot={x:(b.x0+b.x1)/2,y:b.y1};
  const frames=[];
  for(let row=0;row<8;row++)for(let col=0;col<6;col++)frames.push(sampleFrame(image,ACTOR_GRID,row,col,scale,sourceFoot));
  const parts=await sourceImage(ACTOR_SIDE_PARTS.url),sideFrames=bakeSideActorFrames(parts);
  for(let i=0;i<12;i++)frames[(i<6?3:6)*6+i%6]=sideFrames[i];
  frames.push(bakeSideActorRest(parts));
  const heldFrames=frames.slice(),heldSide=bakeSideActorFrames(parts,{carrying:true});
  for(let i=0;i<12;i++)heldFrames[(i<6?3:6)*6+i%6]=heldSide[i];
  heldFrames[48]=bakeSideActorRest(parts,{carrying:true});
  return {frames,heldFrames,sourceWidth:image.naturalWidth,sourceHeight:image.naturalHeight,sideSourceWidth:parts.naturalWidth,sideSourceHeight:parts.naturalHeight};
 })().catch(error=>{sourcePromise=null;throw error;});
 return sourcePromise;
}
export function recolourActorFrame(frame,onesie,skinTone){
 const output=new ImageData(new Uint8ClampedArray(frame.data),FRAME_WIDTH,FRAME_HEIGHT),d=output.data;
 const palette=OUTFIT_PALETTES[onesie]??OUTFIT_PALETTES.lime,skin=SKIN_PALETTES[skinTone]??SKIN_PALETTES.light;
 for(let y=0;y<FRAME_HEIGHT;y++)for(let x=0;x<FRAME_WIDTH;x++){
  const i=(y*FRAME_WIDTH+x)*4,r=d[i],g=d[i+1],b=d[i+2],a=d[i+3];
  if(a<150){d[i+3]=0;continue;}d[i+3]=255;
  const max=Math.max(r,g,b),min=Math.min(r,g,b),grey=max-min<Math.max(27,max*.2);
  let colour;
  // Clothing begins below the chin; preserve white eyes/teeth in the face.
  const footwear=frame.footwearMask?Boolean(frame.footwearMask[i/4]):y>=68||(y>=62&&max>=170);
  if(y>=49&&!footwear&&grey&&max>48){const shade=Math.min(3,Math.floor(max/64));colour=wardrobePattern(onesie,x,y,shade,palette[shade]);}
  else if(r>g*1.13&&g>b*1.12&&r>102&&y<61){const shade=Math.min(3,Math.max(0,Math.floor((r-65)/48)));colour=skin[shade];}
  if(colour!==undefined){const c=rgb(colour);d[i]=c[0];d[i+1]=c[1];d[i+2]=c[2];}
 }
 return output;
}
export async function actorTexture(scene,onesie,skinTone='light',carrying=false){
 const source=await loadActorSource();if(!source||!scene.textures?.addCanvas)return null;
 let cache=managers.get(scene.textures);if(!cache){cache=new Map();managers.set(scene.textures,cache);}
 const key=`sidequest-actor-${onesie}-${skinTone}${carrying?'-carry':''}`;
 if(cache.has(key)&&scene.textures.exists(key))return key;
 const sheet=canvas(FRAME_WIDTH*6,FRAME_HEIGHT*9),ctx=sheet.getContext('2d');
 const frames=carrying?source.heldFrames:source.frames;
 frames.forEach((frame,index)=>ctx.putImageData(recolourActorFrame(frame,onesie,skinTone),(index%6)*FRAME_WIDTH,Math.floor(index/6)*FRAME_HEIGHT));
 const texture=scene.textures.addCanvas(key,sheet);
 for(let i=0;i<source.frames.length;i++)texture.add(String(i),0,(i%6)*FRAME_WIDTH,Math.floor(i/6)*FRAME_HEIGHT,FRAME_WIDTH,FRAME_HEIGHT);
 texture.setFilter?.(1);cache.set(key,true);return key;
}
