import {GENERIC_RULES,GENERIC_SCORING_VERSION,GENERIC_SCORING_VERSIONS} from '../../supabase/functions/_shared/edition-rules.js';
export const SCORING_VERSION=GENERIC_SCORING_VERSION;
export const SCORING_VERSIONS=GENERIC_SCORING_VERSIONS;
export const runScoringVersion=run=>run?.scoringVersion??GENERIC_RULES.id;
export const SCORING_SEASONS=Object.freeze([
 {id:SCORING_VERSION,label:'Challenge season'},
 {id:'arcade-v2',label:'Crowd season'},
 {id:GENERIC_RULES.id,label:'Original season'},
]);
