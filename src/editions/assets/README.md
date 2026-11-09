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


## The AMP art pass

`amp-v1.jpg` is an original ImageGen illustration of the 2026 rebuild: elevated central timber portal, two lower screen wings, carved corner brackets, serpent panels and hanging line-array speakers. The owner requested the same reference-guided approach after accepting Grove. It is loaded only in DEV venue practice; the original canvas AMP sketch remains the missing-texture fallback. Geometry, music, timing, scoring and the generic public game are unchanged.

The LED motion is a separate, bounded set of slow cyan/violet ribbons inset within the three illustrated screen areas. One cycle spans 16 beats; there are no flashing cuts or bright panel fills. Reduced motion fixes the ribbons at their initial pose, and pause stops them with the round. Common lighting originates at the six illustrated truss fixtures.

### AMP references and provenance

- [Don Idio photo in EDM.com's August 6, 2026 review](https://edm.com/events/shambhala-music-festival-review-2026/) — the embedded portrait `SMF2026_0726_001153-01878_DIVISUALS-Don-Idio-819x1024.jpg` is explicitly captioned as the renovated AMP. The owner supplied this same photograph. Used for the current frame, screen proportions and serpent panels. The article's separate lead image appears to show Pagoda despite its AMP alt text; that image was excluded after visual inspection.
- [Rachel Whitcomb / Jkyl & Hyde at AMP](https://www.dancemusicnw.com/shambhala-2026-review/) — `IMG_4488-e1787025400167.png`, dated by the 2026 review and labelled by venue. Also supplied by the owner; used for trusses, side screen frames and hanging speakers.
- [Festival's October 19, 2026 carousel](https://www.instagram.com/p/DesUq31j4Wk/) — owner-supplied first image, credited by the visible @divisuals tag, with a clear frontal view of the rebuilt AMP. Used as a second frontal geometry check. The post date is known; exact photo capture date is not independently established.
- The accepted `grove-v1.jpg` was supplied only for the consistent illustrative style and clear-floor composition.

Supporting references inspected: [EDM Maniac Canada's July 24 rebuild reel](https://www.instagram.com/reel/DbL2wBCJuQC/) shows Skiitour performing on day 0 and confirms the exposed timber roof construction. The owner's [official AMP gallery](https://shambhalamusicfestival.com/stages#amp) corroborates the frame and screen placement, but individual photo dates/credits are not displayed. The [2026 official AMP announcement](https://www.shambhalamusicfestival.com/blog/2026-amp-stage-lineup) confirms PK Sound; its pre-festival image was not used as evidence of the completed rebuild.

Only the original generated artwork is distributed. Photo reference captures stay outside the repository. It interprets the venue for the shallow game arena, expands the empty dancefloor and simplifies the screen/speaker detail for phone readability; it is not an exact reconstruction. No photo crowd, performer identities, artist graphics, text or logos are reproduced. Source output was 1536×1024 PNG, converted to opaque quality-88 JPEG without composition changes.

### AMP generation prompt

```text
Use case: stylized-concept
Asset type: original finished 2D browser-game environment background, landscape 3:2, 1536x1024. Game art to install behind moving sprites, not a screenshot.
Input images: Images 1-3 are real 2026 photographs of the rebuilt AMP at Shambhala. Preserve their architecture, especially the tall flat-roof central bay, lower broad side LED walls, decorative cut-out corner brackets and two gold serpent panels. Image 4 is our accepted Grove illustration: use ONLY its painterly rendering style, dark empty floor treatment and composition proportions. Do NOT copy Grove's mandala canopy, diamonds or purple horn speakers.
Primary subject: recognizably recreate the 2026 AMP. A tall, narrow central open timber portal, its wide but shallow nearly horizontal roof visibly elevated above two lower roofed side wings. Prominent golden timber uprights with clean straight lines. Under the central roof a visible dark metal lighting truss and small fixtures; deeper shadowy stage opening. A low rectangular DJ booth with a dark LED frontage. Two vertical black decorative panels immediately left and right of the central opening, each with a slender coiled golden serpent motif as in reference 1. Each side wing is dominated by a large almost-square dark LED wall, framed with warm timber and intricate lacy cut-out corner brackets. Slim hanging black curved line-array speakers near the outside edge of the LED walls, with modest black bass bins at stage foot. No purple horn stacks. Large trees behind the structure and a little side foliage.
The LED walls should show original restrained abstract concentric contour wave shapes in muted petrol-cyan and violet, NO text or artist logos. Keep screens dark enough to remain subordinate to legible amber wood structure. The game will animate the LED walls separately. Do not copy the photographic screen content, stage lettering, lasers, banners or totems.
Composition is essential: elevated, nearly orthographic front view from the dancefloor. Full rectangular image with the ENTIRE architecture in the TOP 36 percent only. Central canopy x33%-67%, roof y5%-10%; vertical central frame to y35%. Low side roofs x12%-34% and x66%-88%, at y14%; side walls from y18% to y34%. Central booth x43%-57%,y30%-35%. Tall central roof must visibly stand above the two lower wings. Forest behind and outermost edge only.
The lower 64 percent is EMPTY spacious smooth dark desaturated blue-slate dancefloor, very subtle painterly grain and soft diffuse cyan/amber/violet ambient pools. No people, speakers, vegetation, paths, fences, markings, laser beams, props, stars or bright dots on this open playable floor. No stairs or barrier projecting from stage into arena. Foliage only at extreme upper outer sides.
Style: polished hand-painted indie arcade environment matching image 4, cohesive tactile illustrative shading, clean readable structure. Warm ochre and amber timber against midnight blue forest, restrained cool cyan/violet screen glow. Structure should read at phone width 370px. Not photorealistic. No tent, no pyramids, no pagoda roofs, no floating mandala canopy. No text, logos, watermarks, crowd, people, game sprites, collectibles, HUD, border or UI. Keep visual effects controlled and floor calm.
```


## The Pagoda art pass

`pagoda-v1.jpg` is an original ImageGen illustration based on the dated 2026 JRM.RAW gallery. It preserves the pale faceted tower, one dominant peaked/upturned roof, ornamental arches, horizontal balcony bands and wide lower porch. It replaces the sketch only in DEV venue practice; failed asset loading keeps the original canvas Pagoda. Gameplay, music, timing, collision and scoring are unchanged.

Three measured facade panels receive softly crossfading aquamarine/lilac tints and slow diamond contours on a 16-beat cycle. The projection stays within those surfaces, avoiding the arched openings, balcony rails and floor. Reduced motion fixes the initial pose and pauses follow round time. Common lights originate under the illustrated porch.

### Pagoda references and provenance

The [official 2026 photo-album index](https://www.shambhalamusicfestival.com/blog/2026-photo-album-blog) links [JRM.RAW / Jeremy Quaglia's 2026 Party Time gallery](https://jeremyquagliaphoto.pixieset.com/shambhala2026/partytime/), whose displayed collection date is July 23rd, 2026.

- `Shambs26@JRM.RAW-3409.jpg` — clear pale facade, used as the architectural authority. The full-screen photograph was visually checked and supplied to ImageGen as a browser capture.
- `Shambs26@JRM.RAW-2129.jpg` — projection-mapped facade, used for the relationship between building and illumination. Its projected face artwork was not copied; the illustration and animated contours are original.
- The accepted `amp-v1.jpg` was supplied only for painterly consistency and the empty-floor composition, not the Pagoda's structure.

The [2026 EDM Maniac report](https://edmmaniac.com/festival-report-card-shambhala-music-festival-2026/) corroborates the white facade and projection mapping. Its descriptive storey count was not interpreted as multiple stacked roofs. The two actual facade photographs determine the silhouette.

Reference photos remain outside the repository. Only the original generated illustration is distributed. The venue is compressed into the shallow game arena and the empty floor enlarged for readability; it is not a measured reconstruction. Photo people, performers, lasers and UI are excluded. Generated as 1536×1024 PNG, converted to an opaque quality-88 JPEG without changing composition.

### Pagoda generation prompt

```text
Use case: stylized-concept
Asset type: original finished 2D browser-game environment background, landscape 3:2, 1536x1024. Artwork to install behind moving game sprites, not a mockup.
Input images: Image 1 contains the real 2026 Pagoda white facade photographed by JRM.RAW. It is authoritative for architecture. Image 2 shows projection mapping across that same building, only a mood reference; do not copy its face artwork. Ignore browser/gallery controls and white margins around both photographs. Image 3 is our accepted AMP game art; use ONLY its polished painterly rendering, game composition and empty-floor treatment, not its timber structure.
Primary request: illustrate Shambhala's real PAGODA stage recognizably. It is a tall, broad, PALE WHITE FACETED tower: three visible flat wall faces (central face and angled side faces) with one dominant peaked polygonal roof and small upward-curving eave tips. The central roof has a triangular face/gable, timber ribs and projecting eaves matching reference 1. The tower facade has ornamental scalloped arches, delicate white carved filigree around openings and horizontal railing bands halfway up. One tall central dark arched opening high on the front, two lower arched side openings. Small pale roofs extend behind the tower's lower sides. Across the entire base is a BROAD, low, wraparound PORCH roof with thin white support columns, dark open performance bay and a low central DJ booth. Preserve this exact overall silhouette from reference 1. The real stage has wall levels, NOT seven stacked roofs. No multi-tier fantasy pagoda tower, no generic temple, no red walls.
Composition: nearly orthographic elevated frontal view from the dancefloor, like the game example. Fit the COMPLETE stage and forest backdrop in the TOP 38 percent of the image. Main roof apex x50%,y3%; roof eave tips x34% and66%,y9%. Tower body x36%-64%,y10%-29%, divided into three visible facets. The broad porch stretches x22%-78%,y29%-38%, with a low central booth and pale columns. Small side roofs are at y25%-29%. Tall dark cedars behind, sparse trees and ferns at only the upper outer edges. No floating fabric canopy.
Lighting: the white tower is the star. Keep its pale surfaces and carved geometry readable, subtly lit by lilac, aquamarine and warm pearl. Add restrained original symmetrical geometric projection patterns on the actual wall faces: delicate nested diamonds, rosette-like tracery, fine luminous contours, low contrast enough to see arches and rails beneath. No giant projected face, eyes, words, logos or photographic content. Soft lavender/cyan glow on eaves, small warm lights below the porch. Do not draw beams or lasers across the scene; moving light will be added separately in the game.
BOTTOM 62 percent from y38% downward must be a large EMPTY dark blue-slate dancefloor with very subtle painterly grain and broad low-contrast ambient lilac/teal pools. No people, sprites, particles, stars, speakers, vegetation, stairs, paths, fence or props on this floor. It is playable negative space. The bottom foreground must remain calm and completely uncluttered.
Style: beautiful hand-painted indie arcade illustration consistent with image 3, confident readable silhouettes, intricate but controlled architecture, tactile illustrative shading, forest at blue hour. Pale silver/ivory architecture against deep navy and teal forest, distinctive lilac/aquamarine projections. Recognizable at 370px phone width. Full rectangular background, no frame, no UI, no text, no watermarks, no people, no crowd, no collectible objects. This is an original interpretation of the real venue, not a photo composite. Keep the single main roof, faceted white tower and broad porch faithful to image 1.
```
