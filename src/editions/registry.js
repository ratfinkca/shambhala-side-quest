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
export function clockPracticeRequested(env,search){
 const edition=editionIdFromEnv(env),params=new URLSearchParams(search);
 return env.DEV===true&&edition==='smf'&&params.has('rehearsal')&&params.has('clock');
}
export function venuePracticeRequested(env,search){
 const edition=editionIdFromEnv(env),params=new URLSearchParams(search);
 return env.DEV===true&&edition==='smf'&&params.has('rehearsal')&&params.has('venues');
}
export async function startEdition(env,actions,{clockPractice=false,venuePractice=false}={}){
 const edition=getEdition(editionIdFromEnv(env));
 if(env.DEV===true&&edition.id==='smf'&&venuePractice&&actions.venues)return actions.venues(edition);
 if(env.DEV===true&&edition.id==='smf'&&clockPractice&&actions.clock)return actions.clock(edition);
 return edition.playable?actions.game(edition):actions.scaffold(edition);
}
