// Pickup announcements are brief; the HUD owns each effect's live countdown.
// Use round time rather than timers so pauses preserve the remaining display
// time, and a newer message always replaces the old message's expiry owner.
export function createTourStatus(write){
 let transient=null;
 function clear(){transient=null;write('');}
 return {
  show(message,{round,kind}={}){
   transient=round&&['flow','candy'].includes(kind)?{
    round,kind,effect:round.mystery?.effect,remainingMs:2400,lastRoundMs:round.remainingMs,
   }:null;
   write(message||'');
  },
  update(round,{paused=false}={}){
   if(!transient)return;
   const current=transient;
   const expired=current.kind==='flow'?!(round?.flowMs>0):!(round?.mystery?.effectMs>0)||round.mystery.effect!==current.effect;
   if(current.round!==round||round.ended||expired){clear();return;}
   const delta=Math.max(0,current.lastRoundMs-round.remainingMs);
   current.lastRoundMs=round.remainingMs;
   if(!paused)current.remainingMs-=delta;
   if(current.remainingMs<=0)clear();
  },
  clear,
 };
}
