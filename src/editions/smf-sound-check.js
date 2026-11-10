import {getTiming,phaseAt} from '../stage-clock.js';
import {smfPreviewVoices} from './smf-music.js';
import {smfPreviewVoices as sketchVoices} from './smf-music-sketch.js';
import {createSMFInstrumentRack} from './smf-instruments.js';

// Frozen pre-pass synthesis for an honest, same-passage listening comparison.
function sketchRack(context,destination){
 const buffer=context.createBuffer(1,context.sampleRate,context.sampleRate);
 const data=buffer.getChannelData(0);let seed=327;
 for(let i=0;i<data.length;i++){seed=(1664525*seed+1013904223)>>>0;data[i]=seed/2147483648-1;}
 return {schedule(voice,at){
  const source=voice.noise?context.createBufferSource():context.createOscillator();
  const gain=context.createGain(),duration=voice.duration;
  let filter;
  if(voice.noise){source.buffer=buffer;filter=context.createBiquadFilter();filter.type='highpass';filter.frequency.value=voice.filter;source.connect(filter);filter.connect(gain);}
  else{source.type=voice.type??'sine';source.frequency.setValueAtTime(voice.frequency,at);if(voice.endFrequency)source.frequency.exponentialRampToValueAtTime(voice.endFrequency,at+duration);source.connect(gain);}
  gain.gain.setValueAtTime(0,at);gain.gain.linearRampToValueAtTime(voice.volume,at+(voice.noise?.003:voice.attack??.008));gain.gain.exponentialRampToValueAtTime(.001,at+duration);
  gain.connect(destination);source.start(at);source.stop(at+duration+.02);
  source.onended=()=>{source.disconnect();filter?.disconnect();gain.disconnect();};
 },dispose(){},snapshot(){return {droppedVoices:0}}};
}

export function soundCheckWindow(timing){
 const bar=240000/timing.bpm,drop=timing.dropStartsMs[0];
 return {startMs:Math.max(0,Math.round(drop/bar)-4)*bar,durationMs:8*bar};
}

export function soundCheckEvents(timing,voices=smfPreviewVoices){
 const window=soundCheckWindow(timing),interval=60000/(timing.bpm*timing.stepsPerBeat);
 const first=Math.round(window.startMs/interval),count=8*timing.beatsPerBar*timing.stepsPerBeat,events=[];
 for(let step=first;step<first+count;step++){
  const onset=Math.round(step*interval);
  for(const voice of voices({timing,step,phase:phaseAt(onset,timing).phase,multiplier:1,flowActive:false}))events.push({voice,at:Math.max(0,(onset-window.startMs+(voice.offsetMs??0))/1000)});
 }
 return events.sort((a,b)=>a.at-b.at);
}

export function measureAudio(buffer){
 let peak=0,sum=0,count=0;
 for(let channel=0;channel<buffer.numberOfChannels;channel++)for(const sample of buffer.getChannelData(channel)){
  if(!Number.isFinite(sample))throw new Error('Non-finite rendered audio');
  peak=Math.max(peak,Math.abs(sample));sum+=sample*sample;count++;
 }
 return {peak,rms:Math.sqrt(sum/Math.max(1,count))};
}

export function audioWav(buffer,gain=1){
 const channels=buffer.numberOfChannels,length=buffer.length,bytes=new ArrayBuffer(44+length*channels*2),view=new DataView(bytes);
 const text=(offset,value)=>{for(let i=0;i<value.length;i++)view.setUint8(offset+i,value.charCodeAt(i));};
 text(0,'RIFF');view.setUint32(4,bytes.byteLength-8,true);text(8,'WAVE');text(12,'fmt ');view.setUint32(16,16,true);view.setUint16(20,1,true);view.setUint16(22,channels,true);view.setUint32(24,buffer.sampleRate,true);view.setUint32(28,buffer.sampleRate*channels*2,true);view.setUint16(32,channels*2,true);view.setUint16(34,16,true);text(36,'data');view.setUint32(40,bytes.byteLength-44,true);
 const data=Array.from({length:channels},(_,i)=>buffer.getChannelData(i));
 for(let i=0;i<length;i++)for(let channel=0;channel<channels;channel++){
  const value=Math.max(-1,Math.min(1,data[channel][i]*gain));view.setInt16(44+(i*channels+channel)*2,Math.round(value*(value<0?32768:32767)),true);
 }
 return bytes;
}

export async function renderSoundCheck(stage,{sketch=false,Context=globalThis.OfflineAudioContext}={}){
 if(!Context)throw new Error('This browser cannot render the sound check. Try the live venue preview.');
 const timing=getTiming(stage.timingId),window=soundCheckWindow(timing),seconds=window.durationMs/1000;
 const context=new Context(2,Math.ceil((seconds+.5)*44100),44100),bus=context.createGain();
 bus.gain.value=.45;bus.connect(context.destination);
 const rack=(sketch?sketchRack:createSMFInstrumentRack)(context,bus),voices=sketch?sketchVoices:smfPreviewVoices;
 const events=soundCheckEvents(timing,voices);
 let cursor=0;
 const queue=until=>{while(cursor<events.length&&events[cursor].at<until){const {voice,at}=events[cursor++];if(rack.schedule(voice,at)===false)throw new Error('An instrument could not be rendered.');}};
 // Feed the offline engine in short blocks just like the live lookahead. This
 // exercises the real source limit instead of queueing a whole song at once.
 try{
  queue(.5);
  const gates=[];let schedulingError;
  for(let at=.5;at<seconds;at+=.5)gates.push([at,context.suspend(at)]);
  const pump=(async()=>{for(const [at,gate]of gates){await gate;if(!schedulingError){try{queue(at+.5);}catch(error){schedulingError=error;}}await context.resume();}})();
  const [buffer]=await Promise.all([context.startRendering(),pump]);
  if(schedulingError)throw schedulingError;
  const stats=measureAudio(buffer),diagnostics=rack.snapshot?.();
  if(stats.rms<1e-6)throw new Error('The sound check rendered silence.');
  if(diagnostics?.droppedVoices)throw new Error('The sound check exceeded its voice budget.');
  const gain=Math.min(.075/stats.rms,.90/stats.peak);
  return {wav:audioWav(buffer,gain),stats,diagnostics,gain,seconds:buffer.duration};
 }finally{rack.dispose();bus.disconnect();}
}
