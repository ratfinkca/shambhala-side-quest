import {createCrowdCollisionFrame} from './crowd-collision.js';
import {createCrowdFriendships} from './crowd-friendship.js';
import {createCrowdSocialView} from './crowd-social-view.js';
import {elapsedMs,roundTiming} from './stage-clock.js';
import {createEncounter} from './festival.js';

// One interaction path for normal runs, bonus rooms and the comparison lab.
// NPCs retain their authored trajectories; only player movement is resolved.
export function createCrowdSocial(scene,{getOptions=()=>({})}={}){
 const view=createCrowdSocialView(scene);
 let friendships=null,previousMs=0,frame=null,suspended=false;
 const options=()=>({enabled:true,baseRadius:26,debug:false,reactions:true,...getOptions()});
 function clearHooks(){frame=null;scene.resolveMovementStep=undefined;scene.crowdEncounterMeasurement=undefined;}
 function clearEncounters(){
  for(const person of scene.crowd.people){
   const saved=person.encounter;
   person.encounter={...createEncounter(),cooldownUntil:saved.cooldownUntil,...(Object.hasOwn(saved,'friendPasses')?{friendPasses:saved.friendPasses}:{})};
   person.smoothAt=-Infinity;person.smooth?.setAlpha(0);
  }
  scene.crowd.lastBumpAt=-Infinity;
 }
 function updateClock(now){
  const wrapped=now<previousMs;
  if(wrapped){
   const duration=roundTiming(scene.round).durationMs;
   for(const person of scene.crowd.people)person.encounter.cooldownUntil=Math.max(0,person.encounter.cooldownUntil-duration);
   // The authored crowd jumps back at a music wrap. Neither that jump nor an
   // unfinished approach from the previous loop is a player-driven pass.
   clearEncounters();view.reset();view.paint(friendships,options());
  }
  previousMs=now;return wrapped;
 }
 const social={
  get friendships(){return friendships;},
  reset(passes=[],at=elapsedMs(scene.round)){
   clearHooks();previousMs=at;suspended=false;
   const {baseRadius,enabled}=options();friendships=createCrowdFriendships(scene.crowd.people,{baseRadius,enabled,passes});
   view.reset();social.paint();
  },
  beforeMove(delta){
   const now=elapsedMs(scene.round),settings=options(),previous=previousMs,wrapped=updateClock(now);suspended=false;
   if(settings.enabled===false){clearHooks();return;}
   // Bonus music may wrap. Do not sweep through a whole backwards set or erase
   // friendships; collision starts at the newly displayed crowd positions.
   const startMs=wrapped?now:previous;
   frame=createCrowdCollisionFrame({people:scene.crowd.people,startMs,endMs:now,stage:scene.stage,timing:roundTiming(scene.round),radii:scene.crowd.people.map(person=>friendships.get(person.id).radius)});
   scene.resolveMovementStep=(...args)=>frame.resolveStep(...args);
   scene.crowdEncounterMeasurement=index=>frame.measurement(index);
  },
  suspend(at=elapsedMs(scene.round)){
   clearHooks();updateClock(at);
   if(!suspended)clearEncounters();suspended=true;
   // Putting continues the music while walking is inactive. Track that clock
   // without replaying hidden crowd movement, and respect its current view.
   view.update([],at,friendships,{...options(),reducedMotion:scene.reducedMotion,reactions:false});
  },
  afterEncounters(encounters){
   const milestones=friendships.record(encounters),byId=new Map(milestones.map(value=>[value.id,value]));
   view.update(encounters.map(encounter=>({...encounter,friendship:byId.get(encounter.id)})),elapsedMs(scene.round),friendships,{...options(),reducedMotion:scene.reducedMotion});
  },
  captureCounts(){return scene.crowd.people.map(person=>friendships?.get(person.id)?.passes??0);},
  paint(){if(friendships)view.paint(friendships,options());},
  destroy(){clearHooks();view.destroy();},
 };
 return social;
}
