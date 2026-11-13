# Crowd collision comparison preview

**Goal:** Try moving through a tangible, responsive crowd before deciding whether collision belongs in the main game. This is the owner's requested feel experiment, not a production rules change.

**Initial comparison (superseded by the mixed-crowd iteration below):** A separate DEV-only `?rehearsal&collision` SMF entry uses the current fullscreen viewport, follow camera, three controls, stamina and Bass Head. Soft (22 combined world-unit contact distance) and Firm (28) share non-bouncy tangent sliding; a 20–32 slider tunes size. Off is the current non-blocking crowd baseline. Small body circles leave room for smooth passes. Reset when collision settings change. Start on Fractal, thumbstick, sound off, emotes on. No saving, recovery, analytics, online scores or permanent progression.

**Alternatives:** Solid full-sprite boxes would snag arms/totems; elastic shoving adds a second feel variable. Test small sliding circles first. Presets differ only in size. Dancers keep their authored paths; this is not a crowd simulation rewrite.


## Current iteration: personal space and making friends

The owner identified collision radius as an individual difficulty lever: the outer smooth-pass boundary remains 48 world units, while a larger inner collision circle leaves a narrower safe approach. Keep the stage's crowd mixed; increase stage difficulty by adding dancers. **NPCs never collide with, repel, or separate one another.** Only player-versus-NPC movement is resolved. Their existing authored paths can cross and overlap.

Preview defaults chosen for playtesting, not fixed production balance:

- Three stable personal-space types on each of the six main venue previews: small / medium / large, default combined radii **18 / 26 / 34**. The baseline slider shifts this mix; it never changes the shared 48-unit smooth-pass entry / 58-unit exit boundary.
- Four scored clean passes with the **same** dancer reduce only their radius to **75%, 50%, 25%, then 0%**. The fourth makes a friend the player can pass through, even at exact center. Other dancers keep their own collision circles. A bump does not remove earned friendship.
- Existing pass travel, cooldown, shielding, scoring and slowdown rules remain. External pushes earn no pass travel; friendship adds no score bonus. Zero-radius friends can still earn legitimate clean passes with normal travel and cooldown requirements.
- Small progress dots appear near a familiar dancer; a heart identifies a friend. Brief earned milestone reactions replace some ordinary chatter. Diagnostic circles show the inner personal space and fixed outer smooth-pass boundary.
- **Original / Busy (+6) / Packed (+12)** adds deterministic dancers while preserving the original stage, timing, speed, obstacles and mix. Placement respects scenery and initial arrival space, but deliberately does not exclude nearby NPCs. Counts range from 10–20 originally to 22–32 when packed.
- **Off** retains the original nonblocking comparison and disables friendship. Changing venue, density or baseline starts fresh; pause/resume, orientation and control changes preserve the current friendships. Friendships reset with each fresh preview round.
- Still a DEV-only isolated experiment: no profile, storage, recovery, analytics, online posting, merge or deployment. The global policy is intended for every dancefloor when integrated; the playable comparison currently includes the six main venues. Bonus-stage and ranked-run integration remains later work after feel acceptance.

**Validation:** 763 tests pass; both edition builds / asset allowlists / static references pass and exclude the preview. Independent review found no actionable issue. Tests cover per-person snapshots, shrinking and exact-center pass-through, overlapping NPCs remaining unchanged, other bodies still blocking, real encounter-to-friendship progression, collision denial, all-six density safety and no mutation of authored stages. Native phone-layout play shows mixed sizes, extra dancers, earned progress dots and ordinary pass/contact counts; physical iPhone feel and sustained performance remain owner playtest input.

## Interfaces and ownership

- Physics agent: new `src/crowd-collision.js` and focused tests. `createCrowdCollisionFrame({people,startMs,endMs,stage,timing,radius})` returns `resolveStep(position,direction,ms,{...arena,speed,progressStart,progressEnd})`, and `measurement(index)` returning `{contactRadius,nearest,physicalContact,travel}`. `people` uses canonical dancer order/IDs. Resolver changes position safely, returns `{drivenDistance}` excluding external pushes, and records piecewise closest approach. Relative moving-circle sweep/slide, static speaker/arena clearance, bounded iterations; idle players can be contacted. Measurements refer to the entire frame, not only the last slice.
- Hooks agent: add optional `resolveStep` to `advanceMotion`, invoked each <=5ms slice including zero travel, supplying normalized progress fractions. `createGameControls` forwards `scene.resolveMovementStep`. Normal-game path remains exactly unchanged when absent. `Crowd.update` passes `scene.crowdEncounterMeasurement?.(index)` to `updateEncounter` optional fifth argument. Measurement overrides contact radius/nearest/physical contact/player-driven travel, preserving encounter cooldowns, shielding, bump slowdown and score awards. Physical contact always spoils the pass; external pushes earn no travel.
- Root: isolated entry/routing/UI/emotes. Scene creates a frame in `movePlayer` using last elapsed time and current authored dancer interval, installs resolver/measurement hooks and calls normal movement. Off clears hooks. Pause after frame gaps above250ms before advancing. Emotes consume encounter results, at most two at once, per-dancer/global cooldowns, round-time fading and reduced-motion support. Applying controls clears gestures; applying collision/venue restarts deterministic sparks and round.

## Verification

- [x] Fast swipes cannot tunnel; moving dancer vs idle player, tangent slide, multi-contact, scenery pinning and bounds stay safe.
- [x] Contact spoils a pass, external push cannot farm a pass, shielding retains continuous-contact behavior; Off parity passes.
- [x] Portrait/landscape fullscreen, settings/pause/reset/rotation, all three controls and Bass Head remain reachable. Check running visual behavior and console.
- [x] No storage or service clients; DEV route and preview modules excluded from production; full tests/both edition builds pass.
- [x] Leave a same-network phone link. Keep unmerged for owner feel feedback.

## Initial preview handoff — 2026-11-13

Implemented on `codex/crowd-collision-preview`, following published PR #22. Nothing from this preview is merged or deployed.

- Mac: `http://127.0.0.1:5194/?rehearsal&collision`
- iPhone on the same network: `http://192.168.14.143:5194/?rehearsal&collision` (Mac preview server must remain running; network address can change).
- Start with **Soft**, then compare **Off** and **Firm**. Presets change body spacing, not push strength. Adjust the radius slider to tune it; contact circles show the combined center-to-center threshold. All three controls, sensitivity, steering hand and six main venues are available. Collision/venue changes reset a deterministic round and leave the menu open; Resume begins the comparison.
- Friendly short contact/smooth-pass reactions use round-time fading and cooldowns. Contact spoils a smooth pass, with the existing brief slowdown and shield rules; there is no new point deduction. Being pushed by a dancer earns no pass travel or sprint cost.
- 740 tests pass. Both production editions build and pass their asset/static-reference checks; neither ships this practice entry. Independent source review found no actionable issue after correcting Escape while a settings control has focus. A 30,000-frame probe across six venues found no speaker penetration or arena escape.
- Native browser at 390×844 and 844×390: rendered fullscreen floor/HUD, exercised tap, swipe and thumbstick, observed contact and clean-pass counters, changed venues/Off/Soft/Firm, and verified rotation pauses with time/points preserved, Escape resumes from the menu, and Bass Head activates. A full round ended at zero with the comparison summary and no auto-restart. No browser warnings/errors.

### Remaining feel decisions

Physical iPhone acceptance, sustained performance and multitouch feel remain owner playtest work. The collision solver keeps dancers on their authored paths; in a tight pin against scenery they may overlap visually rather than forcing the player through a speaker. Consider a crowd-yield response only if this appears in real playtests. Keep Soft/Firm out of public scoring until contact size and scoring-version treatment are agreed.

Screenshots from the native browser: `/tmp/sidequest-mobile-release/crowd-collision-phone.png` and `/tmp/sidequest-mobile-release/crowd-collision-landscape.png`. These show the contact-circle diagnostic enabled; it is off by default.
