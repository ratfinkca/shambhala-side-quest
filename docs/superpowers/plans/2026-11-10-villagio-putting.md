# Villagio Putting Implementation Plan

> **For agentic workers:** Use native execution with delegated pure-model implementation and independent final review. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Play two holes in Villagio and earn a temporary Golden Chicken Totem.

**Architecture:** Pure putting model owns shots/physics/progress. A dedicated canvas view/input adapter frames existing art and renders the ball/prize. Shared bonus entry handles lifecycle, HUD and looping rehearsal music; production/gameplay rules remain isolated.

**Tech Stack:** Existing JavaScript, Phaser 3, Vite, Node test runner. No dependencies.

**Spec:** `docs/superpowers/specs/2026-11-10-villagio-putting-design.md`

## Global Constraints

DEV-only SMF rehearsal. Two holes, eight total strokes, no deadline. No saves, XP, score, telemetry or permanent wardrobe writes. Use existing illustrated art. Other activities retain existing behavior. Every release/cancel/pause/switch must avoid accidental shots.

## Review Focus

- Extra pointers, outside release and pause mid-drag must not spend a shot.
- Eighth rolling shot must settle/sink before deciding failure.
- Low/high frame rates must produce the same physical result.
- Switching and restarting must restore camera/input/actors correctly.
- Looping music must not revive an ended visit or invoke shared round timeout.

## Task 1: Pure putting rules and meaningful tests

**Files:** create `src/bonus-practice/putting-state.js`, `tests/putting.test.mjs`.

**Interfaces:** export `PUTTING_HOLES`, `MAX_STROKES=8`, `createPuttingPractice()`. Practice exposes getters `state/status`, `start/pause/resume/finish`, `shoot({x,y})` normalized vector magnitude0..1, `advance(deltaMs)` returning an event or null, `nextHole()`, and inert `step()` for generic encounter compatibility. State has existing progress/goal/complete/collectedIds/visitedIds/greetedIds/carrying plus `holeIndex`, `strokes`, `ball:{x,y,vx,vy}`, `phase:'aim'|'rolling'|'between'|'won'|'lost'`, `elapsedMs`. Pause returns status paused, completion status complete, exhausted shots status ended. Event types shot, holed, settled, complete, exhausted; complete includes Golden Chicken Totem. Elapsed only advances while playing, including between holes. Hole coordinates are world positions against accepted illustration.

- [x] Write failing tests for real shots into both cups, too-fast misses, rim rebounds, stroke cap, phase gates, pause/resume/reset, deterministic partitioning and invalid inputs.
- [x] Implement fixed-step model and run those tests; assert world geometry matches the green and cup positions.

## Task 2: Putting view, controls and integration

**Files:** create `src/bonus-practice/putting-view.js`, `putting-input.js`, `tests/putting-input.test.mjs`; modify `config.js`, `state.js`, `entry.js`, `style.css`, `tests/bonus-practice.test.mjs`.

**Interfaces:** pure gesture helper maps normalized canvas drag to shot and gates active pointer/cancel/outside release. `createPuttingView(scene, practice, handlers)` exposes `update`, `cancelAim`, `destroy`; renders native overlays atop existing plate, owns DOM pointer listeners with cleanup, and frames active green or result. Entry owns accessible keyboard and Putt controls and calls model/view.

- [x] Add failing gesture tests for tap/cancel, second pointer, outside release, equal normalized mouse/touch strength, bounded power.
- [x] Implement gesture helper and view, keeping original scene running false for putting so shared pointerdown, movement and round timeout stay inactive.
- [x] Route activity putt to new model; update HUD/help/controls for holes, strokes, next green and prize. Music/lighting advance using active putting time modulo original phrase duration.
- [x] Verify reset, pause/tab hide, selector changes and cleanup cancel gestures and restore normal bonus view.
- [x] Update old exploration-specific tests to verify putting cannot progress by walking. Run focused and full tests.

## Task 3: Playtest, review and handoff

**Files:** current project handoff/roadmap/spec/validation docs; production exclusion script as needed.

- [x] Play both holes and inspect win at desktop and390×844; verify failed round, pause, restart and switch. Save real screenshot. Inspect console. Keep physical phone acceptance separate.
- [x] Run `npm test` and `npm run check:editions`; both must pass. Ensure new preview code/prize stays out of production.
- [x] Independent code review, fix material findings with tests, document remaining limitations. Update current docs and save local commit; no publishing.

Completed locally. See `../villagio-putting-validation.md` for test, playtest and review evidence. First-preview choices were delegated by the owner; no release was requested.
