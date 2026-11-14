# Rave names and challenge boards Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans. Track steps below.

**Goal:** Add editable rave names and local character presets, challenge-separated scores, and two bounded drop-frequency perks.

**Architecture:** Shared pure rule/name modules define client/server contracts. Extend edition-local saves without losing legacy runs; use a new scoring season for challenge-aware records and retain old response shapes. Independent backend, character-model and gameplay changes are integrated through the existing entry/view layers.

**Tech Stack:** JavaScript, Phaser, Vite, node:test, Supabase SQL/Edge Functions.

**Spec:** `docs/superpowers/specs/2026-11-13-rave-names-challenges-design.md`

## Global Constraints
- Preserve uncommitted invitation changes and old saves/boards.
- No deployment, DB writes, commits or pushing in this preview.
- Four local slots; 2–16 character names; shared progress; names excluded from analytics.
- Challenge IDs: `first-timer`, `been-around`, `seasoned-vet`; default `been-around`.
- New seasons `arcade-v3`, `smf-v3`; legacy challenges use Been-around.
- Eight-second post-Flow gap, based on actual effect expiry including boosts.

## Review Focus
- Legacy clients must still receive strict old response shapes; legacy recovery must retain rules.
- A rejected name can be corrected without changing an uncertain in-flight score payload.
- Malformed/locked slot data cannot grant rewards or erase progress.
- Restarting after a pickup must not reroll or duplicate extra drops.
- Phone first-play/score screens must fit longer names and three challenge choices.

## Tasks
- [x] 1. Add shared name validation and local character slot model, with invalid input, normalization, ownership and persistence tests.
- [x] 2. Add shared challenge rules, v3 backend ticket/submission/board contracts and migration; exercise legacy and challenge-partitioned score DB/HTTP tests.
- [x] 3. Add difficulty-aware crowds/friendship and new perk scheduling; test actual expiry gaps, max boosts, late windows and recovery.
- [x] 4. Integrate both editions' naming gates, local slot controls, challenge selection, score entry/boards and strict recovery fields.
- [x] 5. Run full tests, both builds, independent review, disposable phone-size UI checks; record validation and remaining physical-device feedback.

## Working rulings / progress
- Existing branch and dirty invitation work are the correct workspace; do not create a divergent worktree or overwrite that pass.
- Local presets are saved characters sharing progression, rather than independent accounts/progression trees.
- Public name changes affect future submissions only; old anonymous entries cannot be retroactively claimed.

## Validation — local preview complete
- Full `npm test`: 977 tests passed, zero failed/skipped. An additional legacy recovery-clock regression was then added; its focused file passed 4/4. No application code changed after the full suite.
- `npm run check:editions`: generic and SMF builds, asset allowlists and static references passed; invalid editions rejected. `git diff --check` passed.
- Independent backend, gameplay/recovery and identity/UI reviews completed. Fixed canonical Endless target rounding, Villagio's independent bonus clock, editable names after a definitive posting rejection, and the generic Replay onboarding gate. Regression coverage includes immutable network retries and legacy clocks.
- Disposable SMF preview at port 5200: blank and disallowed names rejected; two named character slots saved and restored; a First-timer run retained its 17-spark target and paused 65-second checkpoint after reload; local score saved under Moon Dancer, appeared only on First-timer's board, and old season selection remained accessible.
- Disposable generic preview at port 5201: first-play naming gate blocked an empty name, accepted River Runner, and started Seasoned-vet with the 26-spark target and six friendship passes.
- Browser review at 390×844 and 844×390; no observed warning/error console entries. Character and scoreboard screenshots captured. These checks are responsive browser checks, not physical-phone playtest acceptance.
- Analytics and online posting were disabled in both disposable previews. No production data, migrations, functions, deployment, commit or PR was changed.

## Release follow-up
- Deploy `202611130003_names_challenges.sql` and affected score/arcade/playtest functions first; verify legacy/v3 behavior without posting production test scores. Only then publish the frontend through the normal reviewed PR flow.
- Collect physical-phone feedback on character-slot layout, challenge balance and the two drop-frequency perks.
- Prism Party remains a concept awaiting selection; no Fractal bonus gameplay was added in this pass.
