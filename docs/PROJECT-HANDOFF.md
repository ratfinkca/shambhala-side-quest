# Side Quest — current project handoff

Updated 2026-11-04. This document is the current starting point. [Roadmap](ROADMAP.md) owns priorities; [operations](online-operations.md) owns deployment/reporting. [Historical snapshots](history/) retain earlier observations without defining today's backlog.

## Current release and prior baseline

Prior verified baseline: PR #13, `8b5192fc397f98927a5fbd45fe425bb66ba52efa`, following PR #12 online Endless and PR #11 Endless gameplay. Backend validators deployed before frontend merge; both CI workflows and Pages deployment passed. Public save/post controls, unsaved warning and preserved initials were checked. Release baseline:145 automated tests and production build passed. This is recorded release evidence, not a fresh production-health audit.

[Public game](https://ratfinkca.github.io/shambhala-side-quest/) · [repository](https://github.com/ratfinkca/shambhala-side-quest).

- Quick Rush: 60-second score chase. Festival Run: Forest 20 → Neon 25 → Sunrise 30 sparks in three 60-second stages.
- Endless: repeat those stages; target+3/loop capped45, dancers+2/loop capped22, movement+8%/loop capped20%. Four distinct active perks, optional add/keep/swap. Stage music and lighting remain stage-specific.
- Voluntary Finish run & save score banks completed stages; unfinished-stage points are excluded. Missing a stage target also reaches results. No finished stage means explicit discard. Local save/public post are separate explicit actions; replay/title warn if neither succeeded. Viewing scores preserves the run. Reloading abandons an active run.
- Online top 50 per mode, three A–Z/0–9 initials, visible control type. Endless ranks clears, then points; Rush/Festival rank points, then clears. Local top 10 per mode. Tickets24 hours; online history1440 stages and1 MiB submission bound; overflow never ends local gameplay.
- Eight run perks: Boots, Noodle, Moth, Bracelet plus XP-unlocked Surfer 300, Battery 650, Encore 1200, Sweet Tooth 2000. Perks reset each run.
- Six local XP ranks and six earlier achievements; the M3 preview adds four Endless achievements, bringing the wardrobe to ten onesies/ten hats/ten totems and four earnable flourishes. Existing profiles retain previously available choices. No cloud profile sync or permanent power purchases.
- Three complete visual themes with saved selection/Surprise; individual stage music and smooth reactive lighting; reduced motion supported.
- Pointer movement is click/tap-to-destination. Organic mud, bass pressure, charged Bass Head, wrapped mystery candy and proximity-scaled clean-pass rings are implemented.
- Public optional playtest sharing is opt-in and reachable on the title screen/settings. M1 adds optional Endless stage/outcome and perk-choice analytics; online score posting works independently.

M1 release scope (2026-11-03): schema-2 Endless analytics, bounded current-stage memory, banked/failed/exit distinctions and add/swap/keep choices. The metrics migration, deployed source, private access and cleanup jobs were verified before frontend merge. See [M1 release evidence](superpowers/m1-release-validation.md); final CI/Pages results are recorded on the release PR.

## Current work and next steps

The approved next sequence is [M1: Endless insights](ROADMAP.md#m1--endless-insights), M2:stage variations, M3:Endless rewards, then evidence-led feel/reliability work. M1 is complete in this release (150 tests/build pass). Its analytics migration and playtest function were deployed and checked before frontend rollout. M2 stage variations shipped as PR #15 /34974ab with Pages/public verification. M3 Endless rewards preview was approved for release on 2026-11-04; CI/Pages verification is pending. M4 feel/reliability follows. No balancing claims follow from rehearsal or from a small/missing sample.

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

M3 release approval (2026-11-04): user approved the preview. Release checks: 163 tests, production build, independent review and portrait/landscape acceptance pass. No backend deployment is required. Final PR/merge/Pages/public verification is recorded on the release PR and in the release evidence.
