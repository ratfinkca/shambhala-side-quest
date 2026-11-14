# Development roadmap

**Character follow-up — local preview:** fitted hat and hand sockets now anchor
wardrobe layers to the animation. The Character screen adds mixable starter
looks, face, hair and skin choices while keeping existing clothes and earned
cosmetics. No gender categories, new gameplay abilities, scoring reset or
appearance telemetry. Desktop and phone-size menus/motion have been inspected;
the next feedback is on-device character readability and outfit fit.

**Local pixel preview — 2026-11-13:** The approved Pixel Afterparty direction now covers layered actors/wardrobe, pickups and reactions, all six main venue plates, four bonus plates, AMP backstage, generic scenery and three SMF title themes. Controls, crowd-season rules, saves and optional sharing retain their existing behavior. The animation audit found repeated same-foot poses and excessive automatic playback cadence; front/back cycles now alternate explicitly, and sideways movement has an authored alternating-leg rig with a neutral resting pose. The menu pass now covers title/modes, wardrobe, settings, perks, pause, stage summaries and score screens. See the [pixel world plan](superpowers/plans/2026-11-13-pixel-world.md) and [preview validation](superpowers/pixel-world-validation.md). This is a local owner-playtest preview, not a published release. Next: owner phone feedback on motion and costume readability, and first-load asset streaming before treating the complete art pass as release-ready.

**Published — 2026-11-13:** [PR #22](https://github.com/ratfinkca/shambhala-side-quest/pull/22) / `640098e` ships fullscreen SMF play, three mobile control styles and six-venue Quick Rush. Backend migration/functions went first; 710 tests, both CI workflows, Pages deployment and public UI/artifact checks passed. [Release verification](superpowers/fullscreen-mobile-rush-release-validation.md). **Crowd season release — 2026-11-13:** [Main-game crowd and friendship](superpowers/plans/2026-11-13-main-crowd-friendship.md) is integrated into both editions and bonus visits. Every floor mixes small/medium/large personal spaces; four clean passes befriend that dancer. Later stages and Endless revisits grow the crowd. New runs enter the crowd season (arcade-v2 / smf-v2), while Original season boards and saved v1 runs retain their rules. 822 tests and both edition builds pass; desktop, portrait/landscape controls, season switching, isolated saving and a putting transition were inspected. Owner accepted the phone preview and authorized publication. The additive migration and all eight edge functions have deployed first; [release verification](superpowers/crowd-season-release-validation.md) tracks the remaining hosted, PR and Pages checks. Older status paragraphs below are historical milestone snapshots.

Updated 2026-11-10. The current forward plan is the [two-edition roadmap](EDITION-ROADMAP.md): shared engine, generic game and a polished SMF edition with six main venues and five optional bonus spaces. Its M0–M6 labels are a new program; the M1–M4 sections below retain the completed Endless program history. Build/preview one milestone at a time, then release only when authorized.

## Completed foundation

| Track | Shipped outcome |
|---|---|
| Core festival | Rush, three-stage Festival, click/tap parity, mud/bass/candy/Bass Head |
| Identity/atmosphere | Three switchable themes; distinct music and reactive lighting per stage |
| Progression | Local XP/ranks/achievements, wardrobe/totems/flourishes and eight earned perks |
| Feedback/online | Opt-in playtest sharing, near-miss rings, initials boards for all modes |
| Endless milestone one | Capped scaling, four-slot swapping, local/online survival ranking |
| Finish/save fix | Bank completed stages voluntarily, clear save/post controls and unsaved-leave warning |

M4 candy shipped in PR #17 /d00ee62. Bass Head shipped in [PR #18](https://github.com/ratfinkca/shambhala-side-quest/pull/18) /41148ee on 2026-11-05: on-field activation, partial charge spending and clearer speaker/player feedback, with slowdown unchanged. [Bass release evidence](superpowers/m4-bass-release-validation.md) links the release PR and its CI/Pages/public acceptance.

## M1 — Endless insights

**Status:** shipped in PR #14. Analytics migration and playtest function deployed first; CI/Pages acceptance is recorded on that release PR.

**Outcome:** answer where consenting players stop, fail, keep builds or swap perks before changing difficulty/content.

- [Coverage review](playtests/2026-11-03-coverage.md) completed: only 1 recorded run and no stage-end samples; no balance conclusions. Review subsequent coverage privately, publishing only aggregate counts and explicit observation gaps. Never equate missing telemetry with inactivity or unknown completion with a quit.
- Add opt-in Endless run/stage summaries, banked/failed/exit outcomes and add/swap/keep choices. Bound client memory and existing transport. No names/initials/pointer trajectories, no retroactive capture, no consent default change.
- Add private stage/loop and choice reports with time/build/mode/input scope and sample denominators. Preserve Rush/Festival compatibility and existing retention/permissions.
- Refresh the public data notice and operations. Deploy analytics migration/function before frontend. Validate consent-off, mid-run consent, opt-out, long runs, invalid events and reporting privately.

**Done when:** automated tests, private SQL reporting tests, browser consent/perk/finish checks and independent review pass; hosted rollout is a separate release gate. Interpret real results only after collection is verified. [Design](superpowers/specs/2026-11-03-endless-insights-design.md) · [plan](superpowers/plans/2026-11-03-endless-insights.md).

## M2 — Endless stage variations

**Status:** shipped in PR #15 (34974ab); Pages and public bundle verified. Geometry/UI checks pass; ongoing balance and physical touch feedback remain playtest work.

**Outcome:**later loops offer recognizable encounters beyond higher counts/targets.

First collection: two deterministic variations per base stage (six encounters), introduced after loop1; preserve original first-loop layout and stage music. Vary speaker/mud arrangement and crowd anchors while preserving spawn, collection access and escape routes. Never reroll a stage mid-play. Keep existing target/speed caps and perk rules until evidence supports a change. No additional visual effects that obscure taps or create harsh strobing.

Plan: define reusable layout data and deterministic selection → geometry/path-clearance tests → rehearsal/phone preview → attach variation identity to optional telemetry → update score validation/version only if scoring rules change → release. Review encounters with the user before fixing final counts/art. Acceptance: every pickup region is reachable, no unavoidable spawn trap, stable pause/reload semantics, playable touch preview and performance checks. No run recovery is implied.

## M3 — Endless achievements and rewards

**Status:** shipped as PR #16 /79080a6. Test/build, Pages and public wardrobe/asset verification pass; see [release evidence](superpowers/m3-release-validation.md).

Four approved achievements: **The Night’s Just Starting** (4 clears in one Endless run → Spore Sprout hat), **Remix Artist** (swap a perk and clear the immediately following stage → Mixtape Totem), **Trail Mixer** (clear all six authored layouts across runs → Mycelium Threads), and **Still Dancing** (12 clears in one run → Aurora Ribbons). These thresholds remain preview targets pending playtest evidence.

Credit saves at qualifying stage end independently of score saving/posting. Wardrobe shows best clears, a layout checklist, locked previews and earned progress. New rewards start locked for legacy profiles, preserving every older unlock. Effects stay close to the avatar, freeze under reduced motion and never affect gameplay. No currency/store, backend changes or cloud sync.

[Approved design](superpowers/specs/2026-11-04-endless-rewards-design.md) · [implementation plan](superpowers/plans/2026-11-04-endless-rewards.md). Local reward lab: `/?rehearsal&rewards`, with a disposable profile and no real progress/score/analytics writes. The user approved the collection and release. Thresholds remain subject to later playtest feedback.

## M4 — Gameplay feel and reliability

**Status:** candy pass shipped as PR #17 /d00ee62; tests, Pages and public verification pass. It implements the user-confirmed inverted Dizzy controls and stronger Wavy Colours. See [design](superpowers/specs/2026-11-04-candy-feel-design.md) and [plan](superpowers/plans/2026-11-04-candy-feel.md). The DEV Candy lab (`/?rehearsal&candy=waves`) remains available for practice. See [release evidence](superpowers/m4-candy-release-validation.md). Bass-zone feel has started with a [baseline and user feedback](playtests/2026-11-04-bass-baseline.md): visual cause/effect, easier in-field activation, and possible partial-meter spending. The user approved an on-field button, partial-meter spending and clearer feedback. The approved Bass Head release preserves the slowdown/pressure functions and point values. See [design](superpowers/specs/2026-11-04-bass-interface-design.md), [plan](superpowers/plans/2026-11-04-bass-interface.md) and [preview validation](superpowers/bass-interface-preview-validation.md).

[Fresh coverage review](playtests/2026-11-04-m4-coverage.md): no new shared events/stage samples since the previous check. No broad difficulty or reward threshold changes follow. First slice preserves candy timing, speed, perk duration and points; bass escapes and recovery remain subsequent scoped work.

Use evidence and audience feedback to tune candy timing/effects (especially waves), bass escapes, pacing, input differences and reward reachability. Test physical phones, speakers/headphones and sustained performance. Evaluate active-run recovery as a separate scoped feature: protect against refresh/OS suspension without double XP or duplicate online submissions. Cross-device sync is a larger later project.

Next: validate the Bass Head button and feedback on physical phones, including thumb reach, pause/resume and sustained performance; review opt-in samples for remaining escape/pacing issues before tuning. The user requested active-run recovery and selected mid-stage restoration: [approved design](superpowers/specs/2026-11-05-run-recovery-design.md). First scope is same-device Endless resume/discard, paused restoration and duplicate XP/score protection; recovery shipped as [PR #19](https://github.com/ratfinkca/shambhala-side-quest/pull/19), with hosted acceptance in [release evidence](superpowers/run-recovery-release-validation.md) and local acceptance in [preview validation](superpowers/run-recovery-preview-validation.md). Audience playtests are expected over the weekend; do not wait for balance data to design reliability work.

Acceptance: before/after measurements and actual playtests, specific improvements with denominators, no speculative difficulty changes. Keep scoring-version boundaries explicit.

## Current direction — SMF parity and public test candidate

The user requested a nearly fully polished SMF edition before pitching, with no fixed date. The [edition roadmap](EDITION-ROADMAP.md) owns that M0–M6 program. Its foundation, researched main venues, richer original music, lighting and bonus activities now feed a **playable local tour with Festival, Quick Rush and Endless** at [http://127.0.0.1:5191/](http://127.0.0.1:5191/). The generic public game remains separate and compatible. The SMF backend is deployed and harmless live checks passed; no SMF frontend publication or separate repository is claimed.

The route is Living Room → Fractal Forest → Grove → AMP → Pagoda → Village. Four distinct earned perks support adding, keeping and swapping. Anonymous invitations appear after 18 active seconds; collecting one and qualifying its parent discovers an optional bonus party. Discovery stays available when skipped, and Explore revisits are available outside a Festival. The eleven-entry map conceals secret names/art until discovery.

| Parent | Bonus / DJ identity | Permanent local reward |
|---|---|---|
| Living Room | Rabbit Hole / Hoola b2b Lioness | Rabbit Ears: complete the phrase-long visit or its trinket activity early |
| Grove | Secret Garden / Footprints | Glow Blossom: complete the visit or its planting activity early |
| AMP | AMP backstage / S2 | Cheese Totem: three correct costume-led sandwich deliveries |
| Pagoda | Ikigai Mori / Soup | Lantern Totem: complete the visit or its clean-pass activity early |
| Village | Villagio / Subvert | Golden Chicken Totem: both putting cups within eight shots |

Early exits earn no visit souvenir; waiting alone cannot win either challenge prize. Detours preserve main score, XP, charge and the pending perk decision. Final Villagio returns to already-earned Festival results. Atomic device-local saves preserve discoveries, ownership, the parked main run and the active child; reloading resumes paused, including held sandwiches and rolling putts. The candidate implements separate SMF online score and opt-in playtest services; the backend is deployed and harmless live checks passed; the frontend is not yet published.

**Current verification:** 549 automated tests, both edition builds and the combined Pages build passed locally. Browser acceptance has covered key paths; [parity validation](superpowers/smf-feature-parity-validation.md) records observed Quick Rush, controls, settings, recovery and local-score checks and the remaining work. Earlier [tour](superpowers/smf-tour-validation.md), [four-room](superpowers/bonus-venue-preview-validation.md) and [putting](superpowers/villagio-putting-validation.md) records apply to their respective previews.

**Next development sequence:**

1. Continue owner playtesting on real phones for pacing, activities and interruptions; this is follow-up for pitch quality, not a blocker for the public test.
2. Backend deployment and harmless live verification passed before frontend publication; leave production test scores/events untouched.
3. Recheck the final candidate, open the reviewed PR, confirm CI, merge, wait for Pages and smoke-check generic root and the approved `/smf/` test edition. Each is a separate status.
4. Continue visual, audio and balance polish against the pitch checklist. A public test build is not pitch acceptance.

The normal tour owns real local SMF progress. The DEV-only [tour lab](http://127.0.0.1:5191/?rehearsal&tour) has a separate profile for repeatable transition/recovery checks. Earlier main-venue, AMP and four-bonus rehearsals remain disposable. Villagio's illustrated two-hole putting game is implemented; a slide ride and chicken squawk finale remain later polish.

## Later backlog

Additional cosmetics beyond the edition scope, optional currency/shop, cloud profiles/saves, stronger score verification and a public itch.io launch package. Itch launch remains on hold at the user's request. No dates or automatic publishing commitments are assigned.

The putting follow-up has separate [design](superpowers/specs/2026-11-10-villagio-putting-design.md), [plan](superpowers/plans/2026-11-10-villagio-putting.md) and [validation](superpowers/villagio-putting-validation.md). The disposable rehearsal still offers a temporary try-on; the integrated Festival and discovered Explore visit now award the permanent local Golden Chicken Totem on a valid win.
