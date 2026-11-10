# SMF Festival and optional bonus visits

> **For agentic workers:** Execute with parallel workers for the pure tour model, storage and activity recovery; integrate and review the running UI together.

**Goal:** Connect the six main venues and five optional discoveries, with device-local permanent souvenirs and paused recovery.

**Status (2026-11-10):** implemented locally; 516 automated tests and both edition checks pass. Integrated desktop/phone-size preview checks are complete. [Validation record](../smf-tour-validation.md). No deployment requested or claimed.

**Architecture:** A dedicated SMF runtime reuses the accepted venue art, GameScene, music and activity controllers. One atomic SMF profile contains progress, discoveries, owned souvenirs and a single main run with at most one parked bonus visit. Generic gameplay and services stay separate.

**Tech Stack:** Existing Vite, Phaser and native browser storage/locks; no new dependencies or backend.

**Spec:** `docs/superpowers/specs/2026-11-06-smf-route-rules-design.md` and `docs/superpowers/specs/2026-11-10-secret-backstage-expansion-design.md`.

## Global constraints

- Route: Living Room, Fractal Forest, Grove, AMP, Pagoda, Village.
- Invitations appear after 18 active seconds; only qualifying parent clears commit discovery.
- Four distinct perks, with keep/swap at capacity; XP and rewards committed once.
- Original three souvenirs: complete the phrase-long visit or finish its activity early. Leaving early does not count. Activity thresholds are optional extras, not new reward gates.
- AMP: three correct deliveries. Villagio: two holes within eight shots. No consolation unlock.
- Detours add no main score, XP, charge or perks. Final Village returns to earned results.
- Locked titles/art/accessibility text stay concealed. Discovered places can be revisited in Explore.
- Permanent means saved in this browser; online SMF posting and cloud saves remain off.

## Review focus

- Reload while carrying a sandwich or rolling a putt: exact activity restores paused without replay.
- Final-stage detour: results survive; no seventh stage or extra perk.
- Storage denial or a second tab: never claim an unsaved cosmetic is permanent; avoid competing writers.
- Skip or fail a visit: preserve main score and the pending perk decision.
- Build isolation: production SMF includes promoted gameplay; generic excludes it, and both exclude rehearsal tools.

## Tasks

- [x] Pure model (`src/smf-tour/model.js`, model tests): route, discovery, XP, four-perk choice, bonus rewards/return, Explore.
- [x] Atomic store (`src/smf-tour/store.js`, store tests): bounded validated reads, safe corrupt checkpoint handling, storage failure.
- [x] Activity recovery (three controller modules, recovery tests): capture/restore all five activities, paused continuation.
- [x] Runtime (`src/smf-tour/entry.js`, scene/view/cosmetic helpers, CSS): one game, invitations, menus, wardrobe, recovery, sound and accessibility.
- [x] Boot/edition manifest and build guards: promote SMF tour while retaining generic isolation.
- [x] Native browser acceptance at phone size: parent discovery, bonus return, reload, wardrobe and final results; isolated tour lab for repeatable transition checks.
- [x] Full automated suite (516 tests), both edition builds and development-tool/asset isolation checks.
- [x] Update current handoff, roadmaps and validation record, preserving earlier preview history.
- [x] Final independent review and resolution of any acceptance defects.
- [x] Local commit after preview verification. No deployment requested.
