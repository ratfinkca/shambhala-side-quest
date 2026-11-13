import Phaser from 'phaser';
import './control-practice.css';
import {GameScene} from './GameScene.js';
import {renderControlPractice,updateControlHint} from './control-practice-view.js';
import {bindControlInput} from './control-practice-input.js';
import {createMotion,commandSwipe,commandStick,brakeMotion,resetMotion,advanceMotion} from './control-practice-motion.js';
import {venuePracticeConfig} from './venue-practice.js';
import {createClockPractice,createPracticeEngine,handlePracticePageHide} from './clock-practice.js';
import {findSpawn,movementFactor,bassFactor} from './geometry.js';
import {bassMovementFactor} from './bass-head.js';
import {createAudio} from './audio.js';
import {updateBassButton} from './bass-view.js';
import {bindActionButton} from './action-button.js';

const root=document.querySelector('.shell'),venues=venuePracticeConfig();
renderControlPractice(root,{choices:venues.choices});
const $=id=>root.querySelector(id),listeners=new AbortController();
let currentScene=null,input=null,bassAction=null,bumpCount=0,disposed=false;
const audio=createAudio(undefined,{timedVoices:venues.timedVoices,useTransport:true,createMusicRenderer:venues.createMusicRenderer});
const mode=()=>$('#control-mode').value,staminaEnabled=()=>$('#control-stamina').checked;
const arena=()=>({width:960,height:640,playBounds:currentScene?.stage.playBounds,obstacles:currentScene?.stage.obstacles??[]});
function text(id,value){const node=$(id);if(node&&node.textContent!==String(value))node.textContent=String(value);}
function listen(node,event,fn){node.addEventListener(event,fn,{signal:listeners.signal});}
function cancel(){
 bassAction?.cancel();
 input?.cancel();
 if(currentScene){currentScene.input.keyboard.resetKeys();currentScene.shift?.reset();currentScene.keyboardMoving=false;if(currentScene.motion)resetMotion(currentScene.motion);}
}
function refresh(){
 const playing=lab.state==='playing',paused=lab.state==='paused',ended=lab.state==='ended';
 $('#control-pause').disabled=!playing&&!paused;$('#control-pause').textContent=paused?'Resume':'Pause';
 $('#control-pause-note').hidden=playing;
 $('#control-pause-note').textContent=ended?`Round complete · ${currentScene?.round.closePasses??0} smooth passes · ${bumpCount} bumps. Change a control and start fresh to compare.`:paused?'Paused. Resume when you’re ready.':mode()==='swipe'?'Start fresh, then swipe anywhere on the dance floor.':'Start fresh, then drag anywhere on the dance floor.';
 $('#control-sprint').hidden=mode()!=='stick';$('#control-sprint').disabled=!playing;
 $('#control-floor').setAttribute('aria-label',mode()==='swipe'?'Swipe anywhere and release to move in that screen direction. Keep the stroke continuous. Pauses, backtracking and slow drags are ignored. Tap to brake.':'Drag to steer. Release to glide to a stop.');
 root.dataset.hand=$('#control-hand').value;
 updateControlHint(root,mode());
 if(currentScene)update(currentScene.round);
}
function update(round){
 text('#control-score',round.score);text('#control-passes',round.closePasses);text('#control-bumps',bumpCount);
 text('#control-time',`${Math.ceil(round.remainingMs/1000)}s`);
 const motion=currentScene?.motion;
 text('#control-speed',`${((motion?.actualSpeed??0)/300).toFixed(1)}×`);
 text('#control-energy',staminaEnabled()?`${Math.round(motion?.stamina??100)}%`:'Off');
 $('#control-energy-fill').style.width=`${staminaEnabled()?motion?.stamina??100:100}%`;
 $('#control-energy-fill').parentElement.setAttribute('aria-valuenow',String(staminaEnabled()?Math.round(motion?.stamina??100):100));
 $('#control-energy-fill').parentElement.setAttribute('aria-valuetext',staminaEnabled()?`${Math.round(motion?.stamina??100)}%`:'Stamina off: unlimited sprint');
 updateBassButton($('#bass-head'),round.bass,{playing:lab.state==='playing'&&!round.ended,hasSpeakers:true});
 if(lab.state==='playing')audio.sync(round,'control-lab');
}

const enginePool=createPracticeEngine(()=>{
 let scene=null,config=null,destroyed=false,playing=true;
 class ControlScene extends GameScene{
  preload(){venues.preload(this);}
  create(){
   this.stageRendererOptions={venueView:venues.venueView};this.motion=createMotion();
   super.create();scene=this;currentScene=this;
   this.shift=this.input.keyboard.addKey('SHIFT',false);
   if(destroyed){this.game.destroy(true);return;}
   if(config){this.startRound(config);if(!playing)this.pauseRound();}
  }
  // The lab's DOM surfaces own gestures; production destination taps remain in
  // GameScene. No extra controller ever attaches to a normal game route.
  pointTo(){}
  clearInput(){super.clearInput();this.shift?.reset();this.keyboardMoving=false;if(this.motion)resetMotion(this.motion);input?.cancel();bassAction?.cancel();}
  startRound(value){
   this.sparkSeed=20261112;bumpCount=0;resetMotion(this.motion,{refill:true});
   super.startRound(value);this.round.mystery.phase='absent';
  }
  placeSpark(spark){
   this.sparkSeed??=20261112;
   const random=()=>{this.sparkSeed=(Math.imul(this.sparkSeed,1664525)+1013904223)>>>0;return this.sparkSeed/4294967296;};
   const avoid=this.crowd.people.map(p=>({x:p.node.x,y:p.node.y,radius:38}));
   if(this.dancer)avoid.push({x:this.dancer.x,y:this.dancer.y,radius:80});
   const p=findSpawn(this.stage,random,avoid,spark.preferBass);spark.setPosition(p.x,p.y);spark.art.setPosition(0,0);
  }
  movePlayer(delta){
   const k=this.keys,vector={x:Number(k.D.isDown||k.RIGHT.isDown)-Number(k.A.isDown||k.LEFT.isDown),y:Number(k.S.isDown||k.DOWN.isDown)-Number(k.W.isDown||k.UP.isDown)};
   const formFocused=document.activeElement?.matches('input,select,textarea,button');
   if(!formFocused&&(vector.x||vector.y)){commandStick(this.motion,vector,this.shift.isDown);this.keyboardMoving=true;}
   else if(this.keyboardMoving){brakeMotion(this.motion);this.keyboardMoving=false;}
   const terrainFactor=movementFactor(this.dancer,this.stage.mud,this.round.slowedMs,this.stage.obstacles,bassMovementFactor(this.round.bass,bassFactor(this.dancer,this.stage.obstacles)));
   return advanceMotion(this.motion,this.dancer,delta,{staminaEnabled:staminaEnabled(),terrainFactor,arena:arena()});
  }
 }
 const game=new Phaser.Game({type:Phaser.CANVAS,parent:'game',width:960,height:640,banner:false,audio:{noAudio:true},scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH},scene:ControlScene});
 game.events.on('round:update',round=>{if(!destroyed)update(round);});
 game.events.on('round:pickup',()=>audio.pickup(scene.round.multiplier));
 game.events.on('round:closepass',()=>audio.closePass());
 game.events.on('round:bump',()=>{bumpCount++;});
 game.events.on('round:end',()=>{if(!destroyed){cancel();audio.stop();lab.finish();refresh();}});
 return {start(value){config=value;playing=true;if(scene)scene.startRound(value);},pause(){playing=false;scene?.pauseRound();audio.stop();},resume(){playing=true;scene?.resumeRound();audio.setEnabled($('#control-sound').checked);},destroy(){destroyed=true;cancel();audio.stop();currentScene=null;if(scene)game.destroy(true);}};
});
const lab=createClockPractice({createSession:enginePool.createSession,...venues,initialId:'smf-fractal'});
input=bindControlInput({surfaces:[$('#control-floor')],stick:$('#control-stick'),sprintButton:$('#control-sprint'),
 isPlaying:()=>lab.state==='playing'&&!!currentScene?.running,getMode:mode,
 onFocus:()=>$('#game').focus({preventScroll:true}),
 onSwipe:gesture=>commandSwipe(currentScene.motion,gesture),
 onStick:(vector,sprint)=>{if(currentScene)commandStick(currentScene.motion,vector,sprint);},
 onBrake:immediate=>{if(currentScene?.motion)(immediate?resetMotion:brakeMotion)(currentScene.motion);},
});
function start(){cancel();audio.stop();audio.setEnabled($('#control-sound').checked);lab.start();refresh();$('#game').focus({preventScroll:true});}
function pause(){cancel();if(lab.state==='paused')lab.resume();else lab.pause();refresh();if(lab.state==='playing')$('#game').focus({preventScroll:true});}
listen($('#control-start'),'click',start);
listen($('#control-pause'),'click',pause);
listen($('#control-mode'),'change',()=>{cancel();refresh();});
listen($('#control-stamina'),'change',()=>{cancel();refresh();});
listen($('#control-hand'),'change',()=>{cancel();refresh();});
listen($('#control-venue'),'change',event=>{cancel();audio.stop();lab.select(event.target.value);refresh();});
listen($('#control-sound'),'change',()=>audio.setEnabled($('#control-sound').checked));
bassAction=bindActionButton($('#bass-head'),{isEnabled:()=>lab.state==='playing'&&!!currentScene?.running&&!$('#bass-head').disabled,onActivate:()=>currentScene?.activateBassHead()});
listen(document,'keydown',event=>{
 if(event.target.matches('input,select,textarea'))return;
 if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(event.key)&&lab.state==='playing'&&document.activeElement===$('#game'))event.preventDefault();
 if(event.code==='Escape'&&!event.repeat&&['playing','paused'].includes(lab.state)){event.preventDefault();pause();}
 if(event.code==='KeyB'&&!event.repeat&&lab.state==='playing'){event.preventDefault();currentScene?.activateBassHead();}
 if(['ShiftLeft','ShiftRight'].includes(event.code)&&lab.state==='playing')input.setSprintModifier(true);
});
listen(document,'keyup',event=>{if(['ShiftLeft','ShiftRight'].includes(event.code))input.setSprintModifier(false);});
function suspend(){cancel();lab.pause();audio.stop();refresh();}
listen(document,'visibilitychange',()=>{if(document.hidden)suspend();});
listen(window,'blur',suspend);
listen(window,'resize',cancel);
listen(window,'pagehide',event=>handlePracticePageHide(event,{pause:suspend,dispose:cleanup}));
function cleanup(){if(disposed)return;disposed=true;input.dispose();bassAction?.dispose();listeners.abort();lab.destroy();enginePool.destroy();audio.stop();root.classList.remove('control-lab');}
if(import.meta.hot)import.meta.hot.dispose(cleanup);
refresh();
