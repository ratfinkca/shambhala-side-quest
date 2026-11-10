import Phaser from 'phaser';
import './style.css';
import {applyTheme} from '../theme-view.js';
import {createAudio} from '../audio.js';
import {smfPreviewVoices} from '../editions/smf-music.js';
import {bonusPreviewVoices} from '../bonus-practice/music.js';
import {createSMFInstrumentRack} from '../editions/smf-instruments.js';
import {createRecoveryOwner} from '../recovery-owner.js';
import {updateBassButton} from '../bass-view.js';
import {elapsedMs} from '../stage-clock.js';
import {DELIVERY_RECIPIENTS,recipientPortrait} from '../amp-delivery-view.js';
import {BONUSES,ROUTE,createFestival,collectInvitation,finishMain,choosePerk,beginBonus,finishBonus,returnBonus,endFestival,closeResults} from './model.js';
import {createTourStore} from './store.js';
import {tourScene} from './scene.js';
import {mainStage} from './content.js';
import {titleHTML,catalogueHTML,wardrobeHTML,summaryHTML,bonusResultHTML} from './view.js';

const lab=import.meta.env.DEV&&new URLSearchParams(location.search).has('rehearsal')&&new URLSearchParams(location.search).has('tour');
const key=lab?'sidequest.smf.tour-lab.v1':'sidequest.smf.profile.v1';
let browserStorage;try{browserStorage=window.localStorage;}catch{/* Visible storage notice below. */}
const store=createTourStore(browserStorage,{key}),owner=createRecoveryOwner({locks:navigator.locks,name:key});
let profile=store.read(),scene=null,view='title',paused=true,ready=false,disposed=false,saved=true,saveClock=0,preparing=false,loadFailed=false;
let soundOn=true,music=.45,effects=.65;
const root=document.querySelector('.shell');root.className='shell smf-tour';applyTheme('forest-freakout');
root.innerHTML=`<header class="tour-header"><span class="tour-wordmark">Shambhala · Side Quest</span><nav><button class="quiet-button" data-action="home">Festival home</button><button class="quiet-button" data-action="sound" id="tour-sound" aria-pressed="true">Sound on</button></nav></header><div id="tour-notice" class="tour-notice" role="status" hidden></div><div id="tour-lab" hidden></div><section id="tour-running" class="tour-running" hidden><div class="tour-hud"><div class="tour-progress"><span id="tour-stage"></span><strong id="tour-points"></strong></div><div class="tour-clock"><span id="tour-clock-label">TIME LEFT</span><strong id="tour-time"></strong></div></div><div class="tour-arena"><div id="game" tabindex="0" role="application" aria-label="Festival dancefloor. Click or tap to move, or use WASD or arrows. Escape pauses."></div><button id="bass-head" class="bass-control" data-action="bass" aria-keyshortcuts="B"><span class="bass-control-icon" aria-hidden="true">ϟ</span><span class="bass-control-name">Bass Head</span><span id="tour-bass-detail" class="bass-control-detail"></span></button><div id="tour-paused" class="tour-paused"><strong>Take a breather.</strong><span>Your adventure is paused.</span><button class="primary-button" data-action="pause">Resume</button></div></div><div id="tour-order" class="tour-strip"></div><p id="tour-status" class="tour-status" role="status"></p><div id="tour-putt" class="tour-putt" hidden><button id="tour-next-green" class="primary-button" data-action="green" hidden>Next green →</button><details><summary>Button controls for putting</summary><label>Aim <input id="tour-angle" aria-label="Putting aim" type="range" min="-180" max="180" value="0"></label><label>Power <input id="tour-power" aria-label="Putting power" type="range" min="5" max="100" value="50"></label><button class="primary-button" data-action="putt">Putt</button></details></div><div class="tour-game-actions"><button class="quiet-button" data-action="pause" id="tour-pause">Pause</button><button class="quiet-button" data-action="leave" id="tour-leave">Finish Festival</button></div></section><section id="tour-menu" class="tour-menu" aria-label="Festival menu"></section><details class="tour-mixer"><summary>Music & effects</summary><label>Music <input id="tour-music" type="range" min="0" max="100" value="45"></label><label>Effects <input id="tour-fx" type="range" min="0" max="100" value="65"></label></details>`;
const $=s=>root.querySelector(s),text=(s,t)=>{const n=$(s);if(n.textContent!==String(t))n.textContent=String(t);};
const audio=createAudio(undefined,{timedVoices:f=>f.timing.id.includes('bonus-preview')?bonusPreviewVoices(f):smfPreviewVoices(f),useTransport:true,createMusicRenderer:createSMFInstrumentRack});
function notice(message){$('#tour-notice').hidden=!message;text('#tour-notice',message);}
function persist(){
 if(!owner.held){saved=false;return false;}
 saved=store.write(profile);
 if(!saved)notice('Saving is unavailable. You can keep playing, but this session’s progress may be lost if you leave.');
 else if(!loadFailed)notice('');
 return saved;
}
function commit(next){profile=next;persist();}
function checkpoint(){
 if(!scene||preparing||loadFailed||view!=='run')return;
 const a=profile.active;if(!a||(!a.bonus&&a.status!=='playing')||a.bonus?.status==='result')return;
 const snap=scene.capture();
 if(a.bonus){a.bonus.scene=snap.scene;a.bonus.activity=snap.activity;}else a.scene=snap.scene;
 persist();saveClock=performance.now();
}
function setPaused(value){
 if(loadFailed&&!value)return;
 paused=value;if(value){scene?.pauseTour();audio.stop();checkpoint();}else{scene?.resumeTour();audio.setEnabled(soundOn);$('#game').focus({preventScroll:true});}
 renderPause();
}
function renderPause(){
 $('#tour-paused').hidden=!paused; text('#tour-pause',paused?'Resume':'Pause');
 $('#tour-next-green').disabled=paused;
}
function isLive(){const a=profile.active;return view==='run'&&a&&(a.bonus?a.bonus.status==='playing':a.status==='playing');}
function load({recovered=false}={}){
 view='run';preparing=true;loadFailed=false;
 try{scene.loadActive({paused:recovered});paused=recovered;}
 catch(error){loadFailed=true;scene.failed=true;paused=true;scene.pauseTour();console.error('Festival scene could not load',error);notice('This visit could not be opened. Leave the visit to return safely to your Festival.');}
 finally{preparing=false;}
 if(!paused)audio.setEnabled(soundOn);
 checkpoint();render();
}
function hud(round){
 if(!scene||!profile.active)return;
 const a=profile.active,b=a.bonus,p=scene.practice;
 text('#tour-stage',b?`${scene.config.name} · ${scene.config.dj}`:`${a.stageIndex+1} / 6 · ${mainStage(ROUTE[a.stageIndex]).name}`);
 text('#tour-points',b?(scene.config.activity==='delivery'?`${p.state.delivered} / 3 delivered`:`${p.state.progress} / ${p.state.goal} ${scene.config.activity==='putt'?'holes':'found'}`):`${round.score} points · ${round.pickups} / ${mainStage(ROUTE[a.stageIndex]).target} sparks`);
 const putt=b&&scene.config.activity==='putt';text('#tour-clock-label',putt?'SHOTS':'TIME LEFT');text('#tour-time',putt?`${p.state.strokes} / 8`:`${Math.ceil(round.remainingMs/1000)}s`);
 $('#game').setAttribute('aria-label',putt?'Putting green. Drag anywhere opposite your shot and release, or use the aim and power controls below. Escape pauses.':'Festival dancefloor. Click or tap to move, or use WASD or arrows. Escape pauses.');
 updateBassButton($('#bass-head'),round.bass,{playing:!paused&&!b,hasSpeakers:!!scene.stage.obstacles.length});
 $('#tour-putt').hidden=!putt;$('#tour-next-green').hidden=!putt||p.state.phase!=='between';
 $('#tour-putt [data-action="putt"]').disabled=paused||!putt||p.state.phase!=='aim';
 if(b&&scene.config.activity==='delivery'){
  const person=DELIVERY_RECIPIENTS.find(x=>x.id===p.state.recipientId),signature=`${person?.id}|${p.state.carrying}|${p.state.complete}`;
  if($('#tour-order').dataset.state!==signature){$('#tour-order').dataset.state=signature;$('#tour-order').innerHTML=p.state.complete?'<p>All deliveries made. Enjoy your grilled cheese!</p>':`${recipientPortrait(person?.id)}<p><strong>${person?.name} · ${person?.costume}</strong><br>${p.state.carrying?'Sandwich in hand. Smooth-pass this costume.':'Return to the vendor to pick up a sandwich.'}</p>`;}
 }else{
  const message=putt?'Drag anywhere opposite your shot, then release. No time limit.':b?scene.config.activity==='garden'&&p.state.carrying?'Seed in hand → return to the circular garden bed.':scene.config.instruction:a.pendingInvitation?'Sealed invitation found! Clear this stage to open it.':'Collect sparks · Clean passes build your score · B activates Bass Head';
  if($('#tour-order').textContent!==message){$('#tour-order').textContent=message;delete $('#tour-order').dataset.state;}
 }
}
function render(){
 const a=profile.active,live=isLive();$('#tour-running').hidden=!live;
 if(view==='title')$('#tour-menu').innerHTML=titleHTML(profile);
 else if(view==='catalogue')$('#tour-menu').innerHTML=catalogueHTML(profile);
 else if(view==='wardrobe')$('#tour-menu').innerHTML=wardrobeHTML(profile);
 else if(a?.bonus?.status==='result')$('#tour-menu').innerHTML=bonusResultHTML(profile,saved);
 else if(a&&a.status!=='playing'&&!a.bonus)$('#tour-menu').innerHTML=summaryHTML(profile,{saved});
 else $('#tour-menu').innerHTML='';
 text('#tour-leave',a?.bonus?'Leave bonus visit':'Finish Festival');renderPause();
 if(scene&&live&&!loadFailed&&(!a.bonus||scene.practice))hud(scene.round);
 root.querySelectorAll('[data-action="start"],[data-action="resume"],[data-action="explore"]').forEach(b=>b.disabled=b.disabled||!ready||!owner.held);
}
function completeBonus({completed=false,won=false}={}){
 scene?.pauseTour();audio.stop();paused=true;
 if(scene?.practice&&!loadFailed){const snap=scene.capture();profile.active.bonus.scene=snap.scene;profile.active.bonus.activity=snap.activity;}
 commit(finishBonus(profile,{completed,won}));if(won||completed)audio.celebrate();render();
}
function activity(event){
 if(preparing||!isLive())return;
 const messages={pickup:'Picked up! Find the matching destination.',dropped:'Sandwich dropped. Pick up another at the vendor.',wrong:'You made their night! But this delivery does not count.',delivered:'Delivery made! Back to the vendor.',planted:'A little more colour in the garden.',collected:'Found it. Follow the next glow.',greeted:'Good company!',shot:'Let it roll…',holed:'In the cup! Head to the next green.',settled:'Line up your next putt.',exhausted:'Eight shots played. Come back for another try.'};
 text('#tour-status',messages[event.type]||'');
 if(event.type==='complete'){completeBonus({won:true,completed:true});return;}
 if(event.type==='exhausted'){completeBonus();return;}
 if(['pickup','collected','shot'].includes(event.type))audio.pickup(1);else audio.closePass();
 checkpoint();
}
const Scene=tourScene({profile:()=>profile,onReady:s=>{scene=s;ready=true;render();},onFrame:round=>{
 if(!isLive()||preparing||loadFailed)return;hud(round);if(!paused){audio.sync(round,scene.stage.id);if(performance.now()-saveClock>=1000)checkpoint();}
},onInvitation:()=>{profile=collectInvitation(profile);text('#tour-status','A sealed invitation! Clear this stage to find out where it leads.');audio.closePass();checkpoint();},onActivity:activity,onRoundEnd:round=>{
 if(preparing||!isLive())return;
 if(profile.active.bonus){completeBonus({completed:true});return;}
 scene.pauseTour();paused=true;audio.stop();commit(finishMain(profile,round));render();
},onAim:v=>text('#tour-status',v?`${Math.round(Math.hypot(v.x,v.y)*100)}% power`:'Pull back and release.')});
const game=new Phaser.Game({type:Phaser.CANVAS,parent:'game',width:960,height:640,banner:false,audio:{noAudio:true},scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH},scene:Scene});
for(const [name,fn] of [['round:pickup',e=>audio.pickup(e.multiplier)],['round:closepass',()=>audio.closePass()],['round:flow',()=>audio.celebrate()],['round:bass',()=>{scene.round.bassUses=(scene.round.bassUses||0)+1;audio.drop();}]])game.events.on(name,fn);
function buttonVector(){const a=Number($('#tour-angle').value)*Math.PI/180,p=Number($('#tour-power').value)/100;return {x:Math.cos(a)*p,y:Math.sin(a)*p};}
function route(action,id){
 if(!['sound','pause','home','title','catalogue','wardrobe'].includes(action)&&(!ready||!owner.held))return;
 if(action==='sound'){soundOn=!soundOn;audio.setEnabled(soundOn);text('#tour-sound',soundOn?'Sound on':'Sound off');$('#tour-sound').setAttribute('aria-pressed',String(soundOn));return;}
 if(action==='pause'){if(isLive())setPaused(!paused);return;}
 if(action==='home'||action==='title'){if(isLive())setPaused(true);view='title';audio.stop();render();return;}
 if(['catalogue','wardrobe'].includes(action)){view=action;render();return;}
 if(action==='start'){commit(createFestival(profile,crypto.randomUUID()));load();}
 if(action==='resume'){
  view='run';if(profile.active?.status==='playing'||profile.active?.bonus?.status==='playing')load({recovered:true});else render();
 }
 if(action==='equip'){if(!id||profile.rewards.includes(id)){profile.souvenir=id||null;persist();render();}}
 if(action==='perk'||action==='keep'){
  const next=choosePerk(profile,action==='keep'?null:id,action==='keep'?undefined:$('#tour-replace')?.value);
  if(next!==profile){commit(next);load();}
 }
 if(action==='visit'||action==='explore'){
  const next=beginBonus(profile,id,crypto.randomUUID(),{explore:action==='explore'});
  if(next!==profile){commit(next);$('#tour-angle').value='0';$('#tour-power').value='50';text('#tour-status','');load();}
 }
 if(action==='skip'){profile.active.summary.bonusOffered=false;persist();render();}
 if(action==='return'){commit(returnBonus(profile));scene.clearVisit();if(!profile.active)view='catalogue';render();}
 if(action==='close'){commit(closeResults(profile));view='title';render();}
 if(action==='leave'){
  setPaused(true);
  $('#tour-menu').innerHTML=`<h2>${profile.active.bonus?'Leave this visit?':'Finish your Festival?'}</h2><p>${profile.active.bonus?'Your Festival place and discoveries are safe. An unfinished challenge earns no new souvenir.':'Only completed stages count toward your final score. Your current stage will be left unfinished.'}</p><button class="primary-button" data-action="confirm-leave">${profile.active.bonus?'Leave visit':'Finish & save results'}</button> <button class="quiet-button" data-action="cancel-leave">Keep playing</button>`;
  $('#tour-menu').scrollIntoView({block:'nearest',behavior:'smooth'});
 }
 if(action==='confirm-leave'){if(profile.active.bonus)completeBonus();else{commit(endFestival(profile));render();}}
 if(action==='cancel-leave'){render();setPaused(false);}
 if(action==='bass'&&scene.activateBassHead())checkpoint();
 if(action==='green'&&!paused&&scene.practice?.nextHole()){scene.puttingView.cancelAim();$('#tour-angle').value='180';checkpoint();hud(scene.round);}
 if(action==='putt'&&!paused)scene.shoot(buttonVector());
}
root.addEventListener('click',e=>{const b=e.target.closest('[data-action]');if(b&&!b.disabled)route(b.dataset.action,b.dataset.id);});
for(const s of ['#tour-angle','#tour-power'])$(s).addEventListener('input',()=>scene?.puttingView?.setButtonAim(buttonVector()));
$('#tour-music').addEventListener('input',()=>{music=Number($('#tour-music').value)/100;audio.setVolumes({music,effects});});
$('#tour-fx').addEventListener('input',()=>{effects=Number($('#tour-fx').value)/100;audio.setVolumes({music,effects});});
function keys(e){
 if(e.target.matches('input,select,textarea')||!isLive())return;
 if(e.code==='Escape'&&!e.repeat){e.preventDefault();setPaused(!paused);}
 if(e.code==='KeyB'&&!e.repeat&&!paused&&!profile.active.bonus){e.preventDefault();route('bass');}
 if(document.activeElement===$('#game')&&['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code))e.preventDefault();
}
function hidden(){if(document.hidden&&isLive()&&!paused)setPaused(true);}
function pagehide(e){if(isLive())setPaused(true);if(!e.persisted)dispose();}
function dispose(){if(disposed)return;disposed=true;audio.stop();owner.release();scene?.clearVisit();scene?.souvenirView.destroy();game.destroy(true);document.removeEventListener('keydown',keys);document.removeEventListener('visibilitychange',hidden);window.removeEventListener('pagehide',pagehide);}
document.addEventListener('keydown',keys);document.addEventListener('visibilitychange',hidden);window.addEventListener('pagehide',pagehide);
const ownership=await owner.acquire();
if(ownership!=='owned')notice(ownership==='busy'?'This Festival is open in another tab. Close that tab, then reload here to continue safely.':'This browser cannot protect saved progress between tabs. Use a browser with Web Locks support to play this preview.');
else {profile=store.read();if(!browserStorage){saved=false;notice('Device storage is unavailable. Progress will last only for this session.');}}
render();
if(import.meta.env.DEV&&lab){const {mountTourLab}=await import('./lab.js');mountTourLab($('#tour-lab'),{getProfile:()=>profile,commit,load,render,scene:()=>scene,activity,finish:()=>{const r=scene.round;r.pickups=mainStage(ROUTE[profile.active.stageIndex]).target;r.remainingMs=0;r.ended=true;scene.pauseTour();paused=true;audio.stop();commit(finishMain(profile,r));render();},home:()=>{view='title';render();}});}
if(import.meta.hot)import.meta.hot.dispose(dispose);
