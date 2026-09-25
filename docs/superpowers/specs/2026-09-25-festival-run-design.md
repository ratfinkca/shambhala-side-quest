# Festival Run: first playable milestone

Status: proposed design for user review. Implementation has not started.

## Intent and scope

Evolve the existing one-minute festival game into a short, replayable festival adventure. Preserve Quick Rush and its rules; add a three-stage Festival Run lasting three minutes of play plus untimed menu breaks. Keep Phaser, Vite, procedural artwork/audio, responsive arena, and static GitHub Pages hosting.

The user approved this direction and development on a feature branch. This document makes the first milestone concrete. Numerical balance values below are proposed starting values to verify through playtesting.

Included: title screen, saved audio settings, starter wardrobe, three stages, two upgrade choices, and separate local arcade leaderboards. Deferred: online submissions/accounts, cross-device saves, currency/shop, permanent unlock progression, endless mode, and a larger item catalogue.

## Screens and navigation

- Title: animated forest and avatar preview; Quick Rush, Festival Run, Wardrobe, Settings, and Local Scores. Respect reduced motion.
- Quick Rush starts the existing 60-second game with the selected appearance and no run upgrades. Existing personal best survives migration.
- Festival Run begins with a concise rules panel showing the stage-one spark target. Play explicitly starts the timer.
- Wardrobe and Settings return to their originating screen. Settings opened during play pause the round; closing settings leaves an explicit Resume action.
- Pause offers Resume, Settings, and Return to Title. Leaving an active run requires a small discard confirmation because its progress is lost.
- Stage completion shows collected sparks, target, stage score, and total. Qualifying stages one and two offer three upgrade cards and an explicit Next Stage button. No timer advances in menus.
- Failure or stage-three completion leads to results, optional local score entry, Play Again, and Title. Never automatically start another run.

## Audio

For a new player, sound is enabled by default, music volume 45%, effects 65%. Audio starts only after a user interaction. Preserve an existing saved mute choice. Settings provide master mute and independent labelled music/effects sliders from 0–100%, with keyboard operation and saved values.

Route beat voices through a music gain and pickup/drop/celebration sounds through an effects gain. Slider changes affect already-playing sounds. Pause, hidden-page state, and results stop scheduled voices. Unavailable audio or storage must not block play; rejected audio activation remains silent and can be retried by the Sound control.

## Wardrobe

Offer three starter onesies (classic lime, purple moth, rainbow), three hats (bucket, wizard, none), and three totems (star, mushroom, none), all freely available. A shared procedural avatar renderer drives the wardrobe preview and player character. Persist selections; apply changes on the next round. Hitbox, speed, and visibility of the player remain consistent across outfits.

Appearance is independent of run abilities. No wardrobe purchase or permanent power advantage is introduced in this milestone.

## Festival Run rules

Every stage lasts exactly 60 active seconds. The player completes the whole stage even if its target is reached early. Qualification uses that stage's raw spark pickups, including magnet-collected sparks; close passes and score multipliers do not count toward qualification. Targets and progress remain visible in the HUD.

| Stage | Initial target | Crowd | Layout and challenge |
| --- | --- | --- | --- |
| Living Forest | 20 sparks | 10 dancers | Familiar open clearing, green lanterns and existing crowd motion. |
| Neon Grove | 25 sparks | 14 dancers | Purple/cyan palette, two visible speaker islands that block movement; broad connected routes around them. |
| Sunrise Clearing | 30 sparks | 18 dancers | Amber/pink palette, three speaker islands and two marked mud patches that halve movement while crossed. |

Keep the 960×640 world and fit it to the viewport. Dancer spawn anchors must be distinct, rather than repeating the existing ten anchors. Sparks and Flow pickups spawn only in reachable open space, away from obstacles. The player begins in a clear safe region. Collision resolution supports sliding around speaker edges and prevents tunnelling during long frames. Mud and dancer bump slowdown never stack below half speed.

Retain drop timing at 15, 30, and 45 seconds and two Flow pickup windows per stage. Reset stage timer, chain, crowd encounters, temporary slowdown and Flow at each stage boundary; retain accumulated score and chosen upgrades. Stage scores contribute to a run total. End immediately after an unqualified stage or after stage three.

Lighting varies by stage, with slow moving beams and stronger drop colour changes. Beams are decorative, do not obscure pickups or hazard boundaries, and never strobe. Reduced motion uses static lighting while preserving meaningful moving characters.

## Upgrade choices

After each qualifying nonfinal stage, choose one of three cards. Each can be taken once per run; show its numerical effect. For the second choice, replace a previously chosen card with the fourth unchosen option so there are still three distinct choices.

- Disco Boots: clean close passes award 25 base points instead of 15; drop doubles this normally.
- Pool Noodle: first dancer bump each stage causes no slowdown; a visible shield marker shows whether protection remains. The contact still invalidates that close pass.
- Moth Charm: Flow State lasts seven seconds instead of five.
- Friendship Bracelet: combo grace lasts three seconds instead of two.

Effects apply from the next stage and are cleared for every new run. These are starting perks, not an equipment inventory. All displayed combo/Flow timers derive from the same configured values as the rules.

## Local arcade scores and persistence

Keep independent top-ten tables for Quick Rush and Festival Run. Entry is optional and clearly labelled “Saved on this device.” Accept three characters A–Z/0–9 with a default of AAA. Store initials, score, stages cleared, avatar choices, and completion date. Sort by descending score, then descending cleared stages, then earliest submission for ties. One submission per completed run; disable submission once saved. Render initials as text, never HTML.

Use a versioned validated profile for audio, wardrobe and both boards. Import existing `sidequest.best` and explicit `sidequest.sound` without losing them. Do not fabricate a named leaderboard entry for the historical best. Clamp volumes and reject malformed scores or unknown cosmetic IDs. Bound board length to ten. Storage errors retain session data and show a concise message if a requested score save cannot persist. Reloading abandons an unfinished run; it does not resume timers or grant a score.

## Implementation boundaries

- Keep pure rules separate from Phaser: stage definitions, run transitions, upgrade effects, score ranking, validation, and obstacle geometry can be tested with Node.
- Extend the round rules to accept explicit stage/perk configuration, defaulting to current Quick Rush values. Retain `festival.js` as the source of drop timing and encounter rules.
- Add a run controller owning current stage, total score, chosen perks, and completion/submission state. A single screen state controls title, playing, paused, settings, wardrobe, stage summary, upgrade selection, and results to prevent duplicate listeners or timers.
- Extract avatar rendering and stage rendering from GameScene. Crowd receives stage anchors/count; GameScene coordinates player movement, obstacles, pickups, effects and round events.
- Extend storage with migration/validation and extend audio with two gain buses. DOM menus/HUD use semantic controls, visible focus, and predictable focus restoration.
- Preserve responsive sizing; menus can scroll internally when needed while the arena stays in the viewport. No new rendering engine or backend dependency is needed.

## Verification and release

Automated checks cover legacy Quick Rush behaviour, exact stage-end qualification, score carryover, perk effects/reset, pause invariants, obstacle collision/spawn validity, storage migration/failure, score deduplication/ranking, and audio routing parameters.

Browser verification covers title-to-play navigation, all wardrobe options, default sound and saved mute, sliders, a failed run, a qualifying three-stage run, upgrade effects, results/score entry, reload persistence, return-to-title, fullscreen, and portrait/landscape/desktop layouts. Inspect reduced-motion behaviour and console errors. Tune spark thresholds through actual play before proposing release; record material balance changes.

Work on `codex/festival-run`. Deliver a local playable preview and passing tests/build for user playtesting before merging this larger change. Main continues to serve the current game. After the user accepts the preview, create/merge the PR using the existing Actions workflow and verify Pages. A future milestone can add persistent wardrobe rewards; online rankings require their own backend and validation design.
