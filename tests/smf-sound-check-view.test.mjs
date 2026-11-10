import test from 'node:test';
import assert from 'node:assert/strict';
import {mountSoundCheck} from '../src/editions/smf-sound-check-view.js';

class Node {
 listeners=[];
 addEventListener(type,listener,capture=false){this.listeners.push({type,listener,capture});}
 removeEventListener(type,listener,capture=false){this.listeners=this.listeners.filter(entry=>entry.type!==type||entry.listener!==listener||entry.capture!==capture);}
 emit(type,details={}){
  const event={target:this,currentTarget:this,defaultPrevented:false,preventDefault(){this.defaultPrevented=true;},...details};
  for(const entry of this.listeners.filter(entry=>entry.type===type).sort((a,b)=>Number(b.capture)-Number(a.capture)))entry.listener(event);
  return event;
 }
 matches(){return false;}
}

function fixture(){
 const document=new Node(),panel=new Node(),player=new Node(),buttons=[new Node(),new Node()];
 const controls=Object.fromEntries(['#clock-lab-select','#clock-start','#clock-pause','#clock-sound'].map(id=>[id,new Node()]));
 let pauseCount=0,loadCount=0,removed=false;
 player.pause=()=>{pauseCount++;};player.load=()=>{loadCount++;};player.removeAttribute=name=>{delete player[name];};
 panel.querySelectorAll=()=>buttons;
 panel.querySelector=selector=>selector==='audio'?player:selector==='a'?{}:{dataset:{}};
 panel.remove=()=>{removed=true;};document.createElement=()=>panel;
 const root={append(){},querySelector:selector=>controls[selector]};
 return {document,panel,player,buttons,controls,root,get pauseCount(){return pauseCount;},get loadCount(){return loadCount;},get removed(){return removed;}};
}

test('comparison playback pauses the lab and stops on controls, hiding, and cleanup',()=>{
 const previous=globalThis.document,f=fixture();globalThis.document=f.document;let labPauses=0;
 try{
  const dispose=mountSoundCheck(f.root,{getStage:()=>({}),pause:()=>{labPauses++;}});
  f.player.emit('play');assert.equal(labPauses,1);
  for(const id of ['#clock-start','#clock-pause','#clock-sound'])f.controls[id].emit('click');
  f.controls['#clock-lab-select'].emit('change');assert.equal(f.pauseCount,4);
  f.document.hidden=false;f.document.emit('visibilitychange');assert.equal(f.pauseCount,4);
  f.document.hidden=true;f.document.emit('visibilitychange');assert.equal(f.pauseCount,5);
  f.player.src='prepared-clip';dispose();
  assert.equal(f.pauseCount,6);assert.equal(f.loadCount,1);assert.equal(f.player.src,undefined);assert.equal(f.removed,true);
  for(const node of [f.document,f.player,...f.buttons,...Object.values(f.controls)])assert.equal(node.listeners.length,0);
  f.player.emit('play');f.controls['#clock-pause'].emit('click');f.document.emit('keydown',{code:'Escape'});
  assert.equal(labPauses,1);assert.equal(f.pauseCount,6);
 }finally{globalThis.document=previous;}
});

test('Escape stops the clip before clock resume consumes it, excluding repeated, handled, and form keys',()=>{
 const previous=globalThis.document,f=fixture();globalThis.document=f.document;let resumes=0;
 const clockKeydown=event=>{if(event.code==='Escape'&&!event.repeat&&!event.target.matches('select,input,textarea')){assert.equal(f.pauseCount,1);event.preventDefault();resumes++;}};
 // The clock installs its bubble listener before mounting Sound Check.
 f.document.addEventListener('keydown',clockKeydown);
 try{
  const dispose=mountSoundCheck(f.root,{getStage:()=>({}),pause(){}});
  const event=f.document.emit('keydown',{code:'Escape',repeat:false});
  assert.equal(resumes,1);assert.equal(event.defaultPrevented,true);assert.equal(f.pauseCount,1);
  f.document.removeEventListener('keydown',clockKeydown);
  f.document.emit('keydown',{code:'Escape',repeat:true});
  f.document.emit('keydown',{code:'Escape',defaultPrevented:true});
  f.document.emit('keydown',{code:'KeyB'});
  for(const tag of ['select','input','textarea'])f.document.emit('keydown',{code:'Escape',target:{matches:selector=>selector.split(',').includes(tag)}});
  assert.equal(f.pauseCount,1);
  dispose();assert.equal(f.document.listeners.length,0);
 }finally{globalThis.document=previous;}
});
