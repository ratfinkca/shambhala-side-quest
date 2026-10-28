export const BEAT_MS=500; // 120 BPM; audio and visual bass share this clock.
export function beatVoices(step, phase, multiplier, flowActive = false) {
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
  if (flowActive) voices.push({ kind: 'flow', frequency: [523.25, 622.25, 783.99, 932.33][step % 4], duration: .3, type: 'sine', volume: .022 });
  return voices;
}

// Living Forest prototype: a 16-beat phrase, with room for pickup sounds.
export function forestVoices(step, phase, multiplier, flowActive=false) {
  if(phase==='ended')return [];
  const beat=step%32, drop=phase==='drop', build=phase==='build';
  const root=[65.41,77.78,58.27,87.31][Math.floor(step/32)%4];
  const voices=[];
  if(step%2===0)voices.push({kind:'kick',frequency:120,endFrequency:43,duration:.22,type:'sine',volume:drop?.13:.085});
  if([1,4,7,10,12,15].includes(step%16))voices.push({kind:'bass',frequency:root*(step%16===15?2:1),duration:.19,type:'triangle',volume:drop?.065:.04});
  if(step%2===1)voices.push({kind:'hat',noise:true,filter:6500,duration:.055,volume:drop?.028:.018});
  if(step%8===4)voices.push({kind:'snare',noise:true,filter:1500,duration:.13,volume:.038});
  if([3,11,14].includes(step%16))voices.push({kind:'wood',frequency:step%16===14?620:410,endFrequency:180,duration:.055,type:'sine',volume:.026});
  if(beat===0)for(const ratio of [2,3,4.75])voices.push({kind:'pad',frequency:root*ratio,duration:2.8,attack:.5,type:'sine',volume:.011});
  if([2,9,18,25].includes(beat))voices.push({kind:'melody',frequency:root*[4,6,4.75,7][Math.floor(beat/8)],duration:.65,attack:.015,type:'sine',volume:multiplier>=3?.025:.016});
  if(build)voices.push({kind:'build',noise:true,filter:2200+(step%12)*200,duration:.07,volume:.012+(step%12)*.001});
  if(flowActive&&step%2===1)voices.push({kind:'flow',frequency:root*[8,9.5,12,14][Math.floor(step/2)%4],duration:.35,type:'sine',volume:.016});
  return voices;
}
