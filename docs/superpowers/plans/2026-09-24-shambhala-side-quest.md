# Shambhala Side Quest Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Deliver a playable, rewarding 60-second festival collection game locally.

**Architecture:** One Phaser scene owns the arena, input, artwork, and effects. A pure JavaScript model owns scoring and active round time; HTML owns menus and HUD. Small persistence and audio adapters degrade gracefully.

**Tech Stack:** Phaser 3.90, Vite, JavaScript ES modules, HTML/CSS, Web Audio, localStorage, Node built-in tests. Node 24.11.1 and npm 11.6.2 are available.

**Spec:** `docs/superpowers/specs/2026-09-24-shambhala-side-quest-design.md`

## Global Constraints
- Phaser is the only runtime dependency. No backend, account, or external fonts.
- Audio starts only after user interaction and is muted by default.
- Respect reduced motion by removing trails, pulses, and celebration bursts.
- No multiplayer, leaderboard service, login, shop, progression tree, licensed music, external image assets, or deployment.
- Use a single primary implementer in the current session.

## Review Focus
- Background tabs must pause active time and audio; returning must require Resume.
- Replay must clear score, chain, timer, input targets, and effects without duplicating listeners.
- Resizing and touch input must preserve correct pointer coordinates and player bounds.
- Denied storage or unavailable audio must never prevent starting or finishing a round.
- A collection at or after zero remaining time must not award points.

## Task 1: Tested rules and runnable Phaser arena

**Files:** Create `package.json`, `.gitignore`, `index.html`, `styles.css`, `src/game.js`, `src/main.js`, `src/GameScene.js`, `tests/game.test.mjs`.

**Interfaces:** `createRound()` returns `{remainingMs:60000, score:0, chain:0, multiplier:1, bestMultiplier:1, pickups:0, sincePickupMs:Infinity, ended:false}`. `advanceRound(round, dtMs)` mutates active time and expires chains. `collect(round)` updates score and returns `{points, celebrate}`. The first four chain pickups earn 10 each; pickup five earns 20; multiplier is `min(5, 1 + floor(chain/5))`. A chain expires only when the gap exceeds 2000 ms. `movePlayer(player, direction, dtMs, bounds)` normalizes direction and clamps the resulting position; use radius 14 and speed 300 logical units per second.

- [ ] Create tests first. Include these core examples plus cap, diagonal-speed, bounds, and restart cases:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { createRound, advanceRound, collect } from '../src/game.js';

test('fifth consecutive pickup upgrades multiplier', () => {
  const round = createRound();
  for (let i = 0; i < 5; i++) collect(round);
  assert.equal(round.score, 60);
  assert.equal(round.multiplier, 2);
});
test('expired chain preserves score', () => {
  const round = createRound();
  collect(round);
  advanceRound(round, 2001);
  assert.equal(round.chain, 0);
  assert.equal(round.score, 10);
});
test('round expiry blocks points', () => {
  const round = createRound();
  advanceRound(round, 60000);
  collect(round);
  assert.equal(round.score, 0);
  assert.equal(round.ended, true);
});
```

- [ ] Run `node --test tests/game.test.mjs`; confirm failure from the missing implementation.
- [ ] Implement the documented model and movement helpers, then rerun the tests.
- [ ] Install `phaser@3.90.0` and Vite, commit the lockfile, and define `dev: vite --host 127.0.0.1`, `build: vite build`, and `test: node --test` scripts. Ignore `node_modules`, `dist`, and browser test artifacts.
- [ ] Configure Phaser with a 960 × 640 logical arena, FIT scaling and centered canvas. Create one scene and 12 collectibles. Drive the model from `update(time, delta)` only while running; advance time before evaluating collisions. Use circle-distance collisions and replenish collected sparks at least 80 units away from the player.
- [ ] Wire mouse/touch targets and WASD/arrows. Keyboard input cancels the prior pointer target; movement stops at the target. Use logical scene coordinates. Verify collection and bounded movement in the browser.

## Task 2: Finished game flow and festival atmosphere

**Files:** Update `index.html`, `styles.css`, `src/main.js`, `src/GameScene.js`; create `src/audio.js`.

**Interfaces:** Scene methods `startRound()`, `pauseRound()`, `resumeRound()` control lifecycle. Emit `round:update` with a state snapshot and `round:end` once per round. The app binds DOM listeners once. Audio exposes `setEnabled(boolean)`, `pickup(multiplier)`, `celebrate()`, and `stop()`; failure becomes a silent no-op.

- [ ] Build HTML title, controls, score/time/combo HUD, start screen, pause overlay, and results with Play Again. Provide visible keyboard focus, accessible button names, and keyboard-focusable arena. Announce results once rather than every score update.
- [ ] Draw original evergreen silhouettes, a glowing stage, dancer, and sparks with Phaser graphics and generated textures. Add capped, short-lived pickup particles, floating points, and celebrations every 15 total pickups. Under reduced motion, keep a static arena and text feedback.
- [ ] Add optional synthesized pickup tones and a short celebration tone. Background beat is optional and is the first feature to cut if time is tight. Suspend sound on pause and stop old nodes on restart.
- [ ] Persist best score and sound preference with guarded storage reads/writes, validating numeric scores. Fall back to memory when storage fails. Display a personal best even on the first round.
- [ ] Pause on visibility loss and window blur; clear held keys and targets. Resume only from a user action. Resize via Phaser scaling without resetting state. Make touch handling local to the canvas and retain readable HUD at 390 px viewport width.
- [ ] Verify pause leaves timer unchanged; replay resets all round state; denied storage and audio leave gameplay functional. Confirm sound starts only following a user action, even with a stored preference.

## Task 3: Verification and handoff

**Files:** Create `README.md`; change implementation files only to resolve verified defects.

- [ ] Run `npm test` and `npm run build`; resolve failures before completion claims.
- [ ] Start Vite and play one complete round: start, collect, build combo, let combo expire, pause/resume, finish, and replay. Inspect browser errors.
- [ ] Check keyboard-only controls and narrow touch layout, resizing during a round, reduced motion, sound toggle, and score persistence after refresh. Confirm no score changes after finish and no duplicate effects after three restarts.
- [ ] Write launch instructions (`npm install`, `npm run dev`), controls, testing/build commands, and note that this is an unofficial personal game using original artwork and synthesized audio.
- [ ] Open the local game in Codex and report the playable URL, verification results, and any untested behavior or omitted optional beat.

## Review and execution
Await user review of this plan and revised spec. Recommended execution: the primary agent implements all three tasks in this session, keeping the small shared scene under one writer.
