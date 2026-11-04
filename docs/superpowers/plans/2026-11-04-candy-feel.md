# Candy Feel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Produce a local M4 preview with inverted Dizzy controls and clearer Wavy Colours.

**Architecture:** Pure mystery input helpers map keyboard vectors and pointer destinations. A pure bounded graphics helper draws the colour effect; MysteryRenderer controls its lifecycle. DEV rehearsal drives the real collector with deterministic choices.

**Tech Stack:** Existing JavaScript, Phaser/Vite and Node tests. No new dependencies or backend changes.

**Spec:** `docs/superpowers/specs/2026-11-04-candy-feel-design.md`

## Global Constraints

- Keep timing, speed, scoring and perks unchanged; no production data writes during QA.
- Apply input inversion once; never invert a mirrored pointer target again each frame.
- No full-screen strobe, hitbox distortion or moving reduced-motion overlay.
- Preview is DEV-only and cannot save scores/XP or send analytics.

## Review Focus

- Collecting candy during an existing click/tap journey reverses it once.
- Diagonal keys, stationary input, arena edges and effect expiry behave predictably.
- Pause and stage reset freeze/clear effects; Sweet Tooth retains its duration.
- Reduced motion and Canvas rendering preserve readability without shader dependencies.
- Practice fixtures cannot appear in production or write progression.

### Task 1: Inverted steering

**Files:** `src/mystery.js`, `src/GameScene.js`, `tests/mystery.test.mjs`.
**Interfaces:** `mysteryDirection(m,d)` reverses active keyboard input; `mysteryTarget(m,player,target,{width,height}={})` returns the mirrored, bounded pointer destination.
- [x] Replace wobble expectations with failing reversed-direction, pointer endpoint/bounds, expiry and collision tests; watch RED.
- [x] Implement helpers and wire pointer-down / candy collection, leaving destination movement un-inverted.
- [x] Update candy hint/instructions and run focused/full tests; expect GREEN.

### Task 2: Liquid colour and practice

**Files:** new `src/candy-colours.js`, `src/MysteryRenderer.js`, `src/mystery.js`, `src/rehearsal.js`, `src/main.js`, tests and docs.
**Interfaces:** `drawCandyColours(g,m,reduced)` draws bounded scenery-only marks; `collectMystery` records effect start time. Rehearsal's `previewCandy` callback starts fresh practice with an allowed effect.
- [x] Write lifecycle/fade/static-motion tests at the drawing boundary; watch RED.
- [x] Draw slow colour pools and ribbons behind gameplay objects, preserve base palette/coordinates and existing duration.
- [x] Add a Candy lab dropdown and fresh-practice action behind DEV/rehearsal guards.
- [x] Run full tests, build and production-fixture exclusion check; expect GREEN.
- [x] Browser-check pointer/keyboard reversal, effect appearance, pause/reset and portrait layout; capture evidence outside repo.
- [ ] Request one fresh read-only review, fix important findings with regression evidence, update M3 release/M4 preview docs and commit locally.
