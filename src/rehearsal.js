// Development-only UI fixtures for repeatable menu/transition verification.
// main.js excludes this module from production and disables score submission.
import { collect } from './game.js';
export function installRehearsal(getScene,isPlaying) {
  const bar=document.createElement('div');bar.id='rehearsal-controls';
  Object.assign(bar.style,{position:'fixed',bottom:'4px',left:'4px',zIndex:'100',display:'flex',gap:'8px',background:'#fff',padding:'5px',color:'#111'});
  for(const qualified of [true,false]){
    const button=document.createElement('button');button.textContent=qualified?'Rehearsal: qualify stage':'Rehearsal: fail stage';
    button.addEventListener('click',()=>{
      const scene=getScene();if(!scene||!isPlaying())return;
      if(qualified)while(scene.round.pickups<scene.stage.target)collect(scene.round);
      else scene.round.pickups=Math.min(scene.round.pickups,scene.stage.target-1);
      scene.round.remainingMs=1;
    });bar.append(button);
  }
  document.body.append(bar);
}
