# Fractal Forest art pilot

`fractal-forest-v1.jpg` is an original ImageGen illustration used only in the SMF development venue preview. It is not included in either production edition. The plate is decorative: collision, pickup positions, timing and scoring are unchanged. Animated roof/support chases are drawn separately in `smf-stage-view.js`; they freeze with reduced motion and pause with the round.

## References and provenance

The user supplied these photographic references on 2026-11-09 for the 2026 baseline, specifically identifying the large central pyramid, smaller side pyramids, swooping supports and chasing neon as the recognition cues:

- [Father Funk / Fractal reference](https://www.instagram.com/p/DbJx3malrlu/) — supplied Google Images result, media ID `3947901315693176517`. The post displays July 23, 2026; the photograph's capture date was not independently established.
- [Fractal Forest fan page / daytime team photo](https://www.facebook.com/FractalForestFanpage/) — supplied Google Images result, media ID `1522155529716317`; clear full facade and twin hanging arrays. Capture date and individual photographer credit were not visible in the result.
- [Blue-lit structure / close view](https://www.instagram.com/p/Dbd4oCfCUOz/) — supplied Google Images result, media ID `3953562292270215959`; roof profile and branching supports. Capture date was not independently established.

Browser captures of the three user-selected photographs were supplied to the built-in ImageGen tool as references. They are not distributed with the game. The illustration interprets the venue for a shallow game arena; it is not an exact reconstruction. The dark empty floor is intentionally expanded for gameplay. No crowd, text or photographed people were carried into the generated asset.

Generated with the built-in ImageGen tool, then converted from its 1536×1024 PNG output to an opaque JPEG (quality 88, about 469 KB) without changing composition. The source generation is retained in the local generated-images folder; this project contains the actual asset it loads.

## Generation prompt

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
