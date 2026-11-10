# Four bonus venue preview validation — 2026-11-10

Local branch: `codex/edition-split-plan`. This is a DEV-only SMF rehearsal, not a public release or a complete festival journey.

## Delivered

Open `http://127.0.0.1:5191/?rehearsal&bonus=rabbit-hole` and use the selector for all four rooms. Main venue rehearsal and AMP delivery rehearsal link to it. Only DEV + SMF + an explicit supported bonus route may load it.

| Room | First-preview activity | Clock | Temporary result |
|---|---|---|---|
| Rabbit Hole / Hoola b2b Lioness | Six sequential lost party trinkets | 120 BPM, 32 bars, 64s | Rabbit ears; six room lamps brighten |
| Secret Garden / Footprints | Three seeds, carried one at a time back to the bed | 100 BPM, 24 bars, 57.6s | Glow blossom; three full blooms |
| Ikigai Mori / Soup | Clean-pass five distinct dancers | 124 BPM, 32 bars, 61.935s | Lantern totem; five lanterns lit |
| Villagio / Subvert | Visit both greens and the chicken slide | 110 BPM, 24 bars, 52.364s | Exploration completion only |

Three replaceable ImageGen plates use existing venue illustrations as style references. They are original interpretations, not confirmed 2026 architecture. Villagio is a procedural miniature club with walkable greens, a curved tube and animated chickens. There is no putting, player ride or squawk audio yet.

Each room has its own original synthesized arrangement: garage breaks, soft dub/downtempo, percussive house and funky breaks respectively. Eight-bar chapters, four-bar call/response, pre-drop space and phrase-end tail bounds use the existing instrument rack. The DJ labels do not imply any artist recording is bundled.

## Automated and review evidence

- 448 tests passed, including 18 new activity, routing and music tests. Activity/music tests were run failing before implementation.
- `npm run build` and `npm run check:editions` passed. The existing large Phaser chunk warning remains.
- Generic geometry/rules/score/recovery compatibility tests remain unchanged and pass. Normal SMF catalogue concealment is unchanged.
- Pure activity checks cover sequential/one-time pickup, one held seed, empty-bed no-op, distinct dancer IDs, same-frame collision precedence, pause/ready/timeout/reset gates, and Villagio completing without a cosmetic.
- Objective and crowd positions stay within the play area across each full clock. Independent Ikigai approach sampling found collision-free clean-pass approaches for every dancer throughout the visit.
- Independent review found and resolved planting feedback at the old pickup position, final-lamp redraw after completion, a final Garden flower frozen at minimum growth, and tiny greeted-dancer markings. Greeted dancers now have a steady gold foot-ring as well as a wristband.
- Final frozen frames render once when their state changes; paused/result scenery does not redraw continuously. Successful results keep the venue unobstructed and show the souvenir on the player, in the HUD and status message.

## Native browser acceptance

The in-app browser initially displayed the room and a pickup, but later control commands repeatedly timed out. Native Chrome was used for the complete acceptance pass; it responded normally. This is not a claim that the in-app browser issue was fixed.

- At 390×844, completed all six Rabbit Hole pickups and received the rabbit ears. Pause froze time/progress; resume continued; later fresh visits reset the trail and souvenir.
- At 390×844, completed all three Garden pickup/return/plant trips. Final acceptance showed all three flowers fully grown and the player's blossom, with no result panel covering the venue.
- On desktop, completed five distinct Ikigai passes and saw all five lanterns lit, greeted foot-rings and the lantern totem. Repeated after the final presentation changes. Result inspected and captured at 390×844 and 320×740.
- At 390×844, visited both Villagio greens and the tube exit; result explicitly says exploration complete with putting/prize later. Retested the curved tube and unobstructed result.
- Let an idle Garden visit expire: 0/3, 0 seconds, no reward, fresh-start action available.
- Effects volume at zero disabled the test chime; master mute remained effective through Reset mix; unmuting allowed the test-chime UI to report playback. These are control checks, not physical listening acceptance.
- Selector changes repeatedly reset the visit while preserving exactly one canvas. No horizontal overflow at 390px or 320px. Main venues → bonus link and return navigation worked; returning loaded a fresh Rabbit Hole visit.
- No browser warnings or errors were captured in the final Chrome pass. Viewport override reset; a ready Rabbit Hole rehearsal was left open.

Phone-size screenshots are stored under `/Users/mother/.codex/visualizations/2026/10/13/01a1368f-7ce7-7722-a6bd-8509627b4e12/`:

- `rabbit-hole-phone.png`, `rabbit-hole-complete-phone.png`
- `secret-garden-phone.png`, `secret-garden-complete-phone.png`
- `ikigai-mori-complete-phone.png`
- `villagio-complete-phone.png`

## Limits and next work

Physical-phone thumb comfort/performance, device listening and the owner's exact venue identity review remain open. Reduced-motion branches were inspected; OS-level reduced-motion acceptance was not exercised in this pass. Preview goals and cosmetic sketches are playtest choices, not permanent award rules. Preserve the original-three first-completed-visit souvenir baseline when integrating.

No profile/recovery writes, persistent cosmetic grants, XP, telemetry, online posting, backend deployment or public publishing. Future work: settle Villagio putting controls/success/reward; then implement the six-stage tour and optional discovery, parked-run return/recovery and atomic cosmetic receipts.
