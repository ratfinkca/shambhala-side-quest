# Side Quest — current project handoff

Updated 2026-11-03. This document is the current starting point. [Roadmap](ROADMAP.md) owns priorities; [operations](online-operations.md) owns deployment/reporting. [Historical snapshots](history/) retain earlier observations without defining today's backlog.

## Current release and prior baseline

Prior verified baseline: PR #13, `8b5192fc397f98927a5fbd45fe425bb66ba52efa`, following PR #12 online Endless and PR #11 Endless gameplay. Backend validators deployed before frontend merge; both CI workflows and Pages deployment passed. Public save/post controls, unsaved warning and preserved initials were checked. Release baseline:145 automated tests and production build passed. This is recorded release evidence, not a fresh production-health audit.

[Public game](https://ratfinkca.github.io/shambhala-side-quest/) · [repository](https://github.com/ratfinkca/shambhala-side-quest).

- Quick Rush: 60-second score chase. Festival Run: Forest 20 → Neon 25 → Sunrise 30 sparks in three 60-second stages.
- Endless: repeat those stages; target+3/loop capped45, dancers+2/loop capped22, movement+8%/loop capped20%. Four distinct active perks, optional add/keep/swap. Stage music and lighting remain stage-specific.
- Voluntary Finish run & save score banks completed stages; unfinished-stage points are excluded. Missing a stage target also reaches results. No finished stage means explicit discard. Local save/public post are separate explicit actions; replay/title warn if neither succeeded. Viewing scores preserves the run. Reloading abandons an active run.
- Online top 50 per mode, three A–Z/0–9 initials, visible control type. Endless ranks clears, then points; Rush/Festival rank points, then clears. Local top 10 per mode. Tickets24 hours; online history1440 stages and1 MiB submission bound; overflow never ends local gameplay.
- Eight run perks: Boots, Noodle, Moth, Bracelet plus XP-unlocked Surfer 300, Battery 650, Encore 1200, Sweet Tooth 2000. Perks reset each run.
- Six local XP ranks/achievements, nine onesies/nine hats/nine totems and three earnable flourishes. Existing profiles retain previously available choices. No cloud profile sync or permanent power purchases.
- Three complete visual themes with saved selection/Surprise; individual stage music and smooth reactive lighting; reduced motion supported.
- Pointer movement is click/tap-to-destination. Organic mud, bass pressure, charged Bass Head, wrapped mystery candy and proximity-scaled clean-pass rings are implemented.
- Public optional playtest sharing is opt-in and reachable on the title screen/settings. M1 adds optional Endless stage/outcome and perk-choice analytics; online score posting works independently.

M1 release scope (2026-11-03): schema-2 Endless analytics, bounded current-stage memory, banked/failed/exit distinctions and add/swap/keep choices. The metrics migration, deployed source, private access and cleanup jobs were verified before frontend merge. See [M1 release evidence](superpowers/m1-release-validation.md); final CI/Pages results are recorded on the release PR.

## Current work and next steps

The approved next sequence is [M1: Endless insights](ROADMAP.md#m1--endless-insights), M2:stage variations, M3:Endless rewards, then evidence-led feel/reliability work. M1 is complete in this release (150 tests/build pass). Its analytics migration and playtest function were deployed and checked before frontend rollout. M2 stage variations is next. No balancing claims follow from rehearsal or from a small/missing sample.

## Architecture

Vite/Phaser static frontend on GitHub Pages. Pure game/run/stage rules live in `src/game.js`, `src/run.js`, `src/stages.js`, `src/endless.js`; Phaser rendering in GameScene/StageRenderer/Crowd/Avatar. `src/screens.js` controls navigation and `src/results-view.js` renders score decisions. `src/progression.js`, profile/storage own local XP and saves. Theme registry/art and stage music/lighting are independent.

`src/online/` talks to the Supabase arcade functions. `src/playtest/` owns consent, aggregate measurement and bounded best-effort transport. Supabase functions validate exact payload allowlists; private-schema RPCs own writes/reads. Analytics and arcade identities/storage are separate. See operations for limits, migration ordering and retention.

## Development and verification

Node 24, `npm ci`, `npm test`, `npm run build`, `git diff --check`. No credentials are needed to play locally. `npm run dev -- --port 5178 --strictPort` binds127.0.0.1. Localhost runs on the host Mac, not automatically on a remote client. Use a separate local test backend for write-producing QA.

`/?rehearsal` is development-only: qualify/fail controls, all perks, no saved scores/XP or online requests. It verifies navigation, never balance. Browser-check changed flows, desktop/phone layouts and console; physical-device performance/audio need real playtesting. Phaser's existing large-bundle warning is known.

Use feature branches and PRs to main. Deploy needed backend migrations/functions first, verify live safe validation, then merge after frontend/backend CI. Main merge triggers Pages; verify deployment completion and public UI/assets separately. Do not reset a hosted database or post test production scores. Preserve private data and credentials outside the repository.
