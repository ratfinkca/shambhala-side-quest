import test from 'node:test';
import assert from 'node:assert/strict';
import {
  PRISM, PRISM_FLOOR, PRISM_RAMP, PRISM_ZONES,
  clampPrismPoint, createPrismPractice, pointInPrismFloor, prismZoneAt,
} from '../src/prism-practice/model.js';

const near = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-6, `${actual} != ${expected}`);
const entered = () => {
  const practice = createPrismPractice();
  practice.start();
  assert.deepEqual(practice.step({previous:{x:480,y:500},player:{x:480,y:498},deltaMs:20}),[{type:'entered'}]);
  return practice;
};
function advance(practice, milliseconds, zone = null) {
  const events = [];
  let remaining = milliseconds;
  let direction = 1;
  while (remaining > 0) {
    const deltaMs = Math.min(50,remaining);
    const center = zone === null ? {x:480,y:475} : PRISM_ZONES[zone].center;
    const previous = {...center};
    const player = zone === null ? previous : {x:center.x + direction * deltaMs / 25,y:center.y};
    events.push(...practice.step({previous,player,deltaMs}));
    remaining -= deltaMs;
    direction *= -1;
  }
  return events;
}

test('the three accessible, named faces partition the pyramid floor', () => {
  assert.equal(PRISM.bpm,120);
  assert.equal(PRISM.phraseMs,8000);
  assert.equal(PRISM_FLOOR.length,3);
  assert.equal(PRISM_RAMP.minX,430);
  assert.deepEqual(PRISM_ZONES.map(zone=>zone.shape),['diamond','star','sun']);
  PRISM_ZONES.forEach((zone,index)=>assert.equal(prismZoneAt(zone.center),index));
  assert.equal(pointInPrismFloor({x:480,y:240}),true);
  assert.equal(pointInPrismFloor({x:480,y:499}),true);
  assert.equal(prismZoneAt(PRISM.spawn),-1);
  assert.equal(pointInPrismFloor({x:200,y:260}),false);
  assert.equal(prismZoneAt({x:NaN,y:300}),-1);
});

test('movement enters through the ramp and cannot teleport across the outside gap', () => {
  assert.deepEqual(clampPrismPoint({x:480,y:450},PRISM.spawn),{x:480,y:450});
  assert.deepEqual(clampPrismPoint({x:200,y:450},{x:200,y:590}),{x:200,y:540});
  const clipped = clampPrismPoint({x:900,y:350},{x:480,y:350});
  assert.equal(pointInPrismFloor(clipped),true);
  assert.ok(clipped.x < 700);
  assert.deepEqual(clampPrismPoint({x:NaN,y:1},PRISM.spawn),PRISM.spawn);
  assert.deepEqual(clampPrismPoint({x:480,y:590}),PRISM.spawn);
});

test('only crossing the ramp threshold starts the party, at the actual crossing time', () => {
  const practice = createPrismPractice();
  assert.equal(practice.status,'ready');
  practice.start();
  assert.deepEqual(practice.step({previous:{x:200,y:590},player:{x:200,y:480},deltaMs:50}),[]);
  assert.equal(practice.state.phase,'approach');
  assert.deepEqual(practice.step({previous:{x:480,y:501},player:{x:480,y:497},deltaMs:40}),[{type:'entered'}]);
  assert.equal(practice.state.entered,true);
  assert.equal(practice.state.phase,'party');
  near(practice.state.partyMs,10);
  near(practice.state.elapsedMs,90);
});

test('only moving in the currently cued face charges it; partial charge is retained', () => {
  const practice = entered();
  advance(practice,1000);
  advance(practice,1000,1);
  assert.deepEqual(practice.state.charges,[0,0,0]);
  advance(practice,1000,0);
  near(practice.state.charges[0],1000);
  const events = advance(practice,5000);
  assert.deepEqual(events,[{type:'phrase',zone:1}]);
  assert.equal(practice.state.activeZone,1);
  near(practice.state.charges[0],1000);
  advance(practice,8000);
  assert.equal(practice.state.activeZone,2);
  advance(practice,8000);
  assert.equal(practice.state.activeZone,0);
  advance(practice,2000,0);
  assert.equal(practice.state.progress,1);
  near(practice.state.charges[0],PRISM.chargeMs);
});

test('collision pushes do not charge when driven speed is supplied, while steering still does', () => {
  const practice=createPrismPractice();
  practice.start();
  assert.deepEqual(practice.step({previous:{x:480,y:500},player:{x:480,y:498},deltaMs:20,drivenSpeed:0}),[{type:'entered'}]);
  const previous={...PRISM_ZONES[0].center},player={x:previous.x+2,y:previous.y};
  for(const drivenSpeed of [0,8,-1,NaN,Infinity]) {
    practice.step({previous,player,deltaMs:50,drivenSpeed});
  }
  near(practice.state.charges[0],0);
  practice.step({previous,player,deltaMs:50,drivenSpeed:40});
  near(practice.state.charges[0],50);
  practice.step({previous,player:previous,deltaMs:50,drivenSpeed:40});
  near(practice.state.charges[0],50);
});

test('completed faces wait for the phrase and are skipped on later cues', () => {
  const practice = entered();
  assert.deepEqual(advance(practice,3000,0),[{type:'charged',zone:0}]);
  assert.equal(practice.state.activeZone,0);
  advance(practice,5000,0);
  assert.equal(practice.state.activeZone,1);
  advance(practice,8000);
  assert.equal(practice.state.activeZone,2);
  assert.deepEqual(advance(practice,8000),[{type:'phrase',zone:1}]);
  assert.equal(practice.state.phraseIndex,3);
});

test('pause freezes charge, clock and finale; finishing gives a full celebration', () => {
  const practice = entered();
  advance(practice,3000,0);
  practice.pause();
  const paused = structuredClone(practice.state);
  advance(practice,1000,0);
  assert.deepEqual(practice.state,paused);
  practice.resume();
  advance(practice,5000);
  advance(practice,3000,1);
  advance(practice,5000);
  assert.deepEqual(advance(practice,3000,2),[{type:'charged',zone:2},{type:'finale'}]);
  assert.equal(practice.state.phase,'celebrating');
  assert.equal(practice.state.complete,false);
  assert.equal(practice.state.activeZone,-1);
  advance(practice,2000);
  practice.pause();
  advance(practice,5000);
  near(practice.state.celebrationMs,2000);
  practice.resume();
  assert.deepEqual(advance(practice,1500),[{type:'complete'}]);
  assert.equal(practice.status,'complete');
  assert.equal(practice.state.complete,true);
  assert.equal(practice.state.phase,'complete');
  near(practice.state.partyMs,19000);
  const finished = structuredClone(practice.state);
  advance(practice,1000);
  assert.deepEqual(practice.state,finished);
});

test('charge integrates zone crossings and phrase changes independently of frame subdivision', () => {
  const whole = entered(), split = entered();
  whole.step({previous:{x:479,y:350},player:{x:481,y:350},deltaMs:50});
  split.step({previous:{x:479,y:350},player:{x:480,y:350},deltaMs:25});
  split.step({previous:{x:480,y:350},player:{x:481,y:350},deltaMs:25});
  near(whole.state.charges[0],25);
  near(split.state.charges[0],whole.state.charges[0]);
  advance(whole,7925);advance(split,7925);
  whole.step({previous:{x:479,y:350},player:{x:481,y:350},deltaMs:50});
  split.step({previous:{x:479,y:350},player:{x:480,y:350},deltaMs:25});
  split.step({previous:{x:480,y:350},player:{x:481,y:350},deltaMs:25});
  assert.deepEqual(split.state,whole.state);
  near(whole.state.charges[0],50);
  near(whole.state.charges[1],25);
});

test('idle players never fail, invalid deltas do not advance, and resumed long frames are capped', () => {
  const practice = entered();
  advance(practice,90000);
  assert.equal(practice.state.phase,'party');
  assert.equal(practice.state.progress,0);
  const elapsed = practice.state.elapsedMs;
  for (const deltaMs of [NaN,Infinity,-1,0]) practice.step({previous:PRISM_ZONES[0].center,player:PRISM_ZONES[0].center,deltaMs});
  near(practice.state.elapsedMs,elapsed);
  practice.step({previous:PRISM_ZONES[0].center,player:PRISM_ZONES[0].center,deltaMs:10000});
  near(practice.state.elapsedMs,elapsed+50);
  practice.reset();
  assert.equal(practice.status,'ready');
  assert.equal(practice.state.phase,'approach');
  assert.deepEqual(practice.state.charges,[0,0,0]);
});

test('Prism checkpoints keep partial charges and clocks but resume only after explicit input', () => {
  const practice=entered();advance(practice,1375,0);advance(practice,7000);
  assert.equal(typeof practice.capture,'function');
  const checkpoint=practice.capture(),restored=createPrismPractice();
  assert.equal(restored.restore(JSON.parse(JSON.stringify(checkpoint))),true);
  assert.equal(restored.status,'paused');assert.deepEqual(restored.state,practice.state);
  advance(restored,1000,1);assert.deepEqual(restored.state,practice.state);
  restored.resume();advance(restored,1250,1);advance(practice,1250,1);
  assert.deepEqual(restored.capture(),practice.capture());
  checkpoint.state.charges[0]=3000;assert.equal(practice.state.charges[0],1375);
});

test('Prism reload during the finale preserves the remaining celebration and terminal result', () => {
  const practice=entered();advance(practice,3000,0);advance(practice,5000);
  advance(practice,3000,1);advance(practice,5000);advance(practice,3000,2);advance(practice,1234);
  assert.equal(typeof practice.capture,'function');
  const restored=createPrismPractice();assert.equal(restored.restore(practice.capture()),true);
  assert.equal(restored.state.phase,'celebrating');assert.equal(restored.state.celebrationMs,1234);
  assert.equal(restored.state.complete,false);restored.resume();
  assert.deepEqual(advance(restored,2266),[{type:'complete'}]);assert.equal(restored.status,'complete');
  const complete=createPrismPractice();assert.equal(complete.restore(restored.capture()),true);
  complete.finish();complete.resume();assert.equal(complete.status,'complete');
  assert.equal(complete.state.complete,true);
});

test('leaving a Prism visit keeps an unfinished terminal checkpoint without awarding completion', () => {
  for(const make of [createPrismPractice,entered]){
    const practice=make();if(practice.status==='ready')practice.start();
    assert.equal(typeof practice.finish,'function');practice.finish();
    const restored=createPrismPractice();assert.equal(restored.restore(practice.capture()),true);
    assert.equal(restored.status,'ended');assert.equal(restored.state.complete,false);
    restored.resume();assert.equal(restored.status,'ended');
  }
  const ready=createPrismPractice(),restored=createPrismPractice();
  assert.equal(restored.restore(ready.capture()),true);assert.equal(restored.status,'ready');
});

test('Prism recovery rejects forged progress, clocks, phases and non-JSON shape without mutating the activity', () => {
  const practice=entered();advance(practice,1375,0);
  assert.equal(typeof practice.capture,'function');const base=practice.capture();
  const changes=[
    s=>s.version=2,s=>s.kind='putting',s=>s.status='complete',s=>s.extra=true,
    s=>s.state.extra=true,s=>delete s.state.entered,s=>s.state.entered=false,
    s=>s.state.goal=4,s=>s.state.progress=1,s=>s.state.activeZone=2,
    s=>s.state.phase='complete',s=>s.state.complete=true,s=>s.state.celebrationMs=1,
    s=>s.state.charges=[0,0],s=>s.state.charges[0]=-1,s=>s.state.charges[0]=3001,
    s=>s.state.charges[0]=NaN,s=>s.state.charges[1]=1,
    s=>{delete s.state.charges[2];s.state.charges.extra=0;},
    s=>s.state.partyMs=Infinity,s=>s.state.elapsedMs=1,s=>s.state.phraseIndex=1,
    s=>s.state.phraseIndex=.5,s=>s.state.elapsedMs=Number.MAX_SAFE_INTEGER,
  ];
  for(const change of changes){const invalid=structuredClone(base);change(invalid);assert.equal(practice.restore(invalid),false);assert.deepEqual(practice.capture(),base);}
  for(const invalid of [null,[],{},Object.create(base)])assert.equal(practice.restore(invalid),false);
  const ready=createPrismPractice().capture();ready.state.elapsedMs=1;assert.equal(practice.restore(ready),false);
  const early=structuredClone(base);Object.assign(early.state,{phase:'celebrating',progress:3,charges:[3000,3000,3000],activeZone:-1});
  assert.equal(practice.restore(early),false);
  const thirdCue=entered();advance(thirdCue,3000,0);advance(thirdCue,13500);
  const wrongCue=thirdCue.capture();wrongCue.state.activeZone=0;
  assert.equal(practice.restore(wrongCue),false);
});

test('valid Prism checkpoints accept JSON key order and a finale beginning exactly at a cue boundary', () => {
  const ready=createPrismPractice().capture(),restored=createPrismPractice();
  ready.state=Object.fromEntries(Object.entries(ready.state).reverse());
  assert.equal(restored.restore(ready),true);assert.equal(restored.status,'ready');
  const practice=entered();advance(practice,3000,0);advance(practice,5000);
  advance(practice,3000,1);advance(practice,10000);advance(practice,3000,2);
  assert.equal(practice.state.partyMs,24000);assert.equal(practice.state.phase,'celebrating');
  assert.equal(restored.restore(practice.capture()),true);restored.resume();
  assert.deepEqual(advance(restored,3500),[{type:'complete'}]);
});
