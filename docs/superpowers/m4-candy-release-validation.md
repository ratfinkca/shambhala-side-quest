# M4 candy release — 2026-11-04

- User approved the candy preview and requested PR, merge and deployment.
- [PR #17](https://github.com/ratfinkca/shambhala-side-quest/pull/17), head `1ee8127deca5f83db49ce60bbab5abd4a135c52a`, squash merged as `d00ee62a299798ece6b9bb451518fc79ee5052f9`.
- 168 tests, production build, diff/link checks and prior independent review pass. [Preview evidence](m4-candy-preview-validation.md) records local input/rendering acceptance and physical-device limits.
- [PR test/build](https://github.com/ratfinkca/shambhala-side-quest/actions/runs/41925159618) and [main build/Pages](https://github.com/ratfinkca/shambhala-side-quest/actions/runs/41925351697) passed. The merged tree matches the reviewed release tree.
- Public `assets/index-DcwrJpeO.js` contains the exact merge SHA, reversed-controls hint and new effect-start lifecycle; Candy lab/reward fixtures are absent.
- Public title and Endless rules loaded in IAB with updated candy instructions, no practice controls and no relevant console warnings/errors. Rules were inspected without starting a production run; no synthetic score or analytics event was written.
- Screenshot: `/tmp/candy-public-rules.png` (outside repo). Natural random candy collection on the public site was not forced; keyboard/pointer reversal and colour rendering were verified locally and by tests.
- No backend, dependency, analytics payload or scoring-version change; no backend deployment required.

Bass-zone feel is a separate follow-up. No bass rules were changed by this release.
