import test from 'node:test';
import assert from 'node:assert/strict';
import {registerHooks} from 'node:module';
import {createGameControls,normalizeMovementPreferences} from '../src/game-controls.js';
import {createRound} from '../src/game.js';
registerHooks({resolve(s,c,next){return s==='phaser'?{url:'test:controls-phaser',shortCircuit:true}:next(s,c)},load(url,c,next){return url==='test:controls-phaser'?{format:'module',source:'export default {Scene: class {}}',shortCircuit:true}:next(url,c)}});
const {GameScene}=await import('../src/GameScene.js');

class Element extends EventTarget{
 constructor(doc){super();this.ownerDocument=doc;this.children=[];this.dataset={};this.style={setProperty(name,value){this[name]=value;}};this.attributes={};this.captured=new Set();}
 append(...elements){for(const child of elements){this.children.push(child);child.parentElement=this;}}
 remove(){this.parentElement.children=this.parentElement.children.filter(child=>child!==this);}
 querySelector(){return this.children.find(e=>Object.hasOwn(e.dataset,'stickKnob'));}
 setAttribute(key,value){this.attributes[key]=value;}
 setPointerCapture(id){this.captured.add(id);}
 hasPointerCapture(id){return this.captured.has(id);}
 releasePointerCapture(id){this.captured.delete(id);emit(this,'lostpointercapture',{pointerId:id});}
 closest(selector){for(let node=this;node;node=node.parentElement){if(selector==='#game'&&node.id==='game'||selector==='.shell'&&node.className==='shell')return node;}return null;}
 focus(){}
 matches(){return false;}
}
function emit(node,type,data={}){
 const event=new Event(type,{cancelable:true});
 for(const [key,value]of Object.entries({pointerId:1,clientX:100,clientY:200,button:0,pointerType:'touch',timeStamp:performance.now(),...data}))Object.defineProperty(event,key,{value});
 node.dispatchEvent(event);return event;
}
function fixture(mode='swipe'){
 const doc=new EventTarget();doc.createElement=()=>new Element(doc);doc.body=new Element(doc);
 const shell=new Element(doc),arena=new Element(doc),game=new Element(doc),canvas=new Element(doc);shell.className='shell';game.id='game';doc.body.append(shell);shell.append(arena);arena.append(game);game.append(canvas);
 const scene=new GameScene(),events=[];
 Object.assign(scene,{running:true,round:createRound(),controlPreferences:{mode,sensitivity:1},stage:{obstacles:[],mud:[]},dancer:{x:480,y:380},game:{canvas,events:{emit:(...args)=>events.push(args)}},input:{keyboard:{resetKeys(){}}},tweens:{pauseAll(){},resumeAll(){}}});
 const controls=createGameControls(scene);scene.gameControls=controls;
 const panel=arena.children.find(e=>e.className==='movement-controls'),sprint=panel.children.find(e=>e.className==='movement-sprint');
 return {scene,controls,doc,shell,arena,canvas,panel,sprint,events};
}
function tick(f,ms,keys={x:0,y:0}){for(let remaining=ms;remaining>0;remaining-=10)f.controls.move(Math.min(10,remaining),keys);}
function flick(f,x=160,y=200){emit(f.canvas,'pointerdown');emit(f.canvas,'pointermove',{clientX:x,clientY:y});emit(f.canvas,'pointerup',{clientX:x,clientY:y});}

test('movement preference validation keeps finite sensitivity and known modes',()=>{
 assert.deepEqual(normalizeMovementPreferences({mode:'bad',sensitivity:NaN}),{mode:'tap',sensitivity:1,hand:'left'});
 assert.equal(normalizeMovementPreferences({sensitivity:100}).sensitivity,1.6);assert.equal(normalizeMovementPreferences({sensitivity:-1}).sensitivity,.6);
});
test('scene movement resolver can push an idle player without recording driven speed',t=>{
 const f=fixture('stick');t.after(()=>f.controls.dispose());
 f.scene.resolveMovementStep=(p,d,ms)=>{p.x+=ms;return {drivenDistance:0};};
 f.controls.move(16);
 assert.equal(f.scene.dancer.x,496);assert.equal(f.controls.motion.actualSpeed,0);
 delete f.scene.resolveMovementStep;f.controls.move(16);assert.equal(f.scene.dancer.x,496);
});
test('floating stick stays inside the fullscreen game shell, uses viewport coordinates and cleans up',()=>{
 const f=fixture('stick');f.doc.fullscreenElement=f.shell;
 const stick=f.shell.children.find(node=>node.className==='movement-stick');
 try{
  assert.ok(stick,'stick must belong to the shell that SMF makes fullscreen');
  assert.equal(f.doc.body.children.some(node=>node.className==='movement-stick'),false);
  emit(f.canvas,'pointerdown',{clientX:420,clientY:610});
  assert.equal(stick.hidden,false);assert.equal(stick.style.left,'420px');assert.equal(stick.style.top,'610px');
 }finally{f.controls.dispose();}
 assert.equal(f.shell.children.some(node=>node.className==='movement-stick'),false);
 assert.equal(f.arena.children.some(node=>node.className==='movement-controls'),false);
 assert.equal(f.canvas.hasPointerCapture(1),false);
});
test('main-game completed swipe spends saved round stamina and reports touch',t=>{
 const f=fixture();t.after(()=>f.controls.dispose());flick(f);tick(f,200);
 assert.ok(f.scene.dancer.x>550);assert.ok(f.controls.motion.speed>300);assert.ok(f.scene.round.stamina<100);
 assert.ok(f.events.some(([name,p])=>name==='round:input'&&p.kind==='touch'));
 tick(f,400);const x=f.scene.dancer.x;tick(f,300);assert.equal(f.scene.dancer.x,x);
});
test('holding Sprint boosts a completed gentle swipe without extending its length-based duration',t=>{
 let clock=0;t.mock.method(performance,'now',()=>clock);
 const ordinary=fixture(),boosted=fixture();for(const f of [ordinary,boosted])t.after(()=>f.controls.dispose());
 emit(boosted.sprint,'pointerdown',{pointerId:2});
 for(const f of [ordinary,boosted]){emit(f.canvas,'pointerdown');clock+=60;emit(f.canvas,'pointermove',{clientX:118});assert.equal(f.controls.motion.requestedSpeed,0);emit(f.canvas,'pointerup',{clientX:118});}
 assert.equal(ordinary.controls.motion.requestedSpeed,300);assert.equal(ordinary.controls.motion.swipe.durationMs,300);
 assert.equal(boosted.controls.motion.requestedSpeed,480);assert.equal(boosted.controls.motion.swipe.durationMs,300);
 tick(boosted,100);const remaining=boosted.controls.motion.swipe.remainingMs;
 emit(boosted.canvas,'pointerup',{clientX:118});emit(boosted.sprint,'pointerup',{pointerId:2});
 assert.equal(boosted.controls.motion.swipe.remainingMs,remaining);
});
test('pause, preference changes and restored checkpoints preserve charge without replaying gestures',t=>{
 const f=fixture();t.after(()=>f.controls.dispose());flick(f);tick(f,200);const charge=f.scene.round.stamina;
 f.scene.pauseRound();assert.equal(f.panel.hidden,true);assert.equal(f.scene.round.stamina,charge);assert.equal(f.controls.motion.speed,0);
 f.scene.setControlPreferences({mode:'stick',sensitivity:1.6});assert.equal(f.scene.round.stamina,charge);
 f.scene.round={...f.scene.round,stamina:17};f.scene.resumeRound();assert.equal(f.controls.motion.stamina,17);assert.equal(f.panel.hidden,false);
 const p={...f.scene.dancer};tick(f,200);assert.deepEqual(f.scene.dancer,p);assert.ok(f.scene.round.stamina>17,'rest recovers only on active ticks');
});
test('tap destinations and keyboard share sprint, stamina exhaustion and attainable stopping',t=>{
 const f=fixture('tap');t.after(()=>f.controls.dispose());
 emit(f.sprint,'pointerdown',{pointerId:2});f.scene.target={x:800,y:380};tick(f,300);
 assert.ok(f.scene.dancer.x>550);assert.ok(f.controls.motion.speed>300);assert.ok(f.scene.round.stamina<100);
 emit(f.sprint,'pointerup',{pointerId:2});tick(f,2000);assert.equal(f.scene.target,null);assert.ok(Math.abs(f.scene.dancer.x-800)<1);
 f.scene.round.stamina=0;emit(f.doc,'keydown',{code:'ShiftLeft'});tick(f,300,{x:-1,y:0});
 assert.ok(f.controls.motion.speed<=300.01);assert.ok(f.scene.dancer.x<800,'empty stamina never strands the player');
 emit(f.doc,'keyup',{code:'ShiftLeft'});
});
test('Dizzy reverses swipe and keyboard during effects; speed candy and terrain still apply',t=>{
 const normal=fixture(),dizzy=fixture(),speed=fixture(),mud=fixture();for(const f of [normal,dizzy,speed,mud])t.after(()=>f.controls.dispose());
 dizzy.scene.round.mystery.effect='dizzy';dizzy.scene.round.mystery.effectMs=3000;
 speed.scene.round.mystery.effect='speed';speed.scene.round.mystery.effectMs=3000;
 mud.scene.stage.mud=[{x:0,y:0,width:960,height:640}];
 for(const f of [normal,dizzy,speed,mud]){flick(f);tick(f,100);}
 assert.ok(dizzy.scene.dancer.x<480);assert.ok(normal.scene.dancer.x>480);
 assert.ok(speed.scene.dancer.x>normal.scene.dancer.x);assert.ok(mud.scene.dancer.x<normal.scene.dancer.x);
 dizzy.scene.round.mystery.effectMs=0;dizzy.controls.cancel();tick(dizzy,100,{x:1,y:0});assert.ok(dizzy.controls.motion.heading.x>0);
});
test('putting or paused play does not capture movement pointers or expose sprint',t=>{
 const f=fixture('stick');t.after(()=>f.controls.dispose());f.scene.pauseRound();
 emit(f.canvas,'pointerdown');emit(f.canvas,'pointermove',{clientX:160});assert.equal(f.canvas.hasPointerCapture(1),false);assert.equal(f.controls.motion.speed,0);assert.equal(f.panel.hidden,true);
});
test('world-coordinate tapping remains correct under camera zoom and swipe suppresses destination taps',()=>{
 const scene=new GameScene(),canvas={};let focus=0;const prior=globalThis.document;globalThis.document={querySelector:()=>({focus(){focus++;}})};
 try{
  Object.assign(scene,{running:true,controlPreferences:{mode:'tap'},stage:{},dancer:{x:480,y:380},scale:{width:390,height:640},cameras:{main:{getWorldPoint:(x,y)=>({x:x+200,y:y+150})}},game:{canvas,events:{emit(){}}}});
  scene.pointTo({x:90,y:220,event:{target:canvas},wasTouch:true});assert.deepEqual(scene.target,{x:290,y:370});assert.equal(focus,1);
  scene.target=null;scene.cameras.main.getWorldPoint=()=>({x:-40,y:220});scene.pointTo({x:10,y:220,event:{target:canvas},wasTouch:true});assert.equal(scene.target,null,'blank overview bars are not destinations');
  scene.controlPreferences.mode='swipe';scene.target=null;scene.pointTo({x:90,y:220,event:{target:canvas},wasTouch:true});assert.equal(scene.target,null);
 }finally{globalThis.document=prior;}
});

test('one-thumb outer-ring sprint spends stamina, falls back to normal speed when empty and recovers inside',t=>{
 const f=fixture('stick');t.after(()=>f.controls.dispose());
 assert.equal(f.sprint.hidden,true,'thumbstick should not require another held sprint touch');
 emit(f.canvas,'pointerdown');emit(f.canvas,'pointermove',{clientX:194});tick(f,300);
 assert.ok(f.controls.motion.speed>300);assert.ok(f.scene.round.stamina<100);
 f.scene.round.stamina=0;tick(f,300);assert.ok(f.controls.motion.speed<=300.01);assert.equal(f.scene.round.stamina,0);
 const x=f.scene.dancer.x;tick(f,100);assert.ok(f.scene.dancer.x>x,'empty stamina never strands the steering thumb');
 emit(f.canvas,'pointermove',{clientX:149});tick(f,200);assert.ok(f.scene.round.stamina>0);
 emit(f.canvas,'pointerup',{clientX:149});tick(f,300);assert.equal(f.controls.motion.speed,0);
});
test('hand preferences mirror controller state, preserve charge and keep Shift sprint available in stick mode',t=>{
 const f=fixture('stick');t.after(()=>f.controls.dispose());f.scene.round.stamina=43;
 f.scene.setControlPreferences({mode:'stick',sensitivity:1,hand:'right'});
 assert.equal(f.panel.dataset.hand,'right');assert.equal(f.panel.dataset.mode,'stick');assert.equal(f.sprint.hidden,true);assert.equal(f.scene.round.stamina,43);
 emit(f.doc,'keydown',{code:'ShiftLeft'});tick(f,300,{x:1,y:0});assert.ok(f.controls.motion.speed>300);assert.ok(f.scene.round.stamina<43);
 f.scene.setControlPreferences({mode:'swipe',hand:'left'});assert.equal(f.panel.dataset.hand,'left');assert.equal(f.panel.dataset.mode,'swipe');assert.equal(f.sprint.hidden,false);assert.equal(f.controls.motion.speed,0);
 assert.equal(normalizeMovementPreferences({hand:'unknown'}).hand,'left');
});


test('main-game stick keeps normal steering stamina-free and adds speed progressively',t=>{
 const f=fixture('stick');t.after(()=>f.controls.dispose());
 emit(f.canvas,'pointerdown');emit(f.canvas,'pointermove',{clientX:160});tick(f,200);
 assert.equal(f.controls.motion.speed,300);assert.equal(f.scene.round.stamina,100);
 emit(f.canvas,'pointermove',{clientX:176});assert.equal(f.controls.motion.requestedSpeed,300);
 emit(f.canvas,'pointermove',{clientX:194});tick(f,100);assert.equal(f.controls.motion.speed,390);assert.ok(f.scene.round.stamina<100);
 emit(f.canvas,'pointermove',{clientX:212});tick(f,100);assert.equal(f.controls.motion.speed,480);
 const charge=f.scene.round.stamina;emit(f.canvas,'pointermove',{clientX:176});tick(f,200);
 assert.equal(f.controls.motion.speed,300);assert.ok(f.scene.round.stamina>charge);
});

test('held keyboard movement cancels a newly captured stick without inheriting its boost',t=>{
 const f=fixture('stick');t.after(()=>f.controls.dispose());const keys={x:1,y:0};
 tick(f,100,keys);emit(f.canvas,'pointerdown');emit(f.canvas,'pointermove',{clientX:185});
 assert.equal(f.controls.motion.requestedSpeed,328.125);assert.equal(f.canvas.hasPointerCapture(1),true);
 tick(f,10,keys);assert.equal(f.canvas.hasPointerCapture(1),false);assert.equal(f.controls.motion.requestedSpeed,300);
 const speed=f.controls.motion.speed;tick(f,10,keys);assert.ok(f.controls.motion.speed>speed,'uncontested keyboard frames must keep accelerating, not repeatedly reset');
 emit(f.doc,'keydown',{code:'ShiftLeft'});emit(f.canvas,'pointerdown',{pointerId:2});emit(f.canvas,'pointermove',{pointerId:2,clientX:185});
 tick(f,10,keys);assert.equal(f.canvas.hasPointerCapture(2),false);assert.equal(f.controls.motion.requestedSpeed,480,'keyboard takeover preserves held Shift');
});
