# Online operations

Updated 2026-11-13. Current architecture/configuration is described here; live health is verified at release time, not guaranteed by this document. [Handoff](PROJECT-HANDOFF.md) · [roadmap](ROADMAP.md) · [historical hosted checks](history/online-operations-through-2026-10-22.md).

## Production and ownership

GitHub Pages serves the static game at https://ratfinkca.github.io/shambhala-side-quest/; allowed origin is https://ratfinkca.github.io. Supabase project `hziafdynblkyxywythqg` hosts the backend in East US/North Virginia. Public playtest configuration and arcade configuration are enabled in the released game; analytics still require explicit player consent. Arcade posting does not require analytics consent. M1 shipped in PR #14 with Endless analytics. M2 extends stage-start/end events with an optional allowlisted variationId; older schema-2 payloads remain valid. Deploy playtest and shared/variations.js before the M2 frontend; no SQL migration is required. Its migration and playtest function were deployed before frontend rollout; see [release evidence](superpowers/m1-release-validation.md). PR #13 /8b5192f is the prior verified gameplay baseline.

No secrets in frontend code, Git, reports or chat. Supabase server-side environment supplies the service role; clients receive public endpoint configuration only. Use project-scoped MCP tools if exposed, otherwise authenticated pinned CLI 2.121.0. Never reset a hosted project. No routine browser login is needed when authenticated management tools work.

## Functions and storage

| Function | Responsibility |
|---|---|
| playtest | Strict schema/CORS/body validation, best-effort rate limiting, private ingestion |
| run-ticket | Opaque24-hour score capability; only its hash is stored |
| submit-score | Validate counters/targets/perks and ticket binding; atomic idempotent receipt |
| leaderboard | Mode/version-filtered public top 50 with limited public fields |

`playtest_private` holds raw events, rotating network hashes and identifier-free daily metrics. `arcade_private` holds tickets, score claims, moderation state and limits. Both have RLS and denied anon/authenticated direct access; server-owned RPC execution is service-role only. Neither private schema is exposed through the public API.

Shipped migrations:202610200001/2 (analytics/maintenance),202610220001/2 (arcade/maintenance),202610290001 (Endless tickets/ranking). The finish/save release required validators only. M1 adds migration202611030001 (Endless outcome/choice metrics), applied before its playtest function/frontend.

## Configuration

Frontend Pages variables:

- `PLAYTEST_ENABLED=true`, `PLAYTEST_URL=https://hziafdynblkyxywythqg.supabase.co/functions/v1/playtest`, `PLAYTEST_NOTICE_URL=https://ratfinkca.github.io/shambhala-side-quest/playtest-data.html`.
- `ARCADE_ENABLED=true`, `ARCADE_URL=https://hziafdynblkyxywythqg.supabase.co/functions/v1`.
- Workflow maps these to `VITE_*`; `VITE_BUILD_ID` is the GitHub commit. Local env uses the VITE names directly.

Server: separate `PLAYTEST_ORIGINS`/`PLAYTEST_RATE_SECRET` and `ARCADE_ORIGINS`/`ARCADE_RATE_SECRET`. Supabase supplies URL/service-role values. CORS is not authentication and cannot distinguish repositories sharing the Pages origin. Rotating network hashes/rate limits are best-effort abuse controls, not player identity or authoritative anti-cheat.

## Consent, bounds and retention

Analytics default off; title/settings control sharing. Accepting mid-run starts measurement next run; opting out stops measurement, removes the browser identifier and clears/aborts queued work. No names, emails, arcade initials, pointer recordings or screenshots enter analytics. No durable/replayed analytics queue. Existing transport caps:100 events,20 events/32 KiB per batch,5-second timeout and one retry on a later flush; ingress120 requests/hour per rotating bucket.

Analytics raw events remain private for29–30 days; daily cleanup deletes whole UTC days beyond the cutoff. Aggregates can persist without browser/run/session IDs. Hash cleanup is hourly, roughly24–25 hours. `maintain_playtest()` runs daily 00:10 UTC; hourly cleanup at minute 10. Verify cron success and permissions at each backend rollout. Provider service logs/backups are separate: the public notice records the settings last reviewed2026-10-22, not a new audit of today's plan. Re-check those settings before making new retention promises.

Arcade tickets last24 hours, issuance60/hour and submission120/hour. Submission bodies cap1 MiB; ticket/board bodies32 KiB; Endless online history1440 completed stages. Overflow disables online posting while local gameplay continues. Exact successful retries remain accepted after expiry; conflicting payloads fail. Expired unused tickets/hashes are cleaned hourly. Accepted score claims/receipts persist until owner removal/moderation.

Public score fields: displayName and challenge for v3; initials for legacy v1/v2; plus score, stagesCleared, inputType, mode, scoringVersion and receivedAt. SMF records also identify their edition, and Rush boards identify the venue. Endless order: clears descending → points descending → server time ascending → ID ascending. Rush/Festival: points → clears → time → ID. Boards cache30 seconds. Names and initials are not unique identities. New runs use arcade-v3 / smf-v3, partitioned by First-timer, Been-around or Seasoned-vet. Original v1 and crowd v2 boards remain available; existing runs, tickets and frozen retry payloads keep their original version. Versions separate gameplay rules, not presentation alone.

## Private reporting

Use `supabase/reports/playtest.sql` for aggregate reports and `supabase/reports/endless.sql` for stage/loop/choice breakdowns. Use owner SQL tooling; do not expose reporting RPCs publicly. Publish aggregate counts only, with UTC window, build/version/mode/input filters and denominators. Unknown completion means no terminal event was observed, not a confirmed quit. Replays are events, not unique retention; opt-in samples do not represent every player. XP/rank reachability is not directly measured by existing stage totals.

Do not run maintenance merely to read a report: use the metrics view/current raw aggregates or stored daily metrics as appropriate. If management access is unavailable, record the missing observation; do not request raw identifiable exports or invent results.

Private moderation: inspect reviewed entries using owner SQL, then set `hidden=true` on the specific IDs; set false to restore. Preserve score/receipt data. Never grant player direct table/RPC access. No production test score is needed for validator checks: valid synthetic payloads with deliberately nonexistent tickets must reach `invalid_ticket`, while tampered payloads fail earlier.

## Local checks and release

### Names and challenge boards rollout (2026-11-13)

Apply additive migration `202611130003_names_challenges.sql` before deploying all eight generic/SMF ticket, submission, leaderboard and playtest functions. V3 binds challenge to the ticket and stores a public name only on an explicitly posted score. Shared client/server filtering validates names; a definitive invalid-name response permits correction, while an uncertain network retry retains its frozen payload. Existing initials and receipts retain their original shapes.

Four named character presets stay on the device and share progression; names and presets are excluded from playtest analytics. New perks unlock at ranks 3 and 4. Candy Magnet provides up to two candies; Flow Finder provides up to three opportunities and keeps an eight-second gap after actual Flow expiry. Bonus objectives remain unchanged. See the [implementation and validation plan](superpowers/plans/2026-11-13-rave-names-challenges.md).

### Crowd season rollout (2026-11-13)

Apply additive migration `202611130002_scoring_seasons.sql` before deploying all eight generic/SMF ticket, score, leaderboard and playtest functions. Existing board queries already partition by scoring version. The migration extends ticket allowlists without rewriting scores, receipts, RLS or retention. New runs pin v2; older checkpoints missing a version become v1 and retain pass-through movement. Local top-score limits and Rush bests are independent per season. Playtest clearance now accepts0–48 for the smaller friendship radii; analytics remains opt-in. [Release evidence](superpowers/crowd-season-release-validation.md).

### SMF Quick Rush venue rollout (shipped in PR #22)

SMF services are separate from the generic arcade. Quick Rush now selects one of six main venues and preserves its authored musical duration (about 55–69 seconds). Each venue has its own local best and public board. `smf-v1` remains valid: previous Rush data belongs to Pagoda, whose rules are unchanged.

PR #22 applied `202611130001_smf_rush_venues.sql` **before** deploying `smf-run-ticket`, `smf-submit-score`, `smf-leaderboard` and `smf-playtest`; the frontend followed. See [verified release](superpowers/fullscreen-mobile-rush-release-validation.md). The migration adds and backfills `rush_stage_id`, binds tickets to venues, and preserves old RPC signatures and original receipt JSON/digests for retry compatibility. New RPC overloads remain service-role only; private tables retain RLS and retention policies.

New Rush requests carry `rushStageId` from the selected run. Explicit-venue board responses include that field. Legacy requests without it still resolve to Pagoda and receive the old response shape. Other modes reject venue fields. SMF stage/run playtest events optionally include selected venue and `movementMode` (`tap`, `swipe`, `stick`); consent remains opt-in, and rehearsals send neither scores nor analytics. Control style is the setting at result time, not a recording of gestures or time spent in each mode.

Local regression coverage exercises the real additive migration, legacy accepted retries after expiry, six independent boards, wrong-venue tickets/receipts, permissions, cache isolation, scene recovery, and local saved scores. At rollout, verify endpoints with deliberately nonexistent tickets and compare deployed function source; do not create fake production scores or telemetry.

Node 24: `npm ci`, `npm test`, `npm run build`, `git diff --check`. Tests use actual migrations with PGlite; full CI uses a disposable Supabase/Docker stack:

```
npx --yes supabase@2.121.0 start
npx --yes supabase@2.121.0 db reset
npx --yes supabase@2.121.0 test db
npx --yes supabase@2.121.0 stop --no-backup
```

Reset only the disposable local stack. Keep write-producing QA on a local/staging backend; rehearsal disables scores/XP/analytics. Record browser evidence and actual physical-device gaps.

Release order: review/test → linked migration dry run → apply only reviewed additive migrations → deploy changed functions → compare downloaded source → safe hosted validation/CORS/permissions/cron → PR checks → merge → Pages success → public UI/build smoke test. Attach the PR to the chat. A merge alone does not establish deployment acceptance.

Rollback without dropping data: clear the affected allowed origins or disable frontend variables and redeploy. Opt-out clears only unsent analytics; received records follow retention. Preserve migration history; use reviewed forward migrations. Unknown posting outcomes retry the same frozen payload.
