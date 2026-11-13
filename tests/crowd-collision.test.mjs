import test from 'node:test';
import assert from 'node:assert/strict';
import {createCrowdCollisionFrame} from '../src/crowd-collision.js';
import {crowdPosition} from '../src/festival.js';
import {isOpen} from '../src/geometry.js';

const close=(actual,expected,tolerance=.03)=>assert.ok(Math.abs(actual-expected)<=tolerance,`${actual} should be near ${expected}`);
function setup({anchors=[[200,200]],speed=0,startMs=0,endMs=50,radius=22,radii,obstacles=[],playBounds}={}){
 const stage={crowdAnchors:anchors,crowdSpeed:speed,obstacles,playBounds};
 const people=anchors.map((_,index)=>({id:`dancer-${index}`,node:crowdPosition(index,startMs,anchors,speed)}));
 return {stage,people,frame:createCrowdCollisionFrame({people,stage,startMs,endMs,radius,radii})};
}
const step=(frame,p,d={x:1,y:0},speed=300,more={})=>frame.resolveStep(p,d,50,{speed,progressStart:0,progressEnd:1,...more});

test('a fast crossing hits the dancer and records only movement to contact',()=>{
 const {frame}=setup(),p={x:100,y:200};
 const result=step(frame,p,{x:1,y:0},4000);
 close(p.x,178);close(p.y,200);
 close(result.drivenDistance,78);
 const hit=frame.measurement(0);
 assert.equal(hit.contactRadius,22);assert.equal(hit.physicalContact,true);
 close(hit.nearest,22);close(hit.travel,78);
});

test('a glancing approach slides without entering the body',()=>{
 const {frame}=setup(),p={x:150,y:185};
 const result=step(frame,p,{x:1,y:0},1600);
 assert.ok(p.x>205,JSON.stringify(p));assert.ok(p.y<180,JSON.stringify(p));
 assert.ok(Math.hypot(p.x-200,p.y-200)>=22-.01);
 assert.equal(frame.measurement(0).physicalContact,true);
 assert.ok(result.drivenDistance<80&&result.drivenDistance>50);
});

test('an idle player is moved by the authored crowd without earning travel',()=>{
 const {frame,stage}=setup({speed:1,endMs:250}),p={x:224,y:200};
 const result=step(frame,p,{x:0,y:0},0);
 const dancer=crowdPosition(0,250,stage.crowdAnchors,1);
 assert.ok(p.x>225,JSON.stringify(p));
 assert.ok(Math.hypot(p.x-dancer.x,p.y-dancer.y)>=22-.03);
 assert.equal(result.drivenDistance,0);assert.equal(frame.measurement(0).travel,0);
 assert.equal(frame.measurement(0).physicalContact,true);
});

test('moving crowd cannot push a player through a speaker',()=>{
 const obstacles=[{x:250,y:120,width:50,height:160}];
 const {frame}=setup({anchors:[[208,200]],speed:1,endMs:250,obstacles}),p={x:232,y:200};
 step(frame,p,{x:0,y:0},0,{obstacles});
 assert.ok(isOpen(p,14,obstacles));assert.ok(p.x<=236+.001);
 assert.equal(frame.measurement(0).physicalContact,true);
 assert.equal(frame.measurement(0).travel,0);
});

test('continuous scenery sweeps slide along speakers and retain arena bounds',()=>{
 const obstacles=[{x:250,y:100,width:10,height:250}],playBounds={minX:100,minY:100,maxX:500,maxY:500};
 const {frame}=setup({anchors:[],obstacles,playBounds}),p={x:200,y:200};
 step(frame,p,{x:1,y:1},5000,{obstacles,playBounds});
 assert.ok(isOpen(p,14,obstacles));assert.ok(p.x<=236+.001);assert.ok(p.y>300);
 step(frame,p,{x:-1,y:-1},100000,{obstacles,playBounds});
 assert.ok(p.x>=114&&p.y>=114);assert.ok(p.x<=486&&p.y<=486);
});

test('whole-frame measurements use the travelled pieces rather than their chord',()=>{
 const {frame}=setup(),p={x:160,y:175};
 frame.resolveStep(p,{x:1,y:0},25,{speed:3200,progressStart:0,progressEnd:.5});
 frame.resolveStep(p,{x:0,y:1},25,{speed:2000,progressStart:.5,progressEnd:1});
 const hit=frame.measurement(0);
 assert.equal(hit.physicalContact,false);close(hit.nearest,25);close(hit.travel,130);
});

test('initial overlap separates safely and remains physical contact',()=>{
 const {frame}=setup(),p={x:200,y:200};
 const result=step(frame,p,{x:0,y:0},0);
 assert.ok(Math.hypot(p.x-200,p.y-200)>=22-.01);
 assert.equal(frame.measurement(0).physicalContact,true);assert.equal(result.drivenDistance,0);
});

test('normalized slice progress follows the whole crowd interval',()=>{
 const one=setup({speed:1,endMs:250}),many=setup({speed:1,endMs:250});
 const p={x:224,y:200},q={...p};
 step(one.frame,p,{x:0,y:0},0);
 for(let i=0;i<10;i++)many.frame.resolveStep(q,{x:0,y:0},5,{speed:0,progressStart:i/10,progressEnd:(i+1)/10});
 close(p.x,q.x,.1);close(p.y,q.y,.1);
 assert.equal(many.frame.measurement(0).physicalContact,true);
 assert.equal(many.frame.measurement(0).travel,0);
});

test('a narrow gap between two dancers stops the player without crossing either body',()=>{
 const anchors=[[200,185],[200-15*Math.sin(1.8),215-12*Math.sin(2.1)]];
 const {frame}=setup({anchors}),p={x:150,y:200};
 step(frame,p,{x:1,y:0},2000);
 assert.ok(p.x<200,JSON.stringify(p));
 for(const dancer of [{x:200,y:185},{x:200,y:215}])assert.ok(Math.hypot(p.x-dancer.x,p.y-dancer.y)>=22-.01,JSON.stringify(p));
 assert.equal(frame.measurement(0).physicalContact,true);
 assert.equal(frame.measurement(1).physicalContact,true);
});

test('resting touch remains one contact and retreat really leaves contact',()=>{
 const p={x:178,y:200};
 const resting=setup().frame;
 step(resting,p,{x:0,y:0},0);
 assert.equal(resting.measurement(0).physicalContact,true);
 const retreat=setup().frame;
 step(retreat,p,{x:-1,y:0},300);
 close(p.x,163);
 // This frame begins touching. The following idle frame is fully clear.
 assert.equal(retreat.measurement(0).physicalContact,true);
 const clear=setup().frame;
 step(clear,p,{x:0,y:0},0);
 assert.equal(clear.measurement(0).physicalContact,false);
});

test('smaller body spacing leaves more room while keeping clean near-pass measurements',()=>{
 for(const radius of [20,22,28,32]){
  const {frame}=setup({radius}),p={x:150,y:200};
  step(frame,p,{x:1,y:0},2000);
  close(p.x,200-radius);
  assert.equal(frame.measurement(0).physicalContact,true);
 }
 const {frame}=setup({radius:20}),p={x:150,y:225};
 step(frame,p,{x:1,y:0},2000);
 close(p.x,250);close(frame.measurement(0).nearest,25);
 assert.equal(frame.measurement(0).physicalContact,false);
});

test('mixed dancer radii set each actual blocking distance independently',()=>{
 const anchors=[[200,140],[200-15*Math.sin(1.8),260-12*Math.sin(2.1)]];
 for(const [index,y,expectedX] of [[0,140,192],[1,260,165]]){
  const {frame}=setup({anchors,radii:[8,35]}),p={x:100,y};
  step(frame,p,{x:1,y:0},4000);
  close(p.x,expectedX);close(p.y,y);
  assert.equal(frame.measurement(index).physicalContact,true);
  assert.equal(frame.measurement(0).contactRadius,8);
  assert.equal(frame.measurement(1).contactRadius,35);
 }
});

test('zero radius permits an exact centre crossing while measuring smooth-pass travel',()=>{
 const {frame}=setup({radii:[0]}),p={x:150,y:200};
 const result=step(frame,p,{x:1,y:0},2000);
 close(p.x,250);close(p.y,200);close(result.drivenDistance,100);
 const measurement=frame.measurement(0);
 assert.equal(measurement.contactRadius,0);assert.equal(measurement.physicalContact,false);
 close(measurement.nearest,0);close(measurement.travel,100);
});

test('zero radius never separates or pushes an idle player at a moving dancer centre',()=>{
 const {frame}=setup({radii:[0],speed:1,endMs:250}),p={x:200,y:200};
 const result=step(frame,p,{x:0,y:0},0);
 assert.deepEqual(p,{x:200,y:200});assert.equal(result.drivenDistance,0);
 assert.equal(frame.measurement(0).physicalContact,false);
 assert.equal(frame.measurement(0).nearest,0);assert.equal(frame.measurement(0).travel,0);
});

test('a zero-radius dancer does not disable a blocking neighbour',()=>{
 const anchors=[[180,200],[250-15*Math.sin(1.8),200-12*Math.sin(2.1)]];
 const {frame}=setup({anchors,radii:[0,25]}),p={x:100,y:200};
 step(frame,p,{x:1,y:0},4000);
 close(p.x,225);
 assert.equal(frame.measurement(0).physicalContact,false);close(frame.measurement(0).nearest,0);
 assert.equal(frame.measurement(1).physicalContact,true);close(frame.measurement(1).nearest,25);
});

test('overlapping authored dancers retain their positions and independent collision sizes',()=>{
 const anchors=[[200,200],[200-15*Math.sin(1.8),200-12*Math.sin(2.1)]];
 const {frame,people,stage}=setup({anchors,radii:[0,30]});
 const before=structuredClone({people,anchors});
 for(const person of people){Object.freeze(person.node);Object.freeze(person);}
 for(const anchor of anchors)Object.freeze(anchor);
 Object.freeze(anchors);Object.freeze(people);Object.freeze(stage);
 const p={x:100,y:200};step(frame,p,{x:1,y:0},4000);
 close(p.x,170);
 assert.equal(frame.measurement(0).physicalContact,false);
 assert.equal(frame.measurement(1).physicalContact,true);
 assert.deepEqual({people,anchors},before);
});

test('friendship radius updates take effect next frame rather than midway through a frame',()=>{
 const radii=[30],{frame,stage,people}=setup({radii}),p={x:100,y:200};
 frame.resolveStep(p,{x:1,y:0},25,{speed:1600,progressStart:0,progressEnd:.5});
 close(p.x,140);
 radii[0]=0;
 frame.resolveStep(p,{x:1,y:0},25,{speed:4000,progressStart:.5,progressEnd:1});
 close(p.x,170);assert.equal(frame.measurement(0).contactRadius,30);
 const next=createCrowdCollisionFrame({people,stage,startMs:50,endMs:100,radii});
 step(next,p,{x:1,y:0},2000);
 close(p.x,270);assert.equal(next.measurement(0).contactRadius,0);
 assert.equal(next.measurement(0).physicalContact,false);close(next.measurement(0).nearest,0);
});

test('invalid per-dancer sizes fall back to the legacy scalar and large valid sizes stay bounded',()=>{
 for(const [radius,radii,expected] of [[28,[NaN],28],[28,[-1],28],[28,[Infinity],28],[28,['0'],28],[28,[],28],[100,[null],32],[0,[undefined],20],[undefined,undefined,22],[28,[100],40],[28,[.5],.5]]){
  const {frame}=setup({radius,radii}),p={x:100,y:200};
  step(frame,p,{x:1,y:0},4000);
  close(p.x,200-expected);assert.equal(frame.measurement(0).contactRadius,expected);
 }
});
