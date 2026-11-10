# AMP Backstage Delivery Preview Implementation Plan

> **For agentic workers:** Use native execution with focused parallel help and one independent final review. Track completion below.

**Goal:** Build a disposable, playable AMP backstage sandwich-delivery rehearsal.

**Architecture:** A DEV-only SMF entry reuses the game scene, AMP synthesized music and rehearsal mixer. A pure delivery state machine consumes a batch of identified physical encounters; a separate view draws the vendor, recognizable recipients, carried sandwich and temporary prize. No profile, recovery or online service is imported by the preview.

**Tech Stack:** Existing JavaScript, Phaser Canvas, Vite and Node tests; no new packages.

**Spec:** [Secret/backstage design](../specs/2026-11-10-secret-backstage-expansion-design.md).

## Global constraints

- One sandwich at a time; only the correct clean pass advances deliveries.
- Wrong passes consume the sandwich and make that dancer happy; physical bumps drop it even with a shield.
- Completed deliveries remain banked; retain the current recipient after a loss.
- First preview: three deliveries, three distinct recipients, the existing 32-bar AMP round (54.857 seconds), restart available. Timing and density remain playtest values.
- Matching costume portrait and description; no overhead target icons, colour-only targets or persistent dancer labels.
- Preview reward only: no real unlocks, storage, telemetry, leaderboard, main-run bonuses or public secret disclosure.
- User approved implementation; use the current feature checkout. No publishing in this task.

## Review focus

1. A simultaneous bump and pass must drop, independent of crowd iteration order.
2. An encounter begun before vendor pickup must not deliver the new sandwich.
3. Lingering at the vendor, repeated events and multiple passes cannot duplicate a sandwich, delivery or reward.
4. Pause freezes all challenge state; reset clears it; timeout cannot award the prize.
5. Phone targets, carried state and reward feedback remain legible; generic and production routes remain unchanged.

## Task 1: Delivery rules

Files: `src/amp-delivery.js`, `tests/amp-delivery.test.mjs`.

Interface: `createDelivery({recipientIds,goal=3})` returns serializable mutable state. `stepDelivery(state,{atVendor,encounters})` returns one event or null. Encounter records include `id,bumped,closePass,active`; IDs remain stable for the visit. State exposes `carrying,delivered,goal,recipientId,complete`; helper fields prevent stale encounters and repeat vendor pickups.

- [x] Write and run failing tests for correct/wrong/bump/empty behavior, banked progress, fixed outstanding recipient, simultaneous events, stale encounters, vendor re-entry, completion idempotence and fresh reset.
- [x] Implement the pure state machine, with physical contact taking priority and pickup occurring only on a new vendor approach.
- [x] Run focused tests and inspect the diff.

## Task 2: Recognizable backstage view

Files: `src/amp-delivery-view.js`.

Interface: exports `AMP_DELIVERY_STAGE`, `DELIVERY_RECIPIENTS` (`id,index,name,costume,color`), `VENDOR_POINT`, `createAMPBackstageView(scene,stage)` for the existing StageRenderer, and `createDeliveryView(scene)` returning `update(state,elapsed,reducedMotion)`, `feedback(event)`, `destroy()`. Crowd IDs are `dancer-0` etc. Vendor pickup point is inside the playable floor. Root handles HTML order/progress UI; this module handles canvas art only.

- [x] Build a compact afterparty with a warm grilled-cheese cart, S2 booth, string lights and animated LED accents; retain clear pass lanes.
- [x] Add recognizable recipient accessories and matching costume portraits, carried sandwich, happy wrong recipient, dropped sandwich and cheese-totem celebration.
- [x] Verify phone-size readability and reduced-motion treatment in the integrated preview.

## Task 3: Scene and entry integration

Files: `src/Crowd.js`, `src/GameScene.js`, `src/amp-delivery-entry.js`, `src/amp-delivery.css`, `src/editions/registry.js`, `src/main.js`, focused routing/encounter tests.

- [x] Test DEV-only SMF routing at `?rehearsal&backstage=amp` and physical encounter batches including shielded contact.
- [x] Return stable encounter records from Crowd and add an optional per-frame scene callback without changing normal scoring or near-pass thresholds.
- [x] Build isolated practice entry with start/restart, pause, music/effects controls, instructions, matching order portrait, delivery count and honest timeout/success states.
- [x] Disable ordinary collectibles and score presentation inside this challenge; end on third delivery or round timeout. Keep the preview prize temporary.
- [x] Add a DEV venue-rehearsal link for discovery by the developer without exposing normal hidden catalogue tiles.
- [x] Verify reset/pause/end cleanup, target outcomes and no service/storage use.

## Task 4: Acceptance and handoff

- [x] Run full tests, build and both edition isolation checks; review independently and fix material findings.
- [x] Play the actual rendered preview: vendor pickup, wrong delivery, bump loss, correct handoff, banked progress, success/reset and timeout.
- [x] Capture desktop and phone screenshots, check console and reduced-motion behavior, leave rehearsal running.
- [x] Update roadmap/handoff/spec with preview status and remaining persistent bonus integration; report actual validation and limitations. No release.

## Execution record — 2026-11-10

Implemented on the existing feature checkout. `src/amp-delivery-practice.js` separates the disposable visit lifecycle from DOM/Phaser; its tests cover ready/pause/end/reset and no persistence/network. Native integration used focused parallel help for pure delivery rules, canvas artwork and physical encounter batches, followed by independent review.

Verification: 430 tests pass; production build and both edition isolation checks pass (existing Phaser chunk-size warning). Live browser play covered all three correct handoffs and the preview reward, wrong handoff, physical drop with already-banked progress, replacement pickup, pause/resume/reset, timeout without a prize, master mute/FX test and venue navigation. Arrow-key movement leaves page scroll unchanged. At 390×844, pickup, matching portrait/target, controls and layout were checked; no horizontal overflow or browser errors. The viewport override was reset and the local preview left ready at `http://127.0.0.1:5191/?rehearsal&backstage=amp`.

Review corrections: stop the arrangement before scheduling the final chime; reuse the established arrow-key scroll guard and restore arena focus on resume. Pause notice moved above the floor so the player can inspect their route. Stage name remains AMP backstage; Cheese courier labels the activity only.

Physical-phone touch comfort, actual listening and three-delivery pacing remain owner playtest items. This is a local rehearsal, not a shipped bonus-route integration or persistent reward implementation. No backend updates, production grants or publishing occurred.

### Owner playtest refinement — 2026-11-10

The owner requested a busier floor and identifying recipients by costume instead of floating icons. Added four ordinary dancers (ten total), removed overhead target badges and matching abstract symbols, and kept costume portraits/descriptions on the order card and cart ticket. Golden crown, mint headphones and purple wizard hat provide distinct silhouettes. Delivery mechanics, three-delivery goal, crowd speed and phrase duration remain as before.

Geometry sampled across the full round keeps all dancers within the floor, at least168px from the cart center and117px from the spawn; an independent sampled approach audit retained clean routes to all three recipients. This is still a playtest balance choice rather than a frozen difficulty setting.

Refinement validation: all 430 tests and production build pass. Live desktop play confirmed vendor pickup and a correct handoff with the larger crowd; 390×844 layout/pickup checks passed with no horizontal overflow or browser errors. Floating target markers are absent; familiar brief smooth-pass feedback remains. Real touch difficulty remains a playtest judgment.
