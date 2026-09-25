# Shambhala Side Quest

A tiny, unofficial festival-inspired game: wander a glowing forest, collect good vibes, and chase your personal best in 60-second rounds.

[Play on GitHub Pages](https://ratfinkca.github.io/shambhala-side-quest/)

## Run

Requires Node.js 22.12+ (tested with Node 24).

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

Phaser 3.90 + Vite with JavaScript modules. `src/game.js` owns basic rules, `src/festival.js` owns crowd encounters and drop timing, `src/Crowd.js` renders the dancers, `src/GameScene.js` coordinates the arena, and `src/main.js` connects menus and HUD. `src/music.js` defines the beat and `src/audio.js` synthesizes it from active game time. All artwork and audio are original and procedural. No tracking, accounts, remote scores, or external art/music assets.

Reduced-motion mode disables ambient pulses, decorative dancer swaying, trails, and bursts; dancers still travel because their positions matter to gameplay. The drop countdown and double-points indicator remain readable with sound and motion disabled. Storage and audio failures degrade gracefully. This is a personal fan project, not an official festival product.
