import {PRISM,PRISM_ZONES} from './model.js';

export function prismHUD(state) {
 const progress=`${state.progress} / 3 faces`;
 if(!state.entered)return {progress,clockLabel:'BONUS',clock:'No rush',instruction:'Walk up the glowing ramp. Dance in the lit section to charge its face.'};
 if(state.complete)return {progress,clockLabel:'PYRAMID',clock:'Done',instruction:'All three faces lit. Your Prism Crown awaits.'};
 if(state.phase==='celebrating')return {progress,clockLabel:'PYRAMID',clock:'All lit',instruction:'Let it shine! Your Prism Crown awaits.'};
 const zone=PRISM_ZONES[state.activeZone],charged=state.charges[state.activeZone]>=PRISM.chargeMs;
 return {progress,clockLabel:'NEXT CUE',clock:`${Math.ceil((PRISM.phraseMs-state.partyMs%PRISM.phraseMs)/1000)}s`,instruction:charged?'Face lit! The next section opens on the musical cue.':`Dance in ${zone.label} ${zone.symbol}. Keep moving; your charge stays when the cue changes.`};
}
