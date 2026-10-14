import {BASS_RADIUS,speakerCones} from './geometry.js';
import {BEAT_MS} from './music.js';

export function bassBeat(elapsed){return Math.exp(-(elapsed%BEAT_MS)/BEAT_MS*9);}
export function bassOffset(position,speakers,elapsed,phase,reduced){
 if(reduced)return {x:0,y:0};
 let proximity=0;
 for(const speaker of speakers)for(const cone of speakerCones(speaker)){
  proximity=Math.max(proximity,1-Math.hypot(position.x-cone.x,position.y-cone.y)/BASS_RADIUS);
 }
 if(proximity<=0)return {x:0,y:0};
 const amplitude=proximity*bassBeat(elapsed)*(phase==='drop'?4:2.6);
 const vibration=(elapsed%BEAT_MS)/BEAT_MS*Math.PI*16;
 return {x:Math.sin(vibration)*amplitude,y:Math.cos(vibration)*amplitude*.65};
}
