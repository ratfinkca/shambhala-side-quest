export function fitGameWidth(width, height, chrome) {
  return Math.max(0, Math.min(width, (height - chrome - 2) * 1.5 + 2));
}

export function setupResponsiveLayout(game,{getScene=()=>null}={}) {
  const shell = document.querySelector('.shell');
  const frame = document.querySelector('.game-frame');
  const outside = ['.masthead', '.intro', '.page-footer'].map(s => document.querySelector(s));
  const inside = ['.hud', '.beat-bar', '.game-footer'].map(s => document.querySelector(s));
  let pending = false;
  const resize = () => {
    pending = false;
    shell.style.height = `${window.visualViewport?.height || window.innerHeight}px`;
    const style = getComputedStyle(shell);
    const width = shell.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
    const height = shell.clientHeight - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom) - outside.reduce((sum, el) => sum + el.getBoundingClientRect().height, 0);
    const chrome = inside.reduce((sum, el) => sum + el.getBoundingClientRect().height, 0);
    const menu=frame.dataset.menu!=='playing';
    frame.style.height=menu?`${Math.max(180,height)}px`:'';
    frame.style.width = `${width}px`;
    const arena=frame.querySelector('.arena-wrap');
    arena.style.height=`${Math.max(120,height-chrome-2)}px`;
    arena.style.aspectRatio='auto';
    resizeGameViewport(game,arena.clientWidth,arena.clientHeight,getScene());
    game.scale.refresh();
  };
  const schedule = () => { if (!pending) { pending = true; requestAnimationFrame(resize); } };
  const observer = new ResizeObserver(schedule);
  [shell, ...outside, ...inside].forEach(el => observer.observe(el));
  window.addEventListener('resize', schedule);
  window.visualViewport?.addEventListener('resize', schedule);
  document.addEventListener('fullscreenchange', schedule);
  schedule();
  return schedule;
}
import {resizeGameViewport} from './game-viewport.js';
