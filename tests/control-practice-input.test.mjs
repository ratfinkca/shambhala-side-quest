import test from 'node:test';
import assert from 'node:assert/strict';
import {bindControlInput} from '../src/control-practice-input.js';

class Surface extends EventTarget {
 constructor(){super();this.hidden=true;this.style={setProperty(name,value){this[name]=value;}};this.attributes={};this.captured=new Set();this.knob={style:{}};}
 setPointerCapture(id){this.captured.add(id);}
 hasPointerCapture(id){return this.captured.has(id);}
 releasePointerCapture(id){this.captured.delete(id);emit(this,'lostpointercapture',{pointerId:id});}
 setAttribute(name,value){this.attributes[name]=value;}
 querySelector(){return this.knob;}
}
function emit(surface,type,{pointerId=1,clientX=100,clientY=200,button=0,pointerType='touch',...properties}={}){
 const event=new Event(type,{cancelable:true});
 for(const [key,value] of Object.entries({pointerId,clientX,clientY,button,pointerType,timeStamp:surface.clock?.()??performance.now(),...properties}))Object.defineProperty(event,key,{value});
 surface.dispatchEvent(event);return event;
}
function fixture(sensitivity=1,outerSprint=false){
 const floor=new Surface(),pad=new Surface(),stick=new Surface(),sprintButton=new Surface();
 const log={swipes:[],sticks:[],brakes:[],focus:0};let mode='swipe',playing=true,clock=0;
 for(const surface of [floor,pad,sprintButton])surface.clock=()=>clock;
 const input=bindControlInput({surfaces:[floor,pad],stick,sprintButton,isPlaying:()=>playing,getMode:()=>mode,getSensitivity:()=>sensitivity,getStickSprint:()=>outerSprint,
  onSwipe:value=>log.swipes.push(value),onStick:(vector,sprint)=>log.sticks.push({vector,sprint}),onBrake:immediate=>log.brakes.push(immediate),onFocus:()=>log.focus++,now:()=>clock});
 return {floor,pad,stick,sprintButton,log,input,advance:ms=>clock+=ms,setMode:value=>mode=value,setPlaying:value=>playing=value};
}

test('a complete swipe launches once on release using the whole screen-space stroke',t=>{
 const f=fixture();t.after(()=>f.input.dispose());
 const down=emit(f.pad,'pointerdown',{clientX:420,clientY:700});
 assert.equal(down.defaultPrevented,true);assert.equal(f.log.focus,1);assert.equal(f.log.swipes.length,0);assert.equal(f.log.sticks.length,0);
 f.advance(60);emit(f.pad,'pointermove',{clientX:470,clientY:680});
 assert.equal(f.log.swipes.length,0,'do not commit to a partial stroke');
 f.advance(60);emit(f.pad,'pointermove',{clientX:520,clientY:660});
 assert.equal(f.log.swipes.length,0,'holding does not directly steer');
 f.advance(20);emit(f.pad,'pointerup',{clientX:530,clientY:656});
 assert.deepEqual(f.log.swipes,[{dx:110,dy:-44,durationMs:140}]);
 emit(f.pad,'pointerup',{clientX:600,clientY:600});assert.equal(f.log.swipes.length,1);
 assert.equal(f.pad.hasPointerCapture(1),false);assert.equal(f.stick.hidden,true);
 assert.deepEqual(f.log.brakes,[],'lifting does not truncate the recognised burst');
});

test('slow dragging, held-then-dragging, and tiny jitter never count as a swipe',t=>{
 const f=fixture();t.after(()=>f.input.dispose());
 emit(f.floor,'pointerdown');
 for(let i=1;i<=20;i++){f.advance(40);emit(f.floor,'pointermove',{clientX:100+i*3});}
 emit(f.floor,'pointerup',{clientX:160});assert.equal(f.log.swipes.length,0);
 emit(f.floor,'pointerdown');f.advance(400);emit(f.floor,'pointermove',{clientX:190});emit(f.floor,'pointerup',{clientX:190});assert.equal(f.log.swipes.length,0);
 emit(f.floor,'pointerdown');f.advance(20);emit(f.floor,'pointermove',{clientX:105,clientY:202});emit(f.floor,'pointerup',{clientX:105,clientY:202});assert.equal(f.log.swipes.length,0);
});

test('a fresh finger contact permits a new swipe and sparse delivery can recognise on release',t=>{
 const f=fixture();t.after(()=>f.input.dispose());
 for(let i=0;i<2;i++){emit(f.floor,'pointerdown');f.advance(60);emit(f.floor,'pointerup',{clientX:140});}
 assert.equal(f.log.swipes.length,2);assert.deepEqual(f.log.brakes,[]);
});

test('hesitation before, during or after the stroke rejects the whole contact',t=>{
 for(const phase of ['before','during','after']){
  const f=fixture();t.after(()=>f.input.dispose());emit(f.floor,'pointerdown');
  if(phase==='before')f.advance(150);
  f.advance(30);emit(f.floor,'pointermove',{clientX:140});
  if(phase==='during')f.advance(150);
  f.advance(30);emit(f.floor,'pointermove',{clientX:180});
  if(phase==='after')f.advance(150);
  emit(f.floor,'pointerup',{clientX:180});
  assert.equal(f.log.swipes.length,0,phase);assert.deepEqual(f.log.brakes,[]);
 }
});

test('tiny jitter cannot disguise a pause as a continuous swipe',t=>{
 const f=fixture();t.after(()=>f.input.dispose());emit(f.floor,'pointerdown');
 f.advance(30);emit(f.floor,'pointermove',{clientX:140});
 for(let i=0;i<5;i++){f.advance(30);emit(f.floor,'pointermove',{clientX:140+i%2,clientY:200+i%2});}
 f.advance(30);emit(f.floor,'pointerup',{clientX:220});
 assert.equal(f.log.swipes.length,0);
});

test('backtracking and a sharp dogleg are ignored but natural wobble is tolerated',t=>{
 for(const points of [[[40,0],[10,0],[90,0]],[[60,0],[60,-60]]]){
  const f=fixture();t.after(()=>f.input.dispose());emit(f.floor,'pointerdown');
  for(const [dx,dy]of points){f.advance(40);emit(f.floor,'pointermove',{clientX:100+dx,clientY:200+dy});}
  const [dx,dy]=points.at(-1);emit(f.floor,'pointerup',{clientX:100+dx,clientY:200+dy});assert.equal(f.log.swipes.length,0);
 }
 const f=fixture();t.after(()=>f.input.dispose());emit(f.floor,'pointerdown');
 for(const [dx,dy]of [[20,2],[40,-2],[60,1],[80,0]]){f.advance(30);emit(f.floor,'pointermove',{clientX:100+dx,clientY:200+dy});}
 emit(f.floor,'pointerup',{clientX:180});assert.deepEqual(f.log.swipes,[{dx:80,dy:0,durationMs:120}]);
});

test('batched pointer samples preserve smoothness and hesitation evidence',t=>{
 const continuous=fixture(),paused=fixture();for(const f of [continuous,paused])t.after(()=>f.input.dispose());
 for(const f of [continuous,paused])emit(f.floor,'pointerdown',{timeStamp:1000});
 continuous.advance(200);emit(continuous.floor,'pointermove',{clientX:200,timeStamp:1200,getCoalescedEvents:()=>[1040,1080,1120,1160,1200].map(timeStamp=>({timeStamp,clientX:100+(timeStamp-1000)/2,clientY:200}))});
 emit(continuous.floor,'pointerup',{clientX:200,timeStamp:1200});assert.equal(continuous.log.swipes.length,1);
 paused.advance(200);emit(paused.floor,'pointermove',{clientX:200,timeStamp:1200,getCoalescedEvents:()=>[{timeStamp:1030,clientX:130,clientY:200},{timeStamp:1180,clientX:180,clientY:200},{timeStamp:1200,clientX:200,clientY:200}]});
 emit(paused.floor,'pointerup',{clientX:200,timeStamp:1200});assert.equal(paused.log.swipes.length,0);
});

test('delayed dispatch keeps native stroke timing across the entire gesture',t=>{
 const smooth=fixture(),held=fixture();for(const f of [smooth,held])t.after(()=>f.input.dispose());
 emit(smooth.floor,'pointerdown',{timeStamp:1000});smooth.advance(300);
 emit(smooth.floor,'pointermove',{clientX:200,timeStamp:1200,getCoalescedEvents:()=>[1040,1080,1120,1160,1200].map(timeStamp=>({timeStamp,clientX:100+(timeStamp-1000)/2,clientY:200}))});
 emit(smooth.floor,'pointerup',{clientX:200,timeStamp:1200});assert.deepEqual(smooth.log.swipes,[{dx:100,dy:0,durationMs:200}]);
 held.advance(200);emit(held.floor,'pointerdown',{timeStamp:1000});
 emit(held.floor,'pointermove',{clientX:160,timeStamp:1180});emit(held.floor,'pointerup',{clientX:160,timeStamp:1200});
 assert.equal(held.log.swipes.length,0,'queued dispatch must not erase a real hesitation');
});

test('tap brakes with a glide and an unstarted release cannot command movement',t=>{
 const f=fixture();t.after(()=>f.input.dispose());
 emit(f.floor,'pointerup');assert.deepEqual(f.log.brakes,[]);
 emit(f.floor,'pointerdown');emit(f.floor,'pointerup',{clientX:106,clientY:203});
 assert.deepEqual(f.log.brakes,[false]);assert.equal(f.log.swipes.length,0);
});

for(const eventType of ['pointercancel','lostpointercapture'])test(`${eventType} clears the gesture and requests an immediate stop`,t=>{
 const f=fixture();t.after(()=>f.input.dispose());f.setMode('stick');
 emit(f.floor,'pointerdown');emit(f.floor,'pointermove',{clientX:140});assert.equal(f.stick.hidden,false);
 emit(f.floor,eventType);assert.equal(f.log.brakes.at(-1),true);assert.equal(f.stick.hidden,true);assert.equal(f.floor.hasPointerCapture(1),false);
 const count=f.log.sticks.length;emit(f.floor,'pointermove',{clientX:170});emit(f.floor,'pointerup',{clientX:170});
 assert.equal(f.log.sticks.length,count);assert.equal(f.log.swipes.length,0);
});

test('pause rejects a pending swipe and movement while paused cancels the gesture',t=>{
 const f=fixture();t.after(()=>f.input.dispose());
 emit(f.pad,'pointerdown');f.setPlaying(false);emit(f.pad,'pointerup',{clientX:170});
 assert.equal(f.log.swipes.length,0);assert.equal(f.pad.hasPointerCapture(1),false);
 emit(f.pad,'pointerdown');assert.equal(f.pad.hasPointerCapture(1),false);
 f.setPlaying(true);emit(f.pad,'pointerdown');f.setPlaying(false);emit(f.pad,'pointermove',{clientX:170});
 assert.equal(f.log.brakes.at(-1),true);f.setPlaying(true);emit(f.pad,'pointerup',{clientX:170});assert.equal(f.log.swipes.length,0);
});

test('a second finger cannot steal steering or finish another finger’s gesture',t=>{
 const f=fixture();t.after(()=>f.input.dispose());f.setMode('stick');
 emit(f.floor,'pointerdown');emit(f.floor,'pointermove',{clientX:130});const count=f.log.sticks.length;
 emit(f.pad,'pointerdown',{pointerId:2,isPrimary:false,clientX:800});emit(f.floor,'pointermove',{pointerId:2,clientX:900});emit(f.pad,'pointerup',{pointerId:2,clientX:900});
 assert.equal(f.log.sticks.length,count);assert.equal(f.log.brakes.length,0);assert.equal(f.pad.hasPointerCapture(2),false);
 emit(f.floor,'pointermove',{clientX:140});assert.equal(f.log.sticks.length,count+1);
 emit(f.floor,'pointerup',{clientX:140});assert.equal(f.log.brakes.at(-1),false);
});

test('a held Sprint second touch changes speed without taking over the steering finger',t=>{
 const f=fixture();t.after(()=>f.input.dispose());f.setMode('stick');
 emit(f.pad,'pointerdown');emit(f.pad,'pointermove',{clientX:142});
 assert.deepEqual(f.log.sticks.at(-1),{vector:{x:1,y:0},sprint:false});
 emit(f.sprintButton,'pointerdown',{pointerId:2,isPrimary:false});
 assert.equal(f.sprintButton.attributes['aria-pressed'],'true');assert.deepEqual(f.log.sticks.at(-1),{vector:{x:1,y:0},sprint:true});
 emit(f.pad,'pointermove',{pointerId:1,clientX:142,clientY:220});assert.equal(f.log.sticks.at(-1).sprint,true);assert.ok(f.log.sticks.at(-1).vector.y>0);
 emit(f.sprintButton,'pointerup',{pointerId:2});assert.equal(f.sprintButton.attributes['aria-pressed'],'false');assert.equal(f.log.sticks.at(-1).sprint,false);
 assert.equal(f.log.brakes.length,0);assert.equal(f.pad.hasPointerCapture(1),true);
 emit(f.pad,'pointerup',{clientX:142,clientY:220});assert.equal(f.log.brakes.at(-1),false);
});

test('mode/reset cancellation releases both captures and prevents a stale release',t=>{
 const f=fixture();t.after(()=>f.input.dispose());f.setMode('stick');
 emit(f.floor,'pointerdown');emit(f.floor,'pointermove',{clientX:142});emit(f.sprintButton,'pointerdown',{pointerId:2,isPrimary:false});
 f.setMode('swipe');f.input.cancel();
 assert.equal(f.floor.hasPointerCapture(1),false);assert.equal(f.sprintButton.hasPointerCapture(2),false);assert.equal(f.sprintButton.attributes['aria-pressed'],'false');assert.equal(f.stick.hidden,true);assert.equal(f.log.brakes.at(-1),true);
 emit(f.floor,'pointerup',{clientX:180});assert.equal(f.log.swipes.length,0);
 emit(f.pad,'pointerdown',{pointerId:3});emit(f.pad,'pointermove',{pointerId:3,clientX:160});emit(f.pad,'pointerup',{pointerId:3,clientX:160});assert.equal(f.log.swipes.length,1);
});

test('mouse left-button drag works, right-button drag and nonplaying input do not',t=>{
 const f=fixture();t.after(()=>f.input.dispose());
 emit(f.floor,'pointerdown',{pointerType:'mouse',button:2});emit(f.floor,'pointerup',{pointerType:'mouse',button:2,clientX:180});assert.equal(f.log.swipes.length,0);
 emit(f.floor,'pointerdown',{pointerType:'mouse'});emit(f.floor,'pointermove',{pointerType:'mouse',clientX:180});assert.equal(f.log.swipes.length,0);emit(f.floor,'pointerup',{pointerType:'mouse',clientX:180});assert.equal(f.log.swipes.length,1);
 f.setPlaying(false);emit(f.floor,'pointerdown',{pointerType:'mouse'});emit(f.floor,'pointerup',{pointerType:'mouse',clientX:180});assert.equal(f.log.swipes.length,1);
});

test('disposing removes listeners and clears any active movement',()=>{
 const f=fixture();f.setMode('stick');emit(f.pad,'pointerdown');emit(f.pad,'pointermove',{clientX:140});f.input.dispose();
 assert.equal(f.log.brakes.at(-1),true);const count=f.log.sticks.length;
 emit(f.pad,'pointerdown');emit(f.pad,'pointermove',{clientX:140});assert.equal(f.log.sticks.length,count);
});

test('Shift modifier updates a held stick immediately and cancellation clears it',t=>{
 const f=fixture();t.after(()=>f.input.dispose());f.setMode('stick');
 emit(f.pad,'pointerdown',{pointerType:'mouse'});emit(f.pad,'pointermove',{pointerType:'mouse',clientX:142});
 const count=f.log.sticks.length;f.input.setSprintModifier(true);
 assert.equal(f.log.sticks.length,count+1,'no additional pointermove is required');
 assert.deepEqual(f.log.sticks.at(-1),{vector:{x:1,y:0},sprint:true});assert.equal(f.sprintButton.attributes['aria-pressed'],'true');
 f.input.setSprintModifier(false);assert.deepEqual(f.log.sticks.at(-1),{vector:{x:1,y:0},sprint:false});
 f.input.setSprintModifier(true);f.input.cancel();assert.equal(f.sprintButton.attributes['aria-pressed'],'false');
 emit(f.pad,'pointerdown',{pointerType:'mouse',pointerId:3});emit(f.pad,'pointermove',{pointerType:'mouse',pointerId:3,clientX:142});assert.equal(f.log.sticks.at(-1).sprint,false);
});

test('releasing Shift does not cancel a separately held Sprint touch',t=>{
 const f=fixture();t.after(()=>f.input.dispose());f.setMode('stick');
 emit(f.pad,'pointerdown');emit(f.pad,'pointermove',{clientX:142});emit(f.sprintButton,'pointerdown',{pointerId:2,isPrimary:false});
 f.input.setSprintModifier(true);f.input.setSprintModifier(false);assert.equal(f.log.sticks.at(-1).sprint,true);
 emit(f.sprintButton,'pointerup',{pointerId:2});assert.equal(f.log.sticks.at(-1).sprint,false);
});

test('sensitivity changes swipe recognition and stick travel but never accepts a slow held drag',t=>{
 const normal=fixture(),sensitive=fixture(1.6);for(const f of [normal,sensitive])t.after(()=>f.input.dispose());
 for(const f of [normal,sensitive]){emit(f.floor,'pointerdown');f.advance(30);emit(f.floor,'pointermove',{clientX:114});emit(f.floor,'pointerup',{clientX:114});}
 assert.equal(normal.log.swipes.length,0);assert.equal(sensitive.log.swipes.length,1);
 for(const f of [normal,sensitive]){f.input.cancel();f.setMode('stick');emit(f.floor,'pointerdown');emit(f.floor,'pointermove',{clientX:120});}
 assert.ok(sensitive.log.sticks.at(-1).vector.x>normal.log.sticks.at(-1).vector.x);
 sensitive.input.cancel();sensitive.setMode('swipe');emit(sensitive.floor,'pointerdown');sensitive.advance(300);emit(sensitive.floor,'pointermove',{clientX:150});assert.equal(sensitive.log.swipes.length,1);
});

test('tap mode does not capture pointers and canvas descendants cannot start steering',t=>{
 const f=fixture();t.after(()=>f.input.dispose());f.setMode('tap');
 assert.equal(emit(f.floor,'pointerdown').defaultPrevented,false);assert.equal(f.floor.hasPointerCapture(1),false);
 f.setMode('swipe');const event=new Event('pointerdown',{cancelable:true});
 for(const [key,value]of Object.entries({target:{},pointerId:1,button:0}))Object.defineProperty(event,key,{value});
 f.floor.dispatchEvent(event);assert.equal(f.floor.hasPointerCapture(1),false);
});

test('progressive sprint keeps a broad normal-speed area and ramps smoothly toward the outer edge',t=>{
 const f=fixture(1,true);t.after(()=>f.input.dispose());f.setMode('stick');emit(f.floor,'pointerdown');
 emit(f.floor,'pointermove',{clientX:118});assert.ok(f.log.sticks.at(-1).vector.x>0&&f.log.sticks.at(-1).vector.x<1);assert.equal(f.log.sticks.at(-1).sprint,0);
 for(const x of [142,160,176]){emit(f.floor,'pointermove',{clientX:x});assert.deepEqual(f.log.sticks.at(-1),{vector:{x:1,y:0},sprint:0});}
 emit(f.floor,'pointermove',{clientX:185});assert.equal(f.log.sticks.at(-1).sprint,.15625,'early outer push starts gently');
 emit(f.floor,'pointermove',{clientX:194});assert.equal(f.log.sticks.at(-1).sprint,.5);assert.equal(f.stick.style.left,'100px','the base stays anchored throughout the boost range');
 emit(f.floor,'pointermove',{clientX:203});assert.equal(f.log.sticks.at(-1).sprint,.84375);
 emit(f.floor,'pointermove',{clientX:212});assert.equal(f.log.sticks.at(-1).sprint,1);
 emit(f.floor,'pointermove',{clientX:194});assert.equal(f.log.sticks.at(-1).sprint,.5,'pulling back immediately reduces boost instead of latching full sprint');
 emit(f.floor,'pointermove',{clientX:176});assert.equal(f.log.sticks.at(-1).sprint,0);
 assert.equal(f.stick.style['--stick-normal-diameter'],'84px');assert.equal(f.stick.style['--stick-sprint-diameter'],'152px');assert.equal(f.stick.style.width,'224px');
});
test('progressive sprint geometry tracks sensitivity and cancellation clears boost and ownership',t=>{
 const f=fixture(1.6,true);t.after(()=>f.input.dispose());f.setMode('stick');emit(f.floor,'pointerdown');
 emit(f.floor,'pointermove',{clientX:147.5});assert.equal(f.log.sticks.at(-1).sprint,0);assert.equal(f.stick.style['--stick-sprint-diameter'],'95px');
 emit(f.floor,'pointermove',{clientX:158.75});assert.equal(f.log.sticks.at(-1).sprint,.5);
 emit(f.floor,'pointermove',{clientX:170});assert.equal(f.log.sticks.at(-1).sprint,1);assert.equal(f.stick.style.width,'140px');
 const count=f.log.sticks.length;emit(f.floor,'pointermove',{pointerId:2,isPrimary:false,clientX:20});assert.equal(f.log.sticks.length,count);
 f.input.cancel();assert.equal(f.input.sprint,false);assert.equal(f.floor.hasPointerCapture(1),false);assert.equal(f.stick.hidden,true);
 emit(f.floor,'pointerdown',{pointerId:3});emit(f.floor,'pointermove',{pointerId:3,clientX:130});assert.equal(f.log.sticks.at(-1).sprint,0);
});
test('floating base follows only beyond full sprint, bounds drift and reverses without interpolation lag',t=>{
 const f=fixture(1,true);t.after(()=>f.input.dispose());f.setMode('stick');emit(f.floor,'pointerdown');
 emit(f.floor,'pointermove',{clientX:212});assert.equal(f.stick.style.left,'100px');
 emit(f.floor,'pointermove',{clientX:230});let centre=Number.parseFloat(f.stick.style.left);
 assert.ok(centre>100&&centre<118,'base follows only part of the 18px excess');
 emit(f.floor,'pointermove',{clientX:400});centre=Number.parseFloat(f.stick.style.left);
 assert.ok(400-centre<=124,'a large thumb movement cannot leave the centre far behind');
 emit(f.floor,'pointermove',{clientX:centre-24});assert.ok(f.log.sticks.at(-1).vector.x<0,'direction responds to the current thumb position immediately');assert.equal(f.log.sticks.at(-1).sprint,0);
});
test('Shift and a held second-touch Sprint override fractional boost without stealing steering',t=>{
 const f=fixture(1,true);t.after(()=>f.input.dispose());f.setMode('stick');emit(f.floor,'pointerdown');emit(f.floor,'pointermove',{clientX:194});
 assert.equal(f.log.sticks.at(-1).sprint,.5);
 f.input.setSprintModifier(true);assert.equal(f.log.sticks.at(-1).sprint,1);
 f.input.setSprintModifier(false);assert.equal(f.log.sticks.at(-1).sprint,.5);
 emit(f.sprintButton,'pointerdown',{pointerId:2,isPrimary:false});assert.equal(f.log.sticks.at(-1).sprint,1);assert.equal(f.floor.hasPointerCapture(1),true);
 emit(f.sprintButton,'pointerup',{pointerId:2});assert.equal(f.log.sticks.at(-1).sprint,.5);
});
test('outer-ring sprint remains opt-in for rehearsal controls',t=>{
 const f=fixture();t.after(()=>f.input.dispose());f.setMode('stick');emit(f.floor,'pointerdown');emit(f.floor,'pointermove',{clientX:190});assert.equal(f.log.sticks.at(-1).sprint,false);
});
