import {getTiming,roundTiming,elapsedMs,phaseProgress} from './stage-clock.js';
import {GENERIC_RULES} from '../supabase/functions/_shared/edition-rules.js';
import {getEdition,editionIdFromEnv,editionServices} from './editions/registry.js';
import {storageContext} from './editions/storage-context.js';
import {makeRecovery,readRecovery} from './recovery.js';
import {createRecoveryOwner} from './recovery-owner.js';
import {createRecoveryController} from './recovery-controller.js';
import {createInputTracker} from './playtest/summary.js';
import {awardStage} from './progression.js';
import {resultsExitState} from './results-view.js';
import {availablePerks} from './progression.js';
import {renderReward} from './progression-view.js';
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
import './editions/brand.css';
import {resolveTheme} from './themes.js';
import {applyTheme} from './theme-view.js';
import { GameScene } from './GameScene.js';
import { createAvatar, setOutfit, animateAvatar } from './Avatar.js';
import { createAudio } from './audio.js';
import { createStorage } from './storage.js';
import { preventGameKeyDefault } from './input.js';
import { cycleAt } from './festival.js';
import { setupResponsiveLayout } from './layout.js';
import { PERKS, createRun, startStage, finishStage, finishRun, chooseUpgrade, keepPerks, stageFor, upgradeChoices, rulesFor, stageLabel } from './run.js';
import { STAGES } from './stages.js';
import {bassMovementFactor} from './bass-head.js';
import {updateBassButton,activationInput} from './bass-view.js';
import { bassFactor } from './geometry.js';
import {MYSTERY_EFFECTS} from './mystery.js';
import { createScreenState, transition, createScreens } from './screens.js';
const edition=getEdition(editionIdFromEnv(import.meta.env));
const $=s=>document.querySelector(s);
let local;try{local=window.localStorage}catch{}
const rehearsal=import.meta.env.DEV && new URLSearchParams(location.search).has('rehearsal');
const recoveryLab=import.meta.env.DEV && rehearsal && new URLSearchParams(location.search).has('recovery');
const rewardLab=import.meta.env.DEV && rehearsal && new URLSearchParams(location.search).has('rewards');
const candyLab=import.meta.env.DEV && rehearsal && new URLSearchParams(location.search).has('candy');
const bassLab=import.meta.env.DEV && rehearsal && new URLSearchParams(location.search).has('bass');
const context=storageContext(edition,{rehearsal,recoveryLab});
// Every rehearsal uses a disposable profile; only recovery practice persists in its own namespace.
const recoveryPractice=recoveryLab?await import('./recovery-practice.js'):null;
const profileStorage=recoveryLab?recoveryPractice.practiceStorage(local,context):rehearsal?{getItem:()=>null,setItem:()=>{}}:local;
const recoveryOwner=createRecoveryOwner({locks:!rehearsal||recoveryLab?navigator.locks:null,name:context.lockName});
const ownership=!rehearsal||recoveryLab?await recoveryOwner.acquire():'unsupported';
const saved=createStorage(profileStorage,{context,canWrite:()=>!recoveryOwner.supported||recoveryOwner.held}),audio=createAudio();audio.setVolumes(saved.profile.audio);
const services=editionServices(edition,import.meta.env,{rehearsal});
const onlineConfig=services.playtestEnabled?readOnlineConfig(import.meta.env):{enabled:false};
const playtest=createPlaytestSession({config:onlineConfig,consent:createConsent({storage:saved}),send:onlineConfig.enabled?createPlaytestSender(onlineConfig.endpoint):async()=>false});
const arcadeConfig=services.arcadeEnabled?readArcadeConfig(import.meta.env):{};
const arcade=createOnlineClient(arcadeConfig),board=createBoard(p=>arcade.getBoard(p));
let submission=null;
async function loadBoard(mode){const pending=board.select(mode,SCORING_VERSION);render();if(await pending&&screen.name==='scores')render();}
let replayPending=false;
let activeTheme=applyTheme(resolveTheme(saved.profile.themePreference==='surprise'?undefined:saved.profile.themePreference));
let scene,run,summary,resultSnapshot,screen=createScreenState(),toastTimer,progressReward,previewAvatar,previewReady=false;
let runInputs=createInputTracker(),recoveryRecord=null,recoveredRun=false;
if(ownership==='busy')screen={name:'recoveryBusy'};
else if(recoveryOwner.held&&saved.recovery!==null){recoveryRecord=readRecovery(saved.recovery,{editionId:edition.id});screen={name:recoveryRecord.ok?'recovery':'recoveryInvalid'};}
const recoveryNotice=document.createElement('p');recoveryNotice.id='recovery-notice';recoveryNotice.setAttribute('role','status');recoveryNotice.hidden=true;document.querySelector('.game-frame').append(recoveryNotice);
const recovery=createRecoveryController({owner:recoveryOwner,storage:saved,capture:captureCheckpoint,onStatus:state=>{recoveryNotice.hidden=state==='saved'||rehearsal&&!recoveryLab;recoveryNotice.textContent=state==='saved'?'':'Run recovery unavailable; keep this page open.';}});
if(ownership==='unsupported'&&(!rehearsal||recoveryLab)){recoveryNotice.hidden=false;recoveryNotice.textContent='Run recovery unavailable; keep this page open.';}
function captureCheckpoint(){
 if(run?.mode!=='endless'||!scene||['recovery','discardRecovery','recoveryInvalid','recoveryBusy'].includes(screen.name))return undefined;
 if(run.status==='playing'&&(scene.round.runId!==run.id||scene.round.ended))return undefined;
 return makeRecovery({run,screen,scene:run.status==='playing'?scene.captureRecovery():null,summary:summary||null,resultSnapshot:resultSnapshot||null,progressReward:progressReward?{xp:progressReward.xp,rewards:progressReward.rewards,persisted:progressReward.persisted}:null,submission,inputType:runInputs.inputType(),buildId:run.buildId});
}
function recordInput(kind,id=run?.id){if(id===run?.id)runInputs.recordInput(kind);playtest.input(kind,id);}
function restoreRun(){
 if(!scene||!recoveryRecord?.ok||!recovery.canWrite)return;
 const v=recoveryRecord.value;recoveredRun=true;run=structuredClone(v.run);summary=v.summary;resultSnapshot=v.resultSnapshot;progressReward=v.progressReward;
 activeTheme=applyTheme(run.themeId);submission=v.submission?createSubmission(run.id,v.submission):null;runInputs=createInputTracker();
 if(v.inputType==='mixed'){runInputs.recordInput('mouse');runInputs.recordInput('touch');}else runInputs.recordInput(v.inputType);
 playtest.recover();screen={name:v.screen,returnTo:'title'};
 if(v.scene)scene.restoreRecovery(v.scene,{stage:stageFor(run),rules:rulesFor(run.perks),outfit:saved.profile.outfit});
 $('#stage-name').textContent=stageLabel(run);
 render();recovery.save(true);
}

const fmt=n=>String(n).padStart(3,'0');
const game=new Phaser.Game({type:Phaser.AUTO,parent:'game',width:960,height:640,backgroundColor:'#102430',scene:GameScene,scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH},render:{antialias:true},audio:{noAudio:true},banner:false});
const refreshLayout=setupResponsiveLayout(game);
const preview=new Phaser.Game({type:Phaser.CANVAS,parent:'avatar-preview',width:240,height:240,transparent:true,audio:{noAudio:true},banner:false,fps:{target:30},scene:{create(){previewAvatar=createAvatar(this,saved.profile.outfit);previewAvatar.setPosition(105,147).setScale(2.5);previewReady=true;},update(time){if(previewAvatar)animateAvatar(previewAvatar,time,window.matchMedia('(prefers-reduced-motion: reduce)').matches,cycleAt(time%60000).phase==='drop')}}});
const menus=createScreens($('#menu'),{action,volume,outfit,initials:value=>{if(run){run.initialsDraft=value;recovery.save(true);}}});
function clearToast(){clearTimeout(toastTimer);$('#toast').textContent=''}
function toast(text,duration=2000){clearToast();$('#toast').textContent=text;toastTimer=setTimeout(clearToast,duration)}
function soundLabel(){$('#sound').textContent=saved.sound?'Sound on':'Sound off';$('#sound').setAttribute('aria-pressed',String(saved.sound))}
function render(){
 soundLabel();$('#best').textContent=fmt(saved.best);
 const playing=screen.name==='playing';document.body.dataset.mode='game';
 $('.game-frame').dataset.menu=screen.name;$('.game-frame').dataset.recoveredPaused=String(recoveredRun&&screen.name==='paused');$('#game').inert=!playing;
 if(scene)scene.menuAmbient=['title','wardrobe'].includes(screen.name);
 if(scene&&!playing)scene.mysteryView.waves.setVisible(false);
 for(const el of document.querySelectorAll('.hud,.beat-bar,.game-footer'))el.setAttribute('aria-hidden',String(!playing));
 updateBassButton($('#bass-head'),scene?.round.bass,{playing,hasSpeakers:!!scene?.stage.obstacles.length});
 $('#pause').disabled=!playing;$('#settings').disabled=!['playing','paused','title'].includes(screen.name);
 $('#avatar-preview').hidden=screen.name!=='wardrobe';
 if(previewReady){if($('#avatar-preview').hidden)preview.loop.sleep();else{setOutfit(previewAvatar,saved.profile.outfit);preview.loop.wake()}}
 $('#avatar-preview-label').textContent='Your festival look';
 $('#avatar-preview').setAttribute('aria-label','Your festival look');
 menus.show(screen.name,{recovery:recoveryRecord,progressReward,onlineSubmission:submission,onlineInput:runInputs.inputType(),onlineBoard:arcadeConfig.baseUrl?board:null,playtestAvailable:onlineConfig.enabled,themeId:activeTheme,profile:saved.profile,run,summary,stage:run?stageFor(run):STAGES[0],choices:run?upgradeChoices(run):[],returnTo:screen.returnTo});
 if(rewardLab&&screen.name==='wardrobe'){$('#outfit-feedback').textContent='Reward preview · temporary profile · reload to reset. Real progress is untouched.';if(progressReward)$('#outfit-feedback').insertAdjacentHTML('afterend',renderReward(progressReward));}
 if(screen.name==='results'&&run.submitted){$('#save-feedback').textContent=run.submissionMessage||'Score saved on this device.';$('#initials').value=run.initials;$('#initials').disabled=true;}
 if(screen.name==='results'&&submission?.initials){$('#initials').value=submission.initials;$('#initials').disabled=true;}
 if(rehearsal&&!recoveryLab&&screen.name==='results'){const b=$('[data-action=submit]');b.disabled=true;b.textContent='Rehearsal · scores disabled';}
 if(['title','recovery'].includes(screen.name)&&!scene)$('#menu-content').querySelectorAll('button').forEach(b=>b.disabled=true);
 refreshLayout();if(playing)$('#game').focus({preventScroll:true});
}
function go(type,extra={}){const next=transition(screen,{type,...extra});if(next===screen)return false;screen=next;clearToast();render();recovery.save(true);return true}
function pause(type='PAUSE'){if(screen.name!=='playing')return;scene.pauseRound();audio.stop();go(type)}
function newRun(mode){recoveredRun=false;runInputs=createInputTracker();activeTheme=applyTheme(resolveTheme(saved.profile.themePreference));run=createRun(mode,crypto.randomUUID(),activeTheme);run.buildId=arcadeConfig.buildId||'dev';run.availablePerks=rehearsal?Object.keys(PERKS):availablePerks(saved.profile.progress);summary=null;progressReward=null;resultSnapshot=null;submission=null;}
function begin(){
 if(!scene||!['title','rules'].includes(screen.name))return;
 const config=startStage(run);if(!config)return;
 if(run.stageIndex===0){playtest.start(run,replayPending);replayPending=false;
  if(arcadeConfig.baseUrl){const owner=run.id,current=createSubmission(owner),token=recovery.token();submission=current;void arcade.startRun({runId:owner,mode:run.mode,scoringVersion:SCORING_VERSION,buildId:run.buildId}).then(result=>{if(!recovery.valid(token)||run?.id!==owner||submission!==current)return;current.setTicket(owner,result.ok?result.data:null);recovery.save(true);if(screen.name==='results')render();});}
 }
 playtest.stageStart(run.stageIndex,config.stage.variationId);
 audio.stop();audio.setEnabled(saved.sound);audio.setVolumes(saved.profile.audio);
 go('START');scene.startRound({...config,runId:run.id,outfit:saved.profile.outfit});recovery.save(true);refreshLayout();
 $('#stage-name').textContent=stageLabel(run);
}
function captureResult(){resultSnapshot={id:run.id,score:run.totalScore,stagesCleared:run.stagesCleared,inputType:runInputs.inputType(),outfit:saved.profile.outfit,completedAt:Date.now()};}
function navigateResults(destination,confirmed=false){
 if(screen.name!=='results'||!run)return;
 const state=resultsExitState(run,submission);
 if(state==='pending'){toast('Wait for posting to finish before leaving.');return;}
 if(!confirmed&&state==='unsaved'){go('LEAVE',{destination});return;}
 recovery.clear();
 if(destination==='replay'){replayPending=true;newRun(run.mode);go('REPLAY');}else{run=null;go('TITLE');}
}
function action(name,value){
 if(!recovery.canWrite){if(name==='recovery-retry')location.reload();return;}
 if(name==='recover-resume'){restoreRun();return;}
 if(name==='recover-discard'){screen={name:'discardRecovery'};render();return;}
 if(name==='recovery-cancel'){screen={name:'recovery'};render();return;}
 if(name==='recovery-discard-confirm'){recovery.clear();recoveryRecord=null;screen=createScreenState();run=null;render();return;}
 switch(name){
  case 'playtest-accept':case 'playtest-decline':{
   const result=playtest.setConsent(name==='playtest-accept'?'accepted':'declined');render();
   $('#announcement').textContent=result.persisted?'Playtest sharing preference saved.':'Preference applies for this session; browser storage is unavailable.';break;
  }
  case 'playtest-notice':if(onlineConfig.enabled)window.open(onlineConfig.notice,'_blank','noopener,noreferrer');break;
  case 'rush':if(screen.name!=='title')return;newRun('rush');begin();break;
  case 'endless':if(screen.name!=='title')return;newRun('endless');go('RULES');break;
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
   if(screen.name!=='wardrobe'||!previewReady)return;
   const [key,id]=value.split(':');const item=WARDROBE[key]?.find(o=>o.id===id);if(!item)return;
   setOutfit(previewAvatar,{...saved.profile.outfit,[key]:id});$('#avatar-preview-label').textContent=item.name;$('#avatar-preview').setAttribute('aria-label',`Previewing ${item.name}`);$('#outfit-feedback').textContent=`Previewing ${item.name} · not equipped. Choose an available item to return to your outfit.`;break;
  }
  case 'wardrobe':go('WARDROBE');break;
  case 'scores':if(go('SCORES')&&arcadeConfig.baseUrl)void loadBoard(run?.mode||'rush');break;
  case 'online-board':if(screen.name==='scores'&&['rush','festival','endless'].includes(value))void loadBoard(value);break;
  case 'post-online':{
   if(rehearsal||screen.name!=='results'||!run||run.scoreOverflow||!submission)return;
   const initials=$('#initials').value.toUpperCase();if(!/^[A-Z0-9]{3}$/.test(initials)){toast('Enter three letters or digits first.');return;}
   const owner=run.id,current=submission,token=recovery.token();const pending=current.post({initials,mode:run.mode,scoringVersion:SCORING_VERSION,buildId:run.buildId||arcadeConfig.buildId,inputType:runInputs.inputType(),totalScore:run.totalScore,stagesCleared:run.stagesCleared,stages:run.scoreStages},p=>arcade.submitScore(p));recovery.save(true);render();
   void pending.then(()=>{if(!recovery.valid(token)||run?.id!==owner||submission!==current)return;recovery.save(true);if(screen.name==='results')render();});break;
  }
  case 'back':go('BACK');break;
  case 'exit':go('EXIT');break;
  case 'cancel':go('CANCEL');break;
  case 'confirm':{
   if(screen.name!=='confirmExit')return;
   scene.pauseRound();audio.stop();
   if(finishRun(run)){captureResult();playtest.end(run,'exit');void playtest.flush();go('FINISH');}
   else{playtest.end(run,'exit');void playtest.flush();run=null;recovery.clear();go('CONFIRM');}
   break;
  }
  case 'leave-confirm':{
   if(screen.name!=='confirmLeave')return;const destination=screen.destination;go('LEAVE_CONFIRMED');navigateResults(destination,true);break;
  }
  case 'upgrade':go('UPGRADE');break;
  case 'choose':
   if(screen.name!=='upgrade')return;
   if(run.mode==='endless'&&run.perks.length===4&&upgradeChoices(run).includes(value)){run.pendingPerk=value;render();recovery.save(true);break;}
   if(chooseUpgrade(run,value)){if(run.mode==='endless')playtest.choice(run,'add',value);else playtest.perk(value);go('CHOOSE');}break;
  case 'replace':{if(screen.name!=='upgrade'||run.mode!=='endless')return;const taken=run.pendingPerk;if(chooseUpgrade(run,taken,value)){playtest.choice(run,'swap',taken,value);go('CHOOSE');}break;}
  case 'cancel-swap':if(screen.name==='upgrade'&&run.mode==='endless'){run.pendingPerk=null;render();recovery.save(true);}break;
  case 'keep-perks':if(screen.name==='upgrade'&&keepPerks(run)){playtest.choice(run,'keep');go('CHOOSE');}break;
  case 'replay':navigateResults('replay');break;
  case 'title':navigateResults('title');break;
  case 'submit':{
   if(rehearsal&&!recoveryLab||screen.name!=='results'||!run||run.submitted||!resultSnapshot)return;
   const initials=($('#initials').value.toUpperCase().replace(/[^A-Z0-9]/g,'')+'AAA').slice(0,3);
   const before=run.submitted;run.submitted=true;run.initials=initials;
   const result=run.mode==='endless'?recovery.commitScore(run.mode,{...resultSnapshot,initials}):saved.submitScore(run.mode,{...resultSnapshot,initials});
   if(!result.accepted)run.submitted=before;
   if(result.accepted){run.submissionMessage=!result.ranked?'Good run! This score did not reach the local top ten.':result.persisted?'Score saved. See you on the next run!':'Saved for this session only — browser storage is unavailable.';render();}
   break;
  }
 }
}
function volume(key,value){if(!recovery.canWrite)return;const settings={...saved.profile.audio,[key]:value};saved.saveAudio(settings);audio.setVolumes(settings);audio.setEnabled(settings.enabled);$(`#value-${key}`).textContent=`${Math.round(value*100)}%`;if(key==='effects')audio.pickup(1)}
function outfit(key,value){if(!recovery.canWrite)return;const result=saved.saveOutfit({...saved.profile.outfit,[key]:value});if(result.accepted&&previewAvatar){setOutfit(previewAvatar,saved.profile.outfit);$('#avatar-preview-label').textContent=WARDROBE[key].find(o=>o.id===value)?.name||'Your festival look';$('#outfit-feedback').textContent=rewardLab?'Equipped in temporary reward profile.':result.persisted?'Outfit saved.':'Selected for this session; browser storage is unavailable.'}}
game.events.on('forest:ready',value=>{scene=value;render()});
let lastBassPointer;
$('#bass-head').addEventListener('pointerdown',e=>{lastBassPointer=e.pointerType;});
$('#bass-head').addEventListener('click',e=>{if(screen.name==='playing'){if(scene.activateBassHead())recordInput(activationInput(e,lastBassPointer));$('#game').focus({preventScroll:true});}});
$('#pause').addEventListener('click',()=>pause());$('#settings').addEventListener('click',()=>action('settings'));
$('#sound').addEventListener('click',()=>{if(!recovery.canWrite)return;saved.saveSound(!saved.sound);audio.setEnabled(saved.sound);soundLabel();if(screen.name==='settings')render()});
const fullscreen=$('#fullscreen');fullscreen.hidden=!document.fullscreenEnabled;
fullscreen.addEventListener('click',async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen()}catch{toast('Fullscreen is unavailable in this browser.')}});
document.addEventListener('fullscreenchange',()=>{fullscreen.textContent=document.fullscreenElement?'Exit fullscreen':'Fullscreen'});
document.addEventListener('visibilitychange',()=>{if(document.hidden){pause('HIDDEN');void playtest.flush();}});
setInterval(()=>{if(screen.name==='playing')void playtest.flush();},30000);window.addEventListener('blur',()=>pause('HIDDEN'));
window.addEventListener('keydown',e=>{
 if(e.key.toLowerCase()==='b'&&!e.repeat&&!e.ctrlKey&&!e.metaKey&&!e.altKey&&screen.name==='playing'){if(scene.activateBassHead())recordInput('keyboard');e.preventDefault();}
 if(e.key==='Escape'&&!e.repeat){if(screen.name==='playing')pause();else if(screen.name==='paused')action('resume');else if(['settings','wardrobe','scores','style'].includes(screen.name))action('back');else if(['confirmExit','confirmLeave'].includes(screen.name))action('cancel')}
 if(preventGameKeyDefault(e.key,screen.name==='playing',document.activeElement===$('#game')))e.preventDefault();
});
game.events.on('round:input',({kind,runId})=>recordInput(kind,runId));
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
 const timing=roundTiming(round),timed=timing!==getTiming(),elapsed=elapsedMs(round),cycle=cycleAt(elapsed,timing),count=Math.ceil(cycle.remainingMs/1000);$('.game-frame').dataset.phase=cycle.phase;
 $('#phase-title').textContent=cycle.phase==='drop'?(timed?'2× VIBES':'BASS DROP'):cycle.phase==='build'?'HERE IT COMES':cycle.phase==='ended'?'GOOD WANDER':count?(timed?'NEXT LIFT':'NEXT DROP'):'LAST DANCE';
 $('#phase-detail').textContent=cycle.phase==='ended'?'COMPLETE':cycle.phase==='drop'?`2× POINTS · ${count}s`:cycle.phase==='build'?`IN ${count}…`:count?`${count}s`:'MAKE IT COUNT';
 const progress=timed?phaseProgress(elapsed,timing):cycle.phase==='drop'?cycle.remainingMs/4000:cycle.phase==='build'?1-cycle.remainingMs/3000:1-cycle.remainingMs/15000;$('#phase-fill').style.width=`${Math.max(0,Math.min(1,progress))*100}%`;
 $('#flow-status').textContent=round.flowMs>0&&!round.ended?`✦ FLOW ${Math.ceil(round.flowMs/1000)}s`:'◇ FIND FLOW';$('#flow-status').classList.toggle('active',round.flowMs>0&&!round.ended);
 $('#passes').textContent=round.closePasses;$('#spark-goal').textContent=run&&run.mode!=='rush'?`✦ ${round.pickups} / ${stageFor(run).target} sparks`:`✦ ${round.pickups} sparks`;
 $('#shield-status').textContent=round.shieldsRemaining?'◌ SHIELD READY':'';
 const mystery=round.mystery;
 $('#effect-status').hidden=!mystery.effect;
 $('#effect-status').textContent=mystery.effect?`${MYSTERY_EFFECTS[mystery.effect].name} · ${Math.ceil(mystery.effectMs/1000)}s`:'';
 updateBassButton($('#bass-head'),round.bass,{playing:screen.name==='playing'&&!round.ended,hasSpeakers:!!scene?.stage.obstacles.length});
 const bass=scene?bassFactor(scene.dancer,scene.stage.obstacles):1;
 $('#crowd-tip').textContent=bass<1&&!round.ended?`Bass pressure · ${Math.round(bassMovementFactor(round.bass,bass)*100)}% speed`:round.slowedMs>0&&!round.ended?'Gentle bump · keep moving':round.surferMs>0&&!round.ended?`Crowd Surfer · ${Math.ceil(round.surferMs/100)/10}s speed boost`:`Clean passes = +${round.rules.closePassPoints*cycle.bonus}`;
 if(screen.name==='playing')audio.sync(round,scene.stage.id);
 recovery.save();
});
game.events.on('round:phase',phase=>{if(phase==='build')toast('Feel that? Here comes the drop.',2300);if(phase==='drop'){audio.drop();toast('BASS DROP · DOUBLE VIBES',2500)}});
game.events.on('round:bass',({durationMs})=>{scene.round.bassUses=(scene.round.bassUses||0)+1;const seconds=Math.round(durationMs/100)/10;toast(`BASS HEAD · ${seconds}s`);$('#announcement').textContent=`Bass Head active for ${seconds} seconds. Bass immunity and double zone-spark points.`;updateBassButton($('#bass-head'),scene.round.bass,{playing:screen.name==='playing',hasSpeakers:!!scene.stage.obstacles.length});});
game.events.on('round:flow',()=>{audio.celebrate();toast('FLOW STATE · Sparks come to you')});
game.events.on('round:mystery',effect=>{
 const info=MYSTERY_EFFECTS[effect];
 toast(`${info.name} · ${info.hint}`,1800);
 $('#announcement').textContent=`Mystery candy: ${info.name}. ${info.hint}. ${scene.round.rules.candyDurationMs/1000} seconds.`;
});
game.events.on('round:closepass',()=>audio.closePass());game.events.on('round:bump',()=>{if(scene.phase==='cruise')toast('Easy does it. Keep your flow.',1100)});
game.events.on('round:pickup',({multiplier,celebrate})=>{audio.pickup(multiplier);if(celebrate){audio.celebrate();if(scene.phase==='cruise')toast('You found your people.')}});
game.events.on('round:end',round=>{
 if(!run||round.runId!==run.id)return;const result=finishStage(run,round);if(!result)return;
 playtest.finishStage(run.stageIndex,{score:round.score,qualified:result.qualified});
 if(run.status==='ended')playtest.end(run);
 void playtest.flush();
 const award={id:`${run.id}:${run.stageIndex}`,pickups:round.pickups,passes:round.closePasses,flows:round.flowTaken.length,bass:round.bassUses||0,qualified:result.qualified,festivalComplete:run.mode==='festival'&&run.stagesCleared===GENERIC_RULES.mainStageIds.length,...result.progressContext};
 progressReward=rehearsal&&!recoveryLab?null:awardStage(saved.profile.progress,award);
 run.availablePerks=rehearsal?Object.keys(PERKS):availablePerks(progressReward.progress);
 summary=result;audio.stop();clearToast();if(!rehearsal&&run.mode==='rush')saved.saveBest(run.totalScore);
 if(run.status==='ended')captureResult();
 screen=transition(screen,{type:'END',qualified:run.status==='upgrade'});
 if(!rehearsal||recoveryLab){const committed=run.mode==='endless'?recovery.commitStage(award):saved.awardProgress(award);if(committed)progressReward=committed;}
 render();$('#announcement').textContent=`Stage complete. ${round.pickups} sparks. ${run.totalScore} total points.`;
});
window.addEventListener('pagehide',()=>{pause('HIDDEN');recovery.save(true);recovery.release();});
window.addEventListener('pageshow',e=>{if(e.persisted)location.reload();});
render();

if(import.meta.env.DEV && rehearsal && ownership!=='busy')import('./rehearsal.js').then(({installRehearsal})=>{
 const openRewards=()=>{scene?.pauseRound();audio.stop();screen=createScreenState();go('WARDROBE');};
 installRehearsal(()=>scene,()=>screen.name==='playing',{
  previewStage:index=>{const load=()=>{scene.pauseRound();audio.stop();screen=createScreenState();newRun('endless');run.stageIndex=index;go('RULES');};if(scene)load();else game.events.once('forest:ready',load);},
  ...(recoveryLab?{previewRecovery:preset=>{const value=recoveryPractice.recoveryPreview(preset,activeTheme);if(value){saved.saveRecovery(value);recoveryRecord=readRecovery(value,{editionId:edition.id});screen={name:'recovery'};run=null;scene?.pauseRound();audio.stop();render();}},resetRecovery:()=>{recoveryPractice.resetPractice(local,context);location.reload();}}:{}),
  ...(rewardLab?{openRewards,previewReward:(stages,key)=>{
   const results=stages.map(stage=>saved.awardProgress(stage));
   progressReward={xp:results.reduce((sum,r)=>sum+r.xp,0),rewards:[...new Set(results.flatMap(r=>r.rewards))],persisted:true};
   const [category,id]=key.split(':');saved.saveOutfit({...saved.profile.outfit,[category]:id});openRewards();
  }}:{}),
  ...(candyLab?{previewCandy:roll=>{
   const load=()=>{scene.pauseRound();audio.stop();screen=createScreenState();newRun('rush');begin();scene.round.mystery.phase='available';scene.takeCandy(()=>roll);};
   if(scene)load();else game.events.once('forest:ready',load);
  }}:{}),
  ...(bassLab?{previewBass:fixture=>{
   const load=()=>{scene.pauseRound();audio.stop();screen=createScreenState();newRun('endless');run.stageIndex=fixture.stageIndex;run.bassChargeMs=fixture.chargeMs;begin();scene.round.bass.exposureMs=fixture.exposureMs;scene.dancer.setPosition(fixture.position.x,fixture.position.y);};
   if(scene)load();else game.events.once('forest:ready',load);
  }}:{})
 });
});
