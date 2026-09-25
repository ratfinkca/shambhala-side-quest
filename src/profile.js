import {normalizeOutfit} from './wardrobe.js';
export const PROFILE_KEY='sidequest.profile.v1';
export const DEFAULT_AUDIO={enabled:true,music:.45,effects:.65};
export function normalizeAudio(value={}){
 const volume=key=>typeof value?.[key]==='number'&&Number.isFinite(value[key])?Math.max(0,Math.min(1,value[key])):DEFAULT_AUDIO[key];
 return {enabled:typeof value?.enabled==='boolean'?value.enabled:true,music:volume('music'),effects:volume('effects')};
}
export function validScore(e){return e&&typeof e.id==='string'&&e.id.length>0&&e.id.length<=100&&/^[A-Z0-9]{3}$/.test(e.initials)&&Number.isSafeInteger(e.score)&&e.score>=0&&Number.isInteger(e.stagesCleared)&&e.stagesCleared>=0&&e.stagesCleared<=3&&Number.isFinite(e.completedAt)&&e.completedAt>=0;}
export function rankScores(entries){
 const seen=new Set();
 return (Array.isArray(entries)?entries:[]).filter(e=>validScore(e)&&!seen.has(e.id)&&seen.add(e.id)).map(e=>({id:e.id,initials:e.initials,score:e.score,stagesCleared:e.stagesCleared,completedAt:e.completedAt,outfit:normalizeOutfit(e.outfit)})).sort((a,b)=>b.score-a.score||b.stagesCleared-a.stagesCleared||a.completedAt-b.completedAt).slice(0,10);
}
export function readProfile(storage){
 let raw,legacyBest=0,legacySound;
 try{legacyBest=Number(storage?.getItem('sidequest.best'));legacySound=storage?.getItem('sidequest.sound');raw=JSON.parse(storage?.getItem(PROFILE_KEY)||'null');}catch{}
 if(raw?.version!==1)raw=null;
 const best=raw?.bestRush??legacyBest,audio=normalizeAudio(raw?.audio);
 if(!raw&&['true','false'].includes(legacySound))audio.enabled=legacySound==='true';
 return {version:1,audio,outfit:normalizeOutfit(raw?.outfit),bestRush:Number.isSafeInteger(best)&&best>=0?best:0,boards:{rush:rankScores(raw?.boards?.rush),festival:rankScores(raw?.boards?.festival)}};
}
