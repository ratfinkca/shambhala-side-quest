import test from 'node:test';
import assert from 'node:assert/strict';
import {drawSMFScreen} from '../src/editions/smf-screen-visuals.js';
function drawing(){
 const calls=[];let g;g=new Proxy({}, {get:(_,key)=>(...args)=>{calls.push([key,...args]);return g}});
 return {g,calls};
}
test('kaleidoscope geometry remains inside narrow and wide measured LED panels',()=>{
 for(const style of ['liquid','tunnel'])for(const [w,h]of [[120,45],[148,74],[96,10]])for(let turn=0;turn<Math.PI*8;turn+=.23){
  const {g,calls}=drawing(),p={x:100,y:80,w,h};drawSMFScreen(g,p,turn,1.3,style);
  for(const [method,points]of calls)if(method==='strokePoints'||method==='fillPoints')for(const point of points){
   assert.ok(Number.isFinite(point.x)&&Number.isFinite(point.y));
   assert.ok(point.x>=p.x&&point.x<=p.x+w&&point.y>=p.y&&point.y<=p.y+h);
  }
  assert.ok(calls.length<65,'bounded drawing work per screen');
 }
});
test('screen patterns are deterministic, distinct and respond to musical motion',()=>{
 const frame=(turn,style)=>{const {g,calls}=drawing();drawSMFScreen(g,{x:0,y:0,width:150,height:75},turn,.8,style);return calls;};
 assert.deepEqual(frame(0,'liquid'),frame(0,'liquid'));
 assert.notDeepEqual(frame(0,'liquid'),frame(1,'liquid'));
 assert.notDeepEqual(frame(1,'liquid'),frame(1,'tunnel'));
});
