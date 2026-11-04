# M3 release verification — 2026-11-04

- User approved the reward preview and requested publication.
- [PR #16](https://github.com/ratfinkca/shambhala-side-quest/pull/16), head `7cf3e2356d641d60ec515c03df6c3c50a56f72ec`, squash merged as `79080a6f58c5248ec40833597f97d47c05948ca9`.
- Release scope: four local achievements/rewards, locked/earned previews, bounded animated cosmetics and portrait/landscape wardrobe support. No backend, dependency, analytics payload or score-version changes; no backend deployment needed.
- Release validation: 163 tests, production build, diff/link checks and independent review pass; detailed local acceptance is in [preview validation](m3-preview-validation.md).
- [PR test/build](https://github.com/ratfinkca/shambhala-side-quest/actions/runs/41877635831) passed. [Main build and Pages deployment](https://github.com/ratfinkca/shambhala-side-quest/actions/runs/41880206251) passed; deployment completed at 2026-11-04T17:52:07Z.
- Public JavaScript `assets/index-hThgcUdO.js` contains the exact merge SHA and all four cosmetic names; reward fixture controls/code are absent. Merged tree matched the approved release tree.
- In-app browser loaded the public title and wardrobe; all four reward cards appeared, and the locked Spore Sprout preview rendered. No relevant console warnings/errors. No production score, fake achievement or synthetic analytics event was posted.
- Screenshot: `/tmp/m3-public-preview.png` (outside repo). Real reward earning was covered locally and by tests; no twelve-minute production earning run or physical-phone performance audit is claimed.

M4 development is separate and not included in this release.
