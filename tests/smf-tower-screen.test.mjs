import test from 'node:test';
import assert from 'node:assert/strict';
import {drawTowerScreen} from '../src/editions/smf-tower-screen.js';
import {pointInPolygon} from '../src/geometry.js';

function draw(panel,turn,energy,index){
 const fills=[],lines=[];let fill,stroke;
 const g={fillStyle(colour,alpha){fill={colour,alpha};return this;},lineStyle(width,colour,alpha){stroke={width,colour,alpha};return this;},
  fillRect(x,y,w,h){fills.push({...fill,rect:{x,y,w,h}});return this;},
  fillPoints(points){fills.push({...fill,points:structuredClone(points)});return this;},
  strokePoints(points){lines.push({...stroke,points:structuredClone(points)});return this;},
  lineBetween(x,y,x2,y2){lines.push({...stroke,points:[{x,y},{x:x2,y:y2}]});return this;}};
 drawTowerScreen(g,panel,turn,energy,index);return {fills,lines};
}
const panel={x:176.875,y:170.625,w:26.25,h:33.75};
test('tower lighting is confined to carved openings and leaves opaque timber in front',()=>{
 for(let turn=0;turn<Math.PI*4;turn+=.17){
  const {fills,lines}=draw(panel,turn,1.2,3);
  assert.equal(fills[0].colour,0x80502b);assert.equal(fills[0].alpha,1);assert.deepEqual(fills[0].rect,panel);
  assert.equal(fills[1].colour,0xb67a3e);assert.equal(fills[1].alpha,1);
  assert.equal(fills.filter(fill=>fill.rect).length,1,'LED colour never floods a rectangular screen');
  let opening;
  for(const fill of fills.slice(2)){
   if(fill.colour===0x06191d)opening=fill.points;
   else for(const p of fill.points)assert.ok(pointInPolygon(p,opening),'coloured light stays inside the negative space');
  }
  for(const op of [...fills,...lines]){
   assert.ok(Number.isFinite(op.alpha)&&op.alpha>=0&&op.alpha<=1);
   for(const p of op.points??[])assert.ok(p.x>=panel.x&&p.x<=panel.x+panel.w&&p.y>=panel.y&&p.y<=panel.y+panel.h,'all geometry stays inside its tower panel');
  }
  assert.ok(fills.length<=18&&lines.length===6,'the eight tower faces use bounded vector geometry');
 }
});
test('wood and cutout shapes stay fixed while venue light moves deterministically through them',()=>{
 const first=draw(panel,0,.72,0),later=draw(panel,2.7,.72,0);
 assert.deepEqual(draw(panel,0,.72,0),first);
 assert.notDeepEqual(later.fills,first.fills);
 assert.deepEqual(later.lines,first.lines,'carved wood is not a warped animated screen');
 assert.deepEqual(later.fills.filter(f=>f.colour===0x06191d),first.fills.filter(f=>f.colour===0x06191d));
 assert.notDeepEqual(draw(panel,0,.72,1).fills,first.fills,'neighbouring towers chase different colours');
});
test('panel rendering handles the measured short/tall sizes and bad optional inputs without invalid commands',()=>{
 for(const [w,h]of [[47,43],[44,54],[40,54]])for(const energy of [0,1.35,4,NaN]){
  const output=draw({...panel,w:w*.625,h:h*.625},NaN,energy,0);
  assert.ok(output.fills.length>10);
  assert.ok(output.fills.every(fill=>Number.isFinite(fill.alpha)));
 }
 assert.deepEqual(draw({...panel,w:0},0,1,0),{fills:[],lines:[]});
});
