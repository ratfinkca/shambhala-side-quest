import {readArcadeConfig} from '../online/client.js';
import {readOnlineConfig} from '../online/config.js';
import generic from './generic.js';
import smf from './smf.js';
const editions=new Map([[generic.id,generic],[smf.id,smf]]);
export function getEdition(id='generic'){
 if(!editions.has(id))throw new Error(`Unknown edition: ${String(id)}`);
 return editions.get(id);
}
export function editionIdFromEnv(env={}){
 return getEdition(env.VITE_EDITION===undefined?'generic':env.VITE_EDITION).id;
}

export function editionServices(edition,env,{rehearsal=false}={}){
 const trusted=getEdition(edition.id);
 const allowed=trusted.playable&&trusted.postingEnabled&&!rehearsal;
 return {arcadeEnabled:allowed&&!!readArcadeConfig(env).baseUrl,playtestEnabled:allowed&&readOnlineConfig(env).enabled};
}
export async function startEdition(env,actions){
 const edition=getEdition(editionIdFromEnv(env));
 return edition.playable?actions.game(edition):actions.scaffold(edition);
}
