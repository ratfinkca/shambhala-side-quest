import test from 'node:test';
import assert from 'node:assert/strict';
import {bonusPreviewVoices} from '../src/bonus-practice/music.js';
import {getTiming,phaseAt} from '../src/stage-clock.js';
import {smfPreviewVoices} from '../src/editions/smf-music.js';

const venues=['rabbit-hole','secret-garden','ikigai-mori','villagio'];
const clock=id=>getTiming(`smf-${id}-bonus-preview-1`);
const interval=timing=>60000/(timing.bpm*timing.stepsPerBeat);
const voicesAt=(id,step,options={})=>{
 const timing=clock(id);
 return bonusPreviewVoices({timing,step,phase:phaseAt(Math.round(step*interval(timing)),timing).phase,...options});
};
const barVoices=(id,bar)=>Array.from({length:16},(_,i)=>voicesAt(id,bar*16+i));
const phrase=(id,start)=>Array.from({length:128},(_,i)=>voicesAt(id,start*16+i)).flat();

for(const id of venues)test(`${id} has an original bounded phrase arrangement throughout its bonus visit`,()=>{
 const timing=clock(id),stepMs=interval(timing),steps=Math.round(timing.durationMs/stepMs),events=[];
 let count=0;
 for(let step=0;step<steps;step++){
  const notes=voicesAt(id,step,{flowActive:true,multiplier:4});
  assert.deepEqual(notes,voicesAt(id,step,{flowActive:true,multiplier:4}),'arrangement is repeatable');
  assert.ok(notes.length<=10,'single-step voice budget');count+=notes.length;
  for(const note of notes){
   assert.ok(Object.values(note).filter(v=>typeof v==='number').every(Number.isFinite));
   assert.equal(note.venue,`smf-${id}`);assert.equal(note.bpm,timing.bpm);
   assert.ok(note.duration>.01&&note.duration<=3);
   assert.ok(note.volume>0&&note.volume<=.1);
   assert.ok((note.offsetMs??0)>=0&&(note.offsetMs??0)<=25);
   assert.ok(Math.abs(note.pan??0)<=.5);
   if(!note.noise)assert.ok(note.frequency>=30&&note.frequency<=3000);
   if(['kick','bass'].includes(note.kind))assert.equal(note.pan??0,0);
   const start=Math.round(step*stepMs)+(note.offsetMs??0),end=start+note.duration*1000+20;
   assert.ok(end<=timing.durationMs+1,'no dry voice spills past phrase end');
   events.push([start,1],[end,-1]);
  }
 }
 assert.ok(count>300,'music is present, not an empty implementation');
 assert.ok(count/(timing.durationMs/1000)<20,'mobile event budget');
 events.sort((a,b)=>a[0]-b[0]||a[1]-b[1]);let active=0,peak=0;
 for(const [,delta]of events){active+=delta;peak=Math.max(peak,active);}
 assert.ok(peak<=18,'bounded simultaneous voices');
 for(let bar=0;bar<steps/16;bar+=8){
  const part=phrase(id,bar);
  for(const kind of ['kick','bass','hat','melody'])assert.ok(part.some(v=>v.kind===kind),`${kind} present in phrase ${bar/8+1}`);
 }
 const first=phrase(id,0),drop=phrase(id,8);
 assert.ok(drop.length>first.length,'arrival makes room for a fuller drop');
 assert.ok(phrase(id,steps/16-8).some(v=>v.section==='outro'));
 assert.notDeepEqual(barVoices(id,8),barVoices(id,12),'four-bar call and response');
 assert.deepEqual(voicesAt(id,steps),[]);
 assert.deepEqual(voicesAt(id,steps-1,{phase:'ended',flowActive:true}),[]);
});

for(const id of venues)test(`${id} anticipates each eight-bar drop and leaves pre-drop breathing room`,()=>{
 const timing=clock(id),stepMs=interval(timing);
 for(const start of timing.dropStartsMs){
  const downbeat=Math.round(start/stepMs),build=downbeat-16,gap=(downbeat-2)*stepMs;
  assert.ok(voicesAt(id,build).some(v=>v.kind==='riser'));
  assert.deepEqual(voicesAt(id,downbeat-2),[]);assert.deepEqual(voicesAt(id,downbeat-1),[]);
  for(let step=build;step<downbeat-2;step++)for(const v of voicesAt(id,step))
   assert.ok(Math.round(step*stepMs)+(v.offsetMs??0)+v.duration*1000+20<=gap+1);
  assert.ok(voicesAt(id,downbeat).some(v=>v.kind==='kick'));
  assert.ok(voicesAt(id,downbeat).some(v=>v.kind==='impact'));
 }
});

test('bonus arrangements have distinct rhythmic identities and a less busy final phrase',()=>{
 const kinds=(id,bar,kind)=>barVoices(id,bar).flatMap((notes,i)=>notes.some(v=>v.kind===kind)?[i]:[]);
 assert.deepEqual(kinds('ikigai-mori',8,'kick'),[0,4,8,12],'house pulse');
 assert.deepEqual(kinds('secret-garden',8,'snare'),[8],'halftime dub');
 assert.deepEqual(kinds('rabbit-hole',8,'snare'),[4,12],'garage backbeat');
 assert.deepEqual(kinds('villagio',8,'snare'),[4,12],'funk backbeat');
 assert.notDeepEqual(kinds('rabbit-hole',8,'kick'),kinds('villagio',8,'kick'),'two breakbeat identities');
 assert.ok(barVoices('rabbit-hole',8).flat().some(v=>(v.offsetMs??0)>0),'garage swing');
 assert.ok(barVoices('secret-garden',8).flat().some(v=>v.kind==='wood'),'organic hand percussion');
 for(const id of venues){
  const bars=Math.round(clock(id).durationMs/interval(clock(id))/16);
  assert.ok(barVoices(id,bars-2).flat().length<barVoices(id,10).flat().length,'outro removes layers');
 }
});

test('bonus music rejects foreign or forged clocks and invalid steps without touching existing arrangements',()=>{
 const timing=clock('rabbit-hole');
 for(const step of [-1,NaN,Infinity,1.5,undefined])assert.deepEqual(bonusPreviewVoices({timing,step,phase:'cruise'}),[]);
 for(const value of [undefined,null,{}, {id:'constructor'}, {id:'unknown'}, {...timing}, {...timing,bpm:999},getTiming(),getTiming('smf-village-clock-preview-1')])
  assert.deepEqual(bonusPreviewVoices({timing:value,step:0,phase:'cruise'}),[]);
 assert.deepEqual(bonusPreviewVoices(),[]);
 assert.deepEqual(smfPreviewVoices({timing,step:0,phase:'cruise'}),[]);
 assert.ok(smfPreviewVoices({timing:getTiming('smf-village-clock-preview-1'),step:0,phase:'cruise'}).length>0);
});
