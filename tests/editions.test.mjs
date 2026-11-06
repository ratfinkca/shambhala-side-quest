import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {getEdition,editionIdFromEnv} from '../src/editions/registry.js';
import {GENERIC_RULES,routePosition} from '../supabase/functions/_shared/edition-rules.js';
import {endlessStage} from '../src/endless.js';
import {readRecovery} from '../src/recovery.js';
import {validateScore} from '../supabase/functions/_shared/score.js';
const baseline=JSON.parse(readFileSync(new URL('./fixtures/edition-generic-baseline.json',import.meta.url)));
test('trusted edition identities default only when unset and are deeply immutable',()=>{
 assert.equal(editionIdFromEnv({}),'generic');
 for(const id of ['',null,'other','__proto__'])assert.throws(()=>getEdition(id));
 for(const id of ['',null,'other'])assert.throws(()=>editionIdFromEnv({VITE_EDITION:id}));
 const g=getEdition();assert.equal(g.profileKey,'sidequest.profile.v1');assert.equal(g.lockName,g.profileKey);
 assert.equal(g.rulesetId,'arcade-v1');assert.equal(g.playable,true);assert.equal(g.postingEnabled,true);
 assert.deepEqual(g.mainStageIds,['forest','neon','sunrise']);assert.deepEqual(GENERIC_RULES.targets,[20,25,30]);
 assert.equal(GENERIC_RULES.roundMs,60000);
 assert.deepEqual(GENERIC_RULES.endless,{targetStep:3,targetCap:45,crowdStep:2,crowdCap:22,speedStep:.08,speedCap:.2});
 assert.throws(()=>g.mainStageIds.push('oops'));assert.throws(()=>GENERIC_RULES.targets[0]=1);
});
test('SMF catalogue contains six mains and the three precise parent discoveries',()=>{
 const s=getEdition('smf');assert.equal(s.playable,false);assert.equal(s.postingEnabled,false);assert.equal(s.rulesetId,null);
 assert.equal(s.profileKey,'sidequest.smf.profile.v1');assert.equal(s.lockName,s.profileKey);
 assert.deepEqual(s.catalogue.map(c=>c.id).sort(),['smf-amp','smf-fractal','smf-grove','smf-living-room','smf-pagoda','smf-village','smf-rabbit-hole','smf-secret-garden','smf-ikigai-mori'].sort());
 assert.deepEqual(Object.fromEntries(s.catalogue.filter(c=>c.kind==='secret').map(c=>[c.id,c.parentId])),{'smf-rabbit-hole':'smf-living-room','smf-secret-garden':'smf-grove','smf-ikigai-mori':'smf-pagoda'});
 assert.equal(s.mainStageIds.length,6);assert.ok(s.mainStageIds.every(id=>s.catalogue.find(c=>c.id===id)?.kind==='main'));
 assert.throws(()=>s.catalogue[0].name='oops');
});
test('route positioning uses its supplied route length and rejects invalid inputs',()=>{
 assert.deepEqual(routePosition(7,6),{offset:1,loop:1});assert.deepEqual(routePosition(14,3),{offset:2,loop:4});
 for(const n of [-1,.5,NaN,Infinity,Number.MAX_SAFE_INTEGER+1])assert.throws(()=>routePosition(n,6));
 for(const n of [0,-1,.5,NaN,Infinity])assert.throws(()=>routePosition(0,n));
});
test('published stage geometry/rules and legacy score/recovery fixtures stay unchanged',()=>{
 assert.deepEqual(Array.from({length:15},(_,i)=>createHash('sha256').update(JSON.stringify(endlessStage(i))).digest('hex')),baseline.stageHashes);
 assert.deepEqual(validateScore(baseline.score),{ok:true,record:baseline.score});
 assert.deepEqual(readRecovery(baseline.recovery),{ok:true,value:baseline.recovery});
});
