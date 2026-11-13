import {SMF_SCORING_VERSION,SMF_SCORING_VERSIONS} from '../../supabase/functions/_shared/smf-rules.js';

export const ORIGINAL_SMF_SCORING_VERSION='smf-v1';
// An omitted version belongs to the original season. Unknown versions are invalid.
export const resolveSmfScoringVersion=value=>value===undefined?ORIGINAL_SMF_SCORING_VERSION:SMF_SCORING_VERSIONS.includes(value)?value:null;
export const smfSeasonName=version=>version===SMF_SCORING_VERSION?'Current crowd season':'Original season';
export const smfSeasonRows=(rows,version=SMF_SCORING_VERSION)=>(Array.isArray(rows)?rows:[]).filter(row=>row&&resolveSmfScoringVersion(row.scoringVersion)===version);

export function limitSeasonBoard(rows,mode){
 const counts=new Map();
 return rows.filter(row=>row&&resolveSmfScoringVersion(row.scoringVersion)).map(row=>({...row,scoringVersion:resolveSmfScoringVersion(row.scoringVersion)}))
  .sort((a,b)=>mode==='endless'?((b.cleared??b.stagesCleared)-(a.cleared??a.stagesCleared)||b.score-a.score):(b.score-a.score||(b.cleared??b.stagesCleared)-(a.cleared??a.stagesCleared)))
  .filter(row=>{const count=counts.get(row.scoringVersion)||0;counts.set(row.scoringVersion,count+1);return count<20;});
}
