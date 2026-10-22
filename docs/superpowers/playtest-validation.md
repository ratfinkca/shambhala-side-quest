# Playtest tracking validation — 2026-10-22

Branch: `codex/playtest-tracking`. Local implementation only; no public collection, external project deployment, PR or merge performed.

## Verified

- 90 Node tests pass, including the actual private SQL migration executed in embedded Postgres. Tested roles, denied public table/RPC access, duplicate event IDs, 120-request hourly limit, raw retention, durable aggregates, and scheduled cleanup SQL.
- Production build passes. Existing large Phaser bundle warning remains.
- Dependency install surfaced existing Vite advisories; compatible lockfile update resolves them. Installation audit reports zero vulnerabilities. PGlite is a development-only database test dependency.
- Browser at `http://127.0.0.1:5174/` using an in-memory localhost collector at port 54330. Desktop 1280×720 and mobile 390×844. No third-party analytics endpoint used.
- Decline → Quick Rush → full run → local score save: collector remained empty; score saving worked.
- Accept in settings → Quick Rush → keyboard and mouse movement → results: collector received exactly run_start, stage_start, stage_end and run_end. Stage measured 60,000 active ms, one spark, one bump, 10 points; terminal input label was mixed.
- Mobile settings fit and scroll normally; Stop sharing visibly returns to Sharing is off. Viewport reset after test. Screenshot saved outside repository at `/tmp/sidequest-playtest-mobile.png`.
- Browser console: no warnings/errors during checks; no blank page/framework overlay.
- Session tests verify opt-in mid-run applies next run, opt-out cancels pending retries, and disabled configuration creates no analytics identity/events.
- Repository issue tracker verified public and enabled. Owner selected it as contact route.

## Independent review and fixes

Fresh reviewer examined `adb33c0..08a0900` and independently ran 88 tests. No critical issues. Two important findings were reproduced with failing tests, fixed, and verified with the 90-test suite:

1. Preserve originating run IDs through scene/session boundaries; stale pickups/end events cannot contaminate a replay.
2. Add hourly rate-hash cleanup; daily raw-event aggregation remains separate. Tests execute the actual scheduled deletion command with old/recent rows.

Deferred minor: the future arcade plan names migration version `202610200002`, now used by tracking scheduling. Use a new unique version when executing that later plan.

## Decisions and limits

- Dedicated branch in the original writable checkout after sandbox denial of managed-worktree writes. Cost: no separate working-directory isolation; unrelated files were excluded from commits. The unused managed worktree was queued for archival.
- Consent invitation requires enabled endpoint and notice configuration. Cost: a local preview needs explicit test configuration to show the invitation.
- Embedded Postgres used because Docker/Supabase CLI were absent. Cost: these tests do not verify hosted Deno/gateway or real pg_cron execution. Separate Supabase CI tests were added but have not run on GitHub.
- Raw retention is 29–30 days, removing whole UTC days after aggregation. Cost: up to one day less raw history than nominal 30 days; avoids overwriting archived totals with partially pruned data.
- Compatible Vite update applied because dependency audit surfaced existing development-server vulnerabilities. Tests/build were rerun.

Reviewer items set aside, and disposition:

- Gateway address-header trust/rate-limit effectiveness: staging gate remains; public collection stays off until verified.
- Actual pg_cron installation/scheduling: Supabase integration gate remains; embedded scheduler test proves command and cadence, not deployment.
- Provider logs/backups: owner project settings needed; update notice before activation.
- Arcade functionality: intentionally excluded from this tracking implementation.
- 29–30-day retention: accepted decision above.
- Deduplication after raw retention: limited to retained IDs; bounded in-memory client retries make this acceptable for casual telemetry, not audit-grade accounting.
- Browser evidence: reviewed by executor, not independently replayed by reviewer.
- Final evidence document: fulfilled by this document.

## Remaining rollout work

Owner is creating Supabase. Need project URL/reference, authenticated deployment access through an approved local login, service plan/region review, and chosen provider log-retention settings. Do not paste passwords or secret keys in chat.

Run the full Supabase/pgTAP integration checks and synthetic staging API checks, verify scheduled cleanup, update the data notice, then obtain shipping instruction before enabling public collection. Offline network behavior is unit-tested; real iOS/Android and all-theme browser matrix remain untested in this pass. No claim of end-to-end hosted verification.
