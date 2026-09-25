export function createStorage(storage) {
  let best = 0, sound = false;
  try { const value = Number(storage.getItem('sidequest.best')); if (Number.isFinite(value) && value >= 0) best = Math.floor(value); sound = storage.getItem('sidequest.sound') === 'true'; } catch {}
  return {
    get best() { return best; }, get sound() { return sound; },
    saveBest(value) { if (Number.isFinite(value) && value > best) best = Math.floor(value); try { storage.setItem('sidequest.best', String(best)); } catch {} return best; },
    saveSound(value) { sound = Boolean(value); try { storage.setItem('sidequest.sound', String(sound)); } catch {} },
  };
}
