import {validatePlayerName} from '../supabase/functions/_shared/player-name.js';
import {normalizeOutfit,DEFAULT_OUTFIT,WARDROBE} from './wardrobe.js';
import {normalizeProgress,requirement} from './progression.js';
import {SMF_RULES} from '../supabase/functions/_shared/smf-rules.js';

export const CHARACTER_SLOT_COUNT=4;
const validSlotId=id=>Number.isInteger(id)&&id>=0&&id<CHARACTER_SLOT_COUNT;

export function normalizeOwnedOutfit(value,progress){
 const outfit=normalizeOutfit(value),owned=normalizeProgress(progress);
 for(const key of Object.keys(WARDROBE)){
  const smfMycelium=key==='onesie'&&outfit[key]==='mycelium'&&Array.isArray(progress?.endless?.smfVenues);
  const locked=smfMycelium?!SMF_RULES.route.every(stage=>progress.endless.smfVenues.includes(stage.id)):requirement(owned,`${key}:${outfit[key]}`);
  if(locked)outfit[key]=DEFAULT_OUTFIT[key];
 }
 return outfit;
}

export function normalizeCharacterSlots(value,{progress,rewards=[]}={}){
 const slots=Array(CHARACTER_SLOT_COUNT).fill(null);
 if(!Array.isArray(value))return slots;
 for(const item of value.slice(0,CHARACTER_SLOT_COUNT)){
  if(!item||typeof item!=='object'||!validSlotId(item.id)||slots[item.id])continue;
  const result=validatePlayerName(item.name);if(!result.ok)continue;
  slots[item.id]={id:item.id,name:result.name,outfit:normalizeOwnedOutfit(item.outfit,progress),souvenir:Array.isArray(rewards)&&rewards.includes(item.souvenir)?item.souvenir:null};
 }
 return slots;
}

export function setCharacterPlayerName(profile,value){
 const result=validatePlayerName(value);if(!profile||!result.ok)return profile;
 return {...profile,playerName:result.name};
}

export function saveCharacterSlot(profile,id){
 if(!profile||!validSlotId(id)||!validatePlayerName(profile.playerName).ok)return profile;
 const slots=normalizeCharacterSlots(profile.characterSlots,profile);
 slots[id]={id,name:validatePlayerName(profile.playerName).name,outfit:normalizeOwnedOutfit(profile.outfit,profile.progress),souvenir:Array.isArray(profile.rewards)&&profile.rewards.includes(profile.souvenir)?profile.souvenir:null};
 return {...profile,characterSlots:slots};
}

export function loadCharacterSlot(profile,id){
 if(!profile||!validSlotId(id))return profile;
 const slots=normalizeCharacterSlots(profile.characterSlots,profile),slot=slots[id];if(!slot)return profile;
 return {...profile,playerName:slot.name,outfit:structuredClone(slot.outfit),characterSlots:slots,...(Object.hasOwn(profile,'souvenir')?{souvenir:slot.souvenir}:{})};
}

export function deleteCharacterSlot(profile,id){
 if(!profile||!validSlotId(id))return profile;
 const slots=normalizeCharacterSlots(profile.characterSlots,profile);if(!slots[id])return profile;
 slots[id]=null;return {...profile,characterSlots:slots};
}
