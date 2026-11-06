import Phaser from 'phaser';
import './clock-practice.css';
import {GameScene} from './GameScene.js';
import {createClockPractice,CLOCK_CHOICES,diagnosticVoices} from './clock-practice.js';
import {createAudio} from './audio.js';
import {elapsedMs,roundTiming,musicalPosition,phaseAt,phaseProgress} from './stage-clock.js';
import {updateBassButton} from './bass-view.js';

const root=document.querySelector('.shell');root.classList.add('clock-lab');
root.innerHTML=`<header><div><span class="clock-eyebrow">SMF development preview · no saves</span><h1>Find the pulse</h1></div><a class="quiet-button" href="./">Meet the stages</a></header>
<p class="clock-note">Timing and instrument practice. These are the proposed main-stage clocks on a neutral test floor, with a simple synthesized beat. Venue artwork and full arrangements come next.</p>
<div class="clock-controls"><label for="clock-lab-select">Choose a clock<select id="clock-lab-select">${CLOCK_CHOICES.map(c=>`<option value="${c.id}" ${c.id===CLOCK_CHOICES[1].id?'selected':''}>${c.label}</option>`).join('')}</select></label><button id="clock-start" class="primary-button">Start fresh</button><button id="clock-pause" class="quiet-button" disabled>Pause</button><button id="clock-sound" class="quiet-button" aria-pressed="true">Sound on</button></div>
<section class="clock-panel" aria-label="Clock practice arena"><div class="clock-hud"><span>SPARK SCORE<strong id="clock-score">0</strong></span><span>PHRASE POSITION<strong id="clock-position">Ready</strong></span><span>TIME LEFT<strong id="clock-time">68.571s</strong></span></div>
<div class="clock-track"><div id="clock-progress"></div></div><div class="clock-status"><strong id="clock-phase" role="status">Ready to practice</strong><span id="clock-elapsed">0.000s active</span></div>
<div class="clock-arena"><div id="game" tabindex="0" role="application" aria-label="Clock practice. Click or tap a destination, or use arrows or WASD. Escape pauses."></div><button id="bass-head" class="bass-control" hidden disabled aria-label="Bass Head"><span class="bass-control-icon" aria-hidden="true">ϟ</span><span class="bass-control-name" aria-hidden="true">Bass Head</span><span class="bass-control-detail" aria-hidden="true">0%</span></button><div id="clock-pause-note">Start fresh to try the clock.<br>Nothing here affects your real game.</div></div></section>
<p class="clock-note">Click/tap a destination or use WASD/arrows. Collect sparks and pass the dancers. B activates Bass Head when charged. Escape pauses. Changing clocks starts fresh; hidden tabs pause. Reduced motion follows your device setting. This preview never saves scores, XP or playtest data.</p>`;
const $=id=>root.querySelector(id),audio=createAudio(undefined,{timedVoices:diagnosticVoices,useTransport:true});
let soundOn=true,currentScene=null,disposed=false;
function controls(){
 const playing=lab.state==='playing',paused=lab.state==='paused',ended=lab.state==='ended';
 $('#clock-pause').disabled=!playing&&!paused;$('#clock-pause').textContent=paused?'Resume':'Pause';
 $('#clock-pause-note').hidden=playing;
 if(paused)$('#clock-pause-note').textContent='Paused · press Resume when you’re ready.';
 if(ended)$('#clock-pause-note').textContent='Phrase complete. Start fresh or choose another clock.';
}
function update(round){
 const timing=roundTiming(round),elapsed=elapsedMs(round),position=musicalPosition(elapsed,timing),phase=phaseAt(elapsed,timing);
 $('#clock-score').textContent=String(round.score);$('#clock-time').textContent=`${(round.remainingMs/1000).toFixed(3)}s`;
 $('#clock-position').textContent=`Bar ${position.bar+1} · Beat ${position.beat%4+1}`;
 $('#clock-elapsed').textContent=`${(elapsed/1000).toFixed(3)}s active`;
 $('#clock-phase').textContent=phase.phase==='drop'?'2× VIBES':phase.phase==='build'?'Lift incoming':phase.phase==='ended'?'Phrase complete':'Find the groove';
 $('#clock-progress').style.width=`${phaseProgress(elapsed,timing)*100}%`;
 updateBassButton($('#bass-head'),round.bass,{playing:lab.state==='playing'&&!round.ended,hasSpeakers:true});
 if(lab.state==='playing')audio.sync(round,'clock-lab');
}
const lab=createClockPractice({createSession(){
 let scene=null,config=null,destroyed=false,playing=true,game;
 class PracticeScene extends GameScene{create(){super.create();scene=this;if(destroyed){game.destroy(true);return;}currentScene=this;if(config){this.startRound(config);if(!playing)this.pauseRound();}}}
 game=new Phaser.Game({type:Phaser.CANVAS,parent:'game',width:960,height:640,banner:false,audio:{noAudio:true},scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH},scene:PracticeScene});
 game.events.on('round:update',round=>{if(!destroyed)update(round)});
 game.events.on('round:pickup',()=>audio.pickup(scene.round.multiplier));game.events.on('round:closepass',()=>audio.closePass());
 game.events.on('round:end',()=>{if(destroyed)return;audio.stop();lab.finish();controls();});
 return {start(value){config=value;if(scene)scene.startRound(value);},pause(){playing=false;scene?.pauseRound();audio.stop();},resume(){playing=true;scene?.resumeRound();audio.setEnabled(soundOn);},destroy(){destroyed=true;audio.stop();if(currentScene===scene)currentScene=null;if(scene)game.destroy(true);}};
}});
function start(){audio.stop();audio.setEnabled(soundOn);lab.start();controls();}
function pause(){if(lab.state==='paused')lab.resume();else lab.pause();controls();if(currentScene)update(currentScene.round);}
$('#clock-start').addEventListener('click',start);
$('#clock-pause').addEventListener('click',pause);
$('#clock-lab-select').addEventListener('change',e=>{audio.stop();audio.setEnabled(soundOn);lab.select(e.target.value);controls();});
$('#clock-sound').addEventListener('click',()=>{soundOn=!soundOn;audio.setEnabled(soundOn);$('#clock-sound').textContent=soundOn?'Sound on':'Sound off';$('#clock-sound').setAttribute('aria-pressed',String(soundOn));});
$('#bass-head').addEventListener('click',()=>{currentScene?.activateBassHead();if(currentScene)update(currentScene.round);});
function keydown(e){if(e.target.matches('select,input,textarea'))return;if(e.code==='Escape'&&['playing','paused'].includes(lab.state)){e.preventDefault();pause();}if(e.code==='KeyB'&&lab.state==='playing'&&!e.repeat){e.preventDefault();currentScene?.activateBassHead();}}
function hidden(){if(document.hidden){lab.pause();audio.stop();controls();if(currentScene)update(currentScene.round);}}
document.addEventListener('keydown',keydown);document.addEventListener('visibilitychange',hidden);
function cleanup(){if(disposed)return;disposed=true;lab.destroy();audio.stop();document.removeEventListener('keydown',keydown);document.removeEventListener('visibilitychange',hidden);window.removeEventListener('pagehide',cleanup);root.classList.remove('clock-lab');}
window.addEventListener('pagehide',cleanup);
if(import.meta.hot)import.meta.hot.dispose(cleanup);
