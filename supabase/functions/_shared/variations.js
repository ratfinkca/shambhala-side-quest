import {GENERIC_RULES,GENERIC_VARIATION_IDS,routePosition} from './edition-rules.js';
// Shared identity contract; geometry stays in the frontend stage registry.
export const VARIATION_IDS=GENERIC_VARIATION_IDS;
export function variationIdForStage(index){
 if(!Number.isSafeInteger(index)||index<0)return null;
 const {offset,loop}=routePosition(index,GENERIC_RULES.mainStageIds.length);
 return loop<1?'original':VARIATION_IDS[offset*2+(loop-1)%2];
}
