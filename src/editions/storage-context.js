import {getEdition} from './registry.js';
export function storageContext(edition,{rehearsal=false,recoveryLab=false}={}){
 // Resolve through the trusted registry rather than accepting caller-owned keys.
 const trusted=getEdition(edition.id);
 return Object.freeze({profileKey:trusted.profileKey,lockName:recoveryLab?trusted.labPrefix.slice(0,-1):trusted.lockName,labPrefix:trusted.labPrefix,allowLegacy:trusted.id==='generic'&&!rehearsal&&!recoveryLab});
}
export const genericContext=storageContext(getEdition());
