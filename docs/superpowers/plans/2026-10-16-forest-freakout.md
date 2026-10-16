# Forest Freakout Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Ship a local Forest Freakout preview with reusable, saved festival styles and stable per-run Surprise selection.
**Architecture:** Pure theme registry/selection logic feeds the existing profile and run models. A document theme attribute, semantic CSS tokens and theme artwork drive existing DOM screens; Phaser gameplay stays intact.
**Tech Stack:** Existing Phaser 3.90, Vite, ES modules, Node tests, local raster assets and licensed fonts.
**Spec:** ../specs/2026-10-16-festival-themes-design.md

## Global Constraints
- Preserve uncommitted Bass Head changes and all scoring/movement rules.
- Extend the current app; no new framework or backend.
- Only Forest Freakout is complete/selectable. Upcoming styles are labelled honestly. Surprise samples completed themes only.
- Store theme preference additively in version-1 profile; preserve existing saves.
- Resolve style once per new run, not on stage transitions or renders.

## Review Focus
- Old and malformed saves retain scores/audio/outfit while theme defaults safely (task 1).
- Denied storage keeps the chosen preference in memory and visibly reports session-only saving (tasks 1/3).
- Replay and stage transitions do not accidentally reroll mid-run (tasks 1/3).
- Portrait and short landscape menus keep primary controls accessible (task 4).
- Missing image/font assets retain usable text and buttons (tasks 2/4).

### Task 1: Theme state and persistence
Files: src/themes.js, src/profile.js, src/storage.js, src/run.js, tests/themes.test.mjs.
Interfaces: THEME_DEFAULT, THEMES; normalizeThemePreference(value); resolveTheme(preference,rng=Math.random,registry=THEMES); createRun(mode,id,themeId=THEME_DEFAULT); storage.saveTheme(value).
- [x] Write tests for legacy saves, invalid/unavailable IDs, Surprise complete-only sampling, invalid save rejection, blocked storage, and stable run theme through stage upgrade.
- [x] Run tests and observe intended missing functionality.
- [x] Add registry with three theme records (only forest ready), preference normalization and selection; integrate additive persistence and run theme field.
- [x] Run full npm test.

### Task 2: Original art and typography
Files: public/themes/forest-freakout/*, public/fonts/*, asset license notes.
- [x] Generate a title poster art asset and four independent perk illustrations from the selected reference. Use dark forest surfaces, coral/yellow/violet print and readable silhouettes. Keep UI controls live HTML.
- [x] Obtain locally served licensed display/body fonts and preserve licenses.
- [x] Optimize art for web use and inspect each asset; use available real icon library or text navigation.

### Task 3: Screens and theme presentation
Files: src/theme-view.js, src/theme-screens.js, src/screens.js, src/main.js, src/themes.css, index.html.
Interfaces: applyTheme(id) updates document theme attributes and CSS asset properties; renderThemeScreen(profile) produces available/upcoming styles and Surprise selection; themed title/perk helpers use registry art paths.
- [x] Add STYLE/BACK transition tests; implement a title-only Festival Style screen.
- [x] Connect immediate fixed-theme menu preview, saved preference/session-only feedback, and once-per-new-run resolution in newRun().
- [x] Implement title poster with Festival Run primary, Quick Rush secondary and accessible navigation; four illustrated perk cards and themed supporting screens.
- [x] Restyle compact HUD without changing arena coordinates, stage palettes or Bass Head control semantics. Keep reduced motion and keyboard focus.
- [x] Run full npm test and npm run build.

### Task 4: Browser and design QA
Files: design-qa.md, README.md, docs/PROJECT-HANDOFF.md.
- [x] Inspect desktop title/style/reload, both modes, pause/settings, all four perks, results/replay; inspect phone title/perks and landscape title/Quick Rush. Check console. Source-review missing-asset fallback; record remaining device/fault-injection coverage in design-qa.md.
- [x] Compare title/HUD/perks with the exact selected concept, record responsive adaptations, fix P0/P1/P2 discrepancies and recapture.
- [x] Request fresh code review; resolve material findings and run final test/build/diff checks.
- [x] Update handoff with actual scope and local-only release state. Keep preview available; do not deploy.

## Execution ledger
- Ruling: user explicitly requested implementation in this session after approving the spec; execute natively with asset helpers and one final reviewer.
- Ruling: use a feature branch in the existing checkout to preserve the uncommitted, user-approved Bass Head work rather than copying or losing it in a clean worktree.
