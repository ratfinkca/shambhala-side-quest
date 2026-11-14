# Arcade Welcome Implementation Plan

> **For agentic workers:** Use superpowers:subagent-driven-development or superpowers:executing-plans. Work only in assigned files; do not commit other workers' changes.

**Goal:** Deliver the approved arcade welcome as a playable local preview in both editions.

**Architecture:** Shared typography, help/demo and musical-welcome modules, integrated into each edition's existing menu lifecycle. Profile changes normalize old data without changing runs or score payloads.

**Tech Stack:** Vite, vanilla JavaScript/CSS, Phaser, Web Audio, Node test runner, ImageGen.

**Spec:** docs/superpowers/specs/2026-11-14-arcade-welcome-design.md

## Global Constraints

- Preserve existing profiles, recovered runs, choices, controls, opt-in tracking and edition isolation.
- Demo creates no run, progress, online ticket, score or telemetry.
- No backend/scoring changes. Fractal bonus and theme unlocks deferred.
- Reduced-motion, gesture-unlocked audio, phone portrait/landscape and keyboard access.

## Review Focus

- Old saves and missing/corrupt onboarding values must not reset appearance or recovery.
- Dismissed Character onboarding must not accidentally create or replace a run.
- Hidden pages, re-renders, mute and repeated demo opening must clean up animation/audio.
- Neon default must not duplicate theme IDs or change saved preferences.
- AMP art must leave delivery recipients and approach paths readable.

### Task 1: First-play integration and defaults (root)
- Files: src/themes.js, src/profile.js, src/smf-tour/store.js, src/game-entry.js, src/smf-tour/entry.js; new src/onboarding.js and tests.
- [x] Test new Neon defaults, saved preference preservation and dedicated first-play state.
- [x] Add independent character-confirmed marker; route first Start through Character with pending mode, confirm/cancel; never gate resume.
- [x] Wire shared demo, welcome and menu audio lifecycle after workers deliver modules.

### Task 2: Typography and visual help (agent)
- Files: shared pixel/menu CSS, new src/how-to-play.js/css; src/screens.js and src/smf-tour/ui.js; focused tests.
- Interface: export openHowToDemo({controls}) returning a cleanup callback; self-contained DOM modal with focus restoration, Replay and Close. Parent binds data-action="show-demo". The helper owns its Phaser/canvas animation lifecycle, not application profile/entry files.
- [x] Pixel fonts on secondary controls and readable illustrated essentials/expandable rules.
- [x] Isolated short sprite demo, reduced-motion treatment, lifecycle verification.

### Task 3: Music and arrival module (agent)
- Files: src/audio.js; new src/menu-music.js, src/arcade-welcome.js/css; focused tests.
- Interface: audio.syncMenu(elapsedMs), retaining existing APIs; openArcadeWelcome({onEnter}) returns cleanup, invokes onEnter only from entry/skip gesture. Parent decides when overlay appears and calls audio from gesture.
- [x] Original 16/32-bar menu arrangement with safe transport handoff, volumes/mute respected.
- [x] Short skippable animated arrival, static reduced-motion fallback, semantic controls.

### Task 4: AMP backstage illustration (agent)
- Files: src/amp-delivery-view.js and dedicated new assets/provenance, loading hook if required coordinated with root.
- [x] Inspect current scene and pixel reference venue, generate artwork with built-in ImageGen and save into repo.
- [x] Integrate rich pixel plate plus subtle steam/lights; preserve gameplay geometry, collision and recipient identification.
- [x] Validate art loading/disposal and phone readability.

### Task 5: Integration acceptance (root + independent review)
- [x] Full tests and both edition builds/asset isolation.
- [x] Browser: fresh first-play + selected mode, returning/resume, Help/demo replay/close, mute/volume/visibility, portrait/landscape and desktop.
- [x] Review changed code, fix blockers, provide local playable preview and screenshots. Do not publish.

### Task 6: Install help (added at user request during preview)
- Files: new src/install-app.js/css; title actions in src/theme-screens.js and src/smf-tour/view.js; root integration in both entries.
- Interface: createInstallHelp() returns open()/dispose(); retains beforeinstallprompt event; only invokes prompt from a button gesture.
- [x] Short device-specific instructions with iOS/Android/desktop switcher, installed-state handling, native prompt fallback and keyboard-accessible modal.
- [x] Verify manifest/PWA scope and install paths, test capability detection and dismissal/retry, browser check sheet at phone size.

## Preview acceptance (before release)

- `npm test`: **917 passed, 0 failed**.
- `npm run check:editions`: generic/SMF builds, asset isolation and invalid-edition rejection passed.
- Independent code review completed; fixed menu re-enable ordering and native install-prompt rejection handling, with regression coverage.
- Browser checks covered fresh Character confirmation/cancellation with the chosen mode retained, existing-run recovery to paused, help/demo replay/close and the bump lesson, title install guidance, portrait and landscape menu layouts, and the new AMP art inside fullscreen Festival gameplay at phone size. No browser warnings/errors observed in the checked tabs.
- Audio scheduling, mute/volume and hidden-page lifecycle have automated coverage. Subjective listening and physical-device installation/performance remain playtest checks; neither is claimed from desktop browser inspection.
- Both local preview servers disable online scoring and playtest sharing. No backend changes are required. The user subsequently approved PR, merge and deployment after release checks; those results are tracked separately from this preview acceptance.
- Local previews: SMF `http://127.0.0.1:5197/`, generic `http://127.0.0.1:5196/`. These addresses are on the development Mac.

## Release preparation

- User approved PR, merge and deployment after checks, with physical iPhone installation testing to follow the live release.
- Final review also caught the generic title's sound toggle failing to restart menu scheduling after unmute. Added a real-handler regression, observed it fail, then fixed the missing refresh.
- Final full suite: **918 passed, 0 failed**. Both edition checks and the combined GitHub Pages build passed. Verified generated manifests launch within the generic root and SMF subdirectory, with distinct identities and standalone display.
- Independent release review cleared the unmute fix with no remaining blockers. No backend migration or function deployment is required.
