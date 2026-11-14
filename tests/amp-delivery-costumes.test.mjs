import test from 'node:test';
import assert from 'node:assert/strict';
import {applyDeliveryCostumes,DELIVERY_RECIPIENTS,recipientPortrait} from '../src/amp-delivery-view.js';

test('AMP orders have unique costume silhouettes even when the default crowd contains matching hats',()=>{
 const originalHats=['crown','wizard','headphones','crown','headphones','wizard','crown','wizard','headphones','flower'];
 const people=originalHats.map((hat,index)=>({id:`dancer-${index}`,node:{x:100+index*30,y:300},kind:['small','medium','large'][index%3],encounter:{passes:index%4},avatar:{outfit:{onesie:'patchwork',hat,totem:'peace',flair:'fireflies'}},body:{clear(){}}}));
 const physical=people.map(({id,node,kind,encounter})=>({id,node:{...node},kind,encounter:{...encounter}}));
 applyDeliveryCostumes(people);
 for(const [index,hat]of ['crown','headphones','wizard'].entries()){
  assert.equal(people[index].avatar.outfit.hat,hat);
  assert.equal(people.filter(person=>person.avatar.outfit.hat===hat).length,1,'only the named recipient wears this hat');
  assert.match(recipientPortrait(DELIVERY_RECIPIENTS[index].id),new RegExp(DELIVERY_RECIPIENTS[index].costume));
 }
 assert.equal(new Set(people.slice(3).map(person=>person.avatar.outfit.hat)).size,6);
 assert.ok(people.slice(3).every(person=>person.avatar.outfit.onesie==='patchwork'&&person.avatar.outfit.totem==='peace'&&person.avatar.outfit.flair==='fireflies'));
 assert.deepEqual(people.map(({id,node,kind,encounter})=>({id,node,kind,encounter})),physical,'the same mixed crowd and encounter progress remain intact');
});
