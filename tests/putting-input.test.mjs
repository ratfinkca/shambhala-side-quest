import test from 'node:test';
import assert from 'node:assert/strict';
import {createPuttingGesture} from '../src/bonus-practice/putting-input.js';
const point=(id,x,y,extra={})=>({id,x,y,...extra});
test('drag opposite the shot gives equal normalized power regardless of starting position',()=>{
 const g=createPuttingGesture();
 g.start(point(1,.5,.3),true);g.move(point(1,.4,.3));
 assert.ok(Math.abs(g.vector.x-.5)<1e-10);assert.equal(g.vector.y,0);
 const first=g.end(point(1,.4,.3),true);assert.ok(Math.abs(first.x-.5)<1e-10);assert.equal(first.y,0);
 g.start(point(2,.8,.5),true);const shot=g.end(point(2,.7,.5),true);
 assert.ok(Math.abs(shot.x-.5)<1e-10);assert.equal(shot.y,0);
});
test('tap, drag-back, outside release and cancelled gesture never shoot',()=>{
 const g=createPuttingGesture();
 for(const release of [point(1,.5,.3),point(1,.495,.3),point(1,.2,.3,{inside:false})]){
  g.start(point(1,.5,.3),true);g.move(point(1,.3,.3));assert.equal(g.end(release,true),null);
 }
 g.start(point(1,.5,.3),true);g.cancel();assert.equal(g.end(point(1,.3,.3),true),null);
});
test('only the active primary pointer can finish, and pause rejects pending release',()=>{
 const g=createPuttingGesture();
 assert.equal(g.start(point(1,.5,.3,{button:2}),true),false);
 assert.equal(g.start(point(2,.5,.3,{primary:false}),true),false);
 assert.equal(g.start(point(1,.5,.3),false),false);
 assert.equal(g.start(point(1,.5,.3),true),true);
 assert.equal(g.start(point(2,.5,.3),true),false);
 assert.equal(g.end(point(2,.1,.3),true),null);
 assert.ok(g.active);assert.equal(g.end(point(1,.1,.3),false),null);assert.equal(g.active,false);
});
test('power is bounded and malformed coordinates cannot create shots',()=>{
 const g=createPuttingGesture();g.start(point(1,.9,.6),true);
 const shot=g.end(point(1,0,0),true);assert.ok(Math.abs(Math.hypot(shot.x,shot.y)-1)<1e-10);
 assert.equal(g.start(point(1,NaN,.3),true),false);
 g.start(point(1,.5,.3),true);assert.equal(g.end(point(1,Infinity,.3),true),null);
});

test('a keyboard shot cancels a held pointer so its later release cannot spend another stroke',async()=>{
 const {createPuttingPractice}=await import('../src/bonus-practice/putting-state.js');
 const {attemptPuttingShot}=await import('../src/bonus-practice/putting-input.js');
 const p=createPuttingPractice(),g=createPuttingGesture();p.start();
 g.start(point(1,.5,.3),true);g.move(point(1,.4,.3));
 assert.equal(attemptPuttingShot(p,{x:.1,y:0},()=>g.cancel()).type,'shot');
 p.advance(1000);assert.equal(p.state.phase,'aim');
 assert.equal(g.end(point(1,.4,.3),true),null);assert.equal(p.state.strokes,1);
});
