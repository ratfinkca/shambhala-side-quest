import {BASS_RADIUS,BASS_CORE} from './geometry.js';
import {BASS_EXPOSURE_MS} from './bass-head.js';
import {BEAT_MS} from './music.js';
const PRESSURE=0xf2bd7b,PROTECTION=0x95ffe0;
// Two thin wavefronts from the cone, without a stronger field-wide fill.
export function drawSpeakerBass(g,elapsed,phase,reduced){
 if(reduced){g.lineStyle(1.5,PRESSURE,.2).strokeCircle(0,0,BASS_CORE).strokeCircle(0,0,86);return;}
 for(let i=0;i<2;i++){
  const travel=(elapsed/(BEAT_MS*2)+i*.5)%1,radius=14+(BASS_RADIUS-14)*travel;
  const opacity=Math.sin(travel*Math.PI)**2*(phase==='drop'?.26:.2);
  g.lineStyle(1.5,PRESSURE,opacity).strokeCircle(0,0,radius);
 }
}
export function drawPlayerBass(g,bass,radialFactor,elapsed,reduced){
 const t=reduced?0:elapsed/1000;
 if(bass.activeMs>0){
  const swell=reduced?0:Math.sin(t*2)*1.5;
  g.lineStyle(2,PROTECTION,.8).strokeEllipse(0,-2,46+swell,57+swell);
  g.lineStyle(2,PROTECTION,.6).strokeEllipse(0,13,37,12);
  for(const side of [-1,1])g.lineStyle(2,PROTECTION,.7).lineBetween(side*25,-7,side*28,-2).lineBetween(side*28,-2,side*25,3);
  return;
 }
 if(radialFactor>=1)return;
 const pressure=Math.min(1,bass.exposureMs/BASS_EXPOSURE_MS),pulse=reduced?0:Math.sin(t*3)*.8;
 g.lineStyle(2,PRESSURE,.35+pressure*.35).strokeEllipse(0,12,38-pressure*8+pulse,16-pressure*4);
 g.lineStyle(1.5,PRESSURE,.2+pressure*.3).strokeEllipse(0,12,47-pressure*8+pulse,21-pressure*5);
 for(const side of [-1,1])g.lineStyle(2,PRESSURE,.3+pressure*.3).lineBetween(side*16,2+pressure*4,side*13,7+pressure*3);
}
