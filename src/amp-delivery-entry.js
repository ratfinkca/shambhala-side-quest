import Phaser from 'phaser';
import './clock-practice.css';
import './amp-delivery.css';
import {GameScene} from './GameScene.js';
import {createDeliveryPractice} from './amp-delivery-practice.js';
import {AMP_DELIVERY_STAGE,DELIVERY_RECIPIENTS,VENDOR_POINT,createAMPBackstageView,createDeliveryView,recipientPortrait} from './amp-delivery-view.js';
import {createAudio} from './audio.js';
import {smfPreviewVoices} from './editions/smf-music.js';
import {createSMFInstrumentRack} from './editions/smf-instruments.js';
import {mountRehearsalAudioMix} from './rehearsal-audio-mix.js';
import {elapsedMs} from './stage-clock.js';
import {handlePracticePageHide} from './clock-practice.js';
import {preventGameKeyDefault} from './input.js';

const root=document.querySelector('.shell');root.classList.add('clock-lab','delivery-lab');
root.innerHTML=`<header><div><span class="clock-eyebrow">AMP backstage · rehearsal · no saves</span><h1>Cheese courier</h1></div><a class="quiet-button" href="?rehearsal&venues">Back to venues</a></header>
<p class="delivery-intro">A little side quest between sets. Three hungry dancers. One very precious sandwich.</p>
<div class="clock-controls"><button id="delivery-start" class="primary-button" disabled>Start deliveries</button><button id="delivery-pause" class="quiet-button" disabled>Pause</button><button id="delivery-sound" class="quiet-button" aria-pressed="true">Sound on</button></div>
<section class="delivery-panel" aria-label="AMP backstage delivery challenge">
 <div class="delivery-order"><div id="delivery-portrait" aria-hidden="true"></div><div class="delivery-order-copy"><span id="delivery-order-label">FIRST ORDER</span><strong id="delivery-recipient"></strong><span id="delivery-costume"></span><span id="delivery-carry">Pick up at the cart</span></div><div class="delivery-count"><span>DELIVERED</span><strong id="delivery-count">0 / 3</strong><span id="delivery-time">55s left</span></div></div>
 <div class="clock-arena"><div id="game" tabindex="0" role="application" aria-label="Sandwich delivery. Click or tap a destination or use arrow keys. Collect at the cart, then pass close beside the dancer matching the order portrait without touching. Escape pauses."></div><div id="delivery-overlay" class="delivery-overlay"><strong>Collect. Weave. Deliver.</strong><span>Start deliveries, then visit the glowing circle at the cart.</span></div></div>
 <div class="delivery-message" id="delivery-message" role="status">Find the costume in the portrait. Pass close beside the recipient, then move clear to hand it over.</div>
</section>
<div class="delivery-guide"><span><b>1</b> Cart → one sandwich</span><span><b>2</b> Match their costume</span><span><b>3</b> Smooth pass → delivery</span></div>
<p class="delivery-help"><a href="?rehearsal&bonus=rabbit-hole">Explore Rabbit Hole, Secret Garden, Ikigai Mori & Villagio →</a></p>
<details class="delivery-help"><summary>How to make a clean delivery</summary><p>Click/tap a destination or use WASD/arrows. Skim beside the dancer matching the order portrait, then keep moving past them. Touching drops your sandwich. Passing the wrong dancer gives it away — they're happy, but the order is still waiting. Go back to the cart for a replacement; completed deliveries stay banked.</p><p>Three deliveries earn your own grilled cheese and a cheese totem to try here. This rehearsal lasts one AMP phrase sequence, about 55 seconds. No scores, XP, prizes or playtest data are saved. Pausing or hiding the tab freezes the visit; reloading starts fresh. Escape pauses. Motion follows your device setting.</p><p>Original AMP synthesis is temporary rehearsal music. S2 is the planned backstage DJ identity; no S2 recording is included.</p></details>`;
const $=selector=>root.querySelector(selector),setText=(selector,text)=>{const node=$(selector);if(node.textContent!==text)node.textContent=text;};
const practice=createDeliveryPractice({recipientIds:DELIVERY_RECIPIENTS.map(r=>r.id)});
const audio=createAudio(undefined,{timedVoices:smfPreviewVoices,useTransport:true,createMusicRenderer:createSMFInstrumentRack});
let currentScene=null,disposed=false,soundOn=true,mixer=null,lastRecipient=null;
function stopAudio(){mixer?.cancelPreview();audio.stop();}
function renderOrder(){
 const state=practice.state,recipient=DELIVERY_RECIPIENTS.find(r=>r.id===state.recipientId);
 const portraitKey=recipient?.id??'complete';
 if(lastRecipient!==portraitKey){lastRecipient=portraitKey;$('#delivery-portrait').innerHTML=recipient?recipientPortrait(recipient.id):'<svg viewBox="0 0 96 96" aria-hidden="true"><path d="M21 36 60 20 77 38V68H21z" fill="#d27a2b"/><path d="M21 36 60 20 77 38z" fill="#ffe691"/><path d="M21 38H77V68H21z" fill="#ffcd42"/><g fill="#c18429"><circle cx="34" cy="49" r="5"/><circle cx="63" cy="57" r="7"/><circle cx="49" cy="43" r="3"/></g></svg>';}
 setText('#delivery-order-label',state.complete?'YOUR REWARD':state.carrying?'DELIVER TO':'NEXT ORDER');
 setText('#delivery-recipient',recipient?recipient.name:'Cheese totem!');
 setText('#delivery-costume',recipient?.costume??'On the house');
 setText('#delivery-carry',state.complete?'Preview reward · not saved':state.carrying?'Sandwich in hand':'Empty-handed · visit the cart');
 setText('#delivery-count',`${state.delivered} / ${state.goal}`);
 root.classList.toggle('delivery-carrying',state.carrying);root.classList.toggle('delivery-complete',state.complete);
}
function controls(){
 const status=practice.status,playing=status==='playing',paused=status==='paused';
 $('#delivery-start').disabled=!currentScene;setText('#delivery-start',status==='ready'?'Start deliveries':'Start fresh');
 $('#delivery-pause').disabled=!playing&&!paused;setText('#delivery-pause',paused?'Resume':'Pause');
 const overlay=$('#delivery-overlay');overlay.hidden=playing;
 overlay.classList.toggle('is-result',status==='complete'||status==='ended');
 overlay.classList.toggle('is-paused',paused);
 if(paused)overlay.innerHTML='<strong>Sandwich break.</strong><span>Everything is paused. Resume when you’re ready.</span>';
 if(status==='complete')overlay.innerHTML='<strong>Order up! Your cheese is on the house.</strong><span>Cheese totem earned for this rehearsal. Start fresh to play again.</span>';
 if(status==='ended')overlay.innerHTML=`<strong>End of the set · ${practice.state.delivered} / 3 delivered</strong><span>${practice.state.complete?'':"The prize needs all three deliveries. "}Start fresh for another try.</span>`;
}
function updateHUD(round){
 setText('#delivery-time',practice.state.complete?'Complete!':`${Math.ceil(round.remainingMs/1000)}s left`);
 renderOrder();
 if(practice.status==='playing')audio.sync(round,'amp-backstage');
}
function feedback(event){
 currentScene.deliveryView.feedback(event);
 const recipient=DELIVERY_RECIPIENTS.find(r=>r.id===practice.state.recipientId);
 const message={
  pickup:`Hot off the grill! Find ${recipient?.name} (${recipient?.costume.toLowerCase()}) and pass close beside them.`,
  delivered:`Delivered! ${practice.state.delivered} / 3 banked. Back to the cart for ${recipient?.name}’s order.`,
  wrong:'A happy dancer — but the wrong order! Return to the cart; your progress is safe.',
  dropped:'Oops, sandwich down! Return to the cart for a replacement. Your progress is safe.',
  complete:'Three happy recipients! Enjoy your grilled cheese and preview cheese totem.',
 }[event.type];
 if(message)setText('#delivery-message',message);
 if(event.type==='complete'){stopAudio();controls();}
 if(event.type==='pickup')audio.pickup(1);
 if(event.type==='delivered'||event.type==='complete')audio.closePass();
 renderOrder();
}

class DeliveryScene extends GameScene{
 create(){
  this.stageRendererOptions={venueView:createAMPBackstageView};super.create();
  if(disposed){this.game.destroy(true);return;}
  // The courier activity has no ordinary spark, Flow or candy objectives.
  this.sparks.forEach(s=>s.destroy());this.sparks=[];
  currentScene=this;this.prepareVisit();controls();
 }
 prepareVisit(){
  this.deliveryView?.destroy();
  super.startRound({stage:AMP_DELIVERY_STAGE,timingId:AMP_DELIVERY_STAGE.timingId});
  this.round.flowTaken=[0,1];this.round.mystery.phase='spent';
  this.deliveryView=createDeliveryView(this);
  this.deliveryView.update(practice.state,0,this.reducedMotion);
  if(practice.status!=='playing')this.pauseRound();
  updateHUD(this.round);
 }
 onCrowdEncounters(encounters){
  const atVendor=Math.hypot(this.dancer.x-VENDOR_POINT.x,this.dancer.y-VENDOR_POINT.y)<(VENDOR_POINT.radius??42);
  const event=practice.step({atVendor,encounters});
  if(event)feedback(event);
 }
 effect(x,y,color,points,celebrate,label){
  // Familiar near-pass rings remain; courier feedback replaces spark scores.
  if(label?.startsWith('SMOOTH'))return;
  super.effect(x,y,color,points,celebrate,label);
 }
 update(time,delta){
  super.update(time,delta);
  this.deliveryView?.update(practice.state,elapsedMs(this.round),this.reducedMotion);
  if(practice.status!=='playing'&&this.running)this.pauseRound();
 }
}
const game=new Phaser.Game({type:Phaser.CANVAS,parent:'game',width:960,height:640,banner:false,audio:{noAudio:true},scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH},scene:DeliveryScene});
game.events.on('round:update',round=>{if(!disposed)updateHUD(round);});
game.events.on('round:end',()=>{if(disposed)return;practice.finish();stopAudio();controls();});
function start(){
 if(!currentScene)return;
 stopAudio();audio.setEnabled(soundOn);practice.start();currentScene.prepareVisit();
 setText('#delivery-message','Visit the glowing circle at the cart to collect your first order.');controls();$('#game').focus({preventScroll:true});
}
function pause(){
 if(practice.status==='playing'){practice.pause();currentScene?.pauseRound();stopAudio();}
 else if(practice.status==='paused'){practice.resume();currentScene?.resumeRound();audio.setEnabled(soundOn);$('#game').focus({preventScroll:true});}
 controls();
}
$('#delivery-start').addEventListener('click',start);$('#delivery-pause').addEventListener('click',pause);
$('#delivery-sound').addEventListener('click',()=>{
 soundOn=!soundOn;audio.setEnabled(soundOn);mixer.refresh();
 setText('#delivery-sound',soundOn?'Sound on':'Sound off');$('#delivery-sound').setAttribute('aria-pressed',String(soundOn));
});
function hidden(){if(document.hidden&&practice.status==='playing')pause();}
function keydown(e){
 if(e.target.matches('select,input,textarea'))return;
 if(preventGameKeyDefault(e.key,practice.status==='playing',document.activeElement===$('#game')))e.preventDefault();
 if(e.code==='Escape'&&!e.repeat){e.preventDefault();pause();}
}
document.addEventListener('visibilitychange',hidden);document.addEventListener('keydown',keydown);
mixer=mountRehearsalAudioMix(root,{audio,isEnabled:()=>soundOn});
root.querySelector('.rehearsal-mix-note').textContent='Music controls this original synthesized arrangement. Effects controls delivery chimes. Sound on/off mutes everything. This mix resets when you reload.';
renderOrder();
function cleanup(){
 if(disposed)return;disposed=true;mixer.dispose();stopAudio();currentScene?.deliveryView?.destroy();
 if(currentScene)game.destroy(true);
 document.removeEventListener('visibilitychange',hidden);document.removeEventListener('keydown',keydown);window.removeEventListener('pagehide',pagehide);
 root.classList.remove('clock-lab','delivery-lab','delivery-carrying','delivery-complete');
}
function pagehide(event){handlePracticePageHide(event,{pause(){if(practice.status==='playing')pause();},dispose:cleanup});}
window.addEventListener('pagehide',pagehide);
if(import.meta.hot)import.meta.hot.dispose(cleanup);
