import test from 'node:test';
import assert from 'node:assert/strict';
import {createBonusPractice} from '../src/bonus-practice/state.js';
import {getBonusVenue} from '../src/bonus-practice/config.js';
import {createPuttingPractice,PUTTING_HOLES,PUTTING_PHYSICS} from '../src/bonus-practice/putting-state.js';
import {createDeliveryPractice} from '../src/amp-delivery-practice.js';

const copy=value=>JSON.parse(JSON.stringify(value));
const bonus=id=>createBonusPractice(getBonusVenue(id));
const delivery=()=>createDeliveryPractice({recipientIds:['a','b','c'],dancerIds:['a','b','c','other']});
const pickup={atVendor:true,encounters:[]};
const pass=id=>({atVendor:false,encounters:[{id,closePass:true,active:false}]});
const roll=p=>{let event=null;for(let i=0;i<2000&&p.state.phase==='rolling';i++)event=p.advance(1000/120)||event;assert.notEqual(p.state.phase,'rolling');return event;};
const towardCup=p=>{const cup=PUTTING_HOLES[p.state.holeIndex].cup,dx=cup.x-p.state.ball.x,dy=cup.y-p.state.ball.y,d=Math.hypot(dx,dy),power=Math.sqrt(2*PUTTING_PHYSICS.friction*d)/PUTTING_PHYSICS.maxSpeed;return {x:dx/d*power,y:dy/d*power};};

// A missing capture/restore API, shallow snapshots, or immediate active replay
// would fail these checks before any persistence adapter is involved.
test('all activity checkpoints are independent JSON snapshots and restore active visits paused',()=>{
 for(const make of [()=>bonus('rabbit-hole'),()=>bonus('secret-garden'),()=>bonus('ikigai-mori'),createPuttingPractice,delivery]){
  const p=make();assert.equal(typeof p.capture,'function');assert.equal(typeof p.restore,'function');
  p.start();const checkpoint=p.capture(),restored=make();
  assert.equal(restored.restore(copy(checkpoint)),true);assert.equal(restored.status,'paused');assert.deepEqual(restored.state,p.state);
  checkpoint.state.complete=true;assert.equal(p.state.complete,false);assert.equal(restored.state.complete,false);
 }
});

test('trail checkpoint preserves the next trinket and never recollects a visited one',()=>{
 const c=getBonusVenue('rabbit-hole'),p=bonus(c.id);p.start();p.step({player:c.points[0]});p.step({player:c.points[1]});
 const q=bonus(c.id);assert.equal(q.restore(copy(p.capture())),true);assert.equal(q.step({player:c.points[2]}),null);
 q.resume();assert.equal(q.step({player:c.points[1]}),null);assert.equal(q.step({player:c.points[2]}).type,'collected');assert.equal(q.state.progress,3);
});

test('garden held seed survives restoration, plants once, and cannot be picked up again',()=>{
 const c=getBonusVenue('secret-garden'),p=bonus(c.id);p.start();p.step({player:c.points[0]});p.step({player:c.bed});p.step({player:c.points[1]});
 const q=bonus(c.id);assert.equal(q.restore(copy(p.capture())),true);assert.equal(q.state.carrying,c.points[1].id);assert.equal(q.state.progress,1);
 q.resume();assert.equal(q.step({player:c.bed}).type,'planted');assert.equal(q.step({player:c.bed}),null);assert.equal(q.step({player:c.points[1]}),null);assert.equal(q.state.progress,2);
});

test('Ikigai checkpoint keeps greeted dancer identities and rejects repeat credit',()=>{
 const p=bonus('ikigai-mori');p.start();p.step({encounters:[{id:'dancer-1',closePass:true}]});
 const q=bonus('ikigai-mori');assert.equal(q.restore(copy(p.capture())),true);q.resume();assert.equal(q.step({encounters:[{id:'dancer-1',closePass:true}]}),null);assert.equal(q.step({encounters:[{id:'dancer-2',closePass:true}]}).type,'greeted');assert.equal(q.state.progress,2);
});

test('AMP held and dropped sandwiches restore without replenishing or replaying stale passes',()=>{
 const p=delivery();p.start();p.step(pickup);p.step(pass('a'));p.step({atVendor:true,encounters:[{id:'b',active:true}]});
 const held=delivery();assert.equal(held.restore(copy(p.capture())),true);assert.equal(held.state.delivered,1);assert.equal(held.state.carrying,true);
 held.resume();assert.equal(held.step(pass('b')),null);assert.equal(held.state.carrying,true);
 held.step({atVendor:false,encounters:[{id:'other',active:true,bumped:true}]});
 const dropped=delivery();assert.equal(dropped.restore(copy(held.capture())),true);dropped.resume();assert.equal(dropped.state.carrying,false);assert.equal(dropped.state.recipientId,'b');assert.equal(dropped.state.delivered,1);assert.equal(dropped.step(pass('b')),null);
 assert.equal(dropped.step({atVendor:true,encounters:[{id:'b',closePass:true,active:false}]}).type,'pickup');assert.equal(dropped.step(pass('b')),null,'same pass pulse remains consumed across vendor pickup');
 dropped.step({atVendor:false,encounters:[]});assert.equal(dropped.step(pass('b')).type,'delivered');assert.equal(dropped.state.delivered,2);
});

test('AMP restoration while at vendor cannot create a free replacement sandwich',()=>{
 const p=delivery();p.start();p.step(pickup);p.step({atVendor:true,encounters:[{id:'other',bumped:true}]});
 const q=delivery();assert.equal(q.restore(copy(p.capture())),true);q.resume();assert.equal(q.step(pickup),null);assert.equal(q.state.carrying,false);
 q.step({atVendor:false,encounters:[]});assert.equal(q.step(pickup).type,'pickup');
});

test('putting mid-roll preserves fractional time and matches uninterrupted trajectory',()=>{
 const p=createPuttingPractice();p.start();p.shoot({x:.8,y:.12});p.advance(137);
 const q=createPuttingPractice();assert.equal(q.restore(copy(p.capture())),true);const frozen=copy(q.state);assert.equal(q.advance(100),null);assert.deepEqual(q.state,frozen);q.resume();
 for(const dt of [7,17,31,100,233]){assert.deepEqual(q.advance(dt),p.advance(dt));assert.deepEqual(q.state,p.state);}
 assert.deepEqual(q.capture(),p.capture());
});

test('the restored eighth rolling putt can still win and cannot award twice',()=>{
 const p=createPuttingPractice();p.start();for(let i=0;i<6;i++){p.shoot({x:-.04,y:0});roll(p);}
 p.shoot(towardCup(p));roll(p);p.nextHole();p.shoot(towardCup(p));p.advance(137);
 const q=createPuttingPractice();assert.equal(q.restore(copy(p.capture())),true);assert.equal(q.state.strokes,8);q.resume();assert.equal(roll(q).type,'complete');assert.equal(q.state.complete,true);
 const won=createPuttingPractice();assert.equal(won.restore(copy(q.capture())),true);assert.equal(won.status,'complete');won.resume();assert.equal(won.advance(1000),null);assert.equal(won.shoot({x:1,y:0}),null);
});

test('ready, ended and complete activity checkpoints preserve terminal gates',()=>{
 for(const make of [()=>bonus('rabbit-hole'),createPuttingPractice,delivery]){
  const p=make(),q=make();assert.equal(q.restore(copy(p.capture())),true);assert.equal(q.status,'ready');
  p.start();p.finish();assert.equal(q.restore(copy(p.capture())),true);assert.equal(q.status,'ended');q.resume();assert.equal(q.status,'ended');
 }
 const p=bonus('rabbit-hole'),c=getBonusVenue('rabbit-hole');p.start();for(const point of c.points)p.step({player:point});
 const q=bonus(c.id);assert.equal(q.restore(copy(p.capture())),true);assert.equal(q.status,'complete');q.resume();assert.equal(q.step({player:c.points.at(-1)}),null);
 const a=delivery();a.start();for(const id of ['a','b','c']){a.step(pickup);a.step(pass(id));}
 const b=delivery();assert.equal(b.restore(copy(a.capture())),true);assert.equal(b.status,'complete');b.resume();assert.equal(b.step(pickup),null);
});

test('bonus restore rejects incompatible, inconsistent or oversized checkpoints without changing state',()=>{
 const p=bonus('secret-garden');p.start();const base=p.capture();
 const invalid=[null,{},[],{...base,version:999},{...base,venueId:'rabbit-hole'},{...base,status:'complete'},
  {...base,state:{...base.state,goal:999}}, {...base,state:{...base.state,progress:-1}},
  {...base,state:{...base.state,collectedIds:['seed-2'],carrying:'seed-2'}},
  {...base,state:{...base.state,collectedIds:['seed-1','seed-1'],carrying:'seed-1'}},
  {...base,state:{...base.state,visitedIds:Array(1000).fill('seed-1')}},
  {...base,state:{...base.state,greetedIds:['dancer-999']}},
  {...base,state:{...base.state,unexpected:'field'}}];
 for(const checkpoint of invalid){assert.equal(p.restore(checkpoint),false);assert.deepEqual(p.capture(),base);}
 const greet=bonus('ikigai-mori');greet.start();const snapshot=greet.capture();snapshot.state.progress=1;snapshot.state.greetedIds=['dancer-999'];assert.equal(greet.restore(snapshot),false);
});

test('putting restore rejects invalid geometry, velocity, clock and contradictory phases',()=>{
 const p=createPuttingPractice();p.start();const base=p.capture();
 const invalid=[{...base,kind:'bonus'}, {...base,state:{...base.state,holeIndex:2}}, {...base,state:{...base.state,strokes:9}},
  {...base,state:{...base.state,ball:{...base.state.ball,x:9999}}},
  {...base,state:{...base.state,ball:{...base.state.ball,vx:Infinity}}},
  {...base,state:{...base.state,ball:{...base.state.ball,vx:241},phase:'rolling',strokes:1}},
  {...base,state:{...base.state,ball:{...base.state.ball,x:200}}},
  {...base,state:{...base.state,phase:'won',complete:true,progress:2}},
  {...base,state:{...base.state,elapsedMs:NaN}}, {...base,ticks:-1}, {...base,ticks:1},
  {...base,remainderMs:PUTTING_PHYSICS.stepMs}, {...base,remainderMs:-1},
  {...base,state:{...base.state,visitedIds:['green-2']}}];
 for(const snapshot of invalid){assert.equal(p.restore(snapshot),false);assert.deepEqual(p.capture(),base);}
});

test('AMP restore validates recipient order, dancer IDs, counters and finite bounds',()=>{
 const p=delivery();p.start();const base=p.capture();
 const invalid=[{...base,kind:'putting'}, {...base,status:'complete'},
  {...base,state:{...base.state,recipientIds:['c','b','a']}}, {...base,state:{...base.state,recipientId:'other'}},
  {...base,state:{...base.state,delivered:Infinity}}, {...base,state:{...base.state,delivered:4}},
  {...base,state:{...base.state,blockedEncounterIds:['invented']}},
  {...base,state:{...base.state,passEventIds:['a','a']}},
  {...base,state:{...base.state,passEventIds:Array(1000).fill('a')}},
  {...base,state:{...base.state,carrying:'yes'}}];
 for(const snapshot of invalid){assert.equal(p.restore(snapshot),false);assert.deepEqual(p.capture(),base);}
});
