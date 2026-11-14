// Menus use the same sound setting and buses as gameplay. A gesture unlocks the
// context once; this controller only schedules music while a menu is visible.
export function createMenuAmbience(audio,{isMenu,settings,document:doc=globalThis.document,requestFrame=globalThis.requestAnimationFrame,cancelFrame=globalThis.cancelAnimationFrame}={}){
 let unlocked=false,active=false,disposed=false,frame=null,last=null,elapsed=0;
 const wanted=()=>!disposed&&unlocked&&!doc.hidden&&isMenu()&&settings().enabled;
 function stop(){if(frame!==null)cancelFrame(frame);frame=null;last=null;if(active)audio.stop();active=false;}
 function tick(now){
  frame=null;if(!wanted()){stop();return;}
  if(last!==null)elapsed+=Math.max(0,Math.min(now-last,250));last=now;
  audio.syncMenu(elapsed);frame=requestFrame(tick);
 }
 function refresh(){
  if(!wanted()){stop();return;}
  audio.setVolumes(settings());active=true;
  if(frame===null)frame=requestFrame(tick);
 }
 function unlock(){
  if(disposed)return;
  unlocked=true;
  // Call resume synchronously inside the browser gesture, before awaiting it.
  const attempt=audio.setEnabled(settings().enabled);
  Promise.resolve(attempt).then(()=>{if(!disposed)refresh();});
 }
 function gesture(e){if(e.type==='keydown'&&(e.repeat||e.metaKey||e.ctrlKey||e.altKey))return;unlock();}
 doc.addEventListener('pointerdown',gesture,true);doc.addEventListener('keydown',gesture,true);
 doc.addEventListener('visibilitychange',refresh);
 return {refresh,unlock,stop,dispose(){disposed=true;stop();doc.removeEventListener('pointerdown',gesture,true);doc.removeEventListener('keydown',gesture,true);doc.removeEventListener('visibilitychange',refresh);}};
}
