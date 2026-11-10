# Two-edition delivery roadmap

Updated 2026-11-10. Approved program with a local parity candidate for Festival, Quick Rush and Endless, five optional discoveries, permanent souvenirs and paused recovery. Automated and local browser verification has progressed; native fullscreen, physical-phone and owner acceptance remain open. SMF remains unpublished. Authority: [edition split design](superpowers/specs/2026-11-06-edition-split-design.md), updated by the [secret/backstage direction](superpowers/specs/2026-11-10-secret-backstage-expansion-design.md). User target: nearly fully polished SMF edition before pitching; no fixed pitch date. Published recovery baseline remains PR #19 /67c44e0.

## Product target

One shared engine; separately built generic and SMF editions. The local SMF Festival now connects six mains plus Rabbit Hole/Living Room, Secret Garden/Grove, Ikigai Mori/Pagoda, Villagio/Village and AMP backstage: eleven venues. Villagio has two playable putting holes and an earned Golden Chicken Totem; AMP has targeted sandwich deliveries and an earned Cheese Totem. The map conceals each bonus identity until discovered. Original arrangements and venue-specific art/light shows are included, with final polish and physical-phone acceptance still open.

Normal local play: [http://127.0.0.1:5191/](http://127.0.0.1:5191/). [Tour implementation and validation](superpowers/smf-tour-validation.md) records the distinction between implemented behavior, automated evidence and browser observations. Generic preserves its public gameplay/progression and online services. SMF has independent device-local progress/recovery and implemented separate online score and opt-in playtest services, with backend deployment and harmless live verification completed. The approved public test destination is `/smf/` on the existing Pages site. Any separate repository or ownership transfer remains a later decision.

## M0 — Edition foundation (local preview complete)

**Historical foundation status:** implemented locally with 225 tests, dual builds and browser preview checks at that milestone; independent review fixes verified. [Validation](superpowers/edition-foundation-preview-validation.md).

**Outcome:** a safe local engineering preview, not the pitch build.

- Explicit generic/SMF manifest/build selection and asset boundary.
- Extract three-stage assumptions into trusted generic rules data, while preserving every existing generic result, variant, award and score payload.
- The original nine-entry scaffold established main/secret parent relationships. The current parity candidate supersedes it with eleven entries, playable SMF content and separate online service code; backend deployment and harmless live verification are complete.
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

**Local status:** the parity candidate implements the six-stage Festival, 60-second Pagoda Quick Rush and repeating Endless, four-perk choices, results, device-local recovery and edition-specific score, board and playtest service code. The route is Living Room → Fractal Forest → Grove → AMP → Pagoda → Village; Endless applies duration-normalized target growth and capped crowd/speed scaling. The generic profile and service contracts remain separate.

[Parity validation](superpowers/smf-feature-parity-validation.md) records **549 passing tests**, both edition builds, the combined Pages build and the browser observations so far. Local browser checks cover the principal mode, recovery, bonus and retry paths; native fullscreen, physical-phone and owner acceptance remain open. The SMF migration and four functions are deployed; harmless live validation passed before frontend publication. Earlier [clock](superpowers/smf-clock-preview-validation.md), [venue](superpowers/smf-venue-preview-validation.md) and [laser/dancefloor](superpowers/smf-lasers-dancefloor-validation.md) records are historical slice evidence.

- Complete mode, perk, score, recovery and bonus-return acceptance against the final candidate.
- Backend migration, functions and harmless live verification are complete; do not create production test scores or events.
- Verify the reviewed PR, CI, merge, Pages deployment and both public edition paths independently.

**Exit:** every main stage playable, all scores reconcile with its ruleset, separate boards/configurations, saved/unfinished run handling verified. Visual/audio polish can still be in progress; this is an internal milestone.

## M3 — Five secret/backstage discoveries and return/recovery

**Outcome:** Rabbit Hole, Secret Garden, Ikigai Mori, Villagio and AMP backstage are optional visits associated with their parents. [Latest direction](superpowers/specs/2026-11-10-secret-backstage-expansion-design.md) records Hoola b2b Lioness, Footprints, Soup, Subvert and S2 respectively.

**Local integration status (2026-11-10):** all five activities are now connected to their actual Festival parents. Anonymous invitations appear after 18 active seconds, and only a qualifying parent clear commits discovery. An after-clear choice offers the detour or continued Festival; skipping keeps the discovery. Explore revisits are available when no Festival is active. The final Village detour preserves earned Festival completion and returns to results.

- Rabbit Hole, Secret Garden and Ikigai Mori award their base souvenir after the complete phrase-long visit or early activity completion. Early exit does not count. Their 6/3/5 activity goals remain optional early-completion routes.
- AMP requires three correct deliveries to costume-identified recipients. Wrong smooth passes give away only the held sandwich; a bump drops it. Completed deliveries and the outstanding order remain intact. Winning grants the permanent local Cheese Totem.
- Villagio requires two cups within eight total shots, with no countdown. Winning grants the permanent local Golden Chicken Totem; arrival, exploration or waiting cannot award it.
- Bonus scores, XP, temporary boosts, charge and activity items never alter the main run. Atomic checkpoints preserve discovery, ownership, the parked parent and at most one child. Held sandwiches and moving putts restore paused; owned rewards do not grant twice.
- Wardrobe equips earned souvenirs, and names/art remain concealed until discovery. A separate DEV tour lab supports repeatable checks without writing to normal SMF progress; old isolated rehearsals remain disposable.

**Acceptance status:** automated state, activity recovery, atomic storage, generic compatibility and both edition-build checks pass. Native integrated desktop/phone-size preview checks are complete; physical-phone and owner acceptance remain open; actual phone comfort/performance and owner balance feedback remain open. [Validation](superpowers/smf-tour-validation.md). Final Villagio return, bonus paused recovery and Endless continuation were observed in the parity browser check. Full skip/revisit/early-exit coverage and physical-device comfort remain follow-up. No public release is claimed.

**Exit:** first discovery, revisit, skip, interrupted detour and return work for every secret on desktop/touch; main-only board claims remain identical with or without optional visits.

## M4 — Music and coordinated atmosphere across all eleven

**Outcome:** recognizable, properly phrased music and lighting for every venue.

- Compose from the approved per-stage briefs, using appropriate genre tempos/rhythms/harmony and musically coherent phrase/section structure.
- Develop the common scheduling/instrument/transport foundation, then audition all six mains and five more intimate secret/backstage arrangements. Owner-selected main artist targets are KR3TURE, The Funk Hunters, Melo.Nade, AHEE, BTSM and Phibes for Living Room, Fractal, Grove, AMP, Pagoda and Village respectively. Recorded-track candidates are not selected or licensed assets; preserve original synthesis while cue/permission work proceeds.
- Coordinate lights, speaker response and stage details with musical form while preserving scoring cues/readability and reduced motion.
- Verify pause/mute/end/recovery and performance; use audible comparisons and actual listening acceptance, not just note-generation tests.

**Local progress (2026-11-09):** all six main-stage rehearsals now use a layered native instrument rack and fuller original arrangements. Laptop speakers are the primary tuning target, with centred sub retained for headphones/larger systems. Matched-level Sound Check clips compare each venue’s eight-bar build/drop to the previous sketch. [Sound validation](superpowers/smf-sound-weight-validation.md) records 351 tests, builds, browser renders and control checks. The owner accepted the fuller sound. Sustained physical-phone performance remains open. This paragraph records the earlier six-stage sound pass. Original arrangements now cover all five bonuses too; full eleven-venue listening and sustained physical-device acceptance remain open. The subsequent [laser/dancefloor preview](superpowers/smf-lasers-dancefloor-validation.md) adds phrase-driven shows across all six mains; Pagoda anime-inspired movie-mask projection cues are reserved for a later authored art pass, confined to facade surfaces and timed to selected phrases.

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
- Prepare a concise experience guide plus screenshots/gameplay capture from that exact build, showing all eleven venues and bonus discoveries honestly. The two-hole putting game is implemented; do not depict a playable slide ride or other planned extras as finished.
- The authorized public test edition follows backend-first verification, reviewed PR, CI and public smoke checks; a separate owner decision governs any external pitch/demo and audience.
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
