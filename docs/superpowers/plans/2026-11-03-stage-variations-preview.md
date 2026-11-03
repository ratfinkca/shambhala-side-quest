# M2 stage variations — first playable preview

User authorized a local first preview from the roadmap. Keep first-loop/Festival/Rush geometry, scoring, target/speed/count caps, stage music and four-perk rules unchanged.

1. Build six data-driven layouts: Creekside Drift/Mushroom Weave (Forest), Stereo Split/Crossfade Alley (Neon), Golden Islands/Last Dance Lane (Sunrise). Loop2 uses first variants; loop3 uses second; alternate thereafter. Fixed layout identity for each stage index, no mid-stage randomness. Speaker/mud footprints and Flow points are authored; crowd anchors remain clear throughout their motion.
2. Add tests before code for original first loop, deterministic variant cycle, exact crowd counts/caps, connected pickup region, safe player/Flow/spawn positions and cabinet-free dancer motion. Refactor organic puddle helper for reuse.
3. Show variation name in rules/HUD and add a DEV-only rehearsal layout selector. Selecting a layout starts a fresh practice stage at the corresponding index; scores/XP/analytics stay disabled. Keep production builds free of preview controls.
4. Carry layout identity through optional Endless stage measurements, with a backward-compatible schema extension and strict allowlist. Old schema2 payloads without layout remain accepted; original modes unchanged. Extend private raw report breakdown, no new migration unless necessary.
5. Full tests/build, geometry checks, desktop/phone browser QA and independent review. Record coverage and remaining balance questions. Keep local preview running for user playtesting; no PR/merge/publish in this task.

First-preview acceptance: reachable spark area/Flow, clear spawn, exact scaling, six distinct layouts, reliable picker/pause/finish, no saved progression/online records from rehearsal. Physical touch balance and final encounter art remain playtest questions.

## Local preview acceptance — 2026-11-03

All five implementation steps complete locally.155tests and build pass; production output excludes Layout lab/rehearsal controls. Independent review found no actionable blockers/minors. Tests cover six deterministic variants, original first loop,36later stage indices with exact crowd caps and cabinet-free movement, flood-filled pickup space and250seeded pickup samples per layout, safe spawn/Flow, preview IDs, telemetry allowlists/legacy payloads and private report grouping.

Browser at5181 loaded all six via picker, observed rules/name/target changes and distinct geometry.390x844check: HUD label wraps, timer remains visible, picker works; destination steering/bump feedback, pause/resume and voluntary finish verified. Rehearsal result shows score saving disabled and0XP. Reload keeps selected layout link and resets practice. No console errors/warnings. Screenshots:/tmp/m2-{forest-weave,neon-stereo,neon-crossfade,sunrise-islands,sunrise-lane}.png and/tmp/m2-creekside-preview.png; phone:/tmp/m2-last-dance-mobile.png.

Limits: no physical touch/audio performance or complete human-played qualification run is claimed; qualify fixture verifies transitions, not balance. Preview has no perks initially. Local server remains running for user playtest. Production remains M1. Before shipping M2, deploy updated playtest/shared variations module, then frontend after CI; no SQL migration/arcade scoring change required.
