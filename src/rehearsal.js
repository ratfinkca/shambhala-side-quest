// Development-only UI fixtures for repeatable menu/transition verification.
// main.js excludes this module from production and disables score submission.
import {STAGE_VARIATIONS} from './stage-variations.js';
import { collect } from './game.js';
export function layoutPreviewIndex(id){const i=STAGE_VARIATIONS.findIndex(v=>v.id===id);return i<0?null:3+Math.floor(i/2)+(i%2)*3;}
export function installRehearsal(getScene,isPlaying,{previewStage}={}) {
  const bar=document.createElement('details');bar.id='rehearsal-controls';
  const label=document.createElement('summary');label.textContent='Layout lab · practice only · no saves';bar.append(label);
  const controls=document.createElement('div');controls.style.cssText='display:flex;flex-wrap:wrap;gap:6px;padding-top:6px';bar.append(controls);
  Object.assign(bar.style,{position:'fixed',bottom:'4px',left:'4px',zIndex:'100',maxWidth:'calc(100vw - 16px)',background:'#fff',padding:'6px',borderRadius:'6px',color:'#111',font:'12px system-ui'});
  for(const qualified of [true,false]){
    const button=document.createElement('button');button.textContent=qualified?'Rehearsal: qualify stage':'Rehearsal: fail stage';
    button.addEventListener('click',()=>{
      const scene=getScene();if(!scene||!isPlaying())return;
      if(qualified)while(scene.round.pickups<scene.stage.target)collect(scene.round);
      else scene.round.pickups=Math.min(scene.round.pickups,scene.stage.target-1);
      scene.round.remainingMs=1;
    });controls.append(button);
  }
  if(previewStage){
    const select=document.createElement('select');select.setAttribute('aria-label','Layout preview');select.style.maxWidth='100%';
    STAGE_VARIATIONS.forEach(v=>{const option=document.createElement('option');option.value=v.id;option.textContent=`${v.stageId} · ${v.name}`;select.append(option)});
    const button=document.createElement('button');button.textContent='Load layout';
    button.addEventListener('click',()=>{const index=layoutPreviewIndex(select.value);if(index!==null){const url=new URL(location.href);url.searchParams.set('layout',select.value);history.replaceState(null,'',url);previewStage(index);bar.open=false;}});
    controls.prepend(select,button);
    const requested=new URLSearchParams(location.search).get('layout'),index=layoutPreviewIndex(requested);
    if(index!==null){select.value=requested;previewStage(index);}
  }
  document.body.append(bar);
}
