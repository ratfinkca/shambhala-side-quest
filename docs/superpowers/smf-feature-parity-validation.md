# SMF feature parity — validation and release record

Updated 2026-11-10. The owner authorized a public SMF test edition at `/smf/` alongside the generic game. The SMF backend is deployed and has passed the harmless live checks below. The frontend candidate has not yet been merged or published; CI, Pages deployment and public frontend smoke checks remain pending.

## Candidate and automated checks

The SMF edition implements Festival Run, 60-second Quick Rush at Pagoda and six-stage repeating Endless, four-perk choices, optional bonus visits and separate SMF profile/recovery, scores and consent. Menus include themes, wardrobe, settings and local/optional online scores. Server rules, functions and storage are separate from generic. Pages packaging serves generic at the root and SMF at `/smf/`. See the [parity plan](plans/2026-11-10-smf-feature-parity.md).

- The full local suite passed **549/549 tests**. Both edition builds, the combined Pages build and `check:editions` passed, including generic/SMF asset checks and invalid-edition rejection.
- Independent backend review findings and ranking behavior were addressed. A later review identified two P2 issues in navigation and ticket lifecycle; fixes and a regression test were added, and the reviewer confirmed them resolved.

## Backend deployment and harmless live checks

Migration `202611100001` and all four SMF functions (`smf-run-ticket`, `smf-submit-score`, `smf-leaderboard`, `smf-playtest`) were deployed. Origin and rate-limit secrets were set, and GitHub SMF variables configured. Live reads returned **200** for all three SMF boards and the generic board. A nonexistent ticket returned **400 `invalid_ticket`**; an empty tracking request returned **400 `invalid`**. These checks did not create production scores or events and do not establish a published frontend.

## Local browser evidence

- Quick Rush started at Pagoda with a 60-second clock and was played through its natural end. A natural mouse pass was observed. A lab-assisted clear produced 240 points; local Rush initials `QA1` and Endless initials `QA3` were saved. An unsaved-score warning appeared.
- Using a **fake backend**, a score post returned 503; after reload, Retry succeeded and `QA2` appeared on that test board. This was not a production score submission. Optional sharing was toggled on and off.
- Festival reached six clears; final Villagio returned to results without a duplicate award. Endless progressed from stage six to seven, with target 23 → 27. At four perks, Pool Noodle was swapped for Crowd Surfer and Keep was exercised. Rabbit and Villagio rewards were observed, and a bonus reloaded paused.
- The existing normal-user AMP checkpoint remained paused at 42 seconds, 10,895 points and 963 XP. A separate run resumed paused at 55 seconds. Audio, theme and wardrobe selections persisted; music was changed from 45% to 1%, effects from 65% to 100%, and mute persisted after reload.
- Responsive layouts were inspected at 390×844 and 844×390, and the pause control also fit a 1728-pixel-wide desktop viewport. A fullscreen click was unavailable under automation; the fallback worked. Native fullscreen acceptance remains open.

## Remaining release and follow-up checks

- [ ] Create the reviewed PR, verify CI, merge, wait for Pages deployment and smoke-check the actual public generic root and `/smf/` frontend. Record exact revision and links; report each status separately.
- [ ] Verify native fullscreen outside automation. Physical-phone input, real-device audio, interruptions, long-session performance and owner pacing/balance feedback remain open follow-up and pitch-quality work; they are not release blockers for this authorized public test.
- [ ] Record remaining limitations and public frontend evidence after deployment. A public test release is distinct from pitch readiness.
