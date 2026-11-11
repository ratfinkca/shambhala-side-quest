# Bonus playtest polish implementation plan

**Goal:** Make Garden and Ikigai more skillful, restore Villagio exploration, and prevent dancefloor input from accidentally choosing post-stage actions.

**Architecture:** Keep activity rules in pure controllers, use the existing Phaser scene for exploration/green close-ups, and add a shared SMF finish presentation with a guarded Continue control above the frozen arena. Preserve generic gameplay, main score rules, existing rewards and old bonus checkpoints. No backend changes or dependencies.

**Approved scope:** Owner's whole-game playtest feedback in this chat. Preview accepted; owner subsequently authorized PR, merge and publication.

## Tasks

- [x] Garden/Ikigai: larger crowds, Garden carry-plus-clean-pass planting, five identifiable unlit lantern carriers; meaningful encounter/recovery tests. Files: bonus-practice config/state/activity-view; bonus tests.
- [x] Villagio: walking phase, proximity entry, zoom only for aim/rolling, return to wide view between greens; preserve legacy putting checkpoints. Files: putting state/view/input and tests.
- [x] Integrate walking and hints into tour and rehearsal scenes. Upgrade legacy six-dancer checkpoints without resetting the player's run or earned rewards.
- [x] Main and bonus finish presentation: retain arena, animate a gentle celebration, require a fresh Continue activation outside arena after a brief guard, then show perks/results. No timed auto-dismiss; honor reduced motion. Protect pointer-down-before-end, held/repeated keys and double clicks.
- [x] Verify focused and full tests, both builds, phone/landscape in-game previews, old saves, input gate and activity transitions. Independent review before reporting completion.

## Acceptance boundaries

Garden: proximity alone cannot plant; a bumped pass cannot plant; held seed survives failure; completed deliveries persist. Ikigai: ordinary dancers and already-lit lanterns give no additional progress. Existing cosmetic ownership survives. Villagio: arrival click cannot putt; pauses/reloads preserve walking or putting state and shot count. End screens: rapid dancefloor taps never select a perk, Continue is outside the field and rewards are awarded once. Main leaderboard receipts remain unchanged by bonus activities.

## Implemented outcome

- Secret Garden now has 12 dancers. A held seed plants only when a fresh smooth pass ends inside the enlarged garden bed; walking into the bed alone does not count. A collision takes precedence, and encounter guards survive recovery.
- Ikigai Mori now has 14 dancers, with five identifiable hand-carried lanterns. Smooth-passing an unlit carrier lights that lantern once; ordinary dancers and repeat passes do not advance the challenge.
- Villagio begins with the whole venue visible. Walking onto a green enters putting, aim/rolling use the close-up, and the view returns wide between holes. Walking and putting checkpoints remain recoverable.
- Tour and rehearsal instructions reflect the new mechanics. Legacy six-dancer Garden/Ikigai checkpoints expand their crowds while preserving the original encounters, progress and ownership; incompatible new checkpoints remain rejected.
- Main and bonus finishes retain the paused arena with a celebration or completion message. Continue sits above the field, becomes available after a short guard, and requires a fresh activation before perks or results appear. There is no automatic dismissal.

## Validation evidence

Confirmed locally:

- Full `npm test`: **562/562 passed**.
- `npm run check:editions`: **passed**, including generic and SMF builds and asset checks.
- Focused mechanics, recovery, finish-gate and tour-store tests passed, including real encounter geometry for Garden planting and legacy crowd migration.
- Independent integration review found no blocking end-of-stage race or checkpoint migration issue. The retained finish arena resizes with the viewport, and the laboratory finish HUD updates before committing the score.
- Browser playtest: Villagio completed naturally in **two shots across two holes**. The observed sequence was wide walking view → green close-up → wide between holes → second green close-up → win presentation retained until Continue.
- Browser playtest: a natural Ikigai smooth pass lit **1/5 lanterns**.
- Browser playtest: collected a Garden seed and planted it through a natural smooth pass into the bed (**1/3**). Full-goal completion and failure conditions are covered by controller tests.
- Main finish checked at **390 × 844** and **844 × 390**. Repeated taps on the retained dancefloor did not dismiss it or choose a perk. Deliberate Continue opened the perk selection with **0/4 perks active**. All summary text fits, Continue remains above the arena, and there is no horizontal overflow. A cramped short-landscape summary found during this check was corrected and rechecked.
- Final browser console check: no warnings or errors. User's normal profile remained separate from the tour lab; the viewport override was reset after testing.
- Final copy/style changes passed the finish tests again, both edition builds were rerun, and `git diff --check` passed.

Screenshots are stored outside the shipped assets at `/Users/mother/.codex/visualizations/2026/10/13/01a1368f-7ce7-7722-a6bd-8509627b4e12/`:

- `stage-finish-phone.png`
- `stage-finish-landscape.png`
- `garden-delivery-phone.png`
- `ikigai-lantern-phone.png`

Physical-phone comfort, the pacing of three Garden deliveries and five lantern passes, and the owner's subjective difficulty feedback remain playtest inputs. Browser checks used phone-sized viewports, not a physical phone. Legacy save migration was verified with saved-state fixtures; no live user save was reset for testing.

**Release status:** Preview accepted and publication authorized. Release checks cover the combined generic/SMF Pages artifact. No backend changes are needed; deployment success and public verification are recorded with the release PR.
