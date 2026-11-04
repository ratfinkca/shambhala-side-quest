# M4 first slice — candy feel preview

User approved moving on after M3 and explicitly chose **Invert steering** for Dizzy. The first local M4 preview addresses that choice and the earlier feedback that Wavy Colours feels too faint.

- Dizzy reverses keyboard direction. For click/tap, mirror the destination once around the player and clamp it inside the arena; mirror an existing destination once when the candy takes effect. This mapping is the implementation recommendation, stated to the user. Each tap retains a stopping point; no automatic return toward the original tap on expiry. New taps return to normal when the effect ends. Collision rules remain unchanged.
- Wavy Colours gets stronger, slowly shifting liquid colour across the scenery, with a gentle entrance/exit. Characters, pickups, hazards, hitboxes and HTML HUD remain clear and undistorted. Reduced motion uses a static tint. Use existing Phaser graphics; no shader-only dependency or added packages.
- Keep candy opportunity, spawn window, duration, speed, Sweet Tooth and scoring unchanged. Do not infer balance from the empty recent telemetry sample. Bass tuning, recovery and cloud saves remain later work.
- A DEV-only candy lab starts a fresh no-save practice round with the selected real candy effect. Normal play cannot force outcomes; production excludes fixtures, scores/XP/analytics are disabled in practice.

Alternatives: continuously reverse a pointer's travel vector (rejected: a fixed tap becomes an unreachable anti-target); mirror destinations once (selected as the predictable click/tap interpretation). Full scene shader warping is deferred in favor of a readable, renderer-compatible colour effect.

Acceptance: reversal and expiry tests, pointer endpoints/bounds and collision safety, effect lifecycle/reduced-motion drawing tests, all existing tests/build, desktop/phone play preview and independent review. This is a local preview; do not publish M4 under the M3 shipping authorization.
