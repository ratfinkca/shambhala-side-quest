# Arcade board validation

Implementation follows the approved 2026-10-20 arcade board plan. Migration names advance to 202610220001/2 because tracking already used 202610200002. Native work stays on a dedicated branch in the writable checkout, as with tracking.

The client requests a ticket at first-stage start without blocking play. Score counters run independently of analytics consent. Scores have an explicit public-data preview, posting action, and explicit retry. Local saves remain separate. The server stores hashed 256-bit tickets, validates score components before a privileged RPC, atomically locks/consumes tickets, and returns only public display fields on boards.

Node tests exercise real migrations in embedded Postgres: access denial, expiry, rate limits, duplicate submission, conflicting reuse, post-expiry receipts, moderation and cleanup. This is not a substitute for a real Supabase/Deno/pg_cron integration run; the existing CI workflow includes the new migrations and pgTAP tests.

Development uses a disposable in-memory Postgres-backed HTTP service on localhost, with public production analytics disabled. No production arcade endpoints or public board have been enabled. Hosted rollout and real-device coverage remain release checks.
