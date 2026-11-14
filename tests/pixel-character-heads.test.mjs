import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {inflateSync} from 'node:zlib';
import {removeEmbeddedHead} from '../src/pixel-art/actor-head-mask.js';
import {ACTOR_SOURCE_ATTACHMENTS} from '../src/pixel-art/actor-attachments.js';
import {HEAD_SOURCE,HEAD_ORIGIN,drawCharacterExpression,drawFallbackCharacterHead} from '../src/pixel-art/actor-heads.js';
import {SKIN_PALETTES} from '../src/pixel-art/actor-wardrobe.js';
import {CHARACTER_OPTIONS} from '../src/character.js';

// Decode the actual RGBA PNG to validate the body mask against authored hands,
// without a browser canvas or generated image changes in the test workflow.
function rgbaPng(path){
 const png=readFileSync(path),width=png.readUInt32BE(16),height=png.readUInt32BE(20),chunks=[];
 assert.equal(png[24],8);assert.equal(png[25],6);assert.equal(png[28],0);
 for(let o=8;o<png.length;){const n=png.readUInt32BE(o);if(png.toString('ascii',o+4,o+8)==='IDAT')chunks.push(png.subarray(o+8,o+8+n));o+=12+n;}
 const raw=inflateSync(Buffer.concat(chunks)),stride=width*4,data=new Uint8ClampedArray(stride*height);
 const paeth=(a,b,c)=>{const p=a+b-c,da=Math.abs(p-a),db=Math.abs(p-b),dc=Math.abs(p-c);return da<=db&&da<=dc?a:db<=dc?b:c;};
 for(let y=0;y<height;y++)for(let x=0;x<stride;x++){
  const filter=raw[y*(stride+1)],a=x>=4?data[y*stride+x-4]:0,b=y?data[(y-1)*stride+x]:0,c=y&&x>=4?data[(y-1)*stride+x-4]:0;
  const prediction=[0,a,b,Math.floor((a+b)/2),paeth(a,b,c)][filter];assert.notEqual(prediction,undefined);
  data[y*stride+x]=(raw[y*(stride+1)+1+x]+prediction)&255;
 }
 return {data,width,height};
}
function cell(image,row,col,rows=8,columns=6){
 const x0=Math.round(col*image.width/columns),y0=Math.round(row*image.height/rows),width=Math.round((col+1)*image.width/columns)-x0,height=Math.round((row+1)*image.height/rows)-y0,data=new Uint8ClampedArray(width*height*4);
 for(let y=0;y<height;y++)data.set(image.data.subarray(((y0+y)*image.width+x0)*4,((y0+y)*image.width+x0+width)*4),y*width*4);
 return {data,width,height};
}

test('head removal clears the real scalp while preserving every measured palm and the lower body',()=>{
 const source=rgbaPng(new URL('../src/pixel-art/assets/raver-base-v1.png',import.meta.url));
 for(const [row,poses]of Object.entries(ACTOR_SOURCE_ATTACHMENTS))poses.forEach((pose,index)=>{
  const frame=cell(source,Number(row),index),before=frame.data.slice(),result=removeEmbeddedHead(frame,{row:Number(row),index}),label=`row ${row}, frame ${index}`;
  assert.ok(result.removed>700,label+' removes the baked head');
  const [cx,cap,,top,lx,ly,rx,ry]=pose;
  assert.equal(frame.data[(Math.round(top+8)*frame.width+Math.round(cx))*4+3],0,label+' clears central hair');
  for(const [px,py]of [[lx,ly],[rx,ry]]){
   let opaqueSkin=0;
   for(let y=Math.round(py)-5;y<=Math.round(py)+5;y++)for(let x=Math.round(px)-5;x<=Math.round(px)+5;x++){
    const offset=(y*frame.width+x)*4;
    if(before[offset+3]>=150){opaqueSkin++;assert.deepEqual(frame.data.slice(offset,offset+4),before.slice(offset,offset+4),label+' preserves actual palm pixels');}
   }
   assert.ok(opaqueSkin>=30,label+' checks an actual opaque palm');
  }
  assert.deepEqual(frame.data.slice(result.cutoff*frame.width*4),before.slice(result.cutoff*frame.width*4),label+' leaves torso and legs untouched');
  assert.ok(result.cutoff>cap,label+' has a collar below the cap');
 });
});

test('expressions remain distinct and front/profile eyes stay inside all four actual hair openings',()=>{
 const source=rgbaPng(new URL('../src/pixel-art/assets/character-head-parts-v1.png',import.meta.url));
 assert.equal(source.width,HEAD_SOURCE.width);assert.equal(source.height,HEAD_SOURCE.height);
 const drawing=(face,direction='right')=>{const rects=[],ctx={fillRect(x,y,w,h){rects.push({x,y,w,h,colour:this.fillStyle});}};drawCharacterExpression(ctx,face,direction);return rects;};
 const smile=drawing('smile'),grin=drawing('grin');assert.notDeepEqual(smile,grin);
 assert.ok(!smile.some(r=>r.colour==='#fff2d7'),'Easy smile is a closed smile');assert.ok(grin.some(r=>r.colour==='#fff2d7'),'Big grin shows teeth');
 for(const [row,offset]of [[1,0],[2,24],[3,48],[4,52]]){
  const hair=cell(source,row,1,5,3);
  const eye=smile.find(r=>r.w===2&&r.h===2);
  let visible=0;
  for(let y=eye.y;y<eye.y+eye.h;y++)for(let x=eye.x;x<eye.x+eye.w;x++){
   const sx=Math.floor(160+(x+.5-HEAD_ORIGIN.x)/.0875),sy=Math.floor(154-offset+(y+.5-HEAD_ORIGIN.y)/.0875);
   if(hair.data[(sy*hair.width+sx)*4+3]<150)visible++;
  }
  assert.ok(visible>=3,`hair row ${row} preserves a readable profile eye`);
  const frontHair=cell(source,row,0,5,3);
  for(const face of ['smile','grin','chill'])for(const rect of drawing(face,'front').filter(r=>r.y<HEAD_ORIGIN.y+7)){
   for(let y=rect.y;y<rect.y+rect.h;y++)for(let x=rect.x;x<rect.x+rect.w;x++){
    const sx=Math.floor(168+(x+.5-HEAD_ORIGIN.x)/.0875),sy=Math.floor(154-offset+(y+.5-HEAD_ORIGIN.y)/.0875);
    assert.ok(frontHair.data[(sy*frontHair.width+sx)*4+3]<150,`hair row ${row} leaves ${face}'s front eye pixel ${x},${y} visible`);
   }
  }
 }
});

test('temporary heads stay on the measured cap and use every selected skin tone',()=>{
 for(const {id}of CHARACTER_OPTIONS.skinTone)for(const side of [false,true])for(const back of [false,true]){
  const rects=[],g={clear(){rects.length=0;return this;},fillStyle(colour){this.colour=colour;return this;},fillRect(x,y,w,h){rects.push({x,y,w,h,colour:this.colour});return this;}};
  drawFallbackCharacterHead(g,id,{x:2,y:-23,side,back,flipX:side});
  assert.ok(rects.some(r=>r.colour===SKIN_PALETTES[id][2]),id+' matches the hand palette');
  assert.ok(rects.every(r=>r.y>=-28&&r.y+r.h<=-9),'fallback fits the existing collar and cap');
 }
});

test('shared head decoding retries and concurrent identical NPC requests bake their layers only once',async()=>{
 const previous={Image:globalThis.Image,document:globalThis.document,ImageData:globalThis.ImageData};let attempts=0,samples=0;
 globalThis.Image=class{naturalWidth=HEAD_SOURCE.width;naturalHeight=HEAD_SOURCE.height;async decode(){if(++attempts===1)throw new Error('temporary head failure');}};
 globalThis.ImageData=class{constructor(data,width,height){Object.assign(this,{data,width,height});}};
 globalThis.document={createElement:()=>({getContext:()=>({drawImage(){},putImageData(){},fillRect(){},getImageData(x,y,width,height){samples++;return {data:new Uint8ClampedArray(width*height*4),width,height};}})})};
 try{
  const {loadCharacterHeadLayers}=await import('../src/pixel-art/actor-heads.js?head-cache-regression');
  await assert.rejects(loadCharacterHeadLayers({},'front'),/temporary head failure/);
  const result=await Promise.all(Array.from({length:25},()=>loadCharacterHeadLayers({},'front')));
  assert.equal(attempts,2);assert.equal(samples,3,'two source cells plus one split, once for the entire crowd');
  assert.ok(result.every(v=>v===result[0]));assert.equal(await loadCharacterHeadLayers({},'front'),result[0]);
 }finally{for(const [key,value]of Object.entries(previous)){if(value===undefined)delete globalThis[key];else globalThis[key]=value;}}
});
