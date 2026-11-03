# Online operations

Updated 2026-11-03. Current architecture/configuration is described here; live health is verified at release time, not guaranteed by this document. [Handoff](PROJECT-HANDOFF.md) · [roadmap](ROADMAP.md) · [historical hosted checks](history/online-operations-through-2026-10-22.md).

## Production and ownership

GitHub Pages serves the static game at https://ratfinkca.github.io/shambhala-side-quest/; allowed origin is https://ratfinkca.github.io. Supabase project `hziafdynblkyxywythqg` hosts the backend in East US/North Virginia. Public playtest configuration and arcade configuration are enabled in the released game; analytics still require explicit player consent. Arcade posting does not require analytics consent. Existing release evidence is PR #13 /8b5192f; M1 analytics additions remain local until separately released.

No secrets in frontend code, Git, reports or chat. Supabase server-side environment supplies the service role; clients receive public endpoint configuration only. Use project-scoped MCP tools if exposed, otherwise authenticated pinned CLI 2.121.0. Never reset a hosted project. No routine browser login is needed when authenticated management tools work.

## Functions and storage

| Function | Responsibility |
|---|---|
| playtest | Strict schema/CORS/body validation, best-effort rate limiting, private ingestion |
| run-ticket | Opaque24-hour score capability; only its hash is stored |
| submit-score | Validate counters/targets/perks and ticket binding; atomic idempotent receipt |
| leaderboard | Mode/version-filtered public top 50 with limited public fields |

`playtest_private` holds raw events, rotating network hashes and identifier-free daily metrics. `arcade_private` holds tickets, score claims, moderation state and limits. Both have RLS and denied anon/authenticated direct access; server-owned RPC execution is service-role only. Neither private schema is exposed through the public API.

Shipped migrations:202610200001/2 (analytics/maintenance),202610220001/2 (arcade/maintenance),202610290001 (Endless tickets/ranking). The finish/save release required validators only. M1's later analytics migration must deploy before its frontend.

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

Public score fields: initials, score, stagesCleared, inputType, mode, scoringVersion, receivedAt. Endless order: clears descending → points descending → server time ascending → ID ascending. Rush/Festival: points → clears → time → ID. Boards cache30 seconds. Initials are not unique identities. Arcade-v1 remains current; change version for changes to awards, not presentation alone.

## Private reporting

Use `supabase/reports/playtest.sql` for aggregate reports and the M1 companion report for stage/loop/choice breakdowns once its migration is applied. Use owner SQL tooling; do not expose reporting RPCs publicly. Publish aggregate counts only, with UTC window, build/version/mode/input filters and denominators. Unknown completion means no terminal event was observed, not a confirmed quit. Replays are events, not unique retention; opt-in samples do not represent every player. XP/rank reachability is not directly measured by existing stage totals.

Do not run maintenance merely to read a report: use the metrics view/current raw aggregates or stored daily metrics as appropriate. If management access is unavailable, record the missing observation; do not request raw identifiable exports or invent results.

Private moderation: inspect reviewed entries using owner SQL, then set `hidden=true` on the specific IDs; set false to restore. Preserve score/receipt data. Never grant player direct table/RPC access. No production test score is needed for validator checks: valid synthetic payloads with deliberately nonexistent tickets must reach `invalid_ticket`, while tampered payloads fail earlier.

## Local checks and release

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
