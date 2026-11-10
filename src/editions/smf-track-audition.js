import {elapsedMs} from '../stage-clock.js';

// Only the DEV venue entry imports this module. Selected audio stays in this
// page as a local object URL; it is never uploaded, persisted or bundled.
export function createTrackAudition(base,{createPlayer=()=>new Audio(),createURL=file=>URL.createObjectURL(file),revokeURL=url=>URL.revokeObjectURL(url)}={}){
 let player=null,url=null,detach=null,disposed=false,enabled=false,mode='original',name='',ready=false,loading=false,error='',cueSeconds=0,duration=0;
 let lastElapsed=null,lastTiming=null,needsSeek=true,pending=false,blocked=false,attempt=0,ended=false,musicVolume=.45,playback='paused',position=0;
 const listeners=new Set();
 const snapshot=()=>({mode,name,ready,loading,error,cueSeconds,duration,ended,blocked,playback,position});
 const notify=()=>{for(const listener of listeners)listener(snapshot());};
 function pauseTrack(){
  attempt++;pending=false;needsSeek=true;lastElapsed=null;player?.pause();
  // Native pause events are asynchronous. Publish this transition now, even
  // when the later event has the same rounded position and no further change.
  if(playback!=='paused'){playback='paused';notify();}
 }
 function clearPlayer(){
  pauseTrack();detach?.();detach=null;
  if(player){player.removeAttribute('src');player.load();player=null;}
  if(url){revokeURL(url);url=null;}
 }
 function playTrack(){
  if(!player||pending||blocked||!player.paused)return;
  pending=true;const token=++attempt,current=player;
  try{
   Promise.resolve(current.play()).then(()=>{if(token===attempt)pending=false;},()=>{
    if(disposed||token!==attempt)return;
    pending=false;blocked=true;current.pause();playback='blocked';error='Playback was blocked. Press Start fresh or Resume to try again.';notify();
   });
  }catch{
   pending=false;blocked=true;playback='blocked';error='This file could not play. Try another audio file.';notify();
  }
 }
 const audio={...base,
  setEnabled(value){enabled=!!value;base.setEnabled(value);if(!enabled)pauseTrack();else{blocked=false;if(error.startsWith('Playback was blocked.')){error='';notify();}}},
  setVolumes(value){base.setVolumes(value);if(Number.isFinite(value.music)){musicVolume=Math.max(0,Math.min(1,value.music));if(player)player.volume=musicVolume;}},
  stop(){base.stop();pauseTrack();},
  sync(round,stageId){
   if(disposed)return;
   if(mode!=='track'){base.sync(round,stageId);return;}
   if(!enabled||!ready||round.ended){pauseTrack();return;}
   const elapsed=elapsedMs(round),target=cueSeconds+elapsed/1000;
   if(target>=duration){
    if(!ended){ended=true;pauseTrack();playback='ended';notify();}return;
   }
   if(ended){ended=false;notify();}
   // Game time remains authoritative. A large drift can follow a device stall;
   // ordinary frames must not keep seeking or restarting the recording.
   if(needsSeek||lastTiming!==round.timingId||(lastElapsed!==null&&elapsed<lastElapsed)||Math.abs(player.currentTime-target)>.35){
    try{player.currentTime=target;needsSeek=false;}catch{return;}
   }
   lastElapsed=elapsed;lastTiming=round.timingId;
  },
 };
 return {audio,snapshot,
  subscribe(listener){listeners.add(listener);listener(snapshot());return()=>listeners.delete(listener);},
  loadFile(file){
   if(disposed)return;
   base.stop();clearPlayer();mode='original';ready=false;loading=false;ended=false;blocked=false;error='';duration=0;cueSeconds=0;position=0;name='';
   if(!file||!Number.isFinite(file.size)||file.size<=0){error='Choose an audio file from this device.';notify();return;}
   name=String(file.name||'Local track');loading=true;
   try{
    const current=createPlayer();player=current;url=createURL(file);current.preload='metadata';current.volume=musicVolume;current.loop=false;
    const loaded=()=>{
     if(current!==player||disposed)return;
     loading=false;duration=current.duration;
     ready=Number.isFinite(duration)&&duration>0;
     if(!ready)error='This file has no playable duration. Try an MP3, WAV or M4A file.';
     notify();
    };
    const failed=()=>{if(current!==player||disposed)return;loading=false;ready=false;mode='original';error='This browser could not read that file. Try an MP3, WAV or M4A file.';pauseTrack();notify();};
    const mediaState=()=>{
     if(current!==player||disposed)return;
     const nextPosition=Math.floor(current.currentTime*10)/10,nextPlayback=current.ended?'ended':current.paused?'paused':'playing';
     if(position!==nextPosition||playback!==nextPlayback){position=nextPosition;playback=nextPlayback;notify();}
    };
    const events=[['loadedmetadata',loaded],['error',failed],...['playing','pause','timeupdate','ended'].map(event=>[event,mediaState])];
    events.forEach(([event,listener])=>current.addEventListener(event,listener));
    detach=()=>events.forEach(([event,listener])=>current.removeEventListener(event,listener));
    current.src=url;current.load();notify();
   }catch{clearPlayer();loading=false;error='This file could not be opened.';notify();}
  },
  useTrack(){if(disposed||!ready)return false;base.stop();pauseTrack();mode='track';ended=false;blocked=false;error='';notify();return true;},
  useOriginal(){if(disposed)return;pauseTrack();base.stop();mode='original';ended=false;blocked=false;error='';notify();},
  setCue(value){
   const cue=Number(value);if(!ready||!Number.isFinite(cue)||cue<0||cue>=duration)return false;
   cueSeconds=cue;pauseTrack();ended=false;blocked=false;error='';notify();return true;
  },
  // Called synchronously from Start/Resume/Use track/Sound on clicks. Safari
  // requires this user gesture; the animation-frame sync never calls play().
  playFromGesture(round){
   if(disposed||!enabled||mode!=='track'||!ready)return;
   const elapsed=round?elapsedMs(round):0,target=cueSeconds+elapsed/1000;
   if(target>=duration)return;
   blocked=false;error='';ended=false;
   try{player.currentTime=target;position=Math.floor(target*10)/10;needsSeek=false;}catch{return;}
   lastElapsed=elapsed;lastTiming=round?.timingId;playTrack();notify();
  },
  dispose(){if(disposed)return;disposed=true;base.stop();clearPlayer();listeners.clear();},
 };
}

export function mountTrackAudition(root,{audition,pause,start}){
 const panel=document.createElement('details');panel.className='sound-check track-audition';
 panel.innerHTML=`<summary>Try a local track</summary><p>Hear a recording while you play. Your file stays on this device and is forgotten when this page closes. Use this track starts a fresh round.</p><div class="track-audition-fields"><label>Choose an audio file<input type="file" accept="audio/*,.mp3,.wav,.m4a,.ogg,.flac" data-track-file></label><label>Start at (seconds)<input type="number" min="0" step="0.1" value="0" inputmode="decimal" data-track-cue disabled></label></div><div class="sound-check-buttons"><button class="quiet-button" data-track-source="track" disabled aria-pressed="false">Use this track</button><button class="quiet-button" data-track-source="original" aria-pressed="true">Original music</button></div><p role="status" data-track-status>Choose an audio file to begin.</p><p data-track-position hidden></p><p class="track-audition-note">This is a listening preview. Lights, scoring and round length keep the venue’s existing timing; they do not automatically follow your song. Pause, Sound off and Start fresh also control the recording.</p>`;
 root.append(panel);
 const file=panel.querySelector('[data-track-file]'),cue=panel.querySelector('[data-track-cue]'),track=panel.querySelector('[data-track-source="track"]'),original=panel.querySelector('[data-track-source="original"]'),status=panel.querySelector('[data-track-status]'),position=panel.querySelector('[data-track-position]');
 const text=(node,value)=>{if(node.textContent!==value)node.textContent=value;};
 let renderedCue;
 const unsubscribe=audition.subscribe(state=>{
  cue.disabled=!state.ready;track.disabled=!state.ready;cue.max=state.ready?String(Math.max(0,state.duration-.01)):'';
  // Native playing/pause/timeupdate events must never replace an uncommitted
  // edit. Update the field only when the actual cue changes or a file resets.
  if(renderedCue!==state.cueSeconds){cue.value=String(state.cueSeconds);renderedCue=state.cueSeconds;}
  track.setAttribute('aria-pressed',String(state.mode==='track'));original.setAttribute('aria-pressed',String(state.mode==='original'));
  text(status,state.error||(state.loading?'Opening your local file…':!state.ready?'Choose an audio file to begin.':state.ended?'The recording ended. Start fresh or choose an earlier starting point.':state.mode==='track'?`${state.name} · local track selected.`:`${state.name} is ready. Original music is selected.`));
  position.hidden=!state.ready||state.mode!=='track';
  text(position,`${state.playback==='playing'?'Playing':state.playback==='ended'?'Ended':state.playback==='blocked'?'Blocked':'Paused'} local track · ${state.position.toFixed(1)}s / ${state.duration.toFixed(1)}s`);
 });
 const choose=()=>{if(!file.files?.[0])return;pause();renderedCue=undefined;audition.loadFile(file.files[0]);file.value='';};
 const changeCue=()=>{const requestedCue=cue.value;pause();if(!audition.setCue(requestedCue)){cue.value=String(audition.snapshot().cueSeconds);status.textContent='Choose a start time before the end of the recording.';}};
 const useTrack=()=>{
  const requestedCue=cue.value;pause();
  if(!audition.setCue(requestedCue)){cue.value=String(audition.snapshot().cueSeconds);status.textContent='Choose a start time before the end of the recording.';return;}
  if(audition.useTrack())start();
 };
 const useOriginal=()=>{pause();audition.useOriginal();};
 file.addEventListener('change',choose);cue.addEventListener('change',changeCue);track.addEventListener('click',useTrack);original.addEventListener('click',useOriginal);
 return()=>{unsubscribe();file.removeEventListener('change',choose);cue.removeEventListener('change',changeCue);track.removeEventListener('click',useTrack);original.removeEventListener('click',useOriginal);panel.remove();};
}
