import {genericContext} from './editions/storage-context.js';
import {awardStage,requirement} from './progression.js';
import {isThemePreference} from './themes.js';
import {readProfile,normalizeAudio,rankScores,validScore,scorePartition} from './profile.js';
import {normalizeOutfit,WARDROBE} from './wardrobe.js';
import {GENERIC_RULES,GENERIC_SCORING_VERSION,GENERIC_SCORING_VERSIONS} from '../supabase/functions/_shared/edition-rules.js';
import {validatePlayerName} from '../supabase/functions/_shared/player-name.js';
import {saveCharacterSlot,loadCharacterSlot,deleteCharacterSlot} from './character-slots.js';
import {DEFAULT_CHALLENGE,isChallenge,normalizeChallenge} from '../supabase/functions/_shared/challenges.js';
const scoreKey=e=>`${scorePartition(e)}:${e.id}`;
export function createStorage(storage,{canWrite=()=>true,context=genericContext}={}){
 const profile=readProfile(storage,context),submitted=new Set([...profile.boards.rush,...profile.boards.festival,...profile.boards.endless].map(scoreKey));
 try{const raw=JSON.parse(storage?.getItem(context.profileKey)||'null');if(raw?.version===1&&Object.hasOwn(raw,'recovery'))profile.recovery=raw.recovery;}catch{}
 function persist(){try{if(!storage||!canWrite())return false;// Anything successfully read back from this write is durable, including its award notice.
 const record=profile.recovery?.progressReward?{...profile,recovery:{...profile.recovery,progressReward:{...profile.recovery.progressReward,persisted:true}}}:profile;
 storage.setItem(context.profileKey,JSON.stringify(record));if(record!==profile)profile.recovery=record.recovery;return true;}catch{return false;}}
 function updateCharacter(transition,id){const next=transition(profile,id);if(next===profile)return {accepted:false,persisted:false};Object.assign(profile,next);return {accepted:true,persisted:persist()};}
 return {
  get profile(){const {recovery,...publicProfile}=profile;return structuredClone(publicProfile)},get recovery(){return structuredClone(profile.recovery??null)},
  saveRecovery(value){profile.recovery=structuredClone(value);return {persisted:persist()};},
  commitStage(stage,value){const result=awardStage(profile.progress,stage);profile.progress=result.progress;profile.recovery=structuredClone(value);return {...result,persisted:persist()};},
  commitScore(mode,entry,value){if(!['rush','festival','endless'].includes(mode)||!validScore(entry,mode)||submitted.has(scoreKey(entry)))return {accepted:false,persisted:false};submitted.add(scoreKey(entry));profile.boards[mode]=rankScores([...profile.boards[mode],entry],mode);profile.recovery=structuredClone(value);return {accepted:true,persisted:persist(),ranked:profile.boards[mode].some(e=>scoreKey(e)===scoreKey(entry))};},bestFor(version=GENERIC_SCORING_VERSION,challenge=DEFAULT_CHALLENGE){return version==='arcade-v3'?profile.bestRushByChallenge[normalizeChallenge(challenge)]??0:profile.bestRushBySeason[version]??0},get best(){return profile.bestRush},get sound(){return profile.audio.enabled},
  savePlaytestConsent(value,identity=null){if(!['accepted','declined'].includes(value))return {accepted:false,persisted:false};profile.playtestConsent=value;profile.playtestIdentity=value==='accepted'?identity:null;return {accepted:true,persisted:persist()};},
  saveBest(value,version=GENERIC_RULES.id,challenge=DEFAULT_CHALLENGE){if(!GENERIC_SCORING_VERSIONS.includes(version)||version==='arcade-v3'&&!isChallenge(challenge))return 0;const table=version==='arcade-v3'?profile.bestRushByChallenge:profile.bestRushBySeason,key=version==='arcade-v3'?challenge:version;if(Number.isSafeInteger(value)&&value>table[key])table[key]=value;profile.bestRush=profile.bestRushBySeason[GENERIC_RULES.id];persist();return table[key]},
  saveChallenge(value){if(!isChallenge(value))return {accepted:false,persisted:false};profile.challengePreference=value;return {accepted:true,persisted:persist()};},
  savePlayerName(value){const result=validatePlayerName(value);if(!result.ok)return {accepted:false,persisted:false,error:result.error};profile.playerName=result.name;return {accepted:true,persisted:persist()};},
  saveCharacterSlot(id){return updateCharacter(saveCharacterSlot,id);},
  loadCharacterSlot(id){return updateCharacter(loadCharacterSlot,id);},
  deleteCharacterSlot(id){return updateCharacter(deleteCharacterSlot,id);},
  saveSound(value){profile.audio.enabled=Boolean(value);return {accepted:true,persisted:persist()}},
  saveAudio(value){profile.audio=normalizeAudio(value);return {accepted:true,persisted:persist()}},
  saveTheme(value){if(!isThemePreference(value))return {accepted:false,persisted:false};profile.themePreference=value;return {accepted:true,persisted:persist()};},
  saveCharacterConfirmed(){profile.characterConfirmed=true;return {persisted:persist()};},
  saveOutfit(value){const next=normalizeOutfit(value);if(Object.keys(WARDROBE).some(key=>requirement(profile.progress,`${key}:${next[key]}`)))return {accepted:false,persisted:false};profile.outfit=next;return {accepted:true,persisted:persist()}},
  awardProgress(stage){const result=awardStage(profile.progress,stage);profile.progress=result.progress;return {...result,persisted:persist()};},
  submitScore(mode,entry){if(!['rush','festival','endless'].includes(mode)||!validScore(entry,mode)||submitted.has(scoreKey(entry)))return {accepted:false,persisted:false};submitted.add(scoreKey(entry));profile.boards[mode]=rankScores([...profile.boards[mode],entry],mode);return {accepted:true,persisted:persist(),ranked:profile.boards[mode].some(e=>scoreKey(e)===scoreKey(entry))};},
 };
}
