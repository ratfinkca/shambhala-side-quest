import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import {createMenuAmbience} from '../src/menu-ambience.js';
test('menu audio waits for gesture, suspends hidden, and never stops gameplay on a later refresh',async()=>{
 const doc=new EventTarget();doc.hidden=false;let menu=true,enabled=true,callback=null,stops=0,voices=0;
 const audio={setEnabled:async()=>enabled,setVolumes(){},syncMenu(){voices++;},stop(){stops++;}};
 const music=createMenuAmbience(audio,{document:doc,isMenu:()=>menu,settings:()=>({enabled}),requestFrame:fn=>(callback=fn,1),cancelFrame:()=>{callback=null;}});
 music.refresh();assert.equal(callback,null);
 music.unlock();await Promise.resolve();callback(1);assert.equal(voices,1);
 doc.hidden=true;doc.dispatchEvent(new Event('visibilitychange'));assert.equal(callback,null);assert.equal(stops,1);
 doc.hidden=false;doc.dispatchEvent(new Event('visibilitychange'));assert.equal(typeof callback,'function');
 menu=false;music.refresh();const before=stops;music.refresh();assert.equal(stops,before);assert.equal(callback,null);
 menu=true;enabled=false;music.refresh();assert.equal(callback,null);
 music.dispose();doc.dispatchEvent(new Event('pointerdown'));await Promise.resolve();assert.equal(callback,null);
});

test('SMF sound checkbox restarts menu music after the muted pointerdown finishes',async()=>{
 const doc=new EventTarget();doc.hidden=false;
 const profile={audio:{enabled:true,music:.3,effects:.6}};
 let callback=null,audioEnabled=false,voices=0,persisted=0,change;
 const audio={
  async setEnabled(value){audioEnabled=value;return value;},
  setVolumes(){},
  syncMenu(){if(audioEnabled)voices++;},
  stop(){},
 };
 const music=createMenuAmbience(audio,{document:doc,isMenu:()=>true,settings:()=>profile.audio,requestFrame:fn=>(callback=fn,1),cancelFrame:()=>{callback=null;}});
 // Execute the real checkbox handler without booting the Phaser application.
 const entry=readFileSync(new URL('../src/smf-tour/entry.js',import.meta.url),'utf8');
 const changeHandler=entry.match(/root\.addEventListener\('change',e=>\{[\s\S]*?\n\}\);/)?.[0];
 assert.ok(changeHandler,'SMF settings change handler is present');
 runInNewContext(changeHandler,{
  root:{addEventListener(_event,handler){change=handler;}},
  profile,audio,menuAmbience:music,canPlay:()=>true,persist:()=>{persisted++;},
 });
 const checkbox={id:'tour-sound-enabled',checked:true,dataset:{},matches:()=>false};
 try{
  doc.dispatchEvent(new Event('pointerdown'));await Promise.resolve();
  callback(1);assert.equal(voices,1);
  checkbox.checked=false;change({target:checkbox});
  assert.equal(audioEnabled,false);assert.equal(callback,null);

  // Pointerdown precedes the later click/change; its promise still sees mute.
  doc.dispatchEvent(new Event('pointerdown'));await Promise.resolve();
  assert.equal(callback,null);
  checkbox.checked=true;change({target:checkbox});
  assert.equal(audioEnabled,true);
  assert.equal(typeof callback,'function','unmute schedules music without another gesture');
  callback(2);assert.equal(voices,2);assert.equal(persisted,2);
 }finally{music.dispose();}
});

test('generic title sound toggle restarts menu music after a muted pointerdown',async()=>{
 const doc=new EventTarget();doc.hidden=false;
 let callback=null,click,voices=0,audioEnabled=false;
 const saved={sound:false,saveSound(value){this.sound=value;}};
 const audio={async setEnabled(value){audioEnabled=value;return value;},setVolumes(){},syncMenu(){if(audioEnabled)voices++;},stop(){}};
 const music=createMenuAmbience(audio,{document:doc,isMenu:()=>true,settings:()=>({enabled:saved.sound}),requestFrame:fn=>(callback=fn,1),cancelFrame:()=>{callback=null;}});
 const entry=readFileSync(new URL('../src/game-entry.js',import.meta.url),'utf8');
 const handler=entry.split('\n').find(line=>line.startsWith("$('#sound').addEventListener('click'"));
 assert.ok(handler,'generic header sound handler is present');
 runInNewContext(handler,{$:()=>({addEventListener(_event,fn){click=fn;}}),saved,audio,menuAmbience:music,recovery:{canWrite:true},screen:{name:'title'},soundLabel(){},render(){throw Error('Title unmute should not need a menu rebuild');}});
 try{
  doc.dispatchEvent(new Event('pointerdown'));await Promise.resolve();
  assert.equal(callback,null);
  click();assert.equal(audioEnabled,true);
  assert.equal(typeof callback,'function','unmute schedules music without a second gesture');
  callback(1);assert.equal(voices,1);
  click();assert.equal(audioEnabled,false);assert.equal(callback,null);
 }finally{music.dispose();}
});
