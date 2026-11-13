import test from 'node:test';
import assert from 'node:assert/strict';
import {bindControlInput} from '../src/control-practice-input.js';
import {createMotion,commandSwipe,commandStick,brakeMotion,resetMotion,advanceMotion} from '../src/control-practice-motion.js';

class Surface extends EventTarget{
 constructor(){super();this.style={};this.hidden=true;this.captures=new Set();this.knob={style:{}};}
 setPointerCapture(id){this.captures.add(id);}
 hasPointerCapture(id){return this.captures.has(id);}
 releasePointerCapture(id){this.captures.delete(id);}
 setAttribute(){}
 querySelector(){return this.knob;}
}
function event(surface,type,x,y){
 const value=new Event(type,{cancelable:true});
 for(const [key,data] of Object.entries({pointerId:1,button:0,pointerType:'touch',clientX:x,clientY:y,timeStamp:surface.clock()}))Object.defineProperty(value,key,{value:data});
 surface.dispatchEvent(value);
}
function setup(t){
 let clock=100,playing=true,bursts=0;
 const arena={width:2000,height:1000,obstacles:[]},position={x:500,y:500},motion=createMotion(),floor=new Surface();
 floor.clock=()=>clock;
 const input=bindControlInput({surfaces:[floor],stick:new Surface(),sprintButton:new Surface(),isPlaying:()=>playing,getMode:()=> 'swipe',now:()=>clock,
  onSwipe:gesture=>{bursts++;commandSwipe(motion,gesture);},onStick:(vector,sprint)=>commandStick(motion,vector,sprint),
  onBrake:immediate=>immediate?resetMotion(motion):brakeMotion(motion),onFocus(){}});
 t.after(()=>input.dispose());
 function advance(ms){for(let left=ms;left>0;){const dt=Math.min(10,left);left-=dt;clock+=dt;if(playing)advanceMotion(motion,position,dt,{arena,staminaEnabled:false});}}
 return {floor,input,position,motion,advance,get bursts(){return bursts;},pause(){playing=false;input.cancel();},resume(){playing=true;}};
}

test('a completed swipe starts one finite burst on lift, with no direct dragging',t=>{
 const f=setup(t);event(f.floor,'pointerdown',100,200);
 f.advance(20);event(f.floor,'pointermove',110,200);assert.equal(f.bursts,0);assert.equal(f.position.x,500);
 f.advance(20);event(f.floor,'pointermove',128,200);assert.equal(f.bursts,0);
 f.advance(50);event(f.floor,'pointermove',160,200);assert.equal(f.position.x,500,'a partial stroke is not movement');
 f.advance(20);event(f.floor,'pointerup',180,200);assert.equal(f.bursts,1);assert.ok(f.motion.requestedSpeed>0);
 event(f.floor,'pointermove',100,400);assert.equal(f.motion.heading.y,0,'movement after release is ignored');
 f.advance(700);assert.equal(f.motion.speed,0);assert.ok(f.position.x>570&&f.position.x<750);assert.equal(f.position.y,500);
 const stopped={...f.position};f.advance(500);assert.deepEqual(f.position,stopped);
});

test('screen-space direction is independent of finger location and player position',t=>{
 for(const [dx,dy]of [[80,0],[-80,0],[0,-80],[0,80],[80,-21.44]]){
  for(const [px,py,sx,sy]of [[500,500,50,50],[1000,400,1400,800]]){
   const f=setup(t);Object.assign(f.position,{x:px,y:py});
   event(f.floor,'pointerdown',sx,sy);f.advance(50);event(f.floor,'pointermove',sx+dx/2,sy+dy/2);
   f.advance(50);event(f.floor,'pointerup',sx+dx,sy+dy);f.advance(700);
   const x=f.position.x-px,y=f.position.y-py,length=Math.hypot(x,y),stroke=Math.hypot(dx,dy);
   assert.ok(length>0);assert.ok(Math.abs(x/length-dx/stroke)<1e-10);assert.ok(Math.abs(y/length-dy/stroke)<1e-10);
  }
 }
});

test('the complete gesture produces the same trip with sparse or dense pointer delivery',t=>{
 const sparse=setup(t),dense=setup(t);
 for(const f of [sparse,dense])event(f.floor,'pointerdown',100,200);
 sparse.advance(100);event(sparse.floor,'pointerup',180,160);
 for(let i=1;i<=20;i++){dense.advance(5);event(dense.floor,'pointermove',100+i*4,200-i*2);}
 event(dense.floor,'pointerup',180,160);
 for(const f of [sparse,dense])f.advance(700);
 assert.deepEqual(sparse.position,dense.position);assert.equal(sparse.bursts,1);assert.equal(dense.bursts,1);
});

test('a mid-stroke hesitation never launches a burst even after a fast finish',t=>{
 const f=setup(t);event(f.floor,'pointerdown',100,200);f.advance(30);event(f.floor,'pointermove',140,200);
 f.advance(150);event(f.floor,'pointermove',220,200);event(f.floor,'pointerup',220,200);f.advance(700);
 assert.equal(f.bursts,0);assert.deepEqual(f.position,{x:500,y:500});
});

test('slow dragging and holding a finger never move a resting player',t=>{
 const f=setup(t);event(f.floor,'pointerdown',100,200);
 for(let i=1;i<=20;i++){f.advance(60);event(f.floor,'pointermove',100+i*4,200);}
 event(f.floor,'pointerup',180,200);f.advance(700);assert.equal(f.bursts,0);assert.deepEqual(f.position,{x:500,y:500});
 event(f.floor,'pointerdown',100,200);f.advance(400);event(f.floor,'pointermove',200,200);event(f.floor,'pointerup',200,200);f.advance(700);
 assert.equal(f.bursts,0);assert.deepEqual(f.position,{x:500,y:500});
});

test('lifting permits a fresh directional swipe to replace the previous burst',t=>{
 const f=setup(t);event(f.floor,'pointerdown',100,200);f.advance(40);event(f.floor,'pointermove',130,200);event(f.floor,'pointerup',130,200);f.advance(80);
 const turn={...f.position};event(f.floor,'pointerdown',300,300);f.advance(40);event(f.floor,'pointermove',300,330);event(f.floor,'pointerup',300,330);
 const x=f.position.x;f.advance(700);assert.equal(f.bursts,2);assert.equal(f.position.x,x);assert.ok(f.position.y>turn.y);assert.equal(f.motion.speed,0);
});

test('tap brakes a burst and pause clears a gesture without replay on resume',t=>{
 const f=setup(t);event(f.floor,'pointerdown',100,200);f.advance(40);event(f.floor,'pointermove',130,200);event(f.floor,'pointerup',130,200);f.advance(80);
 event(f.floor,'pointerdown',100,200);f.advance(20);event(f.floor,'pointerup',100,200);f.advance(200);assert.equal(f.motion.speed,0);
 event(f.floor,'pointerdown',100,200);f.advance(20);event(f.floor,'pointermove',109,200);f.pause();const stopped={...f.position};
 f.resume();event(f.floor,'pointerup',300,200);f.advance(700);assert.deepEqual(f.position,stopped);
});
