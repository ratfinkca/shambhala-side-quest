# Edition Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Build a local two-edition foundation that preserves the published game and provides an isolated, non-playable SMF catalogue preview.

**Architecture:** Keep one engine and repository. Trusted edition manifests own identity/content/storage configuration; a data-only shared contract owns the existing generic rules. Default exports retain generic compatibility. SMF gameplay and its new online protocol belong to later milestones, after stage research/rules approval.

**Tech Stack:** Existing JavaScript ES modules, Phaser 3, Vite 8, Node 24 and Node test runner. No new dependency or backend deployment.

**Spec:** [Edition split design](../specs/2026-11-06-edition-split-design.md), specifically roadmap M0. M1–M6 are deliberately separate future plans.

## Global Constraints

- `VITE_EDITION=generic|smf`; unset means generic, an explicitly unknown value fails.
- Generic retains `sidequest.profile.v1` and its matching lock; SMF uses `sidequest.smf.profile.v1`.
- Generic keeps targets 20/25/30, 60-second rounds, existing variants/awards, four-slot Endless and exact `arcade-v1` requests.
- SMF scaffold is unplayable and non-posting, including when production endpoint variables are present.
- Consent remains opt-in; local saving and online posting remain separate.
- Legacy recovery-v1 is generic-only; preserve original ticket/build and exact pending submission payload.
- No production writes, public rebrand, remote fork, service creation or deployment in M0.
- Native execution is the user's established preference. Design/plan approved by the user on 2026-11-06 before product implementation.

## Review Focus

1. Existing accepted consent, unlocked wardrobe and a pending score retry survive the generic build without another onboarding/reset (Task 2).
2. Two editions open on the same origin cannot share locks, profile identity, recovery or reset side effects (Task 2).
3. SMF with valid production endpoint variables makes no arcade/analytics requests and offers no playable placeholder game (Task 4).
4. Vite public copying cannot leak embedded Shambhala title images into the generic artifact (Task 3).
5. An old paused recovery checkpoint retains timers, score ticket, original build and frozen retry bytes after the refactor (Tasks 1–2).

---

### Task 1: Trusted catalogue and generic rule extraction

**Files:** Create `src/editions/registry.js`, `src/editions/generic.js`, `src/editions/smf.js`, `supabase/functions/_shared/edition-rules.js`, `tests/editions.test.mjs`. Modify `src/run.js`, `src/endless.js`, `src/stage-variations.js`, `src/profile.js`, `src/recovery.js`, `supabase/functions/_shared/variations.js`, `supabase/functions/_shared/score.js`. Extend existing run/endless/score/recovery tests.

**Interfaces:**
- Shared `GENERIC_RULES`: frozen `{id:'arcade-v1', mainStageIds:['forest','neon','sunrise'], targets:[20,25,30], roundMs:60000, endless:{targetStep:3,targetCap:45,crowdStep:2,crowdCap:22,speedStep:.08,speedCap:.2}}`. Keep current variation IDs/order as a frozen allowlist; backend imports no frontend/rendering code.
- `routePosition(index, routeLength)` → `{offset, loop}` with zero-based values; reject negative/non-integer index and non-positive/non-integer length.
- `getEdition(id='generic')` → trusted frozen manifest; unknown/empty explicit ID throws. `editionIdFromEnv(env)` → unset defaults generic, explicit value validated by `getEdition`.
- Manifest fields: `id`, `name`, `profileKey`, `lockName`, `labPrefix`, `rulesetId`, `playable`, `postingEnabled`, `catalogue`, `mainStageIds`, `brand`. Catalogue entries have `id`, `name`, `kind`, `parentId` (null for mains). `brand` has `title`, `assetRoot`, `titleArtByTheme`.
- Generic has current three stages, ruleset `arcade-v1`, playable true, postingEnabled true; online availability still requires existing runtime configuration/consent. SMF has the nine exact IDs/parents from the spec, ruleset null, playable false, postingEnabled false. Its proposed order is metadata, not a validated scoring route.

- [x] **Step 1: Add failing tests.** Assert all nine SMF entries and exact parent mappings; no secret in its six-main route; generic fields/targets match above; `editionIdFromEnv({}) === 'generic'`; explicit empty/unknown fails. Assert `routePosition(7,6)` equals `{offset:1,loop:1}` and invalid inputs throw. Capture existing generic stage results at indices 0–14 and a legacy score request/recovery fixture before changing consumers; assert deep equality afterward.
- [x] **Step 2: Run** `node --test tests/editions.test.mjs tests/run.test.mjs tests/endless.test.mjs tests/score-validation.test.mjs tests/recovery.test.mjs`. New contract tests must fail for missing exports; existing baseline tests must still pass.
- [x] **Step 3: Implement** the interfaces above. Extract only existing constants/index arithmetic, replacing generic `%3`, `/3` and final-index comparisons in the named modules with canonical generic route data. Preserve current export signatures and serialized run/recovery/score shapes. No new SMF targets, layout or recovery version yet. Broader edition-aware run/progression support arrives with M2's playable SMF ruleset.
- [x] **Step 4: Run** the Task 1 command and `npm test`; require all pass. Existing backend score/playtest validators continue to accept/reject precisely their legacy inputs; no edition field is added to v1 requests.
- [x] **Step 5: Commit** the explicit files changed in this task as `refactor: extract compatible edition and generic rules contracts`.

### Task 2: Profile, lock and recovery isolation

**Files:** Modify `src/profile.js`, `src/storage.js`, `src/recovery.js`, `src/recovery-practice.js`, `src/main.js`; create `src/editions/storage-context.js`, `tests/edition-storage.test.mjs`; extend `tests/recovery.test.mjs`, `tests/recovery-storage.test.mjs`, `tests/recovery-owner.test.mjs`.

**Interfaces:**
- `storageContext(edition, {rehearsal=false,recoveryLab=false}={})` → `{profileKey,lockName,labPrefix,allowLegacy}`; only generic normal play reads `sidequest.best` / `sidequest.sound`. Generic recovery-lab prefix/lock remain the current `sidequest.recovery-practice.` / `sidequest.recovery-practice`; SMF uses `sidequest.smf.recovery-practice.` / `sidequest.smf.recovery-practice`. Other rehearsals remain memory-only.
- `readProfile(storage, context=genericContext)` and `createStorage(storage,{canWrite,context=genericContext}={})` retain current return/method contracts; every read/write/reset uses that context's key.
- `readRecovery(raw,{editionId='generic'}={})` retains current result shape and v1 parser; non-generic context returns an invalid/unsupported result without mutating/deleting data. M0 never creates an SMF snapshot. A new edition-tagged/nested snapshot version is planned for M2/M3.

- [x] **Step 1: Add failing tests.** Seed one map-backed storage with a real-shaped generic profile, accepted consent/identity, XP/outfit/boards and recovery fixture. Open both contexts: generic unchanged; SMF fresh unknown consent/no identity/no generic progress; mutations and resets affect only their own key. Assert exact lock names and separate persistent lab prefixes. For throwing/unavailable storage require current in-memory fallback, no false persisted success. Assert generic legacy best/sound migration still works and SMF ignores those keys.
- [x] **Step 2: Run** `node --test tests/edition-storage.test.mjs tests/profile.test.mjs tests/storage.test.mjs tests/recovery*.test.mjs`; require new context/isolation cases fail before implementation.
- [x] **Step 3: Implement** context-aware storage/lock boot and generic-only recovery guard. Acquire the selected edition's lock before mutable reads/writes. Preserve generic profile and recovery envelope versions; do not copy, clear or rename existing browser data. Normal SMF does not run legacy migration, capture recovery or request a score ticket.
- [x] **Step 4: Extend the fixture assertion** to resume a legacy checkpoint with an already attempted submission: compare remaining time, original build/ticket, stage award receipts and `JSON.stringify` of frozen payload before/after; assert one award/post at most. Require SMF rejection of that checkpoint and generic recovery-lab compatibility.
- [x] **Step 5: Run** the Task 2 command and `npm test`; require all pass, then commit explicit changed files as `feat: isolate edition profiles and preserve legacy recovery`.

### Task 3: Edition build and asset boundary

**Files:** Create `build/edition-assets.js`, `tests/edition-assets.test.mjs`, `scripts/check-edition-builds.mjs`; modify `vite.config.js`, `package.json`, `index.html`, `src/themes.js`, `src/theme-screens.js`, `src/editions/generic.js`, `src/editions/smf.js`, `public/ASSETS.md`. Create neutral code/CSS title treatment in `src/editions/brand-view.js` and reusable styles in `src/editions/brand.css`; reuse existing neutral assets.

**Interfaces:**
- `assetsForEdition(id)` → exact allowlisted public-relative paths, based on an inventory of the current `public` tree. No wildcard that includes embedded SMF title art in generic. Unknown edition throws.
- Vite config reads the selected edition, sets `publicDir:false`, copies only that allowlist, and uses the same list for DEV public resolution. Shared neutral asset URLs keep working under relative Pages paths. `brand-view.js` consumes manifest `brand` and renders escaped text/known asset URLs, never arbitrary HTML.
- `npm run build` stays the default generic `dist` build; add `build:generic` → `dist/generic`, `build:smf` → `dist/smf`, and `check:editions` → `node scripts/check-edition-builds.mjs`. The checker invokes both builds with explicit environments, checks artifacts and exits nonzero on leaks. Existing Pages workflow is unchanged in M0.

- [x] **Step 1: Inventory** title bitmaps, fonts, icons and neutral images; record per-edition ownership in `public/ASSETS.md`. Add failing asset tests asserting generic excludes the three existing branded `title.webp` images and SMF includes only approved references. Assert unknown edition fails; every generated asset URL resolves for each build.
- [x] **Step 2: Run** `node --test tests/edition-assets.test.mjs`; require failure because no edition copy policy exists.
- [x] **Step 3: Implement** the allowlist/config/scripts and brand renderer. Generic local preview uses working-title text “Festival Side Quest” with an existing neutral themed backdrop; this is a functional placeholder pending M5 visual approval. SMF uses its working title and existing SMF title art where appropriate. Both retain current menu layout/themes. Do not generate final artwork or rename the published product in this local slice.
- [x] **Step 4: Run** `node --test tests/edition-assets.test.mjs` and `npm run check:editions`; require both artifacts, no missing asset references, no SMF title bitmap in generic, and a deliberate invalid-edition build failure. Include CSS/font references and DEV serving in verification, not just JS imports.
- [x] **Step 5: Commit** explicit changed files as `build: produce isolated edition assets and previews`.

### Task 4: Safe boot and playable generic preview

**Files:** Modify `src/main.js`, `src/screens.js`, `src/theme-screens.js`, `src/editions/registry.js`; create `src/editions/scaffold-view.js`, `tests/edition-boot.test.mjs`; extend `tests/screens.test.mjs`. Update `README.md`, `docs/PROJECT-HANDOFF.md`, `docs/EDITION-ROADMAP.md`; create `docs/superpowers/edition-foundation-preview-validation.md`.

**Interfaces:**
- `editionServices(edition,env,{rehearsal=false}={})` in registry → `{arcadeEnabled,playtestEnabled}`. Both false for SMF, rehearsals or missing config; actual generic clients retain their existing config/consent checks. Import no DOM into registry.
- `renderScaffold(root,edition)` renders a static nine-stage catalogue with parent connections and clear “Content preview — gameplay coming next” copy; no Play/score/consent invitation to a disabled service. It does not construct Phaser scenes, audio transport, run controller or recovery controller. Return a cleanup function for DEV reloads.
- Generic remains the full existing game. Menu/HUD finite-stage labels derive from its trusted route count, not independent hardcoded strings; no new mode or stage selector in the public game.

- [x] **Step 1: Add failing tests.** With production-looking endpoint/key variables, SMF service flags stay false; generic uses existing enablement; rehearsal disables both. DOM-level screen tests assert generic Festival shows three stages and SMF lists exactly nine entries with no playable action. Assert invalid edition stops before storage/services initialize.
- [x] **Step 2: Run** `node --test tests/edition-boot.test.mjs tests/screens.test.mjs tests/consent.test.mjs tests/online-submission.test.mjs`; require new behavior tests fail before implementation.
- [x] **Step 3: Implement** edition-first boot, scaffold branch and generic labels. Avoid initializing game/services in the scaffold, even if their buttons would be hidden. All current generic control/save/post/recovery paths remain available.
- [x] **Step 4: Run** `npm test`, `npm run build`, `npm run check:editions` and `git diff --check`. Require all pass; record actual counts and known bundle warning. Do not run backend deploy commands.
- [x] **Step 5: Browser acceptance** on separate local generic/SMF previews at desktop and 390×844: title/themes/assets, generic click/tap destination, three-stage upgrade/results, Endless four-slot swap/finish/local save, opt-in/off controls, paused reload recovery, simultaneous-edition storage/locks, SMF catalogue and zero arcade/analytics requests. Use isolated profile/test endpoints or rehearsal; do not send synthetic production scores/events. Rehearsal alone cannot prove real-save recovery, so use a disposable browser profile with online configuration disabled. Record physical phone/audio/performance as untested unless actually exercised.
- [x] **Step 6: Independent review** of the entire foundation branch after native implementation; resolve important findings, repeat only affected checks, update validation/docs and commit as `feat: preview isolated generic and SMF editions`.

## Completion and handoff

M0 completes with a working generic preview and separate static SMF content scaffold, not six new layouts or secret visits. Keep the public game untouched until the user approves a release. Next create M1's dated nine-stage research matrix and freeze SMF gameplay/music rules; only then write the task plan for M2's six-stage engine/content and additive backend protocol. All nine venues remain required for the final polished pitch build.

Completed locally on 2026-11-06: 224 tests, default/dual build checks, browser acceptance and independent review fixes verified. See [validation](../edition-foundation-preview-validation.md). The checker uses temporary output for isolation; explicit build commands retain the planned artifact paths. No deployment.
