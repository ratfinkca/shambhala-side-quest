import {phaseAt} from '../stage-clock.js';

const TAU=Math.PI*2;
const clamp=(value,min=0,max=1)=>Math.max(min,Math.min(max,value));
const ease=value=>{const t=clamp(value);return t*t*(3-2*t)};
const VENUES=new Set(['smf-living-room','smf-fractal','smf-grove','smf-amp','smf-pagoda','smf-village']);

// Musical sections last longer than the four-second score bonus. Smooth ramps
// link authored phrase landmarks, so the show keeps its weight through a drop
// and changes character with the Village's half-time passage and dawn finale.
const MAIN_FORM=[[0,.22],[4,.36],[7,.54],[8,.94],[14,.83],[15,.59],[16,.85],[18,.55],[22,.60],[23,.70],[24,1],[30,.88],[32,.55]];
const VILLAGE_FORM=[[0,.22],[4,.38],[8,.72],[15,.78],[16,.84],[18,.48],[23,.5],[24,.76],[31,.8],[32,1],[39,.92],[40,.84],[44,.48],[48,.33]];
const salute=(bars,start)=>ease((bars-start)/.95)*ease((start+2.6-bars)/1.1);
function formAt(bars,form){
 for(let i=1;i<form.length;i++)if(bars<=form[i][0]){
  const [a,av]=form[i-1],[b,bv]=form[i];return av+(bv-av)*ease((bars-a)/(b-a));
 }
 return form.at(-1)[1];
}

/** Decorative cues depend only on paused/resumable active time, never frames.
 * Positive angles aim a downward ray to the left. No flashes or random cuts. */
export function smfLightCue(id,elapsed,timing,reduced=false){
 if(!VENUES.has(id))throw new Error(`Unknown SMF light rig: ${String(id)}`);
 if(!Number.isFinite(elapsed))throw new Error('Invalid lighting time');
 const time=reduced?0:clamp(elapsed,0,timing.durationMs);
 phaseAt(time,timing); // Validate the canonical clock, even at the static pose.
 const beats=time*timing.bpm/60000,bars=beats/timing.beatsPerBar;
 const four=bars/4*TAU,eight=bars/8*TAU,sixteen=bars/16*TAU;
 const breath=.5-.5*Math.cos(eight),pulse=(.5+.5*Math.cos(beats*Math.PI))**2;
 const section=formAt(bars,id==='smf-village'?VILLAGE_FORM:MAIN_FORM);
 const energy=clamp(section*(id==='smf-living-room'?.78:id==='smf-grove'?.88:1));
 // The endpoint traces blend a travelling wave with a double-frequency
 // figure eight. Coupled yaw/reach gives butterfly and crossing-sheet shapes
 // in this flat view; it never spins a fixture through a full rotation.
 const patternMix=.5-.5*Math.cos(sixteen);
 const beams=Array.from({length:8},(_,i)=>{
  const slot=i/7*2-1,side=i<4?-1:1,lane=i%4;
  let angle,width,base,length;
  switch(id){
   case 'smf-living-room':
    angle=-slot*.6+Math.sin(sixteen+lane*.16)*.18;
    width=1.25+.3*breath;base=.050;length=.72+.17*Math.sin(sixteen+lane*.32);break;
   case 'smf-fractal':
    angle=-slot*.44+side*Math.sin(four+lane*.4)*.38+Math.sin(eight)*.1;
    width=.60+.3*(.5+.5*Math.sin(eight+lane*.5));base=.070;length=.70+.29*((1-patternMix)*Math.sin(four+side*lane*.22)+patternMix*Math.cos(four*2+lane*.22));break;
   case 'smf-grove':
    angle=-slot*(.49+.14*breath)+Math.sin(sixteen)*.1;
    width=1.12+.35*breath;base=.048;length=.72+.24*Math.sin(eight+slot*.8);break;
   case 'smf-amp':
    angle=slot*.39+side*Math.sin(four+Math.floor(lane/2)*.5)*.33+Math.sin(eight)*.12;
    width=.65+.29*(.5+.5*Math.cos(eight));base=.073;length=.70+.31*((1-patternMix)*Math.cos(four+side*.5)+patternMix*Math.cos(four*2+lane*.35));break;
   case 'smf-pagoda':
    angle=-slot*(.26+.39*breath+.14*energy)+Math.sin(sixteen)*.09;
    width=.78+.3*breath;base=.065;length=.72+.28*Math.sin(eight+Math.abs(slot)*1.4);break;
   case 'smf-village':
    angle=-side*(.38+lane*.075)+Math.sin(four+side*.35+lane*.18)*(.12+.13*energy);
    width=.61+.27*(.5+.5*Math.cos(eight+side*.45));base=.074;length=.69+.28*((1-patternMix)*Math.sin(four+side*.7+lane*.2)+patternMix*Math.cos(four*2+lane*.3));break;
  }
  const bankBreath=.5+.5*Math.sin(eight+lane*.35);
  return {angle,width:Math.max(.5,width*(.7+.3*length)),length,alpha:base+.012*bankBreath+.039*energy,glow:.22+.1*bankBreath+.28*energy+.035*pulse};
 });
 const lasers=Array.from({length:24},(_,i)=>{
  const bank=Math.floor(i/6),ray=i%6,fan=ray/5*2-1,side=bank<2?-1:1,inner=bank===1||bank===2;
  let angle,spread,level,length;
  switch(id){
   case 'smf-living-room':
    spread=.17+.1*breath;angle=-side*.58+fan*spread+Math.sin(sixteen)*.18;
    level=(inner?.12:.27)*(ray%2?.65:1);length=.72+.14*Math.sin(sixteen+fan*.4);break;
   case 'smf-fractal':
    spread=.22+.17*(.5+.5*Math.sin(eight+bank*.7));
    angle=-side*(inner?.19:.58)+fan*spread+side*Math.sin(four+bank*.5)*.30;
    level=.54;length=.73+.30*((1-patternMix)*Math.sin(four+bank*.4+fan*.3)+patternMix*Math.cos(four*2+bank*.3+fan*.25));break;
   case 'smf-grove':
    spread=.13+.17*breath;angle=-side*(inner?.24:.66)+fan*spread+Math.sin(sixteen+side*.5)*.13;
    level=inner?.36:.43;length=.72+.24*Math.sin(eight+bank*.6+fan*.2);break;
   case 'smf-amp':
    spread=.07+.26*(.5+.5*Math.sin(eight));angle=side*(inner?.16:-.5)+fan*spread+side*Math.sin(four)*.32;
    level=inner?.59:.50;length=.74+.32*((1-patternMix)*Math.cos(four+side*.6)+patternMix*Math.sin(four*2+bank*.4+fan*.22));break;
   case 'smf-pagoda':
    // Tight equally spaced crossing banks form a lattice, then open back
    // into broad fans. Mirror reach keeps each crossing grid coherent.
    spread=.34-.22*breath;angle=-side*(inner?.20:.52)+fan*spread+side*Math.sin(sixteen)*.12*(1-breath);
    level=inner?.48:.57;length=.74+.27*Math.sin(eight+(inner?.7:0)+fan*.12);break;
   case 'smf-village':
    spread=.14+.19*energy;angle=-side*(inner?.2:.58)+fan*spread+Math.sin(four+side*.6)*.23;
    level=inner?.59:.63;length=.73+.31*((1-patternMix)*Math.sin(four+bank*.4+fan*.2)+patternMix*Math.cos(four*2+bank*.5+fan*.25));break;
  }
  // Broad breathing, not blinking: adjacent beams never switch abruptly.
  const scan=.72+.28*(.5+.5*Math.sin(four+ray*.5+bank*.9));
  return {angle,alpha:level*(.21+.79*energy)*scan,width:(.82+.26*energy)*(.82+.18*length),length};
 });
 const skyBeams=id==='smf-village'?Array.from({length:6},(_,i)=>{
  const envelope=reduced?0:Math.max(salute(bars,14.5+i*.035),salute(bars,30.5+i*.035));
  return {angle:Math.PI+(i/5*2-1)*(.28+.16*envelope)+Math.sin(eight)*.06,width:1.15+.85*envelope,length:.62+.3*envelope,alpha:.74*envelope};
 }):[];
 return {energy,skyBeams,colourMix:.5-.5*Math.cos(sixteen),beams,lasers,poolDrift:Math.sin(sixteen),architecture:.25+.24*breath+.45*energy};
}
