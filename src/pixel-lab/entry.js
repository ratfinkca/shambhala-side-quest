import './style.css';
import {loadPixelArtwork,drawPixelFrame,PIXEL_CLIPS} from './artwork.js';
import {createPixelMotion,advancePixelMotion,pixelFrame} from './animation.js';

const root=document.querySelector('.shell'),listeners=new AbortController();
root.className='shell pixel-lab';
root.innerHTML=`<header class="pixel-heading"><div><p class="pixel-eyebrow">SIDE QUEST · ART REHEARSAL 01</p><h1>Pixel Afterparty<span>Find the groove.</span></h1></div><span class="pixel-local">LOCAL PREVIEW<br><b>Nothing is saved</b></span></header>
<p class="pixel-intro">Inspect the same character frames used in the game. Choose an animation, slow it down, or step through each pose; then try it on the dancefloor.</p>
<div id="pixel-loading" role="status">Unpacking the wardrobe…</div>
<div class="pixel-workspace" hidden>
<section class="pixel-panel pixel-inspector" aria-labelledby="pixel-study-title"><div class="pixel-panel-top"><h2 id="pixel-study-title">The motion study</h2><span id="pixel-frame-label">FRAME 01 / 06</span></div>
<div class="pixel-study"><canvas id="pixel-viewer" width="400" height="300" aria-label="Enlarged animated raver preview"></canvas><span id="pixel-motion-label">Idle groove</span></div>
<div class="pixel-fields"><label>Animation<select id="pixel-clip"><option value="auto">Follow the dancefloor</option>${Object.entries(PIXEL_CLIPS).filter(([,v])=>v.type==='raver').map(([key,v])=>`<option value="${key}">${v.label}</option>`).join('')}</select></label><label>Close-up scale<select id="pixel-zoom"><option value="1">1× · game size</option><option value="2">2×</option><option value="3">3×</option><option value="4" selected>4×</option></select></label></div>
<label class="pixel-rate">Playback speed <select id="pixel-rate"><option value="1">Normal</option><option value="0.5">Half speed</option><option value="0.25">Quarter speed</option></select></label><div class="pixel-playback"><button id="pixel-pause">Pause animation</button><button id="pixel-prev" aria-label="Previous frame">← Frame</button><button id="pixel-next" aria-label="Next frame">Frame →</button></div>
<div id="pixel-contact" class="pixel-contact" aria-label="Current animation contact sheet"></div>
<label class="pixel-check"><input id="pixel-mirror" type="checkbox"> Mirror facing (left)</label><label class="pixel-check"><input id="pixel-anchors" type="checkbox"> Show foot anchor</label><label class="pixel-check"><input id="pixel-reduced" type="checkbox"> Quieter idle and effects</label>
</section>
<section class="pixel-panel pixel-floor-panel" aria-labelledby="pixel-floor-title"><div class="pixel-panel-top"><h2 id="pixel-floor-title">Try the dancefloor</h2><span id="pixel-speed">DANCE-STEP</span></div>
<div class="pixel-floor-wrap"><canvas id="pixel-floor" width="520" height="420" tabindex="0" aria-label="Animation test floor. Tap a destination or use WASD and arrow keys. Hold Sprint or Shift to run."></canvas><div id="pixel-floor-note">Tap to move · WASD / arrows</div></div>
<div class="pixel-floor-actions"><button id="pixel-sprint" class="pixel-primary">Hold to sprint</button><button id="pixel-friend">Make a friend ♡</button><button id="pixel-bass">Bass Head</button></div>
<p class="pixel-floor-copy">Dance-step at normal speed. Hold Sprint or Shift for a playful run. This floor tests animation only; it does not change your score or wardrobe.</p>
<div class="pixel-effects" aria-label="Animated pickups and effects">${[['spark','Spark'],['flow','Flow'],['friend','Friendship'],['bass','Bass Head']].map(([key,label])=>`<div><canvas data-effect="${key}" width="100" height="90" aria-label="${label} animation"></canvas><span>${label}</span></div>`).join('')}</div>
</section></div>
<footer class="pixel-footer"><span>Motion study · corrected alternating feet · four facings</span><span>Pixel art in progress, not a new game mode.</span></footer>`;
const $=selector=>root.querySelector(selector),on=(node,event,fn)=>node.addEventListener(event,fn,{signal:listeners.signal});
const viewer=$('#pixel-viewer'),floor=$('#pixel-floor'),vctx=viewer.getContext('2d'),fctx=floor.getContext('2d');
const state=createPixelMotion(),keys=new Set(),effects=[...root.querySelectorAll('[data-effect]')];
const previewState=createPixelMotion();
let previewElapsed=0;
let artwork=null,paused=false,disposed=false,lastTime=null,raf=0,target=null,sprintHeld=false,steppedFrame=null,friendAt=-Infinity,bassAt=-Infinity,contactClip='',contactCanvases=[];
const quietMedia=window.matchMedia('(prefers-reduced-motion: reduce)');$('#pixel-reduced').checked=quietMedia.matches;
function text(node,value){if(node.textContent!==value)node.textContent=value;}
function resetInput(stop=false){keys.clear();sprintHeld=false;target=null;if(stop)state.vx=state.vy=state.speed=0;$('#pixel-sprint').classList.remove('held');}
function setPaused(value){paused=value;lastTime=null;if(value)resetInput();else{steppedFrame=null;resetInput(true);}text($('#pixel-pause'),value?'Play animation':'Pause animation');text($('#pixel-floor-note'),value?'Paused · inspect a frame, or play again':'Tap to move · WASD / arrows');}
function contactSheet(clip){
 if(contactClip===clip)return;contactClip=clip;const count=PIXEL_CLIPS[clip].frames;
 $('#pixel-contact').innerHTML=Array.from({length:count},(_,index)=>`<button type="button" data-frame="${index}" aria-label="Inspect frame ${index+1}"><canvas width="64" height="72" aria-hidden="true"></canvas><span>${String(index+1).padStart(2,'0')}</span></button>`).join('');
 contactCanvases=[...$('#pixel-contact').querySelectorAll('canvas')];

}
function anchor(ctx,x,y){ctx.save();ctx.strokeStyle='#ffca78';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x-6,y);ctx.lineTo(x+6,y);ctx.moveTo(x,y-6);ctx.lineTo(x,y+6);ctx.stroke();ctx.restore();}
function sprite(ctx,clip,index,x,y,scale=1,flip=false){ctx.imageSmoothingEnabled=false;drawPixelFrame(ctx,artwork,clip,index,Math.round(x),Math.round(y),scale,flip);}
function effectIndex(name,offset=0){const clip=PIXEL_CLIPS[name];return $('#pixel-reduced').checked?0:Math.floor((state.elapsed+offset)*clip.fps/1000)%clip.frames;}
function drawFloor(){
 fctx.imageSmoothingEnabled=false;fctx.fillStyle='#102d36';fctx.fillRect(0,0,520,420);
 fctx.fillStyle='#0a222c';fctx.fillRect(0,0,520,108);fctx.fillStyle='#1b4650';fctx.fillRect(16,95,488,5);
 for(let x=30;x<500;x+=46){fctx.fillStyle=x%3?'#183a42':'#20424a';fctx.fillRect(x,130+(x%4)*44,3,3);}
 // An intentionally simple test floor keeps texture detail from hiding frame seams.
 fctx.fillStyle='#75578b';for(const x of [90,415]){fctx.fillRect(x,30,16,35);fctx.fillStyle='#3c8792';fctx.fillRect(x+4,36,8,4);fctx.fillStyle='#75578b';}
 fctx.fillStyle='#355460';fctx.fillRect(205,58,110,24);fctx.fillStyle='#c9e990';fctx.fillRect(219,65,12,5);fctx.fillStyle='#a48bd2';fctx.fillRect(244,65,12,5);fctx.fillStyle='#f4c980';fctx.fillRect(269,65,12,5);
 const quiet=$('#pixel-reduced').checked;
 for(const [x,y,offset] of [[102,210,230],[414,245,470],[300,137,810]]){
  fctx.globalAlpha=.7;sprite(fctx,'dance',quiet?0:Math.floor((state.elapsed+offset)*PIXEL_CLIPS.dance.fps/1000)%PIXEL_CLIPS.dance.frames,x,y);fctx.globalAlpha=1;
 }
 for(const [x,y,offset]of [[170,160,100],[347,295,300],[103,330,600]])sprite(fctx,'spark',effectIndex('spark',offset),x,y,.55);
 sprite(fctx,'flow',effectIndex('flow'),430,345,.7);
 if(target){fctx.strokeStyle='#a1e6d5';fctx.lineWidth=1;fctx.strokeRect(Math.round(target.x)-4,Math.round(target.y)-3,8,6);}
 if(state.elapsed-bassAt<2200)sprite(fctx,'bass',effectIndex('bass'),state.x,state.y-2,1.2);
 fctx.fillStyle='#071923';fctx.fillRect(Math.round(state.x)-14,Math.round(state.y)-2,28,5);
 const frame=pixelFrame(state,PIXEL_CLIPS,{reducedMotion:quiet});sprite(fctx,frame.clip,frame.index,state.x,state.y,1,frame.flipX);
 if(state.elapsed-friendAt<1200){const index=Math.min(PIXEL_CLIPS.friend.frames-1,Math.floor((state.elapsed-friendAt)/300));sprite(fctx,'friend',index,state.x,state.y-65,.8);}
 if($('#pixel-anchors').checked)anchor(fctx,state.x,state.y);
}
function draw(){
 if(!artwork||disposed)return;
 const manualClip=$('#pixel-clip').value,quiet=$('#pixel-reduced').checked,zoom=Number($('#pixel-zoom').value);
 Object.assign(previewState,state);if(manualClip!=='auto')previewState.elapsed=previewElapsed;
 const frame=pixelFrame(previewState,PIXEL_CLIPS,{manualClip,reducedMotion:quiet});if(steppedFrame!==null)frame.index=steppedFrame%PIXEL_CLIPS[frame.clip].frames;
 if(manualClip!=='auto')frame.flipX=$('#pixel-mirror').checked;
 const clip=PIXEL_CLIPS[frame.clip];contactSheet(frame.clip);
 vctx.imageSmoothingEnabled=false;vctx.fillStyle='#102932';vctx.fillRect(0,0,400,300);
 vctx.fillStyle='#163640';for(let x=0;x<400;x+=20)for(let y=0;y<300;y+=20)if((x+y)%40===0)vctx.fillRect(x,y,20,20);
 const y=250;vctx.fillStyle='#071923';vctx.fillRect(200-13*zoom,y-2,26*zoom,5);
 sprite(vctx,frame.clip,frame.index,200,y,zoom,frame.flipX);if($('#pixel-anchors').checked)anchor(vctx,200,y);
 text($('#pixel-motion-label'),frame.resting&&frame.clip!=='idle'?`Resting · facing ${state.facing}`:clip.label+(frame.flipX?' · left':''));text($('#pixel-frame-label'),`FRAME ${String(frame.index+1).padStart(2,'0')} / ${String(clip.frames).padStart(2,'0')}`);
 text($('#pixel-speed'),state.speed>1?(state.sprinting?'PLAYFUL RUN':'DANCE-STEP'):'IDLE GROOVE');
 contactCanvases.forEach((canvas,index)=>{const ctx=canvas.getContext('2d');ctx.clearRect(0,0,64,72);sprite(ctx,frame.clip,index,32,62,1,frame.flipX);canvas.parentElement.classList.toggle('active',index===frame.index);});
 drawFloor();
 for(const canvas of effects){const ctx=canvas.getContext('2d'),name=canvas.dataset.effect;ctx.clearRect(0,0,100,90);sprite(ctx,name,effectIndex(name),50,46,1);}
}
function tick(time){
 if(disposed)return;
 const delta=lastTime===null?0:time-lastTime;lastTime=time;
 if(!paused){
  if(delta>0&&delta<=250)previewElapsed+=delta*Number($('#pixel-rate').value);
  const vector={x:Number(keys.has('d')||keys.has('arrowright'))-Number(keys.has('a')||keys.has('arrowleft')),y:Number(keys.has('s')||keys.has('arrowdown'))-Number(keys.has('w')||keys.has('arrowup'))};
  if(vector.x||vector.y)target=null;
  advancePixelMotion(state,{vector,target,sprint:sprintHeld||keys.has('shift'),bounds:{left:28,right:492,top:124,bottom:394}},delta);
  if(target&&Math.hypot(target.x-state.x,target.y-state.y)<.8)target=null;
 }
 draw();raf=requestAnimationFrame(tick);
}
on($('#pixel-contact'),'click',event=>{const button=event.target.closest('button[data-frame]');if(!button)return;setPaused(true);steppedFrame=Number(button.dataset.frame);draw();});
on($('#pixel-pause'),'click',()=>{setPaused(!paused);draw();});
for(const [id,direction]of [['#pixel-prev',-1],['#pixel-next',1]])on($(id),'click',()=>{const frame=pixelFrame(state,PIXEL_CLIPS,{manualClip:$('#pixel-clip').value});setPaused(true);const count=PIXEL_CLIPS[frame.clip].frames;steppedFrame=((steppedFrame??frame.index)+direction+count)%count;draw();});
for(const id of ['#pixel-clip','#pixel-zoom','#pixel-anchors','#pixel-reduced','#pixel-rate','#pixel-mirror'])on($(id),'change',()=>{steppedFrame=null;draw();});
on(floor,'pointerdown',event=>{if(paused)return;const rect=floor.getBoundingClientRect();target={x:Math.max(28,Math.min(492,(event.clientX-rect.left)*520/rect.width)),y:Math.max(124,Math.min(394,(event.clientY-rect.top)*420/rect.height))};floor.focus({preventScroll:true});event.preventDefault();});
on($('#pixel-sprint'),'pointerdown',event=>{if(paused)return;sprintHeld=true;event.currentTarget.setPointerCapture(event.pointerId);event.currentTarget.classList.add('held');event.preventDefault();});
for(const event of ['pointerup','pointercancel','lostpointercapture'])on($('#pixel-sprint'),event,()=>{sprintHeld=false;$('#pixel-sprint').classList.remove('held');});
on($('#pixel-friend'),'click',()=>{friendAt=state.elapsed;draw();});on($('#pixel-bass'),'click',()=>{bassAt=state.elapsed;draw();});
on(window,'keydown',event=>{if(document.activeElement?.matches('select,input'))return;const key=event.key.toLowerCase();if(['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright','shift'].includes(key)){if(!paused)keys.add(key);event.preventDefault();}});
on(window,'keyup',event=>keys.delete(event.key.toLowerCase()));
on(window,'blur',()=>{setPaused(true);draw();});on(document,'visibilitychange',()=>{if(document.hidden){setPaused(true);draw();}});
function dispose(){disposed=true;cancelAnimationFrame(raf);listeners.abort();resetInput();}
if(import.meta.hot)import.meta.hot.dispose(dispose);
on(window,'pagehide',dispose);
try{artwork=await loadPixelArtwork();if(!disposed){$('#pixel-loading').hidden=true;$('.pixel-workspace').hidden=false;draw();raf=requestAnimationFrame(tick);}}
catch(error){$('#pixel-loading').textContent='The sprite sheets could not load. Refresh to try again.';console.error('Pixel animation lab artwork failed',error);}
