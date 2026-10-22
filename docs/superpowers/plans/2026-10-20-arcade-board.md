# Arcade Board Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add casual, initials-based online scores while preserving local and offline play.

**Architecture:** A public guest endpoint issues opaque run tickets; validated submissions atomically consume a ticket and create a score. Public reads return only display fields. This plan follows the playtest plan but score submission never depends on analytics consent.

**Tech Stack:** Existing Phaser/Vite/JavaScript, Node tests, Supabase Postgres/Edge Functions.

**Spec:** `docs/superpowers/specs/2026-10-20-playtest-online-design.md`

## Global Constraints

- “Score posting works without analytics consent.”
- “Show separate Quick Rush and Festival boards, initially the top 50 entries for the current scoring rules.”
- “Initials are a display name, not a unique identity; multiple entries per person are permitted initially.”
- “Do not split boards by input yet.”
- “Retries are idempotent: the same run and payload return the original outcome; conflicting resubmissions are rejected.”
- “Rank by score descending, stages cleared descending, then server receipt time ascending.”
- “No purchase or external project creation is implied by this document.”
- No accounts, automatic offline publication, or claim of cheat-proof scores.

## Review Focus

- A ticket response arriving after replay must not attach to the new run (Task 1).
- Concurrent duplicate submissions must create one score (Task 2).
- A long pause must not be mistaken for cheating, while expired tickets are explained (Tasks 1–3).
- A lost success response must be recoverable by explicit retry (Tasks 2–3).
- Untrusted initials/fields and a stale board response must not corrupt rendering or the selected mode (Task 3).

## File boundaries

Create `src/online/client.js`, `src/online/submission.js`, `src/online/version.js`; reuse config and local score metadata from the tracking plan. Create server `run-ticket`, `submit-score`, `leaderboard` function folders; shared validation in `_shared/score.js`; private database tables/mutations in a separate migration. Keep UI integration in existing screens/main and extend local score normalization.

## Task 1: Guest run tickets and race-safe client lifecycle

**Files:** create `src/online/client.js`, `src/online/submission.js`, `src/online/version.js`, `tests/online-client.test.mjs`, `supabase/functions/run-ticket/index.ts`; modify `src/main.js`; create `supabase/migrations/202610200002_scores.sql`.

**Interfaces:** `createOnlineClient({baseUrl,fetch,timeoutMs:5000})` exposes `startRun({runId,mode,scoringVersion,buildId})`, `submitScore(payload)`, `getBoard({mode,scoringVersion})`. Each returns `{ok:true,data}` or `{ok:false,code}`. `createSubmission(runId)` holds ticket/result/pending state for exactly one run.

- [ ] Write failing tests for missing config, ticket timeout, stale response after replay, malformed server response, and no analytics consent. A failed ticket request never blocks stage start or is retried after play has begun.
- [ ] Run `node --test tests/online-client.test.mjs`; confirm failure.
- [ ] Implement immutable scoring version `arcade-v1` and separate build ID from CI revision. Request a ticket when the first stage actually begins, not while Festival instructions are open; play starts immediately. Pending requests are bound to the run ID.
- [ ] Implement server-generated 256-bit random opaque ticket, storing only its hash plus issued time/mode/version. Expire after 24 hours to permit ordinary pauses; client must explain expiry. Rate limit ticket issuance to 60/hour per rotating network hash using the prior plan's limiter.
- [ ] Run focused tests; add database tests proving no direct anonymous ticket-table access.
- [ ] Commit: `feat: add guest online run tickets`.

## Task 2: Score validation and atomic submission

**Files:** create `supabase/functions/submit-score/index.ts`, `supabase/functions/_shared/score.js`, `tests/score-validation.test.mjs`, `supabase/tests/scores.sql`; extend the score migration; modify `src/game.js`, `src/festival.js` and local summary collection as needed for score components.

**Interfaces:** `validateScore(payload,ticket) -> {ok:true,record}|{ok:false,code}`. Payload contains run/ticket, initials, mode/version/build, input label, stage summaries and total score. It excludes analytics identity, theme history, and menu activity.

- [ ] Write tests for `[A-Z0-9]{3}`, safe nonnegative integers, allowed modes/input types, unsupported versions, wrong ticket, and impossible stage order/perk selections.
- [ ] Add fixtures for a one-stage Rush, failed Festival stage, full three-stage Festival, and long wall-clock pause with valid active duration. Every finished stage has 60,000 active milliseconds; progression uses the existing 20/25/30 spark targets.
- [ ] Add tests tying claimed score components to current formulas: spark points sum from counts by multiplier 1–5/drop 1–2/Bass Head 1–2; close-pass points use 15 or 25 with drop 1–2. Award-derived counts and totals must agree. Counts remain untrusted and cannot prove movement legitimacy.
- [ ] Run `node --test tests/score-validation.test.mjs`; confirm failures.
- [ ] Implement validator and component counters without changing point awards. Check server elapsed time permits claimed active duration with a 5-second tolerance; long pauses are allowed within ticket expiry. Do not invent a strict pickup cap unsupported by geometry/spawn behavior.
- [ ] Implement transaction/RPC locking the ticket row: compare a canonical payload hash for exact retries, reject conflicting reuse, insert one score with server receipt time. Permit successful retry receipts after ticket expiry; prohibit new submissions after expiry. Rate limit submissions to 120/hour per rotating network hash.
- [ ] Run Node tests and `supabase test db`; exercise simultaneous submissions, lost response retry, expiry, direct table/RPC access denial, and score tampering.
- [ ] Commit: `feat: validate and store arcade scores atomically`.

## Task 3: Public boards and explicit posting UI

**Files:** create `supabase/functions/leaderboard/index.ts`, `tests/online-submission.test.mjs`; modify `src/screens.js`, `src/main.js`, `src/profile.js`, `tests/screens.test.mjs`, `tests/profile.test.mjs`; extend backend tests.

**Interfaces:** `getBoard` returns up to 50 records containing only initials, score, stagesCleared, inputType, mode, scoringVersion, receivedAt. `createSubmission` supports ready/pending/succeeded/error/ineligible states; local and online submitted flags remain separate.

- [ ] Write failing tests for local saving followed by online posting, declining analytics plus successful posting, pending-button duplicate prevention, retry after lost response, expired/unavailable ticket explanations, and older local entries defaulting input label to unknown.
- [ ] Test public-field allowlists, deterministic tie ordering, filtered scoring versions, malicious display strings, and ignoring a late Rush response after switching to Festival.
- [ ] Run `node --test tests/online-submission.test.mjs tests/screens.test.mjs tests/profile.test.mjs`; confirm failures.
- [ ] Implement an explicit public-data preview and Post online action. Preserve local submission independently; failure shows Retry with no automatic background publication. Keep ticket only in memory and never in URLs or local saved scores.
- [ ] Implement Rush/Festival board tabs with loading/empty/error states, escaped text, 50-entry cap, 30-second public read cache, and stable tie ordering (server ID final tie-breaker). Add no account or unique-name checks.
- [ ] Add owner-only hide/unhide SQL instructions; hidden scores disappear publicly. Keep administrator credentials outside the client. Purge expired unsubmitted tickets daily; retain accepted-score receipts for idempotency without exposing their hashes.
- [ ] Run focused tests plus backend tests; verify score-only requests create no analytics rows.
- [ ] Commit: `feat: add online arcade board and posting flow`.

## Task 4: Release verification

**Files:** extend `docs/online-operations.md`, `README.md`, `docs/PROJECT-HANDOFF.md`, `.github/workflows/pages.yml`; create `docs/superpowers/arcade-board-validation.md`.

- [ ] Document scoring-version rollover, older-board access by version, rate limits, moderation, ticket expiry, and casual-board trust limits. Confirm all frontend configuration is public and privileged values remain server-only.
- [ ] Run `npm test`, `npm run build`, `supabase db reset`, and `supabase test db`; require all checks pass.
- [ ] Browser-test desktop and mobile: play with tracking declined, save locally, post once, retry lost-response simulation, switch modes, check mixed-input label, offline fallback, expired ticket, and keyboard focus in all three themes. Verify rehearsal makes no production request.
- [ ] Deploy backend to staging using the owner setup from the tracking plan. Verify malicious/expired/duplicate requests, private table denial, public response fields, and moderator hide/unhide using synthetic records.
- [ ] Record evidence and any gaps. Prepare PR; ship only when instructed. Deploy compatible backend before enabling frontend endpoints; verify the Pages release and one consent-declined score submission end to end.
- [ ] Commit: `docs: record arcade board validation and operations`.

## Execution choice

Recommended: native execution in this session, following the tracking plan first, with an independent whole-branch review before release. The tasks share lifecycle and transport contracts; sequential execution keeps those consistent. Subagent-driven task-by-task implementation/review is also available at greater context cost.

Before implementation, the user reviews both plans and selects the execution approach. Hosted setup inputs remain explicit prerequisites to staging/public rollout, not a reason to stop local implementation.
