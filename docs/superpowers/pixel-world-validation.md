# Pixel world and Character release validation — 2026-11-13

Branch: `codex/pixel-animation-lab`. Owner approved the Pixel Afterparty direction,
dance-step movement and playful sprinting, then authorized the full visual pass.
The owner authorized PR, merge and publication on 2026-11-13 after the local
preview. Final pre-PR validation passed all **894 tests** and both edition builds,
asset checks and invalid-edition rejection. CI, merge and deployment are tracked
separately in the release PR. This change requires no
backend schema/functions, scoring season, game speeds or reward requirements.

## Delivered

- Shared animated pixel player/NPC actors with all existing wardrobe IDs,
  layered hats/totems/flourishes and cached costume textures.
- Spark/Flow/candy, friendship/Bass Head effects, permanent souvenirs and bonus
  items. AMP delivery recipients remain uniquely identifiable by costume;
  bystanders cannot reuse the three recipient hats.
- Six main SMF pixel plates; Rabbit Hole, Secret Garden, Ikigai Mori and Villagio
  pixel plates; native pixel AMP backstage and generic scenery/hazards.
- Three SMF pixel title illustrations, Silkscreen display typography and shared
  square-edged menu/HUD treatment. The follow-up covers title/modes, wardrobe,
  settings, perks, pause, stage summaries and scores. Existing themes and
  readable body text remain, with full-width phone selects and distinct focus.
- Player and item anchors preserve the old physics points. Lighting/mapping
  source coordinates and saved cosmetic identities remain in place.

## Animation audit requested during implementation

All eight actor rows were inspected. The generated toward/away movement rows
repeated the same foot's lift; rearranging columns could not produce a complete
alternating gait. Explicit clip metadata reconstructs the opposite half-cycle
by mirroring reviewed body poses while held objects keep their own facing.
Automatic playback also ran too quickly (roughly 14/21 fps in the old lab).
Cadence now follows bounded walk/run timing around 8/12 fps with continuous phase.

The lab has normal/half/quarter playback and frame stepping. Browser frame 3
versus frame 6 inspection confirmed opposite feet, and the slow loop was checked.
The follow-up rebuilt sideways movement with separately generated body parts
and authored joint/foot trajectories. Near/far legs alternate exactly half a
cycle apart; walk retains contact and the run includes flight. The source rows
3/6 are replaced at load time; a neutral side-rest frame is appended at48.
Hats and held props follow the new head/hand anchors. A visible-footwear mask
prevents lifted or shaded sneakers from becoming outfit-coloured.

The inspector now uses the exact production frames and recoloring, including a
manual left-facing switch, rather than the historical costume study sheet.
Both side directions, opposite contacts, lifted shoes and rest were inspected.

Also fixed rejected image-decode caching, paused recovery retaining a previous
sprint pose, floating cat/headphone layers, recolored shoes, and bonus props
reading the outer physics node instead of the animated avatar.

## Validation

Attachment follow-up: measured cap openings and palm positions replace generic
offsets. Nine hats use directional fitted shapes; normal and earned totems share
a pole/grip layout. A held-arm side variant keeps the staff in the hand without
freezing the walk/run cycle. The no-save `?rehearsal&wardrobe-fit` inspector shows
production avatars in four directions at native and enlarged sizes. All nine
hats/totems plus lantern, cheese and Golden Chicken staffs were inspected there;
the attachment checkpoint passed **878 tests**.

Character follow-up: both editions replace the Wardrobe label with
Character and add four appearance-only starter looks, three faces, four hair
choices and six skin tones. Existing clothing/reward rules are retained. Old
profiles, local score outfits and recovered results normalize to a default
appearance. These cosmetic fields are not added to telemetry or online scores.

The live character stays beside scrolling controls on desktop/landscape, and
above them in phone portrait. Starter buttons use portraits from the same head
compositor. The animation inspector also uses these layers. Browser checks
covered all four hairstyles, multiple skin/face combinations, fitted hats and
held staffs, raised dance hands, four preview angles, preserved clothing on
preset change, generic gameplay and pause/resume. SMF portrait (390 × 844) and
landscape (844 × 390) menus were inspected without changing the owner's saved
rehearsal outfit. Physical-phone performance remains an owner playtest.

Current full-suite checkpoint: **894 passed, zero failures**. Both generic/SMF
production builds and edition-isolation checks pass. Independent review also
caught and fixed cold-start duplicate head baking, a headless loading failure
fallback, and the first Golden Chicken frame reading a pre-carry hand pose.
After the final eye-placement adjustment, **21 focused character/head/atlas
checks** and both edition builds were rerun successfully. A fresh phone preview
showed the final portraits and captured no browser warning/error messages.

- Full suite after sideways/menu follow-up: **858 passed, zero failures** (`npm test`).
- Earlier full-world recovery reset wiring: **58 focused actor/atlas/animation/items/
  scenery/main-scene/timed-scene/SMF-scene tests passed**.
- `npm run check:editions`: generic and SMF builds, asset ownership/static
  references, exclusion of DEV labs and PNG masters, and invalid-edition rejection
  all passed. No SMF pixel plates/titles enter the generic output.
- `git diff --check`: clean.
- Independent review caught/fixed async-source retry and animated prop anchoring;
  lifecycle, movement and CSS input boundaries were reviewed.

Browser checks on the local running previews:

- All six main venues and four raster bonus venues rendered; AMP delivery scene,
  unique crown/headphones/wizard recipients and sandwich pickup/carry inspected.
- Layered wardrobe preview, generic Quick Rush, fullscreen SMF Quick Rush,
  pause/resume/recovery, protected stage-end gate, results/unsaved-leave flow and
  subsequent shuffled venue inspected.
- 390×844 portrait and 844×390 landscape viewports inspected. Tap/keyboard and
  floating-stick movement exercised; Bass Head activated on field. No claim of
  physical iPhone performance or simultaneous two-finger testing in this pass.
- No captured browser error/warning messages in checked main/practice/generic
  sessions. No production scores posted or telemetry consent enabled.
- [Original portrait evidence](artifacts/pixel-world-phone.jpg).
- Follow-up: 390×844 phone title, wardrobe, settings, theme cards; 844×390
  settings, pause and results. Generic title and Neon settings remain readable.
  Selected Neon card keyboard focus verified as a separate 3px external ring.
- Fresh SMF Quick Rush loaded the final49-frame actor atlas, exercised left/right
  movement and sprint, and paused correctly; fresh inspector and game sessions
  had no captured warning/error messages. An earlier HMR export mismatch during
  parallel implementation disappeared after the finished source reload.
- [Current phone menus](artifacts/pixel-menus-phone.jpg) and
  [side animation inspector](artifacts/pixel-side-animation.jpg).

## Local playtest

SMF game: `http://127.0.0.1:5194/?rehearsal&tour` (separate rehearsal saves).
Frame inspector: `http://127.0.0.1:5194/?rehearsal&pixels` (no saves).
Character fitting room: `http://127.0.0.1:5194/?rehearsal&wardrobe-fit` (no saves).
Generic: `http://127.0.0.1:5195/?rehearsal` (disposable profile).
Same-Wi-Fi phone: replace localhost with the Mac's current LAN address; it was
`192.168.14.143` at this preview's setup. Local server remains bound on port 5194.

## Remaining owner feedback / delivery work

Judge the revised gait and costume readability on a real phone. Fine venue
mapping/art details remain polish opportunities. Lossless WebP reduced
13 venue/title files from 29.4 MB to 24.2 MB, with identical decoded RGB/dimensions;
PNG masters remain for editing. Main+bonus venue plates alone are 17.3 MB and
still preload together, so first-load streaming remains worthwhile before wider
mobile distribution. See `src/pixel-art/assets/LOSSLESS-DELIVERY.json`.

The release must pass GitHub CI before merging. The Pages workflow builds both
editions on `main`; publication is verified separately by checking its completed
deployment and the public Character/menu assets. Local checks above do not by
themselves prove public deployment. Physical iPhone QA follows publication.
