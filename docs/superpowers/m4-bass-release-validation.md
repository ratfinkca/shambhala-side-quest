# M4 Bass Head interface release — 2026-11-05

The user approved the preview and requested shipping. Release scope: on-field native Bass Head control, 25% minimum charge and proportional 1.5–6s protection, cone-origin ripples and distinct pressure/protection feedback. Existing radial slowdown, exposure, post-expiry pressure and spark point values remain unchanged.

- Fresh verification: 178 tests and production build pass; the existing Phaser bundle-size advisory remains. Preview browser acceptance and the independent review/fix pass are recorded in [preview validation](bass-interface-preview-validation.md).
- No backend, dependency, analytics schema or scoring-version changes. The existing score validator accepts a real partial-charge award history; no backend deployment is required. A test-only timestamp adjustment removes an exclusive report-boundary fixture race.
- The production build excludes Bass/Candy/Reward lab fixtures. Practice remains DEV-only, with disposable state and no score, XP or analytics writes.
- This release follows candy PR #17 /d00ee62. PR CI (including backend integration because a database test fixture changed), main Pages deployment and public smoke results are recorded on the release PR. A merge alone does not establish public acceptance.
- Public verification must check the published merge marker, updated rules, on-field control and absence of practice controls without writing synthetic scores or analytics. Physical thumb reach, hardware reduced-motion settings, sustained phone performance and balance remain real-device playtests.
