import {genericContext} from './editions/storage-context.js';
import {GENERIC_RULES,GENERIC_SCORING_VERSIONS} from '../supabase/functions/_shared/edition-rules.js';
import {normalizeProgress} from './progression.js';
import {normalizeThemePreference} from './themes.js';
import {normalizeOutfit} from './wardrobe.js';
export const PROFILE_KEY=genericContext.profileKey;
export const DEFAULT_AUDIO={enabled:true,music:.45,effects:.65};
export function normalizeAudio(value={}){
 const volume=key=>typeof value?.[key]==='number'&&Number.isFinite(value[key])?Math.max(0,Math.min(1,value[key])):DEFAULT_AUDIO[key];
 return {enabled:typeof value?.enabled==='boolean'?value.enabled:true,music:volume('music'),effects:volume('effects')};
}
export const scoreSeason=e=>e?.scoringVersion??GENERIC_RULES.id;
export function validScore(e,mode='rush'){return e&&GENERIC_SCORING_VERSIONS.includes(scoreSeason(e))&&typeof e.id==='string'&&e.id.length>0&&e.id.length<=100&&/^[A-Z0-9]{3}$/.test(e.initials)&&Number.isSafeInteger(e.score)&&e.score>=0&&Number.isInteger(e.stagesCleared)&&e.stagesCleared>=0&&(mode==='endless'?Number.isSafeInteger(e.stagesCleared):e.stagesCleared<=GENERIC_RULES.mainStageIds.length)&&Number.isFinite(e.completedAt)&&e.completedAt>=0;}
export function rankScores(entries,mode='rush'){
 const seen=new Set(),counts=new Map(),key=e=>`${scoreSeason(e)}:${e.id}`;
 return (Array.isArray(entries)?entries:[]).filter(e=>validScore(e,mode)&&!seen.has(key(e))&&seen.add(key(e))).map(e=>({id:e.id,scoringVersion:scoreSeason(e),initials:e.initials,score:e.score,stagesCleared:e.stagesCleared,completedAt:e.completedAt,inputType:['mouse','touch','keyboard','mixed'].includes(e.inputType)?e.inputType:'unknown',outfit:normalizeOutfit(e.outfit)})).sort((a,b)=>(mode==='endless'?b.stagesCleared-a.stagesCleared:0)||b.score-a.score||b.stagesCleared-a.stagesCleared||a.completedAt-b.completedAt).filter(e=>{const count=(counts.get(e.scoringVersion)??0)+1;counts.set(e.scoringVersion,count);return count<=10;});
}
export function readProfile(storage,context=genericContext){
 let raw,legacyBest=0,legacyBestPresent=false,legacySound;
 try{if(context.allowLegacy){const storedBest=storage?.getItem('sidequest.best');legacyBestPresent=storedBest!==null&&storedBest!==undefined;legacyBest=Number(storedBest);legacySound=storage?.getItem('sidequest.sound');}raw=JSON.parse(storage?.getItem(context.profileKey)||'null');}catch{}
 if(raw?.version!==1)raw=null;
 const best=raw?.bestRush??legacyBest,audio=normalizeAudio(raw?.audio);
 const bestRush=Number.isSafeInteger(best)&&best>=0?best:0;
 const bestRushBySeason=Object.fromEntries(GENERIC_SCORING_VERSIONS.map(version=>{const value=raw?.bestRushBySeason?.[version];return [version,Number.isSafeInteger(value)&&value>=0?value:version===GENERIC_RULES.id?bestRush:0];}));
 if(!raw&&['true','false'].includes(legacySound))audio.enabled=legacySound==='true';
 return {version:1,progress:normalizeProgress(raw?.progress,!!raw||legacyBestPresent||legacySound!==undefined&&legacySound!==null),playtestConsent:['accepted','declined'].includes(raw?.playtestConsent)?raw.playtestConsent:'unknown',playtestIdentity:raw?.playtestConsent==='accepted'&&typeof raw.playtestIdentity==='string'&&raw.playtestIdentity.length<=100?raw.playtestIdentity:null,themePreference:normalizeThemePreference(raw?.themePreference),audio,outfit:normalizeOutfit(raw?.outfit),bestRush:bestRushBySeason[GENERIC_RULES.id],bestRushBySeason,boards:{rush:rankScores(raw?.boards?.rush),festival:rankScores(raw?.boards?.festival),endless:rankScores(raw?.boards?.endless,'endless')}};
}
