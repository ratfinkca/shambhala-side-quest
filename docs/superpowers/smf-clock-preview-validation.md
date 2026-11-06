# SMF musical-clock preview validation

Date: 2026-11-06. Local M2A engineering preview; no backend deployment, push, merge or public release. [Task plan](plans/2026-11-06-smf-musical-clock.md), [rules design](specs/2026-11-06-smf-route-rules-design.md).

## Scope

Six canonical phrase clocks (112/120/132/140/128/172 BPM) plus unchanged generic timing. Active-time gameplay, 2× half-open scoring windows, crowd/drop integration, Flow/candy/Bass Head and visuals share timing. Audio uses a 100-ms lookahead and independently rounded grid onsets, skipping missed notes after stalls. Effects/music remain separate. Nonlegacy timing cannot be stripped into a generic recovery-v1 snapshot.

DEV SMF `/?rehearsal&clock` opens Find the pulse: a neutral timing floor with minimal diagnostic percussion and bar accents, seven clock choices, Start fresh, Pause/Resume, mute and on-field Bass Head. It initializes no profile/lock/score/progression/playtest clients and writes no saves. Normal SMF remains the static catalogue; both production artifacts omit the clock lab. No new dependency or online protocol.

## Verification record

- Baseline: 225/225 tests. Initial restricted run could not bind the existing local asset-test server; permitted rerun passed.
- Final suite after the review fix pass:258/258 tests (254 before review).
- Each implementation task observed a failing regression before implementation, then its targeted tests and complete suite passed. Final totals and review follow below.
- Generic compatibility covers stored first-15-Endless-stage hashes, score validation, legacy recovery and frozen attempted submission bytes.
- Default production build and dual-edition asset/reference checker pass. Existing Phaser large-chunk warning remains. The checker preserves the default generic release artifact.
- In-app browser: meaningful lab/title, no framework overlay or console warnings/errors. Start, all seven choices and ten rapid switches exercised; one remaining canvas. Phone-sized390×844 and1280×900 layouts checked. Pause froze AMP at4.104s active across observations; Resume and mute updated controls and gameplay. A full AMP round reached54.857s active,0.000s remaining, Bar32/Beat4, and the explicit Phrase complete state. Other profile end boundaries are covered by deterministic tests; all profile starts/switches were observed in the browser.

## Observation limits

A phone-sized browser is not a physical touch/audio/performance test. Actual device listening, headphones/phone speakers, final composition quality and sustained phone performance remain unobserved. Diagnostic event scheduling tests establish grid/phase agreement, not audible latency or musical quality. Full venue music/art and durable SMF runs/online posting are not implemented in this slice.

## Final review and remaining work

One fresh read-only review by gpt-6-astra high found three Important issues. All were reproduced with failing regressions, fixed in one pass, and verified with258/258 tests plus both builds/checker. No second review was requested; these are author-verified fixes, not a claim that the reviewer re-approved the final diff.

1. A running-but-stalled/slow audio clock could compress queued notes. The transport now cancels on clock-rate divergence and schedules from current gameplay time when audio advances normally. Tests independently advance gameplay and audio clocks.
2. Recreating Phaser on every reset leaked its core document visibility listener. The lab now owns one Phaser engine and resets rounds inside it. Ten resets keep a single engine/listener registration; destruction occurs only at permanent page disposal.
3. A cached pagehide previously dismantled the lab before browser Back. Persisted pagehide now pauses without disposing. Browser Back was exercised and returned usable controls; this browser reloaded, so actual BFCache restoration remains unit-tested rather than directly observed.

Additional acceptance fix: simultaneous generic/SMF development servers shared an optimized-dependency cache, producing a504 for Phaser and a generic dynamic-import failure. Edition-specific Vite caches now prevent that collision. A failing-then-passing configuration regression and actual generic recovery UI confirm the fix. The disposable generic recovery fixture survived reload, returned paused and reached explicit finish/bank/initials with online posting unavailable; no production score or analytics entry was sent.

After the fix pass the in-app lab was rechecked: all seven choices, ten rapid switches, one canvas, clean console, phone/desktop screenshots and Back navigation. Production query guards are covered by boot tests and both built artifacts exclude lab entry/UI/fixtures. Actual production deployment/browser smoke is outside this local preview.

## Rulings and remaining minor follow-ups

- Include Flow's previously omitted elapsed consumer so its existing8/20/33/48-second windows follow active stage time. A wrong mapping could shift availability; regression tests pin both long/short clocks.
- Add explicit `useTransport` audio opt-in for the lab's generic-clock diagnostic sound. Default generic arrangements stay unchanged; a wrong selection would affect lab diagnostics, which are tested separately.
- Reviewer declined actual speaker/headphone latency and physical-phone behavior: keep these unobserved and hand listening/device acceptance to the owner. Unknown device latency/performance is the remaining risk.
- Reviewer declined finished venue content, tagged SMF recovery and new online schemas as outside M2A: retain disabled normal SMF play/posting and build these in B/C. This engineering preview is not the polished pitch candidate.

Deferred minors from review: a rounded-down phrase onset can show the preceding bar/beat for one rendered frame (less than0.5ms of logical time); holding Escape can repeat the lab pause/resume toggle; the exhaustive generic comparison currently delegates to the same phase function, although independent existing boundary fixtures remain. These do not alter scored 2× windows, default generic controls or saved data. Address them during the next clock/UI refinement.

Owner preview precedes the six-venue Part B task plan; backend/schema work precedes enabling any SMF posting. Screenshots are local QA artifacts outside the repository (`/tmp/sidequest-clock-mobile.png`, `/tmp/sidequest-clock-desktop.png`, `/tmp/sidequest-clock-end.png`).
