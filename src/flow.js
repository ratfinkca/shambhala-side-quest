const windows = [[8000, 20000], [33000, 48000]];

export function availableFlow(round) {
  if (round.ended) return -1;
  const elapsed = 60000 - round.remainingMs;
  return windows.findIndex(([start, end], i) => elapsed >= start && elapsed < end && !round.flowTaken.includes(i));
}

export function activateFlow(round) {
  const slot = availableFlow(round);
  if (slot < 0) return false;
  round.flowTaken.push(slot);
  round.flowMs = round.rules.flowDurationMs;
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
