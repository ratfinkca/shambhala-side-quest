import {readRecovery} from './recovery.js';
export function createRecoveryController({owner,storage,capture,clock=Date.now,onStatus=()=>{}}){
 let last=-Infinity,generation=0;
 const canWrite=()=>!owner.supported||owner.held;
 function checkpoint(){const value=capture();if(value===undefined||value===null)return null;const parsed=readRecovery(value);if(!parsed.ok){onStatus('unavailable');return null;}return value;}
 function result(r){onStatus(r.persisted?'saved':'unavailable');if(r.persisted)last=clock();return r;}
 return {get canWrite(){return canWrite()},get enabled(){return owner.supported&&owner.held},
 token:()=>generation,valid:t=>t===generation&&canWrite(),
 save(force=false){if(!owner.supported||!owner.held)return false;if(!force&&clock()-last<1000)return false;const value=checkpoint();if(!value)return false;return result(storage.saveRecovery(value)).persisted;},
 commitStage(stage){if(!canWrite())return null;if(!owner.supported)return storage.awardProgress(stage);const value=checkpoint();if(!value){const r=storage.commitStage(stage,null);onStatus('unavailable');return r;}return result(storage.commitStage(stage,value));},
 commitScore(mode,entry){if(!canWrite())return {accepted:false,persisted:false};if(!owner.supported)return storage.submitScore(mode,entry);const value=checkpoint();if(!value){const r=storage.commitScore(mode,entry,null);onStatus('unavailable');return r;}return result(storage.commitScore(mode,entry,value));},
 clear(){if(!canWrite())return false;return result(storage.saveRecovery(null)).persisted;},
 release(){generation++;last=-Infinity;owner.release();},
 };
}
