import test from 'node:test';
import assert from 'node:assert/strict';
import {smfPreviewVoices} from '../src/editions/smf-music.js';
import {getTiming} from '../src/stage-clock.js';

const venues=['smf-living-room','smf-fractal','smf-grove','smf-amp','smf-pagoda','smf-village'];
for(const id of venues)test(`${id} has music throughout its round with bounded voice tails`,()=>{
 const timing=getTiming(id+'-clock-preview-1');
 const boundaries=id==='smf-village'?[0,256,512,640,768]:[0,128,256,384,512];
 const endStep=boundaries.at(-1);
 const voicesAt=(step,options={})=>smfPreviewVoices({timing,step,phase:'cruise',...options});
 const sections=boundaries.slice(0,-1).map((start,index)=>{
  const section=[];
  for(let step=start;step<boundaries[index+1];step++){
   const voices=voicesAt(step);
   section.push(...voices);
   for(const voice of voices){
    const offset=voice.offsetMs??0;
    assert.ok(voice.duration>0&&voice.duration<=3);
    assert.ok(voice.volume>0&&voice.volume<=.12);
    assert.ok(Number.isFinite(offset)&&offset>=0&&offset<=24);
    if(!voice.noise)assert.ok(voice.frequency>=30&&voice.frequency<=3000);
    assert.ok(Math.round(step*60000/(timing.bpm*4))+offset+voice.duration*1000+20<=timing.durationMs+1);
   }
  }
  for(const kind of ['kick','bass','hat','pad','melody'])assert.ok(section.some(v=>v.kind===kind),kind);
  return section;
 });
 for(let i=1;i<sections.length;i++)assert.notDeepEqual(sections[i-1],sections[i]);
 const opening=voicesAt(0).find(v=>v.kind==='pad');
 const returnNote=voicesAt(boundaries.at(-2)).find(v=>v.kind==='pad');
 assert.equal(opening.frequency,returnNote.frequency);
 assert.deepEqual(voicesAt(endStep),[]);
 assert.deepEqual(voicesAt(endStep-1,{phase:'ended',flowActive:true}),[]);
 assert.ok(voicesAt(2,{phase:'drop',flowActive:true}).some(v=>v.kind==='flow'));
});

test('the sketches differ and the generic clock has no SMF voices',()=>{
 const phrases=venues.map(id=>Array.from({length:128},(_,step)=>smfPreviewVoices({timing:getTiming(id+'-clock-preview-1'),step,phase:'cruise'})));
 assert.equal(new Set(phrases.map(phrase=>JSON.stringify(phrase))).size,venues.length);
 assert.deepEqual(smfPreviewVoices({timing:getTiming(),step:0,phase:'cruise'}),[]);
});
