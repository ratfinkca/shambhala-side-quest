# Two-edition delivery roadmap

Updated 2026-11-09. Approved program; M0 implemented locally with independent review fixes verified, not published. Authority: [edition split design](superpowers/specs/2026-11-06-edition-split-design.md). User target: nearly fully polished SMF edition before pitching; no fixed pitch date. Published recovery baseline remains PR #19 /67c44e0.

## Product target

One shared engine; separately built generic and SMF editions. SMF ships six mains plus Rabbit Hole/Living Room, Secret Garden/Grove and Ikigai Mori/Pagoda. All nine are full content scope. Generic preserves today's game/progression and gains its own neutral identity. Ownership-driven repository separation can follow the engine boundary; no external fork or deployment is created by this plan.

## M0 — Edition foundation (local preview complete)

**Status:** implemented locally; 225 tests, dual builds and browser preview checks pass; independent review fixes verified. [Validation](superpowers/edition-foundation-preview-validation.md).

**Outcome:** a safe local engineering preview, not the pitch build.

- Explicit generic/SMF manifest/build selection and asset boundary.
- Extract three-stage assumptions into trusted generic rules data, while preserving every existing generic result, variant, award and score payload.
- Nine-entry SMF catalogue with main/secret parent relationships; scaffold stays non-posting and unplayable until its actual layouts/rules are ready.
- Generic keeps legacy profile/lock and v1 recovery/tickets. SMF gets independent profile/lock/consent/lab namespaces; unknown editions fail clearly.
- Dual-build/asset-isolation checks and generic regression/recovery/score acceptance. No backend deployment or public rebrand in this slice.

**Exit:** current 207-test baseline expanded with edition/context/migration isolation tests; both builds verified, generic play/recovery/online contract unchanged, independent review clean. [Task plan](superpowers/plans/2026-11-06-edition-foundation.md).

## M1 — Stage identity and product rules (planning baseline settled)

**Outcome:** nine dated, reviewable stage briefs and an agreed SMF route/music contract.

**Status:** [sourced research briefs](research/smf-stage-identities-2026-11-06.md) and [concrete route/rules proposal](superpowers/specs/2026-11-06-smf-route-rules-design.md) drafted on 2026-11-06. Fresh builder check found no important unanswered questions beyond the recorded owner decisions. The owner selected 2026 venue structures and phrase-length rounds; 2027 official-site art is a separate [title/menu reference](research/smf-2027-interface-direction-2026-11-06.md). Secret reference gaps, final artwork and listening/layout acceptance remain explicit. The planning baseline is settled; ranked values are not frozen, and M2A clock practice is implemented locally.

- Research 2023–2026 official stage lineups/curator statements and available primary sets; record gaps instead of inferring secret programming from unrelated stages.
- For each venue: recognizable setting/materials, day/night identity, musical palette/tempo/form, lighting language, geometry/spawn constraints and asset sources.
- Review all six main identities and three secrets with the owner; request stage-crew input through the owner rather than messaging anyone automatically.
- Agree the six-main route/order, qualification/difficulty, four-perk policy, timed secret visit/discovery/reward behavior and gameplay/music clock alignment before freezing the first SMF scoring ruleset.
- Confirm generic working title/presentation; SMF uses the selected 2026 venue baseline and separate 2027 title/menu inspiration. These are quality gates, not reasons to delay M0 extraction.

**Exit:** complete nine-stage matrix with source/confidence and no unresolved scoring/route contract; approved briefs and the next task plan. No blanket 128 BPM requirement.

## M2 — Six main SMF stages and edition-safe online services

**Outcome:** a complete six-stage SMF tour and Endless main loop with all parent stages recognizable.

**Status:** [M2 delivery sequence](superpowers/plans/2026-11-06-smf-m2-delivery.md) and [first musical-clock implementation plan](superpowers/plans/2026-11-06-smf-musical-clock.md) approved; M2A canonical timing and isolated clock practice are implemented locally. [Clock validation](superpowers/smf-clock-preview-validation.md) records final tests/review/device limits. Clock preview/readout fix accepted. All six mains now have isolated practice layouts, phrase clocks, original music sketches and owner-reviewed reference-guided illustrations. The [all-stage lighting pass](superpowers/plans/2026-11-09-smf-venue-lighting.md) is implemented locally with individual venue shows and stronger architectural projections; [validation](superpowers/smf-all-stage-lighting-validation.md) records 317 tests, builds and all-six phone/desktop inspection. [Current handoff](PROJECT-HANDOFF.md#m2b-venue-practice) records the successive art previews; the earlier [two-venue validation](superpowers/smf-venue-preview-validation.md) is historical. Next: owner feedback on the lighting pass, six-stage local run/perk flow, then the new online contract. Generic recovery/posting stays unchanged; SMF production play remains disabled. No backend rollout or public release in M2A.

- Author all six layouts with safe spawns, reachable pickups and touch-friendly routes. Develop in contrasting internal slices, then complete the full collection.
- Use stable stage IDs/canonical route, finite four-perk builds/swapping, mode-aware save/finish/results and appropriately named discovery slots.
- Introduce a strict edition/ruleset protocol and server validation; isolate tickets, ranks, cache and opt-in reports while keeping arcade-v1 fully compatible.
- Apply additive backend changes and deploy functions before enabling SMF posting. Browser/staging tests cover cross-edition rejection and unknown/mismatched IDs; no production test scores.

**Exit:** every main stage playable, all scores reconcile with its ruleset, separate boards/configurations, saved/unfinished run handling verified. Visual/audio polish can still be in progress; this is an internal milestone.

## M3 — Three secret discoveries and return/recovery

**Outcome:** Rabbit Hole, Secret Garden and Ikigai Mori are complete optional visits associated with their parents.

- Build distinctive discoverable invitations, earned entry after parent clear, optional choice and persistent Explore access. Keep undiscovered names/art hidden behind mystery tiles until earned.
- Secret scores/items/boosts never alter main competitive totals or parked main state. Souvenirs reward discovery; no extra main perk choice/XP advantage from detours.
- Keep main/secret visit identities, return menus and parked/active recovery atomic and bounded. Handle invitation collection, death/timeout, replay, discard, reload and finish/save without duplicate rewards.
- Test one secret at a time against its actual parent, then the full six-main/three-secret journey. Complete all three before pitch acceptance.

**Exit:** first discovery, revisit, skip, interrupted detour and return work for every secret on desktop/touch; main-only board claims remain identical with or without optional visits.

## M4 — Original music and coordinated atmosphere across all nine

**Outcome:** recognizable, properly phrased music and lighting for every venue.

- Compose from the approved per-stage briefs, using appropriate genre tempos/rhythms/harmony and musically coherent phrase/section structure.
- Develop the common scheduling/instrument/transport foundation, then audition all six mains and three more intimate secret arrangements.
- Coordinate lights, speaker response and stage details with musical form while preserving scoring cues/readability and reduced motion.
- Verify pause/mute/end/recovery and performance; use audible comparisons and actual listening acceptance, not just note-generation tests.

**Exit:** nine complete musical/lighting identities, no unintended audio tails or resume glitches, sustained phone audio/visual checks recorded.

## M5 — Product identities, progression and whole-game polish

**Outcome:** two coherent products, with SMF nearly fully polished.

- Finish edition-specific titles/logos/menu art/copy; audit bitmaps for embedded branding, asset provenance and missing files. Generic output is neutral; SMF reflects the approved stage/brand reference.
- Finish stage passport/discovery UI, transitions, instructions, wardrobe/souvenir previews and rewards across both editions; avoid placeholder art or duplicate stage looks.
- Tune only with observed playtests: input comfort, sightlines, difficulty, reward reachability and clarity. Separate confirmed results from unobserved device behavior.
- Verify real-phone interruption/recovery, long Endless runs, low/no audio, reduced motion, offline/network failures, results/initials and board retries.

**Exit:** full acceptance checklist below, no important review defects, operator/contact/data notices correct, independent build/deploy verification ready.

## M6 — Pitch candidate and release readiness

**Outcome:** a consistent SMF build and presentation that represent the complete game.

- Freeze the candidate's edition/ruleset/content versions; record tests, performance devices, known limitations and rollback.
- Prepare a concise experience guide plus screenshots/gameplay capture from that exact build, showing all nine venues and secret discoveries honestly.
- Owner approves the external pitch/demo release and audience; then deploy backend first where needed, verify Pages/hosting separately and test the actual shared URL.
- Any separate SMF repository/project ownership or access grants are explicit owner decisions. No automatic outreach or publishing.

## Pitch completion checklist

- [ ] The AMP
- [ ] Fractal Forest
- [ ] The Grove
- [ ] The Living Room
- [ ] The Pagoda
- [ ] The Village
- [ ] Rabbit Hole, discovered from Living Room and revisit tested
- [ ] Secret Garden, discovered from Grove and revisit tested
- [ ] Ikigai Mori, discovered from Pagoda and revisit tested
- [ ] Nine authored visual/music/lighting identities accepted
- [ ] Generic/SMF brand, asset, save, recovery, consent and score isolation accepted
- [ ] Complete tour, Endless, four-perk builds, discoveries and finish/save tested
- [ ] Real-phone controls, interruptions, audio, reduced motion and sustained runs tested
- [ ] No placeholder/unfinished venues; reviews and release checks pass
- [ ] Exact-build pitch guide and gameplay capture approved

No target date is assigned. Iterative local previews continue; full pitch readiness depends on the checklist rather than the number of completed PRs.
