export const BASS_CHARGE_MS=10000, BASS_ACTIVE_MS=6000, BASS_EXPOSURE_MS=6000;
export const BASS_MIN_CHARGE_MS=2500;
export function bassDuration(chargeMs){return Number.isFinite(chargeMs)&&chargeMs>=BASS_MIN_CHARGE_MS?BASS_ACTIVE_MS*Math.min(BASS_CHARGE_MS,chargeMs)/BASS_CHARGE_MS:0;}
export function createBass(chargeMs=0){return {chargeMs:Math.max(0,Math.min(BASS_CHARGE_MS,chargeMs)),exposureMs:0,activeMs:0,activeDurationMs:0};}
export function advanceBass(round,dt,inBass){
 if(round.ended)return 0;
 const b=round.bass,before=b.chargeMs,rate=round.rules?.bassChargeRate??1,elapsed=Math.max(0,dt),chargingTime=Math.max(0,elapsed-b.activeMs);
 b.activeMs=Math.max(0,b.activeMs-elapsed);
 b.exposureMs=inBass?Math.min(BASS_EXPOSURE_MS,b.exposureMs+elapsed):Math.max(0,b.exposureMs-elapsed*2);
 if(inBass)b.chargeMs=Math.min(BASS_CHARGE_MS,b.chargeMs+chargingTime*rate);
 // Analytics records active time spent charging, not the perk-amplified charge amount.
 return Math.max(0,b.chargeMs-before)/rate;
}
export function activateBass(round){
 const b=round.bass;
 const duration=bassDuration(b.chargeMs);
 if(round.ended||b.activeMs>0||!duration)return false;
 b.chargeMs=0;b.activeMs=duration;b.activeDurationMs=duration;return true;
}
export function bassMovementFactor(b,radialFactor){
 if(radialFactor===1||b.activeMs>0)return 1;
 const exposure=Math.min(1,b.exposureMs/BASS_EXPOSURE_MS);
 return exposure===1?radialFactor:.9+(radialFactor-.9)*exposure;
}
