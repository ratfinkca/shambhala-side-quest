# Fullscreen, mobile controls and Quick Rush release

Updated 2026-11-13. The owner authorized PR, merge and publication after checks, with backend rollout first. Baseline is PR #21 / `6fd09f0`. The separate crowd-collision experiment is not part of this release.

## Scope

- SMF fullscreen play area, floating HUD, follow camera in both orientations, touch-origin joystick and simultaneous Bass Head activation.
- Keep tap/click, completed screen-relative swipe bursts and thumbstick, with saved sensitivity/hand/camera preferences, faster bursts and stamina. Progressive joystick sprint begins beyond the normal steering range. Shared controls also work in the generic game.
- Brief Flow/candy announcements; pause, rotation, recovery, bonus activities and protected stage-end confirmation remain intact.
- Quick Rush shuffles all six SMF venues with no immediate repeats and uses each authored phrase-length set (about 55–69 seconds). Selected venue survives recovery and score retries. Local bests and online boards are separate per venue; legacy Rush remains Pagoda.
- Optional SMF playtest summaries include selected movement style and Rush venue. Analytics remain opt-in and local saving stays separate from online posting.

## Local acceptance

710 tests pass; generic and SMF edition builds, asset allowlists and static references pass; invalid edition is rejected. Independent mobile and backend reviews found no actionable issues. Phone-sized browser checks in the implementation plan exercised portrait/landscape, safe rotation, recovered AMP at the same time, protected finish, local save, per-venue filtering and replay to Village. The owner previously accepted the fullscreen and three-control feel on an iPhone; the published generic and SMF builds have now passed public smoke verification.

## Backend first

Applied additive migration `202611130001_smf_rush_venues.sql` to project `hziafdynblkyxywythqg`, then deployed `smf-run-ticket`, `smf-submit-score`, `smf-leaderboard` and `smf-playtest` using the existing authenticated CLI. The session did not expose a Supabase MCP tool. Downloaded function sources match reviewed local files exactly.

Read-only hosted verification confirms both venue columns, migration history, RLS on all four private tables, service-role-only execution for new and old RPC overloads, and active `smf-maintenance` with its latest run succeeded. Live endpoint validation and frontend release status are recorded on the release PR after completion. Validation uses deliberately nonexistent tickets and invalid analytics payloads; it must not create synthetic production scores/events.

## Completed release checks

- [x] Harmless live endpoint validation: six venue boards, three legacy mode boards and generic Rush respond; exact-clock payloads with nonexistent tickets reach `invalid_ticket`, altered clocks and cross-mode venue fields fail validation, invalid analytics are rejected, allowed preflight and denied-origin checks pass. No synthetic production scores, tickets or events were created.
- [x] PR CI: [frontend tests/build](https://github.com/ratfinkca/shambhala-side-quest/actions/runs/43495342893) and [local Supabase integration](https://github.com/ratfinkca/shambhala-side-quest/actions/runs/43495341097) passed.
- [x] [PR #22](https://github.com/ratfinkca/shambhala-side-quest/pull/22) merged as `640098e5f1c5363fb8ad5162d15f72d93bda6c38`; [main build and Pages deployment](https://github.com/ratfinkca/shambhala-side-quest/actions/runs/43495735755) passed.
- [x] Public generic and `/smf/` UI and artifact checks: both serve the merged commit; all three movement options render; SMF per-venue boards load and preserve legacy scores. No relevant browser errors/warnings. No production run or score was created by this smoke check.

[The final PR](https://github.com/ratfinkca/shambhala-side-quest/pull/22) records the merged revision, CI/deploy URLs and public evidence. Native phone performance, installed iOS behavior and balance remain ongoing playtest input. Crowd collision is being tested separately in a local comparison preview, outside this release.
