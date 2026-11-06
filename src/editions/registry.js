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
