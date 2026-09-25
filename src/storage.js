import {readProfile,PROFILE_KEY,normalizeAudio,rankScores,validScore} from './profile.js';
import {normalizeOutfit} from './wardrobe.js';
export function createStorage(storage){
 const profile=readProfile(storage),submitted=new Set([...profile.boards.rush,...profile.boards.festival].map(e=>e.id));
 function persist(){try{if(!storage)return false;storage.setItem(PROFILE_KEY,JSON.stringify(profile));return true;}catch{return false;}}
 return {
  get profile(){return structuredClone(profile)},get best(){return profile.bestRush},get sound(){return profile.audio.enabled},
  saveBest(value){if(Number.isSafeInteger(value)&&value>profile.bestRush)profile.bestRush=value;persist();return profile.bestRush},
  saveSound(value){profile.audio.enabled=Boolean(value);return {accepted:true,persisted:persist()}},
  saveAudio(value){profile.audio=normalizeAudio(value);return {accepted:true,persisted:persist()}},
  saveOutfit(value){profile.outfit=normalizeOutfit(value);return {accepted:true,persisted:persist()}},
  submitScore(mode,entry){if(!['rush','festival'].includes(mode)||!validScore(entry)||submitted.has(entry.id))return {accepted:false,persisted:false};submitted.add(entry.id);profile.boards[mode]=rankScores([...profile.boards[mode],entry]);return {accepted:true,persisted:persist(),ranked:profile.boards[mode].some(e=>e.id===entry.id)};},
 };
}
