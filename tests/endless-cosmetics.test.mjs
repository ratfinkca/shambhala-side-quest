import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeOutfit,WARDROBE,DEFAULT_APPEARANCE} from '../src/wardrobe.js';
import {normalizeProgress,awardStage} from '../src/progression.js';
import {renderEndlessRewards} from '../src/progression-view.js';
import {drawEndlessCosmetics} from '../src/endless-cosmetics.js';
import {rewardDemoStages} from '../src/rehearsal.js';
const outfit={onesie:'mycelium',hat:'spore',totem:'mixtape',flair:'aurora'};
test('new earned cosmetics survive normalization and have named wardrobe previews',()=>{
 assert.deepEqual(normalizeOutfit(outfit),{...outfit,appearance:DEFAULT_APPEARANCE});
 for(const [category,id]of Object.entries(outfit))assert.ok(WARDROBE[category].some(item=>item.id===id));
 const html=renderEndlessRewards(normalizeProgress());
 for(const name of ['Spore Sprout','Mixtape Totem','Mycelium Threads','Aurora Ribbons'])assert.ok(html.includes(`Preview ${name}`));
 assert.ok(html.includes('0 / 6'));assert.ok(html.includes('Creekside Drift'));assert.ok(html.includes('Best Endless run: 0'));
 const earned=renderEndlessRewards(awardStage(normalizeProgress(),{id:'four',mode:'endless',qualified:true,stagesCleared:4}).progress);
 assert.ok(earned.includes('Earned · Spore Sprout'));assert.ok(earned.includes('Best Endless run: 4'));
});
// Record drawing output at the graphics boundary; no Phaser/DOM or particle system needed.
function drawing(time,reduced=false,drop=false){const calls=[];const g=new Proxy({}, {get:(_,method)=>(...args)=>{calls.push([method,...args]);return g;}});drawEndlessCosmetics(g,outfit,time,reduced,drop);return calls;}
test('new cosmetic effects freeze with reduced motion, stay bounded, and respond gently to drops',()=>{
 assert.deepEqual(drawing(0,true,false),drawing(9000,true,true));
 assert.notDeepEqual(drawing(0),drawing(3000));assert.notDeepEqual(drawing(2000),drawing(2000,false,true));
 const first=drawing(0);assert.ok(first.length>10&&first.length<140);
 for(let t=0;t<60000;t+=317){
  const commands=drawing(t);assert.equal(commands.length,first.length);
  for(const [method,...args]of commands){
   if(['lineBetween','fillCircle','fillEllipse','fillRoundedRect','strokeCircle'].includes(method)){
    const coordinates=method==='lineBetween'?args.slice(0,4):args.slice(0,2);
    assert.ok(coordinates.every(n=>Number.isFinite(n)&&n>=-65&&n<=65));
   }
  }
 }
});
test('mycelium threads shift colour smoothly without needing a hat, totem or flourish',()=>{
 const calls=time=>{const output=[];const g=new Proxy({}, {get:(_,method)=>(...args)=>{output.push([method,...args]);return g;}});drawEndlessCosmetics(g,{onesie:'mycelium',hat:'none',totem:'none',flair:'none'},time);return output;};
 assert.notDeepEqual(calls(0),calls(1000));
});
test('development reward demonstrations exercise the real achievements using bounded distinct fixtures',()=>{
 for(const reward of ['hat:spore','totem:mixtape','onesie:mycelium','flair:aurora']){
  let p=normalizeProgress(),reveals=[];const stages=rewardDemoStages(reward);assert.ok(stages.length>0&&stages.length<=6);
  for(const stage of stages){const result=awardStage(p,stage);p=result.progress;reveals.push(...result.rewards);}
  assert.ok(reveals.includes(reward));
  for(const stage of stages)assert.equal(awardStage(p,stage).xp,0);
 }
 assert.deepEqual(rewardDemoStages('invalid'),[]);
});
