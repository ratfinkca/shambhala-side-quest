import test from 'node:test';
import assert from 'node:assert/strict';
import {drawMappedPanel,drawCanopyMapping} from '../src/editions/smf-surface-mapping.js';

function drawing(){
 const calls=[];let g;g=new Proxy({}, {get:(_,key)=>(...args)=>{calls.push([key,...args]);return g;}});
 return {g,calls};
}
const quad=[{x:50,y:35},{x:110,y:20},{x:120,y:120},{x:40,y:130}];
function inside(p,polygon){
 let sign=0;
 for(let i=0;i<polygon.length;i++){
  const a=polygon[i],b=polygon[(i+1)%polygon.length],cross=(b.x-a.x)*(p.y-a.y)-(b.y-a.y)*(p.x-a.x);
  if(Math.abs(cross)<1e-7)continue;
  if(sign&&Math.sign(cross)!==sign)return false;
  sign=Math.sign(cross);
 }
 return true;
}
function checkDrawing(calls,panels){
 for(const [method,...args]of calls){
  assert.ok(['fillStyle','lineStyle','fillPoints','strokePoints'].includes(method),'only native graphics drawing, never textures or masks');
  if(method==='fillStyle'||method==='lineStyle')assert.ok(Number.isFinite(args.at(-1))&&args.at(-1)>=0&&args.at(-1)<=1,'bounded opacity');
  else for(const point of args[0]){
   assert.ok(Number.isFinite(point.x)&&Number.isFinite(point.y));
   assert.ok(panels.some(panel=>inside(point,panel)),'all vertices stay on measured architecture');
  }
 }
}
test('moving surface geometry remains on skewed measured panels throughout colour and movement cycles',()=>{
 for(const style of ['timber','facade','canopy'])for(let turn=-4;turn<Math.PI*8;turn+=.19){
  const {g,calls}=drawing();drawMappedPanel(g,quad,turn,1.35,2,style);
  checkDrawing(calls,[quad]);assert.ok(calls.length<45,'bounded commands per panel');
 }
});
test('canopy colours and inner facets move without changing the fixed outer cloth panels',()=>{
 const flower=[{x:50,y:55},{x:86,y:31},{x:120,y:55},{x:86,y:70}];
 const surface={petals:[flower],diamonds:[quad]};
 const frame=turn=>{const {g,calls}=drawing();drawCanopyMapping(g,surface,turn,1);return calls;};
 assert.deepEqual(frame(0),frame(0),'fixed turn is a stable reduced-motion pose');
 assert.notDeepEqual(frame(0),frame(1.7),'motion visibly changes geometry and light');
 for(const turn of [0,1.7,Math.PI*4]){
  const calls=frame(turn);checkDrawing(calls,[flower,quad]);
  assert.deepEqual(calls.find(([method])=>method==='fillPoints')[1],flower,'outer canopy remains attached');
 }
});
test('mapping is deterministic, distinct by venue, and handles nonfinite optional timing safely',()=>{
 const frame=(turn,style)=>{const {g,calls}=drawing();drawMappedPanel(g,quad,turn,.8,0,style);return calls;};
 assert.deepEqual(frame(2,'facade'),frame(2,'facade'));
 assert.notDeepEqual(frame(2,'facade'),frame(2,'timber'));
 checkDrawing(frame(NaN,'facade'),[quad]);
 const {g,calls}=drawing();drawMappedPanel(g,[],0,1);assert.equal(calls.length,0);
});
