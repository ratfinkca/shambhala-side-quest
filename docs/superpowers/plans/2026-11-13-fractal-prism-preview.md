# Fractal Prism Party — first feel preview

User requested a playable first preview before committing this sixth hideaway to Festival discovery and permanent rewards. This is a local experiment at `/?rehearsal&prism` on the SMF development server, not a production route or a backend change.

## The loop

- Walk up the short central ramp into an open-front timber pyramid. The front becomes a cutaway; landscape moves closer to the floor and phone portrait follows the player. Whole-pyramid framing is also available.
- Three floor sections use colour **and** distinct shapes: cyan diamond, magenta star, amber sun. Each charges a corresponding pyramid face.
- An active section changes on a four-bar phrase: eight seconds at 120 BPM. Accumulate three seconds of actual movement in that section to charge its face. Standing still or being pushed by the crowd does not charge it.
- Partial charge is kept. Completed faces stay lit and are skipped on subsequent cues. A completed face holds until the next phrase, rather than switching halfway through a musical bar. There is no failure countdown, precision beat input or score.
- Charge all three faces for a 3.5-second light celebration and a temporary Prismatic Aura try-on. The result screen requires a fresh, deliberate action. Keep dancing or start a fresh visit.

## Reused controls and practice options

Tap, directional swipes and the floating thumbstick use the main game's movement, collision, friendship and stamina implementation. WASD/arrows also work. Default crowd is nine dancers; six and twelve are comparison options applied on a fresh visit. Mixed collision sizes stay in place. Sensitivity, separate music/effects volume, mute and a gentler-light option are disposable settings. OS Reduce Motion is always respected. Pause, hiding the page or losing focus freezes the activity and music.

The first music bed reuses the original synthesized Fractal arrangement. It restarts on entry, aligning the floor cues to its 120 BPM clock, and loops without a round timeout. No artist recording is bundled. The original ImageGen pixel plate is documented beside the asset; floor geometry and live lighting are separate editable layers.

## Boundaries

This entry imports no profile, recovery, telemetry or leaderboard client. It does not read or modify character slots, discoveries, XP, wardrobe ownership or consent. The aura demonstrates the reward feeling using an existing cosmetic; a distinct permanent prize remains undecided. Reloading resets everything. Both production editions exclude the preview and its artwork. No production migration, invitation or catalogue changes are included.

## Feedback to gather

1. Does moving within a changing light cue feel like dancing, or like running in a box?
2. Is nine dancers a playful crowd? Compare six and twelve, especially with swipe and thumbstick.
3. Are the section shapes, charge bars and retained progress clear without reading the settings?
4. Is this a satisfying short detour after Fractal, and is the finale worth the effort?

Tune the activity from that feedback, then decide the permanent cosmetic and connect a fresh consumable invitation to Fractal's parent-stage completion. Keep its reward/scoring separate from the main run, as with the five existing bonuses.

## Preview verification

- Full suite: 993 tests passed. The final focused Prism/viewport pass covers 18 passing tests. Model checks include ramp-only entry, wall clipping, active movement, retained charge, musical cue boundaries, pause and full finale duration.
- Both edition builds, asset ownership and static-reference checks passed. Production checks explicitly reject Prism entry/UI/art leakage.
- Browser play completed all three faces, showed the finale and result screen, and resumed Keep dancing. Pause retained the cue and charges; entry notices expired. Tap, thumbstick and swipe were exercised through the actual interface.
- Responsive review covered 390 × 844 and 844 × 390. Rotation initially exposed a stretched internal canvas; reusing the main-game viewport resize helper fixed it, and both rotation directions were retested with matching internal/display sizes.
- Browser warnings/errors were empty after the final run. Independent review found no remaining concrete blockers. Physical iPhone gesture feel, audio balance and sustained phone performance still need user playtesting; desktop viewport checks do not establish those.
- This remains an unmerged local preview on `codex/fractal-prism-preview`. No backend or public deployment was performed.

## Integrated release

The accepted mechanics now feed the normal SMF invitation flow; see [integration and release](2026-11-14-prism-integration.md). The production reward is a new Prism Crown. The disposable preview retains its temporary aura try-on. Production now includes the shared activity and lossless artwork; development lab controls remain excluded.
