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
export function controlPracticeRequested(env,search){
 const edition=editionIdFromEnv(env),params=new URLSearchParams(search);
 return env.DEV===true&&edition==='smf'&&params.has('rehearsal')&&params.has('controls');
}
export function collisionPracticeRequested(env,search){
 const edition=editionIdFromEnv(env),params=new URLSearchParams(search);
 return env.DEV===true&&edition==='smf'&&params.has('rehearsal')&&params.has('collision');
}
export function backstagePracticeRequested(env,search){
 const edition=editionIdFromEnv(env),params=new URLSearchParams(search);
 return env.DEV===true&&edition==='smf'&&params.has('rehearsal')&&params.get('backstage')==='amp';
}
export function bonusPracticeRequested(env,search){
 const edition=editionIdFromEnv(env),params=new URLSearchParams(search);
 return env.DEV===true&&edition==='smf'&&params.has('rehearsal')&&['rabbit-hole','secret-garden','ikigai-mori','villagio'].includes(params.get('bonus'));
}
export function prismPracticeRequested(env,search){
 const params=new URLSearchParams(search);
 return env.DEV===true&&editionIdFromEnv(env)==='smf'&&params.has('rehearsal')&&params.has('prism');
}
export async function startEdition(env,actions={}, {prismPractice=false,collisionPractice=false,clockPractice=false,venuePractice=false,backstagePractice=false,bonusPractice=false,controlPractice=false}={}){
 const edition=getEdition(editionIdFromEnv(env));
 if(env.DEV===true&&edition.id==='smf'&&prismPractice&&typeof actions?.prism==='function')return actions.prism(edition);
 if(env.DEV===true&&edition.id==='smf'&&collisionPractice&&typeof actions?.collision==='function')return actions.collision(edition);
 if(env.DEV===true&&edition.id==='smf'&&controlPractice&&typeof actions?.controls==='function')return actions.controls(edition);
 if(env.DEV===true&&edition.id==='smf'&&bonusPractice&&typeof actions?.bonus==='function')return actions.bonus(edition);
 if(env.DEV===true&&edition.id==='smf'&&backstagePractice&&typeof actions?.backstage==='function')return actions.backstage(edition);
 if(env.DEV===true&&edition.id==='smf'&&venuePractice&&typeof actions?.venues==='function')return actions.venues(edition);
 if(env.DEV===true&&edition.id==='smf'&&clockPractice&&typeof actions?.clock==='function')return actions.clock(edition);
 const entry=edition.id==='smf'?'tour':edition.playable?'game':'scaffold';
 if(typeof actions?.[entry]!=='function')throw new Error(`Missing ${entry} entry for ${edition.id} edition`);
 return actions[entry](edition);
}
