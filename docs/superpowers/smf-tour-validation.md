# SMF Festival tour integration — local validation

Date: 2026-11-10. **Implemented locally; integrated desktop/phone-size preview checks are complete.** This record does not claim a merge, backend rollout, deployment or public smoke check.

## Scope and entry points

- Normal SMF tour: [http://127.0.0.1:5191/](http://127.0.0.1:5191/), with device-local progression under `sidequest.smf.profile.v1`.
- DEV-only integration lab: [http://127.0.0.1:5191/?rehearsal&tour](http://127.0.0.1:5191/?rehearsal&tour), isolated under `sidequest.smf.tour-lab.v1`. Shortcuts exercise transitions; they are not evidence of normal-play balance.
- Generic public gameplay/profile/recovery/online services remain separate. SMF posting and playtest uploads remain disabled. No new backend or dependency is required.

The route is Living Room → Fractal Forest → Grove → AMP → Pagoda → Village. Five sealed invitations appear after 18 active seconds and commit discovery only on qualifying parent clears. Four distinct perks allow keep/add/swap. Detours park the main summary and have no effect on main points, XP, perks or charge; Villagio after the final clear returns to earned results.

Rabbit Ears, Glow Blossom and Lantern Totem require completing their visit or finishing its activity early. AMP requires three correct deliveries for the Cheese Totem; Villagio requires both cups within eight shots for the Golden Chicken Totem. Rewards, discoveries and the parent/child checkpoint save atomically. Explore revisits discovered bonuses; reloading restores active play paused, including held items and a rolling putt.

## Automated evidence

Latest completed baseline:

| Check | Observed result |
|---|---|
| `npm test` | **516 tests passed; 0 failed** |
| Focused edition/boot/assets/storage/rehearsal-routing suite | **29 passed**, including temporary localhost Vite checks |
| `npm run check:editions` | Generic and SMF production builds passed; invalid edition rejected |
| Build ownership | Generic excludes all ten SMF venue illustrations and tour gameplay; SMF includes the ten illustrations and tour entry |
| Development isolation | Both production builds exclude rehearsal entry modules and tour-lab shortcut controls |
| `git diff --check` | Passed at this verification point |

Tests cover discovery qualification/failure, skipped offers and revisits, four-slot perk replacement, reward replay, original-three completion versus challenge wins, final Village return, main-score isolation, validated atomic saves, corrupt/oversized data, storage failure, activity recovery and generic score/recovery compatibility. These checks do not establish physical-device performance or human listening quality.

## Native browser evidence

Chrome, desktop and 390 × 844 viewport, using the isolated tour lab unless noted. The normal root URL was finally opened with a fresh, untouched SMF profile (0 XP, no discoveries or souvenirs); no lab shortcuts appear there.

| Flow | Observation / evidence |
|---|---|
| Main route | All six main stages opened in the authored order. Qualifying clears used visible lab shortcuts; this validates transitions, not balance or normal-play completion rates. |
| Natural invitation | Living Room invitation was visible on the side lane after active time elapsed. A real click-to-move collected it, with 3 sparks / 45 points. Failing the 23-spark target left all five map entries concealed. The exact 18-second boundary is also covered by a scene test. |
| Parent return | All five parent offers opened their bonus. Returning preserved the pending main summary/perk choice and score. Leaving Secret Garden early granted no souvenir. Skip behavior is covered by model tests. |
| Original-three souvenirs | Rabbit Hole retained 1 collected trinket and 52 seconds through reload; completing the remaining musical phrase granted Rabbit Ears. A later Secret Garden Explore visit completed its phrase with no planted seeds and granted Glow Blossom. Ikigai's early completion handoff used the lab shortcut; distinct-pass rules are automated. |
| AMP | Correct room/costume order rendered. A real vendor pickup left a held sandwich; reload restored it paused with the same 43 seconds. Reward handoff was lab-assisted; correct/wrong passes, bumps, vendor re-entry and win criteria have controller/scene tests. |
| Villagio | Real drag shots sank both holes in 2 shots. Reload between greens preserved 1/2 holes and 1/8 shots; a second reload while the second shot was rolling preserved 2/8 shots, then resumed to a real win. Golden Chicken awarded once. |
| Final results | Village completed before Villagio; returning after the actual putting win showed 6/6 completed results, no seventh stage or perk. Main score stayed unchanged. Save/return reached title. |
| Wardrobe / Explore | Ownership survived reload. Selecting Golden Chicken, reloading and reopening wardrobe retained Wearing it. The collection reached 5/5 in lab saves. Secret Garden Explore returned to the map. Lab profile was subsequently reset for the natural invitation failure check; normal SMF saves were never used for test awards. |
| Four perks | Four distinct perks reached Pagoda. Keep perks successfully advanced to Village with all four retained. Swap constraints are automated. |
| Storage ownership | A second tab displayed the competing-tab notice and disabled Resume. Closing it left the owning visit intact. Storage-denial behavior is automated; it was not induced in the user's browser. |
| Phone UI / errors | Title, gameplay, offers, delivery order, putting, results and wardrobe inspected at phone size. Final normal-page console had no warnings/errors. Physical-touch comfort and sustained phone performance remain unobserved. |

Acceptance found and fixed an AMP-only missing optional `setProgress` callback, a saved-bonus title/HUD startup dereference, four-perk Keep passing an inappropriate replacement ID, result wording for failed repeat visits, and the integrated Bass Head button's missing shared styling. Actual-scene tests now load/paint/capture/restore/return all five activities and reproduce the AMP failure without its fix. Review also caught live reduced-motion changes during putting; that regression is tested.

Music/effects sliders use the existing separate buses. Original music and activity effects remain wired; physical listening quality and all OS hide/audio-interruption scenarios are not established by these desktop checks. Resume buttons and reload-paused behavior were exercised directly.

Screenshots (local evidence):

- [Phone title](/Users/mother/.codex/visualizations/2026/10/13/01a1368f-7ce7-7722-a6bd-8509627b4e12/smf-tour-title-phone.png)
- [Natural invitation and on-field Bass Head](/Users/mother/.codex/visualizations/2026/10/13/01a1368f-7ce7-7722-a6bd-8509627b4e12/smf-tour-invitation-phone.png)
- [Earned souvenir wardrobe in the isolated lab](/Users/mother/.codex/visualizations/2026/10/13/01a1368f-7ce7-7722-a6bd-8509627b4e12/smf-tour-souvenirs.png)

## Remaining acceptance and next work

- Native preview checks and independent review are complete. Owner acceptance and physical-phone checks remain open.
- Owner playtests on physical phones: invitation visibility, delivery/putting difficulty, four-perk choices, full-tour pacing, sustained audio/performance and interruptions.
- Refine transitions, instruction clarity, souvenir presentation and atmosphere using those observations.
- SMF Endless, edition-specific score validation/boards and a separate hosted release remain later roadmap work. Deploy needed backend changes before enabling any future online connection.
- Permanent rewards here mean this browser's local storage. Cloud sync, offline installation, recorded-track distribution and a playable chicken slide are not part of this integration.

[Implementation plan](plans/2026-11-10-smf-tour-integration.md) · [current handoff](../PROJECT-HANDOFF.md) · [edition roadmap](../EDITION-ROADMAP.md)
