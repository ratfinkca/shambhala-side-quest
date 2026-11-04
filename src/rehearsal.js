// Development-only UI fixtures for repeatable menu/transition verification.
// main.js excludes this module from production and disables score submission.
import {STAGE_VARIATIONS} from './stage-variations.js';
import { collect } from './game.js';
import {MYSTERY_EFFECTS} from './mystery.js';
export function candyPreviewRoll(effect){const index=Object.keys(MYSTERY_EFFECTS).indexOf(effect);return index<0?null:(index+.5)/3;}
export function rewardDemoStages(key){
 const base={mode:'endless',qualified:true,pickups:0};
 if(key==='onesie:mycelium')return STAGE_VARIATIONS.map((v,i)=>({...base,id:`reward-demo:${key}:${i}`,stagesCleared:4+Math.floor(i/2)+(i%2)*3,variationId:v.id}));
 const clears={'hat:spore':4,'totem:mixtape':6,'flair:aurora':12};
 return clears[key]?[{...base,id:`reward-demo:${key}`,stagesCleared:clears[key],remixed:key==='totem:mixtape'}]:[];
}
export function layoutPreviewIndex(id){const i=STAGE_VARIATIONS.findIndex(v=>v.id===id);return i<0?null:3+Math.floor(i/2)+(i%2)*3;}
export function installRehearsal(getScene,isPlaying,{previewStage,previewReward,openRewards,previewCandy}={}) {
  const bar=document.createElement('details');bar.id='rehearsal-controls';
  const label=document.createElement('summary');label.textContent=previewReward?'Reward lab · temporary profile · no saves':previewCandy?'Candy lab · practice only · no saves':'Layout lab · practice only · no saves';bar.append(label);
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
  if(previewStage&&!previewCandy){
    const select=document.createElement('select');select.setAttribute('aria-label','Layout preview');select.style.maxWidth='100%';
    STAGE_VARIATIONS.forEach(v=>{const option=document.createElement('option');option.value=v.id;option.textContent=`${v.stageId} · ${v.name}`;select.append(option)});
    const button=document.createElement('button');button.textContent='Load layout';
    button.addEventListener('click',()=>{const index=layoutPreviewIndex(select.value);if(index!==null){const url=new URL(location.href);url.searchParams.set('layout',select.value);history.replaceState(null,'',url);previewStage(index);bar.open=false;}});
    controls.prepend(select,button);
    const requested=new URLSearchParams(location.search).get('layout'),index=layoutPreviewIndex(requested);
    if(index!==null){select.value=requested;previewStage(index);}
  }
  if(previewCandy){
   const select=document.createElement('select');select.setAttribute('aria-label','Candy preview');
   for(const [key,info]of Object.entries(MYSTERY_EFFECTS)){const option=document.createElement('option');option.value=key;option.textContent=info.name;select.append(option);}
   const requested=new URLSearchParams(location.search).get('candy');select.value=candyPreviewRoll(requested)===null?'waves':requested;
   const start=document.createElement('button');start.textContent='Start candy practice';start.addEventListener('click',()=>{const roll=candyPreviewRoll(select.value);if(roll!==null){previewCandy(roll);bar.open=false;}});
   const note=document.createElement('p');note.textContent='Each try starts a fresh Quick Rush with the chosen candy. Five-second effects; no scores, XP or playtest data saved.';note.style.flexBasis='100%';
   controls.prepend(note,select,start);bar.open=true;
  }
  if(previewReward){
   const select=document.createElement('select');select.setAttribute('aria-label','Reward demonstration');
   for(const [key,name]of [['hat:spore','Spore Sprout'],['totem:mixtape','Mixtape Totem'],['onesie:mycelium','Mycelium Threads'],['flair:aurora','Aurora Ribbons']]){const option=document.createElement('option');option.value=key;option.textContent=name;select.append(option);}
   const earn=document.createElement('button');earn.textContent='Demonstrate earning reward';earn.addEventListener('click',()=>{previewReward(rewardDemoStages(select.value),select.value);bar.open=false;});
   const open=document.createElement('button');open.textContent='Open reward wardrobe';open.addEventListener('click',()=>{openRewards();bar.open=false;});
   const note=document.createElement('p');note.textContent='Temporary reward profile. Real unlocks are untouched. Reload to reset demos. Scores and playtest sharing are disabled.';note.style.flexBasis='100%';
   controls.prepend(note,select,earn,open);openRewards();
  }
  document.body.append(bar);
}
