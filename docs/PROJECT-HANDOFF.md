# Side Quest — current project handoff

Updated 2026-11-06. This document is the current starting point. [Roadmap](ROADMAP.md) owns priorities; [operations](online-operations.md) owns deployment/reporting. [Historical snapshots](history/) retain earlier observations without defining today's backlog.

## Current release and prior baseline

Current public release: **[PR #19](https://github.com/ratfinkca/shambhala-side-quest/pull/19) /67c44e0**, verified after Pages deployment on 2026-11-06. It restores same-browser Endless runs paused at the saved moment; atomic progress/checkpoints and original score tickets prevent duplicate awards/posts. [Recovery release evidence](superpowers/run-recovery-release-validation.md) links final CI/Pages/public acceptance. The preceding verified public baseline is Bass Head PR #18 /41148ee, published 2026-11-05; see [Bass release evidence](superpowers/m4-bass-release-validation.md).

Prior verified baseline: PR #13, `8b5192fc397f98927a5fbd45fe425bb66ba52efa`, following PR #12 online Endless and PR #11 Endless gameplay. Backend validators deployed before frontend merge; both CI workflows and Pages deployment passed. Public save/post controls, unsaved warning and preserved initials were checked. Release baseline:145 automated tests and production build passed. This is recorded release evidence, not a fresh production-health audit.

[Public game](https://ratfinkca.github.io/shambhala-side-quest/) · [repository](https://github.com/ratfinkca/shambhala-side-quest).

- Quick Rush: 60-second score chase. Festival Run: Forest 20 → Neon 25 → Sunrise 30 sparks in three 60-second stages.
- Endless: repeat those stages; target+3/loop capped45, dancers+2/loop capped22, movement+8%/loop capped20%. Four distinct active perks, optional add/keep/swap. Stage music and lighting remain stage-specific.
- Voluntary Finish run & save score banks completed stages; unfinished-stage points are excluded. Missing a stage target also reaches results. No finished stage means explicit discard. Local save/public post are separate explicit actions; replay/title warn if neither succeeded. Viewing scores preserves the run. Endless can recover on this browser; Rush/Festival recovery is not included. A recovery save does not install the game for offline use or sync devices.
- Online top 50 per mode, three A–Z/0–9 initials, visible control type. Endless ranks clears, then points; Rush/Festival rank points, then clears. Local top 10 per mode. Tickets24 hours; online history1440 stages and1 MiB submission bound; overflow never ends local gameplay.
- Eight run perks: Boots, Noodle, Moth, Bracelet plus XP-unlocked Surfer 300, Battery 650, Encore 1200, Sweet Tooth 2000. Perks reset each run.
- Six local XP ranks and six earlier achievements; M3 adds four Endless achievements, bringing the wardrobe to ten onesies/ten hats/ten totems and four earnable flourishes. Existing profiles retain previously available choices. No cloud profile sync or permanent power purchases.
- Three complete visual themes with saved selection/Surprise; individual stage music and smooth reactive lighting; reduced motion supported.
- Pointer movement is click/tap-to-destination. Organic mud, bass pressure, charged Bass Head, wrapped mystery candy and proximity-scaled clean-pass rings are implemented.
- Public optional playtest sharing is opt-in and reachable on the title screen/settings. M1 adds optional Endless stage/outcome and perk-choice analytics; online score posting works independently.

M1 release scope (2026-11-03): schema-2 Endless analytics, bounded current-stage memory, banked/failed/exit distinctions and add/swap/keep choices. The metrics migration, deployed source, private access and cleanup jobs were verified before frontend merge. See [M1 release evidence](superpowers/m1-release-validation.md); final CI/Pages results are recorded on the release PR.

## Current work and next steps

M1 insights, M2 layouts, M3 souvenirs, M4 candy, Bass Head and recovery are published. The current forward program is a [shared-engine edition split](superpowers/specs/2026-11-06-edition-split-design.md): preserve the generic game while building a polished SMF version with all six mains plus Rabbit Hole, Secret Garden and Ikigai Mori. No fixed pitch deadline; all nine must be complete before the intended pitch candidate.

[Edition roadmap](EDITION-ROADMAP.md) owns the new M0–M6 sequence; [M0 implementation plan](superpowers/plans/2026-11-06-edition-foundation.md) starts with compatible rules, isolated profiles/locks/assets and a non-playable SMF catalogue scaffold. The user approved the design/plan and native execution. M0 is implemented locally: 225 tests and both builds pass, with desktop/phone-width browser checks; independent review fixes verified. [Validation](superpowers/edition-foundation-preview-validation.md). No remote fork, backend deployment or public release has been made. Shared backend rules imports are refactored without changing the legacy protocol. Native execution remains the user's preference.

The user wants optional discoveries tied to parent stages. Builder recommendation: collect an invitation in the parent round, choose a separate secret visit after clearing, and retain discovered Explore access; secret rewards cannot inflate the main score or carry power into it. Detailed parameters and proposed route are in the approved design; M1 research/rules review precedes actual SMF stage implementation. Original music with proper electronic phrasing remains planned, now stage-specific after research; the previous three-stage/128 BPM proposal is superseded. Weekend feedback still informs balance and physical-device reliability; absent telemetry does not prove inactivity.

## M1 research and rule proposal — owner review

The [nine-venue research](research/smf-stage-identities-2026-11-06.md) links 2023–2026 official announcements, primary artist/curator testimony and visual references, separating observed evidence from original game choices. Two stage/year announcement gaps and uneven secret-stage evidence are explicit; full-set listening and final dated-art acceptance remain open.

The [rules proposal](superpowers/specs/2026-11-06-smf-route-rules-design.md) recommends Living Room → Fractal → Grove → AMP → Pagoda → Village, four-slot earned perk choices, fair independent secret visits, and phrase-length SMF rounds with canonical targets/timing. Owner decisions are now recorded: 2026 venue structures, complete musical phrases, and separate [2027 campaign-inspired title/menu direction](research/smf-2027-interface-direction-2026-11-06.md). This is a researched recommendation, not an approved server ruleset or product implementation. Keep the current M0 catalogue order/code until approval. A fresh builder check found no additional build-changing gaps. M2 now has a [delivery sequence](superpowers/plans/2026-11-06-smf-m2-delivery.md) and a [detailed musical-clock plan](superpowers/plans/2026-11-06-smf-musical-clock.md), approved for native execution. The first slice adds canonical timing, synchronized scene/audio cues and a DEV-only disposable clock lab. It deliberately keeps normal SMF play and online connections disabled. Six authored venues/local run flow follow; a new edition-tagged score/recovery contract is required before durable SMF runs and posting. M2A is implemented locally: canonical clocks and a disposable clock practice screen; final verification is recorded in the [clock validation](superpowers/smf-clock-preview-validation.md). Six venue layouts, SMF durable recovery and online services remain future work. No backend change or deployment. Layout/listening/art acceptance still precedes ranked publication.

## M2A clock practice

Run an SMF dev server and open `/?rehearsal&clock` (current preview: http://127.0.0.1:5191/?rehearsal&clock). Seven trusted clocks, fixed-millisecond effects, synchronized crowd/scoring/lights and bounded audio scheduling are available on a neutral floor. All state is disposable; reload does not recover this lab. Generic 60-second round objects, score payloads, recovery-v1 and frozen pending posts remain compatible. Production SMF still opens its static catalogue; lab imports are removed from both production editions. No secret profile/name is added to the lab.

## M2B venue practice

The first two authored SMF venues are implemented locally at `http://127.0.0.1:5191/?rehearsal&venues`: Living Room and Pagoda, with independent scenery/geometry, their canonical clocks, preview targets and original phrased music sketches. [Plan](superpowers/plans/2026-11-06-smf-main-stages.md) and [validation](superpowers/smf-venue-preview-validation.md). Isolated practice only: no saves/progression/online connections; one Phaser engine, stable HUD and whole-floor framing. The six-stage run and perk flow follow; durable SMF recovery and online contract remain later work. Normal SMF stays the static concealed-secret catalogue. The follow-up art correction replaces the generic Living Room cabin with a steep A-frame and Pagoda’s repeated roofs with a dated-reference faceted tower, arches and broad columned porch. Pagoda has a visually inspected 2026 reference; Living Room’s A-frame is supported by a firsthand 2026 written report, with fine proportions still interpretive.

The 2026-11-09 preview adds Fractal Forest (120 BPM, 64 seconds, 24 sparks, two speaker islands) and the Grove (132 BPM, about 58.2 seconds, 24 sparks, three islands and a small mud patch). They use original funk breaks and dub two-step sketches with simple canopy and timber scenery.

All six main venues are now playable in the rehearsal picker. The AMP runs at 140 BPM for 54.857 seconds with a 24-spark target and four speaker islands. The Village runs at 172 BPM for 66.977 seconds with a 34-spark target and four speaker islands. The AMP uses a 32-bar halftime sketch. The Village uses a 48-bar drum-and-bass sketch with a halftime break and a dawn finale. Detailed art remains a separate pass, and the six-stage run flow is still ahead.

## Architecture

Vite/Phaser static frontend on GitHub Pages. Local M0 uses `src/main.js` as an edition-first loader, `src/game-entry.js` for the existing playable bootstrap, and `src/editions/` for trusted identity, storage context and the static SMF catalogue. Pure game/run/stage rules live in `src/game.js`, `src/run.js`, `src/stages.js`, `src/endless.js`; Phaser rendering in GameScene/StageRenderer/Crowd/Avatar. `src/screens.js` controls navigation and `src/results-view.js` renders score decisions. `src/progression.js`, profile/storage own local XP and saves. Theme registry/art and stage music/lighting are independent.

`src/online/` talks to the Supabase arcade functions. `src/playtest/` owns consent, aggregate measurement and bounded best-effort transport. Supabase functions validate exact payload allowlists; private-schema RPCs own writes/reads. Analytics and arcade identities/storage are separate. See operations for limits, migration ordering and retention.

## Development and verification

Node 24, `npm ci`, `npm test`, `npm run build`, `git diff --check`. No credentials are needed to play locally. `npm run dev -- --port 5178 --strictPort` binds127.0.0.1. Localhost runs on the host Mac, not automatically on a remote client. Use a separate local test backend for write-producing QA.

`/?rehearsal` is development-only: qualify/fail controls, all perks, no saved scores/XP or online requests. It verifies navigation, never balance. Browser-check changed flows, desktop/phone layouts and console; physical-device performance/audio need real playtesting. Phaser's existing large-bundle warning is known.

Use feature branches and PRs to main. Deploy needed backend migrations/functions first, verify live safe validation, then merge after frontend/backend CI. Main merge triggers Pages; verify deployment completion and public UI/assets separately. Do not reset a hosted database or post test production scores. Preserve private data and credentials outside the repository.


## M2 stage variations — release scope, 2026-11-03

Six authored layouts now alternate from loop2 (A) and loop3 (B) onward, while loop1 and Festival/Rush geometry remain original. Each keeps its base stage ID, music and palette. Layout names appear on rules/HUD. Crowds use deterministic cabinet-clear anchors, preserving existing counts/speed caps. Organic mud uses the same sampled polygon for art/collision.

Practice link: `http://127.0.0.1:5181/?rehearsal&layout=forest-creekside`. Development-only Layout lab selects any encounter; loading resets to a no-perk practice stage. Scores/XP/analytics are disabled. Rehearsal's qualify/fail controls remain in the collapsible lab. Reload reopens the selected layout's rules, not a saved run.

Optional Endless stage_start/stage_end measurements gain variationId, validated against the deterministic stage-index registry; older schema2 events without IDs still work. Private stage reports separate legacy-unknown samples. The updated playtest function and shared variations.js module deploy before the frontend; no SQL migration or arcade validator/scoring-version change is needed. User approved release after the local preview.

M2 acceptance:155automated tests and production build pass; independent review clean. Browser loaded all six layouts, tested picker/reset/reload, pause/resume, destination steering and finish with rehearsal saving/XP disabled.390x844HUD/picker check passed; no console errors/warnings. Physical touch balance and sustained phone performance remain user playtest work. Preview server5181 stays running, opening Creekside Drift rules; That paragraph records local acceptance; subsequent backend/CI/Pages evidence is recorded on the M2 release PR.

M2 release: prior verified M1 baseline is PR #14 /e34e092. The six layouts preserve loop1, scoring/caps and stage atmosphere. Final hosted and Pages checks are recorded on the release PR; [release evidence](superpowers/m2-release-validation.md) records scope and test limits.

## M3 Endless souvenirs — local preview, 2026-11-04

Four achievements unlock Spore Sprout, Mixtape Totem, Mycelium Threads and Aurora Ribbons. See the [design](superpowers/specs/2026-11-04-endless-rewards-design.md) for the approved 4-clear, swap-then-clear, six-layout and 12-clear criteria. Existing profiles retain earlier items; new achievements start at zero, without inferred historical layout/swap credit. Progress saves at qualifying stage end. Score posting and playtest consent stay independent.

`src/progression.js` normalizes bounded `endless` records (best clears, up to six known layout IDs, Remix completion). `finishStage` returns `progressContext` and successful swaps mark only the following stage. Existing receipts guard duplicate stage awards. `src/endless-cosmetics.js` draws bounded procedural details with stable reduced-motion variants. No migration, function deployment, dependencies or score-version change is needed.

Preview: `http://127.0.0.1:5181/?rehearsal&rewards`. The wardrobe opens automatically. Scroll to Endless souvenirs to preview each reward; the bottom Reward lab demonstrates earning selected rewards through the real progression function. This mode uses a disposable profile; reload resets it and never touches the real profile. Scores/analytics are disabled. Ordinary `/?rehearsal` still disables stage XP. Production builds exclude lab controls and fixture code. Physical touch comfort, sustained performance and reward reachability remain playtest work.

M3 release approval (2026-11-04): user approved the preview. Release checks: 163 tests, production build, independent review and portrait/landscape acceptance pass. No backend deployment is required. Final PR/merge/Pages/public verification passed: [release evidence](superpowers/m3-release-validation.md).

## M4 first slice — published candy pass

The user confirmed Dizzy should invert controls. Keyboard vectors reverse; click/tap targets are mirrored once around the player and clamped to the field. Collecting Dizzy mid-journey mirrors the existing target once; expiry changes subsequent input without an automatic return trip. Existing collision rules are unchanged. Wavy Colours now paints slowly shifting pools/ribbons behind the field objects, with gentle fades and a static reduced-motion tint. Timing, speed, Sweet Tooth and scoring remain unchanged.

`/?rehearsal&candy=waves` opens a DEV Candy lab. Select an effect and choose Start candy practice; each try starts a fresh Quick Rush and uses the real collection path. Scores, XP and analytics remain disabled. The lab is absent from production. New modules/tests: `src/candy-colours.js`, mystery/scene input regressions and `tests/candy-colours.test.mjs`. No backend deployment required. M4 candy is published in PR #17; the lab remains DEV-only.

M4 candy release approval (2026-11-04): user requested PR, merge and deployment after the preview. Release checks: 168 tests/build, independent review and browser acceptance pass. No backend deployment is required. CI/Pages/public checks passed; [release evidence](superpowers/m4-candy-release-validation.md) records them. Bass-zone feel is the next scoped pass.

## Bass interface — approved release

`/?rehearsal&bass=half` opens the DEV Bass lab. Start a fresh Neon Grove practice with fresh/quarter/half/full/outside presets. This lab uses a disposable profile, with scores, XP and analytics disabled. Charge continues normally in-zone; the outside scenario is useful for comparing spending without charging further.

The on-field native control appears in upper-right scenery to avoid normal pickup space on phones. It retains B/Enter/Space. At 25% or more, spend the whole meter for proportional protection (1.5–6s); the ring shows charge or remaining active time. `src/bass-view.js` owns the shared UI state. Speaker/player feedback is in `src/bass-feedback.js`: restrained cone wavefronts, amber pressure at the feet and mint protection. Cosmetic layers vibrate together and steady during protection. No two-finger gesture was added.

Exposure, radial slowdown, cooldown and post-expiry pressure are unchanged; the previously observed expiry cliff remains deliberate for this slice. Mud/bumps still slow a protected player. Score validation and analytics schemas are unchanged; no backend deployment is expected. [Validation](superpowers/bass-interface-preview-validation.md) records tests and phone layout limits. The user approved shipping on 2026-11-05. See the release evidence for final hosted verification.
