import {availablePerks} from './progression.js';
import {WARDROBE} from './wardrobe.js';
import {createOnlineClient,readArcadeConfig} from './online/client.js';
import {createSubmission} from './online/submission.js';
import {createBoard} from './online/board.js';
import {SCORING_VERSION} from './online/version.js';
import {createConsent} from './playtest/consent.js';
import {createPlaytestSession} from './playtest/session.js';
import {createPlaytestSender} from './playtest/transport.js';
import {readOnlineConfig} from './online/config.js';
import Phaser from 'phaser';
import '../styles.css';
import './themes.css';
import {resolveTheme} from './themes.js';
import {applyTheme} from './theme-view.js';
import { GameScene } from './GameScene.js';
import { createAvatar, setOutfit, animateAvatar } from './Avatar.js';
import { createAudio } from './audio.js';
import { createStorage } from './storage.js';
import { preventGameKeyDefault } from './input.js';
import { cycleAt } from './festival.js';
import { setupResponsiveLayout } from './layout.js';
import { createRun, startStage, finishStage, chooseUpgrade, upgradeChoices } from './run.js';
import { STAGES } from './stages.js';
import {bassMovementFactor} from './bass-head.js';
import { bassFactor } from './geometry.js';
import {MYSTERY_EFFECTS} from './mystery.js';
import { createScreenState, transition, createScreens } from './screens.js';
const $=s=>document.querySelector(s);
let local;try{local=window.localStorage}catch{}
const rehearsal=import.meta.env.DEV && new URLSearchParams(location.search).has('rehearsal');
const saved=createStorage(local),audio=createAudio();audio.setVolumes(saved.profile.audio);
const onlineConfig=rehearsal?{enabled:false}:readOnlineConfig(import.meta.env);
const playtest=createPlaytestSession({config:onlineConfig,consent:createConsent({storage:saved}),send:onlineConfig.enabled?createPlaytestSender(onlineConfig.endpoint):async()=>false});
const arcadeConfig=rehearsal?{}:readArcadeConfig(import.meta.env);
const arcade=createOnlineClient(arcadeConfig),board=createBoard(p=>arcade.getBoard(p));
let submission=null;
async function loadBoard(mode){const pending=board.select(mode,SCORING_VERSION);render();if(await pending&&screen.name==='scores')render();}
let replayPending=false;
let activeTheme=applyTheme(resolveTheme(saved.profile.themePreference==='surprise'?undefined:saved.profile.themePreference));
let scene,run,summary,resultSnapshot,screen=createScreenState(),toastTimer,progressReward,previewAvatar,previewReady=false;
const fmt=n=>String(n).padStart(3,'0');
const game=new Phaser.Game({type:Phaser.AUTO,parent:'game',width:960,height:640,backgroundColor:'#102430',scene:GameScene,scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH},render:{antialias:true},audio:{noAudio:true},banner:false});
const refreshLayout=setupResponsiveLayout(game);
const preview=new Phaser.Game({type:Phaser.CANVAS,parent:'avatar-preview',width:180,height:180,transparent:true,audio:{noAudio:true},banner:false,fps:{target:30},scene:{create(){previewAvatar=createAvatar(this,saved.profile.outfit);previewAvatar.setPosition(90,135).setScale(2);previewReady=true;},update(time){if(previewAvatar)animateAvatar(previewAvatar,time,window.matchMedia('(prefers-reduced-motion: reduce)').matches)}}});
const menus=createScreens($('#menu'),{action,volume,outfit});
function clearToast(){clearTimeout(toastTimer);$('#toast').textContent=''}
function toast(text,duration=2000){clearToast();$('#toast').textContent=text;toastTimer=setTimeout(clearToast,duration)}
function soundLabel(){$('#sound').textContent=saved.sound?'Sound on':'Sound off';$('#sound').setAttribute('aria-pressed',String(saved.sound))}
function render(){
 soundLabel();$('#best').textContent=fmt(saved.best);
 const playing=screen.name==='playing';document.body.dataset.mode='game';
 $('.game-frame').dataset.menu=screen.name;$('#game').inert=!playing;
 if(scene)scene.menuAmbient=['title','wardrobe'].includes(screen.name);
 if(scene&&!playing)scene.mysteryView.waves.setVisible(false);
 for(const el of document.querySelectorAll('.hud,.beat-bar,.game-footer'))el.setAttribute('aria-hidden',String(!playing));
 $('#bass-head').hidden=!playing||!scene?.stage.obstacles.length;
 $('#bass-head').disabled=!playing||!scene||scene.round.bass.chargeMs<10000||scene.round.bass.activeMs>0;
 $('#pause').disabled=!playing;$('#settings').disabled=!['playing','paused','title'].includes(screen.name);
 $('#avatar-preview').hidden=screen.name!=='wardrobe';
 if(previewReady){if($('#avatar-preview').hidden)preview.loop.sleep();else{setOutfit(previewAvatar,saved.profile.outfit);preview.loop.wake()}}
 menus.show(screen.name,{progressReward,onlineSubmission:submission,onlineInput:playtest.inputType(),onlineBoard:arcadeConfig.baseUrl?board:null,playtestAvailable:onlineConfig.enabled,themeId:activeTheme,profile:saved.profile,run,summary,stage:STAGES[run?.stageIndex??0],choices:run?upgradeChoices(run):[],returnTo:screen.returnTo});
 if(screen.name==='results'&&run.submitted){$('#save-feedback').textContent=run.submissionMessage;$('#initials').value=run.initials;$('#initials').disabled=true;}
 if(screen.name==='results'&&submission?.initials){$('#initials').value=submission.initials;$('#initials').disabled=true;}
 if(rehearsal&&screen.name==='results'){const b=$('[data-action=submit]');b.disabled=true;b.textContent='Rehearsal · scores disabled';}
 if(screen.name==='title'&&!scene)$('#menu-content').querySelectorAll('button').forEach(b=>b.disabled=true);
 refreshLayout();if(playing)$('#game').focus({preventScroll:true});
}
function go(type,extra={}){const next=transition(screen,{type,...extra});if(next===screen)return false;screen=next;clearToast();render();return true}
function pause(type='PAUSE'){if(screen.name!=='playing')return;scene.pauseRound();audio.stop();go(type)}
function newRun(mode){activeTheme=applyTheme(resolveTheme(saved.profile.themePreference));run=createRun(mode,crypto.randomUUID(),activeTheme);run.availablePerks=availablePerks(saved.profile.progress);summary=null;progressReward=null;resultSnapshot=null;submission=null;}
function begin(){
 if(!scene||!['title','rules'].includes(screen.name))return;
 const config=startStage(run);if(!config)return;
 if(run.stageIndex===0){playtest.start(run,replayPending);replayPending=false;
  if(arcadeConfig.baseUrl){const owner=run.id,current=createSubmission(owner);submission=current;void arcade.startRun({runId:owner,mode:run.mode,scoringVersion:SCORING_VERSION,buildId:arcadeConfig.buildId}).then(result=>{if(run?.id!==owner||submission!==current)return;current.setTicket(owner,result.ok?result.data:null);if(screen.name==='results')render();});}
 }
 playtest.stageStart(run.stageIndex);
 audio.stop();audio.setEnabled(saved.sound);audio.setVolumes(saved.profile.audio);
 go('START');scene.startRound({...config,runId:run.id,outfit:saved.profile.outfit});refreshLayout();
 $('#stage-name').textContent=run.mode==='rush'?'QUICK RUSH':`${run.stageIndex+1}/3 · ${config.stage.name.toUpperCase()}`;
}
function action(name,value){
 switch(name){
  case 'playtest-accept':case 'playtest-decline':{
   const result=playtest.setConsent(name==='playtest-accept'?'accepted':'declined');render();
   $('#announcement').textContent=result.persisted?'Playtest sharing preference saved.':'Preference applies for this session; browser storage is unavailable.';break;
  }
  case 'playtest-notice':if(onlineConfig.enabled)window.open(onlineConfig.notice,'_blank','noopener,noreferrer');break;
  case 'rush':if(screen.name!=='title')return;newRun('rush');begin();break;
  case 'festival':if(screen.name!=='title')return;newRun('festival');playtest.menu('instructions',activeTheme);go('RULES');break;
  case 'start':begin();break;
  case 'resume':if(screen.name!=='paused')return;audio.setEnabled(saved.sound);scene.resumeRound();go('RESUME');break;
  case 'settings':if(screen.name==='playing'){scene.pauseRound();audio.stop()}go('SETTINGS');break;
  case 'mute':saved.saveSound(!saved.sound);audio.setEnabled(saved.sound);render();break;
  case 'style':go('STYLE');break;
  case 'theme':{
   if(screen.name!=='style')return;
   const result=saved.saveTheme(value);if(!result.accepted)return;
   if(value!=='surprise')activeTheme=applyTheme(value);
   playtest.menu('theme',activeTheme);
   render();
   requestAnimationFrame(()=>document.querySelector(`[data-action=theme][data-value="${value}"]`)?.focus({preventScroll:true}));
   $('#style-feedback').textContent=result.persisted?'Your festival style is saved.':'Style selected for this session. Browser storage is unavailable.';
   break;
  }
  case 'preview-outfit':{
   if(screen.name!=='wardrobe')return;
   const [key,id]=value.split(':');const item=WARDROBE[key]?.find(o=>o.id===id);if(!item)return;
   setOutfit(previewAvatar,{...saved.profile.outfit,[key]:id});$('#outfit-feedback').textContent=`Previewing ${item.name} · not equipped. Choose an available item to return to your outfit.`;break;
  }
  case 'wardrobe':go('WARDROBE');break;
  case 'scores':if(go('SCORES')&&arcadeConfig.baseUrl)void loadBoard(run?.mode||'rush');break;
  case 'online-board':if(screen.name==='scores'&&['rush','festival'].includes(value))void loadBoard(value);break;
  case 'post-online':{
   if(rehearsal||screen.name!=='results'||!run||!submission)return;
   const initials=$('#initials').value.toUpperCase();if(!/^[A-Z0-9]{3}$/.test(initials)){toast('Enter three letters or digits first.');return;}
   const owner=run.id,current=submission;const pending=current.post({initials,mode:run.mode,scoringVersion:SCORING_VERSION,buildId:arcadeConfig.buildId,inputType:playtest.inputType(),totalScore:run.totalScore,stagesCleared:run.stagesCleared,stages:run.scoreStages},p=>arcade.submitScore(p));render();
   void pending.then(()=>{if(run?.id===owner&&submission===current&&screen.name==='results')render();});break;
  }
  case 'back':go('BACK');break;
  case 'exit':go('EXIT');break;
  case 'cancel':go('CANCEL');break;
  case 'confirm':if(screen.name!=='confirmExit')return;scene.pauseRound();audio.stop();playtest.end(run,'exit');void playtest.flush();run=null;go('CONFIRM');break;
  case 'upgrade':go('UPGRADE');break;
  case 'choose':if(screen.name==='upgrade'&&chooseUpgrade(run,value)){playtest.perk(value);go('CHOOSE');}break;
  case 'replay':if(screen.name!=='results')return;replayPending=true;newRun(run.mode);go('REPLAY');break;
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
function outfit(key,value){const result=saved.saveOutfit({...saved.profile.outfit,[key]:value});if(result.accepted&&previewAvatar){setOutfit(previewAvatar,saved.profile.outfit);$('#outfit-feedback').textContent=result.persisted?'Outfit saved.':'Selected for this session; browser storage is unavailable.'}}
game.events.on('forest:ready',value=>{scene=value;render()});
$('#bass-head').addEventListener('click',e=>{if(screen.name==='playing'){if(scene.activateBassHead())playtest.input(e.pointerType==='touch'?'touch':e.detail===0?'keyboard':'mouse');$('#game').focus({preventScroll:true});}});
$('#pause').addEventListener('click',()=>pause());$('#settings').addEventListener('click',()=>action('settings'));
$('#sound').addEventListener('click',()=>{saved.saveSound(!saved.sound);audio.setEnabled(saved.sound);soundLabel();if(screen.name==='settings')render()});
const fullscreen=$('#fullscreen');fullscreen.hidden=!document.fullscreenEnabled;
fullscreen.addEventListener('click',async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen()}catch{toast('Fullscreen is unavailable in this browser.')}});
document.addEventListener('fullscreenchange',()=>{fullscreen.textContent=document.fullscreenElement?'Exit fullscreen':'Fullscreen'});
document.addEventListener('visibilitychange',()=>{if(document.hidden){pause('HIDDEN');void playtest.flush();}});
setInterval(()=>{if(screen.name==='playing')void playtest.flush();},30000);window.addEventListener('blur',()=>pause('HIDDEN'));
window.addEventListener('keydown',e=>{
 if(e.key.toLowerCase()==='b'&&!e.repeat&&!e.ctrlKey&&!e.metaKey&&!e.altKey&&screen.name==='playing'){if(scene.activateBassHead())playtest.input('keyboard');e.preventDefault();}
 if(e.key==='Escape'&&!e.repeat){if(screen.name==='playing')pause();else if(screen.name==='paused')action('resume');else if(['settings','wardrobe','scores','style'].includes(screen.name))action('back');else if(screen.name==='confirmExit')action('cancel')}
 if(preventGameKeyDefault(e.key,screen.name==='playing',document.activeElement===$('#game')))e.preventDefault();
});
game.events.on('round:input',({kind,runId})=>playtest.input(kind,runId));
game.events.on('round:measure',data=>playtest.record('tick',data));
game.events.on('round:contact',data=>playtest.record('bump',data));
game.events.on('round:closepass',data=>playtest.record('closepass',data));
game.events.on('round:pickup',data=>playtest.record('pickup',data));
game.events.on('round:flow',data=>playtest.record('flow',data));
game.events.on('round:bass',data=>playtest.record('bass',data));
game.events.on('playtest:candy',data=>playtest.record('candy',data));
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
 const mystery=round.mystery;
 $('#effect-status').hidden=!mystery.effect;
 $('#effect-status').textContent=mystery.effect?`${MYSTERY_EFFECTS[mystery.effect].name} · ${Math.ceil(mystery.effectMs/1000)}s`:'';
 const ability=round.bass,button=$('#bass-head');
 button.hidden=screen.name!=='playing'||!scene?.stage.obstacles.length;
 button.disabled=screen.name!=='playing'||round.ended||ability.activeMs>0||ability.chargeMs<10000;
 button.textContent=ability.activeMs>0?`Bass Head · ${Math.ceil(ability.activeMs/1000)}s`:ability.chargeMs>=10000?'Bass Head · Activate [B]':`Bass Head · ${Math.floor(ability.chargeMs/100)}%`;
 button.style.setProperty('--bass-charge',`${ability.chargeMs/100}%`);
 button.classList.toggle('ready',ability.chargeMs>=10000);
 const bass=scene?bassFactor(scene.dancer,scene.stage.obstacles):1;
 $('#crowd-tip').textContent=bass<1&&!round.ended?`Bass pressure · ${Math.round(bassMovementFactor(round.bass,bass)*100)}% speed`:round.slowedMs>0&&!round.ended?'Gentle bump · keep moving':`Clean passes = +${round.rules.closePassPoints*cycle.bonus}`;
 if(screen.name==='playing')audio.sync(round,scene.stage.id);
});
game.events.on('round:phase',phase=>{if(phase==='build')toast('Feel that? Here comes the drop.',2300);if(phase==='drop'){audio.drop();toast('BASS DROP · DOUBLE VIBES',2500)}});
game.events.on('round:bass',()=>{scene.round.bassUses=(scene.round.bassUses||0)+1;toast('BASS HEAD · Bass immunity + 2× zone sparks');$('#announcement').textContent='Bass Head active for six seconds.';});
game.events.on('round:flow',()=>{audio.celebrate();toast('FLOW STATE · Sparks come to you')});
game.events.on('round:mystery',effect=>{
 const info=MYSTERY_EFFECTS[effect];
 toast(`${info.name} · ${info.hint}`,1800);
 $('#announcement').textContent=`Mystery candy: ${info.name}. ${info.hint}. Five seconds.`;
});
game.events.on('round:closepass',()=>audio.closePass());game.events.on('round:bump',()=>{if(scene.phase==='cruise')toast('Easy does it. Keep your flow.',1100)});
game.events.on('round:pickup',({multiplier,celebrate})=>{audio.pickup(multiplier);if(celebrate){audio.celebrate();if(scene.phase==='cruise')toast('You found your people.')}});
game.events.on('round:end',round=>{
 if(!run||round.runId!==run.id)return;const result=finishStage(run,round);if(!result)return;
 playtest.finishStage(run.stageIndex,{score:round.score,qualified:result.qualified});
 if(run.status==='ended')playtest.end(run);
 void playtest.flush();
 progressReward=rehearsal?null:saved.awardProgress({id:`${run.id}:${run.stageIndex}`,pickups:round.pickups,passes:round.closePasses,flows:round.flowTaken.length,bass:round.bassUses||0,qualified:result.qualified,festivalComplete:run.mode==='festival'&&run.stagesCleared===3});
 run.availablePerks=availablePerks(saved.profile.progress);
 summary=result;audio.stop();clearToast();if(!rehearsal&&run.mode==='rush')saved.saveBest(run.totalScore);
 if(run.status==='ended')resultSnapshot={id:run.id,score:run.totalScore,stagesCleared:run.stagesCleared,inputType:playtest.inputType(),outfit:saved.profile.outfit,completedAt:Date.now()};
 go('END',{qualified:run.status==='upgrade'});$('#announcement').textContent=`Stage complete. ${round.pickups} sparks. ${run.totalScore} total points.`;
});
render();

if(import.meta.env.DEV && rehearsal)import('./rehearsal.js').then(({installRehearsal})=>installRehearsal(()=>scene,()=>screen.name==='playing'));
