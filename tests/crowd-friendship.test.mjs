import test from 'node:test';
import assert from 'node:assert/strict';
import {createCrowdFriendships} from '../src/crowd-friendship.js';
import {SMF_PREVIEW_STAGES} from '../src/editions/smf-stages.js';

const people=Array.from({length:6},(_,index)=>({id:`dancer-${index}`}));
const pass=id=>({id,closePass:true});

test('every venue receives the same stable mix of three individual collision sizes',()=>{
 for(const stage of SMF_PREVIEW_STAGES){
  const dancers=stage.crowdAnchors.map((_,index)=>({id:`dancer-${index}`}));
  const friendships=createCrowdFriendships(dancers);
  assert.deepEqual(dancers.slice(0,3).map(({id})=>friendships.get(id)),[
   {id:'dancer-0',kind:'small',baseRadius:18,radius:18,passes:0,isFriend:false},
   {id:'dancer-1',kind:'medium',baseRadius:26,radius:26,passes:0,isFriend:false},
   {id:'dancer-2',kind:'large',baseRadius:34,radius:34,passes:0,isFriend:false},
  ],stage.id);
  assert.equal(new Set(dancers.map(({id})=>friendships.get(id).kind)).size,3);
  for(let index=3;index<dancers.length;index++)assert.equal(friendships.get(dancers[index].id).kind,['small','medium','large'][index%3]);
 }
});

test('base size is bounded before individual offsets and nonfinite values use the default',()=>{
 for(const [baseRadius,radii] of [[-100,[12,20,28]],[100,[24,32,40]],[NaN,[18,26,34]],[Infinity,[18,26,34]]]){
  const friendships=createCrowdFriendships(people,{baseRadius});
  assert.deepEqual(people.slice(0,3).map(({id})=>friendships.get(id).radius),radii);
 }
});

test('four clean passes with the same person shrink their body to zero and befriend once',()=>{
 const friendships=createCrowdFriendships(people),radii=[];
 for(let count=1;count<=4;count++){
  const milestones=friendships.record([pass('dancer-1')]);
  assert.equal(milestones.length,1);assert.equal(milestones[0].passes,count);
  assert.equal(milestones[0].befriended,count===4);radii.push(milestones[0].radius);
 }
 assert.deepEqual(radii,[19.5,13,6.5,0]);
 assert.equal(friendships.get('dancer-1').isFriend,true);
 assert.deepEqual(friendships.record([pass('dancer-1')]),[]);
 assert.deepEqual(friendships.summary(),{friends:1,connections:1,passes:4});
});

test('passing different dancers advances only their own connection',()=>{
 const friendships=createCrowdFriendships(people);
 for(let index=0;index<4;index++)friendships.record([pass(`dancer-${index}`)]);
 assert.deepEqual(friendships.summary(),{friends:0,connections:4,passes:4});
 assert.equal(friendships.get('dancer-0').radius,13.5);
 assert.equal(friendships.get('dancer-3').radius,13.5);
 friendships.record([pass('dancer-0')]);
 assert.equal(friendships.get('dancer-0').radius,9);
 assert.equal(friendships.get('dancer-1').passes,1);
});

test('contact and ordinary encounter updates neither award nor remove friendship',()=>{
 const friendships=createCrowdFriendships(people);
 friendships.record([pass('dancer-0')]);
 const before=friendships.get('dancer-0');
 assert.deepEqual(friendships.record([
  {id:'dancer-0',bumped:true,contactStarted:true,closePass:false},
  {id:'dancer-0',active:true},
  {id:'dancer-1',contactStarted:true},
  {id:'dancer-2',closePass:1},
 ]),[]);
 assert.deepEqual(friendships.get('dancer-0'),before);
 assert.deepEqual(friendships.summary(),{friends:0,connections:1,passes:1});
});

test('duplicate dancer IDs award once per batch and subsequent completed passes still count',()=>{
 const friendships=createCrowdFriendships(people);
 const first=friendships.record([pass('dancer-0'),pass('dancer-0'),pass('dancer-1')]);
 assert.deepEqual(first.map(row=>[row.id,row.passes]),[['dancer-0',1],['dancer-1',1]]);
 const next=friendships.record([pass('dancer-0')]);assert.equal(next[0].passes,2);
 assert.deepEqual(friendships.summary(),{friends:0,connections:2,passes:3});
});

test('caller data and returned snapshots cannot change internal friendship state',()=>{
 const dancers=people.map(person=>({...person})),before=structuredClone(dancers);
 const friendships=createCrowdFriendships(dancers),encounters=[pass('dancer-0')],originalEvents=structuredClone(encounters);
 const milestones=friendships.record(encounters);
 assert.deepEqual(dancers,before);assert.deepEqual(encounters,originalEvents);
 dancers[0].id='renamed';dancers.pop();
 milestones[0].passes=4;milestones[0].radius=0;milestones.push({id:'fake'});
 const snapshot=friendships.get('dancer-0');snapshot.radius=0;snapshot.kind='other';snapshot.isFriend=true;
 const summary=friendships.summary();summary.friends=99;
 assert.deepEqual(friendships.get('dancer-0'),{id:'dancer-0',kind:'small',baseRadius:18,radius:13.5,passes:1,isFriend:false});
 assert.deepEqual(friendships.summary(),{friends:0,connections:1,passes:1});
 assert.equal(friendships.get('renamed'),null);assert.ok(friendships.get('dancer-5'));
});

test('reset restores every radius and clears earned connections',()=>{
 const friendships=createCrowdFriendships(people);
 for(let index=0;index<4;index++)friendships.record([pass('dancer-0')]);
 friendships.record([pass('dancer-1')]);friendships.reset();
 assert.deepEqual(friendships.summary(),{friends:0,connections:0,passes:0});
 assert.equal(friendships.get('dancer-0').radius,18);assert.equal(friendships.get('dancer-0').isFriend,false);
 assert.equal(friendships.get('dancer-1').radius,26);
 assert.equal(friendships.record([pass('dancer-0')])[0].passes,1);
});

test('unknown dancers and empty lists are ignored; disabled comparison earns no friendship',()=>{
 const empty=createCrowdFriendships([]);assert.equal(empty.get('missing'),null);
 assert.deepEqual(empty.record([pass('missing')]),[]);assert.deepEqual(empty.summary(),{friends:0,connections:0,passes:0});
 const friendships=createCrowdFriendships(people,{enabled:false});
 assert.deepEqual(friendships.record([pass('dancer-0'),pass('missing')]),[]);
 assert.deepEqual(friendships.summary(),{friends:0,connections:0,passes:0});assert.equal(friendships.get('dancer-0').radius,18);
 const active=createCrowdFriendships(people);
 assert.deepEqual(active.record([pass('missing')]),[]);assert.deepEqual(active.record([]),[]);
});

test('restored pass counts retain individual radii and the next earned friendship milestone',()=>{
 const passes=[3,4,1],friendships=createCrowdFriendships(people,{passes});
 assert.equal(friendships.get('dancer-0').radius,4.5);
 assert.equal(friendships.get('dancer-1').radius,0);assert.equal(friendships.get('dancer-1').isFriend,true);
 assert.equal(friendships.get('dancer-2').radius,25.5);assert.equal(friendships.get('dancer-3').passes,0);
 assert.deepEqual(friendships.summary(),{friends:1,connections:3,passes:8});
 passes[0]=0;passes[1]=0;
 const earned=friendships.record([pass('dancer-0')]);
 assert.equal(earned[0].passes,4);assert.equal(earned[0].befriended,true);
 assert.equal(friendships.get('dancer-1').isFriend,true);
 friendships.reset();assert.deepEqual(friendships.summary(),{friends:0,connections:0,passes:0});
});

test('legacy or malformed restored counts start at zero without rejecting the round',()=>{
 for(const passes of [undefined,null,{},'3',[-1,5,1.5,NaN,Infinity,'4']]){
  const friendships=createCrowdFriendships(people,{passes});
  assert.deepEqual(friendships.summary(),{friends:0,connections:0,passes:0});
  assert.equal(friendships.get('dancer-0').radius,18);
 }
 const friendships=createCrowdFriendships(people,{passes:[null,undefined,0,2]});
 assert.equal(friendships.get('dancer-3').passes,2);
 assert.equal(friendships.get('dancer-0').passes,0);
});
