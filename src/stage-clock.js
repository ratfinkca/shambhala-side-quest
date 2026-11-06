import {getTiming,phaseAt,assertTiming} from '../supabase/functions/_shared/stage-timing.js';
export {getTiming,phaseAt,musicalPosition} from '../supabase/functions/_shared/stage-timing.js';
export function roundTiming(round){
 if(Object.hasOwn(round,'timingId')&&round.timingId===undefined)throw new Error('Invalid stage clock');
 return Object.hasOwn(round,'timingId')?getTiming(round.timingId):getTiming();
}
export function elapsedMs(round){
 const timing=roundTiming(round);
 if(!Number.isFinite(round.remainingMs))throw new Error('Invalid remaining time');
 return Math.max(0,Math.min(timing.durationMs,timing.durationMs-round.remainingMs));
}
export function phaseProgress(elapsed,timing=getTiming()){
 assertTiming(timing);const {phase}=phaseAt(elapsed,timing),time=Math.max(0,elapsed);
 if(phase==='ended')return 1;
 let previousEnd=0;
 for(const start of timing.dropStartsMs){
  const build=start-timing.buildMs,end=start+timing.dropDurationMs;
  if(time<build)return (time-previousEnd)/(build-previousEnd);
  if(time<start)return (time-build)/timing.buildMs;
  if(time<end)return (time-start)/timing.dropDurationMs;
  previousEnd=end;
 }
 return (time-previousEnd)/(timing.durationMs-previousEnd);
}
