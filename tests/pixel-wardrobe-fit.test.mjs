import test from 'node:test';
import assert from 'node:assert/strict';
import {drawHat} from '../src/pixel-art/actor-hats.js';
import {WARDROBE} from '../src/wardrobe.js';
function painted(id,fit){const rects=[];let colour;const g={clear(){rects.length=0;return this;},fillStyle(c){colour=c;return this;},fillRect(x,y,w,h){rects.push({x,y,w,h,colour});return this;}};drawHat(g,id,{x:0,y:-20},fit.back,{headwear:fit});return rects;}

test('every hat has a visible contact at its measured head surface',()=>{
 for(const {id}of WARDROBE.hat)if(id!=='none')for(const side of [false,true]){
  const fit={x:2,y:-23,width:18,side,back:false,flipX:false},rects=painted(id,fit);
  assert.ok(rects.length>0,id);
  const contactY=fit.y+(id==='headphones'?-5:0);
  assert.ok(rects.some(r=>r.x<=fit.x&&r.x+r.w>=fit.x+1&&r.y<=contactY+1&&r.y+r.h>=contactY),`${id} needs contact with the hair, not an air gap`);
  for(const r of rects){assert.ok(r.w>0&&r.h>0);assert.ok(Number.isInteger(r.x)&&Number.isInteger(r.y));}
 }
});

test('profile hats reflect around the head socket and preserve vertical contact',()=>{
 for(const {id}of WARDROBE.hat)if(id!=='none'){
  const fit={x:3,y:-22,width:19,side:true,back:false,flipX:false};
  const right=painted(id,fit),left=painted(id,{...fit,flipX:true});
  assert.deepEqual(left,right.map(r=>({...r,x:2*fit.x-r.x-r.w})),id);
 }
});

test('earcups sit at ear height and none clears the hat layer',()=>{
 const fit={x:0,y:-22,width:18,side:true,back:false};
 const cups=painted('headphones',fit);
 assert.ok(cups.some(r=>r.y<=-17&&r.y+r.h>=-14&&r.x<=-1&&r.x+r.w>=1));
 assert.equal(painted('none',fit).length,0);
});
