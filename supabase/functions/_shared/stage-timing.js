// Preview clocks are not ranked rulesets. No browser or renderer dependencies.
const profiles=new Map();
const legacy={id:'generic-60-v1',editionId:'generic',durationMs:60000,bpm:120,beatsPerBar:4,stepsPerBeat:2,dropStartsMs:[15000,30000,45000],dropDurationMs:4000,buildMs:3000};
function register(value){Object.freeze(value.dropStartsMs);profiles.set(value.id,Object.freeze(value));}
register(legacy);
for(const [stage,bpm,bars] of [['living-room',112,32],['fractal',120,32],['grove',132,32],['amp',140,32],['pagoda',128,32],['village',172,48]])register({
 id:`smf-${stage}-clock-preview-1`,editionId:'smf',durationMs:Math.round(bars*240000/bpm),bpm,beatsPerBar:4,stepsPerBeat:4,
 dropStartsMs:(bars===48?[17,33,41]:[9,17,25]).map(bar=>Math.round((bar-1)*240000/bpm)),dropDurationMs:4000,buildMs:Math.round(240000/bpm),
});
export function getTiming(id='generic-60-v1'){
 if(!profiles.has(id))throw new Error(`Unknown stage clock: ${String(id)}`);
 return profiles.get(id);
}
export function assertTiming(timing){if(!timing||getTiming(timing.id)!==timing)throw new Error('Untrusted stage clock');return timing;}
function activeTime(elapsed,timing){assertTiming(timing);if(!Number.isFinite(elapsed))throw new Error('Invalid elapsed time');return Math.max(0,Math.min(elapsed,timing.durationMs));}
export function musicalPosition(elapsed,timing=getTiming()){
 const time=activeTime(elapsed,timing),totalBeats=Math.round(timing.durationMs*timing.bpm/60000);
 const beats=Math.min(time*timing.bpm/60000,totalBeats-1e-9);
 return {beat:Math.floor(beats),bar:Math.floor(beats/timing.beatsPerBar),step:Math.floor(beats*timing.stepsPerBeat),beatPhase:beats%1};
}
export function phaseAt(elapsed,timing=getTiming()){
 const time=activeTime(elapsed,timing);
 if(time>=timing.durationMs)return {phase:'ended',bonus:1,remainingMs:0};
 for(const start of timing.dropStartsMs){
  if(time>=start&&time<start+timing.dropDurationMs)return {phase:'drop',bonus:2,remainingMs:start+timing.dropDurationMs-time};
  if(time>=start-timing.buildMs&&time<start)return {phase:'build',bonus:1,remainingMs:start-time};
 }
 const next=timing.dropStartsMs.find(start=>start>time);
 return {phase:'cruise',bonus:1,remainingMs:next?next-time:0};
}
