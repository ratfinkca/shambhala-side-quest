import Phaser from 'phaser';
import '../clock-practice.css';
import './style.css';
import {GameScene} from '../GameScene.js';
import {BONUS_VENUES,getBonusVenue} from './config.js';
import {createBonusPractice} from './state.js';
import {createActivityView} from './activity-view.js';
import {createPuttingView} from './putting-view.js';
import {MAX_STROKES,isPuttingCloseUp} from './putting-state.js';
import {attemptPuttingShot} from './putting-input.js';
import * as rabbit from './views/rabbit-hole.js';
import * as garden from './views/secret-garden.js';
import * as ikigai from './views/ikigai-mori.js';
import * as villagio from './views/villagio.js';
import {createAudio} from '../audio.js';
import {bonusPreviewVoices} from './music.js';
import {createSMFInstrumentRack} from '../editions/smf-instruments.js';
import {mountRehearsalAudioMix} from '../rehearsal-audio-mix.js';
import {elapsedMs,getTiming,phaseAt} from '../stage-clock.js';
import {handlePracticePageHide} from '../clock-practice.js';
import {preventGameKeyDefault} from '../input.js';

const views=[rabbit,garden,ikigai,villagio];
let config=getBonusVenue(new URLSearchParams(location.search).get('bonus'));
let practice=createBonusPractice(config),currentScene=null,disposed=false,soundOn=true,mixer=null;
const root=document.querySelector('.shell');root.classList.add('clock-lab','bonus-lab');
root.innerHTML=`<header><div><span class="clock-eyebrow">After the set · rehearsal · no saves</span><h1 id="bonus-title"></h1></div><a class="quiet-button" href="?rehearsal&venues">Main stages</a></header>
<p class="bonus-caption" id="bonus-caption"></p>
<div class="clock-controls"><label>Secret & backstage spaces<select id="bonus-select" aria-label="Bonus venue">${BONUS_VENUES.map(c=>`<option value="${c.id}">${c.name}</option>`).join('')}</select></label><button id="bonus-start" class="primary-button" disabled>Start visit</button><button id="bonus-pause" class="quiet-button" disabled>Pause</button><button id="bonus-sound" class="quiet-button" aria-pressed="true">Sound on</button></div>
<section class="bonus-panel" aria-label="Bonus venue rehearsal">
 <div class="bonus-hud"><div><span id="bonus-dj"></span><strong id="bonus-objective"></strong><span id="bonus-carry"></span></div><div class="bonus-count"><span id="bonus-count-label"></span><strong id="bonus-count"></strong><span id="bonus-time"></span></div></div>
 <div class="clock-arena"><div id="game" tabindex="0" role="application" aria-label="Bonus activity. Click or tap a destination, or use WASD or arrow keys. Escape pauses."></div><div id="bonus-overlay" class="bonus-overlay"></div></div>
 <div id="putting-controls" class="putting-controls" hidden>
  <div class="putting-guide"><span id="putting-hint">Drag anywhere. Pull back, then release.</span><strong id="putting-power-readout">No rush</strong></div>
  <button id="putting-next" class="primary-button" hidden>Next green →</button>
  <details><summary>Button & keyboard controls</summary><div class="putting-buttons"><label>Aim <input id="putting-angle" aria-label="Putting aim" type="range" min="-180" max="180" step="1" value="0"></label><label>Power <input id="putting-power" aria-label="Putting power" type="range" min="5" max="100" step="1" value="50"></label><button id="putting-shot" class="primary-button">Putt</button></div><span>← → aim · ↑ ↓ power · Space to putt when the green is focused.</span></details>
 </div>
 <div class="bonus-message" id="bonus-message" role="status"></div>
</section>
<div class="bonus-footer"><span id="bonus-movement-help">Click / tap to move · WASD / arrows · Esc to pause</span><a href="?rehearsal&backstage=amp">Cheese courier at AMP →</a></div>
<details class="bonus-help"><summary>About these little side quests</summary><p id="bonus-help-copy"></p><p>Every visit is disposable. Souvenirs are for trying on here; no cosmetics, scores, XP or playtest data are saved. Reloading or changing venues starts fresh. Hiding the tab pauses the visit.</p><p>These are original visual interpretations and synthesized rehearsal arrangements. The DJ names describe the planned identities; no artist recordings are included. Discovery, full-tour return and permanent rewards come later.</p></details>`;
const $=selector=>root.querySelector(selector),text=(selector,value)=>{const node=$(selector);if(node.textContent!==value)node.textContent=value;};
const audio=createAudio(undefined,{timedVoices:bonusPreviewVoices,useTransport:true,createMusicRenderer:createSMFInstrumentRack});
function stopAudio(){mixer?.cancelPreview();audio.stop();}
const names={trail:'TRINKETS',garden:'BLOOMS',greet:'LANTERNS',putt:'HOLES'};
const isPutting=()=>config.activity==='putt';
function renderHUD(){
 const s=practice.state;
 text('#bonus-count',`${s.progress} / ${s.goal}`);
 text('#bonus-carry',isPutting()?(s.complete?'Golden Chicken Totem · preview only':`Green ${s.holeIndex+1} · ${MAX_STROKES-s.strokes} shots left`):s.complete?`${config.reward} · preview only`:s.carrying?'Seed in hand → smooth-pass into the garden bed':config.activity==='garden'?'One seed at a time':config.activity==='greet'?'Find a dancer carrying an unlit lantern':'Follow the next glowing trinket');
 $('#putting-controls').hidden=!isPutting()||s.phase==='walking'||practice.status==='ready';
 if(isPutting()){
  text('#bonus-time',s.complete?'Won!':s.phase==='lost'?'Try again':`${s.strokes} / ${MAX_STROKES} shots`);
  $('#putting-next').hidden=s.phase!=='between';$('#putting-next').disabled=practice.status!=='playing';
  $('#putting-shot').disabled=practice.status!=='playing'||s.phase!=='aim';
  text('#putting-hint',s.phase==='walking'?`Explore the party. Step onto green ${s.holeIndex+1} to putt.`:s.phase==='rolling'?'Ball rolling…':s.phase==='between'?'In the cup! Return to the party, then walk to green two.':s.complete?'Your Golden Chicken Totem is on your character.':s.phase==='lost'?'So close. Start fresh for another round.':'Drag anywhere. Pull back, then release.');
  text('#bonus-movement-help',s.phase==='walking'?`Click / tap to walk · Step onto green ${s.holeIndex+1} to putt · No time limit`:isPuttingCloseUp(s)?'Pull back to putt · Esc to pause':'The whole party is yours to explore.');
  $('#game').setAttribute('aria-label',s.phase==='walking'?'Villagio party. Click or tap a destination, or use WASD or arrows. Step onto the glowing green to putt. Escape pauses.':'Putting green. Drag anywhere opposite the shot and release. Arrow keys aim and set power, Space shoots, Escape pauses.');
 }
 currentScene?.background.venueView?.setProgress(s);
}
function controls(){
 const status=practice.status,paused=status==='paused',playing=status==='playing';
 $('#bonus-start').disabled=!currentScene;text('#bonus-start',status==='ready'?'Start visit':'Start fresh');
 $('#bonus-pause').disabled=!playing&&!paused;text('#bonus-pause',paused?'Resume':'Pause');
 const overlay=$('#bonus-overlay');overlay.hidden=playing||status==='complete';overlay.classList.toggle('is-result',status==='complete'||status==='ended'||paused);
 let title='A little detour.',body='Start your visit when you’re ready.';
 if(paused){title='Take a breather.';body='Everything is paused. Resume when you’re ready.';}
 if(status==='complete'){title=config.reward?`${config.reward}!`:'Welcome to the club.';body=config.reward?'Your souvenir is on your character. A rehearsal keepsake, not saved.':'Both greens and the chicken slide found. The putting game comes later.';}
 if(status==='ended'){title=`End of the set · ${practice.state.progress} / ${config.goal}`;body=config.reward?'Start fresh to finish the activity and try its souvenir.':'Start fresh to explore the rest of the miniature club.';}
 if(isPutting()&&status==='ended'){title='Another round?';body=`${practice.state.progress} of 2 holes sunk in ${MAX_STROKES} shots. Start fresh and try again.`;}
 overlay.replaceChildren();const strong=document.createElement('strong'),span=document.createElement('span');strong.textContent=title;span.textContent=body;overlay.append(strong,span);
}
function showVenue(){
 root.dataset.bonus=config.id;$('#bonus-select').value=config.id;
 $('#putting-controls').hidden=!isPutting();
 text('#bonus-movement-help',isPutting()?'Pull back to putt · Esc to pause':'Click / tap to move · WASD / arrows · Esc to pause');
 $('#game').setAttribute('aria-label',isPutting()?'Putting green. Drag anywhere opposite the shot and release. Arrow keys aim and set power, Space shoots, Escape pauses.':'Bonus activity. Click or tap a destination, or use WASD or arrow keys. Escape pauses.');
 text('#bonus-title',config.name);text('#bonus-caption',config.caption);
 text('#bonus-dj',`${config.parent} hideaway · ${config.dj}`);
 text('#bonus-objective',config.instruction);text('#bonus-count-label',names[config.activity]);
 text('#bonus-message',config.instruction);
 text('#bonus-time',`${Math.ceil(getTiming(config.timingId).durationMs/1000)}s left`);
 text('#bonus-help-copy',{
  trail:'Six lost party trinkets appear one after another. Reach each glow to collect it; the room warms up as you fill the trail. Find all six to try the rabbit ears.',
  garden:'Carry a glowing seed through the busier crowd, then finish a clean smooth pass inside the circular garden bed. Walking into the bed alone does not plant it. Plant three to bring the garden into bloom; your seed stays safe after a bump.',
  greet:'Find the dancers carrying unlit lanterns. Skim close beside a carrier, then move clear without touching to light it. Other dancers and already-lit lanterns do not count; bumps never erase your progress.',
  putt:'Explore the whole party, then step onto the glowing first green to start putting. Sink a hole to return to the wide view, choose Next green, and walk across to green two. Sink both holes in eight total shots. Drag opposite the direction you want the ball to travel; pull farther for more power. Short taps cancel. There is no time limit. The Golden Chicken Totem is yours to try here after a win, not saved.',
 }[config.activity]);renderHUD();controls();
}
function updateHUD(round){if(isPutting()){renderHUD();return;}text('#bonus-time',practice.state.complete?'Complete!':`${Math.ceil(round.remainingMs/1000)}s left`);renderHUD();if(practice.status==='playing')audio.sync(round,config.id);}
function puttingFeedback(event){
 if(!event)return;
 const messages={'green-entered':'On the green. Make a fresh drag to aim, then release to putt.',shot:'Nice and easy. Let it roll.',settled:'Ball settled. Line up your next putt.',holed:'In the cup! Return to the party, then walk to the next green.',complete:'You won the Golden Chicken Totem! Equipped here for the rehearsal; not saved.',exhausted:'Eight shots played. Start fresh for another chance at the totem.'};
 text('#bonus-message',messages[event.type]||config.instruction);
 if(event.type==='shot')audio.pickup(1);
 if(event.type==='holed')audio.closePass();
 if(event.type==='complete'){stopAudio();audio.celebrate();}
 if(event.type==='exhausted')stopAudio();
 renderHUD();controls();
}
function shoot(vector){if(isPutting())puttingFeedback(attemptPuttingShot(practice,vector,()=>currentScene?.puttingView?.cancelAim()));}
function buttonVector(){const a=Number($('#putting-angle').value)*Math.PI/180,p=Number($('#putting-power').value)/100;return {x:Math.cos(a)*p,y:Math.sin(a)*p};}
function feedback(event){
 currentScene.activityView.feedback(event);
 const s=practice.state,point=config.points.find(p=>p.id===event.id);
 let message={collected:`${point?.label} found. Follow the next glow.`,pickup:'Seed in hand! Smooth-pass into the circular garden bed to plant it.',planted:`A new bloom! ${s.progress} / ${s.goal} planted. Find the next seed.`,greeted:`Lantern lit! ${s.progress} / ${s.goal} glowing. Find another unlit lantern.`,visited:`${point?.label} found. Explore the other glowing circles.`}[event.type];
 if(event.type==='complete'){
  message=config.reward?`Souvenir unlocked: ${config.reward}. Yours to try here, not saved.`:'Club tour complete! Putting and its prize are a future visit.';
  stopAudio();currentScene.pauseRound();audio.celebrate();controls();
 }else if(event.type==='pickup'||event.type==='collected')audio.pickup(1);else audio.closePass();
 text('#bonus-message',message);renderHUD();
}
class BonusScene extends GameScene{
 preload(){views.forEach(v=>v.preload(this));}
 create(){
  this.stageRendererOptions={venueView:(scene,stage)=>views.map(v=>v.createView(scene,stage)).find(Boolean)};
  super.create();if(disposed){this.game.destroy(true);return;}
  this.sparks.forEach(s=>s.destroy());this.sparks=[];currentScene=this;this.prepareVisit();showVenue();
 }
 prepareVisit(){
  this.puttingView?.destroy();this.puttingView=null;this.activityView?.destroy();this.activityView=null;this.frozenFrame=null;
  super.startRound({stage:config.stage,timingId:config.timingId});this.round.flowTaken=[0,1];this.round.mystery.phase='spent';
  if(isPutting()){
   this.pauseRound();
   this.puttingView=createPuttingView(this,practice,{onShot:shoot,onAim:aim=>text('#putting-power-readout',aim?`${Math.round(Math.hypot(aim.x,aim.y)*100)}% power`:'No rush')});
   $('#putting-angle').value='0';$('#putting-power').value='50';
   this.puttingView.update(practice.state,0,this.reducedMotion);
   if(practice.status==='playing'&&practice.state.phase==='walking')this.resumeRound();
  }else{this.activityView=createActivityView(this,config);this.activityView.update(practice.state,0,this.reducedMotion);}
  this.background.venueView?.setProgress(practice.state);this.background.update(0,'cruise',this.reducedMotion,getTiming(config.timingId));
  if(practice.status!=='playing')this.pauseRound();updateHUD(this.round);
 }
 onCrowdEncounters(encounters){
  const event=practice.step({player:this.dancer,encounters});if(!event)return;
  if(isPutting()){this.pauseRound();this.puttingView?.cancelAim();puttingFeedback(event);}
  else feedback(event);
 }
 effect(x,y,color,points,celebrate,label){if(label?.startsWith('SMOOTH'))return;super.effect(x,y,color,points,celebrate,label);}
 update(time,delta){
  if(isPutting()){
   this.reducedMotion=this.motionQuery?.matches??this.reducedMotion;
   puttingFeedback(practice.advance(delta));
   const elapsed=practice.state.elapsedMs,timing=getTiming(config.timingId),position=elapsed%timing.durationMs;
   const walking=practice.status==='playing'&&practice.state.phase==='walking';
   if(walking){
    if(!this.running)this.resumeRound();
    // The ordinary update advances once; finish at the same phrase position
    // used by visible NPCs, collision and the independent putting clock.
    const frameDelta=Math.min(50,Math.max(0,Number.isFinite(delta)?delta:0));
    this.round.remainingMs=timing.durationMs-position+frameDelta;
    super.update(time,frameDelta);
   }else if(this.running)this.pauseRound();
   this.round.remainingMs=timing.durationMs-position;
   if(this.frozenFrame!==elapsed){this.background.update(position,phaseAt(position,timing).phase,this.reducedMotion,timing);this.frozenFrame=elapsed;}
   if(practice.status==='playing')audio.sync(this.round,config.id);
   this.puttingView?.update(practice.state,elapsed,this.reducedMotion);
   if(practice.state.phase==='walking')this.crowdSocial?.paint();
   else this.crowdSocial?.suspend(position);
   renderHUD();return;
  }
  super.update(time,delta);const elapsed=elapsedMs(this.round);
  if(practice.status!=='playing'&&this.running)this.pauseRound();
  // Completion changes a final lamp after GameScene's last running render.
  // Repaint at frozen musical time so results and pause keep the right state.
  const frame=`${elapsed}|${this.reducedMotion}|${practice.state.progress}|${practice.state.complete}`;
  if(this.running||this.frozenFrame!==frame){
   this.activityView?.update(practice.state,elapsed,this.reducedMotion);
   if(!this.running)this.background?.update(elapsed,this.phase,this.reducedMotion,getTiming(config.timingId));
  }
  this.frozenFrame=this.running?null:frame;
 }
}
const game=new Phaser.Game({type:Phaser.CANVAS,parent:'game',width:960,height:640,banner:false,audio:{noAudio:true},scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH},scene:BonusScene});
game.events.on('round:update',round=>{if(!disposed)updateHUD(round);});
game.events.on('round:end',()=>{if(disposed||isPutting())return;practice.finish();stopAudio();controls();});
function start(){if(!currentScene)return;stopAudio();audio.setEnabled(soundOn);practice.start();currentScene.prepareVisit();text('#bonus-message',config.instruction);controls();$('#game').focus({preventScroll:true});}
function pause(){
 currentScene?.puttingView?.cancelAim();
 if(practice.status==='playing'){practice.pause();currentScene?.pauseRound();stopAudio();}
 else if(practice.status==='paused'){practice.resume();if(!isPutting()||practice.state.phase==='walking')currentScene?.resumeRound();audio.setEnabled(soundOn);$('#game').focus({preventScroll:true});}
 controls();
}
function select(){
 stopAudio();currentScene?.pauseRound();config=getBonusVenue($('#bonus-select').value);practice=createBonusPractice(config);
 const url=new URL(location.href);url.searchParams.set('bonus',config.id);history.replaceState(null,'',url);
 currentScene?.prepareVisit();showVenue();
}
$('#bonus-select').addEventListener('change',select);$('#bonus-start').addEventListener('click',start);$('#bonus-pause').addEventListener('click',pause);
$('#bonus-sound').addEventListener('click',()=>{soundOn=!soundOn;audio.setEnabled(soundOn);mixer.refresh();text('#bonus-sound',soundOn?'Sound on':'Sound off');$('#bonus-sound').setAttribute('aria-pressed',String(soundOn));});
$('#putting-next').addEventListener('click',()=>{
 if(isPutting()&&practice.nextHole()){
  currentScene.puttingView.cancelAim();$('#putting-angle').value='180';$('#putting-power').value='50';
  currentScene.resumeRound();text('#bonus-message','Back to the party. Walk onto green two when you’re ready.');renderHUD();controls();$('#game').focus({preventScroll:true});
 }
});
for(const id of ['#putting-angle','#putting-power'])$(id).addEventListener('input',()=>currentScene?.puttingView?.setButtonAim(buttonVector()));
$('#putting-shot').addEventListener('click',()=>shoot(buttonVector()));
function hidden(){if(document.hidden&&practice.status==='playing')pause();}
function keydown(e){
 if(e.target.matches('select,input,textarea'))return;
 if(isPutting()&&isPuttingCloseUp(practice.state)&&document.activeElement===$('#game')&&['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Space','Enter'].includes(e.code)){
  e.preventDefault();
  if(practice.status==='playing'&&practice.state.phase==='aim'){
   if(e.code==='Space'||e.code==='Enter'){if(!e.repeat)shoot(buttonVector());}
   else{const angle=$('#putting-angle'),power=$('#putting-power');
    if(e.code==='ArrowLeft')angle.value=String(Math.max(-180,Number(angle.value)-3));
    if(e.code==='ArrowRight')angle.value=String(Math.min(180,Number(angle.value)+3));
    if(e.code==='ArrowUp')power.value=String(Math.min(100,Number(power.value)+5));
    if(e.code==='ArrowDown')power.value=String(Math.max(5,Number(power.value)-5));
    currentScene?.puttingView?.setButtonAim(buttonVector());
   }
  }return;
 }
 if(preventGameKeyDefault(e.key,practice.status==='playing',document.activeElement===$('#game')))e.preventDefault();
 if(e.code==='Escape'&&!e.repeat){e.preventDefault();pause();}
}
document.addEventListener('visibilitychange',hidden);document.addEventListener('keydown',keydown);
mixer=mountRehearsalAudioMix(root,{audio,isEnabled:()=>soundOn});
root.querySelector('.rehearsal-mix-note').textContent='Music controls this original synthesized arrangement. Effects controls activity chimes. Sound on/off mutes everything. This mix resets on reload.';
showVenue();
function cleanup(){
 if(disposed)return;disposed=true;mixer.dispose();stopAudio();currentScene?.puttingView?.destroy();currentScene?.activityView?.destroy();if(currentScene)game.destroy(true);
 document.removeEventListener('visibilitychange',hidden);document.removeEventListener('keydown',keydown);window.removeEventListener('pagehide',pagehide);root.classList.remove('clock-lab','bonus-lab');delete root.dataset.bonus;
}
function pagehide(e){handlePracticePageHide(e,{pause(){if(practice.status==='playing')pause();},dispose:cleanup});}
window.addEventListener('pagehide',pagehide);if(import.meta.hot)import.meta.hot.dispose(cleanup);
