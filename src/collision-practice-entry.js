import Phaser from 'phaser';
import './game-controls.css';
import './collision-practice.css';
import {GameScene} from './GameScene.js';
import {renderCollisionPractice} from './collision-practice-view.js';
import {crowdPracticeStage} from './crowd-practice-stage.js';
import {venuePracticeConfig} from './venue-practice.js';
import {createClockPractice,createPracticeEngine,handlePracticePageHide} from './clock-practice.js';
import {createPlayerCamera} from './player-camera.js';
import {playViewport,phoneViewport,viewportRotated,resizeGameViewport} from './game-viewport.js';
import {findSpawn} from './geometry.js';
import {createAudio} from './audio.js';
import {updateBassButton} from './bass-view.js';
import {bindActionButton} from './action-button.js';

// An isolated feel experiment: no profile, recovery, analytics or score client.
const root=document.querySelector('.shell'),venues=venuePracticeConfig();
renderCollisionPractice(root,{choices:venues.choices});
const $=selector=>root.querySelector(selector),listeners=new AbortController();
const audio=createAudio(undefined,{timedVoices:venues.timedVoices,useTransport:true,createMusicRenderer:venues.createMusicRenderer});
let currentScene=null,gameInstance=null,bassAction=null,contacts=0,disposed=false,viewport=null;
const mode=()=>$('#collision-mode').value;
const radius=()=>Number($('#collision-radius').value);
const extra=()=>Number($('#collision-density').value);
const preferences=()=>({mode:$('#collision-control').value,sensitivity:Number($('#collision-sensitivity').value),hand:$('#collision-hand').value});
function text(id,value){const node=$(id);if(node.textContent!==String(value))node.textContent=String(value);}
function listen(node,event,handler){node.addEventListener(event,handler,{signal:listeners.signal});}
function cancel(){bassAction?.cancel();currentScene?.clearInput();}
function update(round){
 text('#collision-score',round.score);text('#collision-passes',round.closePasses);text('#collision-contacts',contacts);
 text('#collision-friends',currentScene?.crowdSocial?.friendships?.summary().friends??0);
 text('#collision-time',`${Math.ceil(round.remainingMs/1000)}s`);
 updateBassButton($('#bass-head'),round.bass,{playing:lab.state==='playing'&&!round.ended,hasSpeakers:true});
 if(lab.state==='playing')audio.sync(round,'collision-lab');
}
function refresh(){
 const playing=lab.state==='playing',paused=lab.state==='paused',ended=lab.state==='ended';
 Object.assign(root.dataset,{playing:String(playing),paused:String(!playing),hand:preferences().hand,control:preferences().mode});
 $('#collision-menu').hidden=playing;$('#collision-resume').hidden=!paused;
 $('#collision-pause').disabled=!playing&&!paused;$('#collision-pause').textContent=paused?'Resume':'Pause';
 $('#collision-radius').disabled=mode()==='off';text('#collision-radius-value',radius());
 text('#collision-mode-name',mode()==='off'?'Pass-through crowd':`Mixed crowd · ${currentScene?.stage.crowdAnchors.length??venues.resolveStage($('#collision-venue').value).crowdAnchors.length+extra()} dancers`);
 text('#collision-venue-name',venues.resolveStage($('#collision-venue').value).name);
 text('#collision-note',ended?`Round complete · ${currentScene?.round.score??0} points · ${currentScene?.round.closePasses??0} smooth passes · ${contacts} contacts · ${currentScene?.crowdSocial?.friendships?.summary().friends??0} friends. Try another setting to compare.`:paused?'Paused. Resume this round, or start fresh to compare.':'Choose your feel, then start a fresh practice.');
 const hints={tap:'Tap or click the floor to move.',swipe:'Swipe anywhere, then release to move in that screen direction.',stick:'Touch anywhere and drag to steer. Push farther to sprint.'};
 $('#game').setAttribute('aria-label',`Crowd practice. ${hints[preferences().mode]} WASD or arrows also move. B activates Bass Head. Escape pauses.`);
 if(currentScene)update(currentScene.round);
}
function resize(){
 const next=playViewport(window.visualViewport?.width||innerWidth,window.visualViewport?.height||innerHeight);
 if(viewportRotated(viewport,next)&&lab.state==='playing')suspend();
 viewport=next;root.style.setProperty('--play-width',`${next.width}px`);root.style.setProperty('--play-height',`${next.height}px`);
 if(gameInstance&&resizeGameViewport(gameInstance,next.width,next.height,currentScene))bassAction?.cancel();
}
const enginePool=createPracticeEngine(()=>{
 let scene=null,config=null,destroyed=false,playing=true;
 class CollisionScene extends GameScene{
  preload(){venues.preload(this);}
  create(){
   this.stageRendererOptions={venueView:venues.venueView};super.create();
   scene=this;currentScene=this;
   this.setControlPreferences(preferences());
   this.playerCamera=createPlayerCamera(this,{mode:'follow',isMobile:()=>phoneViewport(innerWidth,innerHeight)});
   if(destroyed){this.game.destroy(true);return;}
   if(config){this.startRound(config);if(!playing)this.pauseRound();}
   resize();refresh();
  }
  crowdOptions(){return {enabled:mode()!=='off',baseRadius:radius(),debug:$('#collision-boxes').checked,reactions:$('#collision-emotes').checked};}
  startRound(value){
   this.sparkSeed=20261113;contacts=0;
   super.startRound({...value,stage:crowdPracticeStage(value.stage,extra())});
   // Candy changes steering and would obscure comparison of contact settings.
   this.round.mystery.phase='absent';
  }
  placeSpark(spark){
   this.sparkSeed??=20261113;
   const random=()=>{this.sparkSeed=(Math.imul(this.sparkSeed,1664525)+1013904223)>>>0;return this.sparkSeed/4294967296;};
   const avoid=this.crowd.people.map(p=>({x:p.node.x,y:p.node.y,radius:38}));
   if(this.dancer)avoid.push({x:this.dancer.x,y:this.dancer.y,radius:80});
   const point=findSpawn(this.stage,random,avoid,spark.preferBass);spark.setPosition(point.x,point.y);spark.art.setPosition(0,0);
  }
  update(time,delta){
   // A returning/background frame must not teleport the crowd into the player.
   if(this.running&&delta>250){suspend();return;}
   super.update(time,delta);
  }
 }
 const size=viewport??playViewport(innerWidth,innerHeight);
 const game=new Phaser.Game({type:Phaser.CANVAS,parent:'game',width:size.width,height:size.height,banner:false,audio:{noAudio:true},scale:{mode:Phaser.Scale.NONE},scene:CollisionScene});gameInstance=game;
 game.events.on('round:update',round=>{if(!destroyed)update(round);});
 game.events.on('round:pickup',()=>audio.pickup(scene.round.multiplier));
 game.events.on('round:closepass',()=>audio.closePass());
 game.events.on('round:contact',()=>{contacts++;});
 game.events.on('round:end',()=>{if(!destroyed){cancel();audio.stop();lab.finish();refresh();}});
 return {start(value){config=value;playing=true;if(scene)scene.startRound(value);},pause(){playing=false;scene?.pauseRound();audio.stop();},resume(){playing=true;scene?.resumeRound();audio.setEnabled($('#collision-sound').checked);},destroy(){destroyed=true;cancel();audio.stop();currentScene=null;gameInstance=null;if(scene)game.destroy(true);}};
});
const lab=createClockPractice({createSession:enginePool.createSession,...venues,initialId:'smf-fractal'});
function start(){cancel();audio.stop();audio.setEnabled($('#collision-sound').checked);lab.start();refresh();$('#game').focus({preventScroll:true});}
function resume(){cancel();lab.resume();refresh();$('#game').focus({preventScroll:true});}
function suspend(){cancel();lab.pause();audio.stop();refresh();if(lab.state==='paused')$('#collision-resume').focus({preventScroll:true});}
function togglePause(){if(lab.state==='paused')resume();else suspend();}
// Changing the experiment resets time/seed but keeps the comparison menu open.
function resetComparison(){if(lab.state!=='ready'){lab.select($('#collision-venue').value);suspend();}else refresh();}
listen($('#collision-start'),'click',()=>{if(lab.stage.id!==$('#collision-venue').value){lab.select($('#collision-venue').value);audio.setEnabled($('#collision-sound').checked);refresh();$('#game').focus({preventScroll:true});}else start();});
listen($('#collision-pause'),'click',togglePause);listen($('#collision-resume'),'click',resume);
listen($('#collision-settings'),'click',suspend);
listen($('#collision-mode'),'change',resetComparison);
listen($('#collision-density'),'change',resetComparison);
listen($('#collision-radius'),'input',()=>text('#collision-radius-value',radius()));
listen($('#collision-radius'),'change',resetComparison);
listen($('#collision-venue'),'change',resetComparison);
for(const id of ['collision-control','collision-hand','collision-sensitivity'])listen($(`#${id}`),'change',()=>{cancel();currentScene?.setControlPreferences(preferences());refresh();});
listen($('#collision-boxes'),'change',()=>currentScene?.crowdSocial?.paint());
listen($('#collision-emotes'),'change',()=>currentScene?.crowdSocial?.paint());
listen($('#collision-sound'),'change',()=>audio.setEnabled($('#collision-sound').checked&&lab.state==='playing'));
bassAction=bindActionButton($('#bass-head'),{isEnabled:()=>lab.state==='playing'&&!!currentScene?.running&&!$('#bass-head').disabled,onActivate:()=>currentScene?.activateBassHead()});
listen(document,'keydown',event=>{
 if(event.code==='Escape'&&!event.repeat&&['playing','paused'].includes(lab.state)){event.preventDefault();togglePause();return;}
 if(event.target.matches('input,select,textarea,button'))return;
 if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(event.key)&&lab.state==='playing')event.preventDefault();
 if(event.code==='KeyB'&&!event.repeat&&lab.state==='playing'){event.preventDefault();currentScene?.activateBassHead();}
});
listen(document,'visibilitychange',()=>{if(document.hidden)suspend();});listen(window,'blur',suspend);
listen(window,'resize',resize);if(window.visualViewport)listen(window.visualViewport,'resize',resize);
listen(window,'pagehide',event=>handlePracticePageHide(event,{pause:suspend,dispose:cleanup}));
function cleanup(){if(disposed)return;disposed=true;bassAction?.dispose();listeners.abort();lab.destroy();enginePool.destroy();audio.stop();root.classList.remove('collision-lab');for(const key of ['playing','paused','hand','control'])delete root.dataset[key];root.style.removeProperty('--play-width');root.style.removeProperty('--play-height');}
if(import.meta.hot)import.meta.hot.dispose(cleanup);
resize();refresh();
