# All-stage visuals and lighting — local validation

2026-11-09. [Plan](plans/2026-11-09-smf-venue-lighting.md). Local branch `codex/edition-split-plan`; no release or backend changes.

## Result

All six illustrated rehearsal venues now own distinct phrase-driven lighting, brighter feathered beams, local sources, subtle cedar/haze/floor illumination and stronger architecture-specific projections. The six source JPEGs and photographic provenance are unchanged. This pass emphasizes the real architectural cues already established by the references; it is original choreography rather than a reproduction of a particular concert.

The common renderer exposes an optional lighting/disposal boundary. Illustrated SMF views use it; missing-art sketches and generic stages keep their prior lighting. Canvas beams are baked into four small rig-local textures, shared by 16 crossfading images, removing 672 beam-path fills per frame. Halos and architecture still use Graphics. WebGL keeps the vector path because Phaser's Canvas texture generator does not preserve its additive blend table identically. No target, geometry, scoring, timing, music, progression or online behavior changed.

## Verification

- Full test suite: **317 passing**, including all-venue bounded/deterministic cues, smooth bar/build/drop transitions, reduced-motion invariance, initialized first frames, texture cleanup, failed-bake cleanup, repeated switches and display-before-texture disposal.
- Default production build passed. Generic and SMF build/asset isolation checks passed; the full suite also checks these after the final code change. Existing large Phaser bundle warning remains.
- Independent review found two issues that were resolved: apply the first cue during rig creation to avoid default full-opacity beams before the first update, and retain vector drawing in WebGL instead of relying on Canvas-specific texture blend semantics.
- Live in-app browser: all six venues inspected at **390×844** and **1280×900**. Each selected correctly, displayed its art and live light rig, and kept the playfield/HUD readable. One game canvas remained present; desktop document width matched its viewport. No console warnings/errors in the final session.
- Village: click movement and spark collection reached score10; the running HUD progressed through cruise, build and `2× VIBES` while the lighting changed. AMP's drop was also observed. These are visual/function checks, not a balance trial.
- AMP pause retained `6.050s active` across separate observations; resume advanced to `6.283s` without reset. Repeated venue switches reset their individual clocks and changed the visual rig correctly.
- Final tab left on Fractal Forest, paused, with the viewport override reset. Preview: `http://127.0.0.1:5191/?rehearsal&venues`.

## Captures and limits

Phone and desktop captures for `living-room`, `fractal`, `grove`, `amp`, `pagoda` and `village` are saved as `all-stage-<venue>-phone.jpg` / `all-stage-<venue>-desktop.jpg` in `/Users/mother/.codex/visualizations/2026/10/13/01a1368f-7ce7-7722-a6bd-8509627b4e12`. Village's phone frame shows a running drop with score10. Incorrect transition-time captures for Living Room/Pagoda were replaced after confirming the selected scene.

Reduced-motion behavior was verified through rendering/cue tests, not by changing the host OS setting. Phone-sized browser checks are not physical-phone performance acceptance. Sustained mobile frame rate, touch comfort, real-device audio and the owner's final artistic acceptance remain open. Nothing was pushed, merged or deployed.
