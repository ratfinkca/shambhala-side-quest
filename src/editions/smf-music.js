// Original arrangements on the trusted venue clocks. Four/eight-bar questions
// and answers lead into the scored drops; no samples or borrowed hooks.
const NOTE=(root,semitones)=>root*2**(semitones/12);
const ENGINES={
 'smf-living-room':livingRoom,'smf-fractal':fractalForest,'smf-grove':grove,
 'smf-amp':amp,'smf-pagoda':pagoda,'smf-village':village,
};
export function smfPreviewVoices({timing,step,phase,multiplier=1,flowActive=false}){
 const venue=timing.id.replace(/-clock-preview-1$/,''),arrange=ENGINES[venue];
 const totalSteps=Math.round(timing.durationMs*timing.bpm*timing.stepsPerBeat/60000);
 if(!arrange||phase==='ended'||!Number.isInteger(step)||step<0||step>=totalSteps)return [];
 const interval=60000/(timing.bpm*timing.stepsPerBeat),bar=Math.floor(step/16),local=step%16;
 const dropSteps=timing.dropStartsMs.map(time=>Math.round(time/interval));
 const nextDrop=dropSteps.find(onset=>onset>step);
 const build=nextDrop!==undefined&&step>=nextDrop-16,drop=dropSteps.includes(step);
 const section=build?'lift':drop?'drop':venue==='smf-village'
  ?bar<8?'arrival':bar<16?'groove':bar<24?'halftime':bar<32?'response':bar<40?'return':'dawn'
  :bar<4?'arrival':bar<8?'groove':bar<16?'first-drop':bar<24?'response':'return';
 // A short dry kick/sub breath before each downbeat makes room for the return.
 // Reverb can naturally spill across it; the rhythm itself gets out of the way.
 if(build&&local>=14)return [];
 const voices=[],frame={timing,step,bar,local,answer:bar%8>=4,section,voices};
 const root=arrange(frame);
 if(build&&local===0)voices.push({kind:'riser',noise:true,filter:340,filterEnd:4200,
  duration:14*interval/1000-.025,attack:.12,sustain:.72,volume:venue==='smf-living-room'?.009:.014});
 if(build&&[8,10,12,13].includes(local))voices.push({kind:'snare',noise:true,filter:2600,
  duration:.065,volume:.008+local*.0006,pan:local%2?.12:-.12});
 if(drop)voices.push({kind:'impact',noise:true,frequency:root*2,endFrequency:root,
  filter:1100,filterEnd:420,duration:.72,volume:venue==='smf-living-room'?.018:.026});
 if(flowActive&&local%4===2)voices.push({kind:'flow',frequency:NOTE(root,[24,28,31,34][Math.floor(local/4)]),
  duration:.24,volume:.011,pan:local%8===2?-.18:.18,sustain:.3});
 return trimVoices(voices.map(v=>({
  ...v,venue,bpm:timing.bpm,section,
  ...(v.kind==='melody'&&multiplier>=3?{volume:v.volume+.002}:{}),
 })),timing,step,build?(nextDrop-2)*interval:undefined);
}

function tone(f,kind,frequency,duration,volume,type='sine',extra={}){
 f.voices.push({kind,frequency,duration,volume,type,...extra});
}
function noise(f,kind,filter,duration,volume,offsetMs=0,extra={}){
 f.voices.push({kind,noise:true,filter,duration,volume,offsetMs,...extra});
}
function chord(f,root,notes,duration,volume,{attack=.04,filter=1400,sustain=.68}={}){
 notes.forEach((note,i)=>tone(f,'pad',NOTE(root,note),duration,volume,'triangle',
  {attack,sustain,filter,pan:(i-(notes.length-1)/2)*.19}));
}
function hats(f,steps,{filter=7400,volume=.014,swing=0,open=false}={}){
 if(!steps.includes(f.local))return;
 const long=open&&f.local===14;
 noise(f,'hat',filter,long?.15:.045,f.local%2?volume*.55:volume,f.local%2?swing:0,
  {pan:f.local%4===2?-.24:.24});
}
function snare(f,steps,volume=.03){
 if(steps.includes(f.local))noise(f,'snare',2200,.15,volume);
}
function fill(f){
 // A small four-bar pickup, separate from the dedicated pre-drop build.
 if(f.bar%4===3&&f.section!=='lift'&&f.local===15)noise(f,'snare',2800,.06,.011,10,{pan:.16});
}

function livingRoom(f){
 const {bar,local,answer}=f,root=[65.406,87.307,73.416,65.406][Math.floor(bar/4)%4];
 const home=bar>=24?65.406:root;
 if(local%4===0)tone(f,'kick',118,.29,.068,'sine',{endFrequency:48});
 if((answer?[2,5,8,11,14]:[2,6,10,14]).includes(local))
  tone(f,'bass',NOTE(home,local===14&&answer?7:0),local===8?.31:.25,.039,'triangle',{sustain:.72,filter:560});
 hats(f,bar<4?[2,6,10,14]:[2,5,6,10,13,14],{filter:6100,volume:.013,swing:21,open:bar%4===3});
 snare(f,[4,12],.025);
 if(local===0&&bar%2===0)chord(f,home,[12,16,23,26],2.45,.008,{attack:.075,filter:1150,sustain:.72});
 if(local===10&&bar%2===1)chord(f,home,[16,23,26],.34,.006,{attack:.018,filter:1600});
 const slots=bar<4?[7,14]:answer?[3,10,14]:[3,7,14],index=slots.indexOf(local);
 if(index>=0){const motif=answer?[31,28,26]:[24,28,31];
  tone(f,'melody',NOTE(home,motif[index]),.38,.014,'sine',{offsetMs:12,pan:answer?.2:-.18,filter:1900,sustain:.35});}
 if([3,11].includes(local))tone(f,'wood',answer?620:430,.085,.013,'sine',{endFrequency:180,pan:local===3?-.3:.3});
 fill(f);return home;
}

function fractalForest(f){
 const {bar,local,answer}=f,section=Math.floor(bar/8),root=[55,65.406,49,55][section];
 const kicks=section===2?[0,6,10]:answer?[0,6,8,11]:[0,3,8,10];
 if(kicks.includes(local))tone(f,'kick',133,.25,.076,'sine',{endFrequency:46});
 snare(f,[4,12],.034);
 hats(f,section===2?[2,6,10,14]:[2,6,9,11,14,15],{filter:7200,volume:.014,swing:17,open:bar%4===3});
 if((answer?[0,5,7,10,14]:[0,3,6,9,14]).includes(local))
  tone(f,'bass',NOTE(root,local>=13?(answer?7:3):0),local===0?.28:.21,.046,'triangle',
   {sustain:.58,filter:section===0?750:1250,filterEnd:300});
 if((section===2?[0,10]:[0,6,10]).includes(local))chord(f,root,[15,19,22],.22,.008,{attack:.015,filter:1800,sustain:.4});
 const slots=answer?[3,7,14]:[3,11],index=slots.indexOf(local);
 if(index>=0){const motif=answer?[31,28,24]:[24,27];
  tone(f,'melody',NOTE(root,motif[index]),.21,.018,'triangle',{filter:2200,filterEnd:900,pan:answer?.17:-.17,sustain:.4});}
 if(bar%2===1&&local===13)tone(f,'wood',360,.075,.011,'triangle',{endFrequency:150,pan:-.32});
 fill(f);return root;
}

function grove(f){
 const {bar,local,answer}=f,section=Math.floor(bar/8),root=[49,58.27,43.65,49][section];
 if((section===2?[0,11]:bar%2?[0,7,10]:[0,10]).includes(local))tone(f,'kick',114,.31,.076,'sine',{endFrequency:41});
 snare(f,[4,12],.03);
 hats(f,section===2?[2,10,14]:[2,6,7,10,14],{filter:6500,volume:.014,swing:22,open:bar%4===3});
 if((answer?[1,7,13]:[0,6,11]).includes(local))
  tone(f,'bass',NOTE(root,local>=13?7:0),local===0?.43:.34,.049,'sine',{sustain:.82,filter:420});
 if((section===2?[0,11]:[0,6,14]).includes(local))chord(f,root,[15,22,26],.46,.007,{attack:.025,filter:1050,sustain:.6});
 if(local===9&&bar%2===0)tone(f,'echo',NOTE(root,19),.38,.009,'sine',{pan:.38,filter:1300,sustain:.35});
 const slots=answer?[3,15]:[9],index=slots.indexOf(local);
 if(index>=0)tone(f,'melody',NOTE(root,answer?[31,27][index]:24),.42,.015,'sine',{offsetMs:16,pan:answer?-.25:.25,filter:1650,sustain:.4});
 if(bar%4===2&&local===11)tone(f,'wood',270,.085,.01,'sine',{endFrequency:140,pan:-.3});
 fill(f);return root;
}

function amp(f){
 const {bar,local,answer}=f,section=Math.floor(bar/8),root=[41.2,36.71,49,41.2][section];
 if((section===2?[0,11]:answer?[0,6,11]:[0,7]).includes(local))tone(f,'kick',139,.34,.087,'sine',{endFrequency:39});
 snare(f,[8],.039);
 hats(f,section===2?[2,14]:[2,6,10,14],{filter:6700,volume:.012,open:bar%4===3});
 if((section===2?[0,11]:answer?[0,5,10,13]:[0,3,11]).includes(local))
  tone(f,'bass',NOTE(root,local>=10&&answer?7:0),local===0?.53:.31,.055,'sine',
   {sustain:.8,filter:section===0?520:950,filterEnd:260});
 if(local===0&&bar%4===0)chord(f,root,[19,24,26],2.4,.007,{attack:.19,filter:1300,sustain:.74});
 if(local===(answer?13:5)&&bar%2===0)tone(f,'melody',NOTE(root,answer?31:26),.28,.016,'triangle',
  {filter:1500,filterEnd:620,pan:answer?.3:-.3,sustain:.25});
 if(bar%4===3&&local===15)tone(f,'echo',NOTE(root,36),.2,.009,'sine',{pan:.35});
 fill(f);return root;
}

function pagoda(f){
 const {bar,local,answer}=f,section=Math.floor(bar/8),root=bar>=24?55:[55,65.406,73.416,55][Math.floor(bar/4)%4];
 if(local%4===0)tone(f,'kick',142,.28,.083,'sine',{endFrequency:44});
 if([2,6,10,14].includes(local))tone(f,'bass',NOTE(root,local===14&&answer?7:0),.25,.045,'triangle',
  {sustain:.72,filter:section===0?650:1250,filterEnd:410});
 hats(f,bar<4?[2,6,10,14]:[2,6,7,10,14,15],{filter:7800,volume:.015,open:bar%4===3});
 snare(f,[4,12],.029);
 if(local===0&&bar%2===0)chord(f,root,[12,15,19,22],1.8,.008,{attack:.055,filter:section===0?900:1700,sustain:.7});
 const slots=section===2?[2,7,10,15]:answer?[0,3,6,10,14]:[0,2,5,8,13];
 const index=slots.indexOf(local);
 if(index>=0){const notes=answer?[31,36,34,31,27]:[24,31,36,27,31];
  tone(f,'melody',NOTE(root,notes[index%notes.length]),.21,.015,'triangle',
   {filter:section===0?1400:2400,filterEnd:850,sustain:.4,pan:index%2?.2:-.2});}
 if(section===3&&local===14&&bar%2===1)tone(f,'air',NOTE(root,36),.6,.006,'sine',{attack:.09,pan:.4,sustain:.6});
 fill(f);return root;
}

function village(f){
 const {bar,local}=f,halfTime=bar>=16&&bar<24,finale=bar>=40;
 const roots=bar<16||finale?[49,58.27,65.41,43.65]:[43.65,49,41.2,58.27];
 const root=bar>=47?roots[0]:roots[Math.floor((finale?bar-40:bar)/4)%4];
 if((halfTime?[0,10]:bar%2?[0,7,11]:[0,10]).includes(local))tone(f,'kick',145,.23,.078,'sine',{endFrequency:44});
 snare(f,halfTime?[8]:[4,12],.038);
 if(!halfTime&&[7,15].includes(local))noise(f,'snare',2800,.055,.008,9,{pan:local===7?-.14:.14});
 hats(f,halfTime?[2,6,14]:[2,6,8,10,14],{filter:7700,volume:.014,open:bar%4===3});
 if((halfTime?[0,11]:[0,6,11]).includes(local))tone(f,'bass',NOTE(root,local===11&&bar%4===3?7:0),halfTime?.48:.33,.047,'sine',
  {sustain:.78,filter:halfTime?630:1250,filterEnd:halfTime?320:680});
 if(local===0&&bar%2===0)chord(f,root,finale?[12,16,19,26]:[12,15,19,26],finale?2.25:1.65,.007,
  {attack:.13,filter:finale?2300:1300,sustain:.75});
 const slots=finale?[2,6,10,14]:halfTime?[5,13]:bar%2?[3,14]:[9];
 const index=slots.indexOf(local);
 if(index>=0){const motif=finale?[24,28,31,26]:halfTime?[31,27]:[24,31];
  tone(f,'melody',NOTE(root,motif[index%motif.length]),finale?.36:.25,finale?.018:.013,'triangle',
   {filter:finale?2600:1600,filterEnd:1000,sustain:.5,pan:index%2?.25:-.25});}
 fill(f);return root;
}

function trimVoices(voices,timing,step,gapAt){
 const onset=Math.round(step*60000/(timing.bpm*timing.stepsPerBeat));
 const end=Math.min(timing.durationMs,gapAt??Infinity);
 return voices.map(v=>{
  const duration=Math.min(v.duration,(end-onset-(v.offsetMs||0)-21)/1000);
  return {...v,duration,...(v.attack?{attack:Math.min(v.attack,duration*.4)}:{})};
 }).filter(v=>v.duration>.01);
}
