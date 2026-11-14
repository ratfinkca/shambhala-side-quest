import Phaser from 'phaser';
import '../game-controls.css';
import './style.css';
import {GameScene} from '../GameScene.js';
import {createPlayerCamera} from '../player-camera.js';
import {resizeGameViewport} from '../game-viewport.js';
import {setOutfit} from '../Avatar.js';
import {getTiming,phaseAt} from '../stage-clock.js';
import {createAudio} from '../audio.js';
import {smfPreviewVoices} from '../editions/smf-music.js';
import {createSMFInstrumentRack} from '../editions/smf-instruments.js';
import {applyTheme} from '../theme-view.js';
import {PRISM,PRISM_ZONES,createPrismPractice,clampPrismPoint} from './model.js';
import * as venue from './view.js';
import {prismStage} from './config.js';

// Deliberately disposable: no profile, invitations, recovery, telemetry or
// leaderboard modules. A reload resets both the party and cosmetic try-on.
const root=document.querySelector('.shell');
root.classList.add('prism-lab');applyTheme('neon-field-trip');
root.innerHTML=`<div class="prism-arena"><div id="game" tabindex="0" role="application" aria-label="Prism Party. Tap, swipe or use a thumbstick to move. Arrow keys or WASD also work. Escape pauses."></div></div>
<header class="prism-hud"><div class="prism-location"><span>Fractal hideaway · preview</span><strong>Prism Party</strong><small id="prism-cue">Step inside. Light it up.</small></div><button id="prism-menu-button" aria-label="Pause and options" disabled>Ⅱ</button>
<div class="prism-faces" aria-label="Pyramid faces">${PRISM_ZONES.map((z,i)=>`<div style="--face:#${z.color.toString(16)}"><span>${z.symbol} ${z.label}</span><meter id="prism-face-${i}" min="0" max="${PRISM.chargeMs}" value="0" aria-label="${z.label} face charge"></meter><small id="prism-percent-${i}">0%</small></div>`).join('')}</div></header>
<div class="prism-tip" id="prism-tip" role="status">No saves · no time limit</div>
<div class="prism-menu" id="prism-menu"><section class="prism-card" aria-labelledby="prism-title"><span class="prism-eyebrow">Fractal Forest · first feel preview</span><div class="prism-mark" aria-hidden="true">◆ ✦ ☀</div><h1 id="prism-title">Prism Party</h1><p id="prism-description">A little party inside the pyramid.</p>
<ol class="prism-guide"><li><b>↟</b><span>Walk up the ramp.</span></li><li><b>◆</b><span>Keep moving in the lit floor section.</span></li><li><b>✦</b><span>Light all three faces. Enjoy the glow.</span></li></ol>
<p class="prism-gentle" id="prism-note">The light changes every four bars. Your progress stays.</p>
<div class="prism-menu-actions"><button id="prism-play" class="prism-primary" disabled>Loading the party…</button><button id="prism-restart" hidden>Start fresh</button></div>
<details id="prism-settings"><summary>Controls & party settings</summary><div class="prism-settings-grid">
<label>Movement<select id="prism-control"><option value="tap">Tap to move</option><option value="swipe">Swipe</option><option value="stick">Thumbstick</option></select></label>
<label>Crowd<select id="prism-density"><option value="6">Chill · 6 dancers</option><option value="9" selected>Party · 9 dancers</option><option value="12">Packed · 12 dancers</option></select></label>
<label>Camera<select id="prism-camera"><option value="auto">Follow on phone</option><option value="overview">Whole pyramid</option></select></label>
<label>Sensitivity<input id="prism-sensitivity" aria-label="Movement sensitivity" type="range" min="0.6" max="1.6" step="0.1" value="1"></label>
<label class="prism-checkbox"><input id="prism-sound" type="checkbox" checked>Sound on</label><label class="prism-checkbox"><input id="prism-reduced" type="checkbox">Gentler lights</label>
<label>Music<input id="prism-music" type="range" min="0" max="100" value="35"></label><label>Effects<input id="prism-fx" type="range" min="0" max="100" value="80"></label></div><p>Crowd changes apply on Start fresh. WASD / arrows work too.</p></details>
<small class="prism-disclaimer">A practice visit. No scores, XP or rewards are saved.</small></section></div>`;
const $=selector=>root.querySelector(selector),listeners=new AbortController();
const practice=createPrismPractice(),timing=getTiming('smf-fractal-clock-preview-1');
const audio=createAudio(undefined,{timedVoices:smfPreviewVoices,useTransport:true,createMusicRenderer:createSMFInstrumentRack});
const motionQuery=matchMedia('(prefers-reduced-motion: reduce)');
let scene=null,disposed=false,notice='',noticeUntil=0,menuKind='ready',freeDance=false,lastViewport='',layoutPending=false;
const outfit={onesie:'cosmic',hat:'headphones',totem:'none',flair:'none',appearance:{skinTone:'medium',face:'bright',hair:'short'}};
const preferences=()=>({mode:$('#prism-control').value,sensitivity:Number($('#prism-sensitivity').value),hand:'left'});
function listen(node,event,callback){node.addEventListener(event,callback,{signal:listeners.signal});}
function text(id,value){const node=$(id);if(node.textContent!==value)node.textContent=value;}
function sound(){audio.setVolumes({music:Number($('#prism-music').value)/100,effects:Number($('#prism-fx').value)/100});audio.setEnabled($('#prism-sound').checked);}
function say(value,ms=3200){notice=value;noticeUntil=practice.state.elapsedMs+ms;}
function stage(){return prismStage({preview:true,dancers:Number($('#prism-density').value)});}
function framing(){
 if(!scene?.playerCamera)return;
 const overview=$('#prism-camera').value==='overview',portrait=root.clientHeight>root.clientWidth;
 scene.playerCamera.setOptions({mode:overview?'overview':'auto',zoom:1});
 // Keep the whole structure in view outside. On entry, landscape can show
 // the dance floor closer; portrait follows the player through the floor.
 const shortLandscape=root.clientHeight<500;
 scene.playerCamera.focus(!overview&&practice.state.entered&&!portrait?{x:480,y:shortLandscape?420:400,width:780,height:shortLandscape?360:490}:null);
}
function paint(){
 const s=practice.state,active=PRISM_ZONES[s.activeZone],charged=active&&s.charges[s.activeZone]>=PRISM.chargeMs;
 let cue='Walk up the glowing ramp';
 if(s.phase==='party')cue=charged?'Face lit! Next cue on the phrase':`Move in ${active.label} ${active.symbol} · ${Math.ceil((PRISM.phraseMs-s.partyMs%PRISM.phraseMs)/1000)}s`;
 if(s.phase==='celebrating')cue='All three faces lit. You made the party!';
 if(s.complete)cue='Prism glow · trying it on';
 text('#prism-cue',cue);
 PRISM_ZONES.forEach((z,i)=>{const meter=$(`#prism-face-${i}`),value=Math.round(s.charges[i]),percent=Math.round(value/PRISM.chargeMs*100);if(Number(meter.value)!==value)meter.value=value;text(`#prism-percent-${i}`,percent===100?'LIT':`${percent}%`);meter.parentElement.dataset.active=String(s.activeZone===i);});
 const showNotice=!!notice&&s.elapsedMs<noticeUntil;
 $('#prism-tip').hidden=!showNotice;
 if(showNotice)text('#prism-tip',notice);
 scene?.background.venueView?.setProgress(s);
}
function openMenu(kind){
 menuKind=kind;scene?.pauseRound();practice.pause();audio.stop();$('#prism-menu').hidden=false;
 text('#prism-title',kind==='complete'?'Prism complete!':kind==='paused'?'Take a breather.':'Prism Party');
 text('#prism-description',kind==='complete'?'You lit every face. Your prism glow is on.':kind==='paused'?'The music and your progress are paused.':'A little party inside the pyramid.');
 text('#prism-note',kind==='complete'?'Enjoy a little victory dance, or try a busier crowd.':kind==='paused'?'Change controls here and see what feels best.':'The light changes every four bars. Your progress stays.');
 text('#prism-play',kind==='complete'?'Keep dancing':kind==='paused'?'Resume party':'Enter the party');
 $('.prism-guide').hidden=kind!=='ready';$('#prism-restart').hidden=kind==='ready';
 $('#prism-menu-button').disabled=true;
 // Opening UI never activates a button beneath the last dance-floor click.
 $('#prism-play').disabled=true;
 window.setTimeout(()=>{if(!disposed&&scene&&!$('#prism-menu').hidden)$('#prism-play').disabled=false;},350);
}
function play(){
 if(!scene)return;
 if(menuKind==='ready')restart();
 else{freeDance=practice.status==='complete';practice.resume();scene.resumeRound();$('#prism-menu').hidden=true;$('#prism-menu-button').disabled=false;sound();$('#game').focus({preventScroll:true});}
}
function restart(){
 if(!scene)return;
 audio.stop();practice.start();freeDance=false;notice='';scene.prepare();framing();paint();
 $('#prism-menu').hidden=true;$('#prism-menu-button').disabled=false;sound();$('#game').focus({preventScroll:true});
}
function feedback(event){
 if(event.type==='entered'){audio.stop();framing();say('You’re in! Follow the cyan diamond.');}
 if(event.type==='charged'){audio.closePass();say(`${PRISM_ZONES[event.zone].label} face lit!`,2000);}
 if(event.type==='finale'){setOutfit(scene.avatar,{...outfit,flair:'prism'});audio.celebrate();say('Three faces. One party!',PRISM.celebrationMs);}
 if(event.type==='complete'){notice='';openMenu('complete');}
}
class PrismScene extends GameScene{
 preload(){venue.preload(this);}
 create(){
  this.stageRendererOptions={venueView:venue.createView};this.controlPreferences=preferences();super.create();
  this.sparks.forEach(s=>s.destroy());this.sparks=[];scene=this;
  this.playerCamera=createPlayerCamera(this,{mode:'auto',zoom:1,isMobile:()=>root.clientWidth<700||root.clientHeight<500});
  this.prepare();this.pauseRound();$('#prism-play').disabled=false;$('#prism-menu-button').disabled=true;text('#prism-play','Enter the party');
  resize();paint();
 }
 prepare(){
  super.startRound({stage:stage(),timingId:timing.id,outfit});
  this.round.flowTaken=[0,1];this.round.mystery.phase='spent';this.flowPickup.setVisible(false);
  this.musicMs=0;
  this.motionQuery={get matches(){return motionQuery.matches||$('#prism-reduced').checked;}};
  this.reducedMotion=this.motionQuery.matches;
  this.background.venueView?.setProgress(practice.state);this.background.update(0,'cruise',this.reducedMotion,timing);
 }
 movePlayer(delta){
  const previous={x:this.dancer.x,y:this.dancer.y},direction=super.movePlayer(delta),point=clampPrismPoint(this.dancer,previous);
  if(point.x!==this.dancer.x||point.y!==this.dancer.y){this.dancer.setPosition(point.x,point.y);this.target=null;}
  return direction;
 }
 effect(x,y,color,points,celebrate,label){if(label?.startsWith('SMOOTH'))return;super.effect(x,y,color,points,celebrate,label);}
 update(time,delta){
  if(!scene||disposed)return;
  this.reducedMotion=motionQuery.matches||$('#prism-reduced').checked;
  if(!this.running){this.playerCamera?.update();return;}
  const step=Math.min(PRISM.maxDeltaMs,Math.max(0,delta)),previous={x:this.dancer.x,y:this.dancer.y};
  const nextMusic=(this.musicMs+step)%timing.durationMs;
  this.round.remainingMs=timing.durationMs-nextMusic+step;this.round.ended=false;
  super.update(time,step);
  const events=freeDance?[]:practice.step({player:this.dancer,previous,deltaMs:step,drivenSpeed:this.gameControls.motion.actualSpeed});
  this.musicMs=events.some(e=>e.type==='entered')?practice.state.partyMs:nextMusic;
  this.round.remainingMs=timing.durationMs-this.musicMs;
  events.forEach(feedback);paint();
  // The shared scene already draws once per frame. Only redraw immediately
  // for a clock reset or the final paused result; ordinary cues follow next frame.
  if(events.some(e=>e.type==='entered'||e.type==='complete'))this.background.update(this.musicMs,phaseAt(this.musicMs,timing).phase,this.reducedMotion,timing);
  this.dropWash.setAlpha(0);
  if(this.running)audio.sync(this.round,'prism-party-preview');
 }
}
const game=new Phaser.Game({type:Phaser.CANVAS,parent:'game',width:960,height:640,banner:false,audio:{noAudio:true},scale:{mode:Phaser.Scale.FIT},scene:PrismScene});
function resize(){
 if(disposed||layoutPending)return;layoutPending=true;
 requestAnimationFrame(()=>{
  layoutPending=false;if(disposed)return;
  const width=root.clientWidth,height=root.clientHeight,key=`${width}:${height}`;
  if(lastViewport===key)return;lastViewport=key;
  resizeGameViewport(game,width,height,scene);game.scale.refresh();framing();
 });
}
const layoutObserver=new ResizeObserver(resize);layoutObserver.observe(root);
listen($('#prism-play'),'click',play);listen($('#prism-restart'),'click',restart);
listen($('#prism-menu-button'),'click',()=>openMenu('paused'));
for(const selector of ['#prism-control','#prism-sensitivity'])listen($(selector),'change',()=>scene?.setControlPreferences(preferences()));
listen($('#prism-camera'),'change',framing);
for(const selector of ['#prism-sound','#prism-music','#prism-fx'])listen($(selector),'input',()=>{sound();if($('#prism-menu').hidden===false)audio.stop();if(selector==='#prism-fx')audio.pickup(1);});
listen(document,'keydown',event=>{
 if(event.key==='Escape'&&scene){event.preventDefault();if($('#prism-menu').hidden)openMenu('paused');else if(menuKind==='paused')play();}
 if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(event.key)&&document.activeElement===$('#game'))event.preventDefault();
});
listen(document,'visibilitychange',()=>{if(document.hidden&&scene?.running)openMenu('paused');});
listen(window,'blur',()=>{if(scene?.running)openMenu('paused');});
listen(window,'resize',resize);if(window.visualViewport)listen(window.visualViewport,'resize',resize);
listen(window,'pagehide',event=>{if(event.persisted){if(scene?.running)openMenu('paused');}else dispose();});
if(matchMedia('(pointer:coarse)').matches)$('#prism-control').value='stick';
$('#prism-reduced').checked=motionQuery.matches;
function dispose(){if(disposed)return;disposed=true;listeners.abort();layoutObserver.disconnect();audio.stop();game.destroy(true);root.classList.remove('prism-lab');}
if(import.meta.hot)import.meta.hot.dispose(dispose);
