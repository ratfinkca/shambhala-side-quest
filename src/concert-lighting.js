import {BEAT_MS} from './music.js';
import {cycleAt} from './festival.js';

// Continuous eased motion and low-opacity light, never full-screen flashes.
export function concertLighting(elapsed,reduced=false) {
  if(reduced)return {sweep:0,spread:1,alpha:.055,glow:.18,fan:0};
  const cycle=cycleAt(elapsed);
  const build=cycle.phase==='build'?1-cycle.remainingMs/3000:0;
  const drop=cycle.phase==='drop'?Math.min(1,(4000-cycle.remainingMs)/350,cycle.remainingMs/650):0;
  const breath=(1+Math.cos(elapsed/BEAT_MS*Math.PI))/2;
  return {
    sweep:Math.sin(elapsed*Math.PI/8000)*(.3+drop*.12),
    spread:1+build*.25+drop*.5,
    fan:(1+Math.sin(elapsed*Math.PI/6000))/2,
    alpha:.055+build*.02+drop*(.015+breath*.01),
    glow:.18+build*.14+drop*.2+breath*.08,
  };
}
