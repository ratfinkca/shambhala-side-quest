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

// Neon Grove: minor-key, offbeat sub pulses, metallic stabs and clipped arpeggios.
export function neonVoices(step,phase,multiplier,flowActive=false){
 if(phase==='ended')return [];
 const drop=phase==='drop',root=[55,55,65.41,49][Math.floor(step/32)%4],voices=[];
 if(step%2===0)voices.push({kind:'kick',frequency:140,endFrequency:38,duration:.2,type:'sine',volume:drop?.14:.1});
 if([1,3,6,9,11,14].includes(step%16)){
  voices.push({kind:'bass',frequency:root*(step%16===14?1.5:1),duration:drop?.22:.15,type:'triangle',volume:drop?.075:.05});
  if(drop)voices.push({kind:'bass-edge',frequency:root*2,duration:.09,type:'sawtooth',volume:.008});
 }
 voices.push({kind:'hat',noise:true,filter:step%2?7500:9500,duration:step%2?.07:.025,volume:step%2?.023:.01});
 if(step%8===4)voices.push({kind:'snare',noise:true,filter:1100,duration:.12,volume:.047});
 if(step%32===0)for(const ratio of [4,4.75,6])voices.push({kind:'pad',frequency:root*ratio,duration:1.4,attack:.16,type:'triangle',volume:.007});
 if([0,6,11,14].includes(step%16))voices.push({kind:'melody',frequency:root*[4,4.75,6,7][Math.floor(step/4)%4],duration:.12,type:'triangle',volume:multiplier>=3?.027:.019});
 if(phase==='build')voices.push({kind:'build',noise:true,filter:3000+(step%12)*180,duration:.06,volume:.017+(step%12)*.001});
 if(flowActive&&step%2===1)voices.push({kind:'flow',frequency:root*[8,9.5,12,14][Math.floor(step/2)%4],duration:.18,type:'sine',volume:.016});
 return voices;
}

// Sunrise Clearing: major harmony, gently rising bell phrases and a rolling groove.
export function sunriseVoices(step,phase,multiplier,flowActive=false){
 if(phase==='ended')return [];
 const drop=phase==='drop',root=[65.41,87.31,98,65.41][Math.floor(step/32)%4],voices=[];
 if(step%2===0)voices.push({kind:'kick',frequency:105,endFrequency:46,duration:.23,type:'sine',volume:drop?.12:.08});
 if([1,5,9,12,15].includes(step%16))voices.push({kind:'bass',frequency:root*(step%16===15?1.5:1),duration:.25,type:'triangle',volume:drop?.055:.035});
 if(step%2===1)voices.push({kind:'hat',noise:true,filter:8000,duration:.065,volume:.018});
 if(step%8===4)voices.push({kind:'snare',noise:true,filter:2200,duration:.16,volume:.025});
 if(step%16===0)for(const ratio of [2,2.5,3,3.75])voices.push({kind:'pad',frequency:root*ratio,duration:2.7,attack:.45,type:'sine',volume:.01});
 if([0,3,6,10,14].includes(step%16)){
  const note=root*[4,5,6,7.5,8][[0,3,6,10,14].indexOf(step%16)];
  voices.push({kind:'melody',frequency:note,duration:.8,attack:.012,type:'sine',volume:multiplier>=3?.024:.017});
  voices.push({kind:'bell-air',frequency:note*2,duration:.24,type:'sine',volume:.004});
 }
 if(phase==='build')voices.push({kind:'build',frequency:root*(4+(step%12)/2),duration:.17,type:'sine',volume:.013});
 if(flowActive&&step%2===0)voices.push({kind:'flow',frequency:root*[8,10,12,15][Math.floor(step/2)%4],duration:.5,type:'sine',volume:.012});
 return voices;
}

export function stageVoices(stageId,step,phase,multiplier,flowActive=false){
 const arrange={forest:forestVoices,neon:neonVoices,sunrise:sunriseVoices}[stageId]||beatVoices;
 return arrange(step,phase,multiplier,flowActive);
}
