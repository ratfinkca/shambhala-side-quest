import test from 'node:test';
import assert from 'node:assert/strict';
import {createCrowdSocialView} from '../src/crowd-social-view.js';
import {createCrowdFriendships} from '../src/crowd-friendship.js';

function ring(){return {radius:48,alpha:0,visible:true,setRadius(value){this.radius=value;return this;},setAlpha(value){this.alpha=value;return this;},setVisible(value){this.visible=value;return this;},setStrokeStyle(width,colour,alpha){this.stroke={width,colour,alpha};return this;}};}
function harness(){
 const graphics=[],labels=[];
 const people=Array.from({length:3},(_,index)=>({id:`dancer-${index}`,node:{x:100+index*60,y:200,visible:true},encounter:{active:false},ring:ring(),smooth:{list:[ring(),ring(),ring()]}}));
 const scene={running:true,round:{ended:false},dancer:{x:160,y:240},crowd:{people},add:{
  graphics(){const g={commands:[],destroyed:false,setDepth(value){this.depth=value;return this;},clear(){this.commands=[];return this;},destroy(){this.destroyed=true;this.commands=[];}};for(const key of ['lineStyle','strokeCircle','strokePoints','fillStyle','fillCircle','fillTriangle','fillRect'])g[key]=function(...args){this.commands.push([key,...args]);return this;};graphics.push(g);return g;},
  text(x,y,text,style){const label={x,y,text,style,destroyed:false,alpha:1,setOrigin(){return this;},setDepth(){return this;},setPosition(x,y){this.x=x;this.y=y;return this;},setAlpha(value){this.alpha=value;return this;},destroy(){this.destroyed=true;}};labels.push(label);return label;},
 }};
 const friendships=createCrowdFriendships(people);
 return {scene,people,graphics,labels,friendships,view:createCrowdSocialView(scene),commands:()=>graphics.flatMap(g=>g.commands)};
}
const pass=id=>({id,closePass:true});

test('mixed personal-space rings match friendship radii and disappear outside nearby range',()=>{
 const h=harness();h.view.paint(h.friendships);
 assert.deepEqual(h.people.map(p=>p.ring.radius),[18,26,34]);
 assert.deepEqual(h.people.map(p=>p.ring.stroke.colour),[0x99e1cb,0xefd58d,0xecb5ca]);
 assert.ok(h.people.every(p=>p.ring.alpha>0));assert.deepEqual(h.commands(),[],'normal play has no diagnostic circles');
 h.friendships.record([pass('dancer-0')]);h.view.paint(h.friendships);
 assert.equal(h.people[0].ring.radius,13.5);assert.equal(h.people[0].smooth.list[0].radius,13.5);assert.equal(h.people[0].smooth.list[1].radius,30.75);
 assert.equal(h.commands().filter(c=>c[0]==='fillRect').length,4,'a developing friendship shows four progress pips');
 h.scene.dancer.x=900;h.view.paint(h.friendships);
 assert.ok(h.people.every(p=>p.ring.alpha===0));assert.deepEqual(h.commands(),[]);
});

test('four passes replace personal space and pips with a heart without changing crowd or friendship state',()=>{
 const h=harness();for(let i=0;i<4;i++)h.friendships.record([pass('dancer-0')]);
 const positions=h.people.map(p=>({...p.node})),encounters=structuredClone(h.people.map(p=>p.encounter)),state=h.friendships.get('dancer-0');
 h.view.paint(h.friendships);
 assert.equal(h.people[0].ring.radius,0);assert.equal(h.people[0].ring.alpha,0);assert.equal(h.people[0].smooth.list[0].visible,false);
 assert.equal(h.commands().filter(c=>c[0]==='fillRect').length,7,'a seven-run pixel heart replaces the pips');
 assert.equal(h.commands().filter(c=>c[0]==='fillCircle').length,0);
 assert.deepEqual(h.people.map(p=>p.node),positions);assert.deepEqual(h.people.map(p=>p.encounter),encounters);assert.deepEqual(h.friendships.get('dancer-0'),state);
});

test('Off uses the baseline radius and suppresses friendship marks; diagnostic geometry is opt-in',()=>{
 const h=harness();h.friendships.record([pass('dancer-0')]);h.view.paint(h.friendships,{enabled:false});
 assert.deepEqual(h.people.map(p=>p.ring.radius),[27,27,27]);assert.ok(h.people.every(p=>p.ring.stroke.colour===0xb2c5c1));assert.deepEqual(h.commands(),[]);
 h.view.paint(h.friendships,{enabled:false,debug:true});
 assert.equal(h.commands().filter(c=>c[0]==='strokePoints').length,6);
 assert.equal(h.commands().filter(c=>c[0]==='fillCircle').length,1,'only the player diagnostic dot is filled');
});

test('earned pass reactions are enriched from current bonds without awarding a second pass',()=>{
 const h=harness();h.view.paint(h.friendships);
 for(let count=1;count<=4;count++){
  const encounters=[pass('dancer-0')];h.friendships.record(encounters);
  h.view.update(encounters,(count-1)*3100,h.friendships,{reducedMotion:true});
  assert.equal(h.friendships.get('dancer-0').passes,count);
  assert.equal(encounters[0].friendship,undefined,'presentation must not mutate event payloads');
  assert.match(h.labels.at(-1).text,count===4?/New friend/:new RegExp(`${count}/4`));
 }
 h.view.update([pass('dancer-0')],12500,h.friendships);
 assert.equal(h.labels.length,4,'an already earned friendship is not announced again');
 h.view.update([],12500,h.friendships,{reactions:false});assert.ok(h.labels.every(label=>label.destroyed));
});

test('paused marks remain frozen, hidden dancers and ended rounds clear them, and teardown is safe',()=>{
 const h=harness();h.friendships.record([pass('dancer-0')]);h.view.update([pass('dancer-0')],0,h.friendships);
 h.scene.running=false;h.view.update([],0,h.friendships);assert.equal(h.labels[0].alpha,1);assert.ok(h.commands().length>0);
 for(const person of h.people)person.node.visible=false;
 h.view.update([],20,h.friendships);assert.deepEqual(h.commands(),[]);assert.ok(h.labels.every(label=>label.destroyed));
 for(const person of h.people)person.node.visible=true;
 h.view.paint(h.friendships);h.scene.round.ended=true;h.view.update([pass('dancer-1')],30,h.friendships,{debug:true});
 assert.deepEqual(h.commands(),[]);assert.ok(h.people.every(p=>p.ring.alpha===0));
 h.scene.round.ended=false;h.view.paint(h.friendships);h.view.reset();assert.deepEqual(h.commands(),[]);assert.ok(h.people.every(p=>p.ring.alpha===0));
 h.view.destroy();h.view.destroy();assert.ok(h.graphics.every(g=>g.destroyed));assert.doesNotThrow(()=>h.view.update([],40,h.friendships));
});

test('missing display children and non-array stub lists do not interrupt gameplay',()=>{
 const h=harness();delete h.people[0].ring;delete h.people[0].smooth;h.people[1].smooth.list={0:ring()};h.people[2].smooth.list=[];
 assert.doesNotThrow(()=>h.view.paint(h.friendships,{debug:true}));
 assert.doesNotThrow(()=>h.view.reset());assert.doesNotThrow(()=>h.view.destroy());
});
