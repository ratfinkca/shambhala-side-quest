// Disposable rehearsal settings; normal-game defaults and saved preferences
// belong to the game settings screen, never this preview.
const DEFAULTS=Object.freeze({music:.2,effects:1});

export function mountRehearsalAudioMix(root,{audio,isEnabled,getComparisonPlayer=()=>null}){
 const panel=root.ownerDocument.createElement('section');panel.className='rehearsal-mix';
 panel.setAttribute?.('aria-label','Rehearsal sound controls');
 panel.innerHTML=`<div class="rehearsal-mix-heading"><h2>Music & effects</h2><span>Rehearsal only</span></div><div class="rehearsal-mix-sliders"><label>Music volume <output data-mix-music-value>20%</output><input data-mix-music type="range" min="0" max="100" step="1" value="20" aria-label="Music volume"></label><label>Effects volume <output data-mix-effects-value>100%</output><input data-mix-effects type="range" min="0" max="100" step="1" value="100" aria-label="Effects volume"></label></div><div class="sound-check-buttons"><button class="quiet-button" data-mix-test>Test effects</button><button class="quiet-button" data-mix-reset>Reset mix</button></div><p data-mix-status role="status"></p><p class="rehearsal-mix-note">Music controls the original music, local track and comparison clips. Effects controls pickup and near-miss chimes. Sound on/off above mutes everything. This mix resets when you reload.</p>`;
 root.append(panel);
 const $=key=>panel.querySelector(`[data-mix-${key}]`),music=$('music'),effects=$('effects'),test=$('test'),reset=$('reset'),status=$('status');
 let volumes={...DEFAULTS},disposed=false,busy=false,token=0,nextEffect='pickup',comparison=null,message='Try a chime while the music plays, then adjust the balance.';
 function comparisonVolumeChanged(){
  if(disposed||!comparison)return;
  // Native comparison controls share the music setting. They cannot bypass
  // the master switch, including an unmute while Sound off is selected.
  if(!isEnabled()){if(!comparison.muted)comparison.muted=true;return;}
  const value=comparison.muted?0:comparison.volume;
  if(value!==volumes.music){volumes.music=value;apply();}
 }
 function refresh(){
  if(disposed)return;
  const enabled=isEnabled();
  if((!enabled||volumes.effects===0)&&busy){token++;busy=false;}
  test.disabled=busy||!enabled||volumes.effects===0;
  status.textContent=!enabled?'Sound is off. Turn it on above to hear music and effects.':volumes.effects===0?'Effects are muted. Raise Effects volume to test a chime.':busy?'Starting audio…':message;
  const player=getComparisonPlayer();
  if(player!==comparison){comparison?.removeEventListener('volumechange',comparisonVolumeChanged);comparison=player;comparison?.addEventListener('volumechange',comparisonVolumeChanged);}
  if(comparison){if(comparison.volume!==volumes.music)comparison.volume=volumes.music;if(comparison.muted===enabled)comparison.muted=!enabled;}
 }
 function apply(){
  audio.setVolumes({...volumes});
  for(const key of ['music','effects']){$(key).value=String(Math.round(volumes[key]*100));$(`${key}-value`).textContent=`${Math.round(volumes[key]*100)}%`;}
  refresh();
 }
 function change(event){
  const key=event.target===music?'music':'effects',value=Number(event.target.value);
  if(!Number.isFinite(value))return;
  volumes[key]=Math.max(0,Math.min(1,value/100));apply();
 }
 function resetMix(){volumes={...DEFAULTS};message='Mix reset: music 20%, effects 100%.';apply();}
 function cancelPreview(){token++;busy=false;message='Try a chime while the music plays, then adjust the balance.';refresh();}
 async function testEffects(){
  if(disposed||busy||!isEnabled()||volumes.effects===0)return;
  const attempt=++token;busy=true;refresh();
  let ready=false;try{ready=await audio.setEnabled(true);}catch{/* Report unavailable audio below. */}
  if(disposed||attempt!==token)return;
  busy=false;
  if(!isEnabled()||volumes.effects===0){refresh();return;}
  if(!ready){message='Audio could not start. Try Sound off/on above, then test again.';refresh();return;}
  if(nextEffect==='pickup'){audio.pickup(1);nextEffect='near-miss';message='Pickup chime played. Press again for the near-miss chime.';}
  else{audio.closePass();nextEffect='pickup';message='Near-miss chime played. Press again for the pickup chime.';}
  refresh();
 }
 music.addEventListener('input',change);effects.addEventListener('input',change);test.addEventListener('click',testEffects);reset.addEventListener('click',resetMix);apply();
 return {refresh,cancelPreview,dispose(){if(disposed)return;disposed=true;token++;comparison?.removeEventListener('volumechange',comparisonVolumeChanged);music.removeEventListener('input',change);effects.removeEventListener('input',change);test.removeEventListener('click',testEffects);reset.removeEventListener('click',resetMix);panel.remove();}};
}
