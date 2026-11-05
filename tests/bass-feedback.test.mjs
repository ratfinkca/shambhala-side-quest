import test from 'node:test';
import assert from 'node:assert/strict';
import {drawSpeakerBass,drawPlayerBass} from '../src/bass-feedback.js';
import {bassPreviewConfig} from '../src/rehearsal.js';
import {isOpen,bassFactor} from '../src/geometry.js';
import {STAGES} from '../src/stages.js';
function output(draw,...args){const calls=[];const g=new Proxy({}, {get:(_,key)=>(...values)=>{calls.push([key,...values]);return g;}});draw(g,...args);return calls;}
test('speaker ripples expand from cone origin without added fills and freeze under reduced motion',()=>{
 const a=output(drawSpeakerBass,100,'cruise',false),b=output(drawSpeakerBass,350,'cruise',false);
 assert.ok(a.length>0&&a.length<=8);assert.notDeepEqual(a,b);
 assert.ok(a.every(([method])=>!method.startsWith('fill')));
 for(let t=0;t<5000;t+=51)for(const [method,x,y,r]of output(drawSpeakerBass,t,'drop',false))if(method==='strokeCircle'){assert.equal(x,0);assert.equal(y,0);assert.ok(r>0&&r<=110);}
 assert.deepEqual(output(drawSpeakerBass,0,'drop',true),output(drawSpeakerBass,800,'cruise',true));
});
test('Bass lab scenarios use safe real-stage positions and bounded charge/exposure presets',()=>{
 for(const [id,charge]of [['fresh',0],['quarter',2500],['half',5000],['full',10000],['outside',5000]]){
  const fixture=bassPreviewConfig(id);assert.equal(fixture.chargeMs,charge);assert.equal(fixture.stageIndex,1);assert.ok(isOpen(fixture.position,14,STAGES[1].obstacles));
  assert.equal(bassFactor(fixture.position,STAGES[1].obstacles)<1,id!=='outside');
  assert.ok(fixture.exposureMs>=0&&fixture.exposureMs<=6000);
 }
 assert.equal(bassPreviewConfig('unknown'),null);assert.equal(bassPreviewConfig('constructor'),null);
});
test('pressure builds near player feet while protection has its own stable colour and shape',()=>{
 const base={chargeMs:0,exposureMs:3000,activeMs:0};
 const pressure=output(drawPlayerBass,base,.2,300,false);assert.ok(pressure.length>0&&pressure.length<20);
 assert.notDeepEqual(pressure,output(drawPlayerBass,{...base,exposureMs:6000},.2,300,false));
 assert.deepEqual(output(drawPlayerBass,base,1,300,false),[]);
 const active={...base,activeMs:1500,activeDurationMs:1500};const protectedArt=output(drawPlayerBass,active,.2,300,false);assert.notDeepEqual(protectedArt,pressure);
 assert.deepEqual(output(drawPlayerBass,active,.2,0,true),output(drawPlayerBass,active,.2,800,true));
 assert.deepEqual(output(drawPlayerBass,base,.2,0,true),output(drawPlayerBass,base,.2,800,true));
});
