# Arcade board validation

Implementation follows the approved 2026-10-20 arcade board plan. Migration names advance to 202610220001/2 because tracking already used 202610200002. Native work stays on a dedicated branch in the writable checkout, as with tracking.

The client requests a ticket at first-stage start without blocking play. Score counters run independently of analytics consent. Scores have an explicit public-data preview, posting action, and explicit retry. Local saves remain separate. The server stores hashed 256-bit tickets, validates score components before a privileged RPC, atomically locks/consumes tickets, and returns only public display fields on boards.

Node tests exercise real migrations in embedded Postgres: access denial, expiry, rate limits, duplicate submission, conflicting reuse, post-expiry receipts, moderation and cleanup. This is not a substitute for a real Supabase/Deno/pg_cron integration run; the existing CI workflow includes the new migrations and pgTAP tests.

Development uses a disposable in-memory Postgres-backed HTTP service on localhost, with public production analytics disabled. No production arcade endpoints or public board have been enabled. Hosted rollout and real-device coverage remain release checks.

## Verified locally, October 22

- 102 Node tests pass; production build passes with the existing Phaser bundle-size warning.
- Real 60-second Rush in the browser, keyboard input, tracking disabled: save TST locally, then explicit Post online, success receipt, entry visible with keyboard label. Festival tab remains independently empty.
- Desktop and 390×844 mobile board layouts inspected; online board precedes local boards and navigation remains reachable. Browser error/warning log empty.
- Independent whole-branch review found one Important gap: impossible high-multiplier counts were accepted. Added a failing one-pickup-at-5x regression, then enforced prerequisite multiplier counts; valid multiple reset chains and full three-stage Festival fixtures pass. No Critical findings.
- Lost-response retry, duplicate prevention, stale board results, ticket timeout, expiry, forged strings and permission checks have automated coverage. Browser fault injection, all-theme keyboard walkthrough, real-device touch, true concurrent hosted transactions, and hosted Deno/cron integration are still release verification work. Public endpoints remain disabled; no production score requests were made.

Local preview: http://127.0.0.1:5175/ (local backend http://127.0.0.1:54331). Its database is disposable and in memory. Screenshot: /tmp/sidequest-online-arcade.png.
