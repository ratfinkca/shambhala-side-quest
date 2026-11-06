# SMF route, gameplay and musical-clock proposal

Date: 2026-11-06. Status: M1 planning baseline. On 2026-11-06 the owner selected 2026 venue structures, 2027 interface inspiration and complete musical phrases for SMF rounds. Route, initial composition profiles and preview targets remain builder recommendations; no ranked ruleset is implemented/frozen. Based on the approved [edition design](2026-11-06-edition-split-design.md) and [nine-venue research briefs](../../research/smf-stage-identities-2026-11-06.md). Generic gameplay/arcade-v1 remain unchanged.

## Recommended route and alternatives

**Recommend a fixed authored tour:** Living Room → Fractal Forest → Grove → AMP → Pagoda → Village. Start welcoming, move through playful/curious forest encounters, then increase speaker/crowd complexity and finish with the bass-fortress dawn payoff. This replaces the earlier tentative Living Room → AMP → Fractal order. It is a game pacing decision, not a claim about festival geography, opening times or the real timetable. Musical tempo does not itself determine gameplay difficulty.

Two alternatives considered: free stage order offers agency but makes main leaderboard comparison/build order more complex; random order offers variety but weakens onboarding and makes a coherent first tour harder. Keep those for later unranked options. The fixed six-stage route also anchors deterministic Endless rotation and score verification.

Secret branches stay tied to their parents: Living Room → Rabbit Hole, Grove → Secret Garden, Pagoda → Ikigai Mori. Player-facing names/art remain concealed until their unlock commits. All nine require finished content for pitch readiness.

## Musical clock — owner selected complete phrases

The owner selected **complete musical phrases** on 2026-11-06. Use phrase-length SMF rounds around 55–70 seconds, with canonical per-stage durations, qualification targets and bonus windows. This allows coherent genre-appropriate tempi without forcing all music to 128 BPM. The generic game's 60-second clock and 15/30/45-second drops stay intact.

Alternative considered but not selected: keep all SMF rounds at 60 seconds and use an independent musical transport with a composed ending/crossfade. This reduces timing refactoring, but a strict end may cut a musical phrase at many tempi. Do not silently choose 128 BPM everywhere or reinterpret a partially completed old run. The clock choice is resolved; final per-stage musical profiles/targets still require listening/layout acceptance before ranked publication.

The following is the exact first-preview candidate under the selected phrase-length approach. BPM values are composition choices, not measured artist-set values. All use 4/4. Display round time/target plainly in game; do not require players to understand bars.

| Order / ID | Initial original arrangement | BPM / bars | Duration ms (rounded once) | Target rate/min | First-tour sparks | Dancers |
|---|---|---|---:|---:|---:|---:|
| 1 `smf-living-room` | Warm disco/deep house | 112 / 32 | 68571 | 20 | 23 | 10 |
| 2 `smf-fractal` | Funk breaks / bass conversation | 120 / 32 | 64000 | 22 | 24 | 12 |
| 3 `smf-grove` | Spacious two-step / dub colour | 132 / 32 | 58182 | 24 | 24 | 14 |
| 4 `smf-amp` | Deep 140 / halftime bass | 140 / 32 | 54857 | 26 | 24 | 16 |
| 5 `smf-pagoda` | Driving house/techno | 128 / 32 | 60000 | 28 | 28 | 18 |
| 6 `smf-village` | Rolling DnB / halftime contrast | 172 / 48 | 66977 | 30 | 34 | 20 |

Target rate is an internal normalization tool, not a new in-game currency. Calculate the integer target as `ceil(rate * durationMs / 60000)`. Repeated raw targets still represent increasing collection pace on different-length rounds. The six timed rounds total 372587 ms (about 6m13s), excluding player-controlled menus/secret visits. Counts, geometry and targets are **first unranked preview baselines**, not claims of playtested balance. Freeze the accepted values as one server-owned ruleset only after layout/owner acceptance.

A 32-bar excerpt uses four 8-bar sections: establish → main A → related contrast → payoff/return, with 4-bar call/response and 16-bar musical relationships. Village uses three 16-bar arcs, with an 8-bar final payoff; do not compress an entire club track into a minute. Art may progress from sunset toward dawn as fictional run dramaturgy, independently of menu theme.

## Shared clock and score windows

- Canonical active duration: `roundMs = round(bars * 4 * 60000 / bpm)`. Compute event onsets from the original rational musical position, not by repeatedly adding a rounded beat length. Audio scheduling follows the same logical transport; timing does not depend on whether audio is muted/available.
- Keep three 4-second 2× scoring windows per main round. On 32-bar rounds start at bars 9/17/25; on Village's 48-bar round start at 17/33/41. Pre-cue begins one bar before each onset. Half-open intervals `[start, start + 4000)` avoid double counts at boundaries.
- These are phrase-aligned **vibe lifts**, not three mandatory giant EDM breakdown/drop cycles. A sparse musical contrast can carry a scoring lift through a rhythmic accent/lighting change. Name the SMF HUD cue **2× VIBES** so the interface does not promise an audible bass drop at every cue.
- Base spark points, combo tiers/grace, pass awards and Bass Head's zone multiplier remain the existing mechanics; timers for perks/candy/Flow/Bass Head remain real active milliseconds. Tempo never changes collision positions, player speed or the duration of protective effects.
- Pause/settings/hidden-page handling freezes gameplay and musical position together. Recovery resumes paused, retaining exact logical elapsed time and effects; audio resumes safely from that position without replaying missed cues/notes. Stage exit cancels voices, scheduled cues and lights. Never send local recovery positions/tickets as analytics.
- Scoring and stage completion work without sound. Finish on the gameplay clock even if an audio device stalls; no score benefit or penalty for audio latency.

## First-tour encounter rules

Use the current arena dimensions, destination-click/tap steering and movement model. No auto-follow, hold-drag steering, rhythm-timed inputs, new health system, currency or permanent power is introduced. Preserve the current mud, candy, Flow, progressive bass pressure and on-field partial-charge Bass Head behavior. No special perk is required to escape a speaker zone or obtain an invitation.

The stage briefs supply geometry goals. Initial speaker-island budgets: Living Room 2 at the perimeter; Fractal 2; Grove 3; AMP 4; Pagoda 3; Village 4. These are authored islands, not individual cabinet sprite counts. Preserve a clear spawn, reachable spark/Flow regions and at least two usable escape/bypass routes through the main field. Authored cabinet art and actual collision shapes must agree. Do not derive arena obstacles from a photograph's crowd density.

Keep current candy/Flow availability and effect durations in the first preview rather than adding another balance pass. The shortest candidate main round still leaves room for today's 12–40-second candy timing. Audit every elapsed-time consumer before making variable rounds playable; no reference to a global 60000 may reinterpret an SMF round or affect generic saves.

## Perks, XP and endless scaling

- Four distinct active perks in both SMF Festival and Endless. After each qualifying main clear except the final Festival clear: choose an earned unowned perk, keep the current build, or at four slots replace one existing perk. Always allow Keep, including when no new choices are available. No random choice subsets and no duplicate perk stacks.
- Retain the current eight-perk mechanics and XP unlock thresholds for the first SMF preview; fresh SMF progress starts independently. Award normal main-stage XP before refreshing the earned choice list, so a just-unlocked perk can appear immediately. Effects reset/carry exactly as the existing main-stage lifecycle specifies; no permanent speed/score upgrades.
- Six qualifying clears complete Festival. Final stage has no unused perk decision. Voluntary Finish banks only completed stages; a failed target ends the run with the completed-stage total plus the finished failed-stage score under the same score-record semantics as current Festival/Endless. Never bank points from an unfinished live stage.
- Endless loops the fixed six mains, no random route or mid-stage rerolls. For zero-based loop `L`, use `rate = min(45, baseRate + 3*L)`, `dancers = min(22, baseDancers + 2*L)`, and current dancer movement `1 + min(.20, .08*L)`. Target is the same duration-normalized ceiling above. Main-stage durations/BPM remain fixed through loops; higher music intensity comes from arrangement/layers, not faster simulation.
- No authored later-loop SMF variations in the first six-main preview; complete all six readable base layouts first, then add reviewed edition-owned variation IDs. Existing generic variation IDs and layout-specific achievements remain generic; do not show an unreachable generic layout achievement in the fresh SMF profile. Shared XP/cosmetic definitions must be explicitly assigned to the edition before display.
- Rate/crowd caps bound difficulty but do not end local play. Exact accepted parameters belong to the SMF ruleset; no live target/cap/tempo changes without compatibility/version handling.

## Discovery, entry and hidden identity

The earlier approved invitation flow remains the baseline: a generic sealed invitation appears after 18 active seconds at an authored safe side-route in an undiscovered parent. It stays to the end, gives no points/qualification credit/power, and Flow does not attract it. Distinguish it from sparks/candy without revealing the destination name or identifying art.

Collecting sets a pending flag; qualifying the parent atomically commits discovery with that stage's award/checkpoint. A failed/discarded parent does not unlock it. Only then reveal the name and offer **Visit [name]** or **Continue the festival** on the completed parent's summary. Skipping still retains the earned unlock. All catalogue/passport/accessibility text and invitation/notification copy use anonymous mystery treatment before this point, not CSS-blurred real names.

Once discovered, no invitation is required for later visits: offer at most one visit per parent clear, and allow revisits from the unranked Explore menu. Secret visits never recursively open another visit. Explore for the first secret milestone is revisiting discovered secrets, not an additional ranked mode or a way to reveal locked destinations. DEV stage practice stays isolated, with saving/progression/online connections disabled.

## Secret visit and return rules

Secrets are short independent bonus visits, not additional main clears. Under the selected phrase-length approach, propose Rabbit Hole 140 BPM/32 bars (54857 ms), Secret Garden 96 BPM/24 bars (60000 ms), and Ikigai Mori 124 BPM/32 bars (61935 ms). This explicitly revises the earlier tentative universal 60-second secret visit; the Secret Garden candidate happens to remain exactly 60 seconds. Their musical centres/art remain provisional where primary sources are thin.

Park the completed parent summary and its pending perk decision. Clone the equipped perk set **before** that pending choice into a new visit, with temporary items/boosts/exposure and Bass Head charge starting fresh. Keep parent time, score, history, perks, charge and result decisions unchanged. Return to the same pending main summary/decision; the following main stage has not started. A secret timeout or early return never fails the main run.

No secret point, pickup, perk choice, main Rave XP, protected time or charge carries into competitive main play. Secret score/local bests and a one-time completed-visit souvenir are separate. Unlock and souvenir are different receipts: clearing the parent reveals the stage even if skipped; finishing the first visit grants its souvenir once, with a stable visit ID and atomic checkpoint. Revisits may improve that secret's local best but cannot farm new main rewards. No time-limited secret qualification gate in this first pass.

Recovery preserves parent and child contexts, visit/unlock receipts, remaining time and exact return decision together, at one nesting level with a bounded snapshot. Reload cannot replay the entrance, award, invitation or score post. Keep the original main online ticket; its 24-hour wall-clock lifetime continues during visits. Expiry never prevents local continuation/saving. A player may Finish the banked main run from a paused secret visit through the existing explicit confirmation/results flow, discarding unfinished secret points.

## Boards, consent and implementation boundary

Fixed tour and timings are identical for everyone in a given `editionId/rulesetId/mode` partition. Festival ranks points then main clears; Endless ranks main clears then points, using initials and current input labels. Secret visits never add a main clear or claim. Keep SMF Quick Rush exactly 60 seconds on the proposed Pagoda 128 BPM/32-bar profile, with its own mode board and no qualification target. This preserves the one-minute score-chase promise without cutting a musical phrase; Festival still begins at Living Room. Generic Rush remains its existing forest round.

Use additive edition/ruleset/stage-ID tickets and validation before enabling SMF online. Server-owned stage sequence, durations, targets and perk legality are mandatory; client assertions or CORS alone cannot pick arbitrary rules. Existing stage-history/body bounds and duplicate-post digest semantics remain explicit limits, with local play continuing if online eligibility overflows. Legacy arcade-v1, its pending retry bytes and generic recovery-v1 remain untouched. M0's static SMF preview still makes no service requests.

Consent stays independently opt-in per edition. Local score saving and optional online posting remain separate. Backend migrations/functions deploy before a future authorized frontend connection; no production test entries/events. Research and this proposal create no new accounts, backend project, public deployment or fork.

## Build sequence and acceptance gates

1. Carry the selected 2026 venue baseline and phrase-length clock into M2 planning. Review the nine briefs/fixed route and confirm secret-stage reference gaps before art is finalized. Targets/crowd budgets are first preview proposals, not balance conclusions.
2. Follow the [M2 delivery sequence](../plans/2026-11-06-smf-m2-delivery.md), starting with the [musical-clock task plan](../plans/2026-11-06-smf-musical-clock.md), now written and self-reviewed for owner review. Parameterize active-time gameplay/counters and guard legacy recovery first; exercise isolated audio/scene clocks, then two contrasting main venues and all six. New durable SMF recovery and online schemas follow their own contract plan before enablement. Keep old generic fixture/ticket/recovery bytes as regressions. No fake SMF layout shipped behind a renamed generic stage.
3. Validate all six targets/geometry, four-slot Festival and Endless, finish/results/reload, mute/pause/2× boundaries and actual audible phrasing. Test touch/reduced motion and sustained devices. Freeze ranked values only after acceptance; additive backend contract goes out before enabling posting.
4. M3 implements all three secret visits, hidden-name gates and nested return/recovery; M4 completes all nine compositions/lighting identities. A partial vertical slice does not satisfy the polished nine-stage pitch scope.

Current code audit: `src/game.js`, `src/festival.js`, `src/audio.js` and `src/playtest/summary.js` still contain 60000-based elapsed time/caps; `src/run.js`, recovery, scene rendering and server validators also need edition-aware treatment. M0 deliberately preserved those generic semantics. The phrase-clock option is a real scoped engine change, not a title-screen setting.

## Recorded decisions and remaining acceptance

- **Owner selected:** 2026 venue structures as baseline; 2027 official main/ticket-site art may inspire title GUI and menus, independently of venue identity. [Interface direction](../../research/smf-2027-interface-direction-2026-11-06.md).
- **Owner selected:** SMF rounds finish on complete musical phrases. Generic remains unchanged, and the proposed SMF Quick Rush profile still lasts exactly 60 seconds.
- **Builder baseline for review/playtesting:** fixed route, initial composition profiles, preview targets/density, invitation/return rules and four-perk behavior above. Musical values are original choices, not measured festival facts; ranked values freeze after audible/layout acceptance.
- **Still outstanding:** owner/crew visual confirmation for secret venues, dated references for final 2026 silhouettes, full listening acceptance and final interface concepts. These are content acceptance gates, not unresolved year/clock questions.

This document records the resolved direction and a concrete build recommendation. It does not approve unseen artwork, claim playtested balance, or authorize a public ranked deployment.

Builder check: a fresh read-only game/music systems reviewer on 2026-11-06 found no important unanswered questions beyond the owner decisions then pending; those year/clock decisions are now recorded above. Documentation links/whitespace are checked separately; no game tests/builds are rerun for this documentation-only pass.
