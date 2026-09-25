# Festival Run preview validation — 2026-09-25

Branch: `codex/festival-run`. Main/Pages unchanged; preview is awaiting user playtesting.

## Automated checks

- 46 Node tests pass, including all original Quick Rush tests.
- Production build passes; existing Phaser bundle-size advisory remains (~335 kB gzip).
- Verified production JavaScript contains neither rehearsal control text nor its installer. Rehearsal submissions and personal-best updates are disabled in development as well.
- New coverage includes profile migration/validation/blocked storage; independent audio routing and retry; qualification boundaries and duplicate transitions; four perk effects; connected stage geometry and 1,000 sampled spawns per stage; shield contact lifetime; scene reset/configuration; local board ordering, bounds, duplicate IDs and below-cutoff feedback.

## Browser evidence

- Desktop 1366×768: title, wardrobe, stage HUD, settings, scores and results inspected.
- Portrait 390×844: wardrobe preview/options remain usable; menus use available height and internal scrolling. Gameplay retains the arena proportions.
- Landscape 844×390: results are internally scrollable; all actions remain available.
- All cosmetic IDs were selected across default, moth/wizard/mushroom and rainbow/no-hat/star combinations. Selected outfit appeared on the player after reload.
- Settings sliders respond to keyboard input. A changed music value persisted through reload; effects remained independent. Settings paused a real round at 0:38; timer remained 0:38 until explicit Resume.
- Normal production Quick Rush completed, collected a spark, accepted QA1 initials for ten points, and showed the entry after reload. Duplicate submission was disabled.
- Normal production Festival Run with no pickups finished after 60 seconds with zero stages cleared and no upgrade offer.
- Development rehearsal traversed all three stages, choosing Pool Noodle then Friendship Bracelet. Scores accumulated (540 → 1330 → 2370), stage counters reset, shield renewed, and Sunrise completion reported 3/3. Neon/Sunrise backgrounds, speaker islands and mud were visually inspected. Rehearsal score submission stayed disabled.
- Fresh production-preview console contained no errors or warnings. The earlier scene-start error was reproduced, fixed and covered by a regression test.

## Independent review fixes

1. Round start was not receiving stage/rules/outfit due to a missed source replacement. Scene integration test failed with the same ReferenceError, then passed after configuration/reset was corrected, including the recreated fireflies reference.
2. Discarding a paused run could leave TweenManager paused. New-round reset now resumes it; failing regression assertion passed after correction.
3. A valid score below a full top ten was misleadingly reported as saved. Submission now reports ranking status and the UI explains that it did not reach the board; regression test covers it.

## Preview limits and next decision

Spark thresholds remain the proposed 20/25/30. The rehearsal proves transitions, not difficulty balance; a sustained human three-stage playthrough is the acceptance check before merging. No claim is made that these targets are optimally balanced. Reduced-motion paths remain implemented; a device-level reduced-motion visual pass and additional touch-device testing are useful before public release. Audio routing is tested, but subjective mix quality should be judged while playing.

This milestone intentionally has local scores only, starter cosmetics rather than a currency/shop, and no persistent power upgrades. No deployment was performed.
