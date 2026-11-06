# Side Quest — current project handoff

Updated 2026-11-05. This document is the current starting point. [Roadmap](ROADMAP.md) owns priorities; [operations](online-operations.md) owns deployment/reporting. [Historical snapshots](history/) retain earlier observations without defining today's backlog.

## Current release and prior baseline

Current public release: **M4 Bass Head, [PR #18](https://github.com/ratfinkca/shambhala-side-quest/pull/18) /41148ee**, verified after Pages deployment on 2026-11-05. Partial spending and on-field speaker/player feedback are live; slowdown remains unchanged. [Bass release evidence](superpowers/m4-bass-release-validation.md) records acceptance. Candy PR #17 /d00ee62 is the preceding release.

Prior verified baseline: PR #13, `8b5192fc397f98927a5fbd45fe425bb66ba52efa`, following PR #12 online Endless and PR #11 Endless gameplay. Backend validators deployed before frontend merge; both CI workflows and Pages deployment passed. Public save/post controls, unsaved warning and preserved initials were checked. Release baseline:145 automated tests and production build passed. This is recorded release evidence, not a fresh production-health audit.

[Public game](https://ratfinkca.github.io/shambhala-side-quest/) · [repository](https://github.com/ratfinkca/shambhala-side-quest).

- Quick Rush: 60-second score chase. Festival Run: Forest 20 → Neon 25 → Sunrise 30 sparks in three 60-second stages.
- Endless: repeat those stages; target+3/loop capped45, dancers+2/loop capped22, movement+8%/loop capped20%. Four distinct active perks, optional add/keep/swap. Stage music and lighting remain stage-specific.
- Voluntary Finish run & save score banks completed stages; unfinished-stage points are excluded. Missing a stage target also reaches results. No finished stage means explicit discard. Local save/public post are separate explicit actions; replay/title warn if neither succeeded. Viewing scores preserves the run. Reloading abandons an active run.
- Online top 50 per mode, three A–Z/0–9 initials, visible control type. Endless ranks clears, then points; Rush/Festival rank points, then clears. Local top 10 per mode. Tickets24 hours; online history1440 stages and1 MiB submission bound; overflow never ends local gameplay.
- Eight run perks: Boots, Noodle, Moth, Bracelet plus XP-unlocked Surfer 300, Battery 650, Encore 1200, Sweet Tooth 2000. Perks reset each run.
- Six local XP ranks and six earlier achievements; M3 adds four Endless achievements, bringing the wardrobe to ten onesies/ten hats/ten totems and four earnable flourishes. Existing profiles retain previously available choices. No cloud profile sync or permanent power purchases.
- Three complete visual themes with saved selection/Surprise; individual stage music and smooth reactive lighting; reduced motion supported.
- Pointer movement is click/tap-to-destination. Organic mud, bass pressure, charged Bass Head, wrapped mystery candy and proximity-scaled clean-pass rings are implemented.
- Public optional playtest sharing is opt-in and reachable on the title screen/settings. M1 adds optional Endless stage/outcome and perk-choice analytics; online score posting works independently.

M1 release scope (2026-11-03): schema-2 Endless analytics, bounded current-stage memory, banked/failed/exit distinctions and add/swap/keep choices. The metrics migration, deployed source, private access and cleanup jobs were verified before frontend merge. See [M1 release evidence](superpowers/m1-release-validation.md); final CI/Pages results are recorded on the release PR.

## Current work and next steps

M1 insights, M2 stage variations and M3 souvenirs are published. M4 candy feel is published: user-confirmed steering inversion and clearer Wavy Colours. Bass Head communication/activation is published in PR #18. Run recovery has an approved design and local implementation: paused mid-stage Endless restoration on the same browser/device. See the [design](superpowers/specs/2026-11-05-run-recovery-design.md), [plan](superpowers/plans/2026-11-05-run-recovery.md) and [preview validation](superpowers/run-recovery-preview-validation.md). It is not published. Broader candy/bass tuning and physical-device reliability follow evidence and playtest feedback. No balancing claims follow from rehearsal or from a small/missing sample.

## Architecture

Vite/Phaser static frontend on GitHub Pages. Pure game/run/stage rules live in `src/game.js`, `src/run.js`, `src/stages.js`, `src/endless.js`; Phaser rendering in GameScene/StageRenderer/Crowd/Avatar. `src/screens.js` controls navigation and `src/results-view.js` renders score decisions. `src/progression.js`, profile/storage own local XP and saves. Theme registry/art and stage music/lighting are independent.

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
