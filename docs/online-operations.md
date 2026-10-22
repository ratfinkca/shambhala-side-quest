# Playtest operations

Public collection is disabled by default. No Supabase project has been provisioned. The arcade board is a separate future implementation.

## Local verification

`npm ci`, `npm test`, and `npm run build` cover consent, measurement, transport, request validation and an embedded Postgres instance. The embedded database runs the actual data migration and tests roles, duplicate batches, limits, retention and aggregate reruns. It does not exercise Supabase's gateway, Deno wrapper or pg_cron.

For the full integration gate, use Node 24, a Docker-compatible runtime, and pinned CLI 2.121.0:

```
npx --yes supabase@2.121.0 start
npx --yes supabase@2.121.0 db reset
npx --yes supabase@2.121.0 test db
npx --yes supabase@2.121.0 functions serve playtest --env-file /absolute/path/outside-repo/playtest.env
```

`db reset` is for the disposable LOCAL stack only. The backend CI workflow uses no production credentials. Never reset a hosted project to run tests.

## Owner setup and deployment

1. The owner creates/signs into a Supabase account and accepts its terms. Choose an organization, project region, and service plan after reviewing current costs/limits. Start with a staging project separate from production. Store database passwords and access tokens in a password manager; do not paste them in chat or frontend configuration.
2. Link the project with the Supabase CLI using the owner's authenticated session. Review and apply migrations with `supabase db push`; never run a remote reset. Confirm `playtest_private` is not an exposed API schema.
3. Configure server secrets `PLAYTEST_ORIGINS` (comma-separated exact origins) and `PLAYTEST_RATE_SECRET` (random, at least 32 bytes). Supabase provides `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` to the function. Deploy `playtest`; `verify_jwt=false` is intentional for optional account-free telemetry. The endpoint validates all data; no client receives a service key.
4. Production origin is `https://ratfinkca.github.io`; origin checks cannot distinguish individual Pages repositories on that origin and are not authentication. Staging permits its own origin only. Verify which address header the hosted gateway overwrites; the current handler hashes the first `x-forwarded-for` address. If spoofable, configure trusted gateway rate limiting before public activation. Network limits are best-effort abuse controls, not player identity or proof of consent.
5. Check the provider's current request-log and backup retention in the chosen project/plan. Record it in `public/playtest-data.html`. The application does not log request bodies, initials or raw IPs. No public activation until this notice is accurate and the daily cleanup succeeds.
6. Synthetic staging checks: permitted/disallowed origin, missing/invalid payload, >32 KiB body, duplicate batch, >120 requests/hour, anonymous direct reads/writes and RPC calls, scheduled cleanup, and reports. Delete only those synthetic test records after validation.
7. Set public frontend values: `VITE_PLAYTEST_ENABLED=true`, `VITE_PLAYTEST_URL=https://<project>.supabase.co/functions/v1/playtest`, and `VITE_PLAYTEST_NOTICE_URL=https://ratfinkca.github.io/shambhala-side-quest/playtest-data.html`. `VITE_BUILD_ID` is the build commit. All values here are public. Do not set public enablement until staging passes and shipping is approved.
8. Deploy backend before enabling/releasing frontend. Smoke-test a consent-declined run (no analytics request), an accepted run, opt-out and local score saving. Verify no private tables or fields are publicly readable.

The user selected GitHub issues as the public contact route; the notice warns that reports are public. No separate email account is needed.

## Retention and reports

Cron runs `public.maintain_playtest()` at 00:10 UTC daily. It replaces daily aggregate rows only for days still represented by raw events, then removes whole UTC days older than the rolling cutoff: raw retention is 29–30 days. Aggregates contain day, mode, input category, scoring version, metric and total; no installation/session/run IDs. Unknown completion means no end event observed at aggregation time, not a confirmed quit.

Run `supabase/reports/playtest.sql` in the owner SQL editor. Show run/stage sample sizes and unknown completions alongside outcomes. Replay counts are events, not unique-player retention. Input on completed runs uses the terminal label; unfinished runs can remain unknown. Delayed data/closed tabs/ad blockers mean coverage is incomplete. Duplicate event IDs are suppressed while raw records remain retained.

Inspect `cron.job` and `cron.job_run_details` after rollout; a failed cleanup requires attention. Retention is not a promise about provider backups/service logs, which the notice must describe separately.

## Failure and rollback

Missing/invalid frontend config disables collection and the invitation. Opt-out discards the in-memory queue and aborts pending requests; already received data remains subject to retention. Queues cap at 100 events, batches at 20/32 KiB, timeout at 5 seconds, and one retry on a later flush. No durable analytics queue, credentials, or retroactive recording.

To stop ingestion immediately, remove all allowed origins or disable the deployed function; then deploy with `VITE_PLAYTEST_ENABLED=false`. Gameplay and local saves keep working. Do not drop tables as a rollback. Preserve migration history; schema changes require reviewed forward migrations.

References checked during implementation: [Edge Function auth](https://supabase.com/docs/guides/functions/auth), [local development](https://supabase.com/docs/guides/local-development/cli/getting-started), [scheduled SQL](https://supabase.com/docs/guides/cron).
