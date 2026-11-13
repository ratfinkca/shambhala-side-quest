# Crowd, friendship and season release

Updated2026-11-13. The owner accepted the preview and authorized PR, merge and publication after checks, with backend updates first. Baseline:PR#22 / `640098e`.

## Scope

- Shared player/NPC collision in generic and SMF main/bonus gameplay; NPC paths remain independent and may overlap. Each floor mixes combined contact radii18/26/34. Existing crowd counts grow by stage and Endless revisit, capped at22.
- Four clean passes with a specific dancer shrink that dancer's contact radius to zero. Friendship adds no score bonus, survives pause/recovery/control changes, and resets with each stage/visit. Nearby rings, progress dots, hearts and brief reactions explain interactions.
- New runs pin `arcade-v2` / `smf-v2`; Original season boards, local bests, tickets, checkpoints and frozen retry payloads remain separate and valid. Saved v1 runs retain pass-through rules. Results open their own season's board.
- Villagio uses one consistent walking/crowd/snapshot clock. Putting suspends hidden crowd interaction and clears its transient marks; returning does not replay historical crowd motion. Music wraps preserve remaining cooldown and learned friendship.
- The isolated collision comparison remains DEV-only. No new dependencies or art changes.

## Verification

- Local tests:822/822 passed. Both edition builds, asset allowlists and static references passed; invalid edition rejected. Independent backend/frontend reviews found no remaining blockers.
- Preview acceptance: owner approved. Browser checks covered SMF portrait390×844, landscape844×390, generic desktop1280×800, all three controls, pause/rotation/recovery, protected stage finish, isolated local saving, season selection and a successful Villagio putt/return to walking. No relevant console errors. Real-device balance/performance remains ongoing playtest input.
- Backend first: migration `202611130002_scoring_seasons.sql` dry run selected only that file; it was applied to `hziafdynblkyxywythqg`. Deployed `run-ticket`, `submit-score`, `leaderboard`, `playtest` and all four `smf-` equivalents through the existing authenticated CLI.
- Hosted checks passed: all reachable downloaded function sources exactly match the reviewed release; both seasons/all modes and six SMF Rush venues respond with partitioned boards. Valid synthetic payloads with verified nonexistent tickets reach `invalid_ticket`; altered clocks/unsupported versions/invalid analytics and denied origins are rejected. No production ticket, score or analytics event was created.
- Read-only SQL confirms the migration, both ticket allowlists, original wrapper signatures, version/venue board partitions, 15 service-role-only function signatures, 10 protected private tables, retained accepted receipts and four active cleanup jobs with successful latest runs.
- PR checks, merge, Pages deployment and public UI/artifact verification are recorded on the release PR as they complete.

## Delivery tracking

Frontend publication follows successful hosted verification and PR checks. The final PR description records the exact merged revision, workflow URLs and public acceptance evidence. Backend deployment alone is not proof that the new frontend is live.
