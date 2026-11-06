# M4 Bass Head interface release — 2026-11-05

The user approved the preview and requested shipping. Release scope: on-field native Bass Head control, 25% minimum charge and proportional 1.5–6s protection, cone-origin ripples and distinct pressure/protection feedback. Existing radial slowdown, exposure, post-expiry pressure and spark point values remain unchanged.

- Fresh verification: 178 tests and production build pass; the existing Phaser bundle-size advisory remains. Preview browser acceptance and the independent review/fix pass are recorded in [preview validation](bass-interface-preview-validation.md).
- No backend, dependency, analytics schema or scoring-version changes. The existing score validator accepts a real partial-charge award history; no backend deployment is required. A test-only timestamp adjustment removes an exclusive report-boundary fixture race.
- The production build excludes Bass/Candy/Reward lab fixtures. Practice remains DEV-only, with disposable state and no score, XP or analytics writes.
- This release follows candy PR #17 /d00ee62. PR CI (including backend integration because a database test fixture changed), main Pages deployment and public smoke results are recorded on the release PR. A merge alone does not establish public acceptance.
- Public verification must check the published merge marker, updated rules, on-field control and absence of practice controls without writing synthetic scores or analytics. Physical thumb reach, hardware reduced-motion settings, sustained phone performance and balance remain real-device playtests.

## Hosted acceptance

- [PR #18](https://github.com/ratfinkca/shambhala-side-quest/pull/18), reviewed head `3305d59be14de6e1288a484c904994e178fd74c7`, merged as `41148eeb12e397061fa028c8e3909b241e5d88bc`; merged tree matched the reviewed head.
- [PR game checks](https://github.com/ratfinkca/shambhala-side-quest/actions/runs/42063656519) and [backend integration](https://github.com/ratfinkca/shambhala-side-quest/actions/runs/42063656599) passed before merge. [Main build/Pages deployment](https://github.com/ratfinkca/shambhala-side-quest/actions/runs/42064666239) passed.
- Public `assets/index-BpVxVsav.js` contained the exact merge marker and updated partial-charge instruction; Bass/Candy/Reward practice fixtures were absent.
- IAB public title → Endless rules showed 25% activation and 1.5–6s duration. The native button was within `arena-wrap`, correctly hidden/disabled on rules. No console warnings/errors. Evidence: `/tmp/bass-public-rules.png` outside repo. No synthetic production score or analytics event was written; live random collection/activation was not forced. Local preview/tests cover those behaviors.

These are the recorded release observations, not a fresh later health audit.
