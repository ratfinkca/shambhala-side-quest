# Pixel animation lab implementation plan

> For agentic workers: use subagent-driven development for the independent artwork and preview tasks.

**Goal:** Deliver one animated pixel raver and pickup/reaction atlas in an isolated playable preview.

**Architecture:** Transparent ImageGen sheets plus named frame metadata; a pure animation state controller drives an isolated Canvas 2D rehearsal. Production stays unchanged.

**Tech Stack:** JavaScript modules, Canvas 2D, Vite, Node tests, ImageGen.

**Spec:** `docs/superpowers/specs/2026-11-13-pixel-animation-design.md`.

## Global constraints

- Dance-step at normal speed, playful run when sprinting.
- No production gameplay/profile/telemetry changes; dev-only route.
- Uniform scale and stable foot origin; no interpolated pixel rotation.
- No dependencies needed.

## Review focus

- AI grid/alpha and alignment are inspected, not assumed correct.
- No animation catch-up after backgrounding or pause.
- Turning near diagonals does not rapidly flip sprites.
- Narrow portrait and short landscape retain useful controls.
- Production artifact checks exclude the lab and art.

## Tasks

- [x] Generate and visually inspect raver/effects sheets; preserve prompts and provenance.
- [x] Provide `src/pixel-lab/artwork.js`: `loadPixelArtwork()` and `drawPixelFrame(ctx,artwork,clipName,frameIndex,x,y,scale,flipX)`; x/y is a stable foot anchor for characters, center for effects. Clip metadata supplies frame counts and rates.
- [x] Add independent preview/controller/styles with real tap/keyboard travel, sprint, clip selection, pause, scale and reduced-motion controls; use the same assets in the enlarged viewer and floor.
- [x] Guard preview route and verify it is absent from release builds.
- [x] Test state transitions/pause/facing, review generated loops in browser at desktop and phone sizes, fix observed faults.
- [x] Document reviewed scope, limitations and the next layering/production steps; present preview and sheets.

## Validation completed

- 2026-11-13: 835 full-suite tests passed with local mock-server access; 13 focused atlas/animation tests passed again after correcting the portable atlas pivots.
- Generic and SMF production builds, asset allowlists, static references and invalid-edition checks passed. Pixel lab markers and PNG assets are absent from both builds.
- Browser reviewed at desktop, 390×844 portrait and 844×390 landscape. Portrait puts the dancefloor first; the lab is a scrollable study page, not the fullscreen game UI.
- Inspected front/side/back clips, dance and run poses, left mirroring, frame stepping, movement, foot-anchor overlay, reduced motion and friendship/Bass Head effects. No relevant browser errors or warnings.
- Independent review found a portable-atlas pivot discrepancy caused by rounding cell dimensions; corrected pivots now resolve to the same absolute foot anchor as the Canvas renderer.
- Preview: `http://127.0.0.1:5194/?rehearsal&pixels`, or same-Wi-Fi phone `http://192.168.14.143:5194/?rehearsal&pixels` while the Mac's server is running. Address checked at preview time.

## Remaining art decisions / honest limits

The first outfit is baked together and the generated PNGs have some soft alpha edges. The sheets are suitable for a motion review, not yet final indexed-palette production masters. Side/back rest currently holds a neutral travel frame; only front idle and front dance have full loops. Left is mirrored. Stops decelerate into neutral poses, rather than using separately authored brake/recoil clips. The simple floor is deliberately for animation inspection; production controls, collision, score systems and venue assets are unchanged. Production expansion needs directional idle/reaction clips, final pixel cleanup, frame-aligned clothing/hat/totem layers and real-game integration after owner feedback.
