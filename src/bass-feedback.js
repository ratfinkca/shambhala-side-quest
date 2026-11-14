import {BASS_RADIUS,BASS_CORE} from './geometry.js';
import {BASS_EXPOSURE_MS} from './bass-head.js';
import {getTiming} from './stage-clock.js';
import {pixelEllipse,pixelLine} from './pixel-art/shapes.js';
const PRESSURE=0xf2bd7b,PROTECTION=0x95ffe0;
// Two thin wavefronts from the cone, without a stronger field-wide fill.
export function drawSpeakerBass(g,elapsed,phase,reduced,timing=getTiming()){
 const BEAT_MS=60000/timing.bpm;
 if(reduced){g.lineStyle(1.5,PRESSURE,.2).strokePoints(pixelEllipse(0,0,BASS_CORE*2,BASS_CORE*2),true).strokePoints(pixelEllipse(0,0,172,172),true);return;}
 for(let i=0;i<2;i++){
  const travel=(elapsed/(BEAT_MS*2)+i*.5)%1,radius=14+(BASS_RADIUS-14)*travel;
  const opacity=Math.sin(travel*Math.PI)**2*(phase==='drop'?.26:.2);
  g.lineStyle(1.5,PRESSURE,opacity).strokePoints(pixelEllipse(0,0,radius*2,radius*2),true);
 }
}
export function drawPlayerBass(g,bass,radialFactor,elapsed,reduced){
 const t=reduced?0:elapsed/1000;
 if(bass.activeMs>0){
  const swell=reduced?0:Math.sin(t*2)*1.5;
  g.lineStyle(2,PROTECTION,.8).strokePoints(pixelEllipse(0,-2,46+swell,57+swell),true);
  g.lineStyle(2,PROTECTION,.6).strokePoints(pixelEllipse(0,13,37,12),true);
  for(const side of [-1,1])g.lineStyle(2,PROTECTION,.7).strokePoints(pixelLine(side*25,-7,side*28,-2)).strokePoints(pixelLine(side*28,-2,side*25,3));
  return;
 }
 if(radialFactor>=1)return;
 const pressure=Math.min(1,bass.exposureMs/BASS_EXPOSURE_MS),pulse=reduced?0:Math.sin(t*3)*.8;
 g.lineStyle(2,PRESSURE,.35+pressure*.35).strokePoints(pixelEllipse(0,12,38-pressure*8+pulse,16-pressure*4),true);
 g.lineStyle(1.5,PRESSURE,.2+pressure*.3).strokePoints(pixelEllipse(0,12,47-pressure*8+pulse,21-pressure*5),true);
 for(const side of [-1,1])g.lineStyle(2,PRESSURE,.3+pressure*.3).strokePoints(pixelLine(side*16,2+pressure*4,side*13,7+pressure*3));
}
