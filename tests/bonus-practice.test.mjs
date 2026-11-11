import test from 'node:test';
import assert from 'node:assert/strict';
import {BONUS_VENUES,getBonusVenue} from '../src/bonus-practice/config.js';
import {createBonusPractice} from '../src/bonus-practice/state.js';
import {getTiming} from '../src/stage-clock.js';
import {crowdPosition,createEncounter,updateEncounter} from '../src/festival.js';

const setup=id=>{const config=getBonusVenue(id),practice=createBonusPractice(config);practice.start();return {config,practice};};
test('four disposable venues have reachable objectives and whole phrase clocks',()=>{
 assert.equal(BONUS_VENUES.length,4);
 for(const c of BONUS_VENUES){
  const timing=getTiming(c.timingId),bounds=c.stage.playBounds;
  assert.equal(Math.round(timing.durationMs*timing.bpm/240000)%8,0);
  for(const p of [...c.points,...(c.bed?[c.bed]:[])]){
   assert.ok(p.x>bounds.minX+30&&p.x<bounds.maxX-30);
   assert.ok(p.y>=bounds.minY+25&&p.y<bounds.maxY-25);
   assert.ok(Math.hypot(p.x-c.stage.spawn.x,p.y-c.stage.spawn.y)>p.radius);
  }
  for(let t=0;t<timing.durationMs;t+=500)for(let i=0;i<c.stage.crowdAnchors.length;i++){
   const p=crowdPosition(i,t,c.stage.crowdAnchors,c.stage.crowdSpeed,timing);
   assert.ok(p.x>bounds.minX+20&&p.x<bounds.maxX-20&&p.y>bounds.minY+20&&p.y<bounds.maxY-20,`${c.id} dancer ${i}`);
  }
 }
 assert.throws(()=>getBonusVenue('unknown'));
});
test('rabbit trail is sequential, each trinket once, completion includes temporary souvenir',()=>{
 const {config:c,practice:p}=setup('rabbit-hole');
 assert.equal(p.step({player:c.points[2]}),null);
 for(let i=0;i<c.points.length;i++){
  const event=p.step({player:c.points[i]});
  assert.equal(event.type,i===5?'complete':'collected');assert.equal(p.state.progress,i+1);
  assert.equal(p.step({player:c.points[i]}),null);
  if(i===5)assert.equal(event.reward,c.reward);
 }
 assert.equal(p.status,'complete');
});
test('garden requires a held seed and a fresh smooth pass into the bed',()=>{
 const {config:c,practice:p}=setup('secret-garden');
 assert.equal(p.step({player:c.bed}),null);
 for(let i=0;i<3;i++){
  assert.equal(p.step({player:c.points[i]}).type,'pickup');
  assert.equal(p.state.progress,i);assert.equal(p.state.carrying,c.points[i].id);
  assert.equal(p.step({player:c.points[(i+1)%3]}),null);
  assert.equal(p.step({player:c.bed}),null,'walking into the bed cannot plant');
  assert.equal(p.step({player:{x:c.bed.x+c.bed.radius+1,y:c.bed.y},encounters:[{id:'dancer-7',closePass:true}]}),null,'pass outside bed cannot plant');
  assert.equal(p.step({player:c.bed,encounters:[{id:'dancer-7',closePass:true}]}),null,'same event cannot be carried into the bed');
  p.step({player:c.bed});
  assert.equal(p.step({player:c.bed,encounters:[{id:'dancer-7',closePass:true}]}).type,i===2?'complete':'planted');
  assert.equal(p.state.carrying,null);assert.equal(p.state.progress,i+1);
  assert.equal(p.step({player:c.bed}),null);
 }
});
test('garden never plants on a bump or from an approach begun before collecting the seed',()=>{
 const {config:c,practice:p}=setup('secret-garden');
 p.step({player:c.points[0],encounters:[{id:'dancer-7',active:true}]});
 assert.equal(p.step({player:c.bed,encounters:[{id:'dancer-7',closePass:true,active:false}]}),null);
 assert.equal(p.state.carrying,c.points[0].id);
 p.step({player:c.bed});
 assert.equal(p.step({player:c.bed,encounters:[{id:'dancer-7',closePass:true},{id:'dancer-0',bumped:true}]}),null);
 assert.equal(p.state.carrying,c.points[0].id,'bumps preserve the seed');
 p.step({player:c.bed});
 assert.equal(p.step({player:c.bed,encounters:[{id:'invented',closePass:true}]}),null);
 assert.equal(p.step({player:c.bed,encounters:[{id:'dancer-7',closePass:true}]}).type,'planted');
});
test('garden entrance geometry admits a real clean pass into its dropoff throughout the set',()=>{
 const c=getBonusVenue('secret-garden'),timing=getTiming(c.timingId);
 assert.equal(c.stage.crowdAnchors.length,12);
 for(let start=0;start<timing.durationMs-1000;start+=1000){
  const p=createBonusPractice(c);p.start();p.step({player:c.points[0]});
  const encounter=createEncounter();let planted=null;
  for(const [index,dy] of [70,40,0,-30,-65].entries()){
   const now=start+index*50,dancer=crowdPosition(7,now,c.stage.crowdAnchors,c.stage.crowdSpeed,timing),player={x:dancer.x+35,y:dancer.y+dy};
   const hit={id:'dancer-7',...updateEncounter(encounter,player,dancer,now),active:encounter.active};
   assert.equal(hit.bumped,false);planted=p.step({player,encounters:[hit]})||planted;
  }
  assert.equal(planted?.type,'planted',`reachable at ${start}ms`);
 }
});
test('Ikigai counts only unlit lantern carriers and prioritizes physical bumps',()=>{
 const {config:c,practice:p}=setup('ikigai-mori'),pass=id=>({id,closePass:true});
 assert.equal(c.stage.crowdAnchors.length,14);assert.equal(c.lanternIds.length,5);
 assert.equal(p.step({encounters:[pass('invented')]}),null);
 assert.equal(p.step({encounters:[pass('dancer-1')]}),null,'ordinary dancers do not count');
 assert.equal(p.step({encounters:[pass('dancer-0'),{id:'dancer-2',bumped:true}]}),null);
 assert.equal(p.step({encounters:[pass('dancer-0'),pass('dancer-1')]}).type,'greeted');
 assert.equal(p.state.progress,1);
 assert.equal(p.step({encounters:[pass('dancer-0')]}),null);
 for(const id of c.lanternIds.slice(1))p.step({encounters:[pass(id)]});
 assert.equal(p.state.progress,5);assert.equal(p.status,'complete');
});
test('Villagio requires actual putting; visiting greens or waiting never earns its cosmetic',()=>{
 const {config:c,practice:p}=setup('villagio');
 assert.equal(c.activity,'putt');assert.equal(c.goal,2);assert.equal(c.reward,'Golden Chicken Totem');
 assert.equal(p.step({player:{x:220,y:355}}).type,'green-entered');
 for(const player of [{x:720,y:500},{x:800,y:285}])assert.equal(p.step({player}),null);
 for(let i=0;i<100;i++)assert.equal(p.advance(1000),null);
 assert.equal(p.status,'playing');assert.equal(p.state.progress,0);assert.equal(p.state.complete,false);
});
test('ready, pause, timeout and reset gate progress and clear temporary rewards',()=>{
 for(const c of BONUS_VENUES){
  const p=createBonusPractice(c),frame={player:c.points[0],encounters:[{id:'dancer-0',closePass:true}]};
  assert.equal(p.step(frame),null);p.start();p.pause();assert.equal(p.step(frame),null);
  p.resume();if(c.activity==='putt'){p.step({player:{x:220,y:355}});assert.ok(p.shoot({x:.1,y:0}));}else assert.ok(p.step(frame));p.finish();assert.equal(p.status,'ended');assert.equal(p.step(frame),null);
  p.start();assert.equal(p.state.progress,0);assert.equal(p.state.carrying,null);assert.equal(p.state.complete,false);
  assert.deepEqual(p.state.greetedIds,[]);assert.deepEqual(p.state.collectedIds,[]);
 }
});
