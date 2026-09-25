import { cycleAt } from './festival.js';

export function createRound() {
  return { remainingMs: 60000, score: 0, chain: 0, multiplier: 1, bestMultiplier: 1, pickups: 0, closePasses: 0, slowedMs: 0, sincePickupMs: Infinity, ended: false };
}

export function advanceRound(round, dtMs) {
  if (round.ended) return;
  round.remainingMs = Math.max(0, round.remainingMs - Math.max(0, dtMs));
  round.sincePickupMs += Math.max(0, dtMs);
  round.slowedMs = Math.max(0, round.slowedMs - Math.max(0, dtMs));
  if (round.sincePickupMs > 2000) { round.chain = 0; round.multiplier = 1; }
  if (round.remainingMs === 0) round.ended = true;
}

export function collect(round) {
  if (round.ended) return { points: 0, celebrate: false };
  round.chain++;
  round.pickups++;
  round.sincePickupMs = 0;
  round.multiplier = Math.min(5, 1 + Math.floor(round.chain / 5));
  round.bestMultiplier = Math.max(round.bestMultiplier, round.multiplier);
  const points = 10 * round.multiplier * cycleAt(60000 - round.remainingMs).bonus;
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
