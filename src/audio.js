import {getTiming,roundTiming,elapsedMs} from './stage-clock.js';
import {createMusicTransport} from './music-transport.js';
import { cycleAt } from './festival.js';
import { stageVoices, BEAT_MS } from './music.js';

export function createAudio(contextFactory = () => new (window.AudioContext || window.webkitAudioContext)(), {timedVoices,useTransport=false,createMusicRenderer}={}) {
  let noiseBuffer;
  let context, musicBus, effectsBus, musicRenderer, enabled = false, lastStep = -1;
  let volumes = { music: .45, effects: .65 };
  function applyVolumes() { if (context) { musicBus.gain.setValueAtTime(volumes.music, context.currentTime); effectsBus.gain.setValueAtTime(volumes.effects, context.currentTime); } }
  const nodes = new Map();
  const musicNodes = new Set();
  function cancelNode(node){try {node.stop();}catch {} nodes.get(node)?.();}
  const transport=createMusicTransport({voices:timedVoices||(()=>[]),schedule:(voice,at)=>{
    at+=Number.isFinite(voice.offsetMs)?Math.max(0,Math.min(24,voice.offsetMs))/1000:0;
    if(musicRenderer){try{musicRenderer.schedule(voice,at);}catch{/* Optional music must not interrupt play. */}return;}
    if(voice.noise)percussion(voice,at);
    else tone(voice.frequency,voice.duration,0,voice.type,voice.volume,voice.endFrequency,'music',voice.attack,at);
  },cancel:()=>{musicRenderer?.stop();for(const node of [...musicNodes])cancelNode(node);}});

  function stop() {
    transport.stop();
    for (const node of [...nodes.keys()])cancelNode(node);
    nodes.clear();
    lastStep = -1;
  }

  function tone(frequency, duration = .12, delay = 0, type = 'sine', volume = .06, endFrequency, channel = 'effects', attack = .008, absoluteAt) {
    if (!enabled || !context || context.state !== 'running') return;
    try {
      const oscillator = context.createOscillator(), gain = context.createGain();
      const at = absoluteAt ?? context.currentTime + delay;
      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, at);
      if (endFrequency) oscillator.frequency.exponentialRampToValueAtTime(endFrequency, at + duration);
      gain.gain.setValueAtTime(0, at);
      gain.gain.linearRampToValueAtTime(volume, at + attack);
      gain.gain.exponentialRampToValueAtTime(.001, at + duration);
      oscillator.connect(gain); gain.connect(channel === 'music' ? musicBus : effectsBus);
      const cleanup=()=>{nodes.delete(oscillator);musicNodes.delete(oscillator);oscillator.disconnect();gain.disconnect();};
      nodes.set(oscillator,cleanup);if(channel==='music')musicNodes.add(oscillator);
      oscillator.onended=cleanup;
      oscillator.start(at); oscillator.stop(at + duration + .02);
    } catch { /* Audio is optional; gameplay continues without it. */ }
  }

  function percussion(voice, absoluteAt) {
    if(!enabled||!context||context.state!=='running')return;
    try {
      if(!noiseBuffer){
        noiseBuffer=context.createBuffer(1,context.sampleRate,context.sampleRate);
        const samples=noiseBuffer.getChannelData(0);
        for(let i=0;i<samples.length;i++)samples[i]=Math.random()*2-1;
      }
      const source=context.createBufferSource(),filter=context.createBiquadFilter(),gain=context.createGain();
      source.buffer=noiseBuffer;filter.type='highpass';filter.frequency.value=voice.filter;
      const at=absoluteAt??context.currentTime;
      gain.gain.setValueAtTime(0,at);gain.gain.linearRampToValueAtTime(voice.volume,at+.003);
      gain.gain.exponentialRampToValueAtTime(.001,at+voice.duration);
      source.connect(filter);filter.connect(gain);gain.connect(musicBus);musicNodes.add(source);
      const cleanup=()=>{nodes.delete(source);musicNodes.delete(source);source.disconnect();filter.disconnect();gain.disconnect()};
      nodes.set(source,cleanup);source.onended=cleanup;
      source.start(at);source.stop(at+voice.duration+.02);
    }catch { /* Optional audio must never interrupt a run. */ }
  }

  return {
    setVolumes(value) { for (const key of ['music', 'effects']) if (Number.isFinite(value[key])) volumes[key] = Math.max(0, Math.min(1, value[key])); applyVolumes(); },
    setEnabled(value) {
      enabled = value;
      if (!value) { stop(); return; }
      try {
        if (!context) { context = contextFactory(); musicBus = context.createGain(); effectsBus = context.createGain(); musicBus.connect(context.destination); effectsBus.connect(context.destination); applyVolumes(); musicRenderer=createMusicRenderer?.(context,musicBus); }
        context.resume().catch(() => {});
      } catch {}
    },
    // Active game time drives the groove; no independent timer survives pause.
    sync(round,stageId) {
      if (!enabled || !context || context.state !== 'running' || round.ended) {transport.stop();return;}
      const timing=roundTiming(round),elapsed=elapsedMs(round);
      if(useTransport||timing!==getTiming()){
        transport.sync({timing,elapsedMs:elapsed,audioNowSec:context.currentTime,multiplier:round.multiplier,flowActive:round.flowMs>0});return;
      }
      const step = Math.floor(elapsed / (BEAT_MS/2));
      if (step === lastStep) return;
      lastStep = step;
      for (const voice of stageVoices(stageId,step, cycleAt(elapsed).phase, round.multiplier, round.flowMs > 0)) {
        if(voice.noise)percussion(voice);
        else tone(voice.frequency, voice.duration, 0, voice.type, voice.volume, voice.endFrequency, 'music',voice.attack);
      }
    },
    pickup(multiplier) { tone([523.25, 622.25, 783.99, 932.33, 1046.5][multiplier - 1], .12, 0, 'sine', .04); },
    closePass() { tone(783.99, .15, 0, 'sine', .035); tone(1046.5, .2, .07, 'sine', .035); },
    drop() { tone(130.81, .65, 0, 'sine', .17, 32.7); },
    celebrate() { [130.81, 261.63, 311.13, 392].forEach((n, i) => tone(n, .3, i * .07, i ? 'sine' : 'triangle', .04)); },
    stop,
  };
}
