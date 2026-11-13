// One completed, continuous stroke per contact. Holds/drags are not steering.
// Recognition uses CSS pixels so touch sensitivity is independent of zoom.
const SWIPE={maxDuration:350,maxIdle:120,progressDistance:4,straightness:.85};
export function bindControlInput({surfaces,stick,sprintButton,isPlaying,getMode,getSensitivity=()=>1,getStickSprint=()=>false,onSwipe,onStick,onBrake,onFocus,onDevice=()=>{},sprintAnyMode=false,now=()=>performance.now()}) {
 let gesture=null,sprint=false,keySprint=false,sprintPointer=null;
 const controller=new AbortController(),listen=(node,type,fn)=>node?.addEventListener(type,fn,{signal:controller.signal});
 const sensitivity=()=>Math.max(.6,Math.min(1.6,Number(getSensitivity())||1));
 const knob=stick.querySelector('[data-stick-knob]')||stick.querySelector('#control-stick-knob');
 function hide(){stick.hidden=true;stick.setAttribute('data-boosting','false');}
 function release(g){if(g?.surface.hasPointerCapture?.(g.id))g.surface.releasePointerCapture(g.id);}
 function showSprint(){sprintButton?.setAttribute('aria-pressed',String(sprint||keySprint));if(gesture&&getMode()==='stick')applyStick();}
 function setSprint(value){sprint=value;showSprint();}
 function setSprintModifier(value){keySprint=value;showSprint();}
 function sampleSwipe(g,point,time){
  if(g.rejected||time<g.sampled)return;
  // Check before updating progress: a resumed stroke must not erase a pause.
  if(time-g.started>SWIPE.maxDuration||time-g.progressAt>SWIPE.maxIdle){g.rejected=true;return;}
  g.travel+=Math.hypot(point.clientX-g.x,point.clientY-g.y);
  g.x=point.clientX;g.y=point.clientY;g.sampled=time;
  g.maxDistance=Math.max(g.maxDistance,Math.hypot(g.x-g.startX,g.y-g.startY));
  // A cumulative deadband tolerates finger wobble and high-frequency samples,
  // but stationary jitter cannot keep a hesitant contact alive indefinitely.
  if(Math.hypot(g.x-g.progressX,g.y-g.progressY)>=SWIPE.progressDistance){g.progressAt=time;g.progressX=g.x;g.progressY=g.y;}
 }
 function trackSwipe(g,event){
  const sampled=g.nativeTime?event.timeStamp:now();
  if(!Number.isFinite(sampled)||sampled<g.sampled){g.rejected=true;return;}
  // Browsers may batch samples. Preserve their relative timings/path instead
  // of mistaking a smooth batch for a pause, or hiding a pause in its endpoint.
  // Use one native event clock for the whole contact, never dispatch timing.
  const samples=g.nativeTime?(event.getCoalescedEvents?.()??[]):[];
  for(const sample of samples){
   if(!Number.isFinite(sample.timeStamp)||sample.timeStamp>sampled)continue;
   sampleSwipe(g,sample,sample.timeStamp);
  }
  sampleSwipe(g,event,sampled);
 }
 function recogniseSwipe(g){
  if(g.rejected)return;
  const durationMs=Math.max(1,g.sampled-g.started),dx=g.x-g.startX,dy=g.y-g.startY,distance=Math.hypot(dx,dy),response=sensitivity();
  if(distance<18/response||distance/durationMs<.3/response||distance<g.travel*SWIPE.straightness)return;
  g.fired=true;onDevice(g.pointerType);onSwipe({dx,dy,durationMs});
 }
 function applyStick(){
  if(!gesture)return;
  const response=sensitivity(),outerSprint=!!getStickSprint(),normalRadius=42/response,deadzone=6/response;
  const radius=(outerSprint?112:42)/response,sprintStart=76/response;
  let dx=gesture.x-gesture.originX,dy=gesture.y-gesture.originY,length=Math.hypot(dx,dy);
  // Soften only the base following at the outer edge. Direction never lerps.
  // Bound elastic overtravel so a long drag cannot leave the base far behind.
  if(length>radius){
   const follow=outerSprint?Math.max((length-radius)*.35,length-radius-12/response):length-radius;
   gesture.originX+=dx*follow/length;gesture.originY+=dy*follow/length;
   dx=gesture.x-gesture.originX;dy=gesture.y-gesture.originY;length=Math.hypot(dx,dy);
  }
  // A broad normal-speed band keeps routine steering out of sprint. The
  // smooth ramp also avoids a speed jump when a thumb wobbles at the edge.
  const push=outerSprint?Math.max(0,Math.min(1,(length-sprintStart)/(radius-sprintStart))):0;
  gesture.stickBoost=push*push*(3-2*push);
  const boost=sprint||keySprint?1:gesture.stickBoost;
  stick.hidden=false;stick.style.left=`${gesture.originX}px`;stick.style.top=`${gesture.originY}px`;
  stick.style.width=`${radius*2}px`;stick.style.height=`${radius*2}px`;
  stick.style.setProperty('--stick-normal-diameter',`${normalRadius*2}px`);stick.style.setProperty('--stick-sprint-diameter',`${sprintStart*2}px`);stick.style.setProperty('--stick-boost',String(boost));
  stick.setAttribute('data-sprint-ring',String(outerSprint));stick.setAttribute('data-boosting',String(boost>0));
  const visible=length>radius?radius/length:1;knob.style.transform=`translate(${dx*visible}px,${dy*visible}px)`;
  const magnitude=length<deadzone?0:Math.min(1,(length-deadzone)/(normalRadius-deadzone));
  if(magnitude)onDevice(gesture.pointerType);
  onStick({x:length?dx/length*magnitude:0,y:length?dy/length*magnitude:0},outerSprint?boost:!!(sprint||keySprint));
 }
 function cancelSteering(){
  const previous=gesture;gesture=null;release(previous);hide();
  onBrake(true);
 }
 function cancel(){
  cancelSteering();
  if(sprintPointer!==null&&sprintButton.hasPointerCapture?.(sprintPointer))sprintButton.releasePointerCapture(sprintPointer);
  sprintPointer=null;keySprint=false;setSprint(false);
 }
 for(const surface of surfaces){
  listen(surface,'pointerdown',event=>{
   if(!isPlaying()||!['swipe','stick'].includes(getMode())||gesture||event.button!==0||event.target!==surface)return;
   event.preventDefault();onFocus();
   const nativeTime=Number.isFinite(event.timeStamp)&&event.timeStamp>=0,started=nativeTime?event.timeStamp:now();
   gesture={id:event.pointerId,pointerType:event.pointerType,surface,originX:event.clientX,originY:event.clientY,startX:event.clientX,startY:event.clientY,x:event.clientX,y:event.clientY,nativeTime,started,sampled:started,progressAt:started,progressX:event.clientX,progressY:event.clientY,travel:0,maxDistance:0,fired:false,rejected:false};
   surface.setPointerCapture(event.pointerId);
   if(getMode()==='stick')applyStick();
  });
  listen(surface,'pointermove',event=>{
   if(gesture?.id!==event.pointerId)return;
   if(!isPlaying()){cancel();return;}
   if(getMode()==='stick'){gesture.x=event.clientX;gesture.y=event.clientY;applyStick();}
   else trackSwipe(gesture,event);
  });
  listen(surface,'pointerup',event=>{
   if(gesture?.id!==event.pointerId)return;
   const previous=gesture;
   if(isPlaying()&&getMode()==='swipe'){trackSwipe(previous,event);recogniseSwipe(previous);}
   gesture=null;release(previous);hide();
   if(!isPlaying())return;
   if(getMode()==='stick'||(!previous.fired&&!previous.rejected&&previous.maxDistance<8))onBrake(false);
  });
  listen(surface,'pointercancel',event=>{if(gesture?.id===event.pointerId)cancel();});
  listen(surface,'lostpointercapture',event=>{if(gesture?.id===event.pointerId)cancel();});
  listen(surface,'contextmenu',event=>event.preventDefault());
 }
 listen(sprintButton,'pointerdown',event=>{
  if(!isPlaying()||!sprintAnyMode&&getMode()!=='stick'||event.button!==0||sprintPointer!==null)return;
  event.preventDefault();sprintPointer=event.pointerId;sprintButton.setPointerCapture(event.pointerId);onDevice(event.pointerType);setSprint(true);
 });
 for(const type of ['pointerup','pointercancel','lostpointercapture'])listen(sprintButton,type,event=>{if(event.pointerId===sprintPointer){sprintPointer=null;setSprint(false);}});
 listen(sprintButton,'keydown',event=>{if(isPlaying()&&(sprintAnyMode||getMode()==='stick')&&[' ','Enter'].includes(event.key)){event.preventDefault();setSprint(true);}});
 listen(sprintButton,'keyup',event=>{if([' ','Enter'].includes(event.key)){event.preventDefault();setSprint(false);}});
 listen(sprintButton,'blur',()=>setSprint(false));
 return {cancel,cancelSteering,setSprintModifier,get hasSteering(){return gesture!==null;},get sprint(){return !!(sprint||keySprint||gesture?.stickBoost);},dispose(){cancel();controller.abort();}};
}
