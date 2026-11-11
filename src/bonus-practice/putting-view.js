import {PUTTING_HOLES,isPuttingCloseUp} from './putting-state.js';
import {createPuttingGesture} from './putting-input.js';
import {createPuttingReward} from './putting-reward.js';

export function createPuttingView(scene,practice,{onShot,onAim=()=>{}}){
 const ink=scene.add.graphics().setDepth(24),reward=createPuttingReward(scene);
 const gesture=createPuttingGesture(),canvas=scene.game.canvas,camera=scene.cameras.main;
 let captured=null,framing=null,buttonAim=null;
 const enabled=()=>practice.status==='playing'&&practice.state.phase==='aim';
 const point=e=>{
  const box=canvas.getBoundingClientRect();
  return {id:e.pointerId,x:(e.clientX-box.left)/box.width,y:(e.clientY-box.top)/box.width,
   inside:e.clientX>=box.left&&e.clientX<=box.right&&e.clientY>=box.top&&e.clientY<=box.bottom,
   primary:e.isPrimary,button:e.button};
 };
 function releaseCapture(){
  if(captured!==null){const id=captured;captured=null;if(canvas.hasPointerCapture?.(id))canvas.releasePointerCapture(id);}
 }
 function cancelAim(){gesture.cancel();releaseCapture();buttonAim=null;onAim(null);}
 function down(e){
  if(!gesture.start(point(e),enabled()))return;
  e.preventDefault();buttonAim=null;captured=e.pointerId;
  try{canvas.setPointerCapture(e.pointerId);}catch{cancelAim();return;}
  canvas.closest('#game')?.focus({preventScroll:true});
 }
 function move(e){gesture.move(point(e));if(gesture.active)e.preventDefault();}
 function up(e){
  const shot=gesture.end(point(e),enabled());
  if(captured===e.pointerId)releaseCapture();
  if(shot){e.preventDefault();onShot(shot);}onAim(null);
 }
 function cancelled(e){if(captured===e.pointerId)cancelAim();}
 for(const [name,fn] of [['pointerdown',down],['pointermove',move],['pointerup',up],['pointercancel',cancelled],['lostpointercapture',cancelled]])canvas.addEventListener(name,fn);
 function update(state,elapsed,reduced){
  const close=practice.status!=='ready'&&isPuttingCloseUp(state);
  const hole=PUTTING_HOLES[state.holeIndex],key=close?state.holeIndex:'room';
  if(framing!==key){
   framing=key;cancelAim();
   if(close)camera.setZoom(2.35).centerOn(hole.center.x,hole.center.y);
   else camera.setZoom(1).centerOn(480,320);
  }
  scene.dancer.setVisible(!close);
  scene.crowd.people.forEach(p=>p.node.setVisible(!close));
  reward.update(scene.dancer,elapsed,reduced,state.complete);
  ink.clear();
  if(!close){
   if(state.phase==='walking'){
    const alpha=reduced?.7:.55+Math.sin(elapsed*.003)*.18;
    ink.lineStyle(2.2,0xffe2a3,alpha).strokeEllipse(hole.center.x,hole.center.y,hole.radiusX*2,hole.radiusY*2);
    ink.fillStyle(0xffe2a3,.12).fillCircle(hole.tee.x,hole.tee.y,13);
    ink.fillStyle(0xffffff).fillCircle(hole.tee.x,hole.tee.y,4);
   }
   return;
  }
  const {ball}=state;
  ink.lineStyle(1.2,0xffe5a6,.8).strokeEllipse(hole.cup.x,hole.cup.y,15,8);
  if(state.phase==='between'){
   ink.lineStyle(2,0xffdd7c,.9).strokeCircle(hole.cup.x,hole.cup.y,10);return;
  }
  ink.fillStyle(0x06151f,.6).fillEllipse(ball.x+1,ball.y+3,10,5);
  ink.fillStyle(0xffdf90,.15).fillCircle(ball.x,ball.y,9);
  ink.fillStyle(0xffffff).fillCircle(ball.x,ball.y,3.5);
  ink.fillStyle(0xc9d5ce).fillCircle(ball.x+1,ball.y+1,1.6);
  const aim=enabled()?(gesture.vector||buttonAim):null;
  onAim(aim);
  if(aim){
   const power=Math.hypot(aim.x,aim.y),dx=aim.x/power,dy=aim.y/power,length=12+power*75;
   const end={x:ball.x+dx*length,y:ball.y+dy*length};
   ink.lineStyle(1.4,0xffefb9,.9).lineBetween(ball.x+dx*7,ball.y+dy*7,end.x,end.y);
   ink.fillStyle(0xffefb9,.95).fillTriangle(end.x,end.y,end.x-dx*7-dy*3,end.y-dy*7+dx*3,end.x-dx*7+dy*3,end.y-dy*7-dx*3);
  }
 }
 return {update,cancelAim,setButtonAim(vector){buttonAim=vector;},destroy(){
  cancelAim();
  for(const [name,fn] of [['pointerdown',down],['pointermove',move],['pointerup',up],['pointercancel',cancelled],['lostpointercapture',cancelled]])canvas.removeEventListener(name,fn);
  ink.destroy();reward.destroy();camera.setZoom(1).centerOn(480,320);
  scene.dancer.setVisible(true);scene.crowd.people.forEach(p=>p.node.setVisible(true));
 }};
}
