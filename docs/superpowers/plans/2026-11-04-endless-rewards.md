# Endless Souvenirs Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Build the approved four-achievement M3 collection and a playable local preview.

**Architecture:** Extend local normalized progression with bounded Endless records. Run completion supplies trusted local stage context; existing storage receipts handle persistence and duplicate rewards. Procedural avatar graphics and wardrobe cards present rewards; DEV rehearsal provides isolated demonstrations.

**Tech Stack:** Existing Vite, Phaser, JavaScript, Node test runner. No new packages.

**Spec:** `docs/superpowers/specs/2026-11-04-endless-rewards-design.md`

## Global Constraints

- No score rule, perk strength, consent, network payload or backend changes.
- Preserve old unlocks; the four new rewards require new achievement credit, even for legacy profiles.
- Award only on qualifying Endless stage completion, without needing score saving or posting.
- Reduced motion draws stable versions; no spawned particle systems or full-screen cosmetics.
- Preview fixtures use isolated memory and never persist scores or analytics.

## Review Focus

- Old saves with legacy wardrobe must retain old items but not bypass new locks.
- A swap counts only if its immediately following stage qualifies; cancellation/add/keep cannot count.
- Original, failed, duplicated or unknown layouts must not inflate the six-layout collection.
- Reload and blocked storage must preserve earned/session progress without duplicate XP or reveal.
- Mobile preview must stay visible, reachable and readable; reduced motion must freeze all new effects.

### Task 1: Persistent achievement credit

**Files:** `src/progression.js`, `src/run.js`, `src/main.js`, `tests/endless-rewards.test.mjs`.
**Interfaces:** `normalizeProgress` adds `{endless:{bestCleared,layouts,remixed}}`; `achievementValue(progress,achievement)` supplies progress; `finishStage` returns `progressContext:{mode,stagesCleared,variationId,remixed}` consumed by `awardStage` via main.
- [x] Write tests for 4/12 clear milestones, all-six collection across runs, swap-following-clear, failure/add/keep/cancel exclusions, legacy migration, duplicate receipts and reload.
- [x] Run `node --test tests/endless-rewards.test.mjs`; expect missing achievement failures.
- [x] Implement the interfaces and narrow legacy grandfathering to previous item IDs.
- [x] Run focused tests and `npm test`; expect all green.
- [x] Commit persistent achievement logic.

### Task 2: Artwork, wardrobe and preview

**Files:** `src/wardrobe.js`, `src/Avatar.js`, new `src/endless-cosmetics.js`, `src/progression-view.js`, `src/screens.js`, `src/main.js`, `src/rehearsal.js`, CSS, `tests/endless-cosmetics.test.mjs`.
**Interfaces:** Registry IDs `hat:spore`, `totem:mixtape`, `onesie:mycelium`, `flair:aurora`; `drawEndlessCosmetics(graphics,outfit,time,reduced,drop)` draws bounded decorative artwork; `renderEndlessRewards(progress)` supplies preview cards.
- [x] Write tests for registry/unlock agreement, stable reduced-motion graphics, bounded effects and progress/preview UI; run focused tests expecting missing feature failures.
- [x] Draw new artwork in a separate foreground layer, pass drop context from gameplay and a periodic demonstration in wardrobe.
- [x] Add reward cards with named preview buttons, progress and clear collection checklist. Enlarge preview without obscuring controls.
- [x] Add DEV reward lab entry and earn-demo using isolated in-memory storage; production excludes lab. Existing rehearsal still disables scores and progress writes.
- [x] Run focused tests, full suite and build; expect all green.
- [x] Verify locked/earned preview, achievement reveal, reload, normal play, phone layout and reduced motion in browser. Capture screenshots outside repo.
- [x] Update roadmap/handoff and validation notes, then commit preview.

### Task 3: Review and handoff

- [x] Request one independent whole-branch review, inspect migrations/credit boundaries/preview isolation.
- [x] Fix important findings with regression coverage; run full tests/build/diff checks.
- [x] Present the local preview and evidence; leave publication for a separate ship request.
