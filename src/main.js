import Phaser from 'phaser';
import { setupResponsiveLayout } from './layout.js';
import '../styles.css';
import { GameScene } from './GameScene.js';
import { createAudio } from './audio.js';
import { createStorage } from './storage.js';
import { preventGameKeyDefault } from './input.js';
import { cycleAt } from './festival.js';

const $ = selector => document.querySelector(selector);
let local;
try { local = window.localStorage; } catch {}
const saved = createStorage(local), audio = createAudio();
let scene, state = 'ready', sound = saved.sound, toastTimer;
const fmt = value => String(value).padStart(3, '0');
$('#best').textContent = fmt(saved.best);
function soundLabel() {
  $('#sound').textContent = sound ? 'Sound on' : 'Sound off';
  $('#sound').setAttribute('aria-pressed', String(sound));
}
soundLabel();
$('#play').disabled = true;
const game = new Phaser.Game({
  type: Phaser.AUTO, parent: 'game', width: 960, height: 640,
  backgroundColor: '#102430', scene: GameScene,
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  render: { antialias: true }, audio: { noAudio: true }, banner: false,
});
const refreshLayout = setupResponsiveLayout(game);
const fullscreen = $('#fullscreen');
fullscreen.hidden = !document.fullscreenEnabled;
fullscreen.addEventListener('click', async () => {
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else await document.documentElement.requestFullscreen();
  } catch { toast('Fullscreen is unavailable in this browser.'); }
});
document.addEventListener('fullscreenchange', () => { fullscreen.textContent = document.fullscreenElement ? 'Exit fullscreen' : 'Fullscreen'; });

game.events.on('forest:ready', value => { scene = value; $('#play').disabled = false; });

function overlay(label, title, copy, button, hint) {
  $('#overlay-label').textContent = label;
  $('#overlay-title').textContent = title;
  $('#overlay-copy').textContent = copy;
  $('#play').textContent = button;
  $('#overlay-hint').textContent = hint;
  $('#overlay').hidden = false;
  $('#play').focus({ preventScroll: true });
}
function clearToast() { clearTimeout(toastTimer); $('#toast').textContent = ''; }
function toast(message, duration = 1800) {
  clearToast();
  $('#toast').textContent = message;
  toastTimer = setTimeout(() => { $('#toast').textContent = ''; }, duration);
}
function pause() {
  if (state !== 'playing') return;
  state = 'paused';
  scene.pauseRound(); audio.stop(); clearToast();
  $('#pause').disabled = true;
  $('#result-stats').hidden = true;
  overlay('TAKE A BREATHER', 'Your flow can wait.', 'Your time is safe. The crowd and music will wait for you.', 'Back to the forest ↗', 'No rush. You’re on forest time.');
}
$('#play').addEventListener('click', () => {
  if (!scene) return;
  audio.stop(); audio.setEnabled(sound);
  $('#overlay').hidden = true;
  $('#result-stats').hidden = true;
  $('#pause').disabled = false;
  $('#announcement').textContent = '';
  clearToast();
  const resuming = state === 'paused';
  state = 'playing';
  document.body.dataset.mode = 'game';
  refreshLayout();
  if (resuming) scene.resumeRound(); else scene.startRound();
  $('#game').focus({ preventScroll: true });
});
$('#pause').addEventListener('click', pause);
$('#sound').addEventListener('click', () => {
  sound = !sound; saved.saveSound(sound); audio.setEnabled(sound); soundLabel();
});
document.addEventListener('visibilitychange', () => { if (document.hidden) pause(); });
window.addEventListener('blur', pause);
window.addEventListener('keydown', event => {
  if (event.key === 'Escape' && !event.repeat) {
    if (state === 'playing') pause(); else if (state === 'paused') $('#play').click();
  }
  if (preventGameKeyDefault(event.key, state === 'playing', document.activeElement === $('#game'))) event.preventDefault();
});

game.events.on('round:update', round => {
  $('#score').textContent = fmt(round.score);
  const seconds = Math.ceil(round.remainingMs / 1000);
  $('#time').textContent = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
  $('#time').style.color = seconds <= 10 ? '#f5b3bd' : '';
  $('#multiplier').textContent = `${round.multiplier}×`;
  $('#combo-label').textContent = round.chain ? `${round.chain} IN THE FLOW` : 'FIND YOUR FLOW';
  $('#combo-fill').style.width = `${round.chain ? Math.max(0, 1 - round.sincePickupMs / 2000) * 100 : 0}%`;
  const cycle = cycleAt(60000 - round.remainingMs);
  const count = Math.ceil(cycle.remainingMs / 1000);
  $('.game-frame').dataset.phase = cycle.phase;
  $('#phase-title').textContent = cycle.phase === 'drop' ? 'BASS DROP' : cycle.phase === 'build' ? 'HERE IT COMES' : cycle.phase === 'ended' ? 'GOOD WANDER' : count ? 'NEXT DROP' : 'LAST DANCE';
  $('#phase-detail').textContent = cycle.phase === 'ended' ? 'ROUND COMPLETE' : cycle.phase === 'drop' ? `2× ALL POINTS · ${count}s` : cycle.phase === 'build' ? `IN ${count}…` : count ? `${count}s` : 'MAKE IT COUNT';
  const progress = cycle.phase === 'drop' ? cycle.remainingMs / 4000 : cycle.phase === 'build' ? 1 - cycle.remainingMs / 3000 : 1 - cycle.remainingMs / 15000;
  $('#phase-fill').style.width = `${Math.max(0, Math.min(1, progress)) * 100}%`;
  $('#flow-status').textContent = round.flowMs > 0 && !round.ended ? `✦ FLOW ${Math.ceil(round.flowMs / 1000)}s` : '◇ FIND FLOW';
  $('#flow-status').classList.toggle('active', round.flowMs > 0 && !round.ended);
  $('#passes').textContent = round.closePasses;
  $('#crowd-tip').textContent = round.slowedMs > 0 && !round.ended ? 'Gentle bump · keep moving' : `Clean close passes = +${15 * cycle.bonus}`;
  if (state === 'playing') audio.sync(round);
});
game.events.on('round:phase', phase => {
  if (phase === 'build') toast('Feel that? Here comes the drop.', 2300);
  else if (phase === 'drop') { audio.drop(); toast('BASS DROP · DOUBLE VIBES', 2500); }
});
game.events.on('round:flow', () => { audio.celebrate(); toast('FLOW STATE · Sparks come to you', 2000); });

game.events.on('round:closepass', () => audio.closePass());
game.events.on('round:bump', () => {
  if (scene.phase === 'cruise') toast('Easy does it. Keep your flow.', 1100);
});
game.events.on('round:pickup', ({ multiplier, celebrate, pickups }) => {
  audio.pickup(multiplier);
  if (celebrate) {
    audio.celebrate();
    if (scene.phase === 'cruise') {
      const messages = ['You found your people.', 'Certified forest frequency.', 'Maximum wook energy.', 'One with the bass.'];
      toast(messages[(Math.floor(pickups / 15) - 1) % messages.length]);
    }
  }
});
game.events.on('round:end', round => {
  state = 'ended'; audio.stop(); clearToast(); $('#pause').disabled = true;
  const record = round.score > saved.best;
  saved.saveBest(round.score); $('#best').textContent = fmt(saved.best);
  overlay(record ? 'A NEW PERSONAL BEST' : 'THAT WAS A GOOD WANDER', record ? 'Look at you glow.' : 'Same time, same forest?', round.score ? 'The music fades. The good vibes stay.' : 'There’s a whole forest of sparks waiting for you.', 'One more round ↗', 'A minute well wasted.');
  $('#result-stats').hidden = false;
  $('#result-stats').replaceChildren();
  const score = document.createElement('strong'); score.textContent = `${round.score} vibes`;
  const passes = `${round.closePasses} smooth ${round.closePasses === 1 ? 'pass' : 'passes'}`;
  $('#result-stats').append(score, `${round.pickups} sparks · ${passes} · ${round.bestMultiplier}× best combo · Personal best ${saved.best}`);
  $('#announcement').textContent = `Round complete. ${round.score} points. ${passes}. Personal best ${saved.best}.`;
});
