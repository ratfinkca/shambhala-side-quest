import {getTiming,roundTiming,elapsedMs} from './stage-clock.js';
import {createBass} from './bass-head.js';
import { rulesFor } from './run.js';
import { cycleAt } from './festival.js';
import {createMystery,advanceMystery} from './mystery.js';
import {createFlowSchedule,advanceFlow} from './flow.js';

export function createRound(options = {}, timingId = 'generic-60-v1') {
  const timing=getTiming(timingId);
  const rules = {...rulesFor([]), ...options};
  return { ...(timing===getTiming()?{}:{timingId:timing.id}),surferMs:0,scoreComponents:{sparks:Array(20).fill(0),passes:[0,0]}, rules, bass:createBass(), mystery:createMystery(Math.random,{rules,durationMs:timing.durationMs}),...(rules.pickupSchedulerVersion===1?{flowSchedule:createFlowSchedule(rules)}:{}), shieldsRemaining: rules.bumpShields, remainingMs: timing.durationMs, score: 0, chain: 0, multiplier: 1, bestMultiplier: 1, pickups: 0, closePasses: 0, slowedMs: 0, flowMs: 0, flowTaken: [], sincePickupMs: Infinity, ended: false };
}

export function advanceRound(round, dtMs) {
  if (round.ended) return;
  if(roundTiming(round)!==getTiming())dtMs=Math.min(round.remainingMs,Math.max(0,dtMs));
  const previousElapsed=elapsedMs(round);
  if(round.flowSchedule)dtMs=Math.min(round.remainingMs,Math.max(0,dtMs));
  round.remainingMs = Math.max(0, round.remainingMs - Math.max(0, dtMs));
  round.surferMs = Math.max(0,round.surferMs-Math.max(0,dtMs));
  advanceFlow(round,Math.max(0,dtMs),previousElapsed);
  round.sincePickupMs += Math.max(0, dtMs);
  round.slowedMs = Math.max(0, round.slowedMs - Math.max(0, dtMs));
  if (round.sincePickupMs > round.rules.comboGraceMs) { round.chain = 0; round.multiplier = 1; }
  if (round.remainingMs === 0) round.ended = true;
  advanceMystery(round.mystery,dtMs,round.ended);
}

export function collect(round,{playerInBass=false,sparkInBass=false}={}) {
  if (round.ended) return { points: 0, celebrate: false };
  round.chain++;
  round.pickups++;
  round.sincePickupMs = 0;
  round.multiplier = Math.min(5, 1 + Math.floor(round.chain / 5));
  round.bestMultiplier = Math.max(round.bestMultiplier, round.multiplier);
  const points = 10 * round.multiplier * cycleAt(elapsedMs(round),roundTiming(round)).bonus * (round.bass.activeMs>0&&playerInBass&&sparkInBass?2:1);
  const drop=cycleAt(elapsedMs(round),roundTiming(round)).bonus,bass=round.bass.activeMs>0&&playerInBass&&sparkInBass?2:1;
  round.scoreComponents.sparks[(round.multiplier-1)*4+(drop-1)*2+bass-1]++;
  round.score += points;
  return { points, celebrate: round.pickups % 15 === 0 };
}

export function movePlayer(player, direction, dtMs, bounds) {
  const length = Math.hypot(direction.x, direction.y);
  if (!length) return;
  const travel = 300 * Math.max(0, dtMs) / 1000;
  player.x = Math.min(bounds.width - 14, Math.max(14, player.x + direction.x / length * travel));
  player.y = Math.min(bounds.height - 14, Math.max(14, player.y + direction.y / length * travel));
}

export function moveToward(player, target, dtMs, bounds) {
  const delta = Math.min(Math.max(0, dtMs), 50);
  const x = Math.min(bounds.width - 14, Math.max(14, target.x));
  const y = Math.min(bounds.height - 14, Math.max(14, target.y));
  const direction = { x: x - player.x, y: y - player.y };
  if (Math.hypot(direction.x, direction.y) <= 300 * delta / 1000) {
    player.x = x; player.y = y;
    return true;
  }
  movePlayer(player, direction, delta, bounds);
  return false;
}
