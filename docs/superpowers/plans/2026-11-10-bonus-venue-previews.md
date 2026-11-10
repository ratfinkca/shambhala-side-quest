# Four Bonus Venue Previews Implementation Plan

> **For agentic workers:** Implement with focused parallel ownership; verify the integrated rehearsal and review before completion.

**Goal:** Deliver Rabbit Hole, Secret Garden, Ikigai Mori and Villagio as four playable, disposable SMF previews following the accepted AMP activity.

**Architecture:** One DEV-only bonus entry shares movement, crowd encounters, sound controls and lifecycle. A pure visit controller handles three small activities and a Villagio exploration tour. Each venue has separate scenery with a common update contract; original artwork interprets existing research where definitive 2026 references are missing.

**Tech Stack:** Existing Phaser, JavaScript, Vite and Node tests; generated illustrations stored only in DEV-imported source assets. No new dependencies.

**Spec:** [Secret and backstage direction](../specs/2026-11-10-secret-backstage-expansion-design.md). User approved proceeding through these previews on 2026-11-10.

## Scope and builder choices

- Rabbit Hole / Hoola b2b Lioness: six sequential lost-and-found trinkets, a hidden-room clearing and a temporary rabbit-ear souvenir.
- Secret Garden / Footprints: collect and plant three individual seeds; each planted seed adds a bloom. Temporary glowing blossom souvenir.
- Ikigai Mori / Soup: clean-pass five distinct dancers to light five lanterns. Bumps do not erase banked progress. Temporary lantern totem.
- Villagio / Subvert: explore two decorative putting greens and the twisty chicken slide. No putting physics, prize qualification or cosmetic award in this first space preview.
- Each uses a complete musical phrase sequence. Original arrangements remain rehearsal music, with no artist recording implied or bundled.
- These counts, tempos, layouts and cosmetic sketches are builder-selected first-preview values, not frozen release rules.
- No full-tour integration, discovery grants, profile writes, recovery writes, main-score changes, telemetry, online posting, artist outreach or publishing. Normal concealed catalogue stays unchanged.

## Review focus

1. The same collectible, dancer or exploration point must not advance twice, including continued overlap and repeated pass frames.
2. Pause, timeout, reset, switching venues, hiding and disposal must stop or reset activity/audio correctly.
3. Garden must require a real return to the bed after pickup; empty-handed planting cannot earn progress.
4. Villagio must never claim a putting win or cosmetic grant; incomplete visits cannot reveal a success reward.
5. Collectibles/targets must remain reachable and legible at phone size; decorative stage scenery stays outside the dancefloor.

## File boundaries and contracts

- `src/bonus-practice/config.js`: pure configuration for all four stages. Stage schema matches GameScene. Config includes `id,name,parent,dj,activity,goal,reward,timingId,stage,points,bed,caption,instruction`.
- `src/bonus-practice/state.js`: `createBonusPractice(config)` with `state,status,start(),pause(),resume(),finish(),step({player,encounters})`. State has `progress,goal,complete,collectedIds,visitedIds,greetedIds,carrying`. One progress/collection event at most per frame; complete event includes a reward only when configured.
- `src/bonus-practice/views/rabbit-hole.js`, `secret-garden.js`, `ikigai-mori.js`, `villagio.js`: each exports `preload(scene)` and `createView(scene,stage)`; returns null for other stage IDs, otherwise `{ownsLighting:true,update(elapsed,phase,reducedMotion,timing),setProgress(state)}`. Factory owns scenery only; StageRenderer handles destruction of scene children. No DOM, input, activities, persistence or music in these modules.
- `src/bonus-practice/activity-view.js`: draw current trinket/seed, garden bed, exploration cues, transient success effects and temporary reward accessories. Reads configuration and pure state; logical collection distance remains independent of decorative animation.
- `src/bonus-practice/music.js`: four original phrase-structured rehearsal arrangements using the existing instrument rack, matched to trusted preview clocks.
- `src/bonus-practice/entry.js` / `style.css`: selector, instructions, progress, results, pause, reset and mixer; one Phaser instance reused for venue changes. Links between venue/AMP/bonus rehearsals.
- `src/editions/registry.js`, `src/main.js`: `?rehearsal&bonus=rabbit-hole|secret-garden|ikigai-mori|villagio`, allowed only in DEV SMF; new imports stripped from production.

## Execution

- [x] Write failing activity/lifecycle/route tests; implement pure configurations and controller; verify focused tests.
- [x] Build Rabbit Hole and its replaceable scenery plate with animated warm room accents.
- [x] Build Secret Garden and its replaceable scenery plate with progress-driven flowers.
- [x] Build Ikigai Mori and its replaceable scenery plate with progress-driven lanterns.
- [x] Build Villagio's two greens and chicken tube slide; keep putting/rewards honestly deferred.
- [x] Add phrase clocks and original music, preserving generic timing and ranked contracts.
- [x] Integrate shared entry, activity feedback and sound controls; verify reset/pause/switch/end cleanup.
- [x] Run full tests, production build, both edition checks and independent review; correct material findings.
- [x] Play every activity, inspect all four at phone size plus desktop checks, check console, capture evidence and leave preview ready.
- [x] Update roadmap/spec/handoff with actual preview status and limits; save a local commit. No public release.

Evidence: [preview validation](../bonus-venue-preview-validation.md). Physical-device listening/play remains owner acceptance; browser checks use native Chrome after in-app control timeouts.
