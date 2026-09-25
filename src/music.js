export function beatVoices(step, phase, multiplier) {
  if (phase === 'ended') return [];
  const voices = [];
  const drop = phase === 'drop';
  if (step % 2 === 0) {
    voices.push({ kind: 'kick', frequency: 115, endFrequency: 42, duration: .2, type: 'sine', volume: drop ? .15 : .095 });
    const bass = [65.41, 65.41, 77.78, 58.27][Math.floor(step / 8) % 4];
    voices.push({ kind: 'bass', frequency: bass, duration: .24, type: 'triangle', volume: drop ? .055 : .028 });
  }
  voices.push({ kind: 'hat', frequency: step % 2 ? 6400 : 8000, duration: .027, type: 'triangle', volume: .009 });
  if (step % 4 === 2) voices.push({ kind: 'snare', frequency: 185, endFrequency: 85, duration: .075, type: 'triangle', volume: .037 });
  if (multiplier >= 3 && step % 2 === 0) {
    voices.push({ kind: 'melody', frequency: [261.63, 311.13, 392, 466.16][Math.floor(step / 2) % 4], duration: .22, type: 'sine', volume: .025 });
  }
  if (phase === 'build') voices.push({ kind: 'build', frequency: 180 + (step % 60 - 48) * 35, duration: .08, type: 'sine', volume: .024 });
  return voices;
}
