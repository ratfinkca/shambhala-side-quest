# Project handoff and roadmap

Updated 2026-10-14. This is the starting point for continuing development on another machine. Historical specs and plans describe shipped work; do not restart their unchecked task lists.

## Current release

- Public repository: https://github.com/ratfinkca/shambhala-side-quest
- Live game: https://ratfinkca.github.io/shambhala-side-quest/
- Festival Run originally shipped in [PR #2](https://github.com/ratfinkca/shambhala-side-quest/pull/2), merged as `4fb9fab`. The user accepted the preview, Pages deployment succeeded, and the live title/first-stage start were checked without console errors.
- Shipped: responsive arena, Quick Rush, three-stage Festival Run, stage obstacles/mud, four run-only perks, title/wardrobe/settings, procedural audio with independent volume controls, and separate local arcade top tens.
- Gameplay update: click/tap destinations (no hover or drag steering), organic polygon mud, staggered speaker clusters, circular bass slowdown zones with beat-synced visual vibration, and rare wrapped candy with temporary effects. See [gameplay validation](superpowers/gameplay-update-validation.md) for evidence and limits.
- Not implemented: currency, shop, permanent cosmetic rewards, endless mode, online rankings or cross-device saves.

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
