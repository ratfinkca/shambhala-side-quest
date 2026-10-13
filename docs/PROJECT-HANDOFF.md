# Project handoff and roadmap

Updated 2026-10-13. This is the starting point for continuing development on another machine. Historical specs and plans describe shipped work; do not restart their unchecked task lists.

## Current release

- Public repository: https://github.com/ratfinkca/shambhala-side-quest
- Live game: https://ratfinkca.github.io/shambhala-side-quest/
- Festival Run shipped in [PR #2](https://github.com/ratfinkca/shambhala-side-quest/pull/2), merged as `4fb9fab`. The user accepted the preview, Pages deployment succeeded, and the live title/first-stage start were checked without console errors.
- Shipped: responsive arena, Quick Rush, three-stage Festival Run, stage obstacles/mud, four run-only perks, title/wardrobe/settings, procedural audio with independent volume controls, and separate local arcade top tens.
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
| Audio synthesis and beat definitions | `audio.js`, `music.js` |
| Responsive sizing and controls | `layout.js`, `input.js` |
| Development-only transition fixtures | `rehearsal.js` |

For meaningful rule changes, update the Node tests in `tests/`; run `npm test` and `npm run build` before a PR. The last release passed 46 tests. Phaser's bundle-size advisory is known. Browser-check affected flows, viewport sizes, pause/resume, persistence and console output. `/?rehearsal` on the dev server exposes stage qualify/fail fixtures with scoring disabled; it is excluded from production and cannot establish difficulty balance.

Open a PR against `main`. `.github/workflows/pages.yml` runs install/tests/build on PRs. Merging to `main` runs checks and deploys Pages; verify the deployment and live game before calling a release complete. Keep credentials and private festival data out of this public repository.

## Proposed next milestones

This sequence is a recommendation, not an approved implementation specification or dated commitment. Agree on scope before building a new milestone.

| Order | Milestone | Completion criteria |
| --- | --- | --- |
| 1 | Balance and device polish | Play normal three-stage runs with keyboard and real touch input; record spark totals, failed stages and collision friction. Check reduced-motion mode and subjective audio mix. Adjust targets/geometry only from evidence; keep Quick Rush working. |
| 2 | Persistent cosmetic rewards | Define how runs earn cosmetic rewards, then add an understandable unlock/store flow and versioned save migration. Existing starter outfits stay available; permanent rewards remain cosmetic so scores remain comparable. Currency name, prices and earning rates need design approval. |
| 3 | More replay variety | Design additional stage layouts, hazards and meaningful run perk choices; consider endless mode after the finite run is balanced. Establish difficulty scaling and scoring rules before implementation. |
| 4 | Shared arcade leaderboard | Choose backend/hosting, submission validation, abuse controls, initials moderation and privacy/cost expectations. Define how rule versions affect rankings. Current local boards remain usable if the service is unavailable. |

Suggested next task: conduct and document milestone 1 playtests, then propose a small evidence-based balance/polish change. Current raw spark qualification targets are 20/25/30, with crowd counts 10/14/18. Qualifying early does not end a stage; every stage runs for 60 active seconds. Rehearsal success is not proof these targets are balanced.

## Supporting history

- [Festival Run design](superpowers/specs/2026-09-25-festival-run-design.md): approved scope and intended rules for the shipped milestone.
- [Historical implementation plan](superpowers/plans/2026-09-25-festival-run.md): development breakdown, not a current backlog.
- [Validation evidence and limits](superpowers/festival-run-validation.md): automated/manual coverage and remaining device/balance checks.
- [README](../README.md): controls, mechanics, commands and publishing workflow.
