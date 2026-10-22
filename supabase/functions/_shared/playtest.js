// Shared public schema: strict allowlists keep accidental personal data off the wire.
const uuid=v=>typeof v==='string'&&/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);
const object=v=>v!==null&&typeof v==='object'&&!Array.isArray(v);
const exact=(v,keys)=>object(v)&&Object.keys(v).length===keys.length&&keys.every(k=>Object.hasOwn(v,k));
const integer=(v,max=1000000)=>Number.isSafeInteger(v)&&v>=0&&v<=max;
const duration=v=>Number.isFinite(v)&&v>=0&&v<=60000;
const stageKeys=['stageIndex','activeMs','bassMs','chargeMs','pickups','bumps','closePasses','clearanceBins','minClearance','peakCombo','flowUses','bassUses','candies','score','qualified','finished'];
function payload(type,p){
 if(type==='run_start'||type==='replay')return exact(p,[]);
 if(type==='stage_start')return exact(p,['stageIndex'])&&integer(p.stageIndex,2);
 if(type==='perk')return exact(p,['perk'])&&['boots','noodle','moth','bracelet'].includes(p.perk);
 if(type==='menu')return exact(p,['action'])&&['instructions','theme'].includes(p.action);
 if(type==='run_end')return exact(p,['outcome','stagesCleared','totalScore'])&&['complete','exit'].includes(p.outcome)&&integer(p.stagesCleared,3)&&integer(p.totalScore);
 if(type!=='stage_end'||!exact(p,stageKeys))return false;
 return integer(p.stageIndex,2)&&['activeMs','bassMs','chargeMs'].every(k=>duration(p[k]))&&p.bassMs<=p.activeMs&&p.chargeMs<=p.bassMs&&['pickups','bumps','closePasses','peakCombo','flowUses','bassUses','score'].every(k=>integer(p[k]))&&Array.isArray(p.clearanceBins)&&p.clearanceBins.length===3&&p.clearanceBins.every(n=>integer(n))&&p.clearanceBins.reduce((a,b)=>a+b,0)===p.closePasses&&(p.closePasses===0?p.minClearance===null:Number.isFinite(p.minClearance)&&p.minClearance>=0&&p.minClearance<=21)&&exact(p.candies,['speed','dizzy','waves'])&&Object.values(p.candies).every(n=>integer(n))&&typeof p.qualified==='boolean'&&p.finished===true;
}
export function validatePlaytestBatch(events){
 const fail={ok:false,error:'Invalid playtest batch'};
 if(!Array.isArray(events)||events.length<1||events.length>20)return fail;
 if(new TextEncoder().encode(JSON.stringify(events)).length>32768)return fail;
 const keys=['schemaVersion','eventId','installationId','sessionId','runId','type','mode','buildId','scoringVersion','theme','viewport','inputType','payload'];
 for(const e of events){
  if(!exact(e,keys)||e.schemaVersion!==1||![e.eventId,e.installationId,e.sessionId].every(uuid)||!(e.runId===null||uuid(e.runId))||!['rush','festival',null].includes(e.mode)||!['forest-freakout','moonlit-mycelium','neon-field-trip'].includes(e.theme)||!['small','medium','large'].includes(e.viewport)||!['mouse','touch','keyboard','mixed','unknown'].includes(e.inputType)||typeof e.buildId!=='string'||!/^[a-zA-Z0-9._-]{1,64}$/.test(e.buildId)||e.scoringVersion!=='arcade-v1'||!payload(e.type,e.payload))return fail;
  if(e.type!=='menu'&&(!e.runId||!e.mode))return fail;
 }
 return {ok:true,events};
}
