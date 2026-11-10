# SMF lasers and separated dancefloors — implementation plan

**Goal:** Give each of the six main venues a more spectacular, musical light show and keep players/pickups off the illustrated stage.

**Direction:** The owner approved the fuller sound and requested flashier lights/lasers next, retaining the earlier preference against frantic strobing. The illustrated stage fronts now extend below the old gameplay limits; this is a real SMF rehearsal layout mismatch. Keep the existing 960×640 canvas and approved illustrations, reserve a venue-specific stage apron, and reauthor the front-row positions into the dancefloor. Enlarging the canvas would change framing and touch scale; compressing the artwork would break measured projection alignment. Both are unnecessary for this preview.

**Architecture:** Optional physical `playBounds` and pickup bounds are supplied only by SMF stages. Common geometry/movement defaults remain identical for the generic game. Venue lights retain their disposable renderer boundary; cached narrow laser rays complement the moving-head textures. Surface projections use the same musical cue envelope. No new dependencies, backend changes or production SMF play.

## Tasks

- [x] Author per-venue floor limits, preserve reachable pickup/Flow space, reposition affected cabinets/crowd anchors, and test movement/spawn/candy/magnet boundaries plus generic defaults.
- [x] Add bounded cached laser banks and stronger venue-specific moving heads. Tie smooth energy to whole musical sections, including Village half-time/dawn; keep reduced motion static and all decoration behind gameplay.
- [x] Add a subtle stage-front lip/shadow matching each venue, and strengthen measured architectural projections/chases without bleaching the original structure or covering speaker openings.
- [x] Review code and inspect all six running at phone/desktop size. Check movement against the stage edge, click destinations, pause/resume, stage-switch cleanup, reduced-motion invariance, source isolation and a live build/drop. Run focused/full tests and both edition builds.
- [x] Record validation and open physical-phone/owner acceptance limits, update the handoff and roadmap, and save a local commit. Leave a playable preview; publishing is not requested.

## Visual signatures

Living Room: warm river-clearing fans with restrained teal laser accents. Fractal: emerald/magenta interleaving geometric fans and pyramid/support chases. Grove: teal/violet curtains with radial mandala illumination. AMP: sharp cyan/lime sheets and coordinated broad LED-wall shapes. Pagoda: prismatic symmetrical crown fans and mapped facade rosettes. Village: opposing ice-blue/amber searchlights, dense drop fans and climbing tower illumination, easing for the half-time/dawn passages.

## Review focus

- Every target, autonomous dancer and magnetized pickup stays on reachable floor; stage apron must never create unreachable collectibles.
- Camera/world size and generic recovery/scoring remain unchanged; SMF preview density needs owner playtesting after reauthoring.
- Lasers read as light, not collectible sparks; stage art and moving actors remain distinguishable on phone screens.
- No strobe, whole-screen white flash, frame-time resource allocation or stale texture use on switching. Reduced motion freezes all decorative shows.
- Build/drop transitions are smooth and follow musical phrases instead of the short score multiplier window. Pause freezes show time.

## Owner steering during the preview

- Use side towers/outer structures as actual light origins, not just the booth. Each illustrated venue now supplies two measured outboard mounts; Village also supplies all six flower crowns for occasional upward salutes.
- Add vertical aiming and fun coordinated crossing patterns: rising/falling fans, wave and figure-eight motion, smooth opening/closing sheets; preserve readable play and phrase timing.
- Village's flower-top sky beams are occasional phrase accents, with a quiet reduced-motion presentation.
- Pagoda favours crossing laser grids and facade mapping. Anime-inspired movie-mask projection sequences are recorded for a later art/choreography pass, not implemented in this preview. Use original projected imagery confined to measured facade surfaces, timed to a breakdown or special phrase.
- Living Room LED panels now use slow warm liquid mandalas; AMP walls use sharper sixfold mirrored tunnels. Original procedural patterns stay inside measured LED insets. Fractal remains primarily neon roof/pyramid/support chasers, complemented by lasers.

- Village correction: eight tower LED faces now shine through fixed CNC-style wooden masks. Three booth panels stay exposed; the original source plate remains replaceable.

## Completion

Implemented and locally verified; see [validation](../smf-lasers-dancefloor-validation.md). Physical-phone performance and owner playtest acceptance remain open. No release or backend work.
