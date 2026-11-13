import {moveInArena} from './geometry.js';

// Shared pure movement model. Main-game controls share ordinary/sprint speeds
// and stamina; rehearsal can compare the same movement with stamina disabled.
export const CONTROL_MOTION=Object.freeze({walkSpeed:300,sprintSpeed:480,acceleration:2200,deceleration:2600,swipeAcceleration:6000,swipeDeceleration:4000,swipeMinDuration:300,swipeMaxDuration:500,staminaDrain:25,staminaRecovery:20});
const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
const finite=value=>Number.isFinite(value);
const validPoint=p=>p&&finite(p.x)&&finite(p.y);
const zero=()=>({x:0,y:0});
const smooth=t=>t*t*(3-2*t);

export function createMotion(){
 return {speed:0,actualSpeed:0,stamina:100,target:null,heading:zero(),stick:null,swipe:null,source:null,requestedSpeed:0,blockedMs:0};
}

/**
 * A completed swipe starts one finite burst on release. Its endpoint minus
 * start determines direction, independent of player/contact location. Complete
 * stroke length sets driven duration and average velocity sets speed, both
 * bounded and independent of canvas scale rather than mapping travel 1:1.
 */
export function commandSwipe(state,{dx,dy,durationMs}={}, {sensitivity=1,maxSpeed=CONTROL_MOTION.sprintSpeed,sprint=false}={}){
 if(!finite(dx)||!finite(dy)||!finite(durationMs)||durationMs<=0)return false;
 const length=Math.hypot(dx,dy);if(length<.001)return false;
 const direction={x:dx/length,y:dy/length};
 const response=clamp(finite(sensitivity)?sensitivity:1,.6,1.6);
 const velocity=length/Math.max(1,durationMs)*response;
 const power=sprint?1:smooth(clamp((velocity-.3)/1.2,0,1));
 const distancePower=smooth(clamp((length*response-18)/(180-18),0,1));
 const burstMs=CONTROL_MOTION.swipeMinDuration+(CONTROL_MOTION.swipeMaxDuration-CONTROL_MOTION.swipeMinDuration)*distancePower;
 state.target=null;state.stick=null;state.source='swipe';state.swipe={remainingMs:burstMs,durationMs:burstMs,power};state.heading=direction;state.blockedMs=0;
 state.requestedSpeed=Math.min(maxSpeed,CONTROL_MOTION.walkSpeed+(CONTROL_MOTION.sprintSpeed-CONTROL_MOTION.walkSpeed)*power);
 return true;
}

export function commandStick(state,vector,sprint=false){
 if(!validPoint(vector))return false;
 const length=Math.hypot(vector.x,vector.y);
 if(length<.001){brakeMotion(state);return true;}
 const direction={x:vector.x/length,y:vector.y/length},amount=Math.min(1,length);
 if(!state.stick||Math.hypot(state.stick.x-direction.x,state.stick.y-direction.y)>.2)state.blockedMs=0;
 state.target=null;state.swipe=null;state.source='stick';state.stick={...direction,amount};state.heading=direction;
 // Boolean Sprint callers retain their full boost; the outer joystick ring
 // supplies a fractional boost and uses the same proportional stamina cost.
 const boost=sprint===true?1:finite(sprint)?clamp(sprint,0,1):0;
 state.requestedSpeed=(CONTROL_MOTION.walkSpeed+(CONTROL_MOTION.sprintSpeed-CONTROL_MOTION.walkSpeed)*boost)*amount;
 return true;
}

export function brakeMotion(state){state.target=null;state.stick=null;state.swipe=null;state.requestedSpeed=0;state.blockedMs=0;}

export function resetMotion(state,{refill=false}={}){
 const stamina=refill?100:clamp(finite(state.stamina)?state.stamina:100,0,100);
 Object.assign(state,createMotion(),{stamina});
}

/**
 * Advance only active play time. Pause/reset clears motion without ticking this
 * function, so neither stamina nor coasting advances while a menu is showing.
 */
export function advanceMotion(state,position,deltaMs,{staminaEnabled=true,terrainFactor=1,speedMultiplier=1,directionTransform=d=>d,destination=null,arena={}}={}){
 if(!validPoint(position)||!finite(deltaMs)||deltaMs<=0)return zero();
 const elapsed=Math.min(50,deltaMs),factor=clamp(finite(terrainFactor)?terrainFactor:1,0,1)*clamp(finite(speedMultiplier)?speedMultiplier:1,0,4);
 const cfg=CONTROL_MOTION;let traveled=0,lastDirection=zero();
 // Small bounded slices give the same acceleration, braking and resource use
 // on 30/60/120 Hz displays, and preserve the shared obstacle collision rules.
 for(let left=elapsed;left>1e-7;){
  const ms=Math.min(5,left,state.swipe?.remainingMs??Infinity),dt=ms/1000;left-=ms;
  const direction=directionTransform(state.heading);let desired=state.requestedSpeed;
  const boostRequested=state.requestedSpeed>cfg.walkSpeed;
  if(staminaEnabled){
   const available=clamp(state.stamina/15,0,1);
   desired=Math.min(desired,cfg.walkSpeed+(cfg.sprintSpeed-cfg.walkSpeed)*available);
  }
  const oldSpeed=state.speed,swiping=state.source==='swipe';
  const rate=desired>oldSpeed?(swiping?cfg.swipeAcceleration:cfg.acceleration):(swiping?cfg.swipeDeceleration:cfg.deceleration);
  state.speed=oldSpeed+clamp(desired-oldSpeed,-rate*dt,rate*dt);
  if(!state.swipe&&!state.stick&&state.speed<.5)state.speed=0;
  const averageSpeed=(oldSpeed+state.speed)/2,travel=Math.min(averageSpeed*factor*dt,destination?Math.hypot(destination.x-position.x,destination.y-position.y):Infinity);
  const before={x:position.x,y:position.y};
  if(travel>0&&Math.hypot(direction.x,direction.y)>0){
   moveInArena(position,direction,ms,{...arena,speed:travel/dt});
   lastDirection=direction;
  }
  const moved=Math.hypot(position.x-before.x,position.y-before.y);traveled+=moved;
  const movementShare=travel>0?Math.min(1,moved/travel):0;
  if(staminaEnabled){
   const extra=clamp((averageSpeed-cfg.walkSpeed)/(cfg.sprintSpeed-cfg.walkSpeed),0,1);
   if(extra>0)state.stamina=Math.max(0,state.stamina-cfg.staminaDrain*extra*dt*movementShare);
   else if(!boostRequested)state.stamina=Math.min(100,state.stamina+cfg.staminaRecovery*dt);
   if(state.stamina<.001)state.stamina=0;
  }
  if(state.swipe){state.swipe.remainingMs-=ms;if(state.swipe.remainingMs<1e-7)brakeMotion(state);}
  if(destination&&Math.hypot(destination.x-position.x,destination.y-position.y)<1){resetMotion(state);break;}
  if(travel>.01&&moved<.001){
   state.blockedMs+=ms;if(state.blockedMs>=150)resetMotion(state);
  }else if(moved>.001)state.blockedMs=0;
 }
 state.actualSpeed=traveled/(elapsed/1000);
 return state.speed>0?{...lastDirection}:zero();
}
