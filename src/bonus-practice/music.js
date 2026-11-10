import {getTiming} from '../stage-clock.js';

// Original miniature arrangements, not recordings or imitations of the named
// DJs. Eight-bar chapters, four-bar questions/answers and dry pre-drop space
// make these small bonus rooms feel like sets rather than endless loops.
const NOTE=(root,semitones)=>root*2**(semitones/12);
const ARRANGERS={
 'smf-rabbit-hole-bonus-preview-1':rabbitHole,
 'smf-secret-garden-bonus-preview-1':secretGarden,
 'smf-ikigai-mori-bonus-preview-1':ikigaiMori,
 'smf-villagio-bonus-preview-1':villagio,
};

export function bonusPreviewVoices({timing,step,phase,multiplier=1,flowActive=false}={}){
 const arrange=timing&&Object.hasOwn(ARRANGERS,timing.id)&&ARRANGERS[timing.id];
 if(!arrange||timing!==getTiming(timing.id)||phase==='ended'||!Number.isInteger(step)||step<0)return [];
 const interval=60000/(timing.bpm*timing.stepsPerBeat),totalSteps=Math.round(timing.durationMs/interval);
 if(step>=totalSteps)return [];
 const bar=Math.floor(step/16),local=step%16,totalBars=totalSteps/16;
 const downbeats=timing.dropStartsMs.map(ms=>Math.round(ms/interval));
 const nextDrop=downbeats.find(onset=>onset>step),build=nextDrop!==undefined&&step>=nextDrop-16;
 if(build&&local>=14)return [];
 const downbeat=downbeats.includes(step),outro=bar>=totalBars-4;
 const section=build?'lift':downbeat?'drop':outro?'outro':bar<8?'arrival':bar<16?'first-drop':bar<24?'response':'return';
 const voices=[],f={bar,local,answer:bar%8>=4,arrival:bar<8,sparse:bar<4||outro,outro,section,voices};
 const root=arrange(f),venue=timing.id.replace('-bonus-preview-1','');
 if(build&&local===0)voices.push({kind:'riser',noise:true,filter:300,filterEnd:venue==='smf-secret-garden'?2300:3900,
  duration:14*interval/1000-.025,volume:venue==='smf-secret-garden'?.008:.012,attack:.1,sustain:.7});
 if(build&&[10,12,13].includes(local))noise(f,'snare',2400,.055,.009+(local-10)*.0015,0,{pan:local%2?.15:-.15});
 if(downbeat)voices.push({kind:'impact',noise:true,duration:.55,volume:venue==='smf-secret-garden'?.014:.022});
 if(flowActive&&!outro&&local%4===2)tone(f,'flow',NOTE(root,[24,27,31,29][Math.floor(local/4)]),.2,.009,{pan:local%8===2?-.2:.2,sustain:.25});
 const onset=Math.round(step*interval),end=Math.min(timing.durationMs,build?(nextDrop-2)*interval:Infinity);
 return voices.map(v=>{
  const duration=Math.min(v.duration,(end-onset-(v.offsetMs??0)-21)/1000);
  return {...v,duration,venue,bpm:timing.bpm,section,
   ...(v.attack?{attack:Math.min(v.attack,duration*.4)}:{}),
   ...(v.kind==='melody'&&multiplier>=3?{volume:v.volume+.0015}:{}),
  };
 }).filter(v=>v.duration>.01);
}

function tone(f,kind,frequency,duration,volume,extra={}){
 f.voices.push({kind,frequency,duration,volume,type:'triangle',...extra});
}
function noise(f,kind,filter,duration,volume,offsetMs=0,extra={}){
 f.voices.push({kind,noise:true,filter,duration,volume,offsetMs,...extra});
}
function kick(f,steps,{volume=.074,endFrequency=46,duration=.28}={}){
 if(steps.includes(f.local))tone(f,'kick',132,duration,volume,{type:'sine',endFrequency});
}
function snare(f,steps,volume=.028){if(steps.includes(f.local))noise(f,'snare',2150,.13,volume);}
function hats(f,steps,{swing=0,volume=.012,filter=6900}={}){
 if(steps.includes(f.local))noise(f,'hat',filter,f.local===14&&f.bar%4===3?.12:.045,
  f.local%2?volume*.6:volume,f.local%2?swing:0,{pan:f.local%4===2?-.24:.24});
}
function chord(f,root,notes,duration,volume,options={}){
 notes.forEach((note,i)=>tone(f,'pad',NOTE(root,note),duration,volume,
  {attack:.035,sustain:.65,filter:1300,pan:(i-1)*.2,...options}));
}
function fill(f,colour=3000){
 if(!f.sparse&&f.section!=='lift'&&f.bar%4===3&&f.local===15)noise(f,'snare',colour,.055,.009,12,{pan:.2});
}

function rabbitHole(f){
 const {bar,local,answer,sparse}=f;
 const home=65.406,root=f.outro?home:[home,77.782,58.27,home][Math.floor(bar/4)%4];
 kick(f,sparse?[0,10]:answer?[0,7,10,14]:[0,6,10]);snare(f,[4,12],sparse?.021:.03);
 hats(f,sparse?[2,6,10,14]:[2,5,6,10,13,14,15],{swing:22,filter:6500});
 if((sparse?[0,7,14]:answer?[0,3,7,11,14]:[0,3,7,10,14]).includes(local))
  tone(f,'bass',NOTE(root,local===14?(answer?7:3):0),local===0?.32:.22,.043,{sustain:.7,filter:720,filterEnd:330});
 if(local===2&&(bar%2===0||!sparse))chord(f,root,[12,15,22],sparse?.5:.32,.007,{attack:.018,filter:1450});
 if(!sparse&&local===10)chord(f,root,[15,19,26],.22,.0055,{attack:.012,filter:1800});
 const slots=sparse?[7]:answer?[6,10,14]:[3,7,11],index=slots.indexOf(local);
 if(index>=0)tone(f,'melody',NOTE(root,(answer?[31,27,24]:[24,27,34])[index]),.24,.013,
  {offsetMs:local%2?18:0,filter:2000,filterEnd:1100,pan:answer?.2:-.2,sustain:.3});
 if(!sparse&&local===11&&bar%2)tone(f,'wood',410,.07,.01,{endFrequency:190,pan:.3});
 fill(f);return root;
}

function secretGarden(f){
 const {bar,local,answer,sparse}=f,home=49,root=f.outro?home:[49,58.27,43.65,49][Math.floor(bar/4)%4];
 kick(f,sparse?[0]:answer?[0,7,10]:[0,10],{volume:.072,endFrequency:41,duration:.33});snare(f,[8],.025);
 hats(f,sparse?[6,14]:[2,6,11,14],{swing:15,volume:.01,filter:5800});
 if((sparse?[0,11]:answer?[0,7,13]:[0,6,11]).includes(local))
  tone(f,'bass',NOTE(root,local===13?7:0),local===0?.52:.37,.046,{type:'sine',sustain:.82,filter:430,filterEnd:260});
 if(local===2&&bar%2===0)chord(f,root,[19,22,26],sparse?.65:.9,.007,{attack:.075,filter:850,sustain:.72});
 if(!sparse&&local===10)chord(f,root,[15,22,26],.3,.006,{attack:.018,filter:1250});
 if((sparse?[11]:[3,11,14]).includes(local))tone(f,'wood',local===14?490:270,.09,.012,{type:'sine',endFrequency:160,pan:local===3?-.3:.3});
 const slots=sparse?[7]:answer?[5,13]:[7,15],index=slots.indexOf(local);
 if(index>=0)tone(f,'melody',NOTE(root,(answer?[31,26]:[24,29])[index]),.4,.012,{type:'sine',filter:1400,sustain:.3,pan:answer?-.25:.25});
 if(!sparse&&local===12&&bar%2)tone(f,'echo',NOTE(root,19),.32,.007,{type:'sine',filter:1200,pan:.38});
 fill(f,2200);return root;
}

function ikigaiMori(f){
 const {bar,local,answer,sparse}=f,home=73.416,root=f.outro?home:[home,65.406,87.307,home][Math.floor(bar/4)%4];
 kick(f,sparse?[0,8]:[0,4,8,12],{volume:.073,endFrequency:48});snare(f,[4,12],sparse?.018:.027);
 hats(f,sparse?[2,10]:[2,6,10,14],{volume:.013,filter:7400});
 if((sparse?[2,10]:answer?[2,5,10,14]:[2,6,10,14]).includes(local))
  tone(f,'bass',NOTE(root,local===14&&answer?7:0),.23,.04,{filter:850,filterEnd:410,sustain:.65});
 if(local===0&&bar%2===0)chord(f,root,[12,15,22],1.45,.0075,{attack:.065,filter:sparse?1050:1550});
 if(!sparse&&[3,7,11,15].includes(local))tone(f,'wood',local<8?360:530,.065,.012,{offsetMs:10,endFrequency:210,pan:local<8?-.3:.3});
 const slots=sparse?[6]:answer?[6,11,14]:[2,7,10],index=slots.indexOf(local);
 if(index>=0)tone(f,'melody',NOTE(root,(answer?[31,27,24]:[24,26,31])[index]),.22,.012,{filter:1700,filterEnd:850,pan:answer?.18:-.18,sustain:.35});
 if(!sparse&&local===14&&bar%2)tone(f,'air',NOTE(root,31),.28,.0045,{attack:.04,pan:.3});
 fill(f);return root;
}

function villagio(f){
 const {bar,local,answer,sparse}=f,home=55,root=f.outro?home:[55,65.406,73.416,55][Math.floor(bar/4)%4];
 kick(f,sparse?[0,8]:answer?[0,3,8,11]:[0,3,8,10],{volume:.076,endFrequency:47,duration:.25});
 snare(f,[4,12],sparse?.023:.032);
 hats(f,sparse?[2,6,10,14]:[2,6,9,10,14,15],{swing:17,volume:.0125,filter:7100});
 if((sparse?[0,6,10]:answer?[0,5,7,10,14]:[0,3,6,10,13]).includes(local))
  tone(f,'bass',NOTE(root,local>=13?(answer?10:7):local===6?12:0),.22,.044,{sustain:.55,filter:1150,filterEnd:420});
 if((sparse?[0]:[0,6,10]).includes(local))chord(f,root,[16,19,22],.18,.007,{attack:.012,filter:1900,sustain:.35});
 const slots=sparse?[11]:answer?[3,11,14]:[3,7,11],index=slots.indexOf(local);
 if(index>=0)tone(f,'melody',NOTE(root,(answer?[34,31,28]:[24,28,31])[index]),.17,.016,{filter:2250,filterEnd:1000,pan:answer?.22:-.22,sustain:.25});
 if(!sparse&&[5,13].includes(local))tone(f,'wood',local===5?620:430,.055,.01,{endFrequency:230,pan:local===5?-.3:.3});
 fill(f,2900);return root;
}
