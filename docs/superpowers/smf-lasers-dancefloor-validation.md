# SMF lasers and separated dancefloors — local validation

Date: 2026-11-09. Branch: `codex/edition-split-plan`. Baseline: accepted fuller-sound commit `e795d86`. This is an isolated DEV venue preview; nothing was deployed.

## Implemented scope

- Six individual shows with eight moving heads, four laser banks, wider side origins and coordinated horizontal/vertical wave and figure-eight patterns. Energy follows complete musical sections instead of only the short scoring bonus.
- Village's six flower crowns occasionally send beams upward around phrase transitions. Eight tower LED faces now shine through fixed carved timber masks; the booth retains three exposed screens. This is a native overlay on the existing illustration, not a new raster asset.
- Fractal emphasizes wrapped neon pyramid/support chases with supporting lasers. Pagoda adds crossing grids and stronger mapped geometry. Living Room uses warm liquid mandalas; AMP uses mirrored sixfold tunnels; Grove retains radial canopy illumination and curtains.
- Physical stage-edge bounds plus matching apron/shadow. Venue-specific front rows, cabinets and pickup spaces are reauthored below the facade. Movement, destination taps, Dizzy, Sugar Rush, candy and magnetized pickups respect the floor. Targets, crowd counts, round clocks, scoring and bass slowdown remain unchanged.
- Generic movement/spawning defaults and non-SMF lighting remain unchanged. Missing-art sketches still have their existing fallback show.

## Automated and independent checks

- `npm test`: **374 passed, 0 failed**. Includes geometry/spawn/scene regressions, cue/rig lifetimes, mask containment and the edition checks.
- `npm run build`: passed. Existing large-bundle advisory remains.
- `npm run check:editions`: generic and SMF build, asset allowlist and static-reference checks passed; invalid edition rejected.
- `git diff --check`: passed.
- Independent lighting/geometry review: no blockers. Focused reviews passed 57 lighting/boundary tests, then 17 helper/view tests for the final tower-mask integration. Additional sampled mask-highlight interiors stayed within carved openings.
- Independent seeded comparison of 24,000 generic geometry/spawn cases against HEAD found identical results.
- Reduced-motion poses remain fixed; Village sky accents are disabled. Pause uses the stopped musical clock. These include automated coverage; no OS reduced-motion preference was changed for this pass.
- Lighting uses eight cached textures. Village's six additional crown heads reuse those textures; scene nodes/resources are disposed during switching. Screen and tower patterns use bounded geometry without allocating textures or masks each frame. Physical-phone rendering cost is not established by these tests.

## Running browser observations

Preview: `http://127.0.0.1:5191/?rehearsal&venues`.

- All six venues inspected at 390×844 and 1280×900 after the side-fixture and screen changes. Village rechecked at both sizes after its mask correction. Stage structure and actors remain readable; each venue has distinct light origins and architecture.
- Clicking Fractal's roof moved the player only to the stage edge, below the facade. A near pass scored 15; this observation did not collect a spark.
- Fractal paused at 30.917s across observations; resume advanced into its 32s drop. Brightness continued beyond the short score bonus.
- Village's upward flower-top cue visibly observed at 22.000–22.250s, Bar 16 Beat 4. Later parts of the round showed the crowns quiet, preserving the occasional effect.
- Switching through all six left one game canvas; no console warnings/errors. Phone width and desktop width had no horizontal overflow.
- Temporary viewport override was reset. Village is left selected and paused; Start fresh/Resume are available. Preview saves, XP, online scores and playtest tracking remain disabled.

Screenshots are local artifacts under `/Users/mother/.codex/visualizations/2026/10/13/01a1368f-7ce7-7722-a6bd-8509627b4e12/`: `lasers-<venue>-phone.jpg`, `lasers-<venue>-desktop.jpg`, and `village-flower-salute-desktop.jpg`. The browser's phone viewport is not a physical-device performance check.

## Open acceptance and next work

- Owner playtest of spectacle, stage-edge spacing and the denser lower-floor crowd routes. A visible preview is not final physical-touch or balance acceptance.
- Sustained physical-phone frame rate, thermal load and combined audio/visual performance remain unmeasured.
- Pagoda's original anime-inspired projection sequences remain planned art work, not implemented here.
- Next structural milestone remains the six-stage local Festival run/perk flow, followed by an edition-specific durable recovery/score contract. No backend changes are required for this preview.
