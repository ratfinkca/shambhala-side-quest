import Phaser from 'phaser';
import './clock-practice.css';
import {GameScene} from './GameScene.js';
import {createClockPractice,createPracticeEngine,handlePracticePageHide,CLOCK_CHOICES,diagnosticVoices} from './clock-practice.js';
import {createAudio} from './audio.js';
import {elapsedMs,roundTiming,musicalPosition,phaseAt,phaseProgress} from './stage-clock.js';
import {updateBassButton} from './bass-view.js';
import {venuePracticeRequested} from './editions/registry.js';
const venueMode=venuePracticeRequested(import.meta.env,window.location.search);
const venueOptions=venueMode?(await import('./venue-practice.js')).venuePracticeConfig():null;
const trackAuditionModule=venueMode?await import('./editions/smf-track-audition.js'):null;
const choices=venueOptions?.choices??CLOCK_CHOICES,initialId=venueOptions?.initialId??CLOCK_CHOICES[1].id,initialStage=venueOptions?.resolveStage(initialId);

const root=document.querySelector('.shell');root.classList.add('clock-lab');if(venueMode)root.classList.add('venue-lab');
root.innerHTML=`<header><div><span class="clock-eyebrow">SMF ${venueMode?'venue':'development'} preview · no saves</span><h1 id="practice-heading">${venueMode?initialStage.name:'Find the pulse'}</h1></div><a class="quiet-button" href="./">Meet the stages</a></header>
<p class="clock-note" id="practice-caption">${venueMode?initialStage.caption:'Timing and instrument practice. These are the proposed main-stage clocks on a neutral test floor, with a simple synthesized beat. Venue artwork and full arrangements come next.'}</p>
<div class="clock-controls"><label for="clock-lab-select">${venueMode?'Choose a venue':'Choose a clock'}<select id="clock-lab-select">${choices.map(c=>`<option value="${c.id}" ${c.id===initialId?'selected':''}>${c.label}</option>`).join('')}</select></label><button id="clock-start" class="primary-button">Start fresh</button><button id="clock-pause" class="quiet-button" disabled>Pause</button><button id="clock-sound" class="quiet-button" aria-pressed="true">Sound on</button></div>
<section class="clock-panel" aria-label="${venueMode?'Venue practice arena':'Clock practice arena'}"><div class="clock-hud"><span>SPARK SCORE<strong id="clock-score">0</strong></span><span>PHRASE POSITION<strong id="clock-position">Ready</strong></span><span>TIME LEFT<strong id="clock-time">68.6s</strong></span></div>
<div class="clock-track"><div id="clock-progress"></div></div><div class="clock-status"><strong id="clock-phase" role="status">Ready to practice</strong>${venueMode?`<span id="clock-goal">Sparks 0 / ${initialStage.target}</span>`:''}<span id="clock-elapsed">0.000s active</span></div>
<div class="clock-arena"><div id="game" tabindex="0" role="application" aria-label="Clock practice. Click or tap a destination, or use arrows or WASD. Escape pauses."></div><button id="bass-head" class="bass-control" hidden disabled aria-label="Bass Head"><span class="bass-control-icon" aria-hidden="true">ϟ</span><span class="bass-control-name" aria-hidden="true">Bass Head</span><span class="bass-control-detail" aria-hidden="true">0%</span></button><div id="clock-pause-note">Start fresh to try the clock.<br>Nothing here affects your real game.</div></div></section>
<p class="clock-note">Click/tap a destination or use WASD/arrows. Collect sparks and pass the dancers. B activates Bass Head when charged. Escape pauses. ${venueMode?'Changing venues':'Changing clocks'} starts fresh; hidden tabs pause. Reduced motion follows your device setting. This preview never saves scores, XP or playtest data.${venueMode?' Original venue art and music sketches · final detail and balance still to come.':''}</p>`;
const $=id=>root.querySelector(id),baseAudio=createAudio(undefined,{timedVoices:venueOptions?.timedVoices??diagnosticVoices,useTransport:true,createMusicRenderer:venueOptions?.createMusicRenderer});
const trackAudition=trackAuditionModule?.createTrackAudition(baseAudio),audio=trackAudition?.audio??baseAudio;
let soundOn=true,currentScene=null,disposed=false;
function controls(){
 const playing=lab.state==='playing',paused=lab.state==='paused',ended=lab.state==='ended';
 $('#clock-pause').disabled=!playing&&!paused;$('#clock-pause').textContent=paused?'Resume':'Pause';
 $('#clock-pause-note').hidden=playing;
 if(paused)$('#clock-pause-note').textContent='Paused · press Resume when you’re ready.';
 if(ended)$('#clock-pause-note').textContent=venueMode?`${currentScene.round.pickups>=lab.stage.target?'Target met!':'Keep exploring.'} ${currentScene.round.pickups} / ${lab.stage.target} sparks · Start fresh or try another venue.`:'Phrase complete. Start fresh or choose another clock.';
 if(venueMode){setText('#practice-heading',lab.stage.name);setText('#practice-caption',lab.stage.caption);$('#game').setAttribute('aria-label',`${lab.stage.name} practice. Click or tap a destination, or use arrows or WASD. Escape pauses.`);}
}
function setText(id,value){const node=$(id);if(node.textContent!==value)node.textContent=value;}
function update(round){
 const timing=roundTiming(round),elapsed=elapsedMs(round),position=musicalPosition(elapsed,timing),phase=phaseAt(elapsed,timing);
 if(venueMode)setText('#clock-goal',`Sparks ${round.pickups} / ${lab.stage.target}`);
 setText('#clock-score',String(round.score));setText('#clock-time',`${(Math.ceil(round.remainingMs/100)/10).toFixed(1)}s`);
 setText('#clock-position',`Bar ${position.bar+1} · Beat ${position.beat%4+1}`);
 setText('#clock-elapsed',`${(elapsed/1000).toFixed(3)}s active`);
 setText('#clock-phase',phase.phase==='drop'?'2× VIBES':phase.phase==='build'?'Lift incoming':phase.phase==='ended'?'Phrase complete':'Find the groove');
 $('#clock-progress').style.width=`${phaseProgress(elapsed,timing)*100}%`;
 updateBassButton($('#bass-head'),round.bass,{playing:lab.state==='playing'&&!round.ended,hasSpeakers:true});
 if(lab.state==='playing')audio.sync(round,'clock-lab');
}
const enginePool=createPracticeEngine(()=>{
 let scene=null,config=null,destroyed=false,playing=true,game;
 class PracticeScene extends GameScene{
  preload(){venueOptions?.preload(this);}
  create(){if(venueOptions)this.stageRendererOptions={venueView:venueOptions.venueView};super.create();scene=this;if(destroyed){this.game.destroy(true);return;}currentScene=this;if(config){this.startRound(config);if(!playing)this.pauseRound();}}
 }
 game=new Phaser.Game({type:Phaser.CANVAS,parent:'game',width:960,height:640,banner:false,audio:{noAudio:true},scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH},scene:PracticeScene});
 game.events.on('round:update',round=>{if(!destroyed)update(round)});
 game.events.on('round:pickup',()=>audio.pickup(scene.round.multiplier));game.events.on('round:closepass',()=>audio.closePass());
 game.events.on('round:end',()=>{if(destroyed)return;audio.stop();lab.finish();controls();});
 return {start(value){config=value;playing=true;if(scene)scene.startRound(value);},pause(){playing=false;scene?.pauseRound();audio.stop();},resume(){playing=true;scene?.resumeRound();audio.setEnabled(soundOn);trackAudition?.playFromGesture(scene?.round);},destroy(){destroyed=true;audio.stop();if(currentScene===scene)currentScene=null;if(scene)game.destroy(true);}};
});
const lab=createClockPractice({createSession:enginePool.createSession,...venueOptions});
function start(){root.querySelector('.sound-check audio')?.pause();audio.stop();audio.setEnabled(soundOn);lab.start();controls();trackAudition?.playFromGesture(currentScene?.round);}
function pause(){if(lab.state==='paused')lab.resume();else lab.pause();controls();if(currentScene)update(currentScene.round);}
$('#clock-start').addEventListener('click',start);
$('#clock-pause').addEventListener('click',pause);
$('#clock-lab-select').addEventListener('change',e=>{audio.stop();audio.setEnabled(soundOn);lab.select(e.target.value);controls();trackAudition?.playFromGesture(currentScene?.round);});
$('#clock-sound').addEventListener('click',()=>{soundOn=!soundOn;audio.setEnabled(soundOn);if(soundOn&&lab.state==='playing')trackAudition?.playFromGesture(currentScene?.round);$('#clock-sound').textContent=soundOn?'Sound on':'Sound off';$('#clock-sound').setAttribute('aria-pressed',String(soundOn));});
$('#bass-head').addEventListener('click',()=>{currentScene?.activateBassHead();if(currentScene)update(currentScene.round);});
function keydown(e){if(e.target.matches('select,input,textarea'))return;if(e.code==='Escape'&&!e.repeat&&['playing','paused'].includes(lab.state)){e.preventDefault();pause();}if(e.code==='KeyB'&&lab.state==='playing'&&!e.repeat){e.preventDefault();currentScene?.activateBassHead();}}
function hidden(){if(document.hidden){lab.pause();audio.stop();controls();if(currentScene)update(currentScene.round);}}
document.addEventListener('keydown',keydown);document.addEventListener('visibilitychange',hidden);
const disposeSoundCheck=venueOptions?.mountSoundCheck(root,{getStage:()=>lab.stage,pause(){lab.pause();controls();if(currentScene)update(currentScene.round);}});
const disposeTrackAudition=trackAuditionModule?.mountTrackAudition(root,{audition:trackAudition,start,pause(){root.querySelector('.sound-check audio')?.pause();lab.pause();controls();if(currentScene)update(currentScene.round);}});
function cleanup(){if(disposed)return;disposed=true;disposeSoundCheck?.();disposeTrackAudition?.();lab.destroy();enginePool.destroy();audio.stop();trackAudition?.dispose();document.removeEventListener('keydown',keydown);document.removeEventListener('visibilitychange',hidden);window.removeEventListener('pagehide',pagehide);root.classList.remove('clock-lab','venue-lab');}
function pagehide(event){handlePracticePageHide(event,{pause(){lab.pause();audio.stop();controls();if(currentScene)update(currentScene.round);},dispose:cleanup});}
window.addEventListener('pagehide',pagehide);
if(import.meta.hot)import.meta.hot.dispose(cleanup);
