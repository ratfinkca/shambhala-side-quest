import {normalizeAppearance} from '../character.js';
import {SKIN_PALETTES} from './actor-wardrobe.js';
export const HEAD_SOURCE={url:new URL('./assets/character-head-parts-v1.png',import.meta.url).href,width:971,height:1619,columns:3,rows:5};
export const HEAD_ORIGIN={x:24,y:20},HEAD_SIZE=48;
const FACING={front:0,right:1,back:2},HAIR={bob:1,crop:2,curls:3,locs:4};
// The generator offset later hair rows upward inside their cells. These fixed
// registrations put each opening on the same scalp; no per-combination images.
const HAIR_Y={bob:0,crop:24,curls:48,locs:52},CAP_X=[168,160,150],CAP_Y=154,SCALE=.0875;
let sourcePromise=null;
const layers=new Map();
function canvas(w=HEAD_SIZE,h=HEAD_SIZE){const c=document.createElement('canvas');c.width=w;c.height=h;return c;}
export async function loadCharacterHeadSource(){
 if(typeof Image==='undefined'||typeof document==='undefined')return null;
 if(!sourcePromise)sourcePromise=(async()=>{const image=new Image();image.src=HEAD_SOURCE.url;await image.decode();if(image.naturalWidth!==HEAD_SOURCE.width||image.naturalHeight!==HEAD_SOURCE.height)throw new Error('Character head atlas dimensions do not match its registration.');return image;})().catch(error=>{sourcePromise=null;throw error;});
 return sourcePromise;
}
function skinColour(r,palette){return palette[Math.min(3,Math.max(0,Math.floor((r-65)/48)))];}
function tile(image,row,col,appearance,hair=false){
 const sx=Math.round(col*HEAD_SOURCE.width/3),sy=Math.round(row*HEAD_SOURCE.height/5),sw=Math.round((col+1)*HEAD_SOURCE.width/3)-sx,sh=Math.round((row+1)*HEAD_SOURCE.height/5)-sy;
 const raw=canvas(sw,sh),g=raw.getContext('2d',{willReadFrequently:true});g.drawImage(image,sx,sy,sw,sh,0,0,sw,sh);
 const p=g.getImageData(0,0,sw,sh),d=p.data,palette=SKIN_PALETTES[appearance.skinTone]??SKIN_PALETTES.light;
 for(let i=0;i<d.length;i+=4){
  if(d[i+3]<150){d[i+3]=0;continue;}d[i+3]=255;
  const [r,green,b]=d.slice(i,i+3),y=Math.floor(i/4/sw);
  // A few bob cells include their ear. Recolour that small skin region only;
  // brown hair highlights never pass the lower-head/skin-colour gate.
  const ear=hair&&row===1&&y>195&&r>190&&green>125&&b>75&&r>green*1.12&&green>b*1.12;
  if((!hair&&Math.max(r,green,b)>85)||ear){const n=skinColour(r,palette);d[i]=n>>16&255;d[i+1]=n>>8&255;d[i+2]=n&255;}
 }
 g.putImageData(p,0,0);
 const target=canvas(),t=target.getContext('2d',{willReadFrequently:true});t.imageSmoothingEnabled=false;
 t.drawImage(raw,HEAD_ORIGIN.x-CAP_X[col]*SCALE,HEAD_ORIGIN.y-(CAP_Y-(hair?HAIR_Y[appearance.hair]:0))*SCALE,sw*SCALE,sh*SCALE);
 return target;
}
export function drawCharacterExpression(g,face,direction){
 if(direction==='back')return;
 const x=HEAD_ORIGIN.x,y=HEAD_ORIGIN.y,ink='#302a48',cream='#fff2d7';
 const pixel=(c,dx,dy,w=1,h=1)=>{g.fillStyle=c;g.fillRect(x+dx,y+dy,w,h);};
 if(direction==='right'){
  // The eye sits below the forelock and behind the nose, inside the measured
  // opening of all four profile hair layers. A full 2px eye reads at game size.
  if(face==='chill'){pixel(ink,4,4,3,1);pixel(ink,5,8,3,1);}
  else if(face==='smile'){pixel(ink,4,4,2,2);pixel(ink,4,8,3,1);pixel(ink,7,7);}
  else{pixel(ink,4,3,2,1);pixel(ink,3,4);pixel(ink,6,4);pixel(ink,4,7,4,3);pixel(cream,5,7,3,1);pixel('#dc8193',5,9,2,1);}
  return;
 }
 if(face==='chill'){pixel(ink,-4,5,3,1);pixel(ink,2,5,3,1);pixel(ink,-1,9,3,1);return;}
 if(face==='smile'){pixel(ink,-4,5,2,2);pixel(ink,3,5,2,2);pixel(ink,-2,9,4,1);pixel(ink,-3,8);pixel(ink,2,8);return;}
 for(const eye of [-2,3]){pixel(ink,eye-1,4,2,1);pixel(ink,eye-2,5);pixel(ink,eye+1,5);}
 pixel(ink,-3,7,7,4);pixel(cream,-2,7,5,1);pixel('#dc8193',-1,10,3,1);
 if(face==='grin'){pixel('#d58a82',-6,7,2,1);pixel('#d58a82',5,7,2,1);}
}
export async function loadCharacterHeadLayers(value,direction='front'){
 const appearance=normalizeAppearance(value),facing=Object.hasOwn(FACING,direction)?direction:'front',key=[appearance.face,appearance.hair,appearance.skinTone,facing].join(':');
 if(layers.has(key))return layers.get(key);
 const image=await loadCharacterHeadSource();if(!image)return null;
 // Many dancers can await the same first decode. The first continuation does
 // the synchronous bake; later continuations reuse it instead of repeating it.
 if(layers.has(key))return layers.get(key);
 const col=FACING[facing],face=tile(image,0,col,appearance),hair=tile(image,HAIR[appearance.hair],col,appearance,true);
 drawCharacterExpression(face.getContext('2d'),appearance.face,facing);
 const front=canvas(),rear=canvas(),fg=front.getContext('2d'),rg=rear.getContext('2d'),pixels=hair.getContext('2d',{willReadFrequently:true}).getImageData(0,0,HEAD_SIZE,HEAD_SIZE);
 const backPixels=new ImageData(new Uint8ClampedArray(pixels.data),HEAD_SIZE,HEAD_SIZE);
 for(let y=0;y<HEAD_SIZE;y++)for(let x=0;x<HEAD_SIZE;x++){const i=(y*HEAD_SIZE+x)*4;if(y>HEAD_ORIGIN.y+11)pixels.data[i+3]=0;else backPixels.data[i+3]=0;}
 fg.putImageData(pixels,0,0);rg.putImageData(backPixels,0,0);
 const result={face,hairFront:front,hairRear:rear,origin:HEAD_ORIGIN,size:HEAD_SIZE};layers.set(key,result);return result;
}
export function drawCharacterHeadLayer(ctx,layer,x,y,{flipX=false,scale=1}={}){
 if(!layer)return;ctx.save();ctx.imageSmoothingEnabled=false;ctx.translate(Math.round(x),Math.round(y));ctx.scale(flipX?-scale:scale,scale);ctx.drawImage(layer,-HEAD_ORIGIN.x,-HEAD_ORIGIN.y);ctx.restore();
}
export async function characterPortrait(appearance,{facing='front',scale=4}={}){
 const head=await loadCharacterHeadLayers(appearance,facing==='left'?'right':facing);if(!head)return null;
 const result=canvas(HEAD_SIZE*scale,HEAD_SIZE*scale),ctx=result.getContext('2d');
 for(const part of [head.hairRear,head.face,head.hairFront])drawCharacterHeadLayer(ctx,part,HEAD_ORIGIN.x*scale,HEAD_ORIGIN.y*scale,{flipX:facing==='left',scale});return result;
}
export async function characterHeadTextures(scene,appearance){
 if(!scene.textures?.addCanvas)return null;
 const value=normalizeAppearance(appearance),keys={};
 const rows=await Promise.all(['front','right','back'].map(f=>loadCharacterHeadLayers(value,f)));if(rows.some(v=>!v))return null;
 for(const part of ['face','hairFront','hairRear']){
  const name=`sidequest-head-${part}-${part==='face'?`${value.face}-${value.skinTone}`:`${value.hair}-${value.skinTone}`}`;keys[part]=name;
  if(scene.textures.exists(name))continue;
  const sheet=canvas(HEAD_SIZE*3,HEAD_SIZE),ctx=sheet.getContext('2d');rows.forEach((row,i)=>ctx.drawImage(row[part],i*HEAD_SIZE,0));
  const texture=scene.textures.addCanvas(name,sheet);for(let i=0;i<3;i++)texture.add(String(i),0,i*HEAD_SIZE,0,HEAD_SIZE,HEAD_SIZE);texture.setFilter?.(1);
 }
 return keys;
}

// A decode failure must not leave a headless dancer. This tiny temporary head
// uses the same cap socket and skin palette until the generated layers arrive.
export function drawFallbackCharacterHead(g,skinTone,fit){
 g.clear();const skin=SKIN_PALETTES[skinTone]??SKIN_PALETTES.light,x=Math.round(fit.x),y=Math.round(fit.y),sign=fit.flipX?-1:1;
 g.fillStyle(0x302a48).fillRect(x-9,y-4,18,18);
 g.fillStyle(skin[2]).fillRect(x-7,y-1,14,14);
 g.fillStyle(0x654032).fillRect(x-9,y-5,18,6).fillRect(x-9,y,3,10);
 if(fit.back){g.fillStyle(0x654032).fillRect(x-7,y-1,14,13);return;}
 g.fillStyle(0x302a48);
 if(fit.side){g.fillRect(x+sign*5-1,y+4,2,2).fillRect(x+sign*4-1,y+9,3,1);}
 else g.fillRect(x-5,y+4,2,2).fillRect(x+4,y+4,2,2).fillRect(x-2,y+9,4,1);
}
