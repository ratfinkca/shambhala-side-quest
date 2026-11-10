# Two-edition delivery roadmap

Updated 2026-11-10. Approved program with expanded owner-selected content direction; M0 implemented locally with independent review fixes verified, not published. Authority: [edition split design](superpowers/specs/2026-11-06-edition-split-design.md), updated by the [secret/backstage direction](superpowers/specs/2026-11-10-secret-backstage-expansion-design.md). User target: nearly fully polished SMF edition before pitching; no fixed pitch date. Published recovery baseline remains PR #19 /67c44e0.

## Product target

One shared engine; separately built generic and SMF editions. Target content is six mains plus Rabbit Hole/Living Room, Secret Garden/Grove, Ikigai Mori/Pagoda, Villagio/Village and the AMP backstage grilled-cheese area: eleven venues. Neither new backstage is a production catalogue entry; AMP now has an isolated DEV-only delivery preview, while Villagio remains planning scope. The six main rehearsals and nine-entry catalogue are unchanged. Villagio starts as a small couple-hole putt-putt-themed dance area; a prize-winning putting mini-game is a likely later addition with rules still open. Generic preserves today's game/progression and gains its own neutral identity. Ownership-driven repository separation can follow the engine boundary; no external fork or deployment is created by this plan.

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

**Outcome:** dated, reviewable briefs for the six mains and five bonus spaces, plus an agreed SMF route/music contract.

**Status:** [sourced research briefs](research/smf-stage-identities-2026-11-06.md) and [concrete route/rules proposal](superpowers/specs/2026-11-06-smf-route-rules-design.md) drafted on 2026-11-06. Fresh builder check found no important unanswered questions beyond the recorded owner decisions. The owner selected 2026 venue structures and phrase-length rounds; 2027 official-site art is a separate [title/menu reference](research/smf-2027-interface-direction-2026-11-06.md). Secret reference gaps, final artwork and listening/layout acceptance remain explicit. The planning baseline is settled; ranked values are not frozen, and M2A clock practice is implemented locally.

- Research 2023–2026 official stage lineups/curator statements and available primary sets; record gaps instead of inferring secret programming from unrelated stages.
- For each venue: recognizable setting/materials, day/night identity, musical palette/tempo/form, lighting language, geometry/spawn constraints and asset sources.
- Review all six main identities and five bonus spaces with the owner; request stage-crew input through the owner rather than messaging anyone automatically. Existing research covers the original nine; Villagio and AMP backstage need their own briefs.
- Agree the six-main route/order, qualification/difficulty, four-perk policy, timed secret visit/discovery/reward behavior and gameplay/music clock alignment before freezing the first SMF scoring ruleset.
- Confirm generic working title/presentation; SMF uses the selected 2026 venue baseline and separate 2027 title/menu inspiration. These are quality gates, not reasons to delay M0 extraction.

**Exit:** complete eleven-venue matrix with source/confidence and no unresolved scoring/route contract; approved briefs and the next task plan. No blanket 128 BPM requirement.

## M2 — Six main SMF stages and edition-safe online services

**Outcome:** a complete six-stage SMF tour and Endless main loop with all parent stages recognizable.

**Status:** [M2 delivery sequence](superpowers/plans/2026-11-06-smf-m2-delivery.md) and [first musical-clock implementation plan](superpowers/plans/2026-11-06-smf-musical-clock.md) approved; M2A canonical timing and isolated clock practice are implemented locally. [Clock validation](superpowers/smf-clock-preview-validation.md) records final tests/review/device limits. Clock preview/readout fix accepted. All six mains now have isolated practice layouts, phrase clocks, original music sketches and owner-reviewed reference-guided illustrations. The [all-stage lighting pass](superpowers/plans/2026-11-09-smf-venue-lighting.md) is implemented locally with individual venue shows and stronger architectural projections; [validation](superpowers/smf-all-stage-lighting-validation.md) records 317 tests, builds and all-six phone/desktop inspection. [Current handoff](PROJECT-HANDOFF.md#m2b-venue-practice) records the successive art previews; the earlier [two-venue validation](superpowers/smf-venue-preview-validation.md) is historical. The owner accepted the fuller sound. The subsequent [laser/dancefloor pass](superpowers/smf-lasers-dancefloor-validation.md) is implemented locally: side fixtures, vertical crossing shows, venue-specific screens/chases, Village sky accents and carved tower masks, plus physical stage edges that keep gameplay below the facade. It passes 374 tests and both edition checks; phone/desktop browser previews are verified, with owner/physical-phone acceptance open. Next structural work remains six-stage local run/perk flow, then the new online contract. Generic recovery/posting stays unchanged; SMF production play remains disabled. No backend rollout or public release in M2A.

- Author all six layouts with safe spawns, reachable pickups and touch-friendly routes. Develop in contrasting internal slices, then complete the full collection.
- Use stable stage IDs/canonical route, finite four-perk builds/swapping, mode-aware save/finish/results and appropriately named discovery slots.
- Introduce a strict edition/ruleset protocol and server validation; isolate tickets, ranks, cache and opt-in reports while keeping arcade-v1 fully compatible.
- Apply additive backend changes and deploy functions before enabling SMF posting. Browser/staging tests cover cross-edition rejection and unknown/mismatched IDs; no production test scores.

**Exit:** every main stage playable, all scores reconcile with its ruleset, separate boards/configurations, saved/unfinished run handling verified. Visual/audio polish can still be in progress; this is an internal milestone.

## M3 — Five secret/backstage discoveries and return/recovery

**Outcome:** Rabbit Hole, Secret Garden, Ikigai Mori, Villagio and AMP backstage are optional visits associated with their parents. [Latest direction](superpowers/specs/2026-11-10-secret-backstage-expansion-design.md) records Hoola b2b Lioness, Footprints, Soup, Subvert and S2 respectively.

**Local preview (2026-11-10):** the latest owner approval moved AMP ahead of the earlier Rabbit Hole-first proposal. [AMP delivery rehearsal](http://127.0.0.1:5191/?rehearsal&backstage=amp), linked from venue practice, now offers three targeted sandwich deliveries to Sunny, Orbit and Violet within the 54.857-second AMP phrase clock. Owner playtest feedback increased the crowd to ten and replaced floating target icons with costume recognition from the order portrait. Wrong handoffs and bumps preserve progress and the outstanding order. The grilled cheese and cheese totem are temporary preview rewards; no saves, XP, telemetry or online services are involved. Original AMP synthesis remains in use, without an S2 recording. Desktop pickup, all correct handoffs, reward, mistakes/replacements, reset, pause and timeout were checked. Final verification passed 430 tests, production build and both edition isolation checks. Phone-size pickup/layout (390×844) passed without overflow or browser errors; physical-device pacing and listening still need playtesting. [Current handoff](PROJECT-HANDOFF.md#amp-backstage-delivery-preview) records the boundary and next steps. No production release or discovery/return/recovery/unlock integration has occurred.

- Build distinctive discoverable invitations, earned entry after parent clear, optional choice and persistent Explore access. Keep undiscovered names/art hidden behind mystery tiles until earned.
- Secret scores/items/boosts never alter main competitive totals or parked main state. Souvenirs reward discovery; no extra main perk choice/XP advantage from detours.
- Original three visits keep their first-completed-visit souvenir. AMP's grilled cheese / cheese totem requires targeted sandwich deliveries: collect one from the vendor and smooth-pass its recognizable recipient. Wrong passes give the sandwich away without progress; bumps drop it; both preserve completed deliveries. This replaces the untargeted pass-count idea. Villagio's putting prize belongs to a later agreed mini-game, not the first themed-area preview. Do not auto-award activity prizes on timeout.
- Keep main/secret visit identities, return menus and parked/active recovery atomic and bounded. Handle invitation collection, death/timeout, replay, discard, reload and finish/save without duplicate rewards.
- Finish AMP preview acceptance first, then continue Rabbit Hole, Secret Garden, Ikigai Mori and Villagio's themed-area preview. Test one bonus space at a time against its actual parent, then the full six-main/five-bonus journey. Explicitly test Villagio returning to Festival final results or the Endless loop decision.

**Exit:** first discovery, revisit, skip, interrupted detour and return work for every secret on desktop/touch; main-only board claims remain identical with or without optional visits.

## M4 — Music and coordinated atmosphere across all eleven

**Outcome:** recognizable, properly phrased music and lighting for every venue.

- Compose from the approved per-stage briefs, using appropriate genre tempos/rhythms/harmony and musically coherent phrase/section structure.
- Develop the common scheduling/instrument/transport foundation, then audition all six mains and five more intimate secret/backstage arrangements. Owner-selected main artist targets are KR3TURE, The Funk Hunters, Melo.Nade, AHEE, BTSM and Phibes for Living Room, Fractal, Grove, AMP, Pagoda and Village respectively. Recorded-track candidates are not selected or licensed assets; preserve original synthesis while cue/permission work proceeds.
- Coordinate lights, speaker response and stage details with musical form while preserving scoring cues/readability and reduced motion.
- Verify pause/mute/end/recovery and performance; use audible comparisons and actual listening acceptance, not just note-generation tests.

**Local progress (2026-11-09):** all six main-stage rehearsals now use a layered native instrument rack and fuller original arrangements. Laptop speakers are the primary tuning target, with centred sub retained for headphones/larger systems. Matched-level Sound Check clips compare each venue’s eight-bar build/drop to the previous sketch. [Sound validation](superpowers/smf-sound-weight-validation.md) records 351 tests, builds, browser renders and control checks. The owner accepted the fuller sound. Sustained physical-phone performance remains open. Secret-stage arrangements and nine-venue acceptance are still future work. The subsequent [laser/dancefloor preview](superpowers/smf-lasers-dancefloor-validation.md) adds phrase-driven shows across all six mains; Pagoda anime-inspired movie-mask projection cues are reserved for a later authored art pass, confined to facade surfaces and timed to selected phrases.

**Further local preview:** [Stronger mapping and private recording audition](superpowers/plans/2026-11-09-smf-mapping-recording-preview.md) adds Grove canopy/timber patterns, saturated AMP screens, stronger Pagoda projections and clearer Village masks. The owner supplied Hellhound (Woofax & Bryx Remix); it can be auditioned from a local file without distributing it. Waveform-derived174 BPM timing and a132.4s cue are documented, but the canonical172 BPM Village show is not automatically synchronized. Next if accepted: author recorded-track phrase/cue timing and confirm public game-use permission before distributing audio. Original synth arrangements remain available. 388 tests/build/edition checks pass; physical-phone and owner listening acceptance remain open.

**Exit:** eleven complete musical/lighting identities, no unintended audio tails or resume glitches, sustained phone audio/visual checks recorded.

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
- Prepare a concise experience guide plus screenshots/gameplay capture from that exact build, showing all eleven venues and bonus discoveries honestly. Do not depict an unimplemented putting mini-game as playable.
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
- [ ] Villagio, discovered from Village; small dance/golf area and final-results return tested
- [ ] AMP backstage, discovered from AMP; vendor pickup, target sprites, correct/wrong handoffs, dropped sandwiches, preserved progress and cheese-totem receipt tested
- [ ] Eleven authored visual/music/lighting identities accepted
- [ ] Generic/SMF brand, asset, save, recovery, consent and score isolation accepted
- [ ] Complete tour, Endless, four-perk builds, discoveries and finish/save tested
- [ ] Real-phone controls, interruptions, audio, reduced motion and sustained runs tested
- [ ] No placeholder/unfinished venues; reviews and release checks pass
- [ ] Exact-build pitch guide and gameplay capture approved

No target date is assigned. Iterative local previews continue; full pitch readiness depends on the checklist rather than the number of completed PRs.
