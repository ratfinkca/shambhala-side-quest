# Shambhala Side Quest — design for review

## Intent and scope
Build a simple, rewarding Shambhala-themed browser time waster. The user has roughly 20 minutes for this session. Prioritize a complete playable loop and immediate feedback. Assumptions: personal local play, original festival-inspired artwork, and no deployment requirement.

## Game loop
Start a 60-second round and steer a glowing dancer around a forest dance floor. Collect floating vibe sparks. Each spark gives 10 points times the current multiplier. Consecutive pickups within 2 seconds build a chain: every five pickups increases the multiplier by one, capped at 5x. Missing the chain window resets the chain and multiplier, but never subtracts points.

Every 15 total pickups triggers a brief bass-drop celebration with a particle burst and a playful message. This is visual feedback, not a separate game mode. Keep 12 collectible sparks on the floor, replacing each collected spark away from the player. The end screen shows score, best score, highest multiplier, and a prominent Play Again button. Restart clears all round state.

## Controls and presentation
Mouse or touch sets a movement target; the dancer travels toward it at a fixed speed. Arrow keys and WASD provide equivalent movement with diagonal speed normalized. Keep the player inside the arena. Touch dragging affects only the game surface. Pause on tab hiding and offer an explicit Resume action on return.

Use a responsive Phaser arena with a midnight purple background, stylized evergreen silhouettes, a small glowing stage, warm pink and mint sparks, and soft trails. Surround the arena with HTML controls and readable score, time, and combo indicators. On narrow screens, stack the HUD above the arena. Display clear controls before starting. Respect reduced motion by removing trails, pulses, and celebration bursts. Avoid rapid flashing and screen shake.

## Tech stack and architecture
Use Phaser 3.90 with JavaScript ES modules for the game, Vite for development and production builds, HTML/CSS for the surrounding interface, Web Audio for optional synthesized pickup tones and a minimal beat, and localStorage for the best score and sound preference. Audio starts only after user interaction and is muted by default. Phaser is the only runtime dependency. No backend, account, or external fonts. Use Vite to serve the game locally.

Files:
- `index.html`: accessible start, pause/resume, results, sound controls, and canvas.
- `styles.css`: responsive layout, color system, focus styles, reduced motion.
- `src/game.js`: pure round state, movement, scoring, collision, and timer logic.
- `src/main.js`: Phaser configuration, HTML controls, screen transitions, and persistence.
- `src/GameScene.js`: Phaser scene, input, procedural artwork, collisions, and effects.
- `src/audio.js`: optional synthesized audio and cleanup.
- `tests/game.test.mjs`: game-rule tests using Node's built-in test runner.
- `package.json`: Phaser dependency, Vite development dependency, and dev/build/test commands.
- `README.md`: launch instructions and controls.

The Phaser scene update supplies elapsed active time to the game model and renders its state. Simulation time stops when paused. Canvas coordinates use logical arena units independent of display size. Resizing changes rendering scale without resetting the round. Keep transient effects bounded and dispose or reuse audio nodes.

## Reliability and validation
If storage is unavailable or malformed, play continues with an in-memory best score. If audio is unavailable, the game remains playable silently. Prevent multiple animation loops across restarts and stop scoring after time expires.

Automated checks cover multiplier thresholds and cap, chain expiry, movement bounds and diagonal speed, timer expiry, and clean restart. Browser checks cover start → collect → finish → replay, keyboard and pointer movement, pause/resume, sound toggle, persistence, narrow-screen layout, and console errors. Verify a full round, not just that the page loads.

## Build sequence
1. Build the state model, game-rule tests, and basic playable arena.
2. Add the forest scene, particles, combo feedback, HUD, and results.
3. Add optional sound, best-score persistence, pause/resume, and responsive controls.
4. Run the rule tests and browser checks, fix material failures, and open the playable game.

This is a scope target rather than a guaranteed delivery time. If time is tight, simplify decorative art and omit the background beat before cutting the playable loop or verification.

## Explicit exclusions
No multiplayer, leaderboard service, login, shop, progression tree, licensed music, external image assets, or deployment. No claim of official festival affiliation.

## Approval
User approved the Phaser + Vite design and implementation plan on 2026-09-24. Implementation completed locally; optional background beat omitted in favor of pickup and celebration tones.


