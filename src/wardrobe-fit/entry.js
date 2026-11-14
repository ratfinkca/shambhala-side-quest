import Phaser from 'phaser';
import './style.css';
import {createAvatar,setOutfit,animateAvatar,getAvatarAnchors,setAvatarCarry} from '../Avatar.js';
import {loadActorSource} from '../pixel-art/actor-textures.js';
import {createHeldPropView} from '../pixel-art/held-prop.js';
import {WARDROBE,CHARACTER_OPTIONS,normalizeOutfit} from '../wardrobe.js';
import {FIT_FACINGS,FIT_POSES,FIT_STAFFS,fitPoseInput} from './model.js';

const root=document.querySelector('.shell'),listeners=new AbortController();
root.className='shell wardrobe-fit-lab';
const options=(values,selected)=>values.map(({id,name})=>`<option value="${id}"${id===selected?' selected':''}>${name}</option>`).join('');
const state={outfit:normalizeOutfit({onesie:'lime',hat:'bucket',totem:'star',flair:'none'}),staff:'none',pose:'walk',facing:'right',rate:.5,phase:0,playing:true,guides:true};
root.innerHTML=`<header class="fit-heading"><div><p>LOCAL ART REHEARSAL</p><h1>Wardrobe fitting room</h1></div><a href="?rehearsal&pixels">Motion study →</a></header>
<p class="fit-intro">The actual game avatar, hats and totems, rendered by Phaser. Nothing is saved, unlocked or shared here. All wardrobe choices are available for fitting.</p>
<form class="fit-controls" onsubmit="return false">${Object.keys(WARDROBE).map(key=>`<label>${{onesie:'Outfit',hat:'Hat',totem:'Totem',flair:'Flourish'}[key]}<select data-outfit="${key}" aria-label="${key}">${options(WARDROBE[key],state.outfit[key])}</select></label>`).join('')}${Object.entries(CHARACTER_OPTIONS).map(([key,values])=>`<label>${{face:'Face',hair:'Hair',skinTone:'Skin tone'}[key]}<select data-fit-appearance="${key}">${options(values,state.outfit.appearance[key])}</select></label>`).join('')}<label>Earned staff<select id="fit-staff">${options(FIT_STAFFS,state.staff)}</select></label></form>
<p class="fit-note">An earned staff temporarily takes the place of your wardrobe totem. Choose “No earned staff” to restore that totem.</p>
<section class="fit-playback" aria-label="Pose controls"><label>Pose<select id="fit-pose">${options(FIT_POSES.map(id=>({id,name:{rest:'Rest',dance:'Dance',walk:'Dance-step',run:'Sprint'}[id]})),state.pose)}</select></label><label>Inspect facing<select id="fit-facing">${options(FIT_FACINGS.map(([id,name])=>({id,name})),state.facing)}</select></label><label>Playback<select id="fit-rate"><option value="1">Normal</option><option value="0.5" selected>Half speed</option><option value="0.25">Quarter speed</option></select></label><button id="fit-play" type="button">Pause</button><button id="fit-prev" type="button" aria-label="Previous pose">← Pose</button><button id="fit-next" type="button" aria-label="Next pose">Pose →</button><label class="fit-guides"><input id="fit-guides" type="checkbox" checked> Attachment guides</label></section>
<div class="fit-frame"><label for="fit-frame">Manual pose</label><input id="fit-frame" type="range" min="0" max="5" step="1" value="0"><output id="fit-readout" for="fit-frame">Loading the production artwork…</output></div>
<p id="fit-status" role="status">Loading the production artwork…</p><div id="wardrobe-fit-stage" aria-label="Four facings, each shown at three times size and native size"></div>
<p class="fit-note">Gold: feet · pink: head anchor · mint: hand grip. Scale labels describe the game’s avatar scale; the preview fits smaller screens. Dance uses the game’s forward-facing dance clip. Frame stepping keeps its real mirrored poses and hand placement.</p>`;
const $=selector=>root.querySelector(selector),on=(node,event,fn)=>node.addEventListener(event,fn,{signal:listeners.signal});
let game=null,scene=null,actors=[],labels=[],nativeLabels=[],backdrop=null,guides=null,disposed=false,columns=4,lastReadout='',allReady=false;
function refreshButtons(){
 const resting=state.pose==='rest';$('#fit-play').textContent=state.playing?'Pause':'Play';$('#fit-play').disabled=resting;
 for(const selector of ['#fit-prev','#fit-next','#fit-frame'])$(selector).disabled=resting;
 $('#fit-frame').max=resting?'0':'5';
}
function applyOutfit(){for(const {avatar}of actors)setOutfit(avatar,state.outfit);allReady=false;$('#fit-status').textContent='Changing the outfit…';render();}
function applyStaff(){
 const selected=FIT_STAFFS.find(item=>item.id===state.staff);
 for(const actor of actors){
  actor.held?.destroy();actor.held=null;
  setAvatarCarry(actor.avatar,Boolean(selected?.kind));
  if(selected?.kind)actor.held=createHeldPropView(actor.context,selected.kind,selected);
 }
 allReady=false;render();
}
function layout(){
 if(!scene)return;columns=window.innerWidth<700?2:4;
 const width=columns*240,height=Math.ceil(4/columns)*440;
 scene.scale.resize(width,height);root.style.setProperty('--fit-width',`${width}px`);
 actors.forEach(({avatar,facing,scale})=>{const index=FIT_FACINGS.findIndex(([id])=>id===facing),x=(index%columns)*240+120,y=Math.floor(index/columns)*440+(scale===3?280:393);avatar.setPosition(x,y).setScale(scale);});
 labels.forEach((node,index)=>node.setPosition(index%columns*240+120,Math.floor(index/columns)*440+21));
 nativeLabels.forEach((node,index)=>node.setPosition(index%columns*240+30,Math.floor(index/columns)*440+386));render();
}
function render(){
 if(!scene||disposed)return;guides.clear();backdrop.clear();
 FIT_FACINGS.forEach(([facing],index)=>{
  const x=index%columns*240,y=Math.floor(index/columns)*440;
  backdrop.fillStyle(facing===state.facing?0x193b45:0x102a34).fillRect(x+3,y+3,234,434);
  backdrop.lineStyle(facing===state.facing?2:1,facing===state.facing?0xb9df8f:0x38515c).strokeRect(x+3,y+3,234,434);
  for(const yy of [y+328,y+409])backdrop.lineStyle(1,0x6e8b8f,.55).lineBetween(x+25,yy,x+215,yy);
 });
 for(const {avatar,facing,scale,held}of actors){
  const input=fitPoseInput(state.pose,facing,state.phase);Object.assign(avatar.pixelMotion,input.motion);avatar.pixelDance=input.dancing;
  animateAvatar(avatar,input.elapsed,input.reduced,false);
  held?.update(avatar,input.elapsed,input.reduced,true);
  if(state.guides){
   const anchors=getAvatarAnchors(avatar);
   for(const [key,color]of [['feet',0xf5cb80],['head',0xe995ca],['hand',0x89dfcb]]){
    const p=anchors[key],x=avatar.x+p.x*scale,y=avatar.y+p.y*scale;
    guides.lineStyle(1,color,.9).lineBetween(x-4,y,x+4,y).lineBetween(x,y-4,x,y+4);
   }
  }
 }
 const selected=actors.find(a=>a.facing===state.facing&&a.scale===3)?.avatar.pixelPose;
 const frame=Math.floor(state.phase)%6;$('#fit-frame').value=String(state.pose==='rest'?0:frame);
 const message=selected?`Pose ${state.pose==='rest'?1:frame+1} / ${state.pose==='rest'?1:6} · ${selected.clip} · texture frame ${selected.frame}`:'';
 if(message!==lastReadout){$('#fit-readout').textContent=message;lastReadout=message;}
 if(!allReady&&actors.every(({avatar})=>avatar.pixelTextureReady&&avatar.pixelHeadReady)){
  allReady=true;$('#fit-status').textContent='Production avatar loaded · all facings ready';
 }
}
function step(direction){state.playing=false;state.phase=((Math.floor(state.phase)+direction)%6+6)%6;refreshButtons();render();}
on(root,'change',event=>{
 const node=event.target;if(node.matches('[data-outfit]')){state.outfit[node.dataset.outfit]=node.value;applyOutfit();return;}
 if(node.matches('[data-fit-appearance]')){state.outfit.appearance={...state.outfit.appearance,[node.dataset.fitAppearance]:node.value};applyOutfit();return;}
 if(node.id==='fit-staff'){state.staff=node.value;applyStaff();return;}
 if(node.id==='fit-pose'){state.pose=node.value;state.phase=0;refreshButtons();}
 if(node.id==='fit-facing')state.facing=node.value;
 if(node.id==='fit-rate')state.rate=Number(node.value);
 if(node.id==='fit-guides')state.guides=node.checked;
 render();
});
on($('#fit-play'),'click',()=>{state.playing=!state.playing;refreshButtons();});
on($('#fit-prev'),'click',()=>step(-1));on($('#fit-next'),'click',()=>step(1));
on($('#fit-frame'),'input',event=>{state.playing=false;state.phase=Number(event.target.value);refreshButtons();render();});
on(window,'resize',layout);
on(window,'blur',()=>{state.playing=false;refreshButtons();});
on(document,'visibilitychange',()=>{if(document.hidden){state.playing=false;refreshButtons();}});
function dispose(){if(disposed)return;disposed=true;listeners.abort();for(const actor of actors)actor.held?.destroy();game?.destroy(true);}
on(window,'pagehide',dispose);if(import.meta.hot)import.meta.hot.dispose(dispose);
refreshButtons();
try{
 await loadActorSource();
 if(!disposed)game=new Phaser.Game({type:Phaser.CANVAS,parent:'wardrobe-fit-stage',width:960,height:440,backgroundColor:'#071d27',banner:false,audio:{noAudio:true},fps:{target:30},scene:{
  create(){
   scene=this;backdrop=this.add.graphics().setDepth(-1);guides=this.add.graphics().setDepth(10);
   labels=FIT_FACINGS.map(([,name])=>this.add.text(0,0,`${name} · 3×`,{fontFamily:'monospace',fontSize:'15px',color:'#e5efd1'}).setOrigin(.5));
   nativeLabels=FIT_FACINGS.map(()=>this.add.text(0,0,'1×',{fontFamily:'monospace',fontSize:'12px',color:'#abc4c0'}));
   for(const [facing]of FIT_FACINGS)for(const scale of [3,1]){
    const avatar=createAvatar(this,state.outfit).setDepth(2);
    // Preserve Phaser's scene services while supplying this preview's player.
    const context=Object.assign(Object.create(this),{avatar,dancer:avatar});
    actors.push({facing,scale,avatar,context,held:null});
   }
   layout();applyStaff();
  },
  update(_time,delta){if(state.playing&&state.pose!=='rest'&&delta>0&&delta<250)state.phase=(state.phase+delta*state.rate*(state.pose==='run'?12:8)/1000)%6;render();},
 }});
}catch(error){$('#fit-status').textContent='The production artwork could not load. Refresh to try again.';console.error('Wardrobe fitting artwork failed',error);}
