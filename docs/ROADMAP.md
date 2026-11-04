# Development roadmap

Updated 2026-11-04. Milestone labels below define the next development sequence; they are not retroactive release numbers. User approved features/atmosphere/rewards ahead of candy/bass fine-tuning. Build and preview one milestone at a time, then ship through PR/backend-first release checks when authorized.

## Completed foundation

| Track | Shipped outcome |
|---|---|
| Core festival | Rush, three-stage Festival, click/tap parity, mud/bass/candy/Bass Head |
| Identity/atmosphere | Three switchable themes; distinct music and reactive lighting per stage |
| Progression | Local XP/ranks/achievements, wardrobe/totems/flourishes and eight earned perks |
| Feedback/online | Opt-in playtest sharing, near-miss rings, initials boards for all modes |
| Endless milestone one | Capped scaling, four-slot swapping, local/online survival ranking |
| Finish/save fix | Bank completed stages voluntarily, clear save/post controls and unsaved-leave warning |

Current published baseline: PR #16 /79080a6 (M3). M4 candy feel has a separate local preview; release approval is still required.

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

**Status:** started. First local candy preview implements the user-confirmed inverted Dizzy controls and stronger Wavy Colours. See [design](superpowers/specs/2026-11-04-candy-feel-design.md) and [plan](superpowers/plans/2026-11-04-candy-feel.md). Preview uses the DEV Candy lab (`/?rehearsal&candy=waves`); it is not published.

[Fresh coverage review](playtests/2026-11-04-m4-coverage.md): no new shared events/stage samples since the previous check. No broad difficulty or reward threshold changes follow. First slice preserves candy timing, speed, perk duration and points; bass escapes and recovery remain subsequent scoped work.

Use evidence and audience feedback to tune candy timing/effects (especially waves), bass escapes, pacing, input differences and reward reachability. Test physical phones, speakers/headphones and sustained performance. Evaluate active-run recovery as a separate scoped feature: protect against refresh/OS suspension without double XP or duplicate online submissions. Cross-device sync is a larger later project.

Acceptance: before/after measurements and actual playtests, specific improvements with denominators, no speculative difficulty changes. Keep scoring-version boundaries explicit.

## Later backlog

More stages/authored music assets, additional cosmetics, optional currency/shop, cloud profiles/saves, stronger score verification and a public itch.io launch package. Itch launch remains on hold at the user's request. No dates or automatic publishing commitments are assigned.
