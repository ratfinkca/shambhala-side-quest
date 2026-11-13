export const CONTROL_PREFERENCES=Object.freeze({mode:'tap',sensitivity:1,camera:'auto',zoom:1,hand:'left'});
const choice=(value,allowed,fallback)=>allowed.includes(value)?value:fallback;
const range=(value,min,max,fallback)=>Number.isFinite(value)?Math.max(min,Math.min(max,value)):fallback;

export function sanitizeControlPreferences(value){
 const input=value&&typeof value==='object'&&!Array.isArray(value)?value:{};
 return Object.freeze({
  mode:choice(input.mode,['tap','swipe','stick'],CONTROL_PREFERENCES.mode),
  sensitivity:range(input.sensitivity,.6,1.6,CONTROL_PREFERENCES.sensitivity),
  camera:choice(input.camera,['auto','follow','overview'],CONTROL_PREFERENCES.camera),
  zoom:range(input.zoom,.8,1.5,CONTROL_PREFERENCES.zoom),
  hand:choice(input.hand,['left','right'],CONTROL_PREFERENCES.hand),
 });
}

// Input/camera choices are device preferences, separate from run checkpoints.
// Callers provide an edition-specific key so the two editions remain isolated.
export function createControlPreferences(storage,{key}={}){
 let value=CONTROL_PREFERENCES;
 try{if(key)value=sanitizeControlPreferences(JSON.parse(storage?.getItem(key)||'null'));}catch{/* Use defaults for unavailable or malformed storage. */}
 return {
  get value(){return value;},
  update(patch){
   value=sanitizeControlPreferences({...value,...(patch&&typeof patch==='object'&&!Array.isArray(patch)?patch:{})});
   let persisted=false;
   try{if(key&&typeof storage?.setItem==='function'){storage.setItem(key,JSON.stringify(value));persisted=true;}}catch{/* Keep the choice for this session. */}
   return {value,persisted};
  },
 };
}
