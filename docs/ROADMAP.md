# Development roadmap

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

## Next direction — shared engine and two editions

The user requested an official split plan before further music work, aiming to pitch a nearly fully polished SMF version with no fixed date. Start with [M0 edition foundation](superpowers/plans/2026-11-06-edition-foundation.md), then research the six main stages and five planned bonus spaces, author the full tour, add optional detours and complete music/lighting for every venue. [Master design](superpowers/specs/2026-11-06-edition-split-design.md) · [program milestones and pitch checklist](EDITION-ROADMAP.md).

Rabbit Hole belongs to Living Room, Secret Garden to Grove, and Ikigai Mori to Pagoda. Recommended discovery: an invitation collected during the parent round opens an optional after-clear visit, with independent secret outcomes and no main-board score inflation. The user approved the design and native execution; M0 is implemented locally with independent review fixes verified. [Preview validation](superpowers/edition-foundation-preview-validation.md). The older three-stage/128 BPM music proposal is superseded; proper electronic phrasing and original synthesis remain requirements, now informed by each venue's researched identity. Generic gameplay, saves and legacy online contracts remain compatible. No fork, new backend or public release has been created by planning.

The [2026-11-10 secret/backstage update](superpowers/specs/2026-11-10-secret-backstage-expansion-design.md) expands the original three with Villagio/Village (Subvert) and AMP backstage (S2). Rabbit Hole uses Hoola b2b Lioness, Secret Garden uses Footprints, and Ikigai Mori uses Soup. All five now have disposable DEV-only SMF previews: AMP's accepted costume-led sandwich delivery at `?rehearsal&backstage=amp`, plus a four-venue selector at `?rehearsal&bonus=rabbit-hole`.

The new previews offer six sequential Rabbit Hole trinkets, three Secret Garden seed-and-plant trips, and five distinct clean passes at Ikigai Mori, with temporary rabbit ears, a glowing blossom and a lantern totem. These are playtest objectives and cosmetic sketches; they do not replace the original three's first-completed-visit souvenir release plan. Villagio now offers two playable putting greens, eight total shots and a temporary Golden Chicken Totem for sinking both cups. Pull back anywhere to aim/set power; the active green is enlarged, and music loops without a countdown. The animated chicken tube remains scenery; slide ride and squawk sounds are later polish. All four use illustrated rooms with animated accents. Villagio now has a painted timber clubhouse, textured greens, warm fountain lights and a glossy chicken tube, replacing its initial procedural placeholder. All use original phrase-structured synthesis, not artist recordings.

Four-room baseline checks before putting: 448 tests, production build and both edition checks passed. Native browser play completed all four activities; phone layouts, pause/reset/switching, timeout without a reward, mixer controls and navigation passed. [Validation](superpowers/bonus-venue-preview-validation.md). Owner venue-reference review, physical-phone play and listening remain open. No backend deployment or public publishing occurred; normal secret catalogue entries remain concealed and no preview grants persistent progress.

Next: playtest the five bonus activities, including Villagio putting, then connect the six-stage tour and optional detours with discovery, return/recovery and one-time cosmetic receipts. Full tour integration remains unimplemented; isolated activities do not demonstrate that journey. [Four-preview plan](superpowers/plans/2026-11-10-bonus-venue-previews.md).

## Later backlog

Additional cosmetics beyond the edition scope, optional currency/shop, cloud profiles/saves, stronger score verification and a public itch.io launch package. Itch launch remains on hold at the user's request. No dates or automatic publishing commitments are assigned.

The putting follow-up has separate [design](superpowers/specs/2026-11-10-villagio-putting-design.md), [plan](superpowers/plans/2026-11-10-villagio-putting.md) and [validation](superpowers/villagio-putting-validation.md). Its cosmetic remains local to the disposable rehearsal until full-tour reward receipts are implemented.
