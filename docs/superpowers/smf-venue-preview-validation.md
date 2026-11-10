# Living Room and Pagoda venue preview

Date:2026-11-06. Local M2B1 preview, not a public release. [Plan](plans/2026-11-06-smf-main-stages.md), [approved rules](specs/2026-11-06-smf-route-rules-design.md), [venue briefs](../research/smf-stage-identities-2026-11-06.md).

## Scope

Two independently authored venues: Living Room112BPM/68571ms/23sparks/10dancers/two cabinets; Pagoda128BPM/60000ms/28sparks/18dancers/three cabinets. Targets remain preview balance. Full dancer paths and pickup-grid connectivity are tested. Cabinets and bass zones use the existing collision/pressure system; river, trees, furniture and architecture are perimeter scenery.

Original canvas art supplies riverside/timber/lamp scenery versus a tiered projection facade and indigo field. Both use bounded wide lighting and static reduced-motion variants. Original synthesized sketches have four8-bar sections,4-bar answers, separate bass/chord/motif/percussion parts, a final tonal return and an optional Flow layer. Living Room has small bounded swing offsets; timing/scoring remains on the canonical clock. This is an early music/art preview, not final production content or an artist imitation.

Reference refresh: [official stage descriptions/current photo carousels](https://www.shambhalamusicfestival.com/stages) and [dated2026 album index](https://www.shambhalamusicfestival.com/blog/2026-photo-album-blog). Current stage photos have mixed/unknown capture dates, including2024 labels. These original interpretations target the approved2026 baseline; final silhouettes still need owner/crew confirmation. No photographs, logos or recorded tracks were imported/copied.

## Isolation and lifecycle

DEV SMF `/?rehearsal&venues` only. Two real stage choices; the seven-clock neutral lab remains at `/?rehearsal&clock`. Both use one Phaser engine across resets, paused hidden-page/BFCache behavior, fixed-width stable HUD columns and separate music/effects audio channels with one Sound on/off control. The venue arena scales to available window height to keep the entire floor visible and its Bass Head button aligned; short desktops get a smaller floor.

No profile, storage, lock, XP, score ticket, posting or playtest client is initialized. All practice progress resets on reload. Normal SMF stays the catalogue with three anonymous locked secrets. Generic gameplay/recovery/protocol and online clients remain unchanged. Both production outputs omit venue practice, authored fixtures and scenery/music modules through guarded dynamic imports/injection.

## Evidence

- Starting suite258/258. Each task observed a failing regression and a green targeted test before completion. Integrated suite270/270 before review;271/271 after the fix pass. Default build and both edition checks pass. Independent review/fix outcome follows below.
- Layout tests sample full dancer trajectories at50ms,14px cabinet clearance,24px spawn/Flow clearance, connected pickup-grid cells and left/centre/right routes. Seeded random and fallback spawns remain open.
- Rendering tests distinguish the venues, preserve geometry, freeze the water/projection layers under reduced motion and destroy old owned scenery nodes on switches.
- Music tests cover all512steps per venue, arrangement differences, low-score completeness, returning root, finite/bounded voices, swing offsets, Flow, silence at end and voice tails ending within the round.
- Browser via in-app controls at desktop and390×844: both venues, real destination clicks and held arrow movement; Living Room sparks/Flow/close passes/bass charge; Pagoda full-charge activation and Living Room partial activation (1.2s protection remaining at3.583s active after spending the first quarter charge). Both on-field controls worked.
- Pagoda reached60.000s active/0.0s remaining/Bar32Beat4 and the correct0/28 target feedback. Living Room target/clock and live play were observed; its exact logical end is covered by clock tests, not a second complete browser round.
- Ten venue switches retain one canvas; target/score reset. Pause/Resume and mute/unmute work; held Escape produces one toggle rather than repeated toggles. Navigation to catalogue preserves all three anonymous secret tiles; browser Back returns a fresh usable lab.
- Live HUD measurement:60 desktop samples and50 mobile samples showed0px x/width movement in phrase/time readouts, no clipping. Both entire arenas fit the tested windows. Console clean. Water/projection reduced-motion behavior is verified in renderer tests; an actual OS accessibility toggle was not exercised.
- Screenshots outside repo: `/tmp/sidequest-living-room-preview.png`, `/tmp/sidequest-pagoda-preview.png`, and corresponding `*-mobile.png` captures. Actual device listening is unobserved; no claim of audible musicality/latency acceptance.

## Limits and next work

Physical phone/touch hardware, actual speaker/headphone listening and sustained mobile performance remain unobserved. A phone-sized viewport is layout evidence. Generation/scheduling tests do not establish musicality or device latency.

This two-venue preview does not complete M2B. Four venues, six-stage Festival/Endless transitions and four-slot perk decisions/progression remain. Tagged durable SMF recovery/new online contract precede enabling normal play/posting; secrets remain M3 and final nine-stage music/lighting M4.

## Independent review and fix pass

One fresh read-only gpt-6-astra high review found no Critical issues and two Important ones; both were addressed in one author-verified fix pass. No second review was requested.

- Pagoda dancer17 originally overlapped the arrival position and caused immediate slowdown. Its anchor moved from500,445 to555,445. A failing-then-passing regression requires at least64px initial player/dancer distance in both venues and no standing-arrival collision during the first1500ms, sampled every10ms. Full-round cabinet trajectory checks still pass.
- The mobile target auto-column moved6.63px when elapsed time gained a digit, despite the two main HUD cells staying fixed. Status columns now reserve16characters for the target and14 for desktop elapsed time, with monospace text and a left-anchored target. At390×844 the target stayed at x263.0390625,width105.9609375 from0.2s to16.430s, including a pickup; desktop also has fixed capacity for two-digit counts. No clipping/console errors after fixes.
- A minor factual wording error was corrected: audio has separate music/effects channels, while the preview exposes a single Sound on/off control. It does not promise independent volume controls.

Final checks:271/271 tests, default production build, both edition builds/asset checks, relative documentation links and whitespace all pass. Existing large-Phaser-chunk warning remains. No new deferred product findings from this review. Earlier clock bar-boundary display/exhaustive-reference-test follow-ups remain documented separately.

Builder decision: fit the practice arena to window height so the complete floor and on-field control stay aligned; short desktop windows trade some arena size for a complete view. Final2026 facade accuracy and musicality still require owner/crew/device feedback. This is an original two-venue interpretation, not a surveyed festival replica or the final pitch build.

## Recognizable architecture follow-up — 2026-11-06

Flow under test: SMF `/?rehearsal&venues` → Start fresh → switch Living Room/Pagoda → inspect distinctive architecture at desktop and phone size → Pause.

- Living Room now has a steep timber A-frame, open triangular stage face and warm booth, retaining the lamps, cedars and riverside edge. The A-frame is supported by a firsthand 2026 written report; detailed proportions remain original interpretation pending a clear dated frontal reference/crew review.
- Pagoda now has the visually referenced 2026 faceted pale tower, single main roof with upturned tips, dark arched openings, rail bands, wide lower porch/columns and central booth. Smooth original projection patterns preserve the openings. The earlier repeated-roof silhouette was inaccurate. [Reference provenance](../research/smf-stage-identities-2026-11-06.md#2026-architecture-correction--local-two-venue-preview) records the photographer gallery/file and evidence limits. No source photos were imported.
- In-app browser/CUA at `http://127.0.0.1:5191/?rehearsal&venues`, default 1280×720 and temporary 390×844. Page identity/content, complete visible arena, no framework overlay and both silhouettes verified. Start fresh, venue changes/reset and Pause→Resume state verified. No warning/error console entries. Viewport override reset; preview left paused. Actual phone hardware and accessibility-setting changes were not tested.
- Existing renderer tests verify distinct drawings, no stage-data mutation, frozen reduced-motion layers and scenery cleanup when switching. No geometry, score, clocks, audio or backend behavior changed.
- Fresh result: **271/271 tests pass**, default build and both edition builds/asset checks pass; documentation links and whitespace checks pass. The initial parallel full-suite/build invocation interfered with the suite’s dist-inventory check (270/271); rerunning the suite alone passed. Keep artifact-mutating build/check commands sequential with this suite. The existing large-Phaser-chunk warning remains.
- Screenshot evidence outside repo: `/tmp/sidequest-living-room-recognizable.png`, `/tmp/sidequest-pagoda-recognizable.png` and corresponding `*-recognizable-mobile.png` images. These are stylized scenery-strip interpretations, not measured architecture. Owner recognition feedback remains the art acceptance gate. No deployment made.
