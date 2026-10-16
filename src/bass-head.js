export const BASS_CHARGE_MS=10000, BASS_ACTIVE_MS=6000, BASS_EXPOSURE_MS=6000;
export function createBass(chargeMs=0){return {chargeMs:Math.max(0,Math.min(BASS_CHARGE_MS,chargeMs)),exposureMs:0,activeMs:0};}
export function advanceBass(round,dt,inBass){
 if(round.ended)return;
 const b=round.bass,elapsed=Math.max(0,dt),chargingTime=Math.max(0,elapsed-b.activeMs);
 b.activeMs=Math.max(0,b.activeMs-elapsed);
 b.exposureMs=inBass?Math.min(BASS_EXPOSURE_MS,b.exposureMs+elapsed):Math.max(0,b.exposureMs-elapsed*2);
 if(inBass)b.chargeMs=Math.min(BASS_CHARGE_MS,b.chargeMs+chargingTime);
}
export function activateBass(round){
 const b=round.bass;
 if(round.ended||b.activeMs>0||b.chargeMs<BASS_CHARGE_MS)return false;
 b.chargeMs=0;b.activeMs=BASS_ACTIVE_MS;return true;
}
export function bassMovementFactor(b,radialFactor){
 if(radialFactor===1||b.activeMs>0)return 1;
 const exposure=Math.min(1,b.exposureMs/BASS_EXPOSURE_MS);
 return exposure===1?radialFactor:.9+(radialFactor-.9)*exposure;
}
