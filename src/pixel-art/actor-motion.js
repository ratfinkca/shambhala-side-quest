import {ACTOR_CLIPS,locomotionCadence,orderedPose} from './actor-clips.js';
/** Presentation-only clock. No position, speed, stamina, encounters or scores are changed. */
export function createActorMotion(){return {facing:'down',gait:0,speed:0,sprinting:false,lastElapsed:null,lastX:null,lastY:null,dancing:false};}
export function resetActorMotion(state,{x=null,y=null,elapsed=null,facing='down'}={}){
 Object.assign(state,createActorMotion(),{lastX:x,lastY:y,lastElapsed:elapsed,facing});return state;
}
export function actorFacing(previous,x,y){
 const ax=Math.abs(x),ay=Math.abs(y);if(ax+ay<.01)return previous;
 const horizontal=previous==='left'||previous==='right';
 return (horizontal?ay<=ax*1.2:ax>ay*1.2)?(x<0?'left':'right'):(y<0?'up':'down');
}
export function advanceActorMotion(state,{x=0,y=0,speed=0,sprinting=false,elapsed=0,dancing=false}={}){
 const now=Number.isFinite(elapsed)?elapsed:0;
 const delta=state.lastElapsed===null?0:now-state.lastElapsed;
 if(delta<0){state.gait=0;state.lastX=x;state.lastY=y;}
 const dx=state.lastX===null?0:x-state.lastX,dy=state.lastY===null?0:y-state.lastY;
 // The caller's actualSpeed excludes passive crowd shoves. No held-input gait.
 state.speed=Number.isFinite(speed)?Math.max(0,speed):0;state.sprinting=Boolean(sprinting)&&state.speed>2;state.dancing=Boolean(dancing);
 if(state.speed>2&&delta>0&&delta<=250){
  state.facing=actorFacing(state.facing,dx,dy);
  const travelled=Math.hypot(dx,dy);
  if(travelled>.01)state.gait+=locomotionCadence(state.speed,state.sprinting)*delta/1000/6;
 }
 state.lastX=x;state.lastY=y;state.lastElapsed=now;
 return state;
}
export function actorPose(state,elapsed=0,{reduced=false,phase=0}={}){
 const moving=state.speed>2,side=state.facing==='left'||state.facing==='right';
 const clip=moving?`${state.sprinting?'run':'walk'}${side?'Right':state.facing==='up'?'Up':'Down'}`:state.dancing?'dance':side?'restRight':state.facing==='up'?'walkUp':'idle';
 const spec=ACTOR_CLIPS[clip];
 const quiet=(!moving&&clip!=='idle'&&clip!=='dance')||(reduced&&!moving);
 const p=quiet?0:moving?state.gait:(elapsed+phase)*spec.fps/1000/spec.order.length;
 const {row,index,step,mirror}=orderedPose(clip,p),facingFlipX=state.facing==='left'&&!state.dancing;
 return {clip,row,index,step,frame:row*6+index,flipX:facingFlipX!==mirror,facingFlipX,poseMirror:mirror,moving};
}
