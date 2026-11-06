# SMF musical-clock preview validation

Date: 2026-11-06. Local M2A engineering preview; no backend deployment, push, merge or public release. [Task plan](plans/2026-11-06-smf-musical-clock.md), [rules design](specs/2026-11-06-smf-route-rules-design.md).

## Scope

Six canonical phrase clocks (112/120/132/140/128/172 BPM) plus unchanged generic timing. Active-time gameplay, 2× half-open scoring windows, crowd/drop integration, Flow/candy/Bass Head and visuals share timing. Audio uses a 100-ms lookahead and independently rounded grid onsets, skipping missed notes after stalls. Effects/music remain separate. Nonlegacy timing cannot be stripped into a generic recovery-v1 snapshot.

DEV SMF `/?rehearsal&clock` opens Find the pulse: a neutral timing floor with minimal diagnostic percussion and bar accents, seven clock choices, Start fresh, Pause/Resume, mute and on-field Bass Head. It initializes no profile/lock/score/progression/playtest clients and writes no saves. Normal SMF remains the static catalogue; both production artifacts omit the clock lab. No new dependency or online protocol.

## Verification record

- Baseline: 225/225 tests. Initial restricted run could not bind the existing local asset-test server; permitted rerun passed.
- Final suite before independent review:254/254 tests.
- Each implementation task observed a failing regression before implementation, then its targeted tests and complete suite passed. Final totals and review follow below.
- Generic compatibility covers stored first-15-Endless-stage hashes, score validation, legacy recovery and frozen attempted submission bytes.
- Default production build and dual-edition asset/reference checker pass. Existing Phaser large-chunk warning remains. The checker preserves the default generic release artifact.
- In-app browser: meaningful lab/title, no framework overlay or console warnings/errors. Start, all seven choices and ten rapid switches exercised; one remaining canvas. Phone-sized390×844 and1280×900 layouts checked. Pause froze AMP at4.104s active across observations; Resume and mute updated controls and gameplay. A full AMP round reached54.857s active,0.000s remaining, Bar32/Beat4, and the explicit Phrase complete state. Other profile end boundaries are covered by deterministic tests; all profile starts/switches were observed in the browser.

## Observation limits

A phone-sized browser is not a physical touch/audio/performance test. Actual device listening, headphones/phone speakers, final composition quality and sustained phone performance remain unobserved. Diagnostic event scheduling tests establish grid/phase agreement, not audible latency or musical quality. Full venue music/art and durable SMF runs/online posting are not implemented in this slice.

## Final review and remaining work

Final totals, completion/production/recovery browser checks and independent review outcome are recorded here before handoff. Owner preview precedes the six-venue Part B task plan; backend/schema work precedes enabling any SMF posting.
