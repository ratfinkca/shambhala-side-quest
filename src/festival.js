import {getTiming,phaseAt,roundTiming,elapsedMs} from './stage-clock.js';

export function cycleAt(elapsed,timing=getTiming()){return phaseAt(elapsed,timing);}

export function awardClosePass(round) {
  if (round.ended) return 0;
  const points = round.rules.closePassPoints * cycleAt(elapsedMs(round),roundTiming(round)).bonus;
  round.score += points;
  round.closePasses++;
  round.surferMs=round.rules.surferDurationMs||0;
  round.scoreComponents.passes[cycleAt(elapsedMs(round),roundTiming(round)).bonus-1]++;
  return points;
}

export function createEncounter() {
  return { active: false, spoiled: false, travel: 0, cooldownUntil: 0, previousPlayer: null, previousDancer: null };
}

// Relative swept distance also catches a collision between two rendered frames.
function sweptDistance(a, b) {
  const dx = b.x - a.x, dy = b.y - a.y;
  const lengthSquared = dx * dx + dy * dy;
  const t = lengthSquared ? Math.max(0, Math.min(1, -(a.x * dx + a.y * dy) / lengthSquared)) : 0;
  return Math.hypot(a.x + t * dx, a.y + t * dy);
}

export function updateEncounter(encounter, player, dancer, elapsedMs) {
  const relative = { x: player.x - dancer.x, y: player.y - dancer.y };
  const previous = encounter.previousPlayer ? {
    x: encounter.previousPlayer.x - encounter.previousDancer.x,
    y: encounter.previousPlayer.y - encounter.previousDancer.y,
  } : relative;
  const distance = Math.hypot(relative.x, relative.y);
  const nearest = sweptDistance(previous, relative);
  const travel = encounter.previousPlayer ? Math.hypot(player.x - encounter.previousPlayer.x, player.y - encounter.previousPlayer.y) : 0;
  const bumped = nearest < 27;
  const contactStarted = bumped && !encounter.touching;
  const contactEnded = !bumped && !!encounter.touching;
  encounter.touching = bumped;
  let closePass = false;
  if (nearest <= 48 && !encounter.active) {
    encounter.active = true;
    encounter.travel = 0;
    encounter.nearest = nearest;
    encounter.spoiled = elapsedMs < encounter.cooldownUntil;
  }
  if (encounter.active) {
    encounter.nearest = Math.min(encounter.nearest, nearest);
    encounter.travel += travel;
    encounter.spoiled ||= bumped;
    if (distance > 58) {
      closePass = !encounter.spoiled && encounter.travel >= 24;
      if (closePass) encounter.cooldownUntil = elapsedMs + 3000;
      encounter.active = false;
      encounter.travel = 0;
    }
  }
  encounter.previousPlayer = { x: player.x, y: player.y };
  encounter.previousDancer = { x: dancer.x, y: dancer.y };
  return { bumped, closePass, contactStarted, contactEnded, clearance: closePass ? encounter.nearest - 27 : null };
}

const SPOTS = [[235,250],[385,255],[565,235],[735,260],[300,365],[665,365],[225,490],[410,490],[585,495],[750,485]];

export function crowdPosition(index, elapsedMs, anchors = SPOTS, speed = 1, timing = getTiming()) {
  // Integrate the extra drop speed; multiplying the timestamp would teleport dancers.
  const extraMs = timing.dropStartsMs.reduce((sum, start) => sum + Math.max(0, Math.min(timing.dropDurationMs, elapsedMs - start)) * 0.65, 0);
  const t = (elapsedMs + extraMs) / 1000 * speed;
  const [x, y] = anchors[index % anchors.length];
  const wander = index % 3 === 0;
  return {
    x: x + Math.sin(t * (wander ? .65 : .9) + index * 1.8) * (wander ? 52 : 15),
    y: y + Math.sin(t * .47 + index * 2.1) * (wander ? 30 : 12),
  };
}

export function applyBump(round,encounter,hit){
 if(hit.contactEnded)encounter.protected=false;
 if(!hit.bumped)return false;
 if(hit.contactStarted&&round.shieldsRemaining>0){round.shieldsRemaining--;encounter.protected=true;}
 if(!encounter.protected){round.slowedMs=600;return true;}
 return false;
}
