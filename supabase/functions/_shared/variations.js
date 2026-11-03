// Shared identity contract; geometry stays in the frontend stage registry.
export const VARIATION_IDS=['forest-creekside','forest-weave','neon-stereo','neon-crossfade','sunrise-islands','sunrise-lane'];
export function variationIdForStage(index){
 if(!Number.isSafeInteger(index)||index<0)return null;
 const loop=Math.floor(index/3);
 return loop<1?'original':VARIATION_IDS[(index%3)*2+(loop-1)%2];
}
