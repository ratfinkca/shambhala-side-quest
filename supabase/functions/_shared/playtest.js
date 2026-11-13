import {variationIdForStage} from './variations.js';
import {GENERIC_SCORING_VERSIONS} from './edition-rules.js';
// Shared public schema: strict allowlists keep accidental personal data off the wire.
const uuid=v=>typeof v==='string'&&/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);
const object=v=>v!==null&&typeof v==='object'&&!Array.isArray(v);
const exact=(v,keys)=>object(v)&&Object.keys(v).length===keys.length&&keys.every(k=>Object.hasOwn(v,k));
const integer=(v,max=1000000)=>Number.isSafeInteger(v)&&v>=0&&v<=max;
const duration=v=>Number.isFinite(v)&&v>=0&&v<=60000;
const stageKeys=['stageIndex','activeMs','bassMs','chargeMs','pickups','bumps','closePasses','clearanceBins','minClearance','peakCombo','flowUses','bassUses','candies','score','qualified','finished'];
const perks=['boots','noodle','moth','bracelet','surfer','battery','encore','sweet'];
function payload(type,p,mode){
 const endless=mode==='endless',stageMax=endless?999999:mode==='rush'?0:2;
 if(type==='run_start'||type==='replay')return exact(p,[]);
 if(type==='stage_start')return stagePayload(p,['stageIndex'],endless)&&integer(p.stageIndex,stageMax);
 if(type==='perk')return exact(p,['perk'])&&['boots','noodle','moth','bracelet','surfer','battery','encore','sweet'].includes(p.perk);
 if(type==='menu')return exact(p,['action'])&&['instructions','theme'].includes(p.action);
 if(type==='perk_choice')return endless&&exact(p,['stageIndex','action','perk','replaced','activePerks'])&&integer(p.stageIndex,stageMax)&&Array.isArray(p.activePerks)&&p.activePerks.length<=Math.min(p.stageIndex+1,4)&&new Set(p.activePerks).size===p.activePerks.length&&p.activePerks.every(k=>perks.includes(k))&&(
  p.action==='keep'&&p.perk===null&&p.replaced===null||
  p.action==='add'&&perks.includes(p.perk)&&p.activePerks.includes(p.perk)&&p.replaced===null||
  p.action==='swap'&&p.stageIndex>=4&&p.activePerks.length===4&&perks.includes(p.perk)&&perks.includes(p.replaced)&&p.perk!==p.replaced&&p.activePerks.includes(p.perk)&&!p.activePerks.includes(p.replaced));
 if(type==='run_end')return exact(p,['outcome','stagesCleared','totalScore'])&&(endless?['banked','failed','exit']:['complete','exit']).includes(p.outcome)&&integer(p.stagesCleared,endless?1000000:3)&&integer(p.totalScore,endless?Number.MAX_SAFE_INTEGER:1000000);
 if(type!=='stage_end'||!stagePayload(p,stageKeys,endless))return false;
 return integer(p.stageIndex,stageMax)&&['activeMs','bassMs','chargeMs'].every(k=>duration(p[k]))&&p.bassMs<=p.activeMs&&p.chargeMs<=p.bassMs&&['pickups','bumps','closePasses','peakCombo','flowUses','bassUses','score'].every(k=>integer(p[k]))&&Array.isArray(p.clearanceBins)&&p.clearanceBins.length===3&&p.clearanceBins.every(n=>integer(n))&&p.clearanceBins.reduce((a,b)=>a+b,0)===p.closePasses&&(p.closePasses===0?p.minClearance===null:Number.isFinite(p.minClearance)&&p.minClearance>=0&&p.minClearance<=48)&&exact(p.candies,['speed','dizzy','waves'])&&Object.values(p.candies).every(n=>integer(n))&&typeof p.qualified==='boolean'&&p.finished===true;
}
function stagePayload(p,keys,endless){const tagged=object(p)&&Object.hasOwn(p,'variationId');return exact(p,tagged?[...keys,'variationId']:keys)&&(!tagged||endless&&p.variationId===variationIdForStage(p.stageIndex));}
export function validatePlaytestBatch(events){
 const fail={ok:false,error:'Invalid playtest batch'};
 if(!Array.isArray(events)||events.length<1||events.length>20)return fail;
 if(new TextEncoder().encode(JSON.stringify(events)).length>32768)return fail;
 const keys=['schemaVersion','eventId','installationId','sessionId','runId','type','mode','buildId','scoringVersion','theme','viewport','inputType','payload'];
 for(const e of events){
  if(!exact(e,keys)||e.schemaVersion!==(e.mode==='endless'?2:1)||![e.eventId,e.installationId,e.sessionId].every(uuid)||!(e.runId===null||uuid(e.runId))||!['rush','festival','endless',null].includes(e.mode)||!['forest-freakout','moonlit-mycelium','neon-field-trip'].includes(e.theme)||!['small','medium','large'].includes(e.viewport)||!['mouse','touch','keyboard','mixed','unknown'].includes(e.inputType)||typeof e.buildId!=='string'||!/^[a-zA-Z0-9._-]{1,64}$/.test(e.buildId)||!GENERIC_SCORING_VERSIONS.includes(e.scoringVersion)||!payload(e.type,e.payload,e.mode))return fail;
  if(e.type!=='menu'&&(!e.runId||!e.mode))return fail;
 }
 return {ok:true,events};
}
