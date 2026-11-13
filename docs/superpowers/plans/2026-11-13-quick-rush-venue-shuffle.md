# Quick Rush venue shuffle implementation plan

**Goal:** Keep tap, swipe and thumbstick; shuffle SMF Quick Rush through six main venues without immediate repeats, and separate each venue's saved best and online board.

**Approved scope:** The owner's November 13 request accepts the shuffled venue/per-venue score proposal. No publishing requested. Reuse the active checkout and preserve all preceding mobile work.

**Architecture:** Resolve and persist one `rushStageId` when creating a Rush run. Store a six-venue shuffle bag and last selected venue in the profile. Shared rules, recovery, optional telemetry and online ticket validation use that same selection. Existing missing Rush venue identifiers mean Pagoda. Festival/Endless and generic behavior stay unchanged.

**Timing decision:** Retain authored complete musical phrases: existing venue clocks span approximately 55–69 seconds. Replace the unconditional 60-second promise in SMF Rush UI with one set / venue-specific duration. No audio retiming or score normalization.

## Contracts

- Shared `smfRuleStage(mode,index,rushStageId?)` defaults omitted Rush selection to `smf-pagoda`; validates supplied selection against six main stage IDs. `SMF_RULES.id` remains `smf-v1`: existing Pagoda mechanics remain the same and all other venue scores occupy separate boards.
- New Rush runs have `rushStageId`. Non-Rush runs omit it. `profile.rushRotation={remaining:[],lastStageId:null}` persists draw state. Fisher–Yates bag gives each venue once per six draws; boundary draw must differ from last. Starting a run consumes a draw even if later abandoned. Invalid repeated start attempts consume none.
- `createTourRun(profile,mode,id,themeId,rng=Math.random)` remains compatible with existing callers. Model `mainStageId`/`stageForRun` and all restored snapshots use selected venue.
- `boards.rush` stays a flat list with `rushStageId` per row, retaining 20 entries per venue (up to120). Existing untagged Rush rows normalize to Pagoda. `lastResult` carries selected venue. Saved best is explicitly the best locally saved score for that venue; saving and optional online posting remain separate actions.
- HTTP run-ticket, score submission and Rush leaderboard request accept optional `rushStageId`. Omitted Rush means Pagoda for old clients; reject a venue field for other modes. Ticket binds the selected venue; receipts must match that venue and its exact clock.
- Venue-scoped board responses include `rushStageId` for explicit venue queries; legacy Rush queries without a venue keep the old row shape and return Pagoda only. Public board cache must include venue and prevent stale response crossover.
- SQL migration adds venue partition and ticket binding, backfills old Rush rows/tickets to Pagoda, preserves legacy RPC signatures via wrappers, locks down new overloads and retains RLS/retention.
- Optional SMF stage telemetry permits the stage chosen for Rush, records its identity and keeps preceding optional `movementMode` support. Run summaries add optional `rushStageId`; old events stay valid. Rehearsal still disables uploads.

## Tasks / ownership

- [x] Model/recovery agent: shuffle helper, model/store changes and regression tests; avoid UI/shared backend files.
- [x] Backend agent: shared rules/score/arcade/telemetry validators, additive SQL migration and DB/HTTP tests. No deployment.
- [x] UI agent: venue-aware title/help/results/scoreboard surfaces in `view.js`, `ui.js`, UI styles and tests. Root supplies board state and routes. No entry/model edits.
- [x] Root: entry ticket/score/telemetry fields, selected-board state, venue-aware client/cache, docs and runnable phone preview.
- [x] Review: first/boundary shuffle draws; reload/abandon/legacy recovery; score ticket tampering; cross-venue cache leakage; explicit-save best; generic isolation and existing finish confirmation.
- [x] Verify: focused behavior tests, full suite, both edition builds, native phone-sized play/replay/score-filter checks.

## Local validation completed November 13

- `npm test`: **710 passed, 0 failed**. `npm run check:editions`: generic and SMF builds, asset allowlists and references passed; invalid edition rejected. `git diff --check` passed.
- Independent read-only reviews covered integration, model/recovery and migration/HTTP compatibility. No actionable findings remained. Five database/HTTP tests use actual migrations locally; an additional legacy HTTP retry retained its original accepted digest across migration without duplicating the score.
- Native browser checks used the isolated phone rehearsal at 390×844 and 844×390. A pre-existing Pagoda result survived normalization and was explicitly saved; replay selected AMP with its 55-second set. Rotating paused safely. Reload/resume preserved AMP with 32 seconds remaining. The set completed through the guarded Continue screen; saving created an AMP-only entry. Switching boards showed AMP 0 and Pagoda 30 separately. Replay then selected Village with its 67-second set. Settings exposed tap/click, swipe bursts and thumbstick.
- Fixed a scroll-position issue found during this check: changing screens now starts at the heading; saving or filtering within a screen preserves its scroll position.
- Screenshot: `/tmp/quick-rush-venue-scores.png`. Phone preview remains at `http://192.168.14.143:5194/?rehearsal&tour&phone` on the same network. LAN HTTP rehearsal remains session-only when recovery locks are unavailable; persistence was verified on localhost. Real iPhone feel and hosted rollout remain separate checks. No production scores/events were written.

## Release order and limits

Prepare locally only. A later release must apply the venue migration, then deploy SMF ticket/submit/leaderboard/playtest functions, harmlessly verify those endpoints, then publish the frontend. Do not submit fake production scores or telemetry for testing. Physical iPhone feel remains a separate owner playtest; no new control pruning.
