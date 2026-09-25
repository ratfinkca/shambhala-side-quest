# Festival Run Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans or superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Deliver a local playable Festival Run preview while preserving Quick Rush.

**Architecture:** Pure modules own profile validation, stage configuration, collision geometry, run transitions and scores. Phaser renders and simulates the arena; DOM menus use one explicit screen controller. Develop sequentially on `codex/festival-run`, with one writer and a final independent review.

**Tech Stack:** Existing Phaser 3.90, Vite, JavaScript ES modules, Node test runner, Web Audio, localStorage. No new dependencies or backend.

**Spec:** `docs/superpowers/specs/2026-09-25-festival-run-design.md` (user approved).

## Global Constraints

- Preserve Quick Rush and its rules; add a three-stage Festival Run lasting three minutes of play plus untimed menu breaks.
- Keep Phaser, Vite, procedural artwork/audio, responsive arena, and static GitHub Pages hosting.
- Every stage lasts exactly 60 active seconds.
- Keep the 960×640 world and fit it to the viewport.
- Appearance is independent of run abilities.
- Storage errors retain session data and show a concise message if a requested score save cannot persist.
- Deliver a local playable preview and passing tests/build for user playtesting before merging this larger change.

## Review Focus

1. Malformed/blocked storage and legacy mute must not erase progress or unexpectedly enable sound (task 1).
2. Repeated completion, upgrade or submit clicks must never duplicate rewards, skip stages or save a score twice (tasks 3 and 6).
3. One protected bump spans several frames: the shield must suppress the whole contact, not just its first frame (task 4).
4. Long frames and corner collisions must not trap the player, tunnel through speakers or create unreachable pickups (task 4).
5. Hidden page/settings/resize during transitions must not run the clock, resume automatically or leave inaccessible controls (tasks 2 and 6).

## File boundaries

New `src/profile.js`: validated profile, migration and ranking; `src/wardrobe.js`: cosmetic IDs/defaults; `src/stages.js`: stage data; `src/run.js`: run state and perks; `src/geometry.js`: movement/spawn safety; `src/Avatar.js`: shared procedural avatar; `src/StageRenderer.js`: forest/background/hazards/lighting; `src/screens.js`: DOM menus and screen transitions.

Modify `src/storage.js` for profile persistence, `audio.js` for buses, `game.js`/`festival.js`/`flow.js` for configured rules, `Crowd.js` for stage populations, `GameScene.js` for arena integration, and `main.js` for orchestration. Keep modules focused; move existing forest drawing into StageRenderer without unrelated visual changes. Update `index.html`, `styles.css`, `layout.js`, README and relevant tests with the tasks that own them.

### Task 1: Saved profile and local ranking foundation

**Files:** create `src/profile.js`, `src/wardrobe.js`, `tests/profile.test.mjs`; modify `src/storage.js`, `tests/storage.test.mjs`.

**Interfaces:** `DEFAULT_OUTFIT={onesie:'lime',hat:'bucket',totem:'none'}`; wardrobe IDs: onesie lime/moth/rainbow, hat bucket/wizard/none, totem star/mushroom/none. `readProfile(storage)` returns `{version:1,audio:{enabled,music,effects},outfit,bestRush,boards:{rush:[],festival:[]}}`. Volumes are fractions. `rankScores(entries)` returns bounded validated top ten. Entry shape `{id,initials,score,stagesCleared,outfit,completedAt}`. `createStorage(storage)` exposes `profile`, legacy `best`/`sound`/`saveBest`/`saveSound`, `saveAudio(audio)`, `saveOutfit(outfit)`, `submitScore(mode,entry)`; mutation methods return `{persisted:boolean,accepted:boolean}` except legacy saveBest returns best.

- [ ] Write failing tests: new profile audio equals `{enabled:true,music:.45,effects:.65}`; explicit legacy false stays false; legacy best 123 survives; malformed JSON defaults safely; out-of-range volumes clamp; unknown outfit IDs default; negative/nonfinite scores are rejected; tables retain ten entries; ties rank score, stages, earliest date; duplicate entry ID rejected; throwing storage retains in-memory mutations and returns persisted false.
- [ ] Run `node --test tests/profile.test.mjs tests/storage.test.mjs`; confirm new assertions fail for missing behaviour.
- [ ] Implement validation and migration into `sidequest.profile.v1`. Validate mode and bounded initials with `/^[A-Z0-9]{3}$/`; UI supplies AAA fallback. Preserve historical best without inventing a leaderboard entry. Clone data at the storage boundary.
- [ ] Run the targeted tests and `npm test`; all pass. Commit `feat: add validated player profiles and local score tables`.

### Task 2: Default sound and independent volume controls

**Files:** modify `src/audio.js`, `src/main.js`, `index.html`, `styles.css`; create `tests/audio.test.mjs`.

**Interfaces:** `createAudio()` retains existing methods and adds `setVolumes({music,effects})`. Internally inject an optional AudioContext factory for a fake-context test; default factory uses browser AudioContext. Connect each voice to its music or effects gain, then destination. Context remains lazy until user gesture.

- [ ] Add failing fake-context tests asserting beat voices route to music, pickup/drop/celebration to effects; volume .2/.7 updates existing gains; mute/stop stops active voices; rejected resume is caught and later activation retries; construction does not create a context.
- [ ] Run `node --test tests/audio.test.mjs`; verify failure, then implement bus routing and saved volume initialization. Preserve silence on failure and pause/end cleanup.
- [ ] Add labelled settings sliders and mute controls, initially reachable from the current UI. Opening settings invokes pause; closing presents Resume. Persist changes through task 1's API. These controls move into the final screen controller in task 6.
- [ ] Run tests and browser-check sound starts on Play for fresh storage, old mute stays muted, both sliders affect only their channel, and settings/hidden-page transitions freeze the timer. Commit `feat: add saved music and effects controls`.

### Task 3: Stage and run rules

**Files:** create `src/stages.js`, `src/run.js`, `tests/run.test.mjs`; modify `src/game.js`, `src/festival.js`, `src/flow.js`, corresponding tests.

**Interfaces:** `STAGES` exports three immutable objects `{id,name,target,crowdAnchors,obstacles,mud,spawn,palette,flowSpawns}`. `createRun(mode,id)` produces `{id,mode,stageIndex:0,totalScore:0,stagesCleared:0,perks:[],status:'ready',submitted:false}`. `finishStage(run,round)` returns a summary and mutates once to `upgrade` or `ended`; `chooseUpgrade(run,id)` accepts only one offered perk then moves status to ready and increments stageIndex; `upgradeChoices(run)` returns three unowned IDs. `startStage(run)` transitions ready to playing and returns `{stage,rules}` or null. `rulesFor(perks)` returns `{comboGraceMs,flowDurationMs,closePassPoints,bumpShields}`. `createRound(rules={})` retains current defaults and adds rules and shieldsRemaining.

- [ ] Add failing assertions for targets `[20,25,30]`, counts `[10,14,18]`; 19 sparks fails stage one, 20 qualifies only after remainingMs reaches zero; duplicate finish leaves score unchanged; premature/invalid/duplicate upgrade rejected; third-stage success ends; failed stage still contributes score; Quick Rush always ends after one round with legacy defaults.
- [ ] Add perk assertions: defaults 2000/5000/15/0; bracelet 3000, moth 7000, boots 25, noodle 1; choices remain three distinct unowned IDs; new run clears perks. Assert combo at exact grace boundary survives and next millisecond expires; drop doubles upgraded pass reward.
- [ ] Run `node --test tests/run.test.mjs tests/game.test.mjs tests/flow.test.mjs tests/festival.test.mjs` (use actual existing test names if different); verify intended failures. Implement pure controller/rules, then run `npm test` until passing. Commit `feat: add three-stage runs and between-stage perks`.

### Task 4: Safe obstacles and stage crowds

**Files:** create `src/geometry.js`, `tests/geometry.test.mjs`; modify `src/stages.js`, `src/Crowd.js`, `src/festival.js`, `src/GameScene.js`; extend encounter tests.

**Interfaces:** `moveInArena(player,direction,dtMs,{width,height,obstacles,speed})` uses a 14-unit player radius, capped 50ms motion and axis-separated sliding with substeps no longer than seven units. `isOpen(position,radius,obstacles)` validates clearance; `findSpawn(stage,rng,avoid)` uses bounded random attempts then a deterministic open grid fallback. `Crowd.configure(stage)` destroys/rebuilds stage people; `crowdPosition(index,elapsedMs,anchors)` defaults to legacy anchors. Encounter result adds `contactStarted`/`contactEnded` for shield consumption.

- [ ] Test diagonal wall approach slides, long frames cannot cross speaker faces, corner contact stays outside, arena bounds hold; mud/bump speed multiplier combines via minimum .5, never .25. Test repeated same-contact frames consume one shield and produce no slowdown; next separate contact slows normally; protected contact cannot earn close-pass points.
- [ ] Define two rectangular speaker islands for Neon Grove and three for Sunrise, plus two Sunrise mud rectangles. Ensure open routes at least 56 units wide, spawn clearance, distinct anchors and bounded crowd travel outside islands. Test dense samples across each motion cycle, flood-fill open arena connectivity at 14-unit clearance, and 1,000 deterministic pickup samples per stage. Test fallback with an RNG always returning one blocked position.
- [ ] Run failing tests, implement geometry/configuration, then integrate pointer and keyboard movement, mud tint/status, shield HUD state, and obstacle-safe sparks/Flow positions. Keep Quick Rush's legacy movement and stage defaults.
- [ ] Run `npm test`; browser-check sliding, touch target behind an island, crowd reset and spawning. Pointer movement may stop at a wall; no automatic pathfinding is required. Commit `feat: add stage obstacles and denser crowds`.

### Task 5: Shared raver art and stage presentation

**Files:** create `src/Avatar.js`, `src/StageRenderer.js`; modify `src/GameScene.js`, `src/stages.js`, `src/Crowd.js` as needed.

**Interfaces:** `createAvatar(scene,outfit)` returns a Phaser Container at local origin; `setOutfit(container,outfit)` replaces only cosmetic children. Preserve the player halo/shadow outside cosmetic children. `StageRenderer(scene)` exposes `show(stage)`, `update(elapsedMs,phase,reducedMotion)`, `destroy()`, owns its display objects, and leaves gameplay objects to GameScene. `GameScene.startRound({stage,rules,outfit})` accepts defaults for existing callers.

- [ ] Extract current forest visuals into StageRenderer and current player body into Avatar; check the default character and Quick Rush still match before adding variants.
- [ ] Implement the nine cosmetic choices using shared geometry; create wardrobe preview with the same renderer in a dedicated Phaser scene/canvas that suspends when hidden. Do not create a new Phaser instance on every menu opening.
- [ ] Implement stage palettes and distinct visible speaker/mud art plus slow beams. Reduced motion fixes beams and disables decorative pulsing without removing gameplay movement. Update HUD combo fraction/Flow/shield display from configured rules.
- [ ] Browser-check every outfit/hat/totem choice, selected outfit persistence, unchanged hitbox, stage transitions without duplicate objects, and reduced motion. Run `npm test` and `npm run build`. Commit `feat: add raver wardrobe and distinct festival stages`.

### Task 6: Title-to-results playable flow

**Files:** create `src/screens.js`, `tests/screens.test.mjs`; modify `src/main.js`, `index.html`, `styles.css`, `src/layout.js`, `src/GameScene.js`.

**Interfaces:** `createScreenState()` plus `transition(state,event)` expose a pure guarded state reducer; states title, rules, playing, paused, settings, wardrobe, scores, summary, upgrade, results, confirmExit. `createScreens(root,callbacks)` owns DOM rendering and listeners, with `show(name,data)` and focus restoration. Main owns the run, active round, saved profile, audio and scene; menus request actions through callbacks. No menu may directly mutate score/timer.

- [ ] Write failing transition tests: settings from playing moves through pause; closing settings never auto-resumes; hidden-page event pauses only active play; invalid stage/upgrade/submit events ignored; cancelling exit restores pause; confirming exit discards run; double start cannot make two rounds; results submit only once.
- [ ] Implement title actions, initial Festival rules/target display, wardrobe preview, local score tables, settings, pause/discard confirmation, stage summary/three upgrade choices/Next Stage, and final results. Render user text through textContent. Use separate controls for mode selection and explicit timer start.
- [ ] Connect run controller and stage-configured GameScene. On round end finalize exactly once, accumulate score and choose the appropriate screen. At stage reset discard input/tweens/Flow/slowdown/encounters but retain run perks and total. Quick Rush preserves personal best and existing scoring.
- [ ] Add optional three-character initials entry with uppercase sanitization, AAA fallback, visible device-only label, mode-specific scores, saved confirmation and disabled resubmission. Record run ID/date/outfit snapshot at completion; blocked persistent save shows session-only message.
- [ ] Make title/menu panels internally scrollable in short windows, retain visible focused controls and arena fit, and give all controls labels. Browser-check 390×844, 844×390, 1366×768; midrun resize/fullscreen; keyboard focus, touch, settings and blur across summary/upgrade/results. Run reducer tests, full tests and build. Commit `feat: connect festival menus progression and arcade results`.

### Task 7: Integrated playtest and handoff

**Files:** update `README.md`; create `docs/superpowers/festival-run-validation.md`; fix only affected source/test files if verification discovers defects.

- [ ] Play an unchanged Quick Rush, a deliberately failed Festival Run, and a successful three-stage run. Exercise both upgrade decisions, all four perks across runs, score submission/replay/reload and storage failure. Use ordinary UI play; a development-only seeded scenario may aid repeatable verification but must not expose score submission cheats in the production build.
- [ ] Record viewport results, browser console observations, actual stage pickup totals and any balance tuning. Keep targets 20/25/30 unless playtesting supports a change; explain any adjustment before final preview. Verify title/score/settings screens at reduced motion and small heights.
- [ ] Run `npm test`, `npm run build`, and serve the production build with `npm run preview`; validate relative assets and key navigation in that build. Update README with both modes, perks, local-only saves, audio and deferred features.
- [ ] Request one independent branch review using reviewer (Sol/high), with no delegation or edits. Resolve actionable findings and rerun relevant checks. No premium model escalation.
- [ ] Commit validated changes; open the local preview for user playtesting and report results/limitations. Do not merge or deploy until user accepts the preview. After acceptance, PR/CI/merge/Pages verification use the established release workflow.

## Execution recommendation

Native execution: one primary implementer proceeds through these dependent tasks, with one independent review at the end. This suits the shared scene/controller interfaces and the user's cost-conscious orchestration preference. No product code has been changed by writing this plan.
