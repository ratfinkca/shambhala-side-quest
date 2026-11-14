import {BONUSES,createTourProfile,createFestival,collectInvitation,finishMain,choosePerk,beginBonus,stageForRun} from '../../src/smf-tour/model.js';
import {createRound} from '../../src/game.js';

/** Enter through the same invitation and qualified-parent transitions as a run. */
export function invitedBonusVisit(id,visitId=`visit-${id}`,profile=createTourProfile()){
 const bonus=BONUSES.find(item=>item.id===id);
 if(!bonus)throw Error(`Unknown bonus fixture: ${id}`);
 if(profile.active)throw Error('Bonus fixture requires a profile without an active run');
 let next=createFestival(profile,`run-${visitId}`);
 while(true){
  const stage=stageForRun(next.active),atParent=stage.id===bonus.parentId;
  if(atParent)next=collectInvitation(next);
  const round={...createRound({},stage.timingId),runId:next.active.id,ended:true,remainingMs:0,pickups:stage.target,score:100};
  next=finishMain(next,round);
  if(atParent)return beginBonus(next,id,visitId);
  next=choosePerk(next,null);
 }
}

/** Pre-consumable-invitation save shape, retained only to test safe recovery. */
export function legacyExploreVisit(id,visitId=`legacy-${id}`){
 const profile=createFestival(createTourProfile(),visitId);
 profile.discoveries=[id];
 profile.active.status='explore';
 profile.active.bonus={id,visitId,status:'playing',scene:null,activity:null,returnTo:'title'};
 return profile;
}
