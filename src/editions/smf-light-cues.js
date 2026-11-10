import {phaseAt} from '../stage-clock.js';

const TAU=Math.PI*2;
const clamp=(value,min=0,max=1)=>Math.max(min,Math.min(max,value));
const ease=value=>{const t=clamp(value);return t*t*(3-2*t)};
const VENUES=new Set(['smf-living-room','smf-fractal','smf-grove','smf-amp','smf-pagoda','smf-village']);

// One continuous envelope joins the build and drop, then settles before the
// scoring window ends. A phase change never switches the whole rig on/off.
function phraseEnergy(time,timing){
 const cycle=phaseAt(time,timing);
 if(cycle.phase==='build')return .55*ease(1-cycle.remainingMs/timing.buildMs);
 if(cycle.phase!=='drop')return 0;
 const age=timing.dropDurationMs-cycle.remainingMs;
 const fade=Math.min(timing.dropDurationMs/2,120000/timing.bpm);
 return (.55+.45*ease(age/fade))*ease(cycle.remainingMs/fade);
}

/**
 * Decorative SMF cues, driven only by the paused/resumable game clock.
 * Angles rotate a downward beam (positive goes left); widths scale the cone.
 * All movements last 4, 8 or 16 bars. There are no strobes or random cuts.
 */
export function smfLightCue(id,elapsed,timing,reduced=false){
 if(!VENUES.has(id))throw new Error(`Unknown SMF light rig: ${String(id)}`);
 if(!Number.isFinite(elapsed))throw new Error('Invalid lighting time');
 const time=reduced?0:clamp(elapsed,0,timing.durationMs);
 const lift=phraseEnergy(time,timing); // Also validates the canonical clock.
 const bars=time*timing.bpm/60000/timing.beatsPerBar;
 const four=bars/4*TAU,eight=bars/8*TAU,sixteen=bars/16*TAU;
 const breath=.5-.5*Math.cos(eight);
 const energy=.3+.13*breath+.45*lift;
 const beams=Array.from({length:8},(_,i)=>{
  const slot=i/7*2-1,side=i<4?-1:1,lane=i%4;
  let angle,width,base;
  switch(id){
   case 'smf-living-room':
    // A broad, slow sunset wash across the river clearing.
    angle=-slot*.52+Math.sin(sixteen+lane*.16)*.13;
    width=1.25+.25*breath;base=.045;
    break;
   case 'smf-fractal':
    // Two playful banks cross and reopen under the pyramid chases.
    angle=-slot*.43+side*Math.sin(four+lane*.4)*.32+Math.sin(eight)*.08;
    width=.66+.24*(.5+.5*Math.sin(eight+lane*.5));base=.065;
    break;
   case 'smf-grove':
    // An unhurried outward canopy breath, with room between the fans.
    angle=-slot*(.46+.13*breath)+Math.sin(sixteen)*.08;
    width=1.15+.3*breath;base=.043;
    break;
   case 'smf-amp':
    // Low crossed pairs follow the half-time weight of the arrangement.
    angle=slot*.34+side*Math.sin(four+Math.floor(lane/2)*.5)*.28+Math.sin(eight)*.12;
    width=.7+.26*(.5+.5*Math.cos(eight));base=.068;
    break;
   case 'smf-pagoda':
    // A symmetrical opening fan leaves the facade as the focal point.
    angle=-slot*(.23+.37*breath+.13*lift)+Math.sin(sixteen)*.07;
    width=.82+.28*breath;base=.057;
    break;
   case 'smf-village':
    // Separated tower banks sweep together, with staggered inner beams.
    angle=-side*(.35+lane*.075)+Math.sin(four+side*.35+lane*.18)*.18;
    width=.64+.23*(.5+.5*Math.cos(eight+side*.45));base=.069;
    break;
  }
  const bankBreath=.5+.5*Math.sin(eight+lane*.35);
  return {angle,width,alpha:base+.014*bankBreath+.028*lift,glow:.24+.09*bankBreath+.23*lift};
 });
 return {
  energy,
  colourMix:.5-.5*Math.cos(sixteen),
  beams,
  poolDrift:Math.sin(sixteen),
  architecture:.3+.4*breath+.25*lift,
 };
}
