import test from 'node:test';
import assert from 'node:assert/strict';
import {createCrowdReactions} from '../src/crowd-reactions.js';

function harness(){
 const labels=[];
 const people=Array.from({length:3},(_,index)=>({id:`dancer-${index}`,node:{x:100+index*60,y:240},encounter:{touching:false}}));
 const scene={crowd:{people},add:{text(x,y,text,style){
  const label={x,y,text,style,alpha:1,destroyed:false,
   setOrigin(){return this;},setDepth(){return this;},setPosition(x,y){this.x=x;this.y=y;return this;},
   setAlpha(value){this.alpha=value;return this;},destroy(){this.destroyed=true;}};
  labels.push(label);return label;
 }}};
 return {scene,labels,reactions:createCrowdReactions(scene),live:()=>labels.filter(label=>!label.destroyed)};
}
const contact=id=>({id,contactStarted:true});

test('reactions respect dancer and shared cooldowns without changing encounters or positions',()=>{
 const h=harness(),before=structuredClone(h.scene.crowd.people);
 h.reactions.update([contact('dancer-0'),contact('dancer-1')],0,false,true);
 assert.equal(h.labels.length,1);
 h.reactions.update([contact('dancer-1')],1199,false,true);assert.equal(h.labels.length,1);
 h.reactions.update([contact('dancer-1')],1200,false,true);assert.equal(h.labels.length,2);
 h.reactions.update([contact('dancer-0')],2400,false,true);assert.equal(h.labels.length,2);
 h.reactions.update([contact('dancer-0')],7999,false,true);assert.equal(h.labels.length,2);
 h.reactions.update([contact('dancer-0')],8000,false,true);assert.equal(h.labels.length,3);
 assert.ok(h.live().length<=2);
 assert.deepEqual(h.scene.crowd.people,before);
});

test('a held contact cannot repeatedly react, while a completed smooth pass can',()=>{
 const h=harness();
 h.reactions.update([{id:'dancer-0',contact:true,contactStarted:false}],0,false,true);
 assert.equal(h.labels.length,0);
 h.reactions.update([{id:'dancer-1',closePass:true}],100,false,true);
 assert.equal(h.labels.length,1);assert.ok(h.labels[0].text);
});

test('round time freezes fading; labels follow dancers and reduced motion suppresses their rise',()=>{
 const h=harness();h.reactions.update([contact('dancer-0')],0,true,true);
 const label=h.labels[0],y=label.y;
 h.reactions.update([],0,true,true);assert.equal(label.alpha,1);assert.equal(label.y,y);
 h.scene.crowd.people[0].node.x=130;h.reactions.update([],450,true,true);
 assert.equal(label.x,130);assert.equal(label.y,y);assert.ok(label.alpha>0&&label.alpha<1);
 h.reactions.update([],450,false,true);assert.ok(label.y<y);
 h.reactions.update([],900,false,true);assert.equal(h.live().length,0);
});

test('disable, reset, time rollback and teardown leave no stale reactions',()=>{
 const h=harness();
 h.reactions.update([contact('dancer-0')],50,false,false);assert.equal(h.labels.length,0);
 h.reactions.update([contact('dancer-0')],100,false,true);assert.equal(h.live().length,1);
 h.reactions.update([],120,false,false);assert.equal(h.live().length,0);
 h.reactions.reset();h.reactions.update([contact('dancer-0')],100,false,true);assert.equal(h.live().length,1);
 h.reactions.update([contact('dancer-0')],0,false,true);assert.equal(h.live().length,1);
 h.reactions.destroy();assert.equal(h.live().length,0);
 h.reactions.update([contact('dancer-1')],2000,false,true);assert.equal(h.live().length,0);
});

test('earned friendship milestones can react within the chatter cooldown',()=>{
 const h=harness();
 const pass=passes=>({id:'dancer-0',closePass:true,friendship:{passes,befriended:passes===4}});
 h.reactions.update([pass(1)],0);assert.match(h.labels.at(-1).text,/1\/4/);
 h.reactions.update([pass(2)],3100);assert.match(h.labels.at(-1).text,/2\/4/);
 h.reactions.update([pass(3)],6200);assert.match(h.labels.at(-1).text,/3\/4/);
 h.reactions.update([pass(4)],9300);assert.match(h.labels.at(-1).text,/New friend/);
 assert.equal(h.labels.length,4);assert.equal(h.live().length,1);
 h.reactions.update([{id:'dancer-1',contactStarted:true,friendship:{passes:4,befriended:true}}],10600);
 assert.doesNotMatch(h.labels.at(-1).text,/New friend/);
});
