import test from 'node:test';
import assert from 'node:assert/strict';
import {bassBeat,bassOffset} from '../src/bass-motion.js';

test('visual bass repeats on the music beat, fades between beats, and is stronger during drops',()=>{
 assert.equal(bassBeat(0),bassBeat(500));
 assert.ok(bassBeat(0)>bassBeat(250));
 const speakers=[{x:100,y:100,width:60,height:60}];
 const near={x:180,y:134},far={x:225,y:134};
 const a=bassOffset(near,speakers,35,'cruise',false),b=bassOffset(far,speakers,35,'cruise',false);
 const drop=bassOffset(near,speakers,35,'drop',false);
 assert.ok(Math.hypot(a.x,a.y)>Math.hypot(b.x,b.y));
 assert.ok(Math.hypot(drop.x,drop.y)>Math.hypot(a.x,a.y));
 assert.deepEqual(bassOffset(near,speakers,535,'cruise',false),a);
 assert.deepEqual(near,{x:180,y:134});
});
test('bass offsets vanish outside zones and under reduced motion, with bounded overlapping shake',()=>{
 const speakers=[{x:100,y:100,width:60,height:60}];
 assert.deepEqual(bassOffset({x:240,y:134},speakers,35,'drop',false),{x:0,y:0});
 assert.deepEqual(bassOffset({x:180,y:134},speakers,35,'drop',true),{x:0,y:0});
 for(let t=0;t<500;t+=5){
  const offset=bassOffset({x:130,y:134},[...speakers,...speakers],t,'drop',false);
  assert.ok(Math.hypot(offset.x,offset.y)<=4);
 }
});
