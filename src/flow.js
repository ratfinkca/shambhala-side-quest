import {elapsedMs,roundTiming} from './stage-clock.js';
const windows = [[8000, 20000], [33000, 48000]];
export const PICKUP_MIN_WINDOW_MS=2000, PICKUP_COOLDOWN_MS=8000;
export function flowWindows(rules){return (rules.flowFinder?[[8000,20000],[28000,40000],[44000,56000]]:windows).map(pair=>[...pair]);}
export function createFlowSchedule(rules){return {version:1,windows:flowWindows(rules),skipped:[],cooldownUntilMs:0};}
const effectDuration=round=>round.rules.flowDurationMs+(round.flowTaken.length===0?(round.rules.firstFlowBonusMs||0):0);
export function availableFlow(round) {
  if (round.ended) return -1;
  const elapsed = elapsedMs(round),schedule=round.flowSchedule;
  if(!schedule)return windows.findIndex(([start, end], i) => elapsed >= start && elapsed < end && !round.flowTaken.includes(i));
  if(round.flowMs>0)return -1;
  for(const [i,[start,end]] of schedule.windows.entries()){
    if(round.flowTaken.includes(i)||schedule.skipped.includes(i))continue;
    const opens=Math.max(start,schedule.cooldownUntilMs),closes=Math.min(end,roundTiming(round).durationMs-effectDuration(round));
    if(closes-opens<PICKUP_MIN_WINDOW_MS||elapsed>=closes){schedule.skipped.push(i);continue;}
    if(elapsed>=opens)return i;
  }
  return -1;
}
export function activateFlow(round) {
  const slot = availableFlow(round);
  if (slot < 0) return false;
  const duration=effectDuration(round);
  round.flowTaken.push(slot);round.flowMs=duration;
  if(round.flowSchedule)round.flowSchedule.cooldownUntilMs=elapsedMs(round)+duration+PICKUP_COOLDOWN_MS;
  return true;
}
// Count cooldown from expiry on the active game clock, including duration perks.
export function advanceFlow(round,dt,previousElapsed){
 const remaining=round.flowMs;round.flowMs=Math.max(0,remaining-dt);
 if(round.flowSchedule&&remaining>0&&round.flowMs===0)round.flowSchedule.cooldownUntilMs=previousElapsed+remaining+PICKUP_COOLDOWN_MS;
}
export function flowRecoveryOK(round,{rules,durationMs=60000,required=rules.pickupSchedulerVersion===1}={}){
 const schedule=round.flowSchedule,n=required?(rules.flowFinder?3:2):2;
 if(!Array.isArray(round.flowTaken)||round.flowTaken.length>n||new Set(round.flowTaken).size!==round.flowTaken.length||!round.flowTaken.every(i=>Number.isInteger(i)&&i>=0&&i<n))return false;
 if(!required)return schedule===undefined;
 if(!schedule||Object.keys(schedule).some(k=>!['version','windows','skipped','cooldownUntilMs'].includes(k))||schedule.version!==1||JSON.stringify(schedule.windows)!==JSON.stringify(flowWindows(rules)))return false;
 if(!Array.isArray(schedule.skipped)||new Set(schedule.skipped).size!==schedule.skipped.length||!schedule.skipped.every(i=>Number.isInteger(i)&&i>=0&&i<n&&!round.flowTaken.includes(i)))return false;
 const cooldown=schedule.cooldownUntilMs,elapsed=durationMs-round.remainingMs;
 if(!Number.isFinite(cooldown)||cooldown<0||cooldown>durationMs+PICKUP_COOLDOWN_MS||(!round.flowTaken.length&&cooldown!==0))return false;
 if(round.flowMs>0&&Math.abs(cooldown-(elapsed+round.flowMs+PICKUP_COOLDOWN_MS))>1)return false;
 return true;
}
export function attractSpark(spark, player, delta) {
  const dx = player.x - spark.x, dy = player.y - spark.y;
  const distance = Math.hypot(dx, dy);
  if (!distance || distance > 130) return;
  const travel = Math.min(distance, 420 * Math.min(50, Math.max(0, delta)) / 1000);
  spark.x += dx / distance * travel;
  spark.y += dy / distance * travel;
}
