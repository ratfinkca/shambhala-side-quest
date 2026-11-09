# SMF illustrated venue assets

## Fractal Forest art pilot

`fractal-forest-v1.jpg` is an original ImageGen illustration used only in the SMF development venue preview. It is not included in either production edition. The plate is decorative: collision, pickup positions, timing and scoring are unchanged. Animated roof/support chases are drawn separately in `smf-stage-view.js`; they freeze with reduced motion and pause with the round.

### References and provenance

The user supplied these photographic references on 2026-11-09 for the 2026 baseline, specifically identifying the large central pyramid, smaller side pyramids, swooping supports and chasing neon as the recognition cues:

- [Father Funk / Fractal reference](https://www.instagram.com/p/DbJx3malrlu/) — supplied Google Images result, media ID `3947901315693176517`. The post displays July 23, 2026; the photograph's capture date was not independently established.
- [Fractal Forest fan page / daytime team photo](https://www.facebook.com/FractalForestFanpage/) — supplied Google Images result, media ID `1522155529716317`; clear full facade and twin hanging arrays. Capture date and individual photographer credit were not visible in the result.
- [Blue-lit structure / close view](https://www.instagram.com/p/Dbd4oCfCUOz/) — supplied Google Images result, media ID `3953562292270215959`; roof profile and branching supports. Capture date was not independently established.

Browser captures of the three user-selected photographs were supplied to the built-in ImageGen tool as references. They are not distributed with the game. The illustration interprets the venue for a shallow game arena; it is not an exact reconstruction. The dark empty floor is intentionally expanded for gameplay. No crowd, text or photographed people were carried into the generated asset.

Generated with the built-in ImageGen tool, then converted from its 1536×1024 PNG output to an opaque JPEG (quality 88, about 469 KB) without changing composition. The source generation is retained in the local generated-images folder; this project contains the actual asset it loads.

### Generation prompt

```text
Use case: stylized-concept
Asset type: finished 2D browser-game background plate, landscape 3:2, ideally 1536x1024. This is artwork to actually install behind moving game sprites, NOT a screenshot or mockup.
Input images: Image 1 is the user-selected real daytime Fractal Forest stage photograph, authoritative for architecture. Image 2 is a closer cyan-lit view, authoritative for the sweeping supports. Image 3 is the night lighting reference. These photos are references only. Create a new original illustration of the SAME recognizable structure, with no photo people, logos or UI.
Primary request: recognizably recreate Shambhala's Fractal Forest architecture in a polished illustrated psychedelic forest-festival game. The unmistakable silhouette is ONE broad shallow square-pyramid metal roof above the central DJ booth, TWO smaller matching pyramid roofs over flanking black hanging speaker towers, and pale sculptural supports that swoop upward in a branching Y from near the booth centre to the wide eaves. Preserve these actual structures. Thin cyan/lime/magenta neon edge strips follow the pyramids and curving supports. No circus tent, no star-shaped fabric canopy, no temple, no fantasy castle.
Composition is crucial: an elevated, nearly orthographic front view toward the stage from the dancefloor. Full rectangular background. The architecture and dense forest backdrop occupy the TOP THIRD only. Main roof apex near x50%, y4%; eave corners near x29%,y13% and x71%,y13%; sweeping supports meet near x50%,y29%; low DJ booth at x43–57%,y27–32%. Side roof apexes near x19%,y5% and x81%,y5%, roofed speaker arrays end by y31%. Tall irregular cedars frame this, mostly in the top third and the extreme left/right 8% borders.
The lower TWO THIRDS, from y33% to bottom, must be an EMPTY, spacious, smooth dark desaturated forest dancefloor viewed from above, broad and flat, with only very subtle painterly grain and soft coloured ambient pools. The empty floor is the majority of the image. No objects, people, speakers, laser lines, decoration, plants, mushrooms, bright dots, stars, paths or distracting edges in the central lower floor. No perspective horizon cutting across the floor. Edge ferns may frame the extreme sides only.
Style: beautiful hand-painted indie arcade environment, confident readable shapes, warm timber and ribbed roof material against layered blue-green cedar silhouettes; tactile illustrative shading, not photorealism. Deep forest at blue hour, controlled cyan and acid-green edge lighting with a little violet. Restrained atmospheric depth. Architecture is bright enough to identify at a 370px-wide phone display; floor remains darker and quieter.
Constraints: no text, no lettering, no people or characters, no collectible objects, no HUD, no screenshot frame, no watermarks. Keep the broad sloping pyramid roofs and branching curved supports very faithful to the references. The neon is a subdued base illumination; animated light chases will be added in code. Do not fill the empty playing field with dramatic effects.
```


## The Grove art pass

`grove-v1.jpg` is the second original ImageGen venue illustration, following the approved Fractal pilot. It uses the current flat-front timber structure, suspended mandala canopy and Funktion-One-style horn stacks confirmed by the owner on 2026-11-09. It is decorative and DEV-only, with the existing canvas Grove retained on an asset-load failure. Collision, timing, music, targets and scoring are unchanged. The timber inlays have a separate slow eight-beat glow, which freezes with reduced motion and pauses with the round. Common lighting originates at the illustrated rig.

### Grove references and provenance

Images were viewed through the browser and supplied as local reference captures. Original photography is not distributed with the game. The illustration is an interpretation for the shallow arena, with an intentionally enlarged empty floor, not an exact architectural reconstruction.

- [Lost Horizon Productions, September 30, 2026](https://www.instagram.com/p/Dd7LEQTn-5H/) — the owner's supplied image link resolved to this post. The production team identifies the Grove, credits @therealmattlove for the photos, and describes the Funktion-One system. Primary 2026 reference for the flat facade, forest setting and floating patterned canopy.
- [Alex Moon sunrise at Grove](https://www.reddit.com/r/Shambhala/comments/1ms00cx/alex_moon_sunrise_at_grove/) — owner-supplied photograph; the visible post date is August 16, 2025. Used as a supporting structural reference, not relabelled as 2026.
- [EDM Maniac 2026 festival report](https://edmmaniac.com/festival-report-card-shambhala-music-festival-2026/) — SMF-credited nighttime image `ShambhalaFRC11-819x1024.jpg`, showing patterned fabric, timber cladding and horn stacks. Individual image has no venue caption; the production-team photo corroborates its Grove structure. Used for night colours and the column/booth inlays.
- The accepted `fractal-forest-v1.jpg` was supplied solely for consistent illustrative style and floor composition, not Grove architecture.

Additional owner references inspected: the [Melo Nade 2025 artwork](https://soundcloud.com/melo-nade/shambhala-2025-sunday-5pm-at-the-grove) clarifies carved roof trim; the [festival's August 28, 2024 photo](https://www.facebook.com/photo.php?fbid=1070497784636968) shows an older peaked-roof structure. The [2024 director guide](https://www.shambhalamusicfestival.com/blog/the-grove-stage-directors-guide-to-2024) supports the forest setting. Those older designs did not override the owner's confirmed current flat style.

Generated with built-in ImageGen as 1536×1024 PNG, then converted to an opaque quality-88 JPEG without composition changes. The project contains the actual loaded asset; source output remains in the local generated-images folder. No photographed people, logos, text or crowd were carried over.

### Grove generation prompt

```text
Use case: stylized-concept
Asset type: original finished 2D browser-game environment plate, landscape 3:2, 1536x1024. Artwork for a real game, not a UI mockup.
Input images: Image 1 is a confirmed 2026 photo of Shambhala's Grove from its production team, authoritative for the current stage facade, suspended patterned shade canopy and setting. Image 2 is a 2025 sunrise view, for timber construction and carved eave details. Image 3 is the 2026 nighttime photo, for geometric column cladding and diamond-pattern booth. Image 4 is our accepted Fractal Forest game art: use ONLY its painterly style, floor treatment and composition proportions. DO NOT copy its architecture, pyramids or swooping Y supports.
Primary subject: recognizably recreate THE GROVE's broad wooden stage within dense cedar forest. Broad high horizontal main roof with visible timber rafters and tiny repeated ornamental carved/scalloped trim along its front eave. Two lower flat-roofed side wings. Four prominent upright rectangular wooden columns, with bold nested diagonal chevron inlays on their front faces. Central dark open performance bay. A low wide timber DJ booth in front with precisely readable nested diamond and angular slat patterns. On EACH side, squat black speaker stacks with distinctive violet rectangular horn mouths in a 3-column by 2-row grid above dark bass cabinets, tucked under the lower side roofs. Smaller carved timber/slatted side panels. Real timber construction, not a fantasy treehouse, not a pagoda, no peaked central roof.
Composition: elevated nearly orthographic front view toward stage, matching the game example's spacious shallow arena. Architecture fills only the TOP 36–38 percent of image. Main eave runs x29–71%, at y11%; roof is almost horizontal with short visible rafters under eaves. Main columns x30% and x70%, end at y36%. Side wings x16–30% and x70–84%, eaves y17%, floor y36%. Central booth x40–60%,y29–36%. At the extreme TOP edge crop in a small portion of the suspended patterned stretch-fabric canopy: violet/cream geometric diamonds and leaf-like star pattern, over the roof but not hiding it. Dense tall cedars behind, ferns only at extreme edge.
At least the bottom 62 percent, y38% to bottom, must be EMPTY flat playable dancefloor. Smooth dark desaturated moss-green/slate ground, extremely subtle painterly texture and low-contrast broad amber/violet light pools. Keep the middle and lower floor completely empty with no people, props, specks, particles, plants, paths, boundaries, bright laser lines or shadows shaped like obstacles. No raised barrier or staircase projecting into the playable floor.
Art style: polished hand-painted indie arcade illustration, like image 4, readable confident geometry and textured organic forest. Warm honey-colored wood with amber illumination and restrained violet accents. Forest dusk, layered deep teal cedar foliage. Bright enough wood detail to read at 370px phone width, quiet low-contrast floor. Architectural lighting is a subdued base; animation will be added separately in code.
No text, lettering, logos, crowd, people, characters, game sprites, collectibles, HUD, border or watermark. Do not copy the reference photographs literally; create original cohesive illustrative art of the recognizable Grove structure. Preserve the open empty floor.
```
