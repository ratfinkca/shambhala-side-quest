# M2 SMF Main Stages Delivery Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver the six-main-stage SMF Festival/Endless preview, then safely connect its own online boards without changing the generic game.

**Architecture:** Deliver three independently verifiable parts: A musical-clock foundation, B six authored venues and local run flow, C versioned online services/recovery compatibility. Part A has a complete task plan now; B/C receive code-level plans after the preceding interfaces and preview outcomes exist. Do not invent final art, API migration details or playtested balance merely to fill a future task list.

**Tech Stack:** Existing Node 24, Vite 8, Phaser 3, Web Audio and Supabase/Postgres. Native execution is the user's established preference; one fresh whole-branch review at the end of each implementable part.

**Spec:** [Route/rules design](../specs/2026-11-06-smf-route-rules-design.md), [edition design](../specs/2026-11-06-edition-split-design.md), [venue research](../../research/smf-stage-identities-2026-11-06.md).

## Global Constraints

- Venue reference is 2026; 2027 campaign inspiration applies to title/menus, not every venue.
- SMF rounds follow complete musical phrases; generic stays 60000 ms with its existing 15/30/45-second drops.
- Preserve generic profile/lock, recovery-v1, arcade-v1 requests, pending retry bytes, progression and actual gameplay results.
- Four distinct earned perks; allow add/keep/swap in both longer SMF modes. Six mains per Festival/Endless loop.
- Secrets stay anonymous/locked. Actual invitations, bonus visits and nested recovery belong to M3.
- No production writes from development labs. Consent remains opt-in; local saves and optional online posts stay separate.
- Do not publish or create another repository/service account as part of local implementation. Any later backend rollout precedes enabling its frontend connection.

## Review Focus

1. A new round duration cannot truncate generic recovery or silently reinterpret a pending arcade-v1 submission (A compatibility tests, C versioned recovery tests).
2. Paused/muted/slow audio cannot change scored time, replay a missed boost or restart an old stage's scheduled voices (A transport and boundary tests).
3. Six-stage Festival cannot stall at four perks or offer an unusable final-stage upgrade (B run/UI tests).
4. Same-origin generic and SMF cannot share progress, consent, locks or leaderboard cache context (B storage and C client/server tests).
5. A valid six-stage score cannot post into a generic board, and secrets cannot inflate main clears/totals (C strict protocol/database tests; M3 regression requirement).

---

## Part A — musical clock (first implementable slice)

- [ ] Execute the [detailed musical-clock plan](2026-11-06-smf-musical-clock.md).
- [ ] Show a DEV-only, disposable timing lab with canonical main-stage clock choices and generic compatibility. This is a clock/instrument check, not a named SMF venue dressed in old art.
- [ ] Verify exact durations, 2× boundaries, pause/resume, bounded audio scheduling and beat/visual agreement. Generic regression fixtures and actual paused reload recovery remain valid.
- [ ] Record browser/audio/device evidence accurately and resolve important independent review findings.

**Exit:** trusted timing contract and working lab, default SMF remains the static catalogue, no new backend or production protocol. The owner reviews the clock preview before it becomes the basis of the six-stage playtest.

## Part B — six authored main venues and local run preview

**Entry:** accepted clock behavior and a detailed task plan using the actual Part A interfaces. Filename reserved: `2026-11-06-smf-main-stages.md` (not yet written). No separate six-way implementation fork.

**Concrete content and code boundaries:**

- New `src/editions/smf-stages.js` owns all six actual geometries, safe spawns, crowd anchors, speaker islands and Flow positions, keyed by the six stable IDs. Use the route/rules design's initial target rates/crowd counts/island budgets; geometry tests must prove usable regions and bypasses. No copied generic layout renamed as a festival venue.
- New `src/editions/smf-stage-view.js` owns venue-specific scenery/silhouettes; `src/StageRenderer.js` delegates to it. Keep UI campaign art separate. Complete all six, beginning with a contrasting Living Room/Pagoda slice for readable open space versus projection architecture.
- `src/run.js`, `src/endless.js`, `src/screens.js`, `src/results-view.js`, `src/game-entry.js` use trusted edition route/rules rather than generic stage indexes. Generic default calls keep their existing shapes/behavior. SMF Festival gets five inter-stage decisions, four distinct slots with optional keep/swap, no upgrade after clear six; Endless loops six. SMF Quick Rush is the 60-second Pagoda profile without a target.
- Assign shared XP/wardrobe definitions explicitly to SMF; hide generic-only layout achievements. Main-stage XP/receipt commits precede recomputing earned perk choices. No cross-edition migration or extra progression from practice/locked secrets.
- First preview is DEV rehearsal only, memory/disposable storage and no online posting. Use a six-main-stage picker and real run transitions; keep all three anonymous secret slots. A normal SMF Play action is enabled only when local score/recovery/receipt integration is validated, not merely when the first two scenes render.
- New SMF recovery requires an edition/ruleset-tagged snapshot and complete validation of its main-run history, timing, perks and submission context. Preserve generic v1 unchanged and reject mismatched/unknown contexts before scene construction. Do not save an SMF record in the legacy v1 envelope. Its exact schema is planned with Part C's shared score contract before normal persistent SMF runs are enabled; until then the rehearsal clearly resets on reload.
- Produce original phrased musical sketches for the initial profiles to validate timing/listening; these are not M4's final nine arrangements. Keep provisional venue audio/art visibly described as preview in owner QA, with no claim of final 2026 reference accuracy.

- [ ] Write/review the Part B task plan after A acceptance.
- [ ] Build and review the contrasting two-venue lab, then complete all six base venues.
- [ ] Exercise six-clear Festival, repeated Endless, all perk decisions, failed target, voluntary bank, score initials, settings/hidden pause, input/reduced motion and representative device performance.
- [ ] Validate same-origin profile isolation and the tagged recovery path before enabling durable local SMF play.

**Exit:** complete playable six-main local preview, all targets/geometry reconcile, no hidden-stage identity leak. Capture owner listening/layout feedback; do not freeze a public ranking from untested preview targets.

## Part C — edition-safe boards, analytics and durable recovery

**Entry:** accepted route/timing/content IDs and a separately reviewed schema/rollout task plan. Filename reserved: `2026-11-06-smf-online-contract.md` (not yet written). Pure shared validation/schema design may be pulled forward to unblock B's durable recovery; service enablement stays after preview acceptance.

**Contract requirements locked now:**

- Add a new strict protocol carrying schema/edition/ruleset plus per-stage identity and canonical active duration. Bind context into ticket creation, post digest, stored record, board query/cache and recovery. Server owns the six-main sequence/targets/limits; never trust a client duration/tempo or choose edition by origin/path alone.
- Existing `supabase/functions/_shared/score.js`, `_shared/arcade.js`, current SQL RPCs and URL readers retain their exact arcade-v1 path. Add new shared modules and additive versioned SQL/functions or explicitly version dispatch; choose exact names/shapes in the contract plan. No broadening old allowlists to silently accept SMF fields.
- Keep current 24-hour tickets, body/history bounds, atomic idempotent retry, initials/input display and ranking order. Define the new ticket's elapsed-time check from canonical completed-stage durations rather than `count*60000`. Local play/save continues if a ticket expires or retained history exceeds online limits.
- Extend opt-in playtest records with strict edition/ruleset/stage context and stage-duration-based bounds. Keep legacy schemas/readers/reports and retention/private access intact. Do not send longer/six-stage SMF summaries into the old 60000-ms/three-stage schema; sending remains disabled until the new path exists.
- Complete edition-tagged recovery normalization with B's local history/run logic, preserved frozen attempted posts and original build/ticket identity. Main/child nesting is reserved for M3, not partially accepted by an overly broad parser now.
- Test database partitions, cross-edition rejection, unknown rules, malformed histories/durations, duplicates, expiry, old pending retries and opt-out with local/disposable services. Production checks use harmless validator requests, never synthetic leaderboard/analytics entries.

- [ ] Write/review the Part C protocol, SQL/RLS/reporting and recovery task plan.
- [ ] Complete local integration and physical/browser acceptance; approve the preview values/content version for ranking.
- [ ] Only on a later explicit ship instruction: deploy additive migration/functions first, verify legacy/new safe validation, then connect/build/merge frontend and separately verify hosted UI/bundles.

**Exit:** isolated SMF boards and opt-in reports, validated durable local recovery and unchanged generic clients. No release/ownership transfer is implied by a local pass.

## Scope and handoff

M2 finishes with six real mains and the online/local lifecycle; M3 adds all three secret visits, M4 completes nine music/lighting identities, and M5 finishes 2027-inspired interface polish. These are incremental engineering previews toward the complete nine-venue pitch. This delivery document sequences the program; only Part A currently contains implementation-ready tasks. Do not report all of M2 complete after the clock lab.
