import {BONUSES} from './model.js';
const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

// A press that began on the dancefloor can never acknowledge the finish screen.
export function createFinishGate(delayMs=1100){
 let active=false,readyAt=0,freshPointer=false;
 return {
  begin(now){active=true;readyAt=now+delayMs;freshPointer=false;},
  ready(now){return active&&now>=readyAt;},
  pointerDown(now){freshPointer=active&&now>=readyAt;},
  accept(detail,now){if(!active||now<readyAt||detail>0&&!freshPointer)return false;active=false;freshPointer=false;return true;},
  cancel(){active=false;freshPointer=false;},
 };
}
export function finishHTML(profile,kind){
 const a=profile.active,s=a.summary;
 if(kind==='bonus'){
  const b=a.bonus,info=BONUSES.find(x=>x.id===b.id),earned=!!b.rewardId;
  return `<span class="tour-eyebrow">${escape(info.name)}</span><h2>${earned?'What a little side quest!':'Thanks for the dance.'}</h2><p>${earned?escape(info.reward.name)+(b.newReward?' unlocked!':' · yours to keep.'):b.won?'Challenge complete!':'Come back for another try.'}</p><p class="tour-finish-hint">Take it in. Continue above when you’re ready.</p>`;
 }
 return `<span class="tour-eyebrow">${s?.qualified?'SET COMPLETE':'END OF THE SET'}</span><h2>${s?.qualified?'Beautifully danced.':'Until the next dance.'}</h2><p>${s?.pickups??0}${s?.target?` / ${s.target}`:''} sparks · +${s?.xp??0} rave XP</p><p>${a.score} total points · ${a.cleared} ${a.cleared===1?'stage':'stages'} cleared</p><p class="tour-finish-hint">Take a breath. Continue above for ${a.status==='summary'?'your next choice':'your results'}.</p>`;
}

export function createFinishView(scene){
 const ink=scene.add.graphics().setDepth(35);let active=false,age=0,celebrate=false;
 return {
  start(won){active=true;age=0;celebrate=won;},
  stop(){active=false;ink.clear();},
  update(delta,reduced){
   if(!active)return;age+=Math.min(50,Math.max(0,delta));ink.clear();
   const progress=Math.min(1,age/1800);
   if(celebrate)for(let i=0;i<24;i++){
    const angle=i*Math.PI*2/24,radius=70+(reduced?90:progress*220),x=480+Math.cos(angle)*radius,y=340+Math.sin(angle)*radius*.6;
    ink.fillStyle(i%2?0xffdf91:0x9ce9ce,(1-progress)*.6+.12).fillCircle(x,y,i%3+2);
   }
  },
  destroy(){ink.destroy();},
 };
}
