# M0 edition foundation — local validation

Date: 2026-11-06. Local feature branch only; public release remains PR #19 /67c44e0. User approved the edition design and native execution. No remote fork, deployment, backend mutation or dependency was added.

## Delivered preview

- Generic remains the playable three-stage game, with existing targets, deterministic variants, awards, four-slot Endless, score requests and recovery-v1 format. Its working title is Festival Side Quest; final neutral artwork is a later milestone.
- SMF is a separate static catalogue with six mains and all three requested secrets/parents. It has no playable placeholder, Phaser scene, audio initialization, consent prompt or online service initialization.
- Generic keeps the legacy profile and lock. SMF storage contexts and recovery practice are separate; SMF rejects generic recovery. No profile copy/reset migration is performed.
- Explicit asset lists serve/copy shared neutral artwork and reserve the three embedded Shambhala title posters for SMF. Unused concept boards are excluded from both builds.

## Automated/build checks

- Baseline: 207 tests passed before changes. Current suite: **221 tests pass**, including legacy geometry hashes for 15 Endless stages, unchanged score/recovery fixtures, storage/consent/lock names, exact pending-retry payload preservation, duplicate award/post protection, context rejection, asset lists and boot/service gating.
- `npm run build` passes (default generic, `dist/`). `npm run check:editions` builds generic and SMF, verifies allowlisted files/static references, and confirms an invalid edition fails. Existing large Phaser chunk warning remains.
- `git diff --check` and relative documentation links pass.
- No backend deploy is required for this local preview. Shared validator imports changed structurally; a future authorized release must deploy the updated shared function bundles first, even though arcade-v1 payloads/rules remain identical. No SQL migration is introduced.

## Browser acceptance

Browser plugin absent; no local Playwright package was available. Used the existing CUA in-app browser with its documented locator/screenshot controls, without installing packages. Tested desktop 1280×720 and phone-width 390×844. Temporary viewport override reset afterward.

| Check | Observed result |
|---|---|
| Page identity/content | Generic and SMF titles/content render; no blank page/framework overlay after initialization |
| Assets/console | No missing images in inspected generic view; no relevant console errors/warnings in inspected generic/SMF screens |
| Generic controls/recovery | Start Endless, click a destination, pause, reload → recovery displays 49s remaining; Resume run → paused screen, explicit resume required; discard confirmation works |
| Generic Festival | Rehearsal completed 20/25/30 targets, two perk choices and stage 3/3 results; score/XP disabled |
| Four-slot Endless | Disposable recovery lab restored four perks, replaced Moth with Crowd Surfer, continued to stage 6, banked five completed stages/4000 points |
| Save/reload | In the disposable recovery lab, entered M0A, saved locally, reloaded/reopened → saved initials/button preserved and one board entry; no second score/award |
| Sharing/themes | Normal local preview opt-in then opt-out reflected on title; consent persisted after reload; Moonlit selection persisted; local-only event receiver used, arcade disabled |
| SMF catalogue | Nine entries and three parent relationships, working anchor navigation, no canvas/buttons/gameplay; desktop and phone layout/scroll checked |
| Phone width | SMF and generic at 390 CSS pixels, no horizontal overflow in inspected views; no physical touch claim |
| Same-origin isolation | Automated map-backed tests prove disjoint profile keys, legacy migration, recovery rejection, lab reset and exact lock names; UI previews use separate ports, so browser-origin collision was not independently exercised |
| SMF service requests | Unit tests prove configured endpoints cannot enable either service and boot never invokes game loader; CUA has no network capture here, so there is no separate browser network-trace claim |

A layout defect found during QA (the game shell flex-shrank the SMF hero to 2px) is fixed by a scaffold-specific flowing shell class, with setup/cleanup tests and rendered height/phone checks. Gameplay shell styles remain unchanged.

Screenshots: `/tmp/edition-smf-desktop.jpg`, `/tmp/edition-smf-mobile.jpg`, `/tmp/edition-generic-mobile.jpg`, `/tmp/edition-generic-saved-score.jpg`. These are local QA artifacts, not published assets.

## Limits and next gate

Physical phones, native touch, sustained device performance, audible music acceptance and production online posting were not tested in this milestone. Static catalogue entries are not completed SMF levels. A fresh whole-branch review follows; release/public acceptance would be separate and requires an explicit ship instruction. Next program milestone is M1: dated research briefs for all nine venues and agreed SMF gameplay/music rules.
