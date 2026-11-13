import test from 'node:test';
import assert from 'node:assert/strict';
import {createCrowdSocial} from '../src/crowd-social.js';
import {createRound} from '../src/game.js';
import {Crowd} from '../src/Crowd.js';

function display(x=0,y=0){let node;return node=new Proxy({x,y,list:[],setPosition(x,y){this.x=x;this.y=y;return node;},add(value){this.list.push(...(Array.isArray(value)?value:[value]));return node;}},{get:(target,key)=>key in target?target[key]:(...args)=>node});}
function fixture(options={}){
 const labels=[];
 const scene={add:new Proxy({text(x,y,text){const label=display(x,y);label.text=text;labels.push(label);return label;}},{get:(target,key)=>target[key]??display}),game:{events:{emit(){}}},effect(){},dancer:{x:120,y:200},round:createRound(),reducedMotion:true};
 scene.stage={crowdAnchors:[[200,200],[700,200],[850,200]],crowdSpeed:0,obstacles:[]};scene.crowd=new Crowd(scene);scene.crowd.configure(scene.stage);
 const social=createCrowdSocial(scene,{getOptions:()=>options});social.reset();return {scene,social,options,labels};
}
test('main crowd path awards real passes, shrinks one dancer and persists counts across pause',()=>{
 const {scene,social}=fixture();
 for(let i=0;i<4;i++){
  scene.round.remainingMs=60000-(1000+i*4000);scene.dancer.x=120;scene.dancer.y=200+social.friendships.get('dancer-0').radius+7;
  social.beforeMove(50);scene.resolveMovementStep(scene.dancer,{x:1,y:0},50,{speed:3200});
  const encounters=scene.crowd.update(scene.dancer,scene.round,true);social.afterEncounters(encounters);
 }
 assert.equal(scene.round.closePasses,4);assert.equal(scene.round.score,60);assert.deepEqual(social.captureCounts(),[4,0,0]);
 const counts=social.captureCounts();social.reset(counts,13000);assert.equal(social.friendships.get('dancer-0').radius,0);
 scene.round.remainingMs=42000;scene.dancer.x=120;scene.dancer.y=200;social.beforeMove(50);
 scene.resolveMovementStep(scene.dancer,{x:1,y:0},50,{speed:3200});
 assert.equal(scene.dancer.x,280);assert.equal(scene.crowdEncounterMeasurement(0).physicalContact,false);
 social.reset();assert.deepEqual(social.captureCounts(),[0,0,0]);assert.equal(social.friendships.get('dancer-0').radius,18);
});
test('Off comparison clears owned hooks and cannot learn friendship; destroy cleans hooks',()=>{
 const {scene,social,options}=fixture();social.beforeMove(16);assert.equal(typeof scene.resolveMovementStep,'function');
 options.enabled=false;social.reset();social.beforeMove(16);social.afterEncounters([{id:'dancer-0',closePass:true}]);
 assert.equal(scene.resolveMovementStep,undefined);assert.equal(scene.crowdEncounterMeasurement,undefined);assert.deepEqual(social.captureCounts(),[0,0,0]);
 options.enabled=true;social.reset();social.beforeMove(16);social.destroy();assert.equal(scene.resolveMovementStep,undefined);
});
test('bonus clock wrap preserves friendship instead of resetting the relationship',()=>{
 const {scene,social}=fixture();scene.round.remainingMs=1;social.reset([3,4,1],59999);
 scene.round.remainingMs=59980;social.beforeMove(20);scene.resolveMovementStep(scene.dancer,{x:0,y:0},20,{speed:0});
 assert.deepEqual(social.captureCounts(),[3,4,1]);assert.equal(scene.crowdEncounterMeasurement(1).contactRadius,0);
 assert.ok(Number.isFinite(scene.dancer.x)&&Number.isFinite(scene.dancer.y));
});

test('a music wrap keeps only the remaining three-second pass cooldown',()=>{
 const {scene,social}=fixture();
 function cross(at){
  scene.round.remainingMs=60000-at;scene.dancer.x=120;scene.dancer.y=230;
  social.beforeMove(50);scene.resolveMovementStep(scene.dancer,{x:1,y:0},50,{speed:3200});
  const encounters=scene.crowd.update(scene.dancer,scene.round,true);social.afterEncounters(encounters);
 }
 cross(59000);assert.equal(scene.round.closePasses,1);
 cross(1000);assert.equal(scene.round.closePasses,1,'two seconds after the previous pass is still cooling down');
 cross(2100);assert.equal(scene.round.closePasses,2,'the previous loop must not block the rest of this set');
 assert.equal(social.friendships.get('dancer-0').passes,2);
});

test('suspended crowd encounters cannot complete a pass when hidden dancers move away',()=>{
 const {scene,social}=fixture();social.reset([2,0,0],0);scene.dancer={x:200,y:230};
 scene.round.remainingMs=59950;social.beforeMove(50);
 scene.resolveMovementStep(scene.dancer,{x:1,y:0},50,{speed:600});
 social.afterEncounters(scene.crowd.update(scene.dancer,scene.round,true));
 assert.equal(scene.crowd.people[0].encounter.active,true);assert.equal(scene.crowd.people[0].encounter.travel,30);
 social.suspend(50);assert.equal(scene.resolveMovementStep,undefined);assert.equal(scene.crowdEncounterMeasurement,undefined);
 scene.stage.crowdAnchors[0]=[500,200];scene.round.remainingMs=55000;social.suspend(5000);
 const suspended=scene.crowd.people.map(person=>structuredClone(person.encounter));social.suspend(5000);
 assert.deepEqual(scene.crowd.people.map(person=>person.encounter),suspended,'a paused putting checkpoint stays unchanged');
 scene.round.remainingMs=54950;social.beforeMove(50);scene.resolveMovementStep(scene.dancer,{x:0,y:0},50,{speed:0});
 social.afterEncounters(scene.crowd.update(scene.dancer,scene.round,true));
 assert.equal(scene.round.closePasses,0);assert.deepEqual(social.captureCounts(),[2,0,0]);
});

test('suspended music wraps preserve remaining cooldown without replaying old approaches',()=>{
 const {scene,social}=fixture();social.reset([2,0,0],59000);
 Object.assign(scene.crowd.people[0].encounter,{active:true,nearest:30,travel:30,cooldownUntil:62000});
 scene.round.remainingMs=500;social.suspend();scene.round.remainingMs=59000;social.suspend();
 const encounter=scene.crowd.people[0].encounter;
 assert.equal(encounter.cooldownUntil,2000);assert.equal(encounter.active,false);assert.equal(encounter.travel,0);
 scene.round.remainingMs=57900;scene.dancer={x:120,y:230};social.beforeMove(50);
 scene.resolveMovementStep(scene.dancer,{x:1,y:0},50,{speed:3200});social.afterEncounters(scene.crowd.update(scene.dancer,scene.round,true));
 assert.equal(scene.round.closePasses,1);assert.deepEqual(social.captureCounts(),[3,0,0]);
});

test('a clean pass on the first wrapped frame cannot reannounce an existing friendship',()=>{
 const {scene,social,labels}=fixture();social.reset([4,0,0],59000);
 scene.round.remainingMs=59000;scene.dancer={x:120,y:200};social.beforeMove(50);
 scene.resolveMovementStep(scene.dancer,{x:1,y:0},50,{speed:3200});social.afterEncounters(scene.crowd.update(scene.dancer,scene.round,true));
 assert.equal(scene.round.closePasses,1);assert.equal(social.friendships.get('dancer-0').passes,4);
 assert.equal(labels.some(label=>label.text==='New friend! ♥'),false);
});
