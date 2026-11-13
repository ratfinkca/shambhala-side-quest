import test from 'node:test';
import assert from 'node:assert/strict';
import {bindActionButton} from '../src/action-button.js';
import {bindControlInput} from '../src/movement-input.js';
import {activationInput} from '../src/bass-view.js';

class Surface extends EventTarget {
 constructor(){super();this.disabled=false;this.hidden=false;this.style={setProperty(name,value){this[name]=value;}};this.knob={style:{}};this.captured=new Set();this.rect={left:300,right:380,top:500,bottom:580};}
 querySelector(){return this.knob;}
 setAttribute(){}
 getBoundingClientRect(){return this.rect;}
 setPointerCapture(id){this.captured.add(id);}
 hasPointerCapture(id){return this.captured.has(id);}
 releasePointerCapture(id){this.captured.delete(id);emit(this,'lostpointercapture',{pointerId:id});}
}
function emit(surface,type,properties={}){
 const event=new Event(type,{bubbles:true,cancelable:true});let stopped=false;
 for(const [key,value]of Object.entries({pointerId:2,pointerType:'touch',button:0,isPrimary:false,clientX:340,clientY:540,detail:0,...properties}))Object.defineProperty(event,key,{value});
 for(const name of ['stopPropagation','stopImmediatePropagation']){const stop=event[name].bind(event);event[name]=()=>{stopped=true;stop();};}
 surface.dispatchEvent(event);
 if(!stopped)surface.delegate?.(event);
 return event;
}
function setup(t){
 const button=new Surface(),activations=[],delegated=[];let enabled=true;
 button.delegate=event=>{if(['pointerdown','pointerup','click'].includes(event.type))delegated.push(event.type);};
 const action=bindActionButton(button,{isEnabled:()=>enabled,onActivate:event=>activations.push(event)});
 t.after(()=>action.dispose());
 return {button,action,activations,delegated,setEnabled:value=>enabled=value};
}

test('secondary touch activates on its own release and keeps the pointer input identity',t=>{
 const f=setup(t),down=emit(f.button,'pointerdown');
 assert.equal(f.activations.length,0);assert.equal(f.button.hasPointerCapture(2),true);assert.equal(down.defaultPrevented,true);
 const up=emit(f.button,'pointerup');
 assert.equal(f.activations.length,1);assert.equal(f.button.hasPointerCapture(2),false);assert.equal(up.defaultPrevented,true);
 assert.equal(f.activations[0].pointerId,2);assert.equal(f.activations[0].originalEvent,up);
 assert.equal(activationInput(f.activations[0]),'touch');assert.deepEqual(f.delegated,[]);
});

test('a second action touch cannot replace or release the owned touch',t=>{
 const f=setup(t);emit(f.button,'pointerdown');
 emit(f.button,'pointerdown',{pointerId:3});emit(f.button,'pointerup',{pointerId:3});
 assert.equal(f.activations.length,0);assert.equal(f.button.hasPointerCapture(2),true);assert.equal(f.button.hasPointerCapture(3),false);
 emit(f.button,'pointerup');assert.equal(f.activations.length,1);
});

test('Bass touch release leaves the held movement finger steering',t=>{
 const f=setup(t),floor=new Surface(),stick=new Surface(),vectors=[],brakes=[];
 const movement=bindControlInput({surfaces:[floor],stick,isPlaying:()=>true,getMode:()=> 'stick',onSwipe(){},onStick:vector=>vectors.push(vector),onBrake:value=>brakes.push(value),onFocus(){}});
 t.after(()=>movement.dispose());
 emit(floor,'pointerdown',{pointerId:1,isPrimary:true,clientX:100,clientY:200});
 emit(floor,'pointermove',{pointerId:1,isPrimary:true,clientX:130,clientY:200});
 assert.ok(vectors.at(-1).x>0);
 emit(f.button,'pointerdown');emit(f.button,'pointerup');
 assert.equal(f.activations.length,1);assert.equal(floor.hasPointerCapture(1),true);assert.deepEqual(brakes,[]);
 emit(floor,'pointermove',{pointerId:1,isPrimary:true,clientX:90,clientY:200});
 assert.ok(vectors.at(-1).x<0,'the original steering finger still controls direction');
 emit(floor,'pointerup',{pointerId:1,isPrimary:true,clientX:90,clientY:200});assert.deepEqual(brakes,[false]);
});

for(const cancellation of ['cancel','pointercancel','lostpointercapture'])test(`${cancellation} prevents a stale release or click from activating`,t=>{
 const f=setup(t);emit(f.button,'pointerdown');
 if(cancellation==='cancel')f.action.cancel();else emit(f.button,cancellation);
 assert.equal(f.button.hasPointerCapture(2),false);
 emit(f.button,'pointerup');emit(f.button,'click',{detail:1});
 assert.equal(f.activations.length,0);assert.ok(!f.delegated.includes('click'));
 emit(f.button,'pointerdown');emit(f.button,'pointerup');assert.equal(f.activations.length,1,'a fresh touch works after cancellation');
});

test('releasing outside the current button bounds cancels the action',t=>{
 const f=setup(t);emit(f.button,'pointerdown');
 emit(f.button,'pointerup',{clientX:400});emit(f.button,'click',{detail:1});
 assert.equal(f.activations.length,0);assert.equal(f.button.hasPointerCapture(2),false);
});

test('disabled at press or release cannot spend a newly available charge',t=>{
 const f=setup(t);f.setEnabled(false);emit(f.button,'pointerdown');f.setEnabled(true);emit(f.button,'pointerup');
 assert.equal(f.activations.length,0);
 emit(f.button,'pointerdown');f.setEnabled(false);emit(f.button,'pointerup');assert.equal(f.activations.length,0);
 f.setEnabled(true);f.button.disabled=true;emit(f.button,'pointerdown');emit(f.button,'pointerup');assert.equal(f.activations.length,0);
 f.button.disabled=false;f.button.hidden=true;emit(f.button,'pointerdown');emit(f.button,'pointerup');assert.equal(f.activations.length,0);
});

test('pointer click duplicates are consumed while keyboard and assistive clicks activate once',t=>{
 const f=setup(t);emit(f.button,'pointerdown');emit(f.button,'pointerup');
 for(const properties of [{detail:1},{detail:0,pointerType:'touch'},{detail:1,pointerType:undefined}])emit(f.button,'click',properties);
 assert.equal(f.activations.length,1);assert.ok(!f.delegated.includes('click'));
 const keyboard=emit(f.button,'click',{detail:0,pointerType:''});
 assert.equal(f.activations.length,2);assert.equal(f.activations[1],keyboard);assert.equal(activationInput(keyboard),'keyboard');
 emit(f.button,'click',{detail:0,pointerType:undefined});assert.equal(f.activations.length,3);assert.ok(!f.delegated.includes('click'));
 f.setEnabled(false);emit(f.button,'click',{detail:0,pointerType:''});assert.equal(f.activations.length,3);
});

test('mouse clicks use the same release semantics and ignore other mouse buttons',t=>{
 const f=setup(t);emit(f.button,'pointerdown',{pointerType:'mouse',button:2});emit(f.button,'pointerup',{pointerType:'mouse',button:2});assert.equal(f.activations.length,0);
 emit(f.button,'pointerdown',{pointerType:'mouse'});emit(f.button,'pointerup',{pointerType:'mouse'});
 emit(f.button,'click',{pointerType:'mouse',detail:1});assert.equal(f.activations.length,1);assert.equal(activationInput(f.activations[0]),'mouse');
});

test('dispose releases capture and removes every listener without activating',t=>{
 const f=setup(t);emit(f.button,'pointerdown');f.action.dispose();
 assert.equal(f.button.hasPointerCapture(2),false);
 emit(f.button,'pointerup');emit(f.button,'pointerdown');emit(f.button,'pointerup');emit(f.button,'click',{detail:0,pointerType:''});
 assert.equal(f.activations.length,0);assert.equal(f.button.hasPointerCapture(2),false);assert.ok(f.delegated.includes('click'));
 f.action.cancel();f.action.dispose();
});
