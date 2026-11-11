import test from 'node:test';
import assert from 'node:assert/strict';
import {PUTTING_HOLES,PUTTING_PHYSICS,MAX_STROKES,createPuttingPractice,isOnPuttingGreen,isPuttingCloseUp} from '../src/bonus-practice/putting-state.js';

const enter=p=>p.step({player:PUTTING_HOLES[p.state.holeIndex].center});
const fresh=()=>{const p=createPuttingPractice();p.start();enter(p);return p;};
function roll(p,frame=1000/60){
 let event=null;
 for(let i=0;i<1500&&p.state.phase==='rolling';i++){const e=p.advance(frame);if(e)event=e;}
 assert.notEqual(p.state.phase,'rolling','a shot must finish in bounded time');return event;
}
const towardCup=p=>{
 const cup=PUTTING_HOLES[p.state.holeIndex].cup,dx=cup.x-p.state.ball.x,dy=cup.y-p.state.ball.y,d=Math.hypot(dx,dy);
 // A plausible player shot stopping at the cup; no state mutation or test-only hooks.
 const power=Math.sqrt(2*PUTTING_PHYSICS.friction*d)/PUTTING_PHYSICS.maxSpeed;
 return {x:dx/d*power,y:dy/d*power};
};
function miss(p){assert.equal(p.shoot({x:-.04,y:0})?.type,'shot');return roll(p);}

test('putting geometry stays on the two accepted painted greens',()=>{
 assert.equal(MAX_STROKES,8);assert.equal(PUTTING_HOLES.length,2);
 assert.deepEqual(PUTTING_HOLES.map(h=>h.cup),[{x:225,y:359},{x:732,y:486}]);
 for(const h of PUTTING_HOLES)for(const p of [h.cup,h.tee])assert.ok(((p.x-h.center.x)/h.radiusX)**2+((p.y-h.center.y)/h.radiusY)**2<1);
});

test('a visit explores the whole venue until walking onto the current green',()=>{
 const p=createPuttingPractice();p.start();
 assert.equal(p.state.phase,'walking');assert.equal(isPuttingCloseUp(p.state),false);
 assert.equal(p.shoot({x:.5,y:0}),null);
 assert.equal(p.step({player:{x:480,y:590}}),null);
 assert.equal(p.step({player:PUTTING_HOLES[1].center}),null,'second green cannot skip the first');
 p.pause();assert.equal(enter(p),null);p.resume();
 assert.equal(enter(p).type,'green-entered');assert.equal(isPuttingCloseUp(p.state),true);
 assert.equal(enter(p),null,'one entry event per green');
 p.shoot(towardCup(p));assert.equal(roll(p).type,'holed');
 assert.equal(isPuttingCloseUp(p.state),false,'the whole party returns after the cup');
 assert.equal(p.nextHole(),true);assert.equal(p.state.phase,'walking');
 assert.equal(p.shoot(towardCup(p)),null);
 assert.equal(p.step({player:PUTTING_HOLES[0].center}),null);
 assert.equal(enter(p).id,'green-2');assert.equal(isPuttingCloseUp(p.state),true);
});

test('green entry uses the painted ellipse rather than its bounding rectangle',()=>{
 const h=PUTTING_HOLES[0];
 assert.equal(isOnPuttingGreen(h.center,0),true);
 assert.equal(isOnPuttingGreen({x:h.center.x+h.radiusX*.95,y:h.center.y+h.radiusY*.95},0),false);
 for(const player of [null,{}, {x:NaN,y:h.center.y},{x:Infinity,y:h.center.y}])assert.equal(isOnPuttingGreen(player,0),false);
 assert.equal(isOnPuttingGreen(h.center,99),false);
});

test('walking checkpoints and legacy mid-green saves resume in their original view',()=>{
 const p=createPuttingPractice();p.start();p.advance(150);
 const q=createPuttingPractice();assert.equal(q.restore(p.capture()),true);assert.equal(q.status,'paused');assert.equal(q.state.phase,'walking');
 q.resume();assert.equal(enter(q).type,'green-entered');q.shoot(towardCup(q));q.advance(125);
 const legacy=q.capture(),restored=createPuttingPractice();assert.equal(legacy.version,1);
 assert.equal(restored.restore(legacy),true);assert.equal(restored.state.phase,'rolling');assert.equal(isPuttingCloseUp(restored.state),true);
 restored.resume();assert.equal(roll(restored).type,'holed');restored.nextHole();
 const walkAgain=createPuttingPractice();assert.equal(walkAgain.restore(restored.capture()),true);assert.equal(walkAgain.state.phase,'walking');assert.equal(walkAgain.state.holeIndex,1);
 const oldReady=createPuttingPractice().capture();oldReady.state.phase='aim';
 assert.equal(createPuttingPractice().restore(oldReady),true);
});

test('real shots sink both cups and award one Golden Chicken Totem',()=>{
 const p=fresh();assert.equal(p.shoot(towardCup(p)).type,'shot');assert.equal(roll(p).type,'holed');
 assert.equal(p.state.progress,1);assert.equal(p.state.phase,'between');assert.equal(p.status,'playing');
 assert.equal(p.nextHole(),true);assert.equal(p.state.holeIndex,1);enter(p);
 assert.equal(p.shoot(towardCup(p)).type,'shot');const win=roll(p);
 assert.equal(win.type,'complete');assert.equal(win.reward,'Golden Chicken Totem');assert.equal(p.state.progress,2);assert.equal(p.state.complete,true);assert.equal(p.status,'complete');
 assert.equal(p.advance(1000),null);assert.equal(p.shoot({x:1,y:0}),null);assert.equal(p.nextHole(),false);
});

test('a fast pass through the cup stays rolling and rebounds from the rim',()=>{
 const p=fresh(),h=PUTTING_HOLES[0],dx=h.cup.x-h.tee.x,dy=h.cup.y-h.tee.y,d=Math.hypot(dx,dy);
 p.shoot({x:dx/d,y:dy/d});p.advance(420);
 assert.equal(p.state.progress,0);assert.equal(p.state.phase,'rolling');assert.ok(p.state.ball.x>h.cup.x);
 let reflected=false;
 for(let i=0;i<240&&p.state.phase==='rolling';i++){
  p.advance(1000/120);const b=p.state.ball;
  assert.ok(((b.x-h.center.x)/(h.radiusX-PUTTING_PHYSICS.ballRadius))**2+((b.y-h.center.y)/(h.radiusY-PUTTING_PHYSICS.ballRadius))**2<=1.000001);
  if(b.vx<0)reflected=true;
 }
 assert.ok(reflected,'outward velocity reflects at the ellipse rim');
});

test('the eighth shot finishes before failure, with no ninth shot',()=>{
 const p=fresh();for(let i=0;i<7;i++)assert.equal(miss(p).type,'settled');
 assert.equal(p.state.strokes,7);assert.equal(p.shoot({x:-.04,y:0}).type,'shot');assert.equal(p.state.strokes,8);
 assert.equal(p.status,'playing');assert.equal(p.state.phase,'rolling');
 assert.equal(roll(p).type,'exhausted');assert.equal(p.status,'ended');assert.equal(p.state.phase,'lost');assert.equal(p.state.complete,false);
 assert.equal(p.shoot({x:1,y:0}),null);
});

test('sinking the second hole on stroke eight wins instead of exhausting',()=>{
 const p=fresh();for(let i=0;i<6;i++)miss(p);
 p.shoot(towardCup(p));assert.equal(roll(p).type,'holed');assert.equal(p.nextHole(),true);enter(p);
 p.shoot(towardCup(p));assert.equal(p.state.strokes,8);assert.equal(roll(p).type,'complete');assert.equal(p.state.complete,true);
});

test('ready, moving, between, paused and ended phases reject inappropriate actions',()=>{
 const p=createPuttingPractice();assert.equal(p.shoot({x:1,y:0}),null);assert.equal(p.nextHole(),false);assert.equal(p.advance(50),null);assert.equal(p.state.elapsedMs,0);
 p.start();enter(p);assert.equal(p.nextHole(),false);p.shoot(towardCup(p));assert.equal(p.shoot({x:1,y:0}),null);assert.equal(p.nextHole(),false);
 assert.equal(roll(p).type,'holed');assert.equal(p.shoot({x:1,y:0}),null);
 p.pause();assert.equal(p.nextHole(),false);p.resume();assert.equal(p.nextHole(),true);
 p.finish();assert.equal(p.status,'ended');assert.equal(p.shoot({x:1,y:0}),null);p.resume();assert.equal(p.status,'ended');
});

test('pause freezes rolling and clock; restart clears shots, holes and prize',()=>{
 const p=fresh();p.shoot(towardCup(p));p.advance(125);p.pause();
 const before=structuredClone(p.state);assert.equal(p.advance(1000),null);assert.deepEqual(p.state,before);assert.equal(p.shoot({x:1,y:0}),null);
 p.resume();assert.equal(roll(p).type,'holed');p.nextHole();enter(p);p.shoot(towardCup(p));roll(p);
 p.start();assert.equal(p.status,'playing');assert.equal(p.state.strokes,0);assert.equal(p.state.progress,0);assert.equal(p.state.complete,false);assert.equal(p.state.elapsedMs,0);assert.equal(p.state.phase,'walking');
 assert.deepEqual(p.state.ball,{...PUTTING_HOLES[0].tee,vx:0,vy:0});
});

test('fixed steps give identical rolling for differently partitioned frames',()=>{
 const a=fresh(),b=fresh();a.shoot({x:.9,y:.2});b.shoot({x:.9,y:.2});
 a.advance(1000);for(let i=0;i<20;i++)b.advance(50);
 assert.deepEqual(a.state,b.state);
 const c=fresh(),d=fresh();c.shoot(towardCup(c));d.shoot(towardCup(d));
 for(let i=0;i<3;i++)c.advance(1000);for(let i=0;i<300;i++)d.advance(10);
 assert.deepEqual(c.state,d.state);
});

test('elapsed time continues between holes but walking and waiting never win',()=>{
 const p=fresh();assert.equal(p.step({player:PUTTING_HOLES[0].cup}),null);p.advance(1000);assert.equal(p.state.progress,0);
 p.shoot(towardCup(p));roll(p);const time=p.state.elapsedMs;p.advance(1000);
 assert.ok(Math.abs(p.state.elapsedMs-time-1000)<.00001);assert.equal(p.state.progress,1);assert.equal(p.state.complete,false);
});

test('invalid shots and deltas are harmless; oversized shot strength is bounded',()=>{
 const p=fresh(),before=structuredClone(p.state);
 for(const v of [null,undefined,{}, {x:NaN,y:0},{x:Infinity,y:0},{x:0,y:0},{x:.001,y:0},{x:'1',y:0}])assert.equal(p.shoot(v),null);
 for(const dt of [NaN,Infinity,-1,undefined,'16'])assert.equal(p.advance(dt),null);
 assert.deepEqual(p.state,before);
 assert.equal(p.shoot({x:100,y:0}).type,'shot');assert.ok(Math.hypot(p.state.ball.vx,p.state.ball.vy)<=PUTTING_PHYSICS.maxSpeed);
 p.advance(1e10);assert.ok(p.state.elapsedMs<=PUTTING_PHYSICS.maxFrameMs);
});
