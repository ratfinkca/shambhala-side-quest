# Endless Recovery Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restore an interrupted Endless run at its last saved moment, paused, without duplicate rewards or posts.

**Architecture:** An allowlisted recovery codec stores logical scene/run state in the existing profile. Storage transactions combine stage awards or local scores with the checkpoint. A Web Lock owns each profile, while a controller coordinates lifecycle saving, recovery menus and immutable score retries.

**Tech Stack:** Existing Vite/Phaser, JavaScript, Node 24 tests, localStorage, Web Locks. No new packages.

**Spec:** [Approved design](../specs/2026-11-05-run-recovery-design.md).

## Global Constraints

- Same browser/device, Endless only; no backend/schema/scoring changes, cloud saves or balance changes.
- At most once per second during play, immediately at important transitions; restore paused, clear input, no offline clock consumption.
- Existing profile and recovery share one synchronous write; preserve receipt/run/ticket/build identity.
- Recovery field capped at 2 MiB, existing online history 1440 stages; no production test writes.
- Recovered analytics stop until a new run; input labels remain independent; existing labs never access real recovery.
- Local preview only; publishing requires a later ship request. Execute natively per the established user preference.

## Review Focus

- A response arrives after pagehide or ownership loss: stale callbacks cannot overwrite the new authoritative profile.
- Storage quota failure at a stage boundary: profile and checkpoint remain jointly old or jointly new.
- Refresh during pending posting: exact original payload/build/ticket retries, including after expiry.
- Very long runs and finite runtime sentinels: no truncated-total recovery or duplicated receipts beyond 256 stages.
- BFCache/two tabs: no second writer, active timer advance, ticket issuance or stale settings writes before ownership.

---

### Task 1: Validated logical recovery codec

**Files:** Create `src/recovery.js`, `tests/recovery.test.mjs`; reuse run/game/score registries.
**Interfaces:** `makeRecovery({run,screen,scene,summary,resultSnapshot,progressReward,submission,inputType,buildId,now})`; `readRecovery(value)` returns `{ok,value}` or `{ok:false,code}`; `recoveryScreen(screen,run)` canonicalizes UI state. Scene consumes codec scene objects in Task 3.
- [ ] Write roundtrip/malformed/score/perk/timer/candy/encounter/history-limit and incompatible-version tests, with Infinity/null sentinel assertions and >256-stage fixtures.
- [ ] Run `node --test tests/recovery.test.mjs`; expect RED for missing codec.
- [ ] Implement explicit schema validation and normalization, trusted derived rules/layout, bounded serialization and immutable snapshot cloning.
- [ ] Run codec tests; expect all PASS; commit.

### Task 2: Atomic profile commits, ownership and online retry persistence

**Files:** Modify `src/profile.js`, `src/storage.js`, `src/online/submission.js`; create `src/recovery-owner.js`, `tests/recovery-storage.test.mjs`, `tests/recovery-owner.test.mjs`; extend `tests/online-submission.test.mjs`.
**Interfaces:** storage `saveRecovery(value)`, `get recovery`, `commitStage(stage,value)`, `commitScore(mode,entry,value)`; submission `snapshot()` and `createSubmission(runId,snapshot)`; owner `createRecoveryOwner({locks,name})` with `acquire()/release()` and `held/supported`.
- [ ] Write crash-boundary, quota, malformed recovery/profile preservation, duplicate reward/score, lock busy/release/reacquire, exact pending retry/expiry tests.
- [ ] Run the task's test files; expect RED for missing methods.
- [ ] Implement optional raw recovery storage independently of profile normalization, transactional profile methods, non-stealing Web Lock ownership, immutable submission export/import with pending→retry and original expiry.
- [ ] Run `node --test tests/recovery-storage.test.mjs tests/recovery-owner.test.mjs tests/online-submission.test.mjs`; expect all PASS; commit.

### Task 3: Scene capture and paused restore

**Files:** Modify `src/GameScene.js`, `src/Crowd.js`; extend `tests/scene.test.mjs` and codec tests.
**Interfaces:** scene `captureRecovery()` returns allowlisted logical scene state, `restoreRecovery(snapshot,config)` reconstructs scene paused; existing startRound remains unchanged for new runs.
- [ ] Write tests for capture/restore, spark/candy/encounter state, no randomizing/awarding on restoration, paused time, input clearing and derived crowd/drop state.
- [ ] Run `node --test tests/scene.test.mjs tests/recovery.test.mjs`; expect RED for absent scene methods.
- [ ] Implement restore using trusted stage/rules and direct logical state hydration, not ordinary start/finish game events. Cosmetic transients may reset.
- [ ] Run scene/codec tests; expect all PASS; commit.

### Task 4: Recovery lifecycle and player flow

**Files:** Create `src/recovery-controller.js`, `src/recovery-view.js`; modify `src/main.js`, `src/screens.js`, `src/playtest/session.js`, `index.html`, `styles.css`; tests `tests/recovery-controller.test.mjs`, `tests/recovery-view.test.mjs`, session/screen regressions.
**Interfaces:** controller owns persistence scheduling/ownership through injected capture/storage/clock, `save(force)`, `release`, and guard `canWrite`; recovery view renders resume/discard/invalid/busy states using trusted snapshot. Main wires these to existing run transitions and atomic stage/score commit.
- [ ] Write tests for throttle/force, busy/no-lock states, callback invalidation, paused resume/discard/cancel, no save on empty rules, results recovery, analytics suppression with input preservation and new-run reset.
- [ ] Run controller/view/session/screen tests; expect RED for missing flow.
- [ ] Implement pre-profile lock acquisition and lifecycle guards, recovery screen transitions, native buttons, original run build/ticket, durable result/local-save transactions, notices and isolated input classification.
- [ ] Run `npm test`; expect all PASS; commit.

### Task 5: Disposable recovery lab and complete acceptance

**Files:** Modify `src/rehearsal.js`, `src/main.js`; tests for lab namespace/fixtures; update README, roadmap/handoff, validation evidence and this plan.
**Interfaces:** `/?rehearsal&recovery` persistent disposable namespace; DEV recovery fixture/control and reset do not read/write real profile, analytics or arcade services.
- [ ] Write reload-isolation/reset/production-fixture tests and missing end-to-end boundary regressions; observe RED.
- [ ] Build lab presets for active candy/Bass Head, stage/perk/results; keep existing rehearsal untouched.
- [ ] Run `npm test`, `npm run build`, doc-link and diff checks; expect PASS and no lab fixture strings in production bundle.
- [ ] Browser-check reload/resume/discard, timers/effects, stage-end/results, phone portrait/landscape, themes and two tabs; save screenshots outside repo.
- [ ] Run independent whole-branch review, fix important findings with regressions, rerun required checks; commit and present local preview. Preserve physical OS eviction/performance limits.
