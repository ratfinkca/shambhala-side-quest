import {SMF_RULES} from '../../supabase/functions/_shared/smf-rules.js';

export const RUSH_STAGE_IDS=Object.freeze(SMF_RULES.route.map(stage=>stage.id));
export const LEGACY_RUSH_STAGE_ID='smf-pagoda';
export const isRushStageId=value=>RUSH_STAGE_IDS.includes(value);
// Only an omitted selection is legacy Pagoda; explicit invalid values stay invalid.
export const resolveRushStageId=value=>value===undefined?LEGACY_RUSH_STAGE_ID:isRushStageId(value)?value:null;

export function lastRushStageId(profile){
 for(const run of [profile?.active,profile?.lastResult])if(run?.mode==='rush'){
  const selected=resolveRushStageId(run.rushStageId);if(selected)return selected;
 }
 let latest=null;
 for(const row of Array.isArray(profile?.boards?.rush)?profile.boards.rush:[]){
  if(!row||!resolveRushStageId(row.rushStageId))continue;
  if(latest===null||(Number.isFinite(row.completedAt)?row.completedAt:0)>(Number.isFinite(latest.completedAt)?latest.completedAt:0))latest=row;
 }
 return latest?resolveRushStageId(latest.rushStageId):null;
}

export function normalizeRushRotation(raw,fallback=null){
 const lastStageId=isRushStageId(raw?.lastStageId)?raw.lastStageId:isRushStageId(fallback)?fallback:null;
 const remaining=Array.isArray(raw?.remaining)?[...new Set(raw.remaining.filter(id=>isRushStageId(id)&&id!==lastStageId))]:[];
 return {remaining,lastStageId};
}

export function drawRushStage(rotation,rng=Math.random){
 const next=normalizeRushRotation(rotation);
 const randomIndex=size=>{const value=rng();return Math.floor((Number.isFinite(value)?Math.max(0,Math.min(1-Number.EPSILON,value)):0)*size);};
 if(!next.remaining.length){
  next.remaining=[...RUSH_STAGE_IDS];
  for(let i=next.remaining.length-1;i>0;i--){const j=randomIndex(i+1);[next.remaining[i],next.remaining[j]]=[next.remaining[j],next.remaining[i]];}
  if(next.remaining[0]===next.lastStageId){const j=1+randomIndex(next.remaining.length-1);[next.remaining[0],next.remaining[j]]=[next.remaining[j],next.remaining[0]];}
 }
 const rushStageId=next.remaining.shift();next.lastStageId=rushStageId;
 return {rushStageId,rotation:next};
}

export function limitRushBoard(rows){
 const counts=new Map();
 return rows.filter(row=>row&&resolveRushStageId(row.rushStageId)).map(row=>({...row,rushStageId:resolveRushStageId(row.rushStageId)}))
  .sort((a,b)=>b.score-a.score||(b.cleared??b.stagesCleared)-(a.cleared??a.stagesCleared))
  .filter(row=>{const count=counts.get(row.rushStageId)||0;counts.set(row.rushStageId,count+1);return count<20;});
}
