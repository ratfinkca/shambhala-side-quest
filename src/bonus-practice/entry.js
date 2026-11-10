import Phaser from 'phaser';
import '../clock-practice.css';
import './style.css';
import {GameScene} from '../GameScene.js';
import {BONUS_VENUES,getBonusVenue} from './config.js';
import {createBonusPractice} from './state.js';
import {createActivityView} from './activity-view.js';
import * as rabbit from './views/rabbit-hole.js';
import * as garden from './views/secret-garden.js';
import * as ikigai from './views/ikigai-mori.js';
import * as villagio from './views/villagio.js';
import {createAudio} from '../audio.js';
import {bonusPreviewVoices} from './music.js';
import {createSMFInstrumentRack} from '../editions/smf-instruments.js';
import {mountRehearsalAudioMix} from '../rehearsal-audio-mix.js';
import {elapsedMs,getTiming} from '../stage-clock.js';
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
 <div class="bonus-message" id="bonus-message" role="status"></div>
</section>
<div class="bonus-footer"><span>Click / tap to move · WASD / arrows · Esc to pause</span><a href="?rehearsal&backstage=amp">Cheese courier at AMP →</a></div>
<details class="bonus-help"><summary>About these little side quests</summary><p id="bonus-help-copy"></p><p>Every visit is disposable. Souvenirs are for trying on here; no cosmetics, scores, XP or playtest data are saved. Reloading or changing venues starts fresh. Hiding the tab pauses the visit.</p><p>These are original visual interpretations and synthesized rehearsal arrangements. The DJ names describe the planned identities; no artist recordings are included. Discovery, full-tour return and permanent rewards come later.</p></details>`;
const $=selector=>root.querySelector(selector),text=(selector,value)=>{const node=$(selector);if(node.textContent!==value)node.textContent=value;};
const audio=createAudio(undefined,{timedVoices:bonusPreviewVoices,useTransport:true,createMusicRenderer:createSMFInstrumentRack});
function stopAudio(){mixer?.cancelPreview();audio.stop();}
const names={trail:'TRINKETS',garden:'BLOOMS',greet:'LANTERNS',explore:'PLACES'};
function renderHUD(){
 const s=practice.state;
 text('#bonus-count',`${s.progress} / ${s.goal}`);
 text('#bonus-carry',s.complete?(config.reward?`${config.reward} · preview only`:'Tour complete · putting comes later'):s.carrying?'Seed in hand → return to the garden bed':config.activity==='garden'?'One seed at a time':config.activity==='greet'?'Pass beside them, then move clear':config.activity==='explore'?'Two greens + one ridiculous slide':'Follow the next glowing trinket');
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
 overlay.replaceChildren();const strong=document.createElement('strong'),span=document.createElement('span');strong.textContent=title;span.textContent=body;overlay.append(strong,span);
}
function showVenue(){
 root.dataset.bonus=config.id;$('#bonus-select').value=config.id;
 text('#bonus-title',config.name);text('#bonus-caption',config.caption);
 text('#bonus-dj',`${config.parent} hideaway · ${config.dj}`);
 text('#bonus-objective',config.instruction);text('#bonus-count-label',names[config.activity]);
 text('#bonus-message',config.instruction);
 text('#bonus-time',`${Math.ceil(getTiming(config.timingId).durationMs/1000)}s left`);
 text('#bonus-help-copy',{
  trail:'Six lost party trinkets appear one after another. Reach each glow to collect it; the room warms up as you fill the trail. Find all six to try the rabbit ears.',
  garden:'Carry a glowing seed to the circular bed in front of the booth. Plant three to bring the garden into bloom. Bumps may slow you, but your seed stays safe.',
  greet:'Skim close beside five different dancers, then move beyond them without touching. Each successful greeting lights a lantern and gives that dancer a gold wristband and foot-ring. Repeating the same dancer does not count; bumps never erase your progress.',
  explore:'Visit the glowing circles at both putting greens and the chicken slide. This is a setting preview: the greens are walkable, with no golf controls or prize to win yet.',
 }[config.activity]);renderHUD();controls();
}
function updateHUD(round){text('#bonus-time',practice.state.complete?'Complete!':`${Math.ceil(round.remainingMs/1000)}s left`);renderHUD();if(practice.status==='playing')audio.sync(round,config.id);}
function feedback(event){
 currentScene.activityView.feedback(event);
 const s=practice.state,point=config.points.find(p=>p.id===event.id);
 let message={collected:`${point?.label} found. Follow the next glow.`,pickup:'Seed in hand! Bring it to the circular bed in front of the booth.',planted:`A new bloom! ${s.progress} / ${s.goal} planted. Find the next seed.`,greeted:`Good company! ${s.progress} / ${s.goal} lanterns lit. Find someone new.`,visited:`${point?.label} found. Explore the other glowing circles.`}[event.type];
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
  this.activityView?.destroy();this.activityView=null;this.frozenFrame=null;
  super.startRound({stage:config.stage,timingId:config.timingId});this.round.flowTaken=[0,1];this.round.mystery.phase='spent';
  this.activityView=createActivityView(this,config);this.activityView.update(practice.state,0,this.reducedMotion);
  this.background.venueView?.setProgress(practice.state);this.background.update(0,'cruise',this.reducedMotion,getTiming(config.timingId));
  if(practice.status!=='playing')this.pauseRound();updateHUD(this.round);
 }
 onCrowdEncounters(encounters){const event=practice.step({player:this.dancer,encounters});if(event)feedback(event);}
 effect(x,y,color,points,celebrate,label){if(label?.startsWith('SMOOTH'))return;super.effect(x,y,color,points,celebrate,label);}
 update(time,delta){
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
game.events.on('round:end',()=>{if(disposed)return;practice.finish();stopAudio();controls();});
function start(){if(!currentScene)return;stopAudio();audio.setEnabled(soundOn);practice.start();currentScene.prepareVisit();text('#bonus-message',config.instruction);controls();$('#game').focus({preventScroll:true});}
function pause(){
 if(practice.status==='playing'){practice.pause();currentScene?.pauseRound();stopAudio();}
 else if(practice.status==='paused'){practice.resume();currentScene?.resumeRound();audio.setEnabled(soundOn);$('#game').focus({preventScroll:true});}
 controls();
}
function select(){
 stopAudio();currentScene?.pauseRound();config=getBonusVenue($('#bonus-select').value);practice=createBonusPractice(config);
 const url=new URL(location.href);url.searchParams.set('bonus',config.id);history.replaceState(null,'',url);
 currentScene?.prepareVisit();showVenue();
}
$('#bonus-select').addEventListener('change',select);$('#bonus-start').addEventListener('click',start);$('#bonus-pause').addEventListener('click',pause);
$('#bonus-sound').addEventListener('click',()=>{soundOn=!soundOn;audio.setEnabled(soundOn);mixer.refresh();text('#bonus-sound',soundOn?'Sound on':'Sound off');$('#bonus-sound').setAttribute('aria-pressed',String(soundOn));});
function hidden(){if(document.hidden&&practice.status==='playing')pause();}
function keydown(e){
 if(e.target.matches('select,input,textarea'))return;
 if(preventGameKeyDefault(e.key,practice.status==='playing',document.activeElement===$('#game')))e.preventDefault();
 if(e.code==='Escape'&&!e.repeat){e.preventDefault();pause();}
}
document.addEventListener('visibilitychange',hidden);document.addEventListener('keydown',keydown);
mixer=mountRehearsalAudioMix(root,{audio,isEnabled:()=>soundOn});
root.querySelector('.rehearsal-mix-note').textContent='Music controls this original synthesized arrangement. Effects controls activity chimes. Sound on/off mutes everything. This mix resets on reload.';
showVenue();
function cleanup(){
 if(disposed)return;disposed=true;mixer.dispose();stopAudio();currentScene?.activityView?.destroy();if(currentScene)game.destroy(true);
 document.removeEventListener('visibilitychange',hidden);document.removeEventListener('keydown',keydown);window.removeEventListener('pagehide',pagehide);root.classList.remove('clock-lab','bonus-lab');delete root.dataset.bonus;
}
function pagehide(e){handlePracticePageHide(e,{pause(){if(practice.status==='playing')pause();},dispose:cleanup});}
window.addEventListener('pagehide',pagehide);if(import.meta.hot)import.meta.hot.dispose(cleanup);
