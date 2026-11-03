# M1 Endless insights release evidence — 2026-11-03

Scope: opt-in Endless measurement and private reports, plus current docs/roadmap. Prior gameplay baseline: PR #13. This document records backend/local evidence; final CI, merge, Pages and public smoke results are recorded on the release PR so they are not confused with local acceptance.

## Local acceptance

150 tests, production build and document-link validation pass. Independent review's archived stage/perk report regression was reproduced and fixed with a test; full suite passes. Local browser checks: sharing off sends no events; consenting Endless sends start/stage-start/exit; opt-out clears queued work. Long-run memory, late stages, outcomes, choices and privacy schemas have automated coverage. Physical-device QA remains unobserved.

## Backend first

Dry run listed only202611030001_endless_playtest.sql. Applied that forward migration, then deployed playtest via pinned CLI2.121.0 to project hziafdynblkyxywythqg. Downloaded playtest/index.ts, shared/http.js and shared/playtest.js match reviewed sources exactly.

Read-only owner verification confirmed banked/failed/choice metrics present; anonymous schema/view/ingest access and authenticated view access denied; service ingestion allowed. Both scheduled cleanup jobs are active and their latest executions succeeded. No maintenance was triggered by verification.

Downloaded validator pure checks accept valid schema-2 Endless choices and terminal outcomes. Live endpoint checks reject extra personal fields/invalid choices and oversized bodies; disallowed origins are denied and production OPTIONS succeeds. These requests cannot insert events. No synthetic analytics or score records were inserted in production by these checks. Full gateway ingestion with a new synthetic event was intentionally not performed; local strict capture plus schema/SQL tests and backend CI cover the write path.

Raw production coverage remains the small aggregate-only sample documented in [coverage review](../playtests/2026-11-03-coverage.md); do not infer balance or retention before new consenting samples arrive. Consent stays default-off; accepting mid-run applies next run; score posting remains independent. Preserve existing transport/retention limits.
