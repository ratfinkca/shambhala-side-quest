import test from 'node:test';
import assert from 'node:assert/strict';
import {smfPreviewVoices} from '../src/editions/smf-music.js';
import {getTiming,phaseAt} from '../src/stage-clock.js';

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

test('the arrangements differ and the generic clock has no SMF voices',()=>{
 const phrases=venues.map(id=>Array.from({length:128},(_,step)=>smfPreviewVoices({timing:getTiming(id+'-clock-preview-1'),step,phase:'cruise'})));
 assert.equal(new Set(phrases.map(phrase=>JSON.stringify(phrase))).size,venues.length);
 assert.deepEqual(smfPreviewVoices({timing:getTiming(),step:0,phase:'cruise'}),[]);
});

for(const id of venues)test(`${id} prepares each canonical drop with a lift, breathing room and a grounded downbeat`,()=>{
 const timing=getTiming(id+'-clock-preview-1'),interval=60000/(timing.bpm*timing.stepsPerBeat);
 const at=step=>smfPreviewVoices({timing,step,phase:phaseAt(Math.round(step*interval),timing).phase});
 for(const onset of timing.dropStartsMs){
  const downbeat=Math.round(onset/interval),build=downbeat-16,gap=(downbeat-2)*interval;
  assert.ok(at(build).some(v=>v.kind==='riser'&&v.filterEnd>v.filter&&v.duration>1),'a single musical-bar rise anticipates the drop');
  assert.equal(Array.from({length:16},(_,i)=>at(build+i)).flat().filter(v=>v.kind==='riser').length,1);
  for(const step of [downbeat-2,downbeat-1])assert.deepEqual(at(step),[],'last eighth-note breath is intentional');
  for(let step=build;step<downbeat-2;step++){
   for(const voice of at(step).filter(v=>['kick','bass'].includes(v.kind)))
    assert.ok(Math.round(step*interval)+(voice.offsetMs??0)+voice.duration*1000+20<=gap+1,'rhythm voices release before the breath');
  }
  const drop=at(downbeat);
  assert.ok(drop.some(v=>v.kind==='kick'));
  assert.ok(drop.some(v=>v.kind==='impact'));
  assert.ok(drop.every(v=>v.section==='drop'));
 }
});

for(const id of venues)test(`${id} instrument descriptors remain finite, centered in the low end and within the voice budget`,()=>{
 const timing=getTiming(id+'-clock-preview-1'),interval=60000/(timing.bpm*timing.stepsPerBeat);
 const events=[];let count=0;
 for(let step=0;step<Math.round(timing.durationMs/interval);step++){
  const onset=Math.round(step*interval),input={timing,step,phase:phaseAt(onset,timing).phase,flowActive:true,multiplier:5};
  const voices=smfPreviewVoices(input);assert.deepEqual(smfPreviewVoices(input),voices,'no random timbre or timing changes between calls');
  assert.ok(voices.length<=10,'bounded notes at a downbeat');count+=voices.length;
  for(const voice of voices){
   assert.equal(voice.venue,id);assert.equal(voice.bpm,timing.bpm);assert.equal(typeof voice.section,'string');
   assert.ok(Object.values(voice).filter(v=>typeof v==='number').every(Number.isFinite));
   assert.ok(Math.abs(voice.pan??0)<=.5);
   assert.ok((voice.sustain??0)>=0&&(voice.sustain??0)<=1);
   if(['kick','bass'].includes(voice.kind))assert.equal(voice.pan??0,0,'bass fundamentals remain mono compatible');
   const start=onset+(voice.offsetMs??0);events.push([start,1],[start+voice.duration*1000+20,-1]);
  }
 }
 events.sort((a,b)=>a[0]-b[0]||a[1]-b[1]);let active=0,peak=0;
 for(const [,delta]of events){active+=delta;peak=Math.max(peak,active);}
 assert.ok(peak<=18,'instrument layers have a bounded input-polyphony budget');
 assert.ok(count/(timing.durationMs/1000)<20,'event density remains suitable for a mobile native synth');
 assert.deepEqual(smfPreviewVoices({timing,step:NaN,phase:'cruise'}),[]);
 assert.deepEqual(smfPreviewVoices({timing,step:1.5,phase:'cruise'}),[]);
});

test('stage identities keep their drum vocabulary and the Village halftime/dawn contrast',()=>{
 const voices=(id,bar)=>{
  const timing=getTiming(id+'-clock-preview-1');
  return Array.from({length:16},(_,local)=>smfPreviewVoices({timing,step:bar*16+local,phase:'cruise'}));
 };
 const snareSteps=bar=>bar.flatMap((notes,i)=>notes.some(v=>v.kind==='snare'&&v.volume>.02)?[i]:[]);
 assert.deepEqual(snareSteps(voices('smf-amp',4)),[8]);
 assert.deepEqual(snareSteps(voices('smf-village',4)),[4,12]);
 assert.deepEqual(snareSteps(voices('smf-village',18)),[8]);
 for(const id of ['smf-living-room','smf-pagoda'])assert.deepEqual(voices(id,4).flatMap((notes,i)=>notes.some(v=>v.kind==='kick')?[i]:[]),[0,4,8,12]);
 assert.ok(voices('smf-grove',4).flat().some(v=>(v.offsetMs??0)>0));
 const dawn=voices('smf-village',42).flat(),opening=voices('smf-village',4).flat();
 assert.ok(dawn.some(v=>v.section==='dawn'));
 assert.ok(dawn.filter(v=>v.kind==='melody').length>opening.filter(v=>v.kind==='melody').length);
 assert.ok(dawn.find(v=>v.kind==='pad').duration>opening.find(v=>v.kind==='pad').duration);
});
