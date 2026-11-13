import test from 'node:test';
import assert from 'node:assert/strict';
import {CONTROL_MOTION,createMotion,commandSwipe,commandStick,brakeMotion,resetMotion,advanceMotion} from '../src/control-practice-motion.js';

const openArena={width:4000,height:2000,obstacles:[]};
const flick={dx:180,dy:0,durationMs:120};
function tick(state,position,ms,options={},frame=1000/60){
 for(let left=ms;left>1e-7;left-=Math.min(frame,left))advanceMotion(state,position,Math.min(frame,left),{arena:openArena,...options});
}

test('one recognized flick starts a finite burst that continues without held-finger movement',()=>{
 const state=createMotion(),p={x:500,y:500};
 assert.equal(commandSwipe(state,flick),true);assert.deepEqual(p,{x:500,y:500},'input cannot teleport the player');
 advanceMotion(state,p,16,{arena:openArena,staminaEnabled:false});assert.ok(p.x>500);assert.ok(state.speed>0&&state.speed<120);
 const afterRecognition=p.x;tick(state,p,200,{staminaEnabled:false});
 assert.ok(p.x>afterRecognition+65,'burst continues after lift without further input');
 assert.ok(state.swipe);assert.equal(state.target,null);
 tick(state,p,500,{staminaEnabled:false});assert.equal(state.speed,0);assert.equal(state.swipe,null);
 const stopped=p.x;tick(state,p,1000);assert.equal(p.x,stopped);assert.ok(p.x-500<260);
});

test('complete swipe length and velocity separately select bounded duration and speed',()=>{
 const gentle=createMotion(),strong=createMotion(),otherScale=createMotion();
 commandSwipe(gentle,{dx:18,dy:0,durationMs:60});commandSwipe(strong,flick);
 assert.equal(gentle.requestedSpeed,300);assert.equal(gentle.swipe.durationMs,300);
 assert.equal(strong.requestedSpeed,480);assert.equal(strong.swipe.durationMs,500);
 commandSwipe(otherScale,flick);
 assert.equal(otherScale.requestedSpeed,strong.requestedSpeed);assert.equal(otherScale.swipe.durationMs,strong.swipe.durationMs);
 const longer=createMotion();commandSwipe(longer,{dx:36,dy:0,durationMs:120});
 assert.ok(longer.swipe.durationMs>gentle.swipe.durationMs,'a longer completed swipe at the same velocity drives the burst longer');
 assert.equal(longer.requestedSpeed,gentle.requestedSpeed);
 const shortPosition={x:500,y:500},longPosition={...shortPosition};
 tick(gentle,shortPosition,700,{staminaEnabled:false});tick(longer,longPosition,700,{staminaEnabled:false});
 assert.ok(longPosition.x>shortPosition.x);
});

test('quicker completed swipes of the same length move faster without changing driven duration',()=>{
 const quick=createMotion(),gentle=createMotion();
 commandSwipe(quick,{dx:90,dy:0,durationMs:60});commandSwipe(gentle,{dx:90,dy:0,durationMs:120});
 assert.ok(quick.requestedSpeed>gentle.requestedSpeed);assert.equal(quick.swipe.durationMs,gentle.swipe.durationMs);
 const a={x:500,y:500},b={...a};tick(quick,a,700,{staminaEnabled:false});tick(gentle,b,700,{staminaEnabled:false});assert.ok(a.x>b.x);
});

test('swipe direction and response are independent of player position and screen contact location',()=>{
 const a=createMotion(),b=createMotion(),near={x:500,y:500},far={x:2000,y:1000};
 commandSwipe(a,{dx:-70,dy:70,durationMs:100});commandSwipe(b,{dx:-70,dy:70,durationMs:100});
 assert.deepEqual(a.heading,b.heading);assert.ok(a.heading.x<0&&a.heading.y>0);
 tick(a,near,700,{staminaEnabled:false});tick(b,far,700,{staminaEnabled:false});
 assert.ok(Math.abs((near.x-500)-(far.x-2000))<1e-8);assert.ok(Math.abs((near.y-500)-(far.y-1000))<1e-8);
});

test('sensitivity scales completed stroke length and velocity while Sprint only overrides speed',()=>{
 const normal=createMotion(),sensitive=createMotion(),sprint=createMotion(),stroke={dx:60,dy:0,durationMs:100};
 commandSwipe(normal,stroke);commandSwipe(sensitive,stroke,{sensitivity:1.6});commandSwipe(sprint,stroke,{sprint:true});
 assert.ok(sensitive.swipe.durationMs>normal.swipe.durationMs);assert.ok(sensitive.requestedSpeed>normal.requestedSpeed);
 assert.equal(sprint.requestedSpeed,480);assert.equal(sprint.swipe.durationMs,normal.swipe.durationMs,'Sprint does not turn a short stroke into the longest possible burst');
});

test('flicks ramp up quickly and ease down for a short glide after the driven interval',()=>{
 const state=createMotion(),p={x:500,y:500};commandSwipe(state,flick);
 tick(state,p,40,{staminaEnabled:false});assert.ok(state.speed>200&&state.speed<300);
 tick(state,p,40,{staminaEnabled:false});assert.equal(state.speed,480);
 tick(state,p,420,{staminaEnabled:false});assert.equal(state.swipe,null);assert.equal(state.speed,480);
 const glideStart=p.x;tick(state,p,60,{staminaEnabled:false});assert.ok(state.speed>200&&state.speed<280);assert.ok(p.x>glideStart);
 tick(state,p,70,{staminaEnabled:false});assert.equal(state.speed,0);assert.ok(p.x-glideStart<30);
});

test('another flick replaces the direction and timer without queuing or adding velocity',()=>{
 const state=createMotion(),p={x:500,y:500};commandSwipe(state,flick);tick(state,p,200,{staminaEnabled:false});
 const turn={...p};commandSwipe(state,{dx:0,dy:120,durationMs:80});tick(state,p,100,{staminaEnabled:false});
 assert.equal(p.x,turn.x);assert.ok(p.y>turn.y);assert.equal(state.speed,480);
 commandSwipe(state,{dx:0,dy:-18,durationMs:60});assert.equal(state.swipe.durationMs,300);assert.equal(state.requestedSpeed,300);
 const reverse={...p};tick(state,p,100,{staminaEnabled:false});assert.equal(p.x,reverse.x);assert.ok(p.y<reverse.y);
 tick(state,p,600,{staminaEnabled:false});assert.equal(state.speed,0);assert.equal(state.swipe,null);
});

test('explicit tap braking shortens a burst instead of abruptly stopping',()=>{
 const state=createMotion(),p={x:500,y:500};commandSwipe(state,flick);tick(state,p,150,{staminaEnabled:false});
 const before=p.x;brakeMotion(state);assert.equal(state.swipe,null);assert.equal(state.requestedSpeed,0);
 tick(state,p,16,{staminaEnabled:false});assert.ok(p.x>before);assert.ok(state.speed>0&&state.speed<480);
 tick(state,p,150,{staminaEnabled:false});assert.equal(state.speed,0);assert.ok(p.x-before<30);
});

test('malformed and empty gestures cannot create or corrupt a burst',()=>{
 const state=createMotion();
 for(const change of [{dx:NaN,dy:1,durationMs:8},{dx:1,dy:1,durationMs:0},{dx:1,dy:Infinity,durationMs:8},{dx:0,dy:0,durationMs:20}])assert.equal(commandSwipe(state,change),false);
 assert.equal(state.speed,0);assert.equal(state.swipe,null);
 commandSwipe(state,{dx:100000,dy:100000,durationMs:1});assert.equal(state.requestedSpeed,480);assert.equal(state.swipe.durationMs,500);
});

test('empty stamina permits ordinary bursts and stamina-off permits full speed',()=>{
 const limited=createMotion(),unlimited=createMotion(),p={x:500,y:500},q={...p};limited.stamina=0;unlimited.stamina=0;
 commandSwipe(limited,flick);commandSwipe(unlimited,flick);tick(limited,p,300);tick(unlimited,q,300,{staminaEnabled:false});
 assert.equal(limited.speed,300);assert.equal(limited.stamina,0);assert.ok(p.x>575);
 assert.equal(unlimited.speed,480);assert.equal(unlimited.stamina,0);assert.ok(q.x>p.x);
 tick(limited,p,400);assert.equal(limited.speed,0);assert.ok(limited.stamina>0,'charge recovers once the burst ends');
});

test('only extra burst speed spends stamina; repeated flicks obey the same cap',()=>{
 const slow=createMotion(),fast=createMotion(),p={x:500,y:500},q={...p};slow.stamina=50;fast.stamina=50;
 commandSwipe(slow,{dx:18,dy:0,durationMs:60});commandSwipe(fast,flick);tick(slow,p,250);tick(fast,q,250);
 assert.ok(slow.stamina>50);assert.ok(fast.stamina<50);
 for(let i=0;i<20;i++){commandSwipe(fast,flick);tick(fast,q,16);assert.ok(fast.speed<=480);assert.ok(fast.stamina>=0&&fast.stamina<=100);}
});

test('terrain slows the finite burst without extending it or storing travel for later',()=>{
 const state=createMotion(),p={x:500,y:500};commandSwipe(state,flick);tick(state,p,700,{terrainFactor:.2,staminaEnabled:false});
 assert.ok(p.x-500<52);assert.equal(state.swipe,null);assert.equal(state.speed,0);
 const before={...p};tick(state,p,1000,{terrainFactor:1});assert.deepEqual(p,before);
});

test('bursts cannot tunnel into obstacles or beyond arena edges and blocked motion ends',()=>{
 const state=createMotion(),p={x:500,y:500},arena={...openArena,obstacles:[{x:550,y:400,width:100,height:200}]};
 commandSwipe(state,flick);tick(state,p,700,{arena,staminaEnabled:false});assert.ok(p.x<=536);assert.equal(state.swipe,null);assert.equal(state.speed,0);
 const before={...p};tick(state,p,500,{arena});assert.deepEqual(p,before);
 const edge={x:940,y:300},edgeState=createMotion();commandSwipe(edgeState,flick);tick(edgeState,edge,700,{arena:{width:960,height:640},staminaEnabled:false});assert.equal(edge.x,946);assert.equal(edgeState.speed,0);
});

test('burst travel and resource cost remain similar at 30, 60 and 120Hz',()=>{
 const samples=[1000/30,1000/60,1000/120].map(frame=>{
  const state=createMotion(),p={x:500,y:500};commandSwipe(state,{dx:65,dy:0,durationMs:85});tick(state,p,700,{},frame);assert.equal(state.speed,0);return {x:p.x,stamina:state.stamina};
 });
 assert.ok(Math.max(...samples.map(s=>s.x))-Math.min(...samples.map(s=>s.x))<1,JSON.stringify(samples));
 assert.ok(Math.max(...samples.map(s=>s.stamina))-Math.min(...samples.map(s=>s.stamina))<.1,JSON.stringify(samples));
});

test('thumbstick stamina only pays for extra speed and empty stamina permits ordinary movement',()=>{
 const state=createMotion(),p={x:500,y:500};state.stamina=0;
 commandStick(state,{x:1,y:0},true);tick(state,p,1000);
 assert.equal(state.speed,300);assert.equal(state.stamina,0,'held sprint cannot alternate regen and spending');
 const before=p.x;tick(state,p,100);assert.ok(p.x-before>29);
 commandStick(state,{x:1,y:0});tick(state,p,500);assert.ok(state.stamina>9);
 const stored=state.stamina;commandStick(state,{x:1,y:0},true);tick(state,p,500);
 assert.ok(state.speed>300);assert.ok(state.stamina<stored);
});

test('thumbstick stamina-off keeps sprint available without changing stored charge',()=>{
 const state=createMotion(),p={x:500,y:500};state.stamina=0;
 commandStick(state,{x:1,y:0},true);tick(state,p,1000,{staminaEnabled:false});
 assert.equal(state.speed,480);assert.equal(state.stamina,0);
});

test('reset stops a burst immediately and preserves charge unless explicitly refilling',()=>{
 const state=createMotion(),p={x:500,y:500};state.stamina=34;commandSwipe(state,flick);tick(state,p,200);const charge=state.stamina;
 resetMotion(state);assert.equal(state.speed,0);assert.equal(state.stamina,charge);assert.equal(state.swipe,null);
 assert.equal(state.stick,null);assert.equal(state.target,null);
 resetMotion(state,{refill:true});assert.equal(state.stamina,100);
});

test('thumbstick motion remains similar across frame rates and caps background-tab deltas',()=>{
 const samples=[1000/30,1000/60,1000/120].map(frame=>{
  const state=createMotion(),p={x:500,y:500};commandStick(state,{x:1,y:0},true);tick(state,p,1500,{},frame);return {x:p.x,stamina:state.stamina};
 });
 assert.ok(Math.max(...samples.map(s=>s.x))-Math.min(...samples.map(s=>s.x))<1);
 assert.ok(Math.max(...samples.map(s=>s.stamina))-Math.min(...samples.map(s=>s.stamina))<.1);
 const state=createMotion(),p={x:500,y:500};commandStick(state,{x:1,y:0},true);
 advanceMotion(state,p,60000,{arena:openArena});assert.ok(p.x-500<5);
 assert.equal(CONTROL_MOTION.swipeMaxDuration,500);
});

test('diagonal thumbstick stays normalized and zero input keeps its existing glide',()=>{
 const state=createMotion(),p={x:500,y:500};commandStick(state,{x:10,y:10},true);
 tick(state,p,500,{staminaEnabled:false});assert.equal(state.speed,480);assert.ok(Math.abs(p.x-p.y)<1e-8);
 commandStick(state,{x:0,y:0});tick(state,p,16);assert.ok(state.speed>0);tick(state,p,500);assert.equal(state.speed,0);
});


test('numeric thumbstick boost gives intermediate speed and proportional stamina cost',()=>{
 const partial=createMotion(),full=createMotion(),a={x:500,y:500},b={...a};
 partial.stamina=80;full.stamina=80;
 commandStick(partial,{x:1,y:0},.5);commandStick(full,{x:1,y:0},true);
 assert.equal(partial.requestedSpeed,390);assert.equal(full.requestedSpeed,480);
 partial.speed=390;full.speed=480;tick(partial,a,1000);tick(full,b,1000);
 assert.ok(Math.abs(partial.stamina-67.5)<1e-8);assert.ok(Math.abs(full.stamina-55)<1e-8);
 const charge=partial.stamina;commandStick(partial,{x:1,y:0},0);tick(partial,a,300);
 assert.equal(partial.speed,300);assert.ok(partial.stamina>charge,'returning to normal movement replenishes stamina after decelerating');
});
test('numeric thumbstick boost clamps safely and empty stamina still allows normal travel',()=>{
 const state=createMotion(),p={x:500,y:500};state.stamina=0;
 commandStick(state,{x:1,y:0},.5);tick(state,p,400);assert.equal(state.speed,300);assert.equal(state.stamina,0);assert.ok(p.x>580);
 commandStick(state,{x:1,y:0},5);assert.equal(state.requestedSpeed,480);
 for(const boost of [-1,NaN,Infinity,false]){commandStick(state,{x:1,y:0},boost);assert.equal(state.requestedSpeed,300);}
 commandStick(state,{x:1,y:0},true);assert.equal(state.requestedSpeed,480);
});
