import Phaser from 'phaser';
import './style.css';
import {applyTheme} from '../theme-view.js';
import {resolveTheme,isThemePreference} from '../themes.js';
import {createAvatar,setOutfit,animateAvatar} from '../Avatar.js';
import {WARDROBE} from '../wardrobe.js';
import {requirement} from '../progression.js';
import {createAudio} from '../audio.js';
import {createFinishGate,finishHTML} from './finish.js';
import {smfPreviewVoices} from '../editions/smf-music.js';
import {bonusPreviewVoices} from '../bonus-practice/music.js';
import {createSMFInstrumentRack} from '../editions/smf-instruments.js';
import {createRecoveryOwner} from '../recovery-owner.js';
import {updateBassButton,activationInput} from '../bass-view.js';
import {createSubmission} from '../online/submission.js';
import {createBoard} from '../online/board.js';
import {DELIVERY_RECIPIENTS,recipientPortrait} from '../amp-delivery-view.js';
import {MYSTERY_EFFECTS} from '../mystery.js';
import {SMF_RULES} from '../../supabase/functions/_shared/smf-rules.js';
import {createTourRun,stageForRun,collectInvitation,finishMain,choosePerk,beginBonus,finishBonus,returnBonus,endFestival,closeResults,saveTourScore} from './model.js';
import {createTourStore} from './store.js';
import {tourScene} from './scene.js';
import {titleHTML,catalogueHTML,wardrobeHTML,summaryHTML,bonusResultHTML} from './view.js';
import {shellHTML,settingsHTML,stylesHTML,rulesHTML,boardsHTML,confirmLeaveHTML,updateTourHUD} from './ui.js';
import {createSmfOnlineClient,readSmfArcadeConfig,resumeSmfSubmission} from './online.js';
import {createSmfTelemetry,readSmfTelemetryConfig} from './telemetry.js';

const lab=import.meta.env.DEV&&new URLSearchParams(location.search).has('rehearsal')&&new URLSearchParams(location.search).has('tour');
const key=lab?'sidequest.smf.tour-lab.v1':'sidequest.smf.profile.v1';
let browserStorage;try{browserStorage=window.localStorage;}catch{/* Session-only notice below. */}
const store=createTourStore(browserStorage,{key}),owner=createRecoveryOwner({locks:navigator.locks,name:key});
let profile=store.read(),scene=null,view='title',paused=true,ready=false,disposed=false,saved=true,saveClock=0,preparing=false,loadFailed=false,ownership=null;
let returnView='title',feedback='',boardMode='rush',submission=null,exitDestination=null,telemetryStageAllowed=false,telemetryRunAllowed=false,lastBassPointer;
let previewAvatar,previewReady=false,previewOutfit=null;
const finishGate=createFinishGate();let finishKind=null,finishTimer=null,actionGuardUntil=0;
const root=document.querySelector('.shell');root.className='shell smf-tour';root.innerHTML=shellHTML();
let activeTheme=applyTheme(profile.active?.themeId||resolveTheme(profile.themePreference==='surprise'?undefined:profile.themePreference));
const $=s=>root.querySelector(s),text=(s,t)=>{const n=$(s);if(n&&n.textContent!==String(t))n.textContent=String(t);};
const arcadeConfig=lab?{}:readSmfArcadeConfig(import.meta.env),telemetryConfig=lab?{enabled:false}:readSmfTelemetryConfig(import.meta.env);
const arcade=createSmfOnlineClient(arcadeConfig),board=createBoard(p=>arcade.getBoard({editionId:'smf',...p}));
const telemetry=createSmfTelemetry({config:telemetryConfig,consent:()=>profile.playtestConsent==='accepted'});
const audio=createAudio(undefined,{timedVoices:f=>f.timing.id.includes('bonus-preview')?bonusPreviewVoices(f):smfPreviewVoices(f),useTransport:true,createMusicRenderer:createSMFInstrumentRack});
audio.setVolumes(profile.audio);audio.setEnabled(profile.audio.enabled);
function canPlay(){return ready&&(ownership==='owned'||ownership==='unsupported');}
function notice(message){$('#tour-notice').hidden=!message;text('#tour-notice',message);}
function persist(){
 if(!owner.held){saved=false;if(ownership==='unsupported')notice('Saving is unavailable in this browser. You can play, but keep this page open to retain this session.');return false;}
 saved=store.write(profile);
 if(!saved)notice('Saving is unavailable. You can keep playing, but this session’s progress may be lost if you leave.');
 else if(!loadFailed)notice('');
 return saved;
}
function commit(next){profile=next;persist();}
function saveSubmission(){if(submission&&profile.active?.id===submission.runId){profile.active.submission=submission.snapshot();persist();}}
function checkpoint(){
 if(!scene||preparing||loadFailed||view!=='run')return;
 const a=profile.active;if(!a||(!a.bonus&&(a.status!=='playing'||a.needsIntro))||a.bonus?.status==='result')return;
 const snap=scene.capture();
 if(a.bonus){a.bonus.scene=snap.scene;a.bonus.activity=snap.activity;}else a.scene=snap.scene;
 if(submission?.runId===a.id)a.submission=submission.snapshot();persist();saveClock=performance.now();
}
function setPaused(value){
 if(loadFailed&&!value)return;
 paused=value;
 if(value){scene?.pauseTour();audio.stop();checkpoint();}
 else{scene?.resumeTour();audio.setEnabled(profile.audio.enabled);$('#game').focus({preventScroll:true});}
 renderPause();
}
function renderPause(){
 const live=isLive();$('#tour-paused').hidden=!paused||!live; text('#tour-pause',paused?'Resume':'Pause');$('#tour-pause').disabled=!live;
 $('#tour-next-green').disabled=paused;$('#game').inert=!live||paused;
 root.dataset.playing=String(live);root.dataset.paused=String(paused);
}
function isLive(){const a=profile.active;return view==='run'&&a&&(a.bonus?a.bonus.status==='playing':a.status==='playing'&&!a.needsIntro);}
function restoreSubmission(){submission=resumeSmfSubmission(profile.active,submission);}
function enterStage(){
 const a=profile.active;if(!a||a.status!=='playing'||a.bonus||!a.needsIntro)return;
 a.needsIntro=false;
 text('#tour-status','');
 telemetryStageAllowed=profile.playtestConsent==='accepted';
 if(a.stageIndex===0&&!a.scene&&!a.scoreStages.length){
  a.buildId=arcadeConfig.buildId||import.meta.env.VITE_BUILD_ID||'dev';
  submission=arcadeConfig.baseUrl?createSubmission(a.id):null;
  if(submission){
   const current=submission,id=a.id; a.submission=current.snapshot();
   void arcade.startRun({editionId:'smf',runId:id,mode:a.mode,scoringVersion:SMF_RULES.id,buildId:a.buildId}).then(result=>{
    if(disposed||profile.active?.id!==id||submission!==current)return;
    current.setTicket(id,result.ok?result.data:null);saveSubmission();if(!isLive())render();
   });
  }
 }
 persist();load();
}
function load({recovered=false}={}){
 view='run';preparing=true;loadFailed=false;
 try{scene.loadActive({paused:recovered});paused=recovered;}
 catch(error){loadFailed=true;scene.failed=true;paused=true;scene.pauseTour();console.error('Festival scene could not load',error);notice('This visit could not be opened. Finish or leave the visit to return safely.');}
 finally{preparing=false;}
 if(!paused)audio.setEnabled(profile.audio.enabled);
 checkpoint();render();
}
function hud(round){
 if(!scene||!profile.active)return;
 const a=profile.active,b=a.bonus,p=scene.practice,stage=b?scene.config.stage:stageForRun(a);
 text('#tour-stage',b?`${scene.config.name} · ${scene.config.dj}`:a.mode==='rush'?`${stage.name} · Quick Rush`:a.mode==='endless'?`${stage.name} · Stage ${a.stageIndex+1} · Loop ${stage.loop}`:`${a.stageIndex+1} / 6 · ${stage.name}`);
 text('#tour-points',b?(scene.config.activity==='delivery'?`${p.state.delivered} / 3 delivered`:`${p.state.progress} / ${p.state.goal} ${scene.config.activity==='putt'?'holes':'found'}`):`${a.score+round.score} points · ${round.pickups}${a.mode==='rush'?'':` / ${stage.target}`} sparks`);
 const putt=b&&scene.config.activity==='putt';text('#tour-clock-label',putt?'SHOTS':'TIME LEFT');text('#tour-time',putt?`${p.state.strokes} / 8`:`${Math.ceil(round.remainingMs/1000)}s`);
 $('#game').setAttribute('aria-label',putt&&p.state.phase!=='walking'?'Putting green. Drag anywhere opposite your shot and release, or use the aim and power controls below. Escape pauses.':'Festival dancefloor. Click or tap to move, or use WASD or arrows. Escape pauses.');
 updateBassButton($('#bass-head'),round.bass,{playing:!paused&&!b,hasSpeakers:!!scene.stage.obstacles.length});
 updateTourHUD(root,{round,run:a,stage,paused,bonus:b,practice:p,config:scene.config});
 $('#tour-putt').hidden=!putt||p.state.phase==='walking';$('#tour-putt details').hidden=!putt||p.state.phase==='between';$('#tour-next-green').hidden=!putt||p.state.phase!=='between';
 $('#tour-putt [data-action="putt"]').disabled=paused||!putt||p.state.phase!=='aim';
 if(b&&scene.config.activity==='delivery'){
  const person=DELIVERY_RECIPIENTS.find(x=>x.id===p.state.recipientId),signature=`${person?.id}|${p.state.carrying}|${p.state.complete}`;
  if($('#tour-order').dataset.state!==signature){$('#tour-order').dataset.state=signature;$('#tour-order').innerHTML=p.state.complete?'<p>All deliveries made. Enjoy your grilled cheese!</p>':`${recipientPortrait(person?.id)}<p><strong>${person?.name} · ${person?.costume}</strong><br>${p.state.carrying?'Sandwich in hand. Smooth-pass this costume.':'Return to the vendor to pick up a sandwich.'}</p>`;}
 }else{
  const message=putt?(p.state.phase==='walking'?`Walk onto green ${p.state.holeIndex+1} to putt. Explore the party on the way.`:p.state.phase==='between'?'In the cup! Head to the next green.':'Drag opposite your shot, then release. No time limit.'):b?scene.config.activity==='garden'&&p.state.carrying?'Seed in hand → smooth-pass into the garden bed.':scene.config.instruction:a.pendingInvitation?'Invitation found! Clear this stage to open it.':'Collect sparks · Clean passes score · B activates Bass Head';
  if($('#tour-order').textContent!==message){$('#tour-order').textContent=message;delete $('#tour-order').dataset.state;}
 }
}
function menuOptions(){return {saved,themeId:activeTheme,onlineEnabled:!!arcadeConfig.baseUrl,playtestEnabled:telemetryConfig.enabled,noticeURL:telemetryConfig.notice||`${import.meta.env.BASE_URL}smf-playtest-data.html`,submission,boardMode,board,feedback};}
function render(){
 const a=profile.active,live=isLive(),finishing=view==='finish',options=menuOptions();$('#tour-running').hidden=!live&&!finishing;
 $('#tour-header-actions').hidden=finishing;$('#tour-proceed').hidden=!finishing;$('#tour-proceed').disabled=!finishing||!finishGate.ready(performance.now());
 $('#tour-finish').hidden=!finishing;if(finishing)$('#tour-finish').innerHTML=finishHTML(profile,finishKind);
 root.dataset.view=view;root.dataset.playing=String(live);
 if(view==='finish')$('#tour-menu').innerHTML='';
 else if(view==='title')$('#tour-menu').innerHTML=titleHTML(profile,options);
 else if(view==='catalogue')$('#tour-menu').innerHTML=catalogueHTML(profile);
 else if(view==='wardrobe')$('#tour-menu').innerHTML=wardrobeHTML(profile);
 else if(view==='settings')$('#tour-menu').innerHTML=settingsHTML(profile,options);
 else if(view==='style')$('#tour-menu').innerHTML=stylesHTML(profile);
 else if(view==='scores')$('#tour-menu').innerHTML=boardsHTML(profile,options);
 else if(view==='rules')$('#tour-menu').innerHTML=rulesHTML(profile,{...options,stage:a?stageForRun(a):undefined});
 else if(view==='confirm-leave')$('#tour-menu').innerHTML=confirmLeaveHTML(profile);
 else if(view==='confirm-close')$('#tour-menu').innerHTML='<h2>Leave without saving this score?</h2><p>Your XP and souvenirs are already kept. Save this result to the local scoreboard or post online before leaving.</p><button class="primary-button" data-action="cancel-close">Back to score</button> <button class="quiet-button" data-action="confirm-close">Leave without saving</button>';
 else if(a?.bonus?.status==='result')$('#tour-menu').innerHTML=bonusResultHTML(profile,saved);
 else if(a&&a.status!=='playing'&&!a.bonus)$('#tour-menu').innerHTML=summaryHTML(profile,options);
 else $('#tour-menu').innerHTML='';
 renderPause();if(scene&&live&&!loadFailed&&(!a.bonus||scene.practice))hud(scene.round);
 root.querySelectorAll('[data-action="start"],[data-action="resume"],[data-action="explore"],[data-action="enter"]').forEach(b=>b.disabled=b.disabled||!canPlay());
 $('#tour-avatar-preview').hidden=view!=='wardrobe';$('#tour-avatar-preview-label').hidden=view!=='wardrobe';
 if(previewReady){if(view==='wardrobe'){setOutfit(previewAvatar,previewOutfit||profile.outfit);preview.loop.wake();}else preview.loop.sleep();}
 scheduleLayout();
}
function showFinish(kind){
 finishKind=kind;view='finish';paused=true;finishGate.begin(performance.now());
 scene?.finishView.start(kind==='bonus'?!!profile.active.bonus.rewardId:!!profile.active.summary?.qualified);
 clearTimeout(finishTimer);finishTimer=setTimeout(()=>{if(view==='finish')$('#tour-proceed').disabled=false;},1100);render();
}
function completeBonus({completed=false,won=false}={}){
 scene?.pauseTour();audio.stop();paused=true;
 if(scene?.practice&&!loadFailed){const snap=scene.capture();profile.active.bonus.scene=snap.scene;profile.active.bonus.activity=snap.activity;}
 if(scene?.round&&!loadFailed)hud(scene.round);commit(finishBonus(profile,{completed,won}));if(profile.active.bonus.rewardId)audio.celebrate();showFinish('bonus');
}
function activity(event){
 if(preparing||!isLive())return;
 const messages={'green-entered':'On the green. Pull back and release to putt.',pickup:'Picked up! Find the matching destination.',dropped:'Sandwich dropped. Pick up another at the vendor.',wrong:'You made their night! This delivery does not count.',delivered:'Delivery made! Back to the vendor.',planted:'A little more colour in the garden.',collected:'Found it. Follow the next glow.',greeted:'Good company!',shot:'Let it roll…',holed:'In the cup! Head to the next green.',settled:'Line up your next putt.',exhausted:'Eight shots played. Come back for another try.'};
 text('#tour-status',messages[event.type]||'');
 if(event.type==='complete'){completeBonus({won:true,completed:true});return;}
 if(event.type==='exhausted'){completeBonus();return;}
 if(event.type==='green-entered'){scene?.pauseRound();$('#tour-angle').value=scene.practice.state.holeIndex?'180':'0';}
 if(['pickup','collected','shot','green-entered'].includes(event.type))audio.pickup(1);else audio.closePass();checkpoint();
}
function trackRun(outcome){const a=profile.active;if(a&&telemetryRunAllowed){telemetry.record({type:'run',mode:a.mode,outcome,stagesCleared:a.cleared,totalScore:a.score});telemetryRunAllowed=false;void telemetry.flush();}}
const Scene=tourScene({profile:()=>profile,onReady:s=>{scene=s;ready=true;render();},onFrame:round=>{
 if(!isLive()||preparing||loadFailed)return;hud(round);if(!paused){audio.sync(round,scene.stage.id);if(performance.now()-saveClock>=1000)checkpoint();}
},onInvitation:()=>{profile=collectInvitation(profile);text('#tour-status','A sealed invitation! Clear this stage to reveal its party.');audio.closePass();checkpoint();},onActivity:activity,onRoundEnd:round=>{
 if(preparing||!isLive())return;
 if(profile.active.bonus){completeBonus({completed:scene.config.activity==='trail',won:scene.practice.state.complete});return;}
 const a=profile.active;
 if(telemetryStageAllowed)telemetry.record({type:'stage',mode:a.mode,stageIndex:a.stageIndex,stageId:scene.stage.id,pickups:round.pickups,closePasses:round.closePasses,bassUses:round.bassUses||0});
 hud(round);scene.pauseTour();paused=true;audio.stop();commit(finishMain(profile,round));if(profile.active.status==='results')trackRun(profile.active.summary?.qualified?'complete':'failed');else void telemetry.flush();feedback='';if(profile.active.summary?.qualified)audio.celebrate();showFinish('main');
},onAim:v=>{if(v)text('#tour-status',`${Math.round(Math.hypot(v.x,v.y)*100)}% power`);else if(scene?.practice?.state.phase==='aim')text('#tour-status','Pull back and release.');}});
const game=new Phaser.Game({type:Phaser.CANVAS,parent:'game',width:960,height:640,banner:false,audio:{noAudio:true},scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH},scene:Scene});
const preview=new Phaser.Game({type:Phaser.CANVAS,parent:'tour-avatar-preview',width:240,height:200,transparent:true,banner:false,audio:{noAudio:true},fps:{target:30},scene:{create(){previewAvatar=createAvatar(this,profile.outfit);previewAvatar.setPosition(116,125).setScale(2.4);previewReady=true;render();},update(time){animateAvatar(previewAvatar,time,window.matchMedia('(prefers-reduced-motion: reduce)').matches,false);}}});
let layoutPending=false;
function scheduleLayout(){if(layoutPending)return;layoutPending=true;requestAnimationFrame(()=>{layoutPending=false;if(disposed)return;const live=isLive()||view==='finish',arena=$('.tour-arena');if(live){const available=window.visualViewport?.height||innerHeight;const blocks=['.tour-header','.tour-hud','#tour-details','#tour-order','#tour-status','#tour-putt','#tour-notice','#tour-lab'].map(s=>$(s)).filter(n=>n&&!n.hidden);const chrome=blocks.reduce((n,e)=>n+e.getBoundingClientRect().height,0)+50;const height=Math.max(130,available-chrome);const width=Math.min($('#tour-running').clientWidth,height*1.5);arena.style.width=`${width}px`;arena.style.height=`${width/1.5}px`;arena.style.marginInline='auto';}game.scale.refresh();});}
const layoutObserver=new ResizeObserver(scheduleLayout);layoutObserver.observe(root);window.addEventListener('resize',scheduleLayout);window.visualViewport?.addEventListener('resize',scheduleLayout);
function input(kind){const a=profile.active;if(!a||a.bonus||!isLive())return;if(['mouse','touch','keyboard'].includes(kind))a.inputType=a.inputType==='unknown'?kind:a.inputType===kind?kind:'mixed';}
for(const [name,fn] of [['round:pickup',e=>audio.pickup(e.multiplier)],['round:closepass',()=>audio.closePass()],['round:flow',()=>{audio.celebrate();text('#tour-status','FLOW · Sparks come to you');}],['round:bass',()=>{scene.round.bassUses=(scene.round.bassUses||0)+1;audio.drop();}],['round:mystery',effect=>{text('#tour-status',`${MYSTERY_EFFECTS[effect].name} · ${effect==='dizzy'?'Steering is reversed!':effect==='speed'?'Hold on!':'Ride the colours.'}`);audio.drop();}],['round:phase',phase=>{if(phase==='drop')audio.drop();}],['round:input',e=>{if(e.runId===profile.active?.id)input(e.kind);} ]])game.events.on(name,fn);
function buttonVector(){const a=Number($('#tour-angle').value)*Math.PI/180,p=Number($('#tour-power').value)/100;return {x:Math.cos(a)*p,y:Math.sin(a)*p};}
async function loadBoard(mode){boardMode=mode;const pending=board.select(mode,SMF_RULES.id);render();await pending;if(view==='scores')render();}
function viewMenu(next){if(isLive())setPaused(true);returnView=view;view=next;feedback='';previewOutfit=null;render();}
function startRun(mode){
 if(profile.active||!['rush','festival','endless'].includes(mode))return;
 activeTheme=applyTheme(resolveTheme(profile.themePreference));commit(createTourRun(profile,mode,crypto.randomUUID(),activeTheme));submission=null;telemetryRunAllowed=profile.playtestConsent==='accepted';view='rules';feedback='';render();
}
function finishAndClose(){commit(closeResults(profile));submission=null;view='title';render();if(exitDestination){const mode=exitDestination;exitDestination=null;startRun(mode);}}
function initials(){return ($('#tour-initials')?.value||profile.active?.initialsDraft||profile.initials||'').toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,3);}
async function postScore(){
 const a=profile.active;if(!a||a.bonus||a.status!=='results'||!submission||a.scoreOverflow||!a.scoreStages.length)return;
 const name=initials();if(!/^[A-Z0-9]{3}$/.test(name)){feedback='Enter three letters or numbers for your initials.';render();return;}
 a.initialsDraft=name;const current=submission,id=a.id;
 const pending=current.post({editionId:'smf',initials:name,mode:a.mode,scoringVersion:SMF_RULES.id,buildId:a.buildId,inputType:a.inputType,totalScore:a.score,stagesCleared:a.cleared,stages:a.scoreStages},p=>arcade.submitScore(p));
 saveSubmission();render();await pending;if(profile.active?.id!==id||submission!==current)return;saveSubmission();render();
}
function route(action,id,event){
 if(event&&performance.now()<actionGuardUntil)return;
 if(view==='finish'){
  if(action==='proceed'&&finishGate.accept(event?.detail??0,performance.now())){clearTimeout(finishTimer);scene?.finishView.stop();finishKind=null;view='run';actionGuardUntil=performance.now()+350;render();}
  return;
 }
 if(!['fullscreen','back','home','title','settings','style','scores','catalogue','wardrobe','rules'].includes(action)&&!canPlay())return;
 if(action==='pause'){if(isLive())setPaused(!paused);return;}
 if(action==='home'||action==='title'){if(isLive())setPaused(true);view='title';audio.stop();render();return;}
 if(['settings','style','wardrobe','catalogue','scores'].includes(action)){viewMenu(action);if(action==='scores'&&arcadeConfig.baseUrl)void loadBoard(boardMode);return;}
 if(action==='back'){view=returnView==='run'&&profile.active&&!profile.active.needsIntro?'run':'title';render();return;}
 if(action==='rules'){viewMenu('rules');return;}
 if(action==='theme'&&isThemePreference(id)){profile.themePreference=id;persist();if(!profile.active)activeTheme=applyTheme(resolveTheme(id==='surprise'?undefined:id));render();return;}
 if(action==='start'){startRun(id||'festival');return;}
 if(action==='enter'){enterStage();return;}
 if(action==='resume'){
  const a=profile.active;if(!a)return;activeTheme=applyTheme(a.themeId);restoreSubmission();
  if(a.needsIntro&&!a.bonus&&a.status==='playing'){view='rules';render();}
  else if(a.status==='playing'||a.bonus?.status==='playing')load({recovered:true});else{view='run';render();}return;
 }
 if(action==='equip'){if(!id||profile.rewards.includes(id)){profile.souvenir=id||null;persist();render();}return;}
 if(action==='preview-outfit'){
  const [category,value]=String(id).split(':');if(WARDROBE[category]?.some(o=>o.id===value)){previewOutfit={...profile.outfit,[category]:value};if(previewReady)setOutfit(previewAvatar,previewOutfit);text('#outfit-feedback','Preview only · not equipped.');text('#tour-avatar-preview-label',`Previewing ${WARDROBE[category].find(o=>o.id===value).name}`);}return;
 }
 if(action==='perk'||action==='keep'){
  const a=profile.active,replaced=action==='perk'?$('#tour-replace')?.value:null,next=choosePerk(profile,action==='keep'?null:id,replaced||undefined);
  if(next!==profile){if(telemetryStageAllowed)telemetry.record({type:'perk',mode:a.mode,stageIndex:a.stageIndex,action:action==='keep'?'keep':replaced?'swap':'take',perk:action==='keep'?null:id,replaced:replaced||null});commit(next);view='rules';render();}return;
 }
 if(action==='visit'||action==='explore'){
  const next=beginBonus(profile,id,crypto.randomUUID(),{explore:action==='explore'});
  if(next!==profile){commit(next);$('#tour-angle').value='0';$('#tour-power').value='50';text('#tour-status','');load();}return;
 }
 if(action==='skip'){profile.active.summary.bonusOffered=false;persist();render();return;}
 if(action==='return'){commit(returnBonus(profile));scene.clearVisit();if(!profile.active)view='catalogue';render();return;}
 if(action==='close'||action==='replay'){
  exitDestination=action==='replay'?profile.active?.mode:null;
  if(profile.active&&!profile.active.scoreSaved&&submission?.status!=='succeeded'&&(profile.active.scoreStages.length||profile.active.score>0||profile.active.cleared>0)){view='confirm-close';render();}else finishAndClose();return;
 }
 if(action==='cancel-close'){view='run';exitDestination=null;render();return;}
 if(action==='confirm-close'){finishAndClose();return;}
 if(action==='save-score'){const next=saveTourScore(profile,initials());feedback=next===profile?'Enter three letters or numbers for your initials.':'';if(next!==profile){commit(next);feedback=saved?'Score saved on this device.':'Score kept for this session. Device saving is unavailable.';}render();return;}
 if(action==='post-score'||action==='retry-score'){void postScore();return;}
 if(action==='board-mode'||action==='online-board'){if(['rush','festival','endless'].includes(id)){boardMode=id;if(arcadeConfig.baseUrl)void loadBoard(id);else render();}return;}
 if(action==='leave'){if(isLive())setPaused(true);view='confirm-leave';render();return;}
 if(action==='confirm-leave'){if(profile.active.bonus)completeBonus();else{commit(endFestival(profile));trackRun('banked');view='run';render();}return;}
 if(action==='cancel-leave'){view=profile.active.needsIntro&&!profile.active.bonus?'rules':'run';render();return;}
 if(action==='bass'&&isLive()&&!paused&&scene.activateBassHead()){input(activationInput({detail:1},lastBassPointer));checkpoint();return;}
 if(action==='green'&&!paused&&scene.practice?.nextHole()){scene.puttingView.cancelAim();$('#tour-angle').value='180';checkpoint();hud(scene.round);return;}
 if(action==='putt'&&!paused){scene.shoot(buttonVector());return;}
 if(action==='consent-accept'||action==='consent-decline'){
  profile.playtestConsent=action==='consent-accept'?'accepted':'declined';persist();telemetryStageAllowed=false;telemetryRunAllowed=false;if(action==='consent-decline')telemetry.stop();render();return;
 }
 if(action==='fullscreen'){void (async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await root.requestFullscreen();}catch{notice('Fullscreen is unavailable in this browser.');}})();}
}
root.addEventListener('click',e=>{const b=e.target.closest('[data-action]');if(b&&!b.disabled)route(b.dataset.action,b.dataset.id,e);});
root.addEventListener('pointerdown',e=>{if(e.target.closest('#tour-proceed'))finishGate.pointerDown(performance.now());},true);
$('#tour-proceed').addEventListener('keydown',e=>{if(e.repeat&&(e.code==='Space'||e.code==='Enter'))e.preventDefault();});
$('#bass-head').addEventListener('pointerdown',e=>{lastBassPointer=e.pointerType;});
root.addEventListener('input',e=>{
 const element=e.target;
 if(element.matches('#tour-angle,#tour-power'))scene?.puttingView?.setButtonAim(buttonVector());
 if(element.matches('#tour-initials')){element.value=element.value.toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,3);if(profile.active){profile.active.initialsDraft=element.value;persist();}}
 if(element.matches('#tour-music,#tour-fx')&&canPlay()){profile.audio[element.id==='tour-music'?'music':'effects']=Number(element.value)/100;persist();audio.setVolumes(profile.audio);if(element.id==='tour-fx')audio.pickup(1);}
});
root.addEventListener('change',e=>{
 const element=e.target;
 if(element.id==='tour-sound-enabled'&&canPlay()){profile.audio.enabled=element.checked;persist();audio.setEnabled(element.checked);}
 const category=element.dataset.outfit,value=element.value;if(!category||!canPlay()||!WARDROBE[category]?.some(o=>o.id===value))return;
 const need=category==='onesie'&&value==='mycelium'?(profile.progress.endless.smfVenues.length>=6?null:'Explore all six venues in Endless.'):requirement(profile.progress,`${category}:${value}`);
 if(need)return;profile.outfit={...profile.outfit,[category]:value};previewOutfit=null;persist();if(previewReady)setOutfit(previewAvatar,profile.outfit);text('#outfit-feedback',saved?'Outfit saved.':'Outfit selected for this session.');text('#tour-avatar-preview-label','Your festival look');
});
function keys(e){
 if(e.target.matches('input,select,textarea'))return;
 if(e.code==='Escape'&&!e.repeat){if(isLive()){e.preventDefault();setPaused(!paused);}else if(view==='confirm-close')route('cancel-close');else if(view==='confirm-leave')route('cancel-leave');else if(['settings','wardrobe','style','scores','catalogue','rules'].includes(view))route('back');}
 if(!isLive())return;
 if(e.code==='KeyB'&&!e.repeat&&!paused&&!profile.active.bonus&&!e.ctrlKey&&!e.metaKey&&!e.altKey){e.preventDefault();if(scene.activateBassHead()){input('keyboard');checkpoint();}}
 if(document.activeElement===$('#game')&&['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code))e.preventDefault();
}
function hidden(){if(document.hidden&&isLive()&&!paused)setPaused(true);if(document.hidden)void telemetry.flush();}
function blurred(){if(isLive()&&!paused)setPaused(true);}
function pagehide(e){if(isLive())setPaused(true);void telemetry.flush();if(!e.persisted)dispose();}
function fullscreenChanged(){const b=$('[data-action="fullscreen"]');if(b)b.textContent=document.fullscreenElement?'Exit fullscreen':'Fullscreen';scheduleLayout();}
function dispose(){if(disposed)return;disposed=true;clearTimeout(finishTimer);finishGate.cancel();audio.stop();telemetry.stop();owner.release();scene?.clearVisit();scene?.souvenirView.destroy();game.destroy(true);preview.destroy(true);layoutObserver.disconnect();document.removeEventListener('keydown',keys);document.removeEventListener('visibilitychange',hidden);document.removeEventListener('fullscreenchange',fullscreenChanged);window.removeEventListener('blur',blurred);window.removeEventListener('pagehide',pagehide);window.removeEventListener('resize',scheduleLayout);window.visualViewport?.removeEventListener('resize',scheduleLayout);}
document.addEventListener('keydown',keys);document.addEventListener('visibilitychange',hidden);document.addEventListener('fullscreenchange',fullscreenChanged);window.addEventListener('blur',blurred);window.addEventListener('pagehide',pagehide);
const fullscreenButton=$('[data-action="fullscreen"]');if(fullscreenButton)fullscreenButton.hidden=!document.fullscreenEnabled;
ownership=await owner.acquire();
if(ownership==='busy')notice('This Festival is open in another tab. Close that tab, then reload here to continue safely.');
else if(ownership==='unsupported'){saved=false;notice('Run recovery is unavailable in this browser. You can play, but keep this page open.');}
else{profile=store.read();if(!browserStorage){saved=false;notice('Device storage is unavailable. Progress will last only for this session.');}}
restoreSubmission();render();
if(import.meta.env.DEV&&lab){const {mountTourLab}=await import('./lab.js');mountTourLab($('#tour-lab'),{getProfile:()=>profile,commit,load,render,scene:()=>scene,activity,finish:()=>{const r=scene.round,stage=stageForRun(profile.active);r.pickups=stage.target||24;r.score=r.pickups*10;r.scoreComponents={sparks:[r.pickups,...Array(19).fill(0)],passes:[0,0]};r.closePasses=0;r.remainingMs=0;r.ended=true;scene.pauseTour();paused=true;audio.stop();hud(r);commit(finishMain(profile,r));showFinish('main');},home:()=>{view='title';submission=null;render();}});}
if(import.meta.hot)import.meta.hot.dispose(dispose);
