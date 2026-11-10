// Data-only contracts: safe to import in both browser and edge validators.
export function deepFreeze(value){
 if(value&&typeof value==='object'&&!Object.isFrozen(value)){
  Object.values(value).forEach(deepFreeze);Object.freeze(value);
 }
 return value;
}
export const GENERIC_RULES=deepFreeze({id:'arcade-v1',mainStageIds:['forest','neon','sunrise'],targets:[20,25,30],roundMs:60000,endless:{targetStep:3,targetCap:45,crowdStep:2,crowdCap:22,speedStep:.08,speedCap:.2}});
export const GENERIC_VARIATION_IDS=Object.freeze(['forest-creekside','forest-weave','neon-stereo','neon-crossfade','sunrise-islands','sunrise-lane']);
export function routePosition(index,routeLength){
 if(!Number.isSafeInteger(index)||index<0||!Number.isSafeInteger(routeLength)||routeLength<=0)throw new RangeError('Invalid route position');
 return {offset:index%routeLength,loop:Math.floor(index/routeLength)};
}
export function genericTarget(index,endless=false){
 if(!endless)return GENERIC_RULES.targets[index];
 const {offset,loop}=routePosition(index,GENERIC_RULES.mainStageIds.length);
 return Math.min(GENERIC_RULES.endless.targetCap,GENERIC_RULES.targets[offset]+loop*GENERIC_RULES.endless.targetStep);
}
