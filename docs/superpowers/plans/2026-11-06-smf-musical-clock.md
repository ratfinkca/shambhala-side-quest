# SMF Musical Clock Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make gameplay/audio/lighting consume trusted stage timing and provide a disposable SMF clock lab without changing generic gameplay or enabling SMF production play.

**Architecture:** A data-only shared timing registry supplies canonical duration, beat grid and bonus windows. Existing APIs gain optional timing arguments/defaults, while generic round/snapshot/wire shapes remain unchanged. A separate SMF audio transport and DEV-only lab exercise the new clocks; durable SMF runs/new online schemas are later parts of the [M2 delivery plan](2026-11-06-smf-m2-delivery.md).

**Tech Stack:** Existing JavaScript modules, Node 24 test runner, Phaser 3, Web Audio, Vite 8. No new package or backend deployment.

**Spec:** [Route/rules design](../specs/2026-11-06-smf-route-rules-design.md), musical clock and first-preview timing table; [edition design](../specs/2026-11-06-edition-split-design.md). Native execution remains selected; one final independent branch review.

**Execution record (2026-11-06):** All five software tasks implemented locally with failing-then-passing regressions,258/258 final tests, both builds and one independent review/fix pass. [Validation and rulings](../smf-clock-preview-validation.md) record browser evidence, three deferred minors and unobserved physical-device/listening acceptance. Native execution retained; no push/deployment.

## Global Constraints

- Generic stays 60000 ms, 120 BPM, existing 15/30/45-second 4-second drops, 3000-ms pre-cues, score components, geometry and progression.
- Preserve generic `sidequest.profile.v1`, lock, recovery-v1 and arcade-v1 payloads/retry bytes. Default round objects gain no enumerable timing field.
- SMF timing is canonical; never accept a raw URL/payload BPM, duration or bonus array as rules.
- Round, perk, candy, Flow and Bass Head timers use active milliseconds; tempo never changes avatar speed/hitboxes or protective duration.
- Timing lab is DEV + SMF + rehearsal only, no storage/XP/score/analytics writes, no online clients, no secret-name reveal. Production SMF stays static/non-posting.
- 2026 venue art and 2027 menu redesign are outside this timing slice. Neutral diagnostic art must not pretend to be completed festival content.

## Review Focus

1. A shorter/longer round and unknown timing ID cannot be accepted as a legacy generic recovery snapshot (Task 2).
2. Muting, resuming after a device stall or switching profiles cannot replay an old queue or emit a catch-up burst (Task 3).
3. A pickup/pass exactly at a rounded 2× start/end uses the same boundary as the HUD and lighting, without accumulated beat drift (Tasks 1–2/4).
4. Repeated lab start/reset/switch cannot leak Phaser nodes, audio voices, input or real-profile writes (Task 5).
5. Existing generic fixture objects, first 15 Endless layouts and frozen pending score posts remain unchanged after all call-site updates (Tasks 2/4–5).

---

### Task 1: Canonical timing registry and pure phase math

**Files:** Create `supabase/functions/_shared/stage-timing.js`, `src/stage-clock.js`, `tests/stage-clock.test.mjs`. Existing `src/music.js` exports remain available.

**Interfaces:**
- Shared `stage-timing.js` owns `getTiming`, `musicalPosition` and `phaseAt`; frontend `stage-clock.js` re-exports those and owns `roundTiming`, `elapsedMs` and `phaseProgress`. Shared code imports no frontend module. Timing arguments must resolve to registry-owned profiles, not arbitrary objects with matching fields.
- `getTiming(id='generic-60-v1')` → deeply frozen `{id,editionId,durationMs,bpm,beatsPerBar:4,stepsPerBeat,dropStartsMs,dropDurationMs,buildMs}`. Unknown, empty or explicit null ID throws. No mutable caller-owned profile accepted.
- Legacy profile: editionId generic, duration60000, BPM120, stepsPerBeat2 (existing eighth-note voices), drops15000/30000/45000, dropDuration4000, buildMs3000.
- SMF profiles: IDs `<stageId>-clock-preview-1`, editionId smf, stepsPerBeat4. Use this exact table; values are preview contracts, not production score eligibility:

| stageId | BPM / bars | durationMs | dropStartsMs | buildMs |
|---|---|---:|---|---:|
| smf-living-room | 112 / 32 | 68571 | 17143,34286,51429 | round(240000/112) = 2143 |
| smf-fractal | 120 / 32 | 64000 | 16000,32000,48000 | 2000 |
| smf-grove | 132 / 32 | 58182 | 14545,29091,43636 | 1818 |
| smf-amp | 140 / 32 | 54857 | 13714,27429,41143 | 1714 |
| smf-pagoda | 128 / 32 | 60000 | 15000,30000,45000 | 1875 |
| smf-village | 172 / 48 | 66977 | 22326,44651,55814 | 1395 |

- Derive durations/onsets once from integer bars/beats: `round(bars*240000/bpm)` and `round((oneBasedDropBar-1)*240000/bpm)`. Starts use9/17/25 for32 bars,17/33/41 for48. Each drop lasts4000; one-bar SMF build duration rounded once.
- `roundTiming(round)` → `getTiming(round.timingId)` when explicitly present, otherwise legacy; never treat an unknown/null ID as generic. `elapsedMs(round)` → canonical duration minus finite remaining, clamped to0..duration.
- `musicalPosition(elapsed,timing)` → `{beat,bar,step,beatPhase}`: integer zero-based beat/bar/step, beatPhase0..1; derive directly from elapsed/BPM, not rounded beat accumulation. At/after duration expose a clamped final position for display; ended voices are suppressed by phase.
- `phaseAt(elapsed,timing)` → existing `{phase,bonus,remainingMs}` shape, with half-open `[start,start+4000)` windows, ended at duration. `phaseProgress(elapsed,timing)` →0..1 for current build/drop/cruise interval, with cruise measured since the prior phase ended (not a fixed15000 denominator).

- [ ] **Step 1: Write failing tests** for exact table, deep immutability/unknown IDs, negative elapsed clamping, onset−1/onset/end−1/end and duration−1/duration for every profile. Assert Village later onsets come from rational positions, not accumulated rounded beats. Assert generic phase snapshots exactly match current `cycleAt` including the last-dance cruise after49s.
A named boundary regression in `tests/stage-clock.test.mjs`:

```js
test('Living Room uses rounded phrase boundaries and a longer round', () => {
  const timing = getTiming('smf-living-room-clock-preview-1');
  assert.equal(timing.durationMs, 68571);
  assert.deepEqual(timing.dropStartsMs, [17143, 34286, 51429]);
  assert.equal(phaseAt(17142, timing).bonus, 1);
  assert.equal(phaseAt(17143, timing).bonus, 2);
  assert.equal(phaseAt(21142, timing).bonus, 2);
  assert.equal(phaseAt(21143, timing).bonus, 1);
  assert.equal(phaseAt(68571, timing).phase, 'ended');
});
```

- [ ] **Step 2: Run** `node --test tests/stage-clock.test.mjs tests/festival.test.mjs tests/music.test.mjs`; expect missing new exports while existing tests pass.
- [ ] **Step 3: Implement** these pure interfaces. Shared registry imports no DOM, audio, renderer or frontend geometry. Profile IDs remain an explicit allowlist; reject invalid internal configuration early.
- [ ] **Step 4: Run** the Task 1 command and `npm test`; require all pass. Compare old generic cycle/math against the new legacy profile.
- [ ] **Step 5: Commit** explicit Task 1 files as `feat: define canonical stage musical clocks`.

### Task 2: Timing-aware gameplay, counters and legacy recovery guard

**Files:** Modify `src/game.js`, `src/festival.js`, `src/playtest/summary.js`, `src/recovery.js`. Create `tests/timed-round.test.mjs`; extend `tests/playtest-summary.test.mjs`, `tests/recovery.test.mjs`, `tests/editions.test.mjs`.

**Interfaces:**
- `createRound(options={},timingId='generic-60-v1')` retains existing options/rules and adds enumerable `timingId` only for a non-legacy round. `advanceRound`, `collect` and `awardClosePass` consume `roundTiming/elapsedMs`; a legacy round keeps its serialized shape and exact existing semantics.
- `cycleAt(elapsed,timing=getTiming())` delegates phase math with the current return shape. `crowdPosition(index,elapsed,anchors,speed=1,timing=getTiming())` integrates overlap of that timing's completed/partial drop windows, preserving generic trajectories exactly.
- SMF `advanceRound` consumes at most remaining active time on its last tick, ending at zero; effect/candy logical elapsed cannot advance past that round's canonical duration. Do not change unrelated generic overrun behavior in this slice. Existing candy scheduling stays12000..39999 and effect lengths stay fixed milliseconds.
- `createRunSummary({...existing,stageCount=3,timingForStage=()=>getTiming()})` keeps generic snapshots unchanged. Internally resolve timing at `start` and cap active/bass/charge counters at that stage's canonical duration; stageCount governs finite Festival bounds. Callback returns trusted timing objects; no timing values arrive from external event payloads. Do not send these prospective SMF summaries through legacy schemas: the lab has no sender, and normal SMF remains disabled until M2C.
- `makeRecovery(...)` returns null for any non-legacy round timing; legacy v1 readers reject such timing tags/envelopes rather than stripping them and reinterpreting time. This is a downgrade guard, not SMF recovery implementation. New tagged SMF history/envelope validation belongs to B/C before durable play is enabled.

- [ ] **Step 1: Write failing tests** for 54857-ms AMP and68571-ms Living Room completion; pickups and passes at each 2× edge; fixed 5000/7000-ms effects at different tempi; an oversize final SMF tick;60001-ms summary counters surviving in a68571-ms stage; second/6th Festival summaries with stageCount6. Assert unknown timing rejects, and new timing is never captured/read as generic recovery.
Pin `timed_round_clamps_final_tick` to `createRound({},'smf-amp-clock-preview-1')`, then `advanceRound(round,100000)`: assert remaining0 and mystery.elapsedMs54857. Pin `timed_summary_preserves_long_round` to a Festival recorder with stageCount6 and Living Room timing: `record('start',{runId,stageIndex:0})`, `record('tick',{runId,activeMs:60001})`, then assert snapshot stages[0].activeMs60001. Pin `legacy_recovery_rejects_timed_scene` using the existing valid Endless fixture with the new scene timing tag: assert makeRecovery returns null rather than silently dropping it.

- [ ] **Step 2: Run** `node --test tests/timed-round.test.mjs tests/playtest-summary.test.mjs tests/recovery.test.mjs tests/editions.test.mjs`; require new behavior failures.
- [ ] **Step 3: Implement** the interfaces with legacy defaults. Reuse the existing20 spark-component and2 pass-component buckets; do not introduce beat-timed input, new score multipliers or a new network schema. Keep the old score/recovery validation path strict.
- [ ] **Step 4: Run** that command plus `npm test`; require the stored15-stage hashes, old recovery fixture, score validation and exact attempted submission bytes pass unchanged. Document that pure timing-aware counters are not online SMF telemetry support.
- [ ] **Step 5: Commit** explicit files as `refactor: parameterize round timing with legacy compatibility`.

### Task 3: Bounded SMF audio transport

**Files:** Create `src/music-transport.js`, `tests/music-transport.test.mjs`; modify `src/audio.js`; extend `tests/audio.test.mjs`. Keep existing `src/music.js` generic arrangements unchanged.

**Interfaces:**
- `createMusicTransport({voices,schedule,cancel,lookaheadMs=100})` → `{sync({timing,elapsedMs,audioNowSec,multiplier,flowActive}),stop()}`. `voices({timing,step,multiplier,flowActive,phase})` returns existing voice descriptors; `schedule(voice,atSeconds)` queues a voice; `cancel()` stops all queued/active transport voices. A new generation follows stop/profile change/backward seek.
- Each sync schedules only not-yet-scheduled grid steps in `[elapsed, min(elapsed+100,duration))`, on absolute AudioContext times. Compute each step's logical onset as `round(step*60000/(bpm*stepsPerBeat))`, rounding each event independently rather than accumulating rounded intervals. Use this same onset for phase lookup and absolute audio scheduling so a phrase downbeat cannot fall just before its rounded 2× boundary. Skip past steps after a stall; never replay the gap. No independent interval/timeout survives pause, mute or stage exit.
- `createAudio(factory=existingDefaultFactory, {timedVoices}={})` preserves the current default factory, existing first-argument calls and legacy sync path/output. When a round has non-legacy timing, use the new transport and an injected diagnostic voice function. Missing timedVoices means no SMF music, never an accidental generic forest arrangement under a new venue ID. Effects/music buses remain independent.
- Oscillator and noise scheduling helpers accept an absolute start time for the new path; stop/mute cancels queued and sounding voices. Avoid unbounded node retention; every ended/cancelled node disconnects. Recovery/late unmute schedules the next playable grid position without backlog or a reset to bar1.

- [ ] **Step 1: Write failing tests** using a deterministic fake audio clock: first sync, duplicate sync,100-ms lookahead, a multi-second stall, backward seek, profile switch, stop/resume, mute/unmute and duration end. Assert each step at most once per generation, onsets match rational grid, no missed-step burst, and no old-generation voice remains scheduled. Test rejected/suspended AudioContext: gameplay/counters continue and a later gesture retries safely.
Pin `transport_rounds_each_event_without_drift`: Living Room step128 is scheduled at logical17143ms and phase drop. Pin `transport_skips_stalled_gap`: after sync elapsed0/audioNow0, sync elapsed5000/audioNow5, assert new events all have logical onsets in5000..5099 and no duplicate step. Pin `transport_stop_cancels_generation`: stop invokes cancel, clears the scheduled-step set, and a fresh sync cannot leave any old queued voice active. Use schedule/cancel spies and pure descriptors; no wall-clock sleeps.

- [ ] **Step 2: Run** `node --test tests/music-transport.test.mjs tests/audio.test.mjs tests/music.test.mjs`; expect new transport failures and existing generic tests green.
- [ ] **Step 3: Implement** the transport and audio adapter. Keep the legacy eighth-step generic voice outputs untouched. Do not compose final venue music, add a compressor/instrument framework, fetch audio or install a package here.
- [ ] **Step 4: Run** the Task 3 command and `npm test`; require all pass. Note that scheduling tests cannot certify musicality or audible device behavior; lab listening is part of Task5.
- [ ] **Step 5: Commit** as `feat: schedule phrase clocks with bounded audio lookahead`.

### Task 4: Scene, crowd, lights and HUD share the selected clock

**Files:** Modify `src/GameScene.js`, `src/Crowd.js`, `src/StageRenderer.js`, `src/concert-lighting.js`, `src/bass-motion.js`, `src/bass-feedback.js`, `src/game-entry.js`; extend `tests/scene.test.mjs`, `tests/bass-motion.test.mjs`, `tests/bass-feedback.test.mjs`, `tests/festival.test.mjs`; create `tests/timed-scene.test.mjs`.

**Interfaces:**
- `GameScene.startRound({...existing,timingId='generic-60-v1'})` passes timing into createRound. `captureRecovery` preserves the non-legacy timing tag in a logical scene copy; legacy makeRecovery guard still prohibits saving it as v1. `restoreRecovery` resolves an explicit tag before using it and restores paused; production legacy controller remains generic-only.
- Crowd reset/update/`restoreRecovery(encounters,elapsed,timing=getTiming())` use the same canonical clock; movement/drop-speed integration uses Task2 crowdPosition. New timing never increases base player/crowd movement by BPM.
- `StageRenderer.update(elapsed,phase,reduced,timing=getTiming())`, `concertLighting(elapsed,reduced=false,stageId='forest',timing=getTiming())`, `bassBeat(elapsed,timing=getTiming())`, `bassOffset(...existing,timing=getTiming())`, `drawSpeakerBass(...existing,timing=getTiming())` consume the selected beat/phase; callers omitted timing retain exact generic visuals.
- Replace gameplay's `60000-round.remainingMs` with `elapsedMs(round)` at scene/HUD/audio call sites. Preserve decorative menu-avatar time as a separate legacy animation loop. HUD progress uses phaseProgress for timed rounds, while generic strings/progress remain unchanged. Timed-round label is `2× VIBES`, not a promise of an audible bass drop on every phrase accent.

- [ ] **Step 1: Write failing tests** for matching scene/crowd/light/score state just before/at/after a timed onset, a short round's final frame and a captured/restored long-round scene. Assert restore stays paused, target/input clears, no double pickup/pass, static reduced-motion output and no mutation of collision positions. Assert generic fixtures/trajectories/visual output remain equal with omitted timing.
Pin `long_scene_restores_paused_at_same_clock`: start Living Room timing, advance logical20000ms, capture and restore into a fresh scene with the same trusted configuration. Assert remaining48571, timingId unchanged, run inactive/paused, input target cleared, and crowd positions equal at that saved moment. Pin `timed_visuals_do_not_move_collision_geometry` to before/after speaker feedback at17143ms, comparing logical player/speaker positions as well as reduced-motion output. Reuse existing Phaser test doubles.

- [ ] **Step 2: Run** `node --test tests/timed-scene.test.mjs tests/scene.test.mjs tests/bass-motion.test.mjs tests/bass-feedback.test.mjs tests/festival.test.mjs`; require timing-aware failures before edits.
- [ ] **Step 3: Implement** the propagation. Audit each current active-time consumer, including StageRenderer/Crowd and bonus progress, rather than globally replacing every literal60000 (some belong to legacy validation, minute normalization or decorative menus). No new scenery or control mode.
- [ ] **Step 4: Run** that command and `npm test`; require all pass and generic saved snapshots/pending posts unchanged. Resetting/ending must clear scheduled sound and scene effects from the prior round.
- [ ] **Step 5: Commit** as `refactor: synchronize scene feedback to trusted stage clocks`.

### Task 5: Disposable clock lab, browser/listening acceptance and review

**Files:** Create DEV-only `src/clock-practice.js`, `src/clock-practice-entry.js`, `tests/clock-practice.test.mjs`, `docs/superpowers/smf-clock-preview-validation.md`; modify `src/main.js`, `src/editions/registry.js`, `README.md`, `docs/PROJECT-HANDOFF.md`, `docs/EDITION-ROADMAP.md`. Extend `tests/edition-boot.test.mjs`, `tests/edition-builds.test.mjs`.

**Interfaces:**
- `clockPracticeRequested(env,search)` → true only for `env.DEV===true`, selected SMF edition, and `?rehearsal&clock`. `main.js` passes that result into `startEdition(env,actions,{clockPractice=false}={})`; the latter independently rechecks DEV and SMF before invoking optional `actions.clock`. Passing true directly cannot bypass production/edition guards. Otherwise retain existing generic/scaffold behavior. No generic catalogue/Play behavior changes.
- `clock-practice.js` owns an allowlisted selector for generic and six **main** clock IDs; no arbitrary BPM textbox or secret profiles. It creates a neutral diagnostic stage (`id:'clock-lab', name:'Clock practice'`), minimal percussion/tonal cue voice descriptors and a memory-only session. Label it timing/instrument practice, not actual venue art/music.
- `clock-practice-entry.js` builds the lab around existing GameScene/audio: Start fresh, Pause/Resume, choose clock and start/reset; a visible diagnostic elapsed/bar/phase readout helps test the grid. Selection/reset stops the old audio/scene before creating the next. No profile, locks, award receipts, score clients, consent identity or playtest sender is initialized. Reload returns a fresh lab, never a recoverable production SMF run.
- Dynamic import is behind the DEV-only guarded branch, so neither production artifact includes lab UI or fixtures. Default SMF remains its locked-secret static catalogue; generic remains the actual game.

- [ ] **Step 1: Write failing tests** for all guard combinations (DEV/production, generic/SMF, missing flags, valid/unknown clock), lab default/reset/no persistent storage, repeated start/switch cleanup, and zero scoreboard/playtest requests despite valid endpoint environment. Assert production builds exclude lab control copy/module and keep the M0 asset boundary; reuse the checker regression proving default dist is unchanged.
Pin `production_cannot_force_clock_action`: call startEdition with SMF env DEVfalse, `{clockPractice:true}` and action spies; assert scaffold called once and clock never called. Pin `clock_lab_has_no_persistent_or_network_effects`: use throwing storage/fetch stubs through repeated start/reset/switch, assert no exception from those stubs and the old session/audio teardown runs on every switch. Pin `generic_boot_ignores_clock_flag`: generic DEVtrue still invokes game, preserving its normal entry.

- [ ] **Step 2: Run** `node --test tests/clock-practice.test.mjs tests/edition-boot.test.mjs tests/edition-builds.test.mjs`; require new lab/guard tests fail first. These build/local-server tests may need localhost permission in this environment; do not install dependencies to avoid that.
- [ ] **Step 3: Implement** the lab and guarded boot path with neutral geometry/diagnostic sound. Keep implementation labels inside the lab, not normal player flows. Do not enable normal SMF Play, XP, score posting or a durable SMF recovery envelope here.
- [ ] **Step 4: Run** `npm test`, `npm run build`, `npm run check:editions`, relative documentation link checks and `git diff --check`; require pass. Record actual counts and existing bundle warning, not the previous225-test count as a fresh result.
- [ ] **Step 5: Browser/listening acceptance** desktop and390×844: test every clock, start/pause/settings-equivalent suspension/resume, mute/unmute, profile changes, final2× window and exact end; repeat start/reset10times to check cleanup. Verify production query guards, all anonymous secret tiles and generic Festival/Endless/paused reload/frozen save flow. Use isolated local configurations, not production endpoints. Listen for audible phase/click drift and unwanted tails on available hardware; record physical phones/headphones/phone speakers as unobserved unless exercised. Diagnostic sound is not acceptance of final compositions. Keep the practice preview available for owner review.
- [ ] **Step 6: Independent whole-branch review** under native execution; resolve important findings with failing-then-passing regressions and a green suite, record any deferred minors/rulings. Update validation/docs and commit explicit Task5 files as `feat: preview stage musical clocks in isolated practice`.

## Completion and next part

This slice is complete when the clock contract, compatible generic engine and isolated timing lab are verified and reviewed. It does not complete SMF recovery, online telemetry/boards, six venue layouts or final music. Show the clock preview to the owner, then write Part B's detailed venue/run-flow plan against these real interfaces. Part C's pure score/recovery schema work may move forward to enable durable SMF play, but no new connection is enabled before its backend/release gates. Keep this branch local unless the user separately asks to ship.
