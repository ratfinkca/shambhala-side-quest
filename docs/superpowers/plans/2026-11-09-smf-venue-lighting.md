# All-stage venue lighting pass

The owner approved a second pass after reviewing all six reference-guided illustrations. This slice makes those illustrated venues feel active and recognizable in the existing disposable rehearsal; it does not change targets, timing, collision, scoring or music.

## Visual direction

| Venue | Show signature |
| --- | --- |
| Living Room | Warm lamps and slow paired sweeps, jade/peach screens, cedar glow and river reflections. |
| Fractal Forest | Sequential neon pyramid/support chases and playful crossing fans. |
| Grove | Floating mandala light, breathing timber diamonds and slow teal/violet fans. |
| AMP | Stronger mirrored screen ribbons and crossed cyan/lime beams under the timber portal. |
| Pagoda | Surface-mapped geometric projections, roof illumination and symmetrical expanding fans. |
| Village | Six independently illuminated towers, CNC detail, cyan/plum panels and split-bank fans. |

The existing [asset references](../../../src/editions/assets/README.md) supply architecture and measured fixture anchors. This is original interpretive show choreography, not a reconstruction of a particular festival set. No new photo-date claims or art regenerations are needed.

## Implementation

1. Add a pure six-venue lighting cue model using canonical beats/bars, continuous build/drop envelopes and deterministic reduced-motion poses.
2. Replace the illustrated preview's common rig with layered feathered beams, local lamp sources, cedar edge light and quiet floor haze. Build geometry once; update transforms from active round time.
3. Strengthen artwork-specific surface animation without rotating structures or painting over speaker arrays, openings, dancers or pickups.
4. Preserve original canvas fallback lighting and generic renderer behaviour. Scene ownership must clean up every light on venue switches.
5. Check all six at phone and desktop sizes, running through a build/drop and pause/resume. Verify controls, reduced-motion pose, cleanup, errors, tests and production asset isolation. Physical-phone performance remains a separate playtest.

No full-screen flashes, fast brightness cuts, pickup-like decorative particles, new dependencies, saves, online writes or backend changes. The pass remains local and DEV-only until explicitly released with the SMF edition work.
