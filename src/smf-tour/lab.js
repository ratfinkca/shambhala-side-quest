import {createTourProfile,collectInvitation} from './model.js';
// DEV-only, separate profile/lock key. These visible controls exercise the same
// transitions as play without altering anyone's real Festival profile.
export function mountTourLab(node,{getProfile,commit,load,render,scene,activity,finish,home}){
 node.hidden=false;node.className='tour-lab';
 node.innerHTML='<details><summary>Tour integration lab · separate test saves</summary><p>Real Festival saves are untouched. These shortcuts are for testing route and reward transitions.</p><button class="quiet-button" data-lab="invite">Collect invitation (lab)</button><button class="quiet-button" data-lab="clear">Clear current stage (lab)</button><button class="quiet-button" data-lab="win">Complete bonus (lab)</button><button class="quiet-button" data-lab="reset">Reset lab profile</button></details>';
 node.addEventListener('click',e=>{
  const action=e.target.closest('[data-lab]')?.dataset.lab,a=getProfile().active;if(!action)return;
  if(action==='reset'){scene()?.pauseTour();commit(createTourProfile());home();return;}
  if(action==='invite'&&a?.status==='playing'&&!a.bonus){commit(collectInvitation(getProfile()));render();}
  if(action==='clear'&&a?.status==='playing'&&!a.bonus)finish();
  if(action==='win'&&a?.bonus?.status==='playing')activity({type:'complete'});
 });
}
