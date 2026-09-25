# Shambhala Side Quest

A tiny, unofficial festival-inspired game: wander a glowing forest, collect good vibes, and chase your personal best in 60-second rounds.

## Festival Run

The game includes a title screen, wardrobe, independent music/effects volume controls, and local arcade scores. Play either mode using the GitHub Pages link above.

- **Quick Rush** keeps the original one-minute score chase.
- **Festival Run** has three one-minute stages: Living Forest (20 sparks), Neon Grove (25), and Sunrise Clearing (30). Qualification counts raw spark pickups in that stage. Play the whole minute, then choose an upgrade if you qualify. Scores accumulate across the run.
- Later stages add more dancers, solid speaker islands, and marked mud that slows movement. Click around speakers; pointer controls do not automatically find a route around obstacles.
- Between qualifying stages, choose Disco Boots (+10 base close-pass points), Pool Noodle (one protected bump per stage), Moth Charm (seven-second Flow), or Friendship Bracelet (three-second combo grace). Perks reset for each new run.
- Three onesies, three hats and three totem choices are free. Cosmetics do not change the hitbox or abilities.
- Sound defaults on for new players and begins on a Play interaction. An existing mute preference is preserved. Settings offer independent music/effects sliders; opening them during play pauses the game and requires explicit Resume.
- Results offer optional three-character arcade initials. Quick Rush and Festival Run each have a local top ten, stored only in this browser. No online leaderboard or cross-device sync is included. Historical best scores migrate; reloading abandons an unfinished run.
- Permanent cosmetic unlocks, currency/store, online rankings and endless mode are later milestones.

For development-only transition checks, run Vite and open `/?rehearsal`. The visible rehearsal controls can finish a stage with a qualifying or failing fixture. Scores and historical-best updates are disabled in that mode. Its module is excluded from production builds. Use normal play for difficulty/balance feedback.

[Play on GitHub Pages](https://ratfinkca.github.io/shambhala-side-quest/)

## Run

Use Node.js 24 for development and tests (the GitHub Actions workflow also uses Node 24).

```sh
npm install
npm run dev
```

Open the local address printed by Vite (normally http://127.0.0.1:5173).

## Play

- Move with WASD / arrows, point with your mouse, or tap and drag on the arena.
- Pick up glowing sparks. Collect within two seconds to keep your combo.
- Every five consecutive sparks raises your multiplier, up to 5×.
- Every fifteen total sparks earns a celebration.
- Thread through ten dancers: a clean close pass earns 15 points (30 during a drop). The faint ring shows the sweet spot. Bumping someone briefly halves your speed without subtracting points. Pass bonuses have a three-second cooldown per dancer and require you to move.
- A three-second build leads into drops at 15, 30, and 45 seconds. Each drop lasts four seconds: all rewards double and the crowd moves faster.
- The optional original 120 BPM synthesized groove follows the round. Higher combos add melody, and drops deepen the bass. Pause, mute, and round end stop the audio immediately.
- Escape or Pause takes a breather. Leaving the window pauses automatically; resume explicitly.
- Sound is optional. Scores and the sound preference save in this browser when storage is available.

## Checks and production build

```sh
npm test
npm run build
npm run preview
```

Vite writes the standalone static build to `dist`. Phaser accounts for most of the JavaScript bundle, so Vite reports a chunk-size advisory; the build succeeds.

## Publishing

GitHub Actions runs `npm ci`, `npm test`, and `npm run build` on pull requests to `main`. A push or merge to `main` runs the same checks and then deploys `dist` to GitHub Pages. Failed tests or builds prevent deployment. The workflow also supports manual runs from the Actions tab; only `main` can deploy.

Pages uses the **GitHub Actions** publishing source in repository Settings → Pages. Work on a feature branch, open a pull request, and merge it into `main` to publish the next version. The workflow is `.github/workflows/pages.yml`; Vite uses relative asset URLs so the game works under the repository's Pages path.

## Implementation

Phaser 3.90 + Vite with JavaScript modules. `src/game.js` owns basic rules, `src/festival.js` owns crowd encounters and drop timing, `src/Crowd.js` renders the dancers, `src/GameScene.js` coordinates the arena, and `src/main.js` connects menus and HUD. `src/music.js` defines the beat and `src/audio.js` synthesizes it from active game time. Run state, stage definitions, geometry, profile validation and menu transitions are separate testable modules. `Avatar.js` shares the wardrobe and player renderer; `StageRenderer.js` owns stage scenery. All artwork and audio are original and procedural. No tracking, accounts, remote scores, or external art/music assets.

Reduced-motion mode disables ambient pulses, decorative dancer swaying, trails, and bursts; dancers still travel because their positions matter to gameplay. The drop countdown and double-points indicator remain readable with sound and motion disabled. Storage and audio failures degrade gracefully. This is a personal fan project, not an official festival product.
