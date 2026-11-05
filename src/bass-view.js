import {bassDuration,BASS_CHARGE_MS,BASS_ACTIVE_MS} from './bass-head.js';
const seconds=ms=>String(Math.round(ms/100)/10);
export function bassButtonState(b,{playing=false,hasSpeakers=false}={}){
 const charge=b?.chargeMs||0,active=(b?.activeMs||0)>0,duration=bassDuration(charge),percent=Math.floor(charge/BASS_CHARGE_MS*100);
 const phase=active?'active':charge>=BASS_CHARGE_MS?'full':duration?'ready':'charging',hidden=!playing||!hasSpeakers;
 return {hidden,disabled:hidden||active||!duration,phase,progress:active?Math.min(1,b.activeMs/(b.activeDurationMs||BASS_ACTIVE_MS)):Math.min(1,charge/BASS_CHARGE_MS),
  detail:active?`${seconds(b.activeMs)}s`:duration?`${seconds(duration)}s`:`${percent}%`,
  ariaLabel:active?`Bass Head active. ${seconds(b.activeMs)} seconds remaining.`:duration?`Bass Head. ${percent}% charged. Activate for ${seconds(duration)} seconds. Press B.`:`Bass Head. ${percent}% charged. Available at 25%. Press B or tap when ready.`};
}
export function activationInput(event,lastPointer){return event.detail===0?'keyboard':(event.pointerType||(lastPointer||'mouse'))==='touch'?'touch':'mouse';}
export function updateBassButton(button,b,options){
 const view=bassButtonState(b,options);button.hidden=view.hidden;button.disabled=view.disabled;button.dataset.phase=view.phase;
 button.style.setProperty('--bass-angle',`${view.progress*360}deg`);
 button.setAttribute('aria-label',view.ariaLabel);button.setAttribute('title',view.ariaLabel);
 button.querySelector('.bass-control-detail').textContent=view.detail;
 button.classList.toggle('ready',view.phase==='ready'||view.phase==='full');
 return view;
}
