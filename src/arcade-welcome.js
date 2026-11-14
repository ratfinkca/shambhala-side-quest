import './arcade-welcome.css';

// The caller owns visit/replay policy and can unlock audio directly in onEnter.
// Disposing the dialog is deliberately silent.
export function openArcadeWelcome({onEnter}) {
 const dialog=document.createElement('dialog');
 dialog.className='arcade-arrival';
 dialog.setAttribute('aria-labelledby','arcade-arrival-title');
 dialog.innerHTML=`
  <div class="arcade-arrival__sky" aria-hidden="true">
   <div class="arcade-arrival__sun"></div>
   <div class="arcade-arrival__hills"></div>
   <div class="arcade-arrival__floor"></div>
   <div class="arcade-arrival__gate"><span></span><span></span><span></span></div>
   <div class="arcade-arrival__sparks"></div>
  </div>
  <div class="arcade-arrival__card">
   <p class="arcade-arrival__label">Welcome to the dance floor</p>
   <h1 id="arcade-arrival-title">Side Quest</h1>
   <button type="button" class="arcade-arrival__enter" autofocus>Tap to enter</button>
   <button type="button" class="arcade-arrival__skip">Skip intro</button>
  </div>`;
 const focusBefore=document.activeElement;
 let mounted=true;
 function dispose(){
  if(!mounted)return;
  mounted=false;
  if(dialog.open)dialog.close();
  dialog.remove();
  if((document.activeElement===document.body||document.activeElement===focusBefore)&&focusBefore?.isConnected){
   focusBefore.focus({preventScroll:true});
  }
 }
 function enter(event){
  if(!mounted)return;
  event.preventDefault();
  dispose();
  onEnter();
 }
 dialog.querySelector('.arcade-arrival__enter').addEventListener('click',enter);
 dialog.querySelector('.arcade-arrival__skip').addEventListener('click',enter);
 dialog.addEventListener('cancel',enter); // Escape skips and returns focus.
 document.body.append(dialog);
 dialog.showModal();
 return dispose;
}
