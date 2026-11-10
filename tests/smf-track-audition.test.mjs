import test from 'node:test';
import assert from 'node:assert/strict';
import {createTrackAudition,mountTrackAudition} from '../src/editions/smf-track-audition.js';

class Node{
 listeners=new Map();attributes={};value='';
 addEventListener(type,fn){const list=this.listeners.get(type)??[];list.push(fn);this.listeners.set(type,list);}
 removeEventListener(type,fn){this.listeners.set(type,(this.listeners.get(type)??[]).filter(item=>item!==fn));}
 emit(type){for(const fn of this.listeners.get(type)??[])fn({target:this});}
 setAttribute(name,value){this.attributes[name]=value;}
 removeAttribute(name){delete this[name];delete this.attributes[name];}
}
class Player extends Node{
 duration=180;paused=true;currentTime=0;plays=0;pauses=0;loads=0;
 play(){this.plays++;this.paused=false;this.emit('playing');return this.playPromise??Promise.resolve();}
 pause(){this.pauses++;this.paused=true;this.emit('pause');}
 load(){this.loads++;}
}
function fixture(enable=value=>Promise.resolve(!!value)){
 const players=[],revoked=[],calls={sync:0,stop:0,effects:0,enabled:[]};
 const base={sync(){calls.sync++;},stop(){calls.stop++;},setEnabled(value){calls.enabled.push(value);return enable(value);},setVolumes(){},pickup(){calls.effects++;},closePass(){calls.effects++;}};
 const audition=createTrackAudition(base,{createPlayer(){const p=new Player();players.push(p);return p;},createURL:file=>`blob:${file.name}`,revokeURL:url=>revoked.push(url)});
 const load=(name='song.wav')=>{audition.loadFile({name,size:100});const player=players.at(-1);player.emit('loadedmetadata');return player;};
 return{audition,audio:audition.audio,calls,players,revoked,load};
}
const round=elapsed=>({timingId:'smf-village-clock-preview-1',remainingMs:66977-elapsed,multiplier:1,flowMs:0});

test('track controls remain synchronous while callers await effects audio readiness',async()=>{
 let resolve;const pending=new Promise(done=>{resolve=done;});
 const f=fixture(value=>value?pending:Promise.resolve(false)),p=f.load();f.audition.useTrack();
 const ready=f.audio.setEnabled(true);assert.ok(ready instanceof Promise);
 f.audition.playFromGesture(round(0));assert.equal(p.paused,false,'recording starts in its original control gesture');
 resolve(true);assert.equal(await ready,true);
 const muted=f.audio.setEnabled(false);assert.equal(p.paused,true,'mute does not wait for effects readiness');
 assert.equal(await muted,false);
 f.audition.dispose();
});

test('local recording replaces music only and stays at normal speed on the canonical game clock',async()=>{
 const f=fixture();f.audio.setEnabled(true);f.audio.sync(round(0),'clock-lab');assert.equal(f.calls.sync,1);
 const p=f.load();assert.equal(f.audition.snapshot().mode,'original');assert.equal(f.audition.useTrack(),true);
 assert.equal(f.audition.setCue(20),true);f.audition.playFromGesture(round(1000));f.audio.sync(round(1000),'clock-lab');await Promise.resolve();
 assert.equal(p.currentTime,21);assert.equal(p.plays,1);assert.equal(f.calls.sync,1);
 p.currentTime=21.1;f.audio.sync(round(1100));assert.equal(p.plays,1);assert.equal(p.currentTime,21.1);
 f.audio.pickup(1);f.audio.closePass();assert.equal(f.calls.effects,2);
 assert.equal(p.playbackRate,undefined,'no tempo or pitch adjustment is applied');
 f.audition.useOriginal();assert.equal(p.paused,true);f.audio.sync(round(1200));assert.equal(f.calls.sync,2);
 f.audition.dispose();
});

test('pause, mute, reset, venue switches and round end stop or reposition recording without changing run time',async()=>{
 const f=fixture(),p=f.load();f.audition.useTrack();f.audition.setCue(5);f.audio.setEnabled(true);
 f.audition.playFromGesture(round(4000));f.audio.sync(round(4000));await Promise.resolve();assert.equal(p.currentTime,9);
 f.audio.stop();assert.equal(p.paused,true);f.audio.setEnabled(true);f.audition.playFromGesture(round(4000));f.audio.sync(round(4000));await Promise.resolve();assert.equal(p.currentTime,9);
 f.audio.setEnabled(false);assert.equal(p.paused,true);const before=p.plays;f.audio.sync(round(5000));assert.equal(p.plays,before);
 f.audio.setEnabled(true);f.audition.playFromGesture(round(5000));f.audio.sync(round(5000));await Promise.resolve();assert.equal(p.currentTime,10);
 f.audio.stop();f.audition.playFromGesture(round(0));f.audio.sync(round(0));await Promise.resolve();assert.equal(p.currentTime,5,'restart resets only to the chosen song cue');
 f.audio.sync({timingId:'smf-fractal-clock-preview-1',remainingMs:64000,multiplier:1,flowMs:0});assert.equal(p.currentTime,5);
 f.audio.sync({...round(6000),ended:true});assert.equal(p.paused,true);f.audition.dispose();
});

test('recording end remains silent until reset and cue rejects positions outside the recording',async()=>{
 const f=fixture(),p=f.load();p.duration=10;p.emit('loadedmetadata');
 assert.equal(f.audition.setCue(10),false);assert.equal(f.audition.setCue(-1),false);assert.equal(f.audition.setCue(NaN),false);
 assert.equal(f.audition.setCue(9),true);f.audition.useTrack();f.audio.setEnabled(true);f.audition.playFromGesture(round(500));f.audio.sync(round(500));await Promise.resolve();
 assert.equal(p.currentTime,9.5);f.audio.sync(round(1500));assert.equal(p.paused,true);assert.equal(f.audition.snapshot().ended,true);assert.equal(f.calls.sync,0);
 const plays=p.plays;f.audio.sync(round(2000));assert.equal(p.plays,plays);
 f.audio.stop();f.audition.playFromGesture(round(0));f.audio.sync(round(0));await Promise.resolve();assert.equal(p.currentTime,9);assert.equal(f.audition.snapshot().ended,false);
 f.audition.dispose();
});

test('animation frames never initiate playback and native media events provide stable visible progress',async()=>{
 const f=fixture(),p=f.load();f.audition.useTrack();f.audio.setEnabled(true);
 let notifications=0;f.audition.subscribe(()=>{notifications++;});
 for(let i=0;i<20;i++)f.audio.sync(round(i*16));
 assert.equal(p.plays,0,'only an explicit control gesture may call play');
 f.audition.playFromGesture(round(400));await Promise.resolve();assert.equal(p.plays,1);assert.equal(f.audition.snapshot().playback,'playing');
 p.currentTime=1.24;p.emit('timeupdate');assert.equal(f.audition.snapshot().position,1.2);
 const stable=notifications;p.emit('timeupdate');assert.equal(notifications,stable,'identical native timestamps do not update the UI');
 f.audio.stop();assert.equal(f.audition.snapshot().playback,'paused');
 f.audio.sync(round(1250));assert.equal(p.plays,1,'paused media does not restart from animation frames');
 f.audition.dispose();
});

test('stop immediately publishes paused status when the native pause event has not arrived and time is unchanged',async()=>{
 const f=fixture(),p=f.load(),states=[];
 p.pause=()=>{p.pauses++;p.paused=true;}; // Browser event is delivered later.
 f.audition.subscribe(state=>states.push(state.playback));f.audition.useTrack();f.audio.setEnabled(true);
 f.audition.playFromGesture(round(1000));await Promise.resolve();assert.equal(states.at(-1),'playing');
 f.audio.stop();assert.equal(states.at(-1),'paused');
 const count=states.length;p.emit('pause');p.emit('timeupdate');assert.equal(states.length,count,'the late event must not be needed to publish paused status');
 f.audition.dispose();
});

test('replacing or disposing a recording removes sources, listeners and object URLs',()=>{
 const f=fixture(),first=f.load('first.wav');f.audition.useTrack();f.audio.setEnabled(true);f.audition.playFromGesture(round(0));f.audio.sync(round(0));
 const second=f.load('second.wav');assert.equal(first.paused,true);assert.equal(first.src,undefined);assert.deepEqual(f.revoked,['blob:first.wav']);
 assert.equal([...first.listeners.values()].flat().length,0);assert.equal(f.audition.snapshot().mode,'original');
 f.audition.dispose();f.audition.dispose();assert.equal(second.src,undefined);assert.equal([...second.listeners.values()].flat().length,0);
 assert.deepEqual(f.revoked,['blob:first.wav','blob:second.wav']);
 f.audition.loadFile({name:'late.wav',size:5});assert.equal(f.players.length,2);
});

test('play rejection is not retried every frame and stale rejections cannot corrupt a new selection',async()=>{
 const f=fixture(),p=f.load();let reject;p.playPromise=new Promise((resolve,no)=>{reject=no;});
 f.audition.useTrack();f.audio.setEnabled(true);f.audition.playFromGesture(round(0));f.audio.sync(round(0));f.audio.sync(round(16));assert.equal(p.plays,1);
 reject(new Error('blocked'));await Promise.resolve();assert.equal(f.audition.snapshot().blocked,true);
 f.audio.sync(round(32));assert.equal(p.plays,1);
 p.playPromise=Promise.resolve();f.audio.setEnabled(true);f.audition.playFromGesture(round(40));f.audio.sync(round(40));await Promise.resolve();assert.equal(p.plays,2);assert.equal(f.audition.snapshot().blocked,false);
 f.audio.stop();let rejectLate;p.playPromise=new Promise((resolve,no)=>{rejectLate=no;});f.audition.playFromGesture(round(100));f.audio.sync(round(100));
 f.load('new.wav');rejectLate(new Error('old source cancelled'));await Promise.resolve();assert.equal(f.audition.snapshot().error,'');
 f.audition.dispose();
});

test('unreadable files stay on original music and volume changes reach only the recording music level',()=>{
 const f=fixture();f.audition.loadFile({name:'empty.wav',size:0});assert.equal(f.players.length,0);assert.equal(f.audition.useTrack(),false);
 f.audio.setVolumes({music:.2});const p=f.load();assert.equal(p.volume,.2);f.audio.setVolumes({effects:.9});assert.equal(p.volume,.2);
 f.audio.setVolumes({music:.6});assert.equal(p.volume,.6);f.audition.useTrack();p.emit('error');
 assert.equal(f.audition.snapshot().ready,false);assert.equal(f.audition.snapshot().mode,'original');assert.equal(p.paused,true);
 f.audition.dispose();
});

test('local-track controls pause the preview, report cue errors and clean up their listeners',()=>{
 const previous=globalThis.document,f=fixture(),nodes=Object.fromEntries(['[data-track-file]','[data-track-cue]','[data-track-source="track"]','[data-track-source="original"]','[data-track-status]','[data-track-position]'].map(selector=>[selector,new Node()]));
 const panel=new Node();let removed=false,pauses=0,starts=0;panel.querySelector=selector=>nodes[selector];panel.remove=()=>{removed=true;};
 globalThis.document={createElement:()=>panel,activeElement:null};
 try{
  const dispose=mountTrackAudition({append(){}},{audition:f.audition,pause:()=>{pauses++;},start:()=>{starts++;}});
  const file=nodes['[data-track-file]'],cue=nodes['[data-track-cue]'],track=nodes['[data-track-source="track"]'],original=nodes['[data-track-source="original"]'];
  assert.equal(track.disabled,true);file.files=[{name:'<song>.wav',size:100}];file.emit('change');f.players[0].emit('loadedmetadata');assert.equal(track.disabled,false);
  assert.ok(nodes['[data-track-status]'].textContent.includes('<song>.wav'),'filename is plain text, not HTML');
  cue.value='12';cue.emit('change');track.emit('click');assert.equal(f.audition.snapshot().cueSeconds,12);assert.equal(track.attributes['aria-pressed'],'true');assert.equal(starts,1);
  cue.value='999';cue.emit('change');assert.equal(cue.value,'12');assert.match(nodes['[data-track-status]'].textContent,/before the end/);
  original.emit('click');assert.equal(f.audition.snapshot().mode,'original');assert.equal(pauses,5);
  dispose();assert.equal(removed,true);for(const node of Object.values(nodes))assert.equal([...node.listeners.values()].flat().length,0);
 }finally{f.audition.dispose();globalThis.document=previous;}
});

test('blurred cue changes preserve the typed value when pausing refreshes the field from the old state',()=>{
 const previous=globalThis.document,f=fixture(),nodes=Object.fromEntries(['[data-track-file]','[data-track-cue]','[data-track-source="track"]','[data-track-source="original"]','[data-track-status]','[data-track-position]'].map(selector=>[selector,new Node()]));
 const panel=new Node();panel.querySelector=selector=>nodes[selector];panel.remove=()=>{};
 globalThis.document={createElement:()=>panel,activeElement:null};
 let dispose;
 try{
  dispose=mountTrackAudition({append(){}},{audition:f.audition,pause:()=>f.audio.stop(),start(){f.audio.setEnabled(true);f.audition.playFromGesture(round(0));}});
  f.load();nodes['[data-track-source="track"]'].emit('click');assert.equal(f.audition.snapshot().playback,'playing');
  const cue=nodes['[data-track-cue]'];cue.value='132.4';cue.emit('change');
  assert.equal(f.audition.snapshot().playback,'paused');
  assert.equal(f.audition.snapshot().cueSeconds,132.4,'the pause subscriber must not replace the pending edit with its old cue');
  assert.equal(cue.value,'132.4');
 }finally{dispose?.();f.audition.dispose();globalThis.document=previous;}
});

test('Use this track commits an input-only cue draft despite blur and media progress notifications',()=>{
 const previous=globalThis.document,f=fixture(),nodes=Object.fromEntries(['[data-track-file]','[data-track-cue]','[data-track-source="track"]','[data-track-source="original"]','[data-track-status]','[data-track-position]'].map(selector=>[selector,new Node()]));
 const panel=new Node();panel.querySelector=selector=>nodes[selector];panel.remove=()=>{};
 globalThis.document={createElement:()=>panel,activeElement:null};
 let dispose,starts=0;
 try{
  dispose=mountTrackAudition({append(){}},{audition:f.audition,pause:()=>f.audio.stop(),start(){starts++;f.audio.setEnabled(true);f.audition.playFromGesture(round(0));}});
  const p=f.load(),cue=nodes['[data-track-cue]'],track=nodes['[data-track-source="track"]'];
  track.emit('click');f.audio.stop();
  cue.value='132.4';cue.emit('input'); // No native change event before the click.
  p.currentTime=2;p.emit('timeupdate');
  assert.equal(cue.value,'132.4','a blurred draft survives unrelated media notifications');
  track.emit('click');
  assert.equal(f.audition.snapshot().cueSeconds,132.4);assert.equal(p.currentTime,132.4);assert.equal(starts,2);
  cue.value='999';track.emit('click');assert.equal(starts,2,'invalid draft does not start a round');assert.equal(cue.value,'132.4');
 }finally{dispose?.();f.audition.dispose();globalThis.document=previous;}
});
