# Prism Party integration and release plan

> **For agentic workers:** Use subagent-driven development with the ownership boundaries below. The owner approved integrating the accepted preview and publishing it.

**Goal:** Add Fractal's optional Prism Party to Festival/Endless, with consumed invitations, safe recovery and a permanent Prism Crown, then PR, merge and verify the published game.

**Architecture:** Reuse the accepted Prism state/view in the existing SMF bonus lifecycle. Keep its musical activity clock separate from the main run and loop its original Fractal music. Add a device-local souvenir; no main-run scoring or season change.

**Tech stack:** Existing Phaser/Vite modules, local profile validation, Node tests, GitHub Pages.

**Spec:** [Accepted preview](2026-11-13-fractal-prism-preview.md) plus the user's instruction to integrate and push it out.

## Constraints

- Keep the six-main-stage route, all modes, controls, pause/resume and other bonuses.
- Hide secret identity before discovery. Fractal invitation is collected during play and offered after qualification; entering consumes it, including on later Endless loops.
- Three faces, 3 seconds of driven movement per face, 8-second musical cues, retained progress and 3.5-second finale. No bonus countdown or leaderboard contribution.
- Permanent reward is an edition-owned pixel Prism Crown; leave existing aura ownership unchanged.
- Recover a valid mid-stage/celebration snapshot paused. Reject inconsistent or malformed snapshots without corrupting the main run.
- Keep the disposable development preview, generic build isolation and opt-in analytics.
- Deploy backend changes before frontend only if the integration changes backend contracts.

## Work and ownership

- [x] State/recovery: Prism capture/restore, bonus metadata, profile validation, catalogue metadata and focused tests. Agent owns model/store/Prism state and these tests.
- [x] Scene: shared Prism configuration/controller, renderer hookup, ramp clipping, continuous musical clock, events, camera cleanup and focused scene tests. Agent owns content/config/scene and tests.
- [x] Cosmetic: fitted pixel Prism Crown and reduced-motion rendering, artwork delivery format and view support. Agent owns souvenir view, Prism art/view and focused tests.
- [x] UI/local acceptance: bonus HUD/instructions/result copy, hidden map/wardrobe presentation, build isolation/docs, actual playtest and independent review. Root owns these files and release operations.
- [ ] Hosted release: PR CI, merge, Pages deployment and public smoke check; record final evidence on the PR.

## Review focus

- Entry/exit and reload around the final Fractal stage summary must preserve main points, pending perks and consumed invitation.
- No permanent prize for early exit or an uncompleted visit; duplicate completion is idempotent.
- Restarted or paused music must agree with face cues; long visits must not time out at 64 seconds.
- Returning to a normal venue must remove the pyramid movement bounds and camera focus.
- Portrait/landscape, all movement choices and old five-bonus profiles remain usable.

## Local release verification

- 1,016 tests pass, including actual scene/store round trips, finale recovery, legacy profiles, consumed invitations, repeat rewards and generic isolation. Both editions and combined Pages build pass.
- Independent review found a subpixel floor-clipping case that rejected valid saves; corrected in preview and production, with a regression test.
- Browser playtest used disposable tour saves: Fractal invitation/offer, actual movement charging all three faces, reload after one completed face (paused, 1/3 preserved), full finale and Crown unlock. Returning preserved 470 main points and the perk choice, consumed the offer and continued into Grove with the crown fitted to the player.
- No Supabase/function/schema changes; no backend rollout, score-season reset, production test scores or telemetry writes are needed.
- Integrated portrait (390×844) and landscape (844×390) layouts checked, including safe rotation pause, ramp entry, instructions and cue HUD. No browser errors observed.
- Physical iPhone comfort/performance remains owner feedback. PR CI, merge, Pages deployment and public smoke verification are separate release gates to record on the PR.
