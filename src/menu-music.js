// Original 32-bar electro-funk loop. The first 16 bars state and answer the
// hook; a lighter break and a fuller return make up the second 16.
const BPM=112;
const STEPS_PER_BAR=16;
export const MENU_STEP_MS=60000/(BPM*4);
export const MENU_STEPS=32*STEPS_PER_BAR;
const hz=note=>440*2**((note-69)/12);
const chords=[
 {root:45,keys:[55,59,60,64]}, // Am9
 {root:45,keys:[55,59,60,64]},
 {root:41,keys:[52,55,57,60]}, // Fmaj9
 {root:43,keys:[53,57,59,62]}, // G9
 {root:45,keys:[55,59,60,64]},
 {root:48,keys:[55,59,62,64]}, // Cmaj9
 {root:41,keys:[52,55,57,60]},
 {root:40,keys:[56,59,62,65]}, // E7(b9)
];
const calls=[
 [[2,72],[5,69],[7,67],[11,64],[14,67]],
 [[2,69],[6,72],[10,76],[13,74]],
 [[2,69],[5,67],[10,65],[13,64]],
 [[2,67],[7,71],[11,74],[14,71]],
 [[2,72],[5,69],[7,67],[11,64]],
 [[3,67],[6,72],[9,74],[12,76]],
 [[2,76],[5,72],[10,69],[13,65]],
 [[2,68],[6,71],[10,65],[12,64]],
];

export function menuVoices(absoluteStep){
 if(!Number.isInteger(absoluteStep)||absoluteStep<0)return [];
 const step=absoluteStep%MENU_STEPS,bar=Math.floor(step/STEPS_PER_BAR),slot=step%STEPS_PER_BAR;
 const phrase=Math.floor(bar/8),measure=bar%8,breakdown=phrase===2;
 const {root,keys}=chords[measure],voices=[];
 const add=(kind,duration,volume,voice={})=>{
  const offsetMs=voice.offsetMs??0;
  const tail=(MENU_STEPS-step)*MENU_STEP_MS-offsetMs-24;
  duration=Math.min(duration,tail/1000);
  if(duration>.025)voices.push({kind,bpm:BPM,duration,volume,...voice});
 };
 const note=(kind,pitch,duration,volume,voice={})=>add(kind,duration,volume,{frequency:hz(pitch),...voice});
 const swung=slot%2===1?14:0;
 const turn=measure===7;
 if((breakdown?[0]:measure%2?[0,7,10]:[0,6,10]).includes(slot)){
  add('kick',.23,breakdown?.025:.038,{frequency:115,endFrequency:47,type:'sine',attack:.004});
 }
 if((breakdown?[12]:[4,12]).includes(slot)){
  add('snare',.11,breakdown?.012:.02,{noise:true,filter:2300});
 }
 if((breakdown?[6,14]:[2,6,9,10,14]).includes(slot)){
  add('hat',slot===14?.073:.042,slot===14?.012:.009,{noise:true,filter:6500,offsetMs:swung,pan:slot===6?-.25:.25});
 }
 const bass=(breakdown?{0:0,10:7}:measure%2?{0:0,3:0,7:12,10:7,13:0}:{0:0,3:0,6:12,9:7,12:0})[slot];
 if(bass!==undefined){
  note('bass',root+bass,slot===0?.28:.15,.032,{type:'triangle',filter:720,filterEnd:280,sustain:.66,offsetMs:swung});
 }
 if((breakdown?[0]:[0,7,11]).includes(slot)){
  const long=breakdown||slot===0;
  keys.forEach((pitch,index)=>note('pad',pitch,long?.57:.18,long?.008:.011,{
   type:'triangle',attack:long?.046:.012,sustain:long?.54:.44,filter:long?1050:1650,pan:(index-1.5)*.16,offsetMs:swung
  }));
 }
 const motif=calls[measure].find(([onset])=>onset===slot);
 if(motif&&(!breakdown||slot>=10)){
  const pitch=motif[1]+(phrase===1&&slot===10?2:0);
  note('melody',pitch,slot===2?.225:.16,breakdown?.012:.019,{
   type:'triangle',attack:.011,filter:1800,filterEnd:900,sustain:.43,offsetMs:swung,pan:measure%2?.16:-.16
  });
  if(phrase===3&&slot===2)note('echo',pitch-12,.3,.007,{type:'sine',attack:.025,pan:.26});
 }
 if(turn&&[13,15].includes(slot)&&bar!==31){
  add('wood',.07,.01,{frequency:slot===13?490:570,endFrequency:270,type:'sine',offsetMs:swung,pan:.27});
 }
 return voices;
}

// The menu controller supplies active wall time. Like the stage transport,
// this queues only a small audio window and never needs its own timer.
export function createMenuTransport({schedule,cancel}){
 let lastStep=-1,lastElapsed=null,lastAudio=null,stalled=false;
 function stop(){
  cancel();
  lastStep=-1;lastElapsed=null;lastAudio=null;stalled=false;
 }
 return {stop,sync(elapsed,audioNow){
  if(lastElapsed!==null&&elapsed<lastElapsed)stop();
  if(lastElapsed!==null&&elapsed>lastElapsed&&(audioNow-lastAudio)*1000<(elapsed-lastElapsed)*.5){
   if(!stalled){cancel();lastStep=-1;}
   stalled=true;lastElapsed=elapsed;lastAudio=audioNow;return;
  }
  stalled=false;lastElapsed=elapsed;lastAudio=audioNow;
  const first=Math.max(lastStep+1,Math.ceil(elapsed/MENU_STEP_MS-1e-9));
  for(let step=first;step*MENU_STEP_MS<elapsed+100;step++){
   const at=audioNow+Math.max(0,step*MENU_STEP_MS-elapsed)/1000;
   for(const voice of menuVoices(step))schedule(voice,at);
   lastStep=step;
  }
 }};
}
