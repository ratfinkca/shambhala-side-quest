import {assertTiming,phaseAt} from '../supabase/functions/_shared/stage-timing.js';
// Driven only by active game time. A cursor bounds memory, even during Endless.
export function createMusicTransport({voices,schedule,cancel,lookaheadMs=100}){
 if(!Number.isFinite(lookaheadMs)||lookaheadMs<=0||lookaheadMs>250)throw new Error('Invalid audio lookahead');
 let current=null,lastElapsed=-1,lastStep=-1;
 function stop(){cancel();current=null;lastElapsed=-1;lastStep=-1;}
 return {stop,sync({timing,elapsedMs,audioNowSec,multiplier,flowActive}){
  assertTiming(timing);
  if(!Number.isFinite(elapsedMs)||!Number.isFinite(audioNowSec))throw new Error('Invalid audio position');
  const elapsed=Math.max(0,elapsedMs);
  if(current&&(current!==timing||elapsed<lastElapsed))stop();
  if(elapsed>=timing.durationMs){if(current)stop();return;}
  current=timing;lastElapsed=elapsed;
  const interval=60000/(timing.bpm*timing.stepsPerBeat),end=Math.min(elapsed+lookaheadMs,timing.durationMs);
  for(let step=Math.max(lastStep+1,Math.floor(elapsed/interval));;step++){
   const onset=Math.round(step*interval);
   if(onset>=end)break;
   if(onset<elapsed)continue;
   for(const voice of voices({timing,step,multiplier,flowActive,phase:phaseAt(onset,timing).phase}))schedule(voice,audioNowSec+(onset-elapsed)/1000);
   lastStep=step;
  }
 }};
}
