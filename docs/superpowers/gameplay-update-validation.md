# Gameplay update validation — 2026-10-14

## Scope

- Click/tap-only destinations; keyboard steering preserved.
- Organic mud shares its visible polygon with its half-speed boundary.
- Staggered speakers with circular cone-centered bass zones: 50% speed at the edge, 20% near a cone; slowdowns use the strongest factor, never multiply.
- Beat-synced ring/cone animation and visual-only character/pickup vibration, stronger nearby and during drops. Outer zone boundaries and collision positions stay fixed. Reduced motion disables these animations.
- Wrapped candy: 80% chance of one opportunity per round/stage, appearing between 12–40 active seconds for up to 10 seconds. Varied wrappers do not predict the random five-second speed, dizzy or wavy-colour effect. No direct score/spark credit, stacking or Flow attraction.
- Patched transitive source-map-js from 1.2.1 to 1.2.2 after npm audit reported an advisory; the updated installation reported zero vulnerabilities.

## Evidence

- All 55 Node tests and the Vite production build pass. Existing Phaser bundle-size advisory remains.
- Geometry tests cover mud boundaries/concave gaps, bass range and overlap, escape, safe pickup placement, connected routes and crowd clearance.
- Candy tests cover rarity boundary, availability/expiry, no stacking or score credit, effects/reset, steering, collision-safe speed and optional safe placement.
- Bass animation tests cover beat repetition, distance/drop intensity, reduced motion, bounded overlapping shake and unchanged input positions.
- Temporary Playwright checks against local Vite exercised mouse and emulated touch at 1366×768 and 390×844: click/tap destination changes, ignored hover/drag, keyboard override, stage navigation and rendering, bass escape and Flow collection from outside zones.
- Deterministic browser fixtures exercised all candy effects via mouse/tap collection, pause/resume, expiry, stage reset, no Flow attraction, static reduced-motion colours and readable effect countdowns.
- Sampled browser frames confirmed art offsets and inner-ring/cone animation while player/spark collision positions stayed fixed. Pause froze animation; reduced motion kept offsets zero. No runtime or console errors were observed.
- Independent read-only review of the complete change set found no blocking issues.

## Limits and next steps

Browser fixtures verified behavior, not human difficulty or fairness. Emulated touch cannot reproduce hand obstruction or device performance. The user playtested click/tap movement and reported improved input parity. Stage targets remain 20/25/30; further ordinary full-run playtesting should assess candy frequency, effect strength, bass slowdown and touch balance. Online/input-classified scores, Bass Head perks, audio-reactive ripples and improved music remain future work.

Deployment is verified separately after merging to main; local checks alone do not prove the published version is current.
