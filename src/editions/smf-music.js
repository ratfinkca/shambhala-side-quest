// Original, short 32-bar sketches: establish / main / contrast / tonal return.
// No samples, quoted hooks or claims to reproduce a particular artist.
export function smfPreviewVoices({timing,step,phase,multiplier=1,flowActive=false}){
 const living=timing.id==='smf-living-room-clock-preview-1',pagoda=timing.id==='smf-pagoda-clock-preview-1';
 if((!living&&!pagoda)||phase==='ended'||step<0||step>=512)return [];
 const bar=Math.floor(step/16),section=Math.floor(bar/8),answer=bar%8>=4,local=step%16;
 const roots=living?[65.406,87.307,73.416,65.406]:[55,65.406,73.416,55];
 const harmonyBar=section===3?bar-24:bar,root=bar>=28?roots[0]:roots[Math.floor(harmonyBar/4)%4],voices=[];
 const push=(kind,frequency,duration,volume,type='sine',extra={})=>voices.push({kind,frequency,duration,volume,type,...extra});
 if(step%(section===2?8:4)===0)push('kick',living?112:135,.19,living?.065:.085,'sine',{endFrequency:living?46:38});
 if(living?[2,5,8,11,14].includes(local):[2,6,10,14].includes(local))push('bass',root*(local===14&&answer?1.5:1),living?.21:.18,section===0?.028:.04,'triangle');
 if(local%4===2)voices.push({kind:'hat',noise:true,filter:living?6400:8500,duration:living?.06:.045,volume:section===0?.012:.018,offsetMs:living?20:0});
 if(local%8===7&&section!==0)voices.push({kind:'hat',noise:true,filter:9000,duration:.025,volume:.006,offsetMs:living?12:0});
 if(local===4||local===12)voices.push({kind:'snare',noise:true,filter:living?1700:2100,duration:living?.12:.09,volume:section===2?.015:.025});
 if(step%64===0){for(const ratio of (living?[4,5,6,7.5]:[4,4.75,6,7]))push('pad',root*ratio,living?1.9:1.5,.007,living?'sine':'triangle',{attack:.12});}
 const melodySlots=living?[3,7,10,14]:[0,2,5,7,8,10,13,15];
 if(melodySlots.includes(local)){
  const notes=living?[4,5,6,7.5,8,6,5,4]:[4,6,8,9.5,8,6,4.75,6],index=melodySlots.indexOf(local),note=notes[(index+(answer?3:0)+(section===2?2:0))%notes.length];
  push('melody',root*note,living?.34:.13,(section===0?.011:.016)+(multiplier>=3?.003:0),living?'sine':'triangle',{offsetMs:living?12:0});
 }
 if(living&&[3,11].includes(local))push('wood',answer?620:430,.055,.014,'sine',{endFrequency:180});
 if(!living&&section===3&&step%8===6)push('air',root*12,.25,.005);
 if(flowActive&&step%4===2)push('flow',root*[8,10,12,15][Math.floor(step/4)%4],.22,.012);
 const onset=Math.round(step*60000/(timing.bpm*timing.stepsPerBeat));
 return voices.map(v=>{const duration=Math.min(v.duration,(timing.durationMs-onset-(v.offsetMs||0)-21)/1000);return {...v,duration,...(v.attack?{attack:Math.min(v.attack,duration*.4)}:{})};}).filter(v=>v.duration>.01);
}
