# Shared pixel artwork — 2026-11-13

Original ImageGen artwork for the approved Pixel Afterparty direction. The main
and bonus venue provenance is alongside those assets. Branded title prompts are
in TITLE-PROMPTS.md and only the SMF edition imports those title images.

## Character master

`raver-base-v1.png`: 887 × 1774 RGBA, six columns × eight rows. Rows: idle, dance,
walk toward/right/away, run toward/right/away. Generated from the approved lime
motion study by removing its hat, retaining brown hair and warm skin, and making
all clothing neutral gray for runtime palette and pattern layers. Generation:
`exec-0c516771-f922-4333-bb56-c7b82f91702c.png`.

The decoded master is normalized once, preserving one common foot anchor and
scale across all frames. Cached costume textures are built on demand. Hats,
totems and earned accessories remain separate layers, with the same saved IDs.
Artwork never changes physics centers, encounter radii or movement speeds.

**Animation audit:** the generated front/back sequences repeated one foot, so
source order alone could not yield a correct alternating gait. `actor-clips.js`
explicitly reconstructs the second half-cycle by mirroring reviewed poses. Body
mirroring is separate from facing/held-item mirroring. Walk/run phase persists
across changes and cadence is bounded around 8/12 fps rather than racing with
world-space speed. Sideways movement now uses the component rig below; its
six poses contain a genuine alternate-leg cycle rather than the old sheet rows.

## Sideways character components

`raver-side-parts-v1.png`: 1536 × 1024 RGBA, three columns × two rows.
Generated with built-in ImageGen from `raver-base-v1.png`; source output
`exec-087a73f2-cdfa-46c6-9f79-4d4565bfee0c.png`.

Prompt specification: exact brown-haired cheerful neutral-gray raver identity;
transparent pixel-art component atlas, no complete characters, labels, grid or
shadows. Six isolated right-profile parts: head, sleeveless torso, upper arm,
forearm with hand, thigh, calf with right-facing gray/white sneaker. Gray clothing
remains recolorable. Joint endpoints overlap; each part has transparent padding.

`actor-side-parts.js` records measured crop rectangles and joint pivots. Source
parts are alpha-thresholded and nearest-sampled into the normal 64 × 80 frame
format. `actor-side-pose.js` defines planted-foot backward travel and forward
swing, with the far leg exactly half a cycle apart. The run has airborne poses;
the walk retains ground contact. One shared foot origin remains fixed. A
separate neutral side-rest pose prevents freezing in a lunge after movement.
Footwear masks preserve raised/shaded sneakers through wardrobe recoloring.
The assembled atlas has 49 frames; rows 3/6 replace old animation art, with
the neutral side rest appended at frame 48. Front/back body poses keep their
original pixels below the collar. Measured head ownership removes the embedded
head while preserving palms and raised sleeves; the reusable head layers below
are drawn at the corresponding cap socket. The side rig omits its old head part.
Hats and held objects follow the rig's head/hand anchors. Assembly happens once
on load, not on every game frame.

Holding a wardrobe or earned staff selects a side-arm variant with a stable
palm. It shares the remaining body poses and never needs a new sheet per item.

## Modular character heads

`character-head-parts-v1.png`: 971 × 1619 RGBA. Original ImageGen output
`exec-e7a8bb29-84e8-41ef-9d03-cec16711bd2a.png`, referenced against the same
neutral raver master. Three columns show front, right profile and back; five
rows contain a bare head, bob, crop, curls and locs. The requested regular grid
was not emitted at its requested resolution; runtime registration uses the
actual source geometry. Left profiles mirror the right profile.

The prompt specified detached transparent layers, no text or scenery, a shared
skull/hat opening, dark pixel outlines and short colour ramps. Reusable head,
hair and facial layers allow independent face/hair/skin selection without a
complete animation sheet for every combination. Clothing, wearable items and
rewards keep their existing IDs.

## Pickups and bonus props

- `party-fx-v1.png`: 1254 × 1254 RGBA, four columns × four rows. Spark, Flow,
  friendship and Bass Head. Copied from the approved isolated motion study.
- `party-props-v1.png`: 1448 × 1086 RGBA, four columns × three rows; 362 px cells.
  Row one: pink striped, teal stars, purple dots, gold zigzag candy wrappers.
  Row two: toast triangle, wrapped sandwich, unlit lantern, lit lantern.
  Row three: seed, blossom, Golden Chicken, golf ball. Generation:
  `exec-788c510e-42a1-46e6-9f6c-62c6df201124.png`.
  Prompt requested crisp 16-bit pixels, dark purple outline, 2–3-tone ramps,
  transparent background, centered separated objects and no labels/scenery.

Source masters remain intact. Rendering uses nearest sampling and fixed logical
pickup positions. Readable native pixel fallbacks survive image-loading errors.
Lossless venue/title delivery sizes and decoded-pixel hashes are recorded in
LOSSLESS-DELIVERY.json. No backend or scoring-season change is needed for this
visual preview.
