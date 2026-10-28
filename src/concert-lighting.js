import {BEAT_MS} from './music.js';
import {cycleAt} from './festival.js';

// Continuous eased motion and low-opacity light, never full-screen flashes.
export const LIGHT_SHOWS={
 forest:{colours:[0xffd494,0x93dcc4,0xbca2ef,0xff99c8,0x93dcc4,0xffd494],pools:[0x79e6bc,0xc19cff,0xffb678,0x91bfff],width:160,core:45,period:8000,sweep:.3,spread:1,alpha:.055},
 neon:{colours:[0xff62da,0x7bf2ff,0xbe8bff,0x92ffb4,0x7bf2ff,0xff62da],pools:[0xb77cff,0x5cddff,0xff73cb,0x77eddb],width:90,core:15,period:4000,sweep:.42,spread:1.15,alpha:.065},
 sunrise:{colours:[0xffcf87,0xffaeb8,0xffe8ad,0xffe8ad,0xffaeb8,0xffcf87],pools:[0xffc786,0xffb9cb,0xffe0a0,0xb6e8d5],width:230,core:65,period:12000,sweep:.2,spread:1.2,alpha:.045},
};
export function concertLighting(elapsed,reduced=false,stageId='forest') {
  const show=LIGHT_SHOWS[stageId]||LIGHT_SHOWS.forest;
  if(reduced)return {sweep:0,spread:show.spread,alpha:show.alpha,glow:.18,fan:0};
  const cycle=cycleAt(elapsed);
  const build=cycle.phase==='build'?1-cycle.remainingMs/3000:0;
  const drop=cycle.phase==='drop'?Math.min(1,(4000-cycle.remainingMs)/350,cycle.remainingMs/650):0;
  const breath=(1+Math.cos(elapsed/BEAT_MS*Math.PI))/2;
  return {
    sweep:Math.sin(elapsed*Math.PI/show.period)*(show.sweep+drop*.12),
    spread:show.spread+build*.25+drop*.5,
    fan:(1+Math.sin(elapsed*Math.PI/6000))/2,
    alpha:show.alpha+build*.02+drop*(.015+breath*.01),
    glow:.18+build*.14+drop*.2+breath*.08,
  };
}
