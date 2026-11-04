# Bass Interface Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Build the approved local Bass Head interface and feedback preview.

**Architecture:** Pure bass rules calculate spend/duration. A focused view helper derives one button state for menu and frame updates. Bounded graphics helpers render speaker ripples and player pressure/protection; DEV rehearsal supplies repeatable real-rule scenarios.

**Tech Stack:** Existing JavaScript, Phaser/Vite, CSS and Node tests. No new dependencies.

**Spec:** `docs/superpowers/specs/2026-11-04-bass-interface-design.md`

## Global Constraints

- Preserve all slowdown/exposure/cooldown/mud/bump rules.
- Activate from 2,500 charge, consume all charge, duration = charge / 10,000 × 6,000 ms.
- Preserve double zone points, no recharge while active, Bass Battery and stage carry.
- No field labels, harsh strobe, hitbox changes, new gesture or production fixture leakage.
- Local preview only; no production scores or analytics during QA.

## Review Focus

- Quarter/half/full charge boundaries and exact expiry with frame overshoot; no repeat activation.
- Paused/ended/hidden/no-speaker screens cannot activate a visible control or forward a tap to movement.
- Player cosmetics move together; protection and pressure remain visually distinct, including reduced motion.
- Small portrait/landscape viewports retain a usable control and readable field without layout jumps.
- Practice uses real rules, stays isolated from progression/online transport, and is absent from production.

### Task 1: Partial activation and score compatibility

**Files:** `src/bass-head.js`, bass/perk/scene/score tests.
**Interfaces:** `bassDuration(chargeMs)` gives 0 below minimum, else proportional ms; `createBass` adds `activeDurationMs`; `activateBass` spends all charge and sets both active timers.
- [x] Write failing boundary, duration, expiry/overshoot, unchanged slowdown and real score-validation tests; watch RED.
- [x] Implement minimum/duration without modifying `bassMovementFactor` or exposure updates.
- [x] Run focused/full tests; expect GREEN.

### Task 2: On-field control and visuals

**Files:** new `src/bass-view.js`, new `src/bass-feedback.js`, `src/main.js`, `src/GameScene.js`, `src/StageRenderer.js`, `index.html`, CSS, new view/drawing tests.
**Interfaces:** `bassButtonState` derives visibility, availability, phase, progress and labels; `updateBassButton` applies them. `drawSpeakerBass` and `drawPlayerBass` draw bounded marks.
- [x] Write failing UI-state/input-classification and drawing/reduced-motion tests; watch RED.
- [x] Move the native button into the arena, use a single state helper, preserve B and classify touch/mouse/keyboard correctly.
- [x] Render cone-origin ripples, pressure feet cues, mint protection; shake the complete avatar together, and keep it steady while protected.
- [x] Update help and activation announcements with actual duration. Run tests/build; expect GREEN.

### Task 3: Repeatable preview and acceptance

**Files:** `src/rehearsal.js`, `src/main.js`, fixture tests, roadmap/handoff/validation docs.
- [x] Test safe scenario presets; add DEV Bass lab with fresh/quarter/half/full/outside scenarios.
- [x] Check 25/50/100 activation, charge buildup, pause, B and click/touch control isolation in browser; inspect desktop/phone/landscape and all themes. Capture proof outside repo.
- [ ] Run full suite/build/fixture-exclusion/link/diff checks and one independent read-only review; fix important findings with regression proof.
- [ ] Commit locally and present the preview. Keep published candy release separate.
