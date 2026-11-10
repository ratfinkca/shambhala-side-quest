# M2B1 Living Room and Pagoda Venue Preview Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans. Native execution is already selected; steps use checkbox (`- [ ]`) syntax.

**Goal:** Make two contrasting, recognizable venues playable in isolated SMF practice with their own clocks and original musical sketches.

**Architecture:** DEV-only venue configuration uses the existing single-engine practice lifecycle and stabilized HUD. Trusted authored stage data supplies geometry/lighting; an injected scenery factory keeps SMF artwork out of the generic renderer. A small original voice generator uses the existing timed audio transport. Normal SMF remains a static catalogue.

**Tech Stack:** Existing Phaser3, JavaScript, Web Audio, Vite8 and Node24. No dependency, account or backend changes.

**Spec:** [Approved route/rules](../specs/2026-11-06-smf-route-rules-design.md), [M2 delivery](2026-11-06-smf-m2-delivery.md), [nine-venue briefs](../../research/smf-stage-identities-2026-11-06.md). The owner explicitly requested this two-venue preview after accepting the clock/readout fix. Continue native execution under that authorization; this is the first subset of Part B, not the full six-stage run.

**Execution record (2026-11-06):** Four tasks implemented locally under native execution;271/271 final tests, both edition builds and browser playtests pass. One independent review found two Important issues, fixed with regressions/live layout measurements. [Evidence and limits](../smf-venue-preview-validation.md). Owner music/layout feedback remains; no publishing.

## Global Constraints

- Living Room112BPM/68571ms/target23/10dancers/2speaker islands; Pagoda128BPM/60000ms/target28/18dancers/3islands. Use existing canonical clocks.
- Keep destination-click/tap, movement, bass pressure/partial charge, candy and Flow rules unchanged. Scenery creates no hidden obstacles.
- All pickups/spawns/routes must be reachable; broad central crossing and two bypasses. River/architecture/seating are perimeter scenery.
- Original 2026-inspired interpretations; official stage photos have mixed/unknown dates. Do not claim final2026 structural accuracy or copy photographs/logos into assets. Secret identities remain concealed in the catalogue.
- DEV+SMF+rehearsal+venues gates; no storage/profile/XP/ticket/score/analytics clients. Normal SMF and generic service contracts unchanged.
- Reuse one Phaser game; hidden pages pause; BFCache preserves paused state. Preserve stable readout columns, fixed-width digits and tenths countdown.
- Two optional musical sketches are previews, not final M4 compositions. Four8-bar sections with4-bar responses; no full-screen flashes. Reduced motion freezes all scenery motion while preserving venue identity.

## Review Focus

1. Authored dancers cannot wander through cabinets; sample complete timed trajectories and verify14px clearance.
2. Restart/switch cannot retain prior scenery, audio, pickups or Phaser visibility listeners; reset rounds in one engine.
3. Reduced motion must freeze water/projection layers, not merely the common beams; test actual renderer updates.
4. Production/generic URLs cannot activate the venue practice or include its UI/fixtures.
5. A running desktop/mobile HUD cannot shift as time/score/bar widths change; measure live geometry, not only screenshots.

---

### Task 1: Two trusted authored layouts

**Files:** Create `src/editions/smf-stages.js`, `tests/smf-stages.test.mjs`.
**Interfaces:** `SMF_PREVIEW_STAGES` deeply frozen two-entry array; `smfPreviewStage(id)` strict lookup. Each stage has existing stage fields plus `timingId`, `lighting`, `caption`. Never return a renamed generic layout. Unknown/secret IDs throw.

- [ ] Write failing tests: exact IDs/targets/counts/clocks, independent geometry, deep immutability;24px-clear spawn/Flow; sample each dancer across the full clock at50ms with14px clearance. Flood-fill a24px grid with14px radius to every open spawn cell and both Flow positions; verify central crossing and left/right bypasses. Check random and deterministic fallback spark/candy spawns remain open.
- [ ] Run `node --test tests/smf-stages.test.mjs`; expect missing module.
- [ ] Implement authored layouts: Living Room broad open crossing with two perimeter cabinets; Pagoda offset left/right/left-rear cabinets with a strong central sightline. Initial positions are builder-owned and remain preview balance.
- [ ] Run targeted tests and `npm test`; require pass.
- [ ] Commit `feat: author Living Room and Pagoda practice layouts`.

### Task 2: Distinct scenery and coordinated lighting

**Files:** Create `src/editions/smf-stage-view.js`, `tests/smf-stage-view.test.mjs`; modify `src/StageRenderer.js`, `src/GameScene.js`, `src/concert-lighting.js`.
**Interfaces:** `createSMFStageView(scene,stage)` returns null for unsupported stage or `{update(elapsed,phase,reduced,timing)}`. Nodes are tracked/destroyed by StageRenderer's existing ownership. `StageRenderer(scene,{venueView}={})` accepts an optional factory; GameScene passes optional renderer options. No SMF import in generic rendering. Optional fifth concertLighting argument selects trusted stage lighting.

- [ ] Write failing tests with the existing graphics doubles: distinct draw signatures/materials, deterministic scenery, no gameplay data mutation, all nodes removed on switch, static reduced-motion update output at different times. Verify default generic render behavior remains.
- [ ] Run `node --test tests/smf-stage-view.test.mjs tests/scene.test.mjs tests/music.test.mjs`; observe new failures.
- [ ] Draw Living Room river/shore at perimeter, sister cedars, timber shelter, hanging lamps and warm floor reflections. Draw Pagoda tall tiered facade, roof-edge outlines, mapped geometry on the facade, deep indigo field and broad pearl/amber fans. Keep the scored central floor readable. Update only bounded small dynamic layers; projections stay above the pickup floor.
- [ ] Run targeted tests and `npm test`; require pass.
- [ ] Commit `feat: render riverside and projection-stage venue identities`.

### Task 3: Original phrase-length music sketches

**Files:** Create `src/editions/smf-music.js`, `tests/smf-music.test.mjs`; modify `src/audio.js` only if needed for bounded note offsets.
**Interfaces:** `smfPreviewVoices({timing,step,phase,multiplier,flowActive})` returns existing voice descriptors for the two allowlisted profiles, otherwise silence. Optional `offsetMs` is a trusted0..24ms per-voice swing offset; audio schedules it relative to the canonical grid. No external track fetches.

- [ ] Write failing tests:32bars of distinct112/128BPM sketches with four8-bar sections,4-bar answers, clear root return; ended/unknown clocks silent; finite bounded voice volumes/durations/frequencies and swing offsets; Flow adds its own layer, low score still has a complete arrangement. Clamp final voice tails to the stage end.
- [ ] Run `node --test tests/smf-music.test.mjs tests/audio.test.mjs`; observe missing generator/offset support.
- [ ] Implement Living Room rounded bass, lightly swung hats, electric-key-style chords and answering motif; Pagoda four-on-floor kick, evolving arpeggio, restrained bass and tonal return. Section changes affect musical density and scenery motifs, not avatar speed or scoring windows.
- [ ] Run targeted tests and `npm test`; require pass. Distinguish generation tests from actual device listening.
- [ ] Commit `feat: sketch original Living Room and Pagoda arrangements`.

### Task 4: Isolated two-venue practice and live acceptance

**Files:** Create `src/venue-practice.js`, `tests/venue-practice.test.mjs`, `docs/superpowers/smf-venue-preview-validation.md`; modify `src/clock-practice-entry.js`, `src/clock-practice.js`, `src/clock-practice.css`, `src/editions/registry.js`, `src/main.js`, build checker/tests and current docs.
**Interfaces:** `venuePracticeRequested(env,search)` requires DEV+SMF+`?rehearsal&venues`. Boot optional `actions.venues` is guarded again inside startEdition. The existing DEV practice entry detects the approved variant and dynamically loads venue data/scenery/music. Generalize createClockPractice with explicit allowed choices and stage resolver while preserving default clock-lab API. `venuePracticeConfig` supplies only two real choices, selected stage, timing and target. No route/score recording contract is implied.

- [ ] Write failing tests: every gate combination including forcibly true production option; two implemented choices only; no storage/fetch use; single engine over10switches, clean transient state; defaults remain seven-clock neutral practice. Production checker excludes venue UI/fixtures and generic output excludes SMF scenery module.
- [ ] Run `node --test tests/venue-practice.test.mjs tests/clock-practice.test.mjs tests/clock-lifecycle.test.mjs tests/edition-boot.test.mjs tests/edition-builds.test.mjs`; observe failures before edits.
- [ ] Add venue name/short atmosphere copy, selector, target progress and round-end target feedback. Label music/art as early original sketches. Reuse stabilized controls/columns; no unrelated menu redesign. Suppress repeat Escape in the shared practice handler because this preview needs reliable pause. Keep hidden catalogue untouched.
- [ ] Run `npm test`, `npm run build`, `npm run check:editions`, docs links and whitespace checks; require pass.
- [ ] In browser play both venues on desktop and390×844; click/tap/keyboard, pickups, bass activation, pause/resume, hidden page, repeated resets, end state and return to catalogue. Measure running HUD stability. Observe scenery under reduced motion and cleanup; inspect console. Save screenshots outside repo. Record actual device listening and physical phone as unobserved unless exercised.
- [ ] Fresh whole-range review under native execution; fix Important/Critical findings with RED→GREEN regressions and a green suite, record rulings/minors. Update docs/evidence and commit `feat: preview Living Room and Pagoda in isolated venue practice`.

## Handoff

Keep the playable preview on the Mac for owner layout/music feedback. No push/merge/deploy is authorized here. This does not finish M2B: four venues, six-stage transitions/perks/progression, tagged durable recovery and new online schemas remain in subsequent slices.
