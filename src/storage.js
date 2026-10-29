import {awardStage,requirement} from './progression.js';
import {isThemePreference} from './themes.js';
import {readProfile,PROFILE_KEY,normalizeAudio,rankScores,validScore} from './profile.js';
import {normalizeOutfit} from './wardrobe.js';
export function createStorage(storage){
 const profile=readProfile(storage),submitted=new Set([...profile.boards.rush,...profile.boards.festival,...profile.boards.endless].map(e=>e.id));
 function persist(){try{if(!storage)return false;storage.setItem(PROFILE_KEY,JSON.stringify(profile));return true;}catch{return false;}}
 return {
  get profile(){return structuredClone(profile)},get best(){return profile.bestRush},get sound(){return profile.audio.enabled},
  savePlaytestConsent(value,identity=null){if(!['accepted','declined'].includes(value))return {accepted:false,persisted:false};profile.playtestConsent=value;profile.playtestIdentity=value==='accepted'?identity:null;return {accepted:true,persisted:persist()};},
  saveBest(value){if(Number.isSafeInteger(value)&&value>profile.bestRush)profile.bestRush=value;persist();return profile.bestRush},
  saveSound(value){profile.audio.enabled=Boolean(value);return {accepted:true,persisted:persist()}},
  saveAudio(value){profile.audio=normalizeAudio(value);return {accepted:true,persisted:persist()}},
  saveTheme(value){if(!isThemePreference(value))return {accepted:false,persisted:false};profile.themePreference=value;return {accepted:true,persisted:persist()};},
  saveOutfit(value){const next=normalizeOutfit(value);if(Object.entries(next).some(([key,id])=>requirement(profile.progress,`${key}:${id}`)))return {accepted:false,persisted:false};profile.outfit=next;return {accepted:true,persisted:persist()}},
  awardProgress(stage){const result=awardStage(profile.progress,stage);profile.progress=result.progress;return {...result,persisted:persist()};},
  submitScore(mode,entry){if(!['rush','festival','endless'].includes(mode)||!validScore(entry,mode)||submitted.has(entry.id))return {accepted:false,persisted:false};submitted.add(entry.id);profile.boards[mode]=rankScores([...profile.boards[mode],entry],mode);return {accepted:true,persisted:persist(),ranked:profile.boards[mode].some(e=>e.id===entry.id)};},
 };
}
