export function preventGameKeyDefault(key, playing, arenaFocused) {
  return playing && arenaFocused && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(key);
}
