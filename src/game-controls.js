import {bindControlInput} from './movement-input.js';
import {createMotion,commandSwipe,commandStick,brakeMotion,resetMotion,advanceMotion} from './movement-motion.js';
import {movementFactor,bassFactor} from './geometry.js';
import {bassMovementFactor} from './bass-head.js';
import {mysteryDirection,mysterySpeed} from './mystery.js';

const modes=['tap','swipe','stick'];
export function normalizeMovementPreferences(value={}){
 return {mode:modes.includes(value.mode)?value.mode:'tap',sensitivity:Math.max(.6,Math.min(1.6,Number.isFinite(value.sensitivity)?value.sensitivity:1)),hand:value.hand==='right'?'right':'left'};
}
export const readStamina=round=>Math.max(0,Math.min(100,Number.isFinite(round?.stamina)?round.stamina:100));

/** One shared movement/resource path for every main-game control style. */
export function createGameControls(scene){
 const canvas=scene.game.canvas,doc=canvas.ownerDocument;
 const stick=doc.createElement('div');stick.className='movement-stick';stick.hidden=true;stick.setAttribute('aria-hidden','true');
 const knob=doc.createElement('div');knob.dataset.stickKnob='';stick.append(knob);
 // SMF makes .shell fullscreen. Mount directly there, outside the arena's
 // containment, so fixed positioning still uses pointer client coordinates.
 (canvas.closest('.shell')||doc.body).append(stick);
 const panel=doc.createElement('div');panel.className='movement-controls';
 const sprint=doc.createElement('button');sprint.type='button';sprint.className='movement-sprint';sprint.textContent='Sprint';sprint.setAttribute('aria-label','Hold to sprint. Keyboard: Shift.');sprint.setAttribute('aria-pressed','false');
 const meter=doc.createElement('div');meter.className='movement-energy';meter.setAttribute('role','meter');meter.setAttribute('aria-label','Stamina');meter.setAttribute('aria-valuemin','0');meter.setAttribute('aria-valuemax','100');
 const label=doc.createElement('span'),fill=doc.createElement('i');meter.append(label,fill);panel.append(meter,sprint);
 (canvas.closest('#game')?.parentElement||canvas.parentElement).append(panel);
 let preferences=normalizeMovementPreferences(scene.controlPreferences),disposed=false,keyboardMoving=false,lastEnergy=-1;
 const motion=createMotion();motion.stamina=readStamina(scene.round);
 const listeners=new AbortController();
 const input=bindControlInput({surfaces:[canvas],stick,sprintButton:sprint,sprintAnyMode:true,isPlaying:()=>!disposed&&scene.running,
  getMode:()=>preferences.mode,getSensitivity:()=>preferences.sensitivity,getStickSprint:()=>true,
  onFocus:()=>canvas.closest('#game')?.focus({preventScroll:true}),
  onDevice:type=>scene.game.events.emit('round:input',{kind:type==='touch'?'touch':'mouse',runId:scene.round.runId}),
  onSwipe:gesture=>{scene.target=null;commandSwipe(motion,gesture,{sensitivity:preferences.sensitivity,sprint:input.sprint});},
  onStick:(vector,boost)=>{scene.target=null;commandStick(motion,vector,boost);},
  onBrake:immediate=>(immediate?resetMotion:brakeMotion)(motion),
 });
 function shift(event){
  if(!['ShiftLeft','ShiftRight'].includes(event.code))return;
  if(event.type==='keydown'&&(!scene.running||event.target?.matches?.('input,select,textarea')))return;
  input.setSprintModifier(event.type==='keydown');
 }
 doc.addEventListener('keydown',shift,{signal:listeners.signal});doc.addEventListener('keyup',shift,{signal:listeners.signal});
 function paint(){
  panel.hidden=!scene.running;sprint.disabled=!scene.running;
  panel.dataset.hand=preferences.hand;panel.dataset.mode=preferences.mode;stick.dataset.hand=preferences.hand;
  sprint.hidden=preferences.mode==='stick';
  const energy=Math.round(readStamina(scene.round));if(lastEnergy===energy)return;lastEnergy=energy;
  label.textContent=`Stamina ${energy}%`;fill.style.width=`${energy}%`;meter.setAttribute('aria-valuenow',String(energy));
 }
 paint();
 return {
  motion,
  get mode(){return preferences.mode;},
  setPreferences(value){preferences=normalizeMovementPreferences(value);input.cancel();keyboardMoving=false;paint();},
  cancel(){input.cancel();keyboardMoving=false;motion.stamina=readStamina(scene.round);paint();},
  refresh:paint,
  move(delta,keyboard={x:0,y:0}){
   const round=scene.round,stage=scene.stage;
   motion.stamina=readStamina(round);
   const keyboardActive=!!(keyboard.x||keyboard.y);
   if(keyboardActive){
    // Keys retain priority if another touch starts while they are held. Only
    // cancel a fresh takeover so ordinary keyboard frames keep accelerating.
    if(!keyboardMoving||input.hasSteering)input.cancelSteering();
    commandStick(motion,keyboard,input.sprint);scene.target=null;keyboardMoving=true;
   }else if(keyboardMoving){brakeMotion(motion);keyboardMoving=false;}
   const destination=preferences.mode==='tap'?scene.target:null;
   if(destination)commandStick(motion,{x:destination.x-scene.dancer.x,y:destination.y-scene.dancer.y},input.sprint);
   const terrainFactor=movementFactor(scene.dancer,stage.mud,round.slowedMs,stage.obstacles,bassMovementFactor(round.bass,bassFactor(scene.dancer,stage.obstacles)));
   const direction=advanceMotion(motion,scene.dancer,delta,{staminaEnabled:true,terrainFactor,destination,
    speedMultiplier:mysterySpeed(round.mystery)/300*(round.surferMs>0?1.25:1),
    directionTransform:direction=>destination?direction:mysteryDirection(round.mystery,direction),
    arena:{width:960,height:640,playBounds:stage.playBounds,obstacles:stage.obstacles},
   });
   if(destination&&Math.hypot(destination.x-scene.dancer.x,destination.y-scene.dancer.y)<1)scene.target=null;
   round.stamina=motion.stamina;paint();return direction;
  },
  dispose(){if(disposed)return;disposed=true;input.dispose();listeners.abort();stick.remove();panel.remove();},
 };
}
