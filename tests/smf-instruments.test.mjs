import test from 'node:test';
import assert from 'node:assert/strict';
import {createSMFInstrumentRack} from '../src/editions/smf-instruments.js';
import {smfPreviewVoices} from '../src/editions/smf-music.js';
import {getTiming,phaseAt} from '../src/stage-clock.js';

function fake({panner=true,failGraph=false}={}){
 const nodes=[],sources=[],buffers=[];
 const param=()=>({value:0,events:[],setValueAtTime(v,t){this.events.push(['set',v,t]);this.value=v;},linearRampToValueAtTime(v,t){this.events.push(['linear',v,t]);},exponentialRampToValueAtTime(v,t){assert.ok(v>0);this.events.push(['exponential',v,t]);},cancelScheduledValues(t){this.events.push(['cancel',null,t]);}});
 function node(kind){const n={kind,connections:[],dead:false,connect(target){this.connections.push(target);},disconnect(){this.dead=true;this.connections=[];}};nodes.push(n);return n;}
 function source(kind){const n=node(kind);n.frequency=param();n.detune=param();n.starts=[];n.stops=[];n.start=(...args)=>n.starts.push(args);n.stop=t=>n.stops.push(t);sources.push(n);return n;}
 const context={state:'suspended',sampleRate:48000,currentTime:0,destination:{},
  createGain(){const n=node('gain');n.gain=param();return n;},
  createBiquadFilter(){if(failGraph)throw Error('Filter unavailable');const n=node('filter');n.frequency=param();n.Q=param();return n;},
  createDynamicsCompressor(){const n=node('compressor');for(const key of ['threshold','knee','ratio','attack','release'])n[key]=param();return n;},
  createDelay(){const n=node('delay');n.delayTime=param();return n;},
  createOscillator(){return source('oscillator');},createBufferSource(){return source('noise');},
  createBuffer(channels,length,rate){const samples=new Float32Array(length),buffer={sampleRate:rate,length,getChannelData:()=>samples};buffers.push(buffer);return buffer;},
 };
 if(panner)context.createStereoPanner=()=>{const n=node('panner');n.pan=param();return n;};
 const advance=t=>{context.currentTime=t;for(const n of sources)if(!n.dead&&n.stops[0]<=t)n.onended?.();};
 return {context,nodes,sources,buffers,advance};
}
const voice=(kind,extra={})=>({kind,frequency:55,endFrequency:42,duration:.25,volume:.04,venue:'smf-fractal',bpm:120,...extra});

test('rack stays lazy, accepts suspended offline scheduling and rejects invalid notes',()=>{
 const d=fake(),rack=createSMFInstrumentRack(d.context,d.context.destination);assert.equal(d.nodes.length,0);
 for(const bad of [{duration:NaN},{volume:Infinity},{frequency:NaN},{duration:0},{volume:0}])assert.equal(rack.schedule(voice('bass',bad),1),false);
 assert.equal(rack.schedule(voice('bass'),NaN),false);assert.equal(d.nodes.length,0);
 assert.equal(rack.schedule(voice('bass'),2),true);assert.equal(d.sources.length,3);
 assert.ok(d.sources.every(s=>s.starts[0][0]===2));rack.stop();
});

test('kick reaches a held bass body before its amplitude tail rather than gliding for its entire life',()=>{
 const d=fake(),rack=createSMFInstrumentRack(d.context,d.context.destination);
 rack.schedule(voice('kick',{frequency:130,duration:.24}),4);
 const body=d.sources.find(n=>n.kind==='oscillator'),click=d.sources.find(n=>n.kind==='noise');
 assert.deepEqual(body.frequency.events,[['set',130,4],['exponential',42,4.032]]);
 assert.equal(body.stops[0],4.252);assert.ok(click.stops[0]<4.03);
 const gain=body.connections[0].connections[0];assert.equal(gain.kind,'gain');
 const last= gain.gain.events.at(-1);assert.equal(last[1],0);assert.equal(last[2],4.246);
 assert.ok(gain.gain.events.some(e=>e[0]==='set'&&e[2]>4.1&&e[1]>.05),'low body retains audible sustain');
 rack.stop();
});

test('snare has tonal body and filtered snap; mono sub gets audible upper harmonics',()=>{
 const d=fake(),rack=createSMFInstrumentRack(d.context,d.context.destination);
 rack.schedule(voice('snare'),0);assert.equal(d.sources.filter(s=>s.kind==='noise').length,2);
 assert.equal(d.sources.filter(s=>s.kind==='oscillator').length,1);
 assert.ok(d.nodes.some(n=>n.kind==='filter'&&n.type==='bandpass'));
 rack.stop();const start=d.sources.length;rack.schedule(voice('bass',{venue:'smf-village',filter:880,filterEnd:320}),1);
 const bass=d.sources.slice(start);assert.deepEqual(bass.map(s=>s.frequency.events[0][1]),[55,110,110]);
 assert.equal(bass[0].type,'sine');assert.deepEqual(bass.slice(1).map(s=>s.detune.events[0][1]),[-7,7]);
 assert.equal(bass[0].connections[0].connections[0].kind,'gain','sub feeds mono low bus directly');
 rack.stop();
});

test('noise is seeded and reused; stereo gracefully falls back to mono',()=>{
 const a=fake(),b=fake({panner:false}),ar=createSMFInstrumentRack(a.context,a.context.destination),br=createSMFInstrumentRack(b.context,b.context.destination);
 for(const rack of [ar,br]){assert.equal(rack.schedule(voice('hat'),0),true);assert.equal(rack.schedule(voice('riser',{duration:1.8,filter:340,filterEnd:4200}),.1),true);}
 assert.equal(a.buffers.length,1);assert.equal(b.buffers.length,1);
 assert.deepEqual(a.buffers[0].getChannelData(0),b.buffers[0].getChannelData(0));
 assert.ok(a.sources.every(s=>s.loop));assert.ok(a.nodes.some(n=>n.kind==='panner'));
 ar.stop();br.stop();
});

test('future bass and lead filter sweeps begin at their scheduled note onset',()=>{
 const d=fake(),rack=createSMFInstrumentRack(d.context,d.context.destination);
 for(const [kind,at]of [['bass',7],['melody',11]]){
  const before=d.nodes.length;
  rack.schedule(voice(kind,{duration:.2,filter:950,filterEnd:320}),at);
  const swept=d.nodes.slice(before).filter(n=>n.kind==='filter'&&n.frequency.events.some(e=>e[0]==='exponential'));
  assert.ok(swept.length>0);
  for(const node of swept){
   assert.deepEqual(node.frequency.events[0],['set',950,at]);
   assert.deepEqual(node.frequency.events.at(-1),['exponential',320,at+.2]);
  }
 }
 rack.stop();
});

test('stop clears scheduled sources and wet graph; resume cannot reveal an old delay tail',()=>{
 const d=fake(),rack=createSMFInstrumentRack(d.context,d.context.destination);
 rack.schedule(voice('pad',{duration:2}),0);rack.schedule(voice('melody'),5);
 const oldNodes=[...d.nodes],oldSources=[...d.sources];assert.equal(rack.snapshot().activeSources,4);
 rack.stop();rack.stop();assert.equal(rack.snapshot().activeSources,0);
 assert.ok(oldNodes.every(n=>n.dead));assert.ok(oldSources.every(n=>n.stops.includes(0)));
 assert.ok(oldNodes.some(n=>n.kind==='gain'&&n.gain.events.some(e=>e[0]==='cancel')&&n.gain.events.at(-1)[1]===0));
 assert.equal(rack.schedule(voice('pad'),6),true);assert.equal(rack.snapshot().graphGeneration,2);
 assert.ok(d.nodes.slice(oldNodes.length).every(n=>!oldNodes.includes(n)));
 rack.dispose();assert.equal(rack.schedule(voice('pad'),7),false);
});

test('ended sources release their chains and the live polyphony limit stays bounded',()=>{
 const d=fake(),rack=createSMFInstrumentRack(d.context,d.context.destination);
 for(let i=0;i<80;i++)rack.schedule(voice('bass'),0);
 assert.equal(rack.snapshot().activeSources,96);assert.equal(rack.snapshot().peakSources,96);assert.equal(rack.snapshot().droppedVoices,48);
 d.advance(.3);assert.equal(rack.snapshot().activeSources,0);
 assert.ok(d.sources.every(s=>s.dead));assert.equal(rack.schedule(voice('bass'),.5),true);rack.stop();
});

test('a graph creation failure disconnects every partial node and remains optional',()=>{
 const d=fake({failGraph:true}),rack=createSMFInstrumentRack(d.context,d.context.destination);
 assert.equal(rack.schedule(voice('bass'),0),false);assert.equal(rack.snapshot().activeSources,0);assert.ok(d.nodes.every(n=>n.dead));rack.stop();
});

for(const venue of ['living-room','fractal','grove','amp','pagoda','village'])test(`${venue} full arrangement stays finite, inside its tail limit and below the source budget`,()=>{
 const d=fake(),rack=createSMFInstrumentRack(d.context,d.context.destination),timing=getTiming(`smf-${venue}-clock-preview-1`);
 const total=Math.round(timing.durationMs*timing.bpm*timing.stepsPerBeat/60000);
 for(let step=0;step<total;step++){
  const onset=Math.round(step*60000/(timing.bpm*timing.stepsPerBeat));d.advance(onset/1000);
  const voices=smfPreviewVoices({timing,step,phase:phaseAt(onset,timing).phase,multiplier:5,flowActive:true});
  for(const v of voices)assert.equal(rack.schedule(v,(onset+(v.offsetMs||0))/1000),true);
 }
 assert.equal(rack.snapshot().droppedVoices,0);assert.ok(rack.snapshot().peakSources<96);
 for(const n of d.nodes){
  for(const key of ['frequency','detune','gain','Q','pan','delayTime'])if(n[key]){
   assert.ok(Number.isFinite(n[key].value));
   for(const e of n[key].events){assert.ok(e[0]==='cancel'||Number.isFinite(e[1]));assert.ok(Number.isFinite(e[2])&&e[2]>=0);}
  }
 }
 assert.ok(d.sources.every(s=>s.stops[0]*1000<=timing.durationMs+1));
 d.advance(timing.durationMs/1000);assert.equal(rack.snapshot().activeSources,0);rack.stop();
});
