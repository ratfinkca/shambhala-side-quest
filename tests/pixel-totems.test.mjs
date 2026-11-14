import test from 'node:test';
import assert from 'node:assert/strict';
import {WARDROBE} from '../src/wardrobe.js';
import {drawTotem,drawTotemGrip,totemLayout} from '../src/pixel-art/actor-totems.js';
import {SKIN_PALETTES} from '../src/pixel-art/actor-wardrobe.js';

function graphics(){return {rects:[],clear(){this.rects=[];return this;},fillStyle(colour){this.colour=colour;return this;},fillRect(x,y,w,h){this.rects.push({colour:this.colour,x,y,w,h});return this;}};}
const covers=(r,x,y)=>r.x<=x&&r.x+r.w>x&&r.y<=y&&r.y+r.h>y;

test('all saved totem choices have compact pixel art, or explicitly clear the layer',()=>{
 const g=graphics();
 for(const {id}of WARDROBE.totem){
  const layout=drawTotem(g,id,{hand:{x:9.6,y:1.9}});
  if(id==='none'){assert.equal(layout,null);assert.deepEqual(g.rects,[]);continue;}
  assert.ok(layout,id);assert.ok(layout.icon.width<=20,id);assert.ok(layout.icon.height<=16,id);
  assert.ok(g.rects.length>10,id);
  assert.ok(g.rects.every(r=>[r.x,r.y,r.w,r.h].every(Number.isInteger)),`${id} stays on the pixel grid`);
  assert.ok(g.rects.every(r=>r.y>=layout.grip.y-42&&r.y+r.h<=layout.grip.y+4),`${id} fits a short carried staff`);
 }
 assert.equal(drawTotem(g,'not-a-saved-id'),null);assert.deepEqual(g.rects,[]);
});

test('pole passes through the supplied palm, without a direction-specific hand gap',()=>{
 for(const facing of ['up','down','left','right'])for(const hand of [{x:-9.6,y:1.9},{x:11.2,y:-5.5},{x:10,y:-1}]){
  const g=graphics(),layout=drawTotem(g,'star',{hand,facing,back:facing==='up'});
  assert.deepEqual(layout.grip,{x:Math.round(hand.x),y:Math.round(hand.y)});
  assert.equal(layout.pole.x,layout.grip.x);
  assert.ok(g.rects.some(r=>r.w===1&&covers(r,layout.grip.x,layout.grip.y)),'continuous pole at the grip');
  assert.ok(layout.pole.top<layout.grip.y&&layout.pole.bottom>layout.grip.y);
 }
});

test('foreground grip covers the pole with the actor skin and clears when unequipped',()=>{
 const layout=totemLayout('moon',{hand:{x:-10,y:2},facing:'left'}),g=graphics();
 for(const skin of Object.values(SKIN_PALETTES)){
  drawTotemGrip(g,layout,{skin});
  assert.ok(g.rects.some(r=>skin.includes(r.colour)&&covers(r,-10,2)),'fingers close over the pole');
  assert.ok(g.rects.every(r=>skin.includes(r.colour)||r.colour===0x302a48));
 }
 drawTotemGrip(g,null);assert.deepEqual(g.rects,[]);
});

test('reduced-motion jellyfish remains still and normal animation never shifts its pole',()=>{
 const g=graphics(),options={hand:{x:10,y:-1},reduced:true,time:0};drawTotem(g,'jellyfish',options);const still=g.rects;
 drawTotem(g,'jellyfish',{...options,time:250});assert.deepEqual(g.rects,still);
 const first=drawTotem(g,'jellyfish',{...options,reduced:false,time:0}),a=g.rects;
 const second=drawTotem(g,'jellyfish',{...options,reduced:false,time:250});
 assert.notDeepEqual(g.rects,a);assert.deepEqual(first.pole,second.pole);assert.deepEqual(first.grip,second.grip);
});
