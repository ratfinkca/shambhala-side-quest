# Shambhala Side Quest

A tiny, unofficial festival-inspired game: wander a glowing forest, collect good vibes, and chase your personal best in 60-second rounds.

## Festival Run

The game includes a title screen, wardrobe, independent music/effects volume controls, and local plus optional online arcade scores. Play either mode using the GitHub Pages link below.

- **Quick Rush** keeps the original one-minute score chase.
- **Endless Festival** repeats Forest → Neon → Sunrise in one-minute stages until a spark target is missed, or choose **Finish run & save score** to bank completed stages (unfinished-stage points are excluded). Targets rise by 3 per loop to a cap of 45; crowd counts rise by 2 per loop to 22 and movement rises to +20%. Four active perk slots allow optional swaps, or keep the current build. Completed stages award XP. Its local top ten and optional online top 50 rank stages cleared first, then score. Online entries use three initials, include input type, and require a connected start and posting within 24 hours (up to 1440 recorded stages). Stage variations remain future work. Reloading discards an unfinished run.
- **Festival Run** has three one-minute stages: Living Forest (20 sparks), Neon Grove (25), and Sunrise Clearing (30). Qualification counts raw spark pickups in that stage. Play the whole minute, then choose an upgrade if you qualify. Scores accumulate across the run.
- Later stages add more dancers, solid speaker islands, and marked mud that slows movement. Click around speakers; pointer controls do not automatically find a route around obstacles. At full exposure, amber bass zones reduce speed from 50% at the edge to 20% near the cabinets. Mud and bumps never multiply this slowdown. Three existing sparks prefer safe positions near the bins; Flow can pull them from outside the zone. Bass rings, cones, and nearby character/pickup artwork vibrate on the 120 BPM beat, more strongly near speakers and during drops. The outer boundary and collision positions stay fixed. Reduced motion keeps the zone markings and artwork static.
- Between qualifying stages, choose any available unowned perk: Disco Boots (+10 base close-pass points), Pool Noodle (one protected bump per stage), Moth Charm (seven-second Flow), or Friendship Bracelet (three-second combo grace). Four additional run perks unlock with Rave Experience: Crowd Surfer (300 XP, +25% speed for 1.2 seconds after clean passes), Bass Battery (650 XP, +50% Bass Head charge rate), Encore (1,200 XP, first collected Flow per stage lasts three extra seconds), and Sweet Tooth (2,000 XP, all candy effects last seven seconds). Encore stacks with Moth Charm. All eight are available in development rehearsal; normal runs offer only earned, unowned choices. Perks reset each run; new players earn Pool Noodle at 100 Rave XP and Moth Charm at 300 XP. Existing players retain all four choices.
- Bass Head is an earned special, not a selected perk. Bass exposure builds from 90% speed toward the distance-based 20–50% floor over six seconds. Outside bass, movement recovers immediately and exposure fades fully over three seconds. Ten accumulated seconds in bass earns one charge; press B or tap Bass Head to spend it for six seconds of bass immunity and 2× spark points when both you and the spark are inside bass. Mud/bumps still apply. Combo/drop bonuses stack; each spark still counts once toward qualification. No charging during activation. Unspent charge carries between stages, while exposure and active effects reset; a new run clears everything.
- The wardrobe offers nine onesies, nine hats and nine totems, plus three earnable visual flourishes. New players unlock expanded choices with Rave Experience and achievements; existing saves retain all previously available pieces. Cosmetics do not change the hitbox or abilities.
- Sound defaults on for new players and begins on a Play interaction. An existing mute preference is preserved. Settings offer independent music/effects sliders; opening them during play pauses the game and requires explicit Resume.
- Results offer optional three-character arcade initials. Quick Rush and Festival Run each have a local top ten, stored only in this browser. An optional initials-based online board offers separate Quick Rush and Festival Run rankings; playtest sharing is independent and opt-in. Cross-device profile sync is not included. Historical best scores migrate; reloading abandons an unfinished run.
- Rave Experience, cosmetic achievements and device-local progression are included; currency/store, Endless stage variations and cloud profile sync remain later milestones.

For development-only transition checks, run Vite and open `/?rehearsal`. The visible rehearsal controls can finish a stage with a qualifying or failing fixture. Scores and historical-best updates are disabled in that mode. Its module is excluded from production builds. Use normal play for difficulty/balance feedback.

[Play on GitHub Pages](https://ratfinkca.github.io/shambhala-side-quest/)

## Music and lighting

Each stage has its own procedural arrangement and six stage-mounted moving beams. Living Forest uses spacious minor chords and soft percussion; Neon Grove uses offbeat bass, clipped synths and narrow pink/cyan sweeps; Sunrise Clearing uses major chords, rising bells and broad amber/rose fans. Builds and drops share the game clock; reduced motion uses static lighting. Reward pacing, audio mix and sustained phone performance remain playtest targets.

## Run

For current project status, architecture, remaining validation and proposed milestones, start with [Project handoff and roadmap](docs/PROJECT-HANDOFF.md).

Use Node.js 24 for development and tests (the GitHub Actions workflow also uses Node 24).

```sh
git clone https://github.com/ratfinkca/shambhala-side-quest.git
cd shambhala-side-quest
npm ci
npm run dev
```

Open the local address printed by Vite (normally http://127.0.0.1:5173).

No environment file, API keys or backend setup is required. Browser saves stay on the device/browser where they were created; cloning the repository does not transfer player scores or settings.

## Play

- Move with WASD / arrows, or click / tap a destination on the arena. Each click or tap sets a new destination; hovering and dragging do not steer.
- Pick up glowing sparks. Collect within two seconds to keep your combo.
- Every five consecutive sparks raises your multiplier, up to 5×.
- Every fifteen total sparks earns a celebration.
- Thread through ten dancers: a clean close pass earns 15 points (30 during a drop). The faint ring shows the sweet spot. Bumping someone briefly halves your speed without subtracting points. Pass bonuses have a three-second cooldown per dancer and require you to move.
- A three-second build leads into drops at 15, 30, and 45 seconds. Each drop lasts four seconds: all rewards double and the crowd moves faster.
- The optional original 120 BPM synthesized groove follows the round. Higher combos add melody, and drops deepen the bass. Pause, mute, and round end stop the audio immediately.
- Mystery ground-scores look like wrapped candy with varied colours and patterns. Each round/stage has an 80% chance of one appearance, between 12 and 40 active seconds; it disappears after 10 seconds. Walk over it for a random five-second Sugar Rush (2.5× speed), Dizzy steering wobble, or Wavy Colours effect. No direct points or spark credit, no stacking, and Flow never attracts candy. The footer shows the effect countdown. Pause freezes it; stage changes and round end clear it. Reduced motion uses a static tint instead of moving colour ribbons.
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

Phaser 3.90 + Vite with JavaScript modules. `src/game.js` owns basic rules, `src/festival.js` owns crowd encounters and drop timing, `src/Crowd.js` renders the dancers, `src/GameScene.js` coordinates the arena, and `src/main.js` connects menus and HUD. `src/music.js` defines the beat and `src/audio.js` synthesizes it from active game time. Run state, stage definitions, geometry, profile validation and menu transitions are separate testable modules. `Avatar.js` shares the wardrobe and player renderer; `StageRenderer.js` owns stage scenery. Arena artwork and audio are procedural. Forest Freakout uses original generated illustrations and locally served OFL fonts (see public/ASSETS.md). No tracking, accounts, or remote scores.

Reduced-motion mode disables ambient pulses, decorative dancer swaying, trails, and bursts; dancers still travel because their positions matter to gameplay. The drop countdown and double-points indicator remain readable with sound and motion disabled. Storage and audio failures degrade gracefully. This is a personal fan project, not an official festival product.

## Festival styles

Forest Freakout is the first implemented style: illustrated title, perk cards, forest menu backdrop, warm HUD and local typography. Choose **Festival Style** from the title screen. The saved **Surprise me each run** option chooses only completed styles once per new run and keeps that choice across stages. Moonlit Mycelium is also available, with luminous storybook art, serif headings and midnight-blue menus. Neon Field Trip completes the trio with electric sticker art, bright perk cards and a purple HUD. Surprise can choose any of the three styles. Existing scores, outfits and audio settings are preserved.

### Optional playtest sharing (not yet enabled publicly)

The tracking feature is off by default. When a verified endpoint and data notice are configured, players can opt into compact gameplay summaries and stop sharing in settings. Local scores and gameplay do not require consent. See [operations and setup](docs/online-operations.md). Online arcade scores remain a separate planned feature.

Online arcade implementation is available behind `VITE_ARCADE_ENABLED` and `VITE_ARCADE_URL`. It uses three-character initials, separate Rush/Festival top-50 boards, and explicit posting independent of optional analytics. Backend release checks passed; production enablement uses repository configuration. See `docs/online-operations.md`.
