# Optional Playtest Tracking Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Collect useful, optional playtest summaries without disrupting play or collecting pointer streams.

**Architecture:** Pure summary collection feeds a consent-gated, bounded transport. Server functions validate batches and store private events; private SQL reports summarize them. This deliverable works independently of the arcade board.

**Tech Stack:** Existing Phaser/Vite/JavaScript and Node test runner; Supabase Postgres and Edge Functions. No browser Supabase SDK required.

**Spec:** `docs/superpowers/specs/2026-10-20-playtest-online-design.md`

## Global Constraints

- “The default is off; play is never gated.”
- “Do not collect retroactively.”
- “Turning it off immediately clears unsent analytics and stops further collection.”
- “Do not attach public initials to analytics.”
- “Initial retention proposal: delete raw playtest data after 30 days; retain aggregate counts without installation/session IDs.”
- “Rehearsal mode must never submit production scores or analytics.”
- No gameplay/scoring changes, near-miss visuals, accounts, or custom dashboard.
- Keep existing Node 24 workflow and local profile compatibility.

## Review Focus

- Consent revocation while a request is pending must prevent retries; a request already received cannot be recalled (Task 3).
- Storage blocked or corrupted must not block play or silently opt players in (Task 1).
- Late events from a previous run must not contaminate a replay (Task 2).
- Pauses/tab hiding must not become fabricated active time or deliberate exits (Task 2).
- Replayed network batches must not inflate reports (Task 4).

## Files and boundaries

Create `src/playtest/consent.js`, `summary.js`, `transport.js`, and `src/online/config.js`; extend existing profile/storage, scene, crowd, and main wiring only where needed. Keep measurement math outside rendering.

Create `supabase/config.toml`, migrations under `supabase/migrations/`, `supabase/functions/playtest/index.ts`, shared validation modules under `supabase/functions/_shared/`, and `supabase/reports/playtest.sql`. Add `docs/online-operations.md` and `.env.example` with public configuration only.

## Task 1: Persist consent without losing existing saves

**Files:** modify `src/profile.js`, `src/storage.js`, `src/screens.js`, `src/main.js`; create `src/playtest/consent.js`, `tests/consent.test.mjs`; extend `tests/profile.test.mjs`, `tests/storage.test.mjs`, `tests/screens.test.mjs`.

**Interfaces:** profile adds `playtestConsent: 'unknown'|'accepted'|'declined'`; storage adds `savePlaytestConsent(value) -> {accepted,persisted}`. `createConsent({storage,uuid})` exposes `set(value)`, `enabled()`, and `identity()` (null unless accepted).

- [ ] Write failing tests: legacy profile keeps boards/audio/theme/outfit and defaults to unknown; malformed consent defaults unknown; declining creates no ID; accepting creates one ID; opting out removes it; blocked storage preserves the choice only in memory.
- [ ] Run `node --test tests/consent.test.mjs tests/profile.test.mjs tests/storage.test.mjs tests/screens.test.mjs`; confirm new assertions fail.
- [ ] Implement normalization and persistence. Keep profile version 1 compatible with optional fields. Add a non-blocking invitation and settings control, equally clear accept/decline actions, plus an explanation of collected summaries and 30-day retention.
- [ ] Run the same command; require all assertions pass. Check keyboard focus and copy in the rendered UI.
- [ ] Commit only this task's files: `feat: add optional playtest consent`.

## Task 2: Measure actual gameplay at existing lifecycle boundaries

**Files:** create `src/playtest/summary.js`, `tests/playtest-summary.test.mjs`; modify `src/GameScene.js`, `src/Crowd.js`, `src/festival.js`, `src/main.js`; extend `tests/festival.test.mjs`.

**Interfaces:** `createRunSummary({runId,mode,buildId,scoringVersion})` exposes `record(type,payload)`, `finishStage(stageIndex)`, `snapshot()`. Input classification independently exposes `recordInput(kind)` and `inputType()` with mouse/touch/keyboard/mixed/unknown; score summaries may use this without analytics consent.

- [ ] Write failing tests for deduplicated stage completion, ignored stale run IDs, paused time excluded, explicit exit versus page hiding, and touch followed by keyboard becoming mixed. Menu clicks never classify gameplay input; no action gives unknown.
- [ ] Add encounter tests: a clean swept pass returns its minimum clearance from the existing 27-unit collision boundary; spoiled passes never populate clean-pass histograms. Existing close-pass awards and thresholds remain unchanged.
- [ ] Run `node --test tests/playtest-summary.test.mjs tests/festival.test.mjs`; confirm new tests fail.
- [ ] Implement a separate opt-in analytics collector and always-local score metadata. Analytics starts only for runs begun after acceptance (mid-run acceptance applies next run). Aggregate clearances into `[0,7)`, `[7,14)`, `[14,21]` world-unit bins, with a minimum and count; never upload coordinates.
- [ ] Wire accepted target taps, active keyboard movement, successful Bass Head actions, contact-start bumps, completed encounters, pickups, perk picks, candy types, Flow activations, and active bass milliseconds. Capture current/resolved theme, viewport class (<600, 600–999, >=1000 CSS pixels), peak combo, and earned charge deltas. Do not count held keys or ongoing collisions as repeated actions.
- [ ] Run focused tests plus `npm test`; require existing scoring tests unchanged and passing.
- [ ] Commit: `feat: collect bounded run summaries`.

## Task 3: Consent-gated delivery and network isolation

**Files:** create `src/playtest/transport.js`, `src/online/config.js`, `tests/playtest-transport.test.mjs`, `.env.example`; modify `src/main.js`.

**Interfaces:** `createPlaytestTransport({send,consent,clock})` exposes `enqueue(event)`, `flush()`, `stop()`. Events have `schemaVersion:1`, UUID `eventId`, installation/session/run IDs where applicable, an allowlisted type, and allowlisted payload. `readOnlineConfig(env)` returns disabled if endpoint configuration is absent.

- [ ] Write tests: no consent means no queue or requests; cap queue at 100 events, batches at 20 events/32 KiB; overflow drops oldest; revoke clears queue and invalidates pending retry; failed requests get at most one retry on a later flush; disabled config/rehearsal sends nothing.
- [ ] Run `node --test tests/playtest-transport.test.mjs`; confirm failure.
- [ ] Implement injected fetch with a 5-second timeout and no persistent queue. Flush at stage boundaries and every 30 seconds while active; page hiding is best effort only. Abort on opt-out and do not treat abort as proof the server did not receive data.
- [ ] Add allowlisted menu events for instructions opened/theme selected, plus run start, stage start/end, run end, explicit exit, replay. Reject arbitrary strings/payload fields before enqueue.
- [ ] Run focused tests; require all pass and no network request inside the scene update loop.
- [ ] Commit: `feat: add consent-gated playtest delivery`.

## Task 4: Private ingestion, retention, and reports

**Files:** create Supabase config, `supabase/migrations/202610200001_playtest.sql`, `supabase/functions/playtest/index.ts`, `_shared/playtest.js`, `_shared/http.js`, `tests/playtest-ingest.test.mjs`, `supabase/tests/playtest.sql`, `supabase/reports/playtest.sql`.

**Interfaces:** `validatePlaytestBatch(body) -> {ok,events}|{ok:false,error}`; endpoint POST `/playtest` accepts Task 3 envelopes and returns accepted event IDs. Database unique event IDs make retries idempotent.

- [ ] Write failing Node tests for schema allowlists, oversized bodies, invalid IDs/types, non-finite numbers, and rejected initials/coordinates. Add database tests for duplicate IDs and denied anonymous reads/writes.
- [ ] Run `node --test tests/playtest-ingest.test.mjs`; confirm failures.
- [ ] Implement private raw events with RLS and no public grants. Edge handler uses server-only credentials, explicit production/development origin allowlists, POST/OPTIONS only, and request limits. Do not log request bodies or raw IPs.
- [ ] Add atomic rate limiting: at most 120 ingestion requests per hour per rotating keyed hash of network address, purged after 24 hours. These are abuse controls, not player identities; document host-provided request metadata and logging limitations.
- [ ] Add daily idempotent aggregate generation and retention cleanup. Aggregate by day/mode/input/scoring version without installation/session/run IDs; preserve sample sizes and unknown completions. Scheduled cleanup removes raw events older than 30 days and old rate-limit buckets.
- [ ] Implement private report queries for stage completion, explicit exits, unknown completions, replay events, near misses versus bumps, perk selection, and Bass Head use. Do not label replay-event counts as unique-player retention.
- [ ] Run Node tests, `supabase start`, `supabase db reset`, and `supabase test db`; require all pass. Verify the scheduled cleanup and aggregate rerun are idempotent using dated fixtures.
- [ ] Commit: `feat: add private playtest ingestion and reports`.

## Task 5: Staging verification and release readiness

**Files:** create `docs/online-operations.md`; modify `.github/workflows/pages.yml`, `README.md`, `docs/PROJECT-HANDOFF.md`; create `docs/superpowers/playtest-validation.md`.

- [ ] Check Supabase CLI/container-runtime availability and current official Edge Function deployment/auth documentation before installing tools. Use no-login public endpoints with explicit server validation, not an embedded privileged key.
- [ ] Document owner-controlled project setup, region/cost review, secure credentials, public endpoint configuration, log retention, scheduled cleanup, and a kill switch. Missing service configuration keeps the local deliverable usable with collection disabled.
- [ ] Obtain the owner's project/environment details and public contact address before provisioning or enabling public collection. These are rollout inputs, not prerequisites to Tasks 1–4.
- [ ] Add Node validation tests to existing CI; add an isolated local Supabase integration job with no production secrets. Keep public builds disconnected until staging passes.
- [ ] Run `npm test`, `npm run build`, and database integration tests. Browser-check desktop/mobile consent, decline, opt-out while pending, pauses, replay, offline behavior, and unchanged gameplay. Record observed results and coverage gaps.
- [ ] Populate the data notice and verify real staged ingestion, private access boundaries, reports, and cleanup. Record only synthetic test records; remove them after verification.
- [ ] Commit the validated work. Prepare PR/release notes; production release requires the user's shipping instruction. After release, verify Pages and ingestion with consent, then verify decline generates no analytics.

## Handoff

Execute this plan first. Continue with `2026-10-20-arcade-board.md` after this deliverable is verified. Hosted blockers must not be reported as completed; the local work can still be reviewed independently.
