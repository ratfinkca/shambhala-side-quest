import test from 'node:test';import assert from 'node:assert/strict';
import {SMF_PREVIEW_STAGES,smfPreviewStage} from '../src/editions/smf-stages.js';
import {getTiming} from '../src/stage-clock.js';import {isOpen,findSpawn} from '../src/geometry.js';import {crowdPosition} from '../src/festival.js';import {findCandySpawn} from '../src/mystery.js';
for(const [id,target,crowd,speakers,duration]of [['smf-living-room',23,10,2,68571],['smf-fractal',24,12,2,64000],['smf-grove',24,14,3,58182],['smf-amp',24,16,4,54857],['smf-pagoda',28,18,3,60000],['smf-village',34,20,4,66977]])test(`${id} has safe authored geometry and its canonical clock`,()=>{
 const s=smfPreviewStage(id),timing=getTiming(s.timingId);assert.equal(s.id,id);assert.equal(s.target,target);assert.equal(s.crowdAnchors.length,crowd);assert.equal(s.obstacles.length,speakers);assert.equal(timing.durationMs,duration);assert.ok(Object.isFrozen(s)&&Object.isFrozen(s.spawn)&&Object.isFrozen(s.obstacles[0]));
 for(const p of [s.spawn,...s.flowSpawns])assert.ok(isOpen(p,24,s.obstacles));
 for(let t=0;t<=timing.durationMs;t+=50)for(let i=0;i<crowd;i++){const p=crowdPosition(i,t,s.crowdAnchors,1,timing);assert.ok(isOpen(p,14,s.obstacles),`dancer${i} overlaps cabinet at${t}`);assert.ok(p.x>=14&&p.x<=946&&p.y>=170&&p.y<=600);}
 for(let y=180;y<=570;y+=12)for(const x of [140,480,850])assert.ok(isOpen({x,y},14,s.obstacles),`bypass x${x} y${y}`);
 const open=new Set();for(let y=184;y<=568;y+=24)for(let x=160;x<=808;x+=24)if(isOpen({x,y},14,s.obstacles))open.add(`${x},${y}`);
 const first=open.values().next().value,seen=new Set([first]),queue=[first];while(queue.length){const [x,y]=queue.shift().split(',').map(Number);for(const [a,b]of [[x+24,y],[x-24,y],[x,y+24],[x,y-24]]){const key=`${a},${b}`;if(open.has(key)&&!seen.has(key)){seen.add(key);queue.push(key);}}}assert.equal(seen.size,open.size,'every spawn-grid region is connected');
 let seed=10;const rng=()=>((seed=(seed*16807)%2147483647)/2147483647);for(let i=0;i<200;i++){const p=findSpawn(s,rng,[],i%2===0);assert.ok(isOpen(p,24,s.obstacles));}assert.ok(isOpen(findSpawn(s,()=>0),24,s.obstacles));const candy=findCandySpawn(s,[],rng);assert.ok(candy&&isOpen(candy,24,s.obstacles));
});
test('only six authored previews are available; unknown and secret IDs fail',()=>{assert.equal(SMF_PREVIEW_STAGES.length,6);for(const id of ['forest','unknown','smf-rabbit-hole','smf-secret-garden','smf-ikigai-mori',null,undefined])assert.throws(()=>smfPreviewStage(id));assert.notDeepEqual(SMF_PREVIEW_STAGES[0].obstacles,SMF_PREVIEW_STAGES[1].obstacles);});

test('all venues provide arrival space without an opening dancer collision',()=>{
 for(const stage of SMF_PREVIEW_STAGES){const timing=getTiming(stage.timingId);for(let ms=0;ms<=1500;ms+=10)for(let i=0;i<stage.crowdAnchors.length;i++){const p=crowdPosition(i,ms,stage.crowdAnchors,1,timing),distance=Math.hypot(p.x-stage.spawn.x,p.y-stage.spawn.y);assert.ok(distance>=27,`${stage.id} dancer${i} collides with a stationary arrival at${ms}ms`);if(ms===0)assert.ok(distance>=64,`${stage.id} dancer${i} lacks opening breathing room`);}}
});
