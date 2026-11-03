# Endless insights implementation plan

> Native execution continues the user's existing workflow. Use test-driven development and one independent final review.

**Goal:**private opt-in insight into Endless stages, choices and stopping outcomes.
**Spec:**[Endless insights](../specs/2026-11-03-endless-insights-design.md).
**Architecture:**extend existing summaries/session, strict ingest validator, private metrics view and reports; no gameplay/arcade changes.

## Task 1:Documentation and evidence baseline

- [x] Rewrite current handoff/operations, archive original records, mark historical specs/plans/QA, fix README and create indexed roadmap M1–M4/later backlog.
- [x] Attempt authenticated read-only aggregate review. Record UTC window, sample counts and gaps; do not export identifiers or run maintenance as a read.

## Task 2:Measurement/schema (test-first)

Files: src/playtest/{summary,session}.js;supabase/functions/_shared/playtest.js;src/main.js;public/playtest-data.html;tests/playtest-{summary,session,ingest,http}.test.mjs.

- [x] Failing tests: stage 3+ and thousands of stages retain only current summary; schema2 Endless run/stage/choice/end accepted, duplicate choice/end ignored; banked/failed/exit distinguished; original modes unchanged; consent-off/mid-run/opt-out emit no unsupported data.
- [x] Implement bounded summaries and one choice per completed stage. Main sends accepted add/swap/keep only; start/finish use sequential indices. Implement strict schema2 validation and update notice.
- [x] Run node --test tests/playtest-*.test.mjs and npm test; expect all pass.

## Task 3:Private aggregates/reports (test-first)

Files: new supabase/migrations/202611030001_endless_playtest.sql;supabase/reports/{playtest,endless}.sql;tests/playtest-db.test.mjs;supabase/tests/playtest.sql.

- [x] Failing PGlite tests: banked/failed/exit/unknown grouped separately, add/swap/keep counts, old daily aggregates retained, maintenance idempotent and permissions unchanged.
- [x] Extend private metrics view and read-only reports, with sample denominators/build/UTC scope and no identifier output. Add pgTAP integration coverage.
- [x] Run full tests/build/diff check; browser-check changed controls/session with local capture backend; independent review. Record exact gaps, especially production coverage and physical devices.

## Release boundary

No automatic PR/merge/publish in this implementation task. Keep current release baseline explicit. When shipping is requested, deploy analytics migration/playtest function before frontend. M2 layout work starts after this milestone is reviewed; its six encounters need a playable layout preview rather than speculative balance changes now.


## Completion evidence and limits — 2026-11-03

150 tests, production build and relative-document-link validation pass. Independent review's archived stage/perk report regression was reproduced with a failing fixture and fixed; full suite is green. Aggregate-only production review is recorded separately.

Browser at 127.0.0.1:5180 used a localhost-only strict capture endpoint: sharing-off run/exit produced 0 events; consenting Endless produced 3 schema-2 events (run_start,stage_start,run_end outcome exit); opting out during a second run cleared pending measurement and left capture at 3 events. No console errors/warnings. Screenshot:/tmp/endless-insights-consent-off.png.

Banked/failed outcomes, late stages, accepted add/swap/keep, duplicate choices, mid-run consent and 5000-stage memory bounds are covered in automated tests, not a full manual long run. Physical-device QA and full Supabase/Deno/pg_cron CI have not run in this local task. Migration/function/frontend remain undeployed. No production test analytics or scores were written.
