import {renderSoundCheck} from './smf-sound-check.js';

export function mountSoundCheck(root,{getStage,pause}){
 const panel=document.createElement('details');panel.className='sound-check';
 panel.innerHTML=`<summary>Sound check · compare the new mix</summary><p>Hear the same eight-bar build and drop at a matched listening level. Choose a venue above, then prepare a clip. The game pauses while you listen.</p><div class="sound-check-buttons"><button class="quiet-button" data-mix="full">Prepare fuller mix</button><button class="quiet-button" data-mix="sketch">Prepare original sketch</button></div><p role="status" class="sound-check-status">Clips are made on this device.</p><audio controls preload="none" hidden aria-label="Venue sound comparison"></audio><a class="quiet-button" hidden download>Save this clip</a>`;
 root.append(panel);
 const buttons=[...panel.querySelectorAll('button')],status=panel.querySelector('[role="status"]'),player=panel.querySelector('audio'),download=panel.querySelector('a');
 let disposed=false,url;
 async function prepare(event){
  if(buttons[0].disabled)return;
  const stage=getStage(),sketch=event.currentTarget.dataset.mix==='sketch';
  pause();player.pause();buttons.forEach(b=>b.disabled=true);
  status.textContent=`Preparing ${stage.name} · ${sketch?'original sketch':'fuller mix'}…`;
  try{
   const result=await renderSoundCheck(stage,{sketch});if(disposed)return;
   if(url)URL.revokeObjectURL(url);
   url=URL.createObjectURL(new Blob([result.wav],{type:'audio/wav'}));
   player.src=url;player.hidden=false;download.href=url;download.download=`${stage.id}-${sketch?'sketch':'full'}-sound-check.wav`;download.hidden=false;
   status.textContent=`${stage.name} · ${sketch?'original sketch':'fuller mix'} · ${result.seconds.toFixed(1)} seconds. Press play below.`;
   // Read-only evidence for local verification; no player data is recorded.
   status.dataset.render=JSON.stringify({venue:stage.id,sketch,peak:result.stats.peak,rms:result.stats.rms,gain:result.gain,...result.diagnostics});
  }catch(error){if(!disposed)status.textContent=`Couldn't prepare this clip. ${error.message}`;}
  finally{if(!disposed)buttons.forEach(b=>b.disabled=false);}
 }
 buttons.forEach(button=>button.addEventListener('click',prepare));
 player.addEventListener('play',pause);
 const stopPlayback=()=>player.pause();
 const visibility=()=>{if(document.hidden)stopPlayback();};
 const keydown=event=>{if(event.code==='Escape'&&!event.repeat&&!event.defaultPrevented&&!event.target?.matches?.('select,input,textarea'))stopPlayback();};
 const controls=[['#clock-lab-select','change'],['#clock-start','click'],['#clock-pause','click'],['#clock-sound','click']].map(([selector,event])=>[root.querySelector(selector),event]);
 controls.forEach(([node,event])=>node.addEventListener(event,stopPlayback));
 document.addEventListener('visibilitychange',visibility);
 // Run before the clock's bubble listener consumes Escape to resume gameplay.
 document.addEventListener('keydown',keydown,true);
 return ()=>{disposed=true;player.pause();player.removeEventListener('play',pause);player.removeAttribute('src');player.load();if(url)URL.revokeObjectURL(url);buttons.forEach(button=>button.removeEventListener('click',prepare));document.removeEventListener('visibilitychange',visibility);document.removeEventListener('keydown',keydown,true);controls.forEach(([node,event])=>node.removeEventListener(event,stopPlayback));panel.remove();};
}
