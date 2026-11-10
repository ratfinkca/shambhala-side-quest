import test from 'node:test';
import assert from 'node:assert/strict';
import {mountRehearsalAudioMix} from '../src/rehearsal-audio-mix.js';

class Node {
 listeners=new Map();value='';disabled=false;textContent='';
 addEventListener(type,fn){this.listeners.set(type,fn);}
 removeEventListener(type,fn){if(this.listeners.get(type)===fn)this.listeners.delete(type);}
 emit(type){return this.listeners.get(type)?.({target:this});}
}
function fixture(){
 const selectors=['music','effects','music-value','effects-value','test','reset','status'];
 const nodes=Object.fromEntries(selectors.map(key=>[key,new Node()])),panel={querySelector:selector=>nodes[selector.slice(10,-1)],remove(){this.removed=true;}};
 const volumes=[],effects=[];let enabled=true,resumes=0;
 const audio={setVolumes:v=>volumes.push({...v}),setEnabled:()=>{resumes++;return Promise.resolve(true);},pickup:n=>effects.push(['pickup',n]),closePass:()=>effects.push(['near-miss'])};
 const comparison=Object.assign(new Node(),{volume:1,muted:false}),root={ownerDocument:{createElement:()=>panel},append(){}};
 const mixer=mountRehearsalAudioMix(root,{audio,isEnabled:()=>enabled,getComparisonPlayer:()=>comparison});
 return {nodes,panel,mixer,volumes,effects,audio,comparison,get resumes(){return resumes;},mute(){enabled=false;mixer.refresh();},unmute(){enabled=true;mixer.refresh();}};
}

test('rehearsal mix starts balanced, changes each channel independently, and resets without changing master mute',()=>{
 const f=fixture();assert.deepEqual(f.volumes.at(-1),{music:.2,effects:1});assert.equal(f.comparison.volume,.2);
 f.nodes.music.value='0';f.nodes.music.emit('input');assert.deepEqual(f.volumes.at(-1),{music:0,effects:1});assert.equal(f.nodes['music-value'].textContent,'0%');assert.equal(f.comparison.volume,0);
 f.nodes.effects.value='30';f.nodes.effects.emit('input');assert.deepEqual(f.volumes.at(-1),{music:0,effects:.3});assert.equal(f.comparison.volume,0);
 f.mute();f.nodes.reset.emit('click');assert.deepEqual(f.volumes.at(-1),{music:.2,effects:1});assert.equal(f.nodes.test.disabled,true);
 f.unmute();assert.equal(f.nodes.test.disabled,false);assert.equal(f.resumes,0,'sliders/reset must not start playback');f.mixer.dispose();
});

test('test effects awaits first-use audio readiness, alternates real feedback, and never starts game/music',async()=>{
 const f=fixture();let ready;f.audio.setEnabled=()=>new Promise(resolve=>{ready=resolve;});
 const pending=f.nodes.test.emit('click');assert.equal(f.nodes.test.disabled,true);assert.deepEqual(f.effects,[]);
 ready(true);await pending;assert.deepEqual(f.effects,[['pickup',1]]);assert.equal(f.nodes.test.disabled,false);
 f.audio.setEnabled=()=>Promise.resolve(true);await f.nodes.test.emit('click');assert.deepEqual(f.effects,[['pickup',1],['near-miss']]);f.mixer.dispose();
});

test('muting, stopping and disposal cancel pending effects even when audio resumes later',async()=>{
 for(const action of ['mute','cancel','dispose']){
  const f=fixture();let ready;f.audio.setEnabled=()=>new Promise(resolve=>{ready=resolve;});
  const pending=f.nodes.test.emit('click');
  if(action==='mute'){f.mute();f.unmute();}else if(action==='cancel')f.mixer.cancelPreview();else f.mixer.dispose();
  ready(true);await pending;assert.deepEqual(f.effects,[],action);
  f.mixer.dispose();assert.equal(f.panel.removed,true);for(const node of Object.values(f.nodes))assert.equal(node.listeners.size,0);
 }
});

test('silent channels and unavailable Web Audio give useful feedback instead of claiming a sound played',async()=>{
 const f=fixture();f.nodes.effects.value='0';f.nodes.effects.emit('input');assert.equal(f.nodes.test.disabled,true);
 await f.nodes.test.emit('click');assert.equal(f.resumes,0);assert.deepEqual(f.effects,[]);
 f.nodes.effects.value='100';f.nodes.effects.emit('input');f.audio.setEnabled=()=>Promise.resolve(false);
 await f.nodes.test.emit('click');assert.deepEqual(f.effects,[]);assert.match(f.nodes.status.textContent,/could not start/i);assert.equal(f.nodes.test.disabled,false);f.mixer.dispose();
});

test('native comparison volume shares Music and cannot bypass the master mute',()=>{
 const f=fixture();f.comparison.volume=.6;f.comparison.emit('volumechange');
 assert.deepEqual(f.volumes.at(-1),{music:.6,effects:1});assert.equal(f.nodes.music.value,'60');
 f.comparison.muted=true;f.comparison.emit('volumechange');assert.equal(f.nodes.music.value,'0');assert.equal(f.comparison.volume,0);
 f.nodes.reset.emit('click');f.mute();f.comparison.muted=false;f.comparison.emit('volumechange');assert.equal(f.comparison.muted,true);
 assert.equal(f.nodes.music.value,'20');f.unmute();assert.equal(f.comparison.muted,false);assert.equal(f.comparison.volume,.2);
 f.mixer.dispose();assert.equal(f.comparison.listeners.size,0);
});
