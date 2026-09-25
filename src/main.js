import Phaser from 'phaser';
import '../styles.css';
import { GameScene } from './GameScene.js';
import { createAvatar, setOutfit } from './Avatar.js';
import { createAudio } from './audio.js';
import { createStorage } from './storage.js';
import { preventGameKeyDefault } from './input.js';
import { cycleAt } from './festival.js';
import { setupResponsiveLayout } from './layout.js';
import { createRun, startStage, finishStage, chooseUpgrade, upgradeChoices } from './run.js';
import { STAGES } from './stages.js';
import { createScreenState, transition, createScreens } from './screens.js';
const $=s=>document.querySelector(s);
let local;try{local=window.localStorage}catch{}
const rehearsal=import.meta.env.DEV && new URLSearchParams(location.search).has('rehearsal');
const saved=createStorage(local),audio=createAudio();audio.setVolumes(saved.profile.audio);
let scene,run,summary,resultSnapshot,screen=createScreenState(),toastTimer,previewAvatar,previewReady=false;
const fmt=n=>String(n).padStart(3,'0');
const game=new Phaser.Game({type:Phaser.AUTO,parent:'game',width:960,height:640,backgroundColor:'#102430',scene:GameScene,scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH},render:{antialias:true},audio:{noAudio:true},banner:false});
const refreshLayout=setupResponsiveLayout(game);
const preview=new Phaser.Game({type:Phaser.CANVAS,parent:'avatar-preview',width:180,height:180,transparent:true,audio:{noAudio:true},banner:false,fps:{target:30},scene:{create(){previewAvatar=createAvatar(this,saved.profile.outfit);previewAvatar.setPosition(90,135).setScale(2);previewReady=true;}}});
const menus=createScreens($('#menu'),{action,volume,outfit});
function clearToast(){clearTimeout(toastTimer);$('#toast').textContent=''}
function toast(text,duration=2000){clearToast();$('#toast').textContent=text;toastTimer=setTimeout(clearToast,duration)}
function soundLabel(){$('#sound').textContent=saved.sound?'Sound on':'Sound off';$('#sound').setAttribute('aria-pressed',String(saved.sound))}
function render(){
 soundLabel();$('#best').textContent=fmt(saved.best);
 const playing=screen.name==='playing';document.body.dataset.mode='game';
 $('.game-frame').dataset.menu=screen.name;$('#game').inert=!playing;
 if(scene)scene.menuAmbient=['title','wardrobe'].includes(screen.name);
 for(const el of document.querySelectorAll('.hud,.beat-bar,.game-footer'))el.setAttribute('aria-hidden',String(!playing));
 $('#pause').disabled=!playing;$('#settings').disabled=!['playing','paused','title'].includes(screen.name);
 $('#avatar-preview').hidden=!['title','wardrobe'].includes(screen.name);
 if(previewReady){if($('#avatar-preview').hidden)preview.loop.sleep();else{setOutfit(previewAvatar,saved.profile.outfit);preview.loop.wake()}}
 menus.show(screen.name,{profile:saved.profile,run,summary,stage:STAGES[run?.stageIndex??0],choices:run?upgradeChoices(run):[],returnTo:screen.returnTo});
 if(screen.name==='results'&&run.submitted){$('#save-feedback').textContent=run.submissionMessage;$('#initials').value=run.initials;$('#initials').disabled=true;}
 if(rehearsal&&screen.name==='results'){const b=$('[data-action=submit]');b.disabled=true;b.textContent='Rehearsal · scores disabled';}
 if(screen.name==='title'&&!scene)$('#menu-content').querySelectorAll('button').forEach(b=>b.disabled=true);
 refreshLayout();if(playing)$('#game').focus({preventScroll:true});
}
function go(type,extra={}){const next=transition(screen,{type,...extra});if(next===screen)return false;screen=next;clearToast();render();return true}
function pause(type='PAUSE'){if(screen.name!=='playing')return;scene.pauseRound();audio.stop();go(type)}
function newRun(mode){run=createRun(mode,crypto.randomUUID());summary=null;resultSnapshot=null;}
function begin(){
 if(!scene||!['title','rules'].includes(screen.name))return;
 const config=startStage(run);if(!config)return;
 audio.stop();audio.setEnabled(saved.sound);audio.setVolumes(saved.profile.audio);
 go('START');scene.startRound({...config,outfit:saved.profile.outfit});
 $('#stage-name').textContent=run.mode==='rush'?'QUICK RUSH':`${run.stageIndex+1}/3 · ${config.stage.name.toUpperCase()}`;
}
function action(name,value){
 switch(name){
  case 'rush':if(screen.name!=='title')return;newRun('rush');begin();break;
  case 'festival':if(screen.name!=='title')return;newRun('festival');go('RULES');break;
  case 'start':begin();break;
  case 'resume':if(screen.name!=='paused')return;audio.setEnabled(saved.sound);scene.resumeRound();go('RESUME');break;
  case 'settings':if(screen.name==='playing'){scene.pauseRound();audio.stop()}go('SETTINGS');break;
  case 'mute':saved.saveSound(!saved.sound);audio.setEnabled(saved.sound);render();break;
  case 'wardrobe':go('WARDROBE');break;
  case 'scores':go('SCORES');break;
  case 'back':go('BACK');break;
  case 'exit':go('EXIT');break;
  case 'cancel':go('CANCEL');break;
  case 'confirm':if(screen.name!=='confirmExit')return;scene.pauseRound();audio.stop();run=null;go('CONFIRM');break;
  case 'upgrade':go('UPGRADE');break;
  case 'choose':if(screen.name==='upgrade'&&chooseUpgrade(run,value))go('CHOOSE');break;
  case 'replay':if(screen.name!=='results')return;newRun(run.mode);go('REPLAY');break;
  case 'title':go('TITLE');break;
  case 'submit':{
   if(rehearsal||screen.name!=='results'||!run||run.submitted||!resultSnapshot)return;
   const initials=($('#initials').value.toUpperCase().replace(/[^A-Z0-9]/g,'')+'AAA').slice(0,3);
   const result=saved.submitScore(run.mode,{...resultSnapshot,initials});
   if(result.accepted){run.submitted=true;run.initials=initials;run.submissionMessage=!result.ranked?'Good run! This score did not reach the local top ten.':result.persisted?'Score saved. See you on the next run!':'Saved for this session only — browser storage is unavailable.';render();}
   break;
  }
 }
}
function volume(key,value){const settings={...saved.profile.audio,[key]:value};saved.saveAudio(settings);audio.setVolumes(settings);audio.setEnabled(settings.enabled);$(`#value-${key}`).textContent=`${Math.round(value*100)}%`;if(key==='effects')audio.pickup(1)}
function outfit(key,value){saved.saveOutfit({...saved.profile.outfit,[key]:value});if(previewAvatar)setOutfit(previewAvatar,saved.profile.outfit)}
game.events.on('forest:ready',value=>{scene=value;render()});
$('#pause').addEventListener('click',()=>pause());$('#settings').addEventListener('click',()=>action('settings'));
$('#sound').addEventListener('click',()=>{saved.saveSound(!saved.sound);audio.setEnabled(saved.sound);soundLabel();if(screen.name==='settings')render()});
const fullscreen=$('#fullscreen');fullscreen.hidden=!document.fullscreenEnabled;
fullscreen.addEventListener('click',async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen()}catch{toast('Fullscreen is unavailable in this browser.')}});
document.addEventListener('fullscreenchange',()=>{fullscreen.textContent=document.fullscreenElement?'Exit fullscreen':'Fullscreen'});
document.addEventListener('visibilitychange',()=>{if(document.hidden)pause('HIDDEN')});window.addEventListener('blur',()=>pause('HIDDEN'));
window.addEventListener('keydown',e=>{
 if(e.key==='Escape'&&!e.repeat){if(screen.name==='playing')pause();else if(screen.name==='paused')action('resume');else if(['settings','wardrobe','scores'].includes(screen.name))action('back');else if(screen.name==='confirmExit')action('cancel')}
 if(preventGameKeyDefault(e.key,screen.name==='playing',document.activeElement===$('#game')))e.preventDefault();
});
game.events.on('round:update',round=>{
 $('#score').textContent=fmt((run?.totalScore??0)+round.score);
 const seconds=Math.ceil(round.remainingMs/1000);$('#time').textContent=`${Math.floor(seconds/60)}:${String(seconds%60).padStart(2,'0')}`;$('#time').style.color=seconds<=10?'#f5b3bd':'';
 $('#multiplier').textContent=`${round.multiplier}×`;$('#combo-label').textContent=round.chain?`${round.chain} IN THE FLOW`:'FIND YOUR FLOW';$('#combo-fill').style.width=`${round.chain?Math.max(0,1-round.sincePickupMs/round.rules.comboGraceMs)*100:0}%`;
 const cycle=cycleAt(60000-round.remainingMs),count=Math.ceil(cycle.remainingMs/1000);$('.game-frame').dataset.phase=cycle.phase;
 $('#phase-title').textContent=cycle.phase==='drop'?'BASS DROP':cycle.phase==='build'?'HERE IT COMES':cycle.phase==='ended'?'GOOD WANDER':count?'NEXT DROP':'LAST DANCE';
 $('#phase-detail').textContent=cycle.phase==='ended'?'COMPLETE':cycle.phase==='drop'?`2× POINTS · ${count}s`:cycle.phase==='build'?`IN ${count}…`:count?`${count}s`:'MAKE IT COUNT';
 const progress=cycle.phase==='drop'?cycle.remainingMs/4000:cycle.phase==='build'?1-cycle.remainingMs/3000:1-cycle.remainingMs/15000;$('#phase-fill').style.width=`${Math.max(0,Math.min(1,progress))*100}%`;
 $('#flow-status').textContent=round.flowMs>0&&!round.ended?`✦ FLOW ${Math.ceil(round.flowMs/1000)}s`:'◇ FIND FLOW';$('#flow-status').classList.toggle('active',round.flowMs>0&&!round.ended);
 $('#passes').textContent=round.closePasses;$('#spark-goal').textContent=run?.mode==='festival'?`✦ ${round.pickups} / ${STAGES[run.stageIndex].target} sparks`:`✦ ${round.pickups} sparks`;
 $('#shield-status').textContent=round.shieldsRemaining?'◌ SHIELD READY':'';
 $('#crowd-tip').textContent=round.slowedMs>0&&!round.ended?'Gentle bump · keep moving':`Clean passes = +${round.rules.closePassPoints*cycle.bonus}`;
 if(screen.name==='playing')audio.sync(round);
});
game.events.on('round:phase',phase=>{if(phase==='build')toast('Feel that? Here comes the drop.',2300);if(phase==='drop'){audio.drop();toast('BASS DROP · DOUBLE VIBES',2500)}});
game.events.on('round:flow',()=>{audio.celebrate();toast('FLOW STATE · Sparks come to you')});
game.events.on('round:closepass',()=>audio.closePass());game.events.on('round:bump',()=>{if(scene.phase==='cruise')toast('Easy does it. Keep your flow.',1100)});
game.events.on('round:pickup',({multiplier,celebrate})=>{audio.pickup(multiplier);if(celebrate){audio.celebrate();if(scene.phase==='cruise')toast('You found your people.')}});
game.events.on('round:end',round=>{
 if(!run)return;const result=finishStage(run,round);if(!result)return;
 summary=result;audio.stop();clearToast();if(!rehearsal&&run.mode==='rush')saved.saveBest(run.totalScore);
 if(run.status==='ended')resultSnapshot={id:run.id,score:run.totalScore,stagesCleared:run.stagesCleared,outfit:saved.profile.outfit,completedAt:Date.now()};
 go('END',{qualified:run.status==='upgrade'});$('#announcement').textContent=`Stage complete. ${round.pickups} sparks. ${run.totalScore} total points.`;
});
render();

if(import.meta.env.DEV && rehearsal)import('./rehearsal.js').then(({installRehearsal})=>installRehearsal(()=>scene,()=>screen.name==='playing'));
