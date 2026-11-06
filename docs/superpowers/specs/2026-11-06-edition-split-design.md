# Shared engine, generic edition and SMF edition

Date: 2026-11-06. Status: approved by the user on 2026-11-06; M0 foundation implemented locally, independent review fixes verified. Published baseline: recovery PR #19 /67c44e0. This supersedes the existing-three-stages/universal 128 BPM music proposal.

## Intent and user decisions

Build toward a nearly fully polished SMF game before pitching it, with no fixed pitch deadline. The user works for SMF and has been asked to pitch the game. Preserve a maintainable generic product alongside the SMF version. The agreed direction from the preceding discussion is a shared engine with two editions, initially in one repository; separate repositories remain a later ownership/distribution option.

The user requires all six main stages and three secrets: Rabbit Hole belongs to The Living Room, Secret Garden to The Grove, and Ikigai Mori to The Pagoda. Secret stages should be optional discoveries earned during their associated stage or opened after a qualifying round. The invitation mechanism below is the builder's recommendation for that request, not a separately approved user decision.

Original synthesized music should reflect each stage's researched programming, with proper electronic phrasing/structure across genres. Stage-appropriate tempo takes priority over the old blanket 128 BPM proposal.

## Approaches

1. **Shared engine plus edition content/build packs — recommended and the basis of this plan.** One fix can benefit both products; each gets independent branding, stage content, storage and online context. It requires an explicit edition/rules boundary first.
2. Two independent GitHub forks now. Immediate ownership separation, but duplicate fixes and growing drift; use only if a separate ownership requirement emerges. The shared boundary makes a later fork/upstream relationship practical.
3. One SMF-themed skin over the current three stages. Quick cosmetic change, but cannot deliver the requested nine venues or distinct stage identities. Not the chosen product scope.

Planning creates no new remote repository, account, deployment or access grant. The existing published game stays live while isolated previews are built.

## Product and content boundaries

- `generic`: working title **Festival Side Quest**; fictional stage content, neutral branding, current three-stage game/progression as the compatibility baseline. Final title/art is reviewed before public rebranding.
- `smf`: working title **Shambhala Side Quest**; all nine requested stages, festival-specific presentation, researched music/lighting and discovery content. This is the polished pitch target.
- Shared: input, arena movement/collision, core pickup/Flow/candy/bass/perk logic, scene lifecycle, menus/components, audio transport, recovery, scoring transport and consent machinery.
- Edition-owned: branding/copy/assets, ordered main route, stage catalogue/geometry, music/lighting profiles, discovery relationships, achievement/reward definitions, data notice/contact presentation, storage namespace and approved online configuration.
- A selectable visual theme is separate from an edition and from a musical stage. Existing themes/wardrobe can remain shared where their assets are neutral. Embedded words/logos in bitmap title art must be audited and replaced/edition-owned; changing only HTML is insufficient.

## Required SMF catalogue

| Stable content ID | Display name | Kind | Parent |
|---|---|---|---|
| `smf-amp` | The AMP | main | — |
| `smf-fractal` | Fractal Forest | main | — |
| `smf-grove` | The Grove | main | — |
| `smf-living-room` | The Living Room | main | — |
| `smf-pagoda` | The Pagoda | main | — |
| `smf-village` | The Village | main | — |
| `smf-rabbit-hole` | Rabbit Hole | secret | `smf-living-room` |
| `smf-secret-garden` | Secret Garden | secret | `smf-grove` |
| `smf-ikigai-mori` | Ikigai Mori | secret | `smf-pagoda` |

These IDs identify content, not leaderboard ranking or a claim about exact site geography. Proposed main tour order: Living Room → AMP → Fractal Forest → Grove → Pagoda → Village. It is a game pacing proposal; the research/pacing gate may change it before the first SMF ruleset is frozen.

Each venue needs a complete playable space, recognizable visual language, original musical arrangement, lighting profile, transition/arrival treatment and stage passport entry. Secret stages receive the same completion/quality gate as the mains. Intermediate vertical slices are engineering milestones; all nine must be finished for the intended pitch candidate.

## Recommended secret discovery flow

Use one distinctive invitation pickup per associated main stage, placed at an authored safe side-route after 18 active seconds on a first undiscovered visit. It stays until round end. Examples to explore in art: rabbit token, luminous seed, paper lantern. It gives no points, spark credit or power, and Flow does not attract it. No random spawn odds or raw-score threshold in the initial design: a discoverable route is clearer and less dependent on input skill.

Collecting the invitation sets a pending flag in that live stage. Clearing the parent round commits the discovery with its stage reward/checkpoint. Show **Visit [secret]** or **Continue the festival** between stages. A failed/abandoned parent does not commit a new discovery. Once discovered, the venue is available in the edition's Explore mode, and the inter-stage offer can recur once per parent clear; no nested secret detours. Discovery/progress is device-local.

Entering a secret creates a separate 60-second bonus visit while the completed main stage's summary/perk decision is parked. Clone the equipped perks for the visit, start its temporary pickup/boost/meters independently, and restore the main run unchanged on return. Secret points/local bests are separate; no competitive main score, clear, perk choice, Bass Head carryover, item effect or Rave XP is gained from the visit. Discovery/souvenir progress supplies the reward. The child visit has its own stable receipt/visit ID so refresh cannot repeat a souvenir grant.

Main Festival is six qualifying rounds; main Endless loops the same six. Four active perk slots with swapping apply to the longer SMF modes. Generic Festival keeps its current two-choice/three-stage behavior. Secret visits do not advance the main stage index, Endless difficulty or qualification targets. A secret timeout/early return returns to the parked summary; failing a secret does not fail the main run. Main score banking remains available with the same explicit save/post decisions.

Recovery must preserve parked main context, active secret context, invitation/discovery and return screen atomically, with one nesting level and bounded size. Resume is paused; no replayed invite, award or entrance. The 24-hour score ticket continues on wall time during detours; local play/saving remains possible after expiry. Explain bonus-visit separation with a short arrival/results cue, not technical instructions during play.

Exact SMF targets, encounter density, loop caps and invitation anchor positions are settled through the authored-layout/playtest gate before `smf-v1` is frozen. They are not copied from the current three-stage index arithmetic. Exploration is unranked and supports all discovered venues without changing an active ranked run.

## Edition and rules architecture

Keep the current Vite/Phaser stack. Start with focused manifests/registries, not a plugin framework or a wholesale rewrite:

- `src/editions/registry.js`, `generic.js`, `smf.js`: validated build identity, brand references, catalogue, ordered main IDs, feature availability and trusted frontend stage resolvers.
- `supabase/functions/_shared/edition-rules.js`: canonical data-only ruleset identities, main route/targets/limits and permitted stage/variation IDs that both frontend and backend can import. Geometry/audio stay frontend-only.
- Existing run/endless/screens/progression/recovery modules consume trusted edition/rules definitions rather than hard-coded `/3`, `%3` or target arrays.
- Build selection is explicit via `VITE_EDITION=generic|smf`; an unknown configured edition fails clearly. The ordinary unset/default build remains the generic compatibility build. SMF is a local non-posting scaffold until its content and backend contracts are ready.
- Produce separate artifacts/configuration from the same commit. Static assets are allowlisted by edition; generic output must not quietly include SMF title/logo art from Vite's unconditional public-directory copying. Keep neutral fonts/assets reusable and record provenance.

Published generic gameplay compatibility is a hard gate: same legacy stage IDs/order, targets 20/25/30, 60-second rounds, drop/scoring rules, deterministic variants, four-slot Endless, XP/receipts, wardrobe, online submissions and recovery. Art/name rebranding is a later explicit acceptance gate.

## Saves, recovery and consent

Generic retains the current `sidequest.profile.v1` key and matching lock name as its compatibility namespace. This preserves real browser scores, XP, outfits, consent and active recovery without an unsafe copy/delete migration. SMF uses a distinct `sidequest.smf.profile.v1` key, lock and analytics identity; its consent begins unknown/off. No cross-edition progress or ticket copying. Same-origin Pages paths alone do not isolate storage.

New snapshots identify edition and ruleset. Read legacy recovery-v1 only as generic and preserve original run/ticket/build, timers and exact pending submission payload; reject it in SMF. A versioned new snapshot supports SMF main/secret contexts. Changes to content/rules must deliberately preserve or reject compatible snapshots, never silently reinterpret a generic route as SMF. Profiles/recovery/labs have edition-specific temporary or disposable namespaces; reset never touches a different edition.

Consent remains opt-in and discoverable. Score posting remains independent. Recovery positions/tickets are local state, never analytics payloads. Keep current conservative suppression of recovered-run analytics until a separately validated continuation design exists. Edition data notices state the actual configured operator/contact before public rollout; the existing GitHub issue contact can remain the development default.

## Online partition and compatibility

The legacy `arcade-v1` API/tickets/boards keep their exact payload shape and existing three-stage interpretation. Preserve old pending retries byte-for-byte; do not append edition fields to an attempted v1 payload.

Before SMF posting, add a strict versioned contract carrying `editionId`, `rulesetId` and stage IDs, bound into the run ticket, score digest, leaderboard partition and cache key. Server-owned rules validate the six-stage main route and main-only claims. Secret results never become ranked main claims. Boards and analytics queries must filter edition/ruleset/mode so no mixed six-stage/three-stage ranking is possible. Reject unknown or inconsistent context; a frontend toggle or CORS origin is not proof of edition identity.

Use additive backend changes, preserve v1 readers/receipts and RLS, and deploy migrations/functions before enabling the SMF frontend connection. The current Supabase project can host logically partitioned data initially; a separate SMF-owned project can be configured later without changing the engine. Creating/transferring projects or access is a distinct owner action, not part of this planning request. Disposable/staging services handle write-producing tests; production checks use harmless validation paths and do not create test scores/analytics.

## Research, music and visual identity

Create a dated brief per venue using stage-specific official lineups/curator statements from 2023–2026 where available, plus primary artist-published sets and project-owner/stage-crew references. Distinguish a confirmed booking from a playlist inclusion or a listener's genre inference. Capture source/year, recurring sound/rhythm, tempo range, phrase/form, harmony/timbre, visual architecture/materials/palette, lighting and day/night differences. Missing secret-stage documentation remains an explicit research gap, not invented genre history. User-supplied parent mappings above are authoritative project scope.

Reference the most recent completed festival edition as the initial visual baseline; date older structures and verify the intended target with the owner before art is frozen. Stage briefs describe an evocative game interpretation, not a surveyed real-world map. Avoid pigeonholing diverse curatorial programs into one permanent genre.

Original synthesis uses stage-appropriate tempi and coherent 4/8/16/32-bar form, intentional genre rhythms, tonal motifs, fills, breakdowns/releases and clean mixing. Separate musical transport/phrase cues from generic wall-clock bonus timing. Decide SMF's gameplay-bonus/music alignment per ruleset before freezing scored play; do not warp every genre to 128 BPM or move live generic scoring windows as a side effect. Menu styles remain independent of stage music.

Music/lighting/renderer are driven by the same deterministic stage transport; pause, mute, stage exit and recovery stop/resume safely at the appropriate position. No missed-note bursts, uncontrolled tails or decorative audio running in menus. Static reduced-motion lighting, broad readable field coverage, bounded voices/graphics and phone audio performance are acceptance criteria. Atmosphere may be composed from reusable synthesis primitives, but every one of the nine venues needs its own finished arrangement and recognizable setting.

## Delivery and quality gates

The [edition roadmap](../../EDITION-ROADMAP.md) owns phases and the full nine-stage pitch checklist. The [foundation implementation plan](../plans/2026-11-06-edition-foundation.md) specifies the first engineering slice. Later phases receive task-level plans when their research/content decisions are ready; this is one shared program, not nine parallel unreviewed implementations.

First deliver a local edition foundation with preserved generic behavior, isolated SMF metadata/build shell and old-save/recovery compatibility. Then research/freeze stage briefs, implement six main venues/ruleset, add all three secrets, compose stage-specific music/lighting, finish both brand packs and run full-device/pitch acceptance. Review playable internal slices along the way; a partial slice is not the polished pitch deliverable.

Pitch-ready means all nine venues are complete, generic/SMF do not leak saves/assets/scores, secrets/recovery/finish-save work through interruptions, authored original audio is listened to on headphones/phone speakers, touch and reduced-motion paths are exercised, representative phones sustain a long run, all required tests/reviews pass and deployment/public checks are separately recorded. Prepare an SMF build, concise experience guide and captured gameplay from that exact build. A release or external pitch/demo link requires a later explicit ship/share instruction.

## Builder latitude and proposals to approve

The shared-edition architecture and all nine venues respond to the user's requested split/full scope. Proposed main order, invitation pickup/after-clear entry, secret souvenir-only rewards, per-edition namespace policy and first-foundation boundaries are this plan's concrete recommendations. Exact neutral product name, artwork, targets, music profiles and invitation anchors have later review gates; none block extracting a compatible engine. A change to ranked fairness, secret entry during a live parent round, automatic data migration or ownership/access scope returns for a decision.

Initial primary sources: [official six-stage descriptions](https://shambhalamusicfestival.com/stages), [Grove director's 2024 guide including Secret Garden](https://www.shambhalamusicfestival.com/blog/the-grove-stage-directors-guide-to-2024), and [2025 Grove lineup](https://www.shambhalamusicfestival.com/blog/2025-grove-stage-lineup). Full multi-year research is a planned deliverable, not claimed complete here.

Planning validation: fresh read-only builder check on 2026-11-06 found no important unanswered questions. Relative documentation links and whitespace checks pass. The user subsequently approved the design and native execution. Current local implementation/evidence is recorded in [M0 validation](../edition-foundation-preview-validation.md); no release change is claimed.
