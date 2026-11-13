import test from 'node:test';
import assert from 'node:assert/strict';
import {Crowd} from '../src/Crowd.js';
import {createRound} from '../src/game.js';

function fixture(options={}) {
  // Only drawing is stubbed: Crowd runs the real swept encounters and scoring.
  function node() {
    const target={};
    const proxy=new Proxy(target,{get(t,key){
      if(key in t)return t[key];
      return (...args)=>{
        if(key==='setAlpha')t.alpha=args[0];
        if(key==='setScale')t.scale=args[0];
        return proxy;
      };
    }});
    return proxy;
  }
  const events=[],effects=[];
  const scene={
    add:new Proxy({},{get:()=>node}),
    game:{events:{emit:(...args)=>events.push(args)}},
    effect:(...args)=>effects.push(args),
  };
  const crowd=new Crowd(scene);
  crowd.configure({crowdAnchors:[[300,300],[800,300]],crowdSpeed:0,obstacles:[]});
  const round=createRound(options);
  round.runId='delivery-encounter-test';
  function update(x,y,elapsed=0) {
    round.remainingMs=60000-elapsed;
    return crowd.update({x,y},round,false);
  }
  return {crowd,round,events,effects,update,scene};
}

test('Crowd uses per-dancer collision measurements for contact and shielding',()=>{
  const {scene,round,events,update}=fixture({bumpShields:1});
  scene.crowdEncounterMeasurement=index=>({contactRadius:28,nearest:index===0?28:500,physicalContact:index===0,travel:0});
  for(const elapsed of [0,100]){
    const batch=update(360,340,elapsed);
    assert.equal(batch[0].bumped,true);assert.equal(batch[1].bumped,false);
    assert.equal(batch[0].contactStarted,elapsed===0);
  }
  assert.equal(round.shieldsRemaining,0);assert.equal(round.slowedMs,0);assert.equal(round.closePasses,0);
  assert.deepEqual(events,[['round:contact',{runId:'delivery-encounter-test'}]]);
});

test('encounter batches keep dancer IDs through reset and stage configuration',()=>{
  const {crowd,update}=fixture();
  assert.deepEqual(crowd.people.map(person=>person.id),['dancer-0','dancer-1']);
  const first=update(0,0);
  assert.ok(Array.isArray(first),'update returns the whole encounter batch');
  assert.deepEqual(first.map(hit=>hit.id),['dancer-0','dancer-1']);

  update(300,300,100);
  crowd.reset();
  const afterReset=update(0,0);
  assert.deepEqual(afterReset.map(hit=>[hit.id,hit.active,hit.bumped,hit.closePass]),[
    ['dancer-0',false,false,false],['dancer-1',false,false,false],
  ]);

  crowd.configure({crowdAnchors:[[300,300]],crowdSpeed:0,obstacles:[]});
  assert.deepEqual(update(0,0).map(hit=>hit.id),['dancer-0']);
});

test('physical contact remains in every batch when a shield suppresses bump penalties',()=>{
  const {crowd,round,events,update}=fixture({bumpShields:1});
  const first=update(300,300);
  assert.ok(Array.isArray(first),'physical contacts are returned independently of penalties');
  assert.deepEqual(first[0],{
    id:'dancer-0',bumped:true,closePass:false,active:true,
    contactStarted:true,contactEnded:false,clearance:null,
  });
  const continued=update(300,300,100);
  assert.equal(continued[0].bumped,true);
  assert.equal(continued[0].contactStarted,false);
  assert.equal(continued[0].active,true);
  assert.equal(crowd.people[0].encounter.protected,true);
  assert.equal(round.shieldsRemaining,0);
  assert.equal(round.slowedMs,0);
  assert.deepEqual(events,[['round:contact',{runId:'delivery-encounter-test'}]]);
});

test('physical contacts are not throttled with the existing bump sound event',()=>{
  const {round,events,update}=fixture();
  for(const elapsed of [0,100,200]) {
    const batch=update(300,300,elapsed);
    assert.ok(Array.isArray(batch),'each frame reports physical contacts');
    assert.equal(batch[0].bumped,true);
  }
  assert.equal(round.slowedMs,600);
  assert.equal(events.filter(([name])=>name==='round:bump').length,1);
});

test('a clean pass reports completion and post-update activity without changing score or feedback',()=>{
  const {crowd,round,events,effects,update}=fixture();
  const batches=[240,280,320,360].map((x,index)=>update(x,330,index*100));
  assert.ok(batches.every(Array.isArray),'a batch is returned on every approach and exit frame');
  assert.deepEqual(batches.map(batch=>[batch[0].active,batch[0].closePass]),[
    [false,false],[true,false],[true,false],[false,true],
  ]);
  assert.deepEqual(batches[3][0],{
    id:'dancer-0',bumped:false,closePass:true,active:false,
    contactStarted:false,contactEnded:false,clearance:3,
  });
  assert.equal(round.closePasses,1);
  assert.equal(round.score,15);
  assert.deepEqual(events,[['round:closepass',{points:15,runId:'delivery-encounter-test',clearance:3}]]);
  assert.deepEqual(effects,[[300,300,0x93ffd6,15,false,'SMOOTH +15']]);
  assert.ok(crowd.people[0].smooth.alpha>0);
  assert.equal(update(400,330,400)[0].closePass,false);
});
