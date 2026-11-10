# SMF player feature parity and public test release

> **For agentic workers:** Execute independent file-owned tasks in parallel, then review the integrated game and release backend before frontend.

**Goal:** Restore the full existing player experience around all six SMF main stages and five optional bonus venues, test it, and publish a separate SMF test edition through a reviewed PR.

**Architecture:** Retain the tested SMF tour/bonus checkpoints and extend them to three modes. Reuse neutral wardrobe, theme, progression, feedback and submission components. Canonical data-only SMF rules are shared by client and server; separate endpoints and database tables keep legacy arcade-v1 compatible. One Pages artifact serves generic at the existing root and SMF at /smf/.

**Tech Stack:** Existing Vite/Phaser, browser storage and Supabase Edge/Postgres. No external recordings distributed.

**Spec:** Owner approval on 2026-11-10 of the four-step feature restoration plan; `../specs/2026-11-06-smf-route-rules-design.md` and `../specs/2026-11-06-edition-split-design.md` remain authoritative.

## Global constraints

- Preserve generic game, saves and backend contracts. SMF owns profile, recovery, consent and boards.
- Festival is six stages; Rush is 60 seconds at Pagoda; Endless repeats six stages with duration-normalized target rate +3 per loop capped45, +2 dancers capped22, speed +.08 capped.20.
- Four distinct perks, always Keep, optional swap at capacity. No bonus score/XP/perks/charge in main results. Final Festival Villagio returns to results; Endless returns to next-stage choice.
- Existing SMF v1 profiles and active Festival saves migrate without losing discoveries, rewards, XP or checkpoint.
- Full neutral wardrobe and three themes including Surprise; saved music/effects; visible pause/resume/settings/fullscreen; readable HUD and stage intro.
- Only edition-applicable achievements: no unreachable generic layout challenge. Equivalent neutral reward can be assigned to clearing all six SMF venues in Endless.
- Initials/local boards separate from opt-in online posting; analytics default off, discoverable on title/settings, aggregate only.
- Backend migrations/functions deploy and pass harmless validation before frontend publication. No test production scores/events.
- No public claim until CI, merge, Pages deployment and actual published frontend checks complete.

## Review focus

- Short desktop/landscape/phone viewports keep pause, score, clock and playfield accessible without scrolling during play.
- Resume never resets perks/timers, skips an intro or repeats a reward; browser without storage/locks may play session-only with truthful copy.
- Existing v1 Festival checkpoint survives migration; modes/results and online retry identity remain immutable.
- End of Village routes correctly for Festival/Endless, including skipped/visited bonus.
- Board validators reject cross-edition, incorrect clocks/perks, impossible scores, and premature finishes; consent withdrawal clears pending telemetry.

## Tasks and ownership

### Task 1: modes, durable profiles and local results
Own `src/smf-tour/model.js`, `store.js`, `content.js`; new `supabase/functions/_shared/smf-rules.js`; focused tests. Implement `createTourRun(profile,mode,id,themeId)`, preserve `createFestival` wrapper. Export `stageForRun(run)`, `mainStageId(run)` and canonical `smfRuleStage(mode,index)` with `{id,timingId,durationMs,target,loop,crowdCount,crowdSpeed}`. Profile adds `audio`, `themePreference`, `boards`, `initials`, `playtestConsent`; active adds `mode`, `themeId`, `scoreStages`, `initialsDraft`, `inputType`, `submission`, `scoreSaved`, `needsIntro`, `remixPending`. Export `saveTourScore(profile,initials)` idempotent local results; results retain mode. Keep model UI-independent. Server receipt per stage: `{stageIndex,stageId,activeMs,pickups,closePasses,score,perks,sparks,passes}`.

- [ ] Meaningful regression tests first: modes, sixth/7th stage, perks, old-save migration, local scores and bonus return.
- [ ] Implement and report interface contracts, test output and caveats.

### Task 2: player menus and responsive presentation
Own `src/smf-tour/view.js`, `style.css`; create `ui.js` and `progression.js` if useful; focused view/layout tests. Root owns runtime entry and scene. Export pure HTML for title, wardrobe, settings, styles, rules, paused, summary/results, boards and confirmations. Preserve existing catalogue/bonus functions. Reuse neutral theme/progression/wardrobe components; theme-specific titles/perks, complete outfit choices and preview support, edition-correct achievement copy. Document action/element contract in report. Export `shellHTML()` and `updateTourHUD(root,{round,run,stage,paused,bonus,practice,config})` if helpful; root will wire it. Pause in persistent header; viewport-fit arena and fullscreen. Scores support mode tabs, three initials, explicit save/post/retry and leave confirmation. Consent UI default-off plus notice link; no claim collection enabled without backend configuration.

- [ ] Menu/state tests and viewport sizing rule checks.
- [ ] Implement accessible themed controls and report integration contract.

### Task 3: separate SMF services and dual Pages packaging
Own new server SMF validators/handlers/functions/migration; `src/smf-tour/online.js`, `telemetry.js`; `scripts/build-pages.mjs`, workflow/package build entries; service/deploy tests. Do not change root runtime/model/UI. Use separate `smf-run-ticket`, `smf-submit-score`, `smf-leaderboard`, `smf-playtest` functions and private storage. Contract includes `editionId:'smf',scoringVersion:'smf-v1'`; stage rules imported from Task1. Use existing submission state API and return same board row fields plus editionId. Export client/config adapters, optional telemetry controller. Inputs and size bounds strict; tickets bind mode/rules/build/run, TTL24h, idempotence and rate limits. Report backend deployment requirements without deploying until root review. Pages builds generic at root and SMF /smf/; production excludes all labs/local tracks. Identify configured credentials via CLI/auth status without printing secrets.

- [ ] Validator/database/client isolation tests and both package paths.
- [ ] Implement and report integration/deployment contract.

### Task 4: runtime integration and acceptance (root)
Own `src/smf-tour/entry.js`, `scene.js`, `lab.js`; wire mode selection/rules, full HUD, sounds/FX, wardrobe preview, themes, recovery, input labels, scores and consent. Main-stage content uses stageForRun; no secret invitations in Rush. Existing eight perks/candy/Bass Head and musical clocks retained.

- [ ] Browser: all modes, pause/settings/fullscreen on desktop and phone, wardrobe/theme/audio persistence, Festival/Endless bonus return, local initials board/reload, online error/retry and consent.
- [x] Whole suite, generic/SMF builds, independent review and fixes.

### Task 5: release
- [x] Update roadmap/handoff with exact parity and test evidence.
- [x] Deploy backend first; verify live safely.
- [ ] Commit/push, PR, check CI, merge and wait for Pages.
- [ ] Public generic and /smf/ smoke checks; report exact links and limitations.

## Execution ledger

- Starting commit e840b20, branch codex/edition-split-plan, clean checkout. Owner explicitly authorized restoration and PR/merge/public test release.
- Ruling: preserve current separate tour model and reuse common UI pieces rather than replacing working bonus checkpoints with generic run internals; this limits save migration risk while recovering shared presentation.
- Ruling: publish SMF under /smf/ in the existing Pages site; keep original generic address intact.

- 2026-11-10: 549/549 tests, both edition builds, Pages build and `check:editions` passed. Backend migration `202611100001` and four SMF functions deployed; origins/rate secrets and GitHub variables configured. Three SMF boards and the generic board returned 200; nonexistent ticket and empty tracking returned the expected 400 errors. No production score or event was created.
- Browser evidence includes natural Rush completion, Festival/Villagio return, Endless stage 6 → 7 and perk swap/keep, reward and paused recovery, settings/theme/wardrobe persistence, local boards and fake-backend 503/retry. Existing AMP checkpoint remained paused. Portrait/landscape viewport checks passed; fullscreen automation fallback worked, but native fullscreen and physical-device/long-session acceptance remain open follow-up rather than public-test blockers.
- Two P2 review findings (navigation and ticket lifecycle) were fixed and confirmed resolved by the reviewer. [Validation](../smf-feature-parity-validation.md) records details. PR, CI, merge, Pages and public frontend checks remain pending.
