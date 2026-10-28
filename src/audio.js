import { cycleAt } from './festival.js';
import { stageVoices, BEAT_MS } from './music.js';

export function createAudio(contextFactory = () => new (window.AudioContext || window.webkitAudioContext)()) {
  let noiseBuffer;
  let context, musicBus, effectsBus, enabled = false, lastStep = -1;
  let volumes = { music: .45, effects: .65 };
  function applyVolumes() { if (context) { musicBus.gain.setValueAtTime(volumes.music, context.currentTime); effectsBus.gain.setValueAtTime(volumes.effects, context.currentTime); } }
  const nodes = new Set();

  function stop() {
    for (const node of nodes) { try { node.stop(); } catch {} }
    nodes.clear();
    lastStep = -1;
  }

  function tone(frequency, duration = .12, delay = 0, type = 'sine', volume = .06, endFrequency, channel = 'effects', attack = .008) {
    if (!enabled || !context || context.state !== 'running') return;
    try {
      const oscillator = context.createOscillator(), gain = context.createGain();
      const at = context.currentTime + delay;
      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, at);
      if (endFrequency) oscillator.frequency.exponentialRampToValueAtTime(endFrequency, at + duration);
      gain.gain.setValueAtTime(0, at);
      gain.gain.linearRampToValueAtTime(volume, at + attack);
      gain.gain.exponentialRampToValueAtTime(.001, at + duration);
      oscillator.connect(gain); gain.connect(channel === 'music' ? musicBus : effectsBus);
      nodes.add(oscillator);
      oscillator.onended = () => { nodes.delete(oscillator); oscillator.disconnect(); gain.disconnect(); };
      oscillator.start(at); oscillator.stop(at + duration + .02);
    } catch { /* Audio is optional; gameplay continues without it. */ }
  }

  function percussion(voice) {
    if(!enabled||!context||context.state!=='running')return;
    try {
      if(!noiseBuffer){
        noiseBuffer=context.createBuffer(1,context.sampleRate,context.sampleRate);
        const samples=noiseBuffer.getChannelData(0);
        for(let i=0;i<samples.length;i++)samples[i]=Math.random()*2-1;
      }
      const source=context.createBufferSource(),filter=context.createBiquadFilter(),gain=context.createGain();
      source.buffer=noiseBuffer;filter.type='highpass';filter.frequency.value=voice.filter;
      const at=context.currentTime;
      gain.gain.setValueAtTime(0,at);gain.gain.linearRampToValueAtTime(voice.volume,at+.003);
      gain.gain.exponentialRampToValueAtTime(.001,at+voice.duration);
      source.connect(filter);filter.connect(gain);gain.connect(musicBus);nodes.add(source);
      source.onended=()=>{nodes.delete(source);source.disconnect();filter.disconnect();gain.disconnect()};
      source.start(at);source.stop(at+voice.duration+.02);
    }catch { /* Optional audio must never interrupt a run. */ }
  }

  return {
    setVolumes(value) { for (const key of ['music', 'effects']) if (Number.isFinite(value[key])) volumes[key] = Math.max(0, Math.min(1, value[key])); applyVolumes(); },
    setEnabled(value) {
      enabled = value;
      if (!value) { stop(); return; }
      try {
        if (!context) { context = contextFactory(); musicBus = context.createGain(); effectsBus = context.createGain(); musicBus.connect(context.destination); effectsBus.connect(context.destination); applyVolumes(); }
        context.resume().catch(() => {});
      } catch {}
    },
    // Active game time drives the groove; no independent timer survives pause.
    sync(round,stageId) {
      if (!enabled || !context || context.state !== 'running' || round.ended) return;
      const elapsed = 60000 - round.remainingMs;
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
