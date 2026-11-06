# Endless recovery release — 2026-11-06

The user approved shipping the local preview. [PR #19](https://github.com/ratfinkca/shambhala-side-quest/pull/19) carries the release and records final CI, merge, Pages and public acceptance.

- Fresh local verification:207 tests pass, production build passes with the known Phaser size advisory; diff and documentation checks pass. The independent review/fix pass and browser coverage are recorded in [preview evidence](run-recovery-preview-validation.md).
- Same-browser Endless recovery persists logical scene/run state about once a second and at transitions. Restore is paused with explicit Resume/Discard. XP/local scores and checkpoints share a write; online retry retains original ticket/build/payload. Multi-tab ownership uses Web Locks. Recovered-run analytics are deliberately suppressed until a new run.
- No backend, dependency, analytics schema or scoring-version changes; no backend deployment is required. Both frontend and backend integration CI must pass before merge.
- Production excludes disposable recovery/reward/candy/bass fixtures. Public smoke verification checks the exact merge marker, updated Endless rules, no practice controls and console health without synthetic production scores or analytics.
- Physical phone termination, eviction, audio interruptions and sustained performance remain playtest checks. Browser storage clearing/eviction cannot be recovered; sudden termination can lose the unsaved interval. Recovery does not install offline assets or sync devices.
- User selected stage atmosphere/music next. Existing-stage arrangements/lighting are the first investigation, while balance tuning waits for audience feedback.

## Hosted acceptance, 2026-11-06

- PR #19 head `b668cb11640e8c3f245753054d1a9c2803a44487` merged as `67c44e0afc5cb075a2b8836ce8478f1dc93f6963`; merged tree matched the reviewed head.
- [Game CI](https://github.com/ratfinkca/shambhala-side-quest/actions/runs/42253938878), [backend integration](https://github.com/ratfinkca/shambhala-side-quest/actions/runs/42253938809) and [main build/Pages](https://github.com/ratfinkca/shambhala-side-quest/actions/runs/42255211816) passed.
- Public `assets/index-DdSxzvTM.js` contained the exact merge marker, `endless-recovery-1` and recovery rules; practice fixtures were absent.
- Public title → Endless rules loaded with paused-recovery guidance, no practice controls/unavailable notice and no console warnings/errors. Screenshot `/tmp/recovery-public-rules.png`. No synthetic score, run ticket or analytics event was written; the smoke check preserved real progress and opt-in preference. Full restore/play/decisions/results were verified in isolated local practice, not forced on the production profile.
