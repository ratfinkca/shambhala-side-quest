# Main controls and mobile camera implementation plan

**Goal:** Bring the accepted discrete swipe and thumbstick controls into both main editions, then let players compare closer mobile camera views in portrait and landscape.

**Architecture:** Reuse the tested gesture/motion model through a shared main-game controller. Keep device preferences separate from run/profile snapshots and use one bounded camera over the existing 960×640 world. Resize the viewport rather than stretching the world.

**Scope:** User approved implementation after the swipe preview. Keep tap and keyboard available; add saved sensitivity, camera mode and zoom. Auto follows on phone-sized screens and fits the full floor on desktop. Rotation/tilt and installable-app work remain later. No release requested in this turn.

## Decisions

- One completed continuous swipe triggers a finite burst on release. Screen-up/right/diagonal follow the finger stroke, independent of player/contact position. Complete length sets duration, average velocity sets speed; both respond to sensitivity. Holds, pauses and sharp backtracking are ignored, allowing small natural wobble. Thumbstick holds steer continuously and release glides to a stop. Full provisional thresholds are in the movement-preview plan.
- Owner chose faster bursts and stamina for the main game. All control styles share normal speed 300 and boosted ceiling 480; Sprint/Shift gives tap, thumbstick and keyboard players access to the same boost. Preserve existing candy/perk/terrain effects. Stamina is per stage: recharge during normal movement/rest, freeze during pause, preserve on recovery, refill for a new stage. The practice lab retains its independent stamina toggle.
- Preferences: tap/swipe/stick, sensitivity 0.6–1.6 (default 1), camera auto/follow/overview, zoom 0.8–1.5 (default 1). Keep tap as the existing-player default.
- Follow clamps to the world bounds; full-floor view always fits the entire world. Zoom changes framing, not movement speed. Existing angle stays fixed.
- Clear input on pause, recovery, resize, settings changes and stage transitions. Villagio owns putting gestures and frames the whole green; normal walking returns to the chosen camera.
- Save preferences per edition with session fallback when storage is unavailable. Scores keep current device classifications and point formula. Local recovery schemas accept optional stamina for backward compatibility. Before a public release, review leaderboard versioning for the new sprint balance; this turn only builds a local preview.

## Work

- [x] Promote reusable movement/input and integrate GameScene, including candy, slowdown, keyboard and lifecycle tests.
- [x] Add settings persistence/UI and wire both game entries.
- [x] Add bounded camera math and putting override; resize both main layouts for portrait/landscape.
- [x] Run focused and full tests, both production build isolation checks, and live desktop/portrait/landscape UI checks.
- [x] Leave a playable local preview with explicit mobile-device acceptance still outstanding.

## Review focus

- Gesture events on canvas must not steal putting shots or button taps.
- Tap-to-world conversion must remain correct after zoom and follow scrolling.
- Resizing/rotating or returning from settings must never replay held input.
- Character speed, penalties, bonuses, scores and recovery must retain existing semantics.
- Portrait and short landscape must leave the game, pause and settings reachable without page scrolling during play.

## Verification and playtest handoff

- 627 tests pass. Both production editions build; asset separation and development-only practice exclusion checks pass. Invalid editions remain rejected. No backend changes, commit, PR or deployment in this pass.
- Browser SMF checks at 390×844 portrait and 844×390 landscape: swipe bursts, thumbstick steering, Shift sprint visibly spending charge, sensitivity at 115%, pause/resume, control switching and rotation. Generic checked at 1280×720 and 390×844, including swipe and full-floor framing. No app warnings/errors during those localhost checks.
- Camera/real TourScene tests cover Villagio walking-to-green transitions, framing the complete green in both orientations, and restoring the walking camera. Physical touch/multitouch, phone audio and actual iOS/Android browser performance still need device playtesting.
- Review corrections: reject taps on camera letterbox space; dispose input listeners on both scene shutdown and game destruction; keep optional stamina within 0–100 in strict recovery readers, accepting older checkpoints without the field.
- A real test of the LAN origin found that `crypto.randomUUID` is unavailable on HTTP addresses other than localhost. Added a Web Crypto `getRandomValues` UUID fallback for run/visit/optional event IDs; regression tests pass and Quick Rush now starts from the LAN address.
- Mac preview: `http://127.0.0.1:5193/?rehearsal&tour`. Phone preview (same network, Mac running): `http://192.168.14.143:5194/?rehearsal&tour`. Both use separate practice data and disable online posting/tracking. The HTTP LAN preview has no run recovery because Web Locks requires a secure context; it remains playable for the session. Preferences in rehearsal are session-only.
- Screenshots outside the repository: `/tmp/sidequest-main-portrait.jpg`, `/tmp/sidequest-main-landscape.jpg`. Playtesting starts in Settings → Movement & camera; choose swipe or thumbstick, compare sensitivity and framing, then rotate the phone.
- Subsequent completed-swipe correction: shared main/lab input now launches on release using the full screen-space stroke and rejects hesitation. Length independently sets burst duration, velocity sets speed. 638 tests and both edition builds pass, including adapter stamina/Sprint, intentional Dizzy inversion and native event timing regressions. Updated movement instructions and preview plan record browser checks and remaining physical-phone acceptance.
