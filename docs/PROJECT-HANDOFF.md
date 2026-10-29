# Project handoff and roadmap

Updated 2026-10-28. This is the starting point for continuing development on another machine. Historical specs and plans describe shipped work; do not restart their unchecked task lists.

## Current release

PR #7 is deployed to [GitHub Pages](https://ratfinkca.github.io/shambhala-side-quest/) as `8811981` (2026-10-27). Shipped features include:

- Quick Rush and three-stage Festival Run, four run perks, candy, organic mud, bass pressure and earned Bass Head special.
- Forest Freakout, Moonlit Mycelium and Neon Field Trip, with saved selection and Surprise each run.
- Optional Supabase playtest tracking and a persistent title-screen sharing control; tracking remains opt-in.
- Initials-based online Rush/Festival arcade boards, separate from local scores and analytics consent.
- Nine choices per wardrobe category (729 combinations), all immediately available, and proximity-scaled clean-pass rings.

Next agreed track: richer music and reactive concert lighting, starting with a Living Forest prototype for listening/playtesting before extending to other stages. Then persistent rave experience, perk availability and achievement-based cosmetic rewards. Preserve already available cosmetics. Candy feel/balance tuning remains deferred; endless mode and its perk limits, currency/shop and cross-device saves remain future work.

112 automated tests cover the current working prototype. The sections below dated October 14–22 are historical planning/implementation snapshots; their pending-release statements are superseded by this release summary.

## Start on another machine

Install Git and Node.js 24, then follow the clone and `npm ci` commands in the [README](../README.md#run). Use the committed lockfile. No secrets, `.env`, database or external asset downloads are needed. GitHub authentication is only needed to push branches or manage pull requests.

```sh
git switch main
git pull --ff-only
git switch -c codex/your-feature
npm test
npm run build
npm run dev
```

Choose a descriptive branch suffix. Run `npm run preview` after building to inspect production output (normally port 4173). Development normally uses port 5173. Ignored `node_modules`, `dist`, `.qa` and `.superpowers` files are disposable/local; the tracked documentation contains the handoff information.

Player profile/settings/outfit/scores use localStorage (`sidequest.profile.v1`, with legacy best/mute migration). Saves are specific to a browser and origin, including separate localhost and Pages saves. There is no in-progress run recovery or save export/import.

## Working conventions and architecture

Keep Phaser 3.90, Vite, plain JavaScript modules and static Pages hosting unless a new design calls for a change. Art and audio are original and procedural. Keep rules testable outside Phaser and preserve Quick Rush when changing Festival Run. Permanent cosmetics currently have no gameplay effects; perks reset each run.

| Area | Files under `src/` |
| --- | --- |
| App, menus and screen transitions | `main.js`, `screens.js` |
| Round rules and Festival Run progression | `game.js`, `run.js`, `stages.js` |
| Arena, crowd, collisions and Flow | `GameScene.js`, `Crowd.js`, `festival.js`, `geometry.js`, `flow.js` |
| Shared player/preview art and scenery | `Avatar.js`, `StageRenderer.js`, `wardrobe.js` |
| Profile validation and persistence | `profile.js`, `storage.js` |
| Audio synthesis and beat definitions | `audio.js`, `music.js`, `bass-motion.js` |
| Mystery candy rules and presentation | `mystery.js`, `MysteryRenderer.js` |
| Responsive sizing and controls | `layout.js`, `input.js` |
| Development-only transition fixtures | `rehearsal.js` |

For meaningful rule changes, update the Node tests in `tests/`; run `npm test` and `npm run build` before a PR. The gameplay update passes 55 tests. Phaser's bundle-size advisory is known. Browser-check affected flows, viewport sizes, pause/resume, persistence and console output. `/?rehearsal` on the dev server exposes stage qualify/fail fixtures with scoring disabled; it is excluded from production and cannot establish difficulty balance.

Open a PR against `main`. `.github/workflows/pages.yml` runs install/tests/build on PRs. Merging to `main` runs checks and deploys Pages; verify the deployment and live game before calling a release complete. Keep credentials and private festival data out of this public repository.

## Approved direction — 2026-10-14

The user approved prioritizing features, atmosphere and rewards over further candy timing/bass escape tuning. Implement and preview these as separate small releases:

1. **Bass Head special and perk progression.** Revised with the user: Bass Head is charged by ten accumulated seconds in bass, spent manually (button/B) for six seconds of bass immunity and double zone-spark points. Exposure builds over six seconds; leaving restores speed immediately and cools exposure over three seconds. Unspent charge carries between stages; no charging while active. Offer all available unowned perks, with persistent rave-experience unlocks deferred to the progression milestone. Endless-mode perk limits remain undecided. Local implementation is pending playtest/deployment.
2. **Visual identity.** Explore a handmade psychedelic forest-festival poster direction: playful display typography, readable score numbers, illustrated perk cards, festival signage menus, souvenir-ticket results and a dressing-tent wardrobe. Review a title/HUD/perk concept before applying it throughout. Verify phone readability and reduced motion.
3. **Music and concert lighting.** Prototype one stage's richer original arrangement and synchronized lighting, then extend to Living Forest (warm/spacious), Neon Grove (heavier/rhythmic) and Sunrise (bright/uplifting). Shared timing drives builds, drops, beams and speaker ripples. Decide whether sampled instruments/authored loops are needed after listening to the prototype. Verify pause, mute, reduced motion and phone performance.
4. **Wardrobe and achievement unlocks.** Proposed first collection: three onesies, three hats and four totems. Explore disco mushroom, moon, jellyfish lantern and speaker-stack designs. Start with achievement rewards, locked previews, progress and post-run reveals. Preserve starter outfits and existing saves; cosmetics have no permanent power advantage. Final artwork and achievement thresholds need design refinement.

Input labels can accompany a future results update. Currency/shop, more stages, endless mode, online boards and cross-device saves remain deferred. Candy timing and general bass escape tuning can wait; test correctness and regressions during each feature release. The existing stage targets remain 20/25/30.

This is the approved sequence, not a final implementation specification for every subsystem. Refine each larger milestone with a focused design and playable preview.

## Supporting history

- [Festival Run design](superpowers/specs/2026-09-25-festival-run-design.md): approved scope and intended rules for the shipped milestone.
- [Historical implementation plan](superpowers/plans/2026-09-25-festival-run.md): development breakdown, not a current backlog.
- [Validation evidence and limits](superpowers/festival-run-validation.md): automated/manual coverage and remaining device/balance checks.
- [README](../README.md): controls, mechanics, commands and publishing workflow.

## Forest Freakout local implementation — 2026-10-16

Built on `codex/forest-freakout`, not deployed: original title and four perk illustrations, forest menu backdrop, locally bundled fonts, themed HUD/supporting screens, and saved Festival Style preference. Surprise resolves once per new run; only Forest is complete. Moonlit and Neon remain labelled upcoming previews. Earlier uncommitted Bass Head work is preserved.

65 automated tests and production build pass. Browser checks cover desktop title/style/perks/HUD and stage/pause/settings/results/replay, phone title/perks, and short-landscape title/Quick Rush. See [visual QA](../design-qa.md) for evidence and limits. Next visual work: implement Moonlit and Neon using the registry, then richer music/reactive lighting. Candy feel tuning stays deferred.

## Moonlit Mycelium local implementation — 2026-10-16

Moonlit is now a completed selectable theme alongside Forest Freakout. It includes its own title, backdrop, four perk illustrations, masthead moth, midnight palette, silver borders, serif headings and readable sans-serif HUD numbers. Shared surfaces now use theme tokens; title preloading follows the active theme. Surprise chooses from both completed styles once per run. Neon remains the sole upcoming preview. Existing save and gameplay behavior is preserved.

66 tests pass; production build and desktop/portrait/landscape browser checks pass. Fixed-theme persistence, two-way switching, Surprise, stage/perk transitions, pause/settings, results/replay and Quick Rush were checked. Full evidence/limits are in `design-qa.md`. Still local and uncommitted with the prior Forest/Bass Head work; no release performed. Next theme: Neon Field Trip, then richer music/reactive concert lighting.

## Three-theme milestone complete locally — 2026-10-16

Neon Field Trip now joins Forest Freakout and Moonlit Mycelium as a selectable completed theme. New title, backdrop, four perk illustrations and masthead moth; acid lime/hot pink sticker cards and purple HUD/menu palette. All three saved choices switch immediately, and Surprise samples all three once per new run. No gameplay, scoring or audio changes in this pass.

68 tests, production build and browser checks pass; independent review found no issues. Visual evidence and coverage limits in `design-qa.md`. All theme/Bass Head work remains local on the existing feature branch, not deployed. Next agreed feature track: richer music and reactive concert lighting, then wardrobe/totem expansion and unlocks; candy feel tuning remains deferred.

### 2026-10-22 — Optional playtest tracking implementation

On `codex/playtest-tracking`: consent and persistent preferences; opt-in run/stage summaries; input labels; bounded transport; strict ingestion schema; private database migration, retention/reporting, and backend integration workflow. Public collection remains off pending owner Supabase setup, staged gateway/cron validation, and final data-notice details. The owner chose GitHub issues as the contact route. No arcade board implementation or publishing in this change. See `docs/online-operations.md` and the two 2026-10-20 plans.

Arcade board implementation: `codex/arcade-board`, separate online client and score counters, guest tickets, strict score validation, atomic receipts and private moderation. Backend deployed and hosted checks passed; production frontend rollout authorized. See `docs/superpowers/arcade-board-validation.md` for validation and remaining rollout checks.


## Music, lighting and progression release — 2026-10-28

Rave XP and six ranks now persist on-device, alongside six cumulative achievements. New players unlock expanded wardrobe pieces and two additional perk choices through play; existing profiles keep all previously available cosmetics/perks. Three new cosmetic flourishes (fireflies, stardust, prismatic aura) require earning for everyone, with locked previews and static reduced-motion rendering. Completed stages show XP/reward reveals; rehearsal awards no progression. Approved for release alongside the Living Forest music/lighting update. All 112 tests and the production build pass; final independent review found no blockers. Browser checks verified rank-up reward reveals, locked and unlocked wardrobe choices, flourish previews, and XP surviving reload. See [progression validation](superpowers/progression-validation.md) for rules, save limits and coverage.


## Stage atmosphere expansion — 2026-10-28

Neon Grove now has a minor-key bass/synth arrangement and faster pink/cyan crossing beams. Sunrise Clearing has major harmony, rising bell phrases, a gentle rolling groove and broader amber/rose fans. Both retain the shared 120 BPM clock, build/drop timing, optional Flow layers, pause/mute cleanup and static reduced-motion lighting. Living Forest remains the baseline show. Lighting is selected by stage, independently of the chosen menu theme.

115 tests and production build pass; independent review found no blockers. Rehearsal browser checks cover both stage transitions, Neon pause/resume and Sunrise rendering, with no console errors. Rehearsal does not award XP or save scores. Subjective audio mix, phone speakers and sustained phone performance still need playtesting. Approved for release after listening feedback; final review found no blockers.


## Local earned-perk expansion — 2026-10-28

Four new run-only perks unlock for all players through XP: Crowd Surfer at 300 (+25% movement for 1.2 seconds after a clean pass; refreshes, no stacking), Bass Battery at 650 (1.5× Bass Head charge rate), Encore at 1,200 (+3 seconds to first collected Flow per stage, additive with Moth), Sweet Tooth at 2,000 (all candy effects last 7 seconds). Grandfathering applies only to the previous four perks. New cards use procedural theme-coloured SVG art. Rehearsal exposes all eight choices without changing XP or score saves.

124 tests and production build pass. Coverage includes fresh/legacy unlock thresholds and reveals, timers, active Bass charge blackout/caps, first-Flow semantics, combo effects, valid new-perk score submissions and analytics ingestion. Battery analytics measure real charging time, not amplified charge units. Local only; release must deploy the updated `submit-score` and `playtest` function allowlists before publishing the frontend. No database migration or scoring arithmetic/version change is required. Phone controls and perk balance still need playtesting.


## Endless milestone one — 2026-10-29

Endless Festival cycles the existing stages indefinitely, with 60-second rounds. Spark targets start at 20/25/30 and gain 3 per loop up to 45. Crowd density gains 2 per loop up to 22; movement gains 8% per loop up to 20%. Additional anchors are deterministic and preserve cabinet/spawn clearance; stage generation is cached. Existing obstacles and music/lighting remain stage-specific.

After each clear, choose any earned unowned perk, or keep the build. Four active slots; at capacity, select a new perk then explicitly select what it replaces, with cancel. No duplicate stacking. Per-stage effects/shields reset normally; unspent Bass Head charge carries. XP saves after completed stages, including failed qualification. Existing achievement rules remain (an Endless loop does not grant the Festival completion achievement). Current runs are not recoverable after reload.

A separate local Endless top ten ranks clears before points and supports more than three clears. Saves migrate without changing Rush/Festival boards. No online ticket, submission or Endless analytics events are sent in this milestone; input classification remains local. Online Endless scoring/analytics need their own backend follow-up. Endless does not accumulate per-stage score records in memory.

132 tests and production build pass. Browser rehearsal covered six clears into loop 3, four perk acquisitions, swap cancellation/replacement, keeping a full build, failure results and no online-post control. A normal failed stage awarded XP, and its separate local score survived reload. Phone-sized title entry was checked. Final review found no remaining blockers after a crowd-placement fix. Real difficulty, long-session phone performance and reward pacing still require playtesting. Approved for release after local playtesting and final review.


## Online Endless board — 2026-10-29 (local implementation)

Endless now captures bounded scoring records, requests an online ticket when a connected run starts, and offers explicit initials-based posting after the final missed target. The separate online top 50 ranks stages cleared, then score, then receipt time/ID. Analytics remain disabled for Endless and sharing consent is unchanged. Local saves/offline runs still work. The existing 24-hour ticket applies; after1440 recorded stages the run continues with local saving but online posting is disabled.

Deploy migration `202610290001_endless_scores.sql` and the run-ticket, submit-score and leaderboard functions before frontend rollout. Keep arcade-v1 (award rules unchanged). Validator checks scaled goals, legal four-slot keeps/adds/swaps, earned multipliers and reconciled counters. Submit requests allow1MiB; ticket/board requests remain32KiB. No hosted deployment or public synthetic scores are part of this implementation step.

Acceptance:139tests and production build pass; independent review found no blockers. Browser ran a real60-second stage and posted TST against an in-memory PGlite database through the real HTTP handler/RPCs; Endless rows showed5clears/100points ahead of4clears/9999points. Rush tab remained separate. Desktop and390x844phone layout passed; no console warnings/errors. Screenshots in/tmp/endless-online-board-{desktop,mobile}.png (local test rows only). Deferred minor: final equal-receipt-time ID ordering exists in SQL but is not directly tested. Hosted migrations/Edge Functions and Pages rollout still pending.
