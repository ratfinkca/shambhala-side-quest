import {genericContext} from './editions/storage-context.js';
import {awardStage,requirement} from './progression.js';
import {isThemePreference} from './themes.js';
import {readProfile,normalizeAudio,rankScores,validScore,scoreSeason} from './profile.js';
import {normalizeOutfit,WARDROBE} from './wardrobe.js';
import {GENERIC_RULES,GENERIC_SCORING_VERSION,GENERIC_SCORING_VERSIONS} from '../supabase/functions/_shared/edition-rules.js';
const scoreKey=e=>`${scoreSeason(e)}:${e.id}`;
export function createStorage(storage,{canWrite=()=>true,context=genericContext}={}){
 const profile=readProfile(storage,context),submitted=new Set([...profile.boards.rush,...profile.boards.festival,...profile.boards.endless].map(scoreKey));
 try{const raw=JSON.parse(storage?.getItem(context.profileKey)||'null');if(raw?.version===1&&Object.hasOwn(raw,'recovery'))profile.recovery=raw.recovery;}catch{}
 function persist(){try{if(!storage||!canWrite())return false;// Anything successfully read back from this write is durable, including its award notice.
 const record=profile.recovery?.progressReward?{...profile,recovery:{...profile.recovery,progressReward:{...profile.recovery.progressReward,persisted:true}}}:profile;
 storage.setItem(context.profileKey,JSON.stringify(record));if(record!==profile)profile.recovery=record.recovery;return true;}catch{return false;}}
 return {
  get profile(){const {recovery,...publicProfile}=profile;return structuredClone(publicProfile)},get recovery(){return structuredClone(profile.recovery??null)},
  saveRecovery(value){profile.recovery=structuredClone(value);return {persisted:persist()};},
  commitStage(stage,value){const result=awardStage(profile.progress,stage);profile.progress=result.progress;profile.recovery=structuredClone(value);return {...result,persisted:persist()};},
  commitScore(mode,entry,value){if(!['rush','festival','endless'].includes(mode)||!validScore(entry,mode)||submitted.has(scoreKey(entry)))return {accepted:false,persisted:false};submitted.add(scoreKey(entry));profile.boards[mode]=rankScores([...profile.boards[mode],entry],mode);profile.recovery=structuredClone(value);return {accepted:true,persisted:persist(),ranked:profile.boards[mode].some(e=>scoreKey(e)===scoreKey(entry))};},bestFor(version=GENERIC_SCORING_VERSION){return profile.bestRushBySeason[version]??0},get best(){return profile.bestRush},get sound(){return profile.audio.enabled},
  savePlaytestConsent(value,identity=null){if(!['accepted','declined'].includes(value))return {accepted:false,persisted:false};profile.playtestConsent=value;profile.playtestIdentity=value==='accepted'?identity:null;return {accepted:true,persisted:persist()};},
  saveBest(value,version=GENERIC_RULES.id){if(!GENERIC_SCORING_VERSIONS.includes(version))return 0;if(Number.isSafeInteger(value)&&value>profile.bestRushBySeason[version])profile.bestRushBySeason[version]=value;profile.bestRush=profile.bestRushBySeason[GENERIC_RULES.id];persist();return profile.bestRushBySeason[version]},
  saveSound(value){profile.audio.enabled=Boolean(value);return {accepted:true,persisted:persist()}},
  saveAudio(value){profile.audio=normalizeAudio(value);return {accepted:true,persisted:persist()}},
  saveTheme(value){if(!isThemePreference(value))return {accepted:false,persisted:false};profile.themePreference=value;return {accepted:true,persisted:persist()};},
  saveOutfit(value){const next=normalizeOutfit(value);if(Object.keys(WARDROBE).some(key=>requirement(profile.progress,`${key}:${next[key]}`)))return {accepted:false,persisted:false};profile.outfit=next;return {accepted:true,persisted:persist()}},
  awardProgress(stage){const result=awardStage(profile.progress,stage);profile.progress=result.progress;return {...result,persisted:persist()};},
  submitScore(mode,entry){if(!['rush','festival','endless'].includes(mode)||!validScore(entry,mode)||submitted.has(scoreKey(entry)))return {accepted:false,persisted:false};submitted.add(scoreKey(entry));profile.boards[mode]=rankScores([...profile.boards[mode],entry],mode);return {accepted:true,persisted:persist(),ranked:profile.boards[mode].some(e=>scoreKey(e)===scoreKey(entry))};},
 };
}
