import {locomotionCadence} from '../pixel-art/actor-clips.js';
/** Disposable art-preview motion; no gameplay, profile, telemetry or score state. */
export function pixelLabRequested(env={},search=''){
 const query=new URLSearchParams(search);
 return env.DEV===true&&query.has('rehearsal')&&query.has('pixels');
}
export function createPixelMotion(){return {x:260,y:245,vx:0,vy:0,speed:0,facing:'down',gait:0,elapsed:0,sprinting:false,idleAt:0};}
export function pixelFacing(previous,x,y){
 const ax=Math.abs(x),ay=Math.abs(y);if(ax+ay<.01)return previous;
 const horizontal=previous==='left'||previous==='right';
 const useHorizontal=horizontal?ay<=ax*1.2:ax>ay*1.2;
 return useHorizontal?(x<0?'left':'right'):(y<0?'up':'down');
}
export function advancePixelMotion(state,input={},delta=0){
 if(input.paused||!Number.isFinite(delta)||delta<=0||delta>250)return state;
 const dt=Math.min(delta,100)/1000,oldX=state.x,oldY=state.y;
 state.elapsed+=dt*1000;
 let x=Number(input.vector?.x)||0,y=Number(input.vector?.y)||0;
 let distance=Infinity;
 if(!x&&!y&&input.target){x=input.target.x-state.x;y=input.target.y-state.y;distance=Math.hypot(x,y);}
 const length=Math.hypot(x,y),moving=length>.8;
 const speed=moving?(input.sprint?145:78):0;
 if(moving){x/=length;y/=length;state.facing=pixelFacing(state.facing,x,y);}
 // A gentle speed ramp is independent of the discrete, immediately selected pose.
 const blend=1-Math.exp(-dt/(moving?.075:.055));
 state.vx+=(x*speed-state.vx)*blend;state.vy+=(y*speed-state.vy)*blend;
 let dx=state.vx*dt,dy=state.vy*dt;
 if(distance!==Infinity&&(distance<=.8||Math.hypot(dx,dy)>=distance)){
  state.x=input.target.x;state.y=input.target.y;dx=0;dy=0;state.vx=0;state.vy=0;
 }else{state.x+=dx;state.y+=dy;}
 const wasMoving=state.speed>1;
 if(input.bounds){
  const bounds=input.bounds,nextX=Math.max(bounds.left,Math.min(bounds.right,state.x)),nextY=Math.max(bounds.top,Math.min(bounds.bottom,state.y));
  if(nextX!==state.x)state.vx=0;if(nextY!==state.y)state.vy=0;
  state.x=nextX;state.y=nextY;dx=nextX-oldX;dy=nextY-oldY;
 }
 state.speed=input.bounds?Math.hypot(dx,dy)/dt:Math.hypot(state.vx,state.vy);
 if(!moving&&state.speed<2){state.vx=0;state.vy=0;state.speed=0;}
 state.sprinting=Boolean(input.sprint)&&moving;
 if(state.speed>1)state.gait+=locomotionCadence(state.speed,state.sprinting,{walkSpeed:78,runSpeed:145})*dt/6;
 else if(wasMoving)state.idleAt=state.elapsed;
 return state;
}
export function pixelFrame(state,clips,{manualClip='auto',reducedMotion=false,offsetMs=0}={}){
 const moving=state.speed>1,side=state.facing==='left'||state.facing==='right';
 const resting=manualClip==='auto'&&!moving;
 const clip=manualClip!=='auto'?manualClip:moving?`${state.sprinting?'run':'walk'}${side?'Right':state.facing==='up'?'Up':'Down'}`:side?'restRight':state.facing==='up'?'walkUp':'idle';
 const definition=clips[clip]??clips.idle,frames=definition.frames??6;
 const locomotion=/^(walk|run)/.test(clip);
 const phase=manualClip==='auto'&&moving?state.gait:(state.elapsed+offsetMs-(manualClip==='auto'&&!moving?state.idleAt:0))*(definition.fps??8)/1000/frames;
 const quiet=(reducedMotion&&!locomotion)||(resting&&clip!=='idle');
 const step=quiet?0:Math.floor(Math.max(0,phase)*frames)%frames;
 // Keep the logical cycle step for the inspector/stepping controls. The artwork
 // atlas resolves source column and optional reconstructed opposite-foot pose.
 return {clip,index:step,flipX:manualClip==='auto'&&state.facing==='left',resting};
}
