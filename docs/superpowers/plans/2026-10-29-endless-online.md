# Online Endless Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Explicit initials-based Endless posting and a survival-first public board.
**Architecture:** Extend existing ticket/submit/leaderboard functions and UI. Add a schema migration without changing existing board behavior.
**Tech Stack:** Vite, Phaser, JavaScript, Supabase Edge Functions, Postgres.
**Spec:** docs/superpowers/specs/2026-10-29-endless-online-design.md

## Global Constraints
- Four distinct perks; optional keep, add one below four, swap one at four.
- Stages cleared descending, points descending, server time ascending, ID ascending.
- 24-hour tickets;1440 recorded stages maximum;1MiB submit limit;32KiB other endpoints.
- No analytics consent changes, accounts or gameplay changes.

## Review Focus
- Tampered clears, final qualified stages, perk jumps, swaps and count mismatches must fail.
- Large histories must stay bounded without breaking local gameplay.
- Existing boards and permissions must survive migration.
- Late asynchronous board responses must not replace selected mode.
- Offline/expired/failed posting must retain local score and exact retry behavior.

### Task 1: Score records and validation
Files: src/run.js; supabase/functions/_shared/{score,arcade}.js; tests/{endless,score-validation,score-http}.test.mjs.
Interfaces: existing scoreStages array becomes available for Endless; validateScore accepts ended Endless payloads only.
- [x] Add failing tests for real kept/swapped run histories, scaling, malformed histories and bounds; run node --test tests/score-validation.test.mjs tests/score-http.test.mjs tests/endless.test.mjs.
- [x] Capture bounded history; validate legal transitions, final failure and scaled targets; increase submit-only body bound.
- [x] Run same tests and full npm test. Expect all pass.

### Task 2: Database ranking
Files: new supabase/migrations/202610290001_endless_scores.sql; tests/score-db.test.mjs; supabase/tests/scores.sql.
Interfaces: arcade_ticket accepts endless; arcade_board returns same public fields in mode-specific order.
- [x] Write failing migration/ranking/permissions/retry tests; run node --test tests/score-db.test.mjs.
- [x] Add migration, partial ranking index and replace RPCs; preserve service-role grants.
- [x] Run database tests and full suite; expect all pass.

### Task 3: UI and acceptance
Files: src/main.js; src/screens.js; src/theme-screens.js; src/online/view.js; tests/online-submission.test.mjs; README.md; docs/PROJECT-HANDOFF.md.
Interfaces: existing createSubmission and createBoard handle Endless with same explicit post/retry semantics.
- [x] Write failing Endless view/client tests; run node --test tests/online-*.test.mjs.
- [x] Enable tickets/posting and Endless tab; clear survival-first wording and history-limit state.
- [x] Run npm test, npm run build and git diff --check; verify desktop/mobile browser tab switching and results with local backend test transport.
- [x] Fresh whole-branch review; fix blockers. Leave ready for review; no PR/merge/frontend publish until requested.
