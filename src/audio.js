import { cycleAt } from './festival.js';
import { beatVoices } from './music.js';

export function createAudio() {
  let context, enabled = false, lastStep = -1;
  const nodes = new Set();

  function stop() {
    for (const node of nodes) { try { node.stop(); } catch {} }
    nodes.clear();
    lastStep = -1;
  }

  function tone(frequency, duration = .12, delay = 0, type = 'sine', volume = .06, endFrequency) {
    if (!enabled || !context || context.state !== 'running') return;
    try {
      const oscillator = context.createOscillator(), gain = context.createGain();
      const at = context.currentTime + delay;
      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, at);
      if (endFrequency) oscillator.frequency.exponentialRampToValueAtTime(endFrequency, at + duration);
      gain.gain.setValueAtTime(0, at);
      gain.gain.linearRampToValueAtTime(volume, at + .008);
      gain.gain.exponentialRampToValueAtTime(.001, at + duration);
      oscillator.connect(gain); gain.connect(context.destination);
      nodes.add(oscillator);
      oscillator.onended = () => { nodes.delete(oscillator); oscillator.disconnect(); gain.disconnect(); };
      oscillator.start(at); oscillator.stop(at + duration + .02);
    } catch { /* Audio is optional; gameplay continues without it. */ }
  }

  return {
    setEnabled(value) {
      enabled = value;
      if (!value) { stop(); return; }
      try {
        context ??= new (window.AudioContext || window.webkitAudioContext)();
        context.resume().catch(() => {});
      } catch {}
    },
    // Active game time drives the groove; no independent timer survives pause.
    sync(round) {
      if (!enabled || !context || context.state !== 'running' || round.ended) return;
      const elapsed = 60000 - round.remainingMs;
      const step = Math.floor(elapsed / 250);
      if (step === lastStep) return;
      lastStep = step;
      for (const voice of beatVoices(step, cycleAt(elapsed).phase, round.multiplier)) {
        tone(voice.frequency, voice.duration, 0, voice.type, voice.volume, voice.endFrequency);
      }
    },
    pickup(multiplier) { tone([523.25, 622.25, 783.99, 932.33, 1046.5][multiplier - 1], .12, 0, 'sine', .04); },
    closePass() { tone(783.99, .15, 0, 'sine', .035); tone(1046.5, .2, .07, 'sine', .035); },
    drop() { tone(130.81, .65, 0, 'sine', .17, 32.7); },
    celebrate() { [130.81, 261.63, 311.13, 392].forEach((n, i) => tone(n, .3, i * .07, i ? 'sine' : 'triangle', .04)); },
    stop,
  };
}
