# Shambhala Side Quest

A tiny, unofficial festival-inspired game: wander a glowing forest, collect good vibes, and chase your personal best in 60-second rounds.

Two editions share the same engine. The original generic game stays at the site root; the SMF public test build is published at `/smf/`. See the [two-edition roadmap](docs/EDITION-ROADMAP.md) and [release validation](docs/superpowers/smf-feature-parity-validation.md).

**Pixel art and Character selection:** The Character screen adds four starter looks, three faces,
four hairstyles and six skin tones alongside existing clothes, hats, totems and
earned effects. Appearance is saved on this device; starter looks keep equipped
clothing. Hat sockets and held-item grips follow the animated body. See the
[implementation and release checks](docs/superpowers/pixel-world-validation.md).

**Arcade welcome:** New profiles start with
Neon Field Trip; existing themes and recovered runs retain their choices. First
Play guides new players through Character confirmation while keeping their chosen
mode. Pixel-styled controls, illustrated **How to play** cards and an optional
15-second, four-step sprite demo introduce sparks, smooth passes, bumps and Bass
Head. A short skippable arrival and original 32-bar menu groove accompany the
menus, and AMP backstage has a new illustrated pixel scene.

The title's **Install app** button offers short iPhone/iPad, Android and desktop
instructions, plus a native install action when the browser provides one. Each
edition includes its own app manifest identity and shared home-screen icons for
standalone launch. Play still requires an internet connection. See the
[implementation plan](docs/superpowers/plans/2026-11-14-arcade-welcome.md).

## SMF public test edition

[Play the SMF edition](https://ratfinkca.github.io/shambhala-side-quest/smf/): six main venues, five discoverable bonus parties, permanent souvenirs, venue-specific artwork, original synthesized music and animated lighting. Festival Run visits all six venues; Quick Rush shuffles through those venues without immediate repeats and saves separate best scores for each; Endless repeats the six-venue route with rising difficulty and four active perk slots.

Pause/resume, interrupted-run recovery, wardrobe progression, three visual themes, independent music/effects controls, local initials boards and optional online boards are included. SMF saves, scores and opt-in playtest sharing are separate from the generic edition. Bonus visits do not increase the main score. Recorded-track auditions and accelerated rehearsal tools remain local development features.

The feature details below describe the **generic edition**. Build both published editions with `npm run build:pages`.

## Festival Run

The game includes a title screen, wardrobe, independent music/effects volume controls, and local plus optional online arcade scores. Play any mode using the GitHub Pages link below.

- **Quick Rush** keeps the original one-minute score chase.
- **Endless Festival** repeats Forest → Neon → Sunrise in one-minute stages until a spark target is missed, or choose **Finish run & save score** to bank completed stages (unfinished-stage points are excluded). Targets rise by 3 per loop to a cap of 45; crowd counts rise by 2 per loop to 22 and movement rises to +20%. Four active perk slots allow optional swaps, or keep the current build. Completed stages award XP. Its local top ten and optional online top 50 rank stages cleared first, then score. Online entries use three initials, include input type, and require a connected start and posting within 24 hours (up to 1440 recorded stages). From loop two, six deterministic layouts alternate speaker/mud arrangements and crowd anchors, with two variations per base stage. Endless recovery restores an interrupted run paused on this browser when storage and browser coordination are available; Rush/Festival reload recovery is not included.
- **Festival Run** has three one-minute stages: Living Forest (20 sparks), Neon Grove (25), and Sunrise Clearing (30). Qualification counts raw spark pickups in that stage. Play the whole minute, then choose an upgrade if you qualify. Scores accumulate across the run.
- Later stages add more dancers, solid speaker islands, and marked mud that slows movement. Click around speakers; pointer controls do not automatically find a route around obstacles. At full exposure, amber bass zones reduce speed from 50% at the edge to 20% near the cabinets. Mud and bumps never multiply this slowdown. Three existing sparks prefer safe positions near the bins; Flow can pull them from outside the zone. Bass rings, cones, and nearby character/pickup artwork vibrate on the 120 BPM beat, more strongly near speakers and during drops. The outer boundary and collision positions stay fixed. Reduced motion keeps the zone markings and artwork static.
- Between qualifying stages, choose any available unowned perk: Disco Boots (+10 base close-pass points), Pool Noodle (one protected bump per stage), Moth Charm (seven-second Flow), or Friendship Bracelet (three-second combo grace). Four additional run perks unlock with Rave Experience: Crowd Surfer (300 XP, +25% speed for 1.2 seconds after clean passes), Bass Battery (650 XP, +50% Bass Head charge rate), Encore (1,200 XP, first collected Flow per stage lasts three extra seconds), and Sweet Tooth (2,000 XP, all candy effects last seven seconds). Encore stacks with Moth Charm. All eight are available in development rehearsal; normal runs offer only earned, unowned choices. Perks reset each run; new players earn Pool Noodle at 100 Rave XP and Moth Charm at 300 XP. Existing players retain all four choices.
- Bass Head is an earned special, not a selected perk. Bass exposure builds from 90% speed toward the distance-based 20–50% floor over six seconds. Outside bass, movement recovers immediately and exposure fades fully over three seconds. Ten accumulated seconds in bass earns a full charge; press B or tap the on-field Bass Head control at 25% or more to spend all charge for proportional bass immunity (1.5 seconds at 25%, three at half, six at full) and 2× spark points when both you and the spark are inside bass. Mud/bumps still apply. Combo/drop bonuses stack; each spark still counts once toward qualification. No charging during activation. Unspent charge carries between stages, while exposure and active effects reset; a new run clears everything.
- The wardrobe offers ten onesies, ten hats and ten totems, plus four earnable visual flourishes. New players unlock expanded choices with Rave Experience and achievements; existing saves retain all previously available pieces. Cosmetics do not change the hitbox or abilities.
- Sound defaults on for new players and begins on a Play interaction. An existing mute preference is preserved. Settings offer independent music/effects sliders; opening them during play pauses the game and requires explicit Resume.
- Results offer optional three-character arcade initials. Quick Rush and Festival Run each have a local top ten, stored only in this browser. An optional initials-based online board offers separate Quick Rush, Festival Run and Endless rankings; playtest sharing is independent and opt-in. Cross-device profile sync is not included. Endless voluntary finishing banks only completed stages; unsaved results require confirmation before replay/title navigation. Historical best scores migrate; reloading abandons an unfinished run.
- Rave Experience, cosmetic achievements and device-local progression are included; M3 adds four Endless souvenirs; currency/store and cloud profile sync remain later milestones.

For development-only transition checks, run Vite and open `/?rehearsal`. The visible rehearsal controls can finish a stage with a qualifying or failing fixture. Scores and historical-best updates are disabled in that mode. Its module is excluded from production builds. Use normal play for difficulty/balance feedback.

[Play on GitHub Pages](https://ratfinkca.github.io/shambhala-side-quest/)

## Music and lighting

Each stage has its own procedural arrangement and six stage-mounted moving beams. Living Forest uses spacious minor chords and soft percussion; Neon Grove uses offbeat bass, clipped synths and narrow pink/cyan sweeps; Sunrise Clearing uses major chords, rising bells and broad amber/rose fans. Builds and drops share the game clock; reduced motion uses static lighting. Reward pacing, audio mix and sustained phone performance remain playtest targets.

## Run

For current release and architecture, start with the [project handoff](docs/PROJECT-HANDOFF.md). The [roadmap](docs/ROADMAP.md) defines the next milestones; [operations](docs/online-operations.md) covers backend deployment, consent and reporting. Historical plans are indexed in [docs](docs/README.md).

This release includes M1 Endless insights: optional stage/outcome and perk-choice measurement with private aggregate reports. Its migration and playtest function were deployed before frontend rollout. M2 adds six stage variations from loop two; its layout-aware playtest validator deploys before the frontend. M3 adds four Endless achievement rewards; see the roadmap and release evidence.

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
- Mystery ground-scores look like wrapped candy with varied colours and patterns. Each round/stage has an 80% chance of one appearance, between 12 and 40 active seconds; it disappears after 10 seconds. Walk over it for a random five-second Sugar Rush (2.5× speed), Dizzy reversed steering, or Wavy Colours effect. No direct points or spark credit, no stacking, and Flow never attracts candy. The footer shows the effect countdown. Pause freezes it; stage changes and round end clear it. Reduced motion uses a static tint instead of moving colour ribbons.
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

Phaser 3.90 + Vite with JavaScript modules. `src/game.js` owns basic rules, `src/festival.js` owns crowd encounters and drop timing, `src/Crowd.js` renders the dancers, `src/GameScene.js` coordinates the arena, and `src/main.js` connects menus and HUD. `src/music.js` defines the beat and `src/audio.js` synthesizes it from active game time. Run state, stage definitions, geometry, profile validation and menu transitions are separate testable modules. `Avatar.js` shares the wardrobe and player renderer; `StageRenderer.js` owns stage scenery. The pixel preview combines generated character/prop atlases and venue plates with editable wardrobe layers, procedural scenery and reactive lighting. Audio remains synthesized unless a local rehearsal track is selected. All three menu themes use original generated illustrations and locally served OFL fonts (see public/ASSETS.md). Optional consent-gated playtest tracking and initials-based online scores use separate Supabase services; no player account is required.

Reduced-motion mode disables ambient pulses, decorative dancer swaying, trails, and bursts; dancers still travel because their positions matter to gameplay. The drop countdown and double-points indicator remain readable with sound and motion disabled. Storage and audio failures degrade gracefully. This is a personal fan project, not an official festival product.

## Festival styles

Forest Freakout is the first implemented style: illustrated title, perk cards, forest menu backdrop, warm HUD and local typography. Choose **Festival Style** from the title screen. The saved **Surprise me each run** option chooses only completed styles once per new run and keeps that choice across stages. Moonlit Mycelium is also available, with luminous storybook art, serif headings and midnight-blue menus. Neon Field Trip completes the trio with electric sticker art, bright perk cards and a purple HUD. Surprise can choose any of the three styles. Existing scores, outfits and audio settings are preserved.

### Optional playtest sharing and online scores

Public playtest sharing is opt-in, with controls on the title screen and in settings. Players can share compact gameplay summaries and stop sharing at any time. Local scores and gameplay do not require consent. Online arcade posting is a separate explicit choice. See [operations and setup](docs/online-operations.md).

Online arcade implementation is available behind `VITE_ARCADE_ENABLED` and `VITE_ARCADE_URL`. New runs use editable rave names and separate First-timer, Been-around and Seasoned-vet boards within Rush/Festival/Endless. SMF Rush also separates each venue. Historical seasons preserve their initials and scores. Posting remains explicit and independent of optional analytics; character presets stay on the device. See `docs/online-operations.md` for backend-first release details.


## M2 layout preview (local development)

Start `npm run dev -- --port 5181 --strictPort` and open `http://127.0.0.1:5181/?rehearsal&layout=forest-creekside`. The Layout lab control lets you load all six encounters without playing earlier loops; loading starts a fresh practice stage with no perks. Reload keeps the chosen layout link but restarts the practice run. Scores, XP and analytics are disabled in rehearsal. Regular Endless keeps its original first loop, then alternates the two variants for each stage. The layout lab itself is development-only and is excluded from public builds.

Forest: Creekside Drift / Mushroom Weave. Neon: Stereo Split / Crossfade Alley. Sunrise: Golden Islands / Last Dance Lane. Existing target/count/speed caps, durations, scoring and stage music remain. Pick destinations around cabinets; mouse/touch do not automatically route around obstacles.

## M3 reward preview (local development)

Open `http://127.0.0.1:5181/?rehearsal&rewards`. Endless souvenirs in the wardrobe offer animated previews of the Spore Sprout hat (4 clears in one run), Mixtape Totem (swap, then clear the very next stage), Mycelium Threads (all six layouts, across runs) and Aurora Ribbons (12 clears in one run). These are cosmetic only; thresholds are initial playtest targets. Earned achievements save at qualifying stage end, without saving/posting a score.

The bottom Reward lab can demonstrate earning each reward. Its profile is temporary: actual progress is untouched, reload resets demonstrations, and score/analytics submission is disabled. The lab is excluded from production. In normal play, progress and unlocks save on this device; new rewards start locked for existing players while older unlocks remain available.

## M4 candy feel preview (local development)

M4 candy is published as [PR #17](https://github.com/ratfinkca/shambhala-side-quest/pull/17), following M3 [PR #16](https://github.com/ratfinkca/shambhala-side-quest/pull/16). The candy pass adds: Dizzy reverses keys and mirrors click/tap destinations, and Wavy Colours has more visible liquid light behind gameplay objects. Timing, speed, points and perk durations stay the same.

Open `http://127.0.0.1:5181/?rehearsal&candy=waves`. Use the Candy lab picker and **Start candy practice** to start a fresh Quick Rush with that effect. Practice saves no score or XP and sends no playtest data. Reduced motion uses a static tint. Further bass tuning follows playtests. Endless recovery is described below.

## Bass Head interface preview (local development)

The Bass Head update adds an on-field meter/button and partial spending: at least 25% charge buys 1.5 seconds, half buys 3 seconds, and full buys 6 seconds. All available charge is consumed. Keyboard B still works, and the native button supports Enter/Space. The existing slowdown is unchanged.

Speaker wavefronts and amber player-foot cues show bass pressure; a mint aura shows protection. Reduced motion uses stable marks. Open `http://127.0.0.1:5181/?rehearsal&bass=half`, pick a Bass lab scenario and choose **Start bass practice**. This practice uses a temporary profile and saves no scores, XP, analytics or real settings. Charge continues normally near speakers.

## Endless run recovery

Open `http://127.0.0.1:5181/?rehearsal&recovery`. Recovery lab uses a persistent disposable profile: load a mid-stage/effect/perk/results scenario, resume it, then reload. Real progress, settings, scoreboards and online services are untouched. Reset recovery practice clears only that namespace. Other rehearsal labs now use temporary profiles and never load real recovery.

Normal local Endless saves about once a second and at important transitions when browser storage and Web Locks are available. Reopening offers Resume or confirmed Discard; live stages return paused with time, points, perks, pickup positions and active effects retained. A second participating tab is blocked. Sudden termination can lose the unsaved interval; clearing/evicting browser storage cannot be recovered. Rush/Festival recovery and cross-device sync are not included.

Stage awards and checkpoints persist together. Local score saving stays separate from explicit online posting. Recovery preserves the original run/ticket/build and any attempted posting payload; uncertain posting retries are duplicate-safe. Unused tickets expire after 24 hours, while local play/saving continue. After a full reload, recovered-run playtest reporting stops rather than inventing missing measurements; new runs track under existing consent. No recovery map/positions/ticket are sent to analytics. Recovery ships in [PR #19](https://github.com/ratfinkca/shambhala-side-quest/pull/19); hosted acceptance is recorded on that PR and in the release evidence.

## Local edition previews

The default build/development edition is now `generic` (working title Festival Side Quest). `VITE_EDITION=smf npm run dev -- --port 5191 --strictPort` opens the non-playable nine-stage SMF catalogue. Unknown configured editions fail. Use `npm run build:generic` / `npm run build:smf` for separate `dist/generic` / `dist/smf` artifacts, and `npm run check:editions` for build/asset checks. Neither command publishes. Edition verification uses temporary builds and preserves the default `dist/`; rebuild the default artifact before any later default Pages upload after using the explicit nested output commands. The existing Pages workflow is unchanged; a public rebrand/release remains a later explicit decision.

Generic retains existing same-origin saves/consent/recovery; SMF uses a separate context; its normal catalogue initializes no game or online services. The isolated DEV clock lab described below is the only playable SMF entry in this slice. [M0 preview validation](docs/superpowers/edition-foundation-preview-validation.md) records tested flows and device/network observation limits.

## SMF musical-clock practice (local development only)

Start an SMF development server with `VITE_EDITION=smf npm run dev -- --port 5191 --strictPort`, then open [clock practice](http://127.0.0.1:5191/?rehearsal&clock). Choose the generic clock or any of the six proposed main-stage phrase clocks. Start fresh, pause/resume, mute, click/tap a destination or use arrows/WASD; B activates charged Bass Head. Hidden tabs pause. Changing clocks starts a fresh round.

This is a neutral timing floor with diagnostic synthesized percussion, not finished venue art or music. No real progress, local scores, recovery, analytics or online clients are initialized. Reload starts fresh. Production builds omit this lab and keep SMF's normal catalogue static; generic gameplay remains available separately. [Clock preview evidence](docs/superpowers/smf-clock-preview-validation.md).

## Living Room and Pagoda venue practice (local development only)

On the SMF dev server open [venue practice](http://127.0.0.1:5191/?rehearsal&venues). Choose The Living Room or The Pagoda and Start fresh. Each has authored scenery, speaker/crowd routing, its own phrase-length clock and an original synthesized music sketch. Collect the shown spark target; practice never saves progress or sends online data. Pause, sound controls, hidden-tab pause and on-field Bass Head remain available. The normal SMF catalogue and anonymous secret tiles are unchanged. [Validation and limits](docs/superpowers/smf-venue-preview-validation.md).
