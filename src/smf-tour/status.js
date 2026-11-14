// Announcements are brief; objectives and effect countdowns live in the HUD.
// Round time pauses naturally. Putting supplies its monotonic practice clock
// because its musical round clock can stop or wrap between shots.
export function createTourStatus(write,{now=()=>performance.now()}={}){
 let transient=null;
 function clear(){transient=null;write('',{kind:null});}
 return {
  show(message,{round,kind,clockMs}={}){
   if(!message){clear();return;}
   const customClock=Number.isFinite(clockMs);
   transient={
    round,kind,customClock,effect:round?.mystery?.effect,
    remainingMs:['flow','candy'].includes(kind)?2400:3000,
    lastClockMs:customClock?clockMs:round?-round.remainingMs:now(),
   };
   write(message,{kind});
  },
  update(round,{paused=false,clockMs}={}){
   if(!transient)return;
   const current=transient;
   const expired=current.kind==='flow'&&!(round?.flowMs>0)||current.kind==='candy'&&(!(round?.mystery?.effectMs>0)||round.mystery.effect!==current.effect);
   if(current.round&&(current.round!==round||round.ended||expired)){clear();return;}
   const clock=current.customClock?clockMs:current.round?-round.remainingMs:now();
   if(!Number.isFinite(clock))return;
   const delta=Math.max(0,clock-current.lastClockMs);
   current.lastClockMs=clock;
   if(!paused)current.remainingMs-=delta;
   if(current.remainingMs<=0)clear();
  },
  clear,
 };
}
