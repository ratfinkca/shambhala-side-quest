// Frozen pre-sound-pass arrangements for DEV-only matched-level comparisons.
// Original phrase-length sketches, including a 48-bar Village arrangement.
// No samples, quoted hooks or claims to reproduce a particular artist.
export function smfPreviewVoices({timing,step,phase,multiplier=1,flowActive=false}){
 const totalSteps=Math.round(timing.durationMs*timing.bpm*timing.stepsPerBeat/60000);
 if(phase==='ended'||step<0||step>=totalSteps)return [];
 if(timing.id==='smf-amp-clock-preview-1')return ampVoices(timing,step,flowActive);
 if(timing.id==='smf-village-clock-preview-1')return villageVoices(timing,step,flowActive);
 const fractal=timing.id==='smf-fractal-clock-preview-1',grove=timing.id==='smf-grove-clock-preview-1';
 if(fractal||grove)return forestVoices(timing,step,fractal,multiplier,flowActive);
 const living=timing.id==='smf-living-room-clock-preview-1',pagoda=timing.id==='smf-pagoda-clock-preview-1';
 if(!living&&!pagoda)return [];
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
 return trimVoices(voices,timing,step);
}

function forestVoices(timing,step,fractal,multiplier,flowActive){
 const bar=Math.floor(step/16),beatStep=step%16;
 const section=Math.floor(bar/8),barInPhrase=bar%8;
 const answer=barInPhrase>=4;
 const roots=fractal?[55,65.406,49,55]:[49,58.27,43.65,49];
 const root=section===3?roots[0]:roots[section];
 const voices=[];
 const tone=(kind,frequency,duration,volume,type='sine',extra={})=>{
  voices.push({kind,frequency,duration,volume,type,...extra});
 };
 const noise=(kind,filter,duration,volume,offsetMs=0)=>{
  voices.push({kind,noise:true,filter,duration,volume,offsetMs});
 };

 // Four 8-bar sections: establish the beat, open up the hook, leave room
 // for a dub/bass response, then return to the opening key and fuller kit.
 const kicks=fractal
  ? (section===2?[0,10]:answer?[0,6,8,11]:[0,3,8,10])
  : (section===2?[0,11]:bar%2?[0,7,10]:[0,10]);
 if(kicks.includes(beatStep))tone('kick',fractal?124:108,.16,.075,'sine',{endFrequency:fractal?44:39});
 if(beatStep===4||beatStep===12)noise('snare',fractal?2500:1850,.09,section===2?.021:.032);
 const hats=section===2?[2,10,14]:fractal?[2,6,9,11,14,15]:[2,6,7,10,14];
 if(hats.includes(beatStep))noise('hat',fractal?7900:7100,.042,beatStep%2?.007:.015,beatStep%2?18:0);
 if(section!==0&&beatStep===15&&barInPhrase%4===3)noise('snare',3300,.045,.014,14);

 const bassSteps=fractal?(answer?[0,5,7,10,14]:[0,3,6,9,14]):(answer?[1,7,13]:[0,6,11]);
 if(bassSteps.includes(beatStep)){
  const ratio=beatStep>=13?(answer?1.5:1.19):1;
  tone('bass',root*ratio,fractal?.16:.30,section===0?.034:.048,fractal?'triangle':'sine');
 }
 const chordSteps=fractal?(section===2?[0]:[0,10]):(section===2?[0,11]:[0,6,14]);
 if(chordSteps.includes(beatStep)){
  for(const ratio of (fractal?[4,5,6,7.12]:[4,4.76,6,9])){
   tone('pad',root*ratio,fractal?.19:.32,fractal?.008:.006,fractal?'triangle':'sine',{attack:.022});
  }
 }
 if(!fractal&&beatStep===9&&bar%2===0)tone('echo',root*6,.31,.006);
 const melodySteps=section===2?[5,13]:fractal?[3,7,11,14]:[3,9,15];
 const noteIndex=melodySteps.indexOf(beatStep);
 if(noteIndex>=0){
  const motif=fractal?[6,8,10,9,8,6,5,6]:[8,7.12,6,4.76,6,8];
  const note=motif[(noteIndex+(answer?3:0)+(section===2?2:0))%motif.length];
  tone('melody',root*note,fractal?.13:.24,(section===0?.012:.017)+(multiplier>=3?.003:0),
   fractal?'triangle':'sine',{offsetMs:beatStep%2?14:0});
 }
 if(flowActive&&beatStep%4===2)tone('flow',root*[8,10,12,15][Math.floor(beatStep/4)],.18,.012);
 return trimVoices(voices,timing,step);
}

function ampVoices(timing,step,flowActive){
 const bar=Math.floor(step/16),local=step%16,section=Math.floor(bar/8);
 const answer=bar%8>=4;
 const root=[41.2,36.71,49,41.2][section];
 const voices=[];
 const kickSteps=section===2?[0]:answer?[0,6,11]:[0,7];
 if(kickSteps.includes(local))voices.push({kind:'kick',frequency:122,endFrequency:37,duration:.18,volume:.088});
 if(local===8)voices.push({kind:'snare',noise:true,filter:2100,duration:.15,volume:.036});
 if((section===2?[2,14]:[2,6,10,14]).includes(local)){
  voices.push({kind:'hat',noise:true,filter:7000,duration:.045,volume:.012});
 }
 const bassSteps=section===2?[0,11]:answer?[0,5,10,13]:[0,3,11];
 if(bassSteps.includes(local)){
  const frequency=root*(local>=10&&answer?1.5:1);
  voices.push({kind:'bass',frequency,duration:local===0?.39:.21,volume:.055});
  if(section===1||section===3){
   voices.push({kind:'bass',frequency:frequency*2,type:'triangle',duration:.19,volume:.013});
  }
 }
 if(local===0&&bar%4===0){
  for(const ratio of [4,6,8])voices.push({kind:'pad',frequency:root*ratio,duration:1.45,attack:.17,volume:.006});
 }
 if(local===(answer?13:5)||local===15&&bar%4===3){
  voices.push({kind:'melody',frequency:root*(answer?9:6),type:'triangle',duration:.16,volume:.016});
 }
 if(flowActive&&local%4===2)voices.push({kind:'flow',frequency:root*12,duration:.17,volume:.01});
 return trimVoices(voices,timing,step);
}

function villageVoices(timing,step,flowActive){
 const bar=Math.floor(step/16),local=step%16;
 // 16 bars of rolling drums, a second 16-bar arc with a halftime break,
 // then eight bars back on the groove and an eight-bar dawn payoff.
 const halfTime=bar>=16&&bar<24;
 const finale=bar>=40;
 const roots=bar<16||finale?[49,58.27,65.41,43.65]:[43.65,49,41.2,58.27];
 const harmonyBar=finale?bar-40:bar;
 const root=bar>=47?roots[0]:roots[Math.floor(harmonyBar/4)%4];
 const voices=[];
 const kickSteps=halfTime?[0,10]:bar%2?[0,7,11]:[0,10];
 if(kickSteps.includes(local))voices.push({kind:'kick',frequency:133,endFrequency:42,duration:.13,volume:.075});
 if(halfTime?local===8:local===4||local===12){
  voices.push({kind:'snare',noise:true,filter:2650,duration:.09,volume:.038});
 }
 if(!halfTime&&[7,15].includes(local))voices.push({kind:'snare',noise:true,filter:3300,duration:.035,volume:.008,offsetMs:9});
 if((halfTime?[2,6,14]:[2,6,8,10,14]).includes(local)){
  voices.push({kind:'hat',noise:true,filter:8200,duration:.032,volume:.014});
 }
 if((halfTime?[0,11]:[0,6,11]).includes(local)){
  const frequency=root*(local===11&&bar%4===3?1.5:1);
  voices.push({kind:'bass',frequency,duration:halfTime?.38:.26,volume:.046});
  if(!halfTime){
   for(const detune of [.995,1.006]){
    voices.push({kind:'bass',frequency:frequency*2*detune,type:'sawtooth',duration:.21,attack:.045,volume:.006});
   }
  }
 }
 if(local===0&&bar%4===0){
  for(const ratio of [4,4.76,6,8])voices.push({kind:'pad',frequency:root*ratio,duration:finale?1.65:1.15,attack:.14,volume:.007});
 }
 const melodySteps=finale?[2,6,10,14]:halfTime?[5,13]:[3,9,14];
 const noteIndex=melodySteps.indexOf(local);
 if(noteIndex>=0){
  const motif=finale?[8,10,12,9,8,6]:[6,8,7.12,4.76,6,8];
  const frequency=root*motif[(noteIndex+bar%4)%motif.length];
  voices.push({kind:'melody',frequency,type:finale?'sine':'triangle',duration:finale?.27:.14,volume:finale?.019:.012});
 }
 if(flowActive&&local%4===2)voices.push({kind:'flow',frequency:root*15,duration:.16,volume:.01});
 return trimVoices(voices,timing,step);
}

function trimVoices(voices,timing,step){
 const onset=Math.round(step*60000/(timing.bpm*timing.stepsPerBeat));
 return voices.map(v=>{const duration=Math.min(v.duration,(timing.durationMs-onset-(v.offsetMs||0)-21)/1000);return {...v,duration,...(v.attack?{attack:Math.min(v.attack,duration*.4)}:{})};}).filter(v=>v.duration>.01);
}
