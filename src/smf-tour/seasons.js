import {SMF_SCORING_VERSION,SMF_SCORING_VERSIONS} from '../../supabase/functions/_shared/smf-rules.js';
import {DEFAULT_CHALLENGE,isChallenge} from '../../supabase/functions/_shared/challenges.js';

export const ORIGINAL_SMF_SCORING_VERSION='smf-v1';
// An omitted version belongs to the original season. Unknown versions are invalid.
export const resolveSmfScoringVersion=value=>value===undefined?ORIGINAL_SMF_SCORING_VERSION:SMF_SCORING_VERSIONS.includes(value)?value:null;
export const smfSeasonName=version=>version==='smf-v3'?'Challenge season':version==='smf-v2'?'Crowd season':'Original season';
export const smfSeasonRows=(rows,version=SMF_SCORING_VERSION,challenge=DEFAULT_CHALLENGE)=>(Array.isArray(rows)?rows:[]).filter(row=>row&&resolveSmfScoringVersion(row.scoringVersion)===version&&(version!=='smf-v3'||isChallenge(challenge)&&row.challenge===challenge));
export const validSmfBoardChallenge=row=>row?.scoringVersion!=='smf-v3'||isChallenge(row.challenge);
export const smfBoardPartition=row=>`${row.scoringVersion}${row.scoringVersion==='smf-v3'?`:${row.challenge}`:''}`;

export function limitSeasonBoard(rows,mode){
 const counts=new Map();
 return rows.filter(row=>row&&resolveSmfScoringVersion(row.scoringVersion)&&validSmfBoardChallenge(row)).map(row=>({...row,scoringVersion:resolveSmfScoringVersion(row.scoringVersion)}))
  .sort((a,b)=>mode==='endless'?((b.cleared??b.stagesCleared)-(a.cleared??a.stagesCleared)||b.score-a.score):(b.score-a.score||(b.cleared??b.stagesCleared)-(a.cleared??a.stagesCleared)))
  .filter(row=>{const key=smfBoardPartition(row),count=counts.get(key)||0;counts.set(key,count+1);return count<20;});
}
