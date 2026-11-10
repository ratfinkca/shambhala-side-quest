# Villagio putting preview — 2026-11-10

## Implemented

The owner requested the putting mini-game and selected “Choose what feels best and build it” after the two-hole/eight-shot/control proposal. Villagio's exploration checklist is replaced by two actual putting holes on the accepted illustration. Drag anywhere opposite the shot to aim and set power, release inside to shoot. The active green is enlarged; rim rebounds and low-speed cup capture provide the challenge. Finish both cups within eight total shots to display a Golden Chicken Totem on the avatar back in the full room. No deadline; the existing phrase-complete original arrangement loops. A separate Next green button moves between holes.

Button aim/power controls and keyboard arrows/Space offer alternatives. Taps, short drags, drag-back and outside releases cancel without spending a stroke. A second pointer cannot replace the first. Accepted shots clear pending gestures, including when keyboard input interrupts a pointer drag. Pause/tab-hide freezes ball and clock while discarding unfinished aim. Reset/switch/reload clears all preview progress and the cosmetic.

## Automated evidence

- `npm test`: **463/463 passed** after integration and review fix.
- `npm run check:editions`: both generic and SMF builds, asset allowlists/static references, invalid-edition rejection passed. Production exclusion explicitly includes the putting UI/prize strings as well as all bonus plates.
- Physics tests exercise real shots into both cups, overspeed misses and rim rebounds, an eighth-shot win, exhausted shots, one-time reward, pause/resume/reset, deterministic frame partitioning, invalid inputs, and no progress from waiting/walking.
- Gesture tests exercise normalized power, taps/drag-back/cancellation, outside release, extra pointers, pause rejection, strength bounds, and a keyboard shot cancelling the held pointer before its later release.
- Independent review found one mixed-input double-shot issue. Added a failing reproduction and fixed accepted shots to cancel aim. Five gesture tests passed afterward; the full suite is green. No other material findings.

## Native browser play

Chrome, actual local DEV SMF preview at `http://127.0.0.1:5191/?rehearsal&bonus=villagio`:

- Desktop: dragged shots into both cups, used Next green, saw the win/reward.
- 390×844: tapped and released outside without spending strokes; completed both holes with drag gestures; saw the Golden Chicken Totem on the avatar and clear not-saved copy.
- Used the alternate power slider and Putt button to exhaust eight shots; verified retry result and disabled further shooting.
- Paused a rolling ball. Two canvas screenshots separated by other work were byte-identical. Resume continued that shot and settled it.
- Left a fresh visit running for65 seconds (beyond the old52.364-second round), then took a keyboard shot successfully; no countdown/automatic timeout.
- Switched to Rabbit Hole, moved to its first trinket and collected it; switched back to a fresh Villagio with correct camera and controls.
- At320×720: one canvas, document width320, no horizontal overflow. At390px the active green, instructions and Next green button are visible without scrolling.
- Final captured browser warning/error list empty. Preview left ready with viewport override reset.

Screenshots:

- `/Users/mother/.codex/visualizations/2026/10/13/01a1368f-7ce7-7722-a6bd-8509627b4e12/villagio-putting-phone.png`
- `/Users/mother/.codex/visualizations/2026/10/13/01a1368f-7ce7-7722-a6bd-8509627b4e12/villagio-putting-prize-phone.png`

## Boundaries and follow-up

These are real browser interactions at desktop/phone viewport sizes, not physical-phone touch or speaker-listening acceptance. No audio quality claim was made; existing mix controls remain in place. The eight-shot allowance, physics feel and camera framing are first-preview choices for owner playtesting.

No profile, wardrobe registry, permanent reward receipt, recovery, score, XP, telemetry, backend deployment or publishing changes. The cosmetic is displayed only in this disposable rehearsal. Full-tour discovery/return and permanent unlocks remain next integration work. The chicken tube is still scenery; a ride and squawk cue remain later polish.
