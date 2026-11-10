// Original Web Audio instruments for the SMF rehearsal. No recordings or
// borrowed presets. The same rack works in live and OfflineAudioContext graphs.
const MAX_SOURCES=96,TAIL=.012,EPS=.0001;
const clamp=(value,low,high)=>Math.max(low,Math.min(high,value));
const finite=(value,fallback)=>Number.isFinite(value)?value:fallback;
const sourceCount={kick:2,snare:3,hat:1,bass:3,pad:2,melody:2,wood:2,echo:2,air:1,flow:2,riser:1,impact:2};

export function createSMFInstrumentRack(context,destination){
 let graph=null,noiseBuffer=null,disposed=false,peakSources=0,scheduledSources=0,droppedVoices=0,graphGeneration=0;
 const sources=new Map();
 const gain=(value=1)=>{const node=context.createGain();node.gain.value=value;return node;};
 const filter=(type,frequency,q=.7)=>{const node=context.createBiquadFilter();node.type=type;node.frequency.value=frequency;node.Q.value=q;return node;};
 function makeNoise(){
  if(noiseBuffer)return noiseBuffer;
  noiseBuffer=context.createBuffer(1,context.sampleRate,context.sampleRate);
  const samples=noiseBuffer.getChannelData(0);let seed=0x51f07e;
  for(let i=0;i<samples.length;i++){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;samples[i]=(seed>>>0)/2147483648-1;}
  return noiseBuffer;
 }
 function ensureGraph(bpm){
  if(graph)return graph;
  const owned=[];const own=node=>{owned.push(node);return node;};
  try{
   const input=own(gain()),low=own(gain()),mid=own(gain()),wet=own(gain());
   const rumble=own(filter('highpass',24)),compressor=own(context.createDynamicsCompressor()),output=own(gain(.9));
   compressor.threshold.value=-18;compressor.knee.value=12;compressor.ratio.value=2.5;
   compressor.attack.value=.008;compressor.release.value=.18;
   low.connect(input);mid.connect(input);input.connect(rumble);rumble.connect(compressor);compressor.connect(output);output.connect(destination);
   const wetHigh=own(filter('highpass',550)),wetLow=own(filter('lowpass',4600));
   wet.connect(wetHigh);wetHigh.connect(wetLow);
   // Short feed-forward echoes give width without a feedback loop, long wash,
   // or another oscillator. Low end never feeds this stereo path.
   for(const [beats,level,pan]of [[.375,.24,-.65],[.75,.15,.65]]){
    const delay=own(context.createDelay(1));delay.delayTime.value=60/bpm*beats;
    const volume=own(gain(level));wetLow.connect(delay);delay.connect(volume);
    if(context.createStereoPanner){const panner=own(context.createStereoPanner());panner.pan.value=pan;volume.connect(panner);panner.connect(input);}
    else volume.connect(input);
   }
   graph={input,low,mid,wet,output,owned};graphGeneration++;
   return graph;
  }catch(error){owned.forEach(node=>{try{node.disconnect();}catch{}});throw error;}
 }
 function clean(source){
  const record=sources.get(source);if(!record)return;
  sources.delete(source);source.onended=null;
  for(const node of record.owned){try{node.disconnect();}catch{}}
 }
 function silence(source){try{source.stop(context.currentTime);}catch{}clean(source);}
 function envelope(param,at,duration,peak,{attack=.007,sustain=.6,release=.06}={}){
  const rise=clamp(attack,.001,duration*.65),tail=Math.min(release,duration*.3);
  const decay=Math.min(duration-tail,rise+Math.min(.08,duration*.2)),hold=duration-tail;
  const level=Math.max(EPS,peak*clamp(sustain,.04,1));
  param.setValueAtTime(0,at);param.linearRampToValueAtTime(peak,at+rise);
  param.exponentialRampToValueAtTime(level,at+decay);
  if(hold>decay)param.setValueAtTime(level,at+hold);
  param.exponentialRampToValueAtTime(EPS,at+duration);param.linearRampToValueAtTime(0,at+duration+.006);
 }
 function instrumentSource(voice,at,duration,level,options,created){
  const owned=[];let source;
  try{
   source=options.noise?context.createBufferSource():context.createOscillator();owned.push(source);
   if(options.noise){source.buffer=makeNoise();source.loop=true;}
   else{
    source.type=options.type||'sine';source.frequency.setValueAtTime(options.frequency,at);
    if(options.endFrequency){source.frequency.exponentialRampToValueAtTime(options.endFrequency,at+Math.min(options.pitchTime??duration,duration));}
    if(options.detune&&source.detune)source.detune.setValueAtTime(options.detune,at);
   }
   let last=source;
   for(const spec of options.filters||[]){
    const node=filter(spec.type,spec.frequency,spec.q);owned.push(node);last.connect(node);last=node;
    // A future-scheduled note starts its sweep at its own onset, not at the
    // context's time zero (especially important during offline lookahead).
    node.frequency.setValueAtTime(spec.frequency,at);
    if(spec.end){
     if(spec.peak){node.frequency.exponentialRampToValueAtTime(spec.peak,at+duration*.45);}
     node.frequency.exponentialRampToValueAtTime(spec.end,at+duration);
    }
   }
   const amp=gain(0);owned.push(amp);last.connect(amp);last=amp;
   envelope(amp.gain,at,duration,level,options);
   if(options.pan&&context.createStereoPanner){const panner=context.createStereoPanner();panner.pan.value=clamp(options.pan,-.8,.8);owned.push(panner);last.connect(panner);last=panner;}
   last.connect(options.low?graph.low:graph.mid);
   if(options.send){const send=gain(options.send);owned.push(send);last.connect(send);send.connect(graph.wet);}
   sources.set(source,{owned,kind:voice.kind,end:at+duration+TAIL});created.push(source);
   peakSources=Math.max(peakSources,sources.size);scheduledSources++;
   source.onended=()=>clean(source);
   if(options.noise)source.start(at,((voice.frequency||317)*.00137)%1);else source.start(at);
   source.stop(at+duration+TAIL);
   return source;
  }catch(error){
   if(source&&sources.has(source))silence(source);
   else{try{source?.stop();}catch{}owned.forEach(node=>{try{node.disconnect();}catch{}});}
   throw error;
  }
 }
 function schedule(raw,absoluteAt){
  if(disposed||!raw||!Number.isFinite(absoluteAt)||!Number.isFinite(raw.duration)||raw.duration<=.01||!Number.isFinite(raw.volume)||raw.volume<=0)return false;
  if(raw.frequency!==undefined&&(!Number.isFinite(raw.frequency)||raw.frequency<=0))return false;
  const kind=Object.hasOwn(sourceCount,raw.kind)?raw.kind:'melody';
  if(sources.size+sourceCount[kind]>MAX_SOURCES){droppedVoices++;return false;}
  const voice={...raw,kind},at=Math.max(0,absoluteAt),duration=clamp(raw.duration,.012,8),volume=clamp(raw.volume,.0001,.12);
  const frequency=clamp(finite(raw.frequency,180),25,12000),bpm=clamp(finite(raw.bpm,120),70,190);
  const pan=clamp(finite(raw.pan,0),-.8,.8),venue=raw.venue||'',created=[];
  const add=(length,level,options)=>instrumentSource(voice,at,Math.min(length,duration),Math.min(level,.32),options,created);
  try{
   ensureGraph(bpm);
   if(kind==='kick'){
    const body=clamp(finite(raw.endFrequency,venue==='smf-amp'?39:48),32,68);
    add(duration,volume*2.6,{frequency:Math.max(frequency,body*2.4),endFrequency:body,pitchTime:.032,low:true,sustain:.65,release:.095,filters:[{type:'lowpass',frequency:1800}]});
    add(.012,volume*.25,{noise:true,filters:[{type:'highpass',frequency:1800},{type:'lowpass',frequency:6500}],attack:.001,sustain:.06,release:.009});
   }else if(kind==='snare'){
    add(Math.min(duration,.16),volume*2,{frequency:venue==='smf-village'?205:180,endFrequency:120,pitchTime:.045,sustain:.35,release:.065});
    add(duration,volume*2.3,{noise:true,filters:[{type:'bandpass',frequency:finite(raw.filter,2100),q:.7},{type:'lowpass',frequency:7200}],attack:.002,sustain:.22,release:.07,send:.035});
    add(Math.min(duration,.055),volume*.55,{noise:true,filters:[{type:'bandpass',frequency:1300,q:.8}],attack:.011,sustain:.15,release:.022,pan:pan||.12});
   }else if(kind==='hat'){
    add(duration,volume*1.2,{noise:true,filters:[{type:'highpass',frequency:clamp(finite(raw.filter,7000),3500,10000)},{type:'lowpass',frequency:12500}],attack:.001,sustain:.12,release:.02,pan:pan||-.18});
   }else if(kind==='bass'){
    // A centered sub supplies weight; upper harmonics keep the rhythm present
    // on laptop speakers where 35–60Hz fundamentals may be barely audible.
    add(duration,volume*1.7,{frequency,type:'sine',low:true,attack:.008,sustain:finite(raw.sustain,.8),release:.045});
    if(venue==='smf-village'){
     for(const side of [-1,1])add(duration,volume*.48,{frequency:frequency*2,type:'sawtooth',detune:side*7,attack:.018,sustain:.7,release:.055,pan:side*.18,filters:[{type:'lowpass',frequency:clamp(finite(raw.filter,950),150,5000),end:clamp(finite(raw.filterEnd,360),100,5000),q:.8}]});
    }else{
     const fractal=venue==='smf-fractal',amp=venue==='smf-amp',grove=venue==='smf-grove';
     add(duration,volume*(fractal?.9:.7),{frequency:frequency*2,type:fractal?'sawtooth':'triangle',attack:.008,sustain:.65,release:.04,
      filters:[{type:'lowpass',frequency:clamp(finite(raw.filter,fractal?1400:amp?420:grove?700:1000),150,5000),end:clamp(finite(raw.filterEnd,fractal?240:amp?210:380),100,5000),peak:amp?1250:undefined,q:fractal?1.6:.7}]});
     add(duration,volume*.25,{frequency:frequency*3,type:'sine',attack:.01,sustain:.55,release:.04});
    }
   }else if(kind==='pad'){
    const bright=venue==='smf-pagoda'||venue==='smf-village';
    for(const side of [-1,1])add(duration,volume*1.3,{frequency,type:bright?'sawtooth':'triangle',detune:side*5,pan:pan||side*.48,
     attack:finite(raw.attack,Math.min(.09,duration*.2)),sustain:finite(raw.sustain,.7),release:Math.min(.2,duration*.3),send:.14,
     filters:[{type:'highpass',frequency:140},{type:'lowpass',frequency:clamp(finite(raw.filter,bright?1700:1300),200,7000),end:clamp(finite(raw.filterEnd,bright?900:650),150,7000),q:.5}]});
   }else if(kind==='riser'){
    add(duration,volume*1.5,{noise:true,attack:Math.max(finite(raw.attack,0),duration*.6),sustain:.9,release:.035,pan,send:.08,
     filters:[{type:'highpass',frequency:250},{type:'lowpass',frequency:clamp(finite(raw.filter,350),200,1500),end:clamp(finite(raw.filterEnd,3500),800,6500),q:.65}]});
   }else if(kind==='impact'){
    add(duration,volume*1.8,{frequency:88,endFrequency:45,pitchTime:.055,low:true,attack:.002,sustain:.2,release:.12});
    add(duration,volume*.9,{noise:true,filters:[{type:'highpass',frequency:150},{type:'lowpass',frequency:1800,end:350}],attack:.003,sustain:.18,release:.16,send:.1});
   }else if(kind==='air'){
    add(duration,volume*1.5,{noise:true,filters:[{type:'bandpass',frequency:1800,q:.6}],attack:.03,sustain:.45,release:.09,send:.2,pan:pan||.3});
   }else{
    const wood=kind==='wood',send=wood?.04:kind==='echo'?.3:.16;
    const cutoff=wood?1800:venue==='smf-fractal'?2200:3200;
    add(duration,volume*(wood?1.6:2),{frequency,type:wood?'sine':venue==='smf-fractal'?'sawtooth':'triangle',attack:finite(raw.attack,wood?.002:.006),
     sustain:finite(raw.sustain,wood?.12:.42),release:wood?.025:.075,pan,send,filters:[{type:'lowpass',frequency:clamp(finite(raw.filter,cutoff),200,7000),end:clamp(finite(raw.filterEnd,wood?700:1400),150,7000),q:.6}]});
    add(duration,volume*(wood?.45:.35),{frequency:frequency*(wood?1.5:2),type:'sine',attack:.004,sustain:.3,release:.05,pan:pan||.25,send});
   }
   return true;
  }catch{for(const source of created)silence(source);return false;}
 }
 function stop(){
  if(graph){graph.output.gain.cancelScheduledValues(context.currentTime);graph.output.gain.setValueAtTime(0,context.currentTime);}
  for(const source of [...sources.keys()])silence(source);
  if(graph){for(const node of graph.owned){try{node.disconnect();}catch{}}graph=null;}
 }
 return {schedule,stop,dispose(){stop();disposed=true;noiseBuffer=null;},snapshot(){return {activeSources:sources.size,peakSources,scheduledSources,droppedVoices,graphGeneration};}};
}
