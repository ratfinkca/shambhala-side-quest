# Pixel Afterparty motion study v1

Generated with the built-in ImageGen tool on 2026-11-13 for the owner's selected Pixel Afterparty direction. The reference was the approved concept `exec-7708983c-5e06-4d66-bd84-b54ba112e1b5.png`. These are first motion-study assets, not yet a complete layered wardrobe or a release-approved replacement for the game.

## Files and frame map

- `forest-lime-motion-v1.png`: 887×1774 RGBA; six columns, eight rows, 48 frames. Rows are idle, dance, dance-step down/right/up, run down/right/up. Left facing mirrors right. Same costume: Forest Lime, purple bucket hat, lavender trainers. No held object.
- `pickups-friendship-v1.png`: 1254×1254 RGBA; four columns, four rows, 16 frames. Rows are spark, Flow, friendship, Bass Head.
- `../atlas.js` defines the exact grid rectangles, one shared source-to-display scale per sheet, stable foot anchor, names, frame rates and looping policy. Sheets retain their original generated pixels. Runtime source rectangles are metadata; no per-pose auto-trimming or rescaling.
- Matching `.atlas.json` files provide standard named frame rectangles and pivots for Phaser's atlas loader. Their names and coordinates are checked against the preview renderer.

The generator did not follow the requested 1536×2048 raver size; its actual cell aspect is rectangular. The renderer preserves that original aspect rather than squeezing the character into a square. This is why explicit atlas metadata matters.

## Prompt specification used

Shared: production-oriented pixel-art sprite sheet for approved Pixel Afterparty reference; only sprites on real transparent background, no title, text, grid lines, backgrounds, shadows, scenery or UI. Hard square pixel clusters, dark-purple outline, three-tone ramps, compact expressive adult raver; lime onesie with cream spiral, purple bucket hat, brown hair, tan skin and lavender shoes. Identical costume, proportions and palette in every frame. Both hands free, accessories to be separate layers. Generous transparent gutters, complete isolated poses, no overlap, blur or decorative stars.

Character: exactly six columns × eight rows. Requested 1536×2048, 256px cells, fixed pelvis center and ground baseline. Six sequential frames in each row: (1) idle front knee/arm bob; (2) front dance side-to-side groove; (3) down-facing dance-step contact/down/passing cycle; (4) same to right; (5) back-facing/up travel; (6) larger playful front running stride; (7) side/right run; (8) back/up run. Each row keeps its facing; left mirrors right. Articulated limbs, not translated duplicates. Simple symmetric hat for this first mirrored prototype.

Effects: exactly four columns × four rows on transparent square sheet; no characters, text, grid lines or shadows. Four phases each: (1) gold four-point twinkle min/medium/bright/medium; (2) larger gold faceted Flow diamond spinning face/edge/opposite/edge at consistent height; (3) coral friendship heart small/full/star-accent/confetti one-shot; (4) mint segmented elliptical Bass Head ground-ring and sound bars pulsing outward. Crisp pixel clusters, no soft glow.

## Review / production boundary

Generated art has lightly antialiased/low-alpha edge pixels and is not a hand-cleaned indexed-color master. Inspect at practical 1×/2× sprite scale in motion. A final production cleanup and layered wardrobe atlas remain separate work after the moving prototype is accepted. Future hats/totems require authored head/hand anchors and alternate draw order on back views; they are not represented by arbitrary offsets in this sheet.

Current frame rates are art-direction starting points: idle 6fps, dance/walk 8fps, run 12fps, with movement-driven cadence. The game can render smoothly at its usual rate while the sprite poses change discretely. No global camera or physics changes are implied.

## Gait correction after moving review

The user correctly spotted choppiness even in the fixed 8fps inspector. A pose audit found that the generated front/back walks repeat the same leg's sole-lift in source columns 2 and 4; reordering alone cannot supply the missing other-leg pose. `src/pixel-art/actor-clips.js` now explicitly reconstructs alternating half-cycles from three selected source poses and their horizontal mirrors. The inspector resolves that map once, including manual stepping. The JSON atlas includes `poseMirror` metadata that playback must apply in addition to facing. Sideways source order is retained; it has not been certified as a hand-authored perfect gait.

The automated movement preview also had a separate cadence issue: distance/34 and distance/42 produced roughly 14/21fps at its walking/running speeds. Cadence now follows the authored 8/12fps with bounded speed variation, preserving gait phase through sprint changes. Production actors use a separate neutral wardrobe source and the same pose map; the original laboratory pixels remain unchanged.


## Production inspector update — sideways cleanup

The current inspector now loads the exact production actor frames, including the
sideways component rig and neutral side-rest frame, and uses the production
palette function. `forest-lime-motion-v1.png` and its JSON atlas are retained as
historical concept/source material; they no longer supply the actor preview.
Effects still use the original effects atlas. Actor atlas dimensions are 384 ×
720 (six columns, nine rows, 49 populated frames); all frames use the same 32,74
foot origin. Manual left-facing mirroring, quarter/half speed and frame stepping
allow both directions and loop seams to be inspected without changing saves.
See `../../pixel-art/assets/README.md` for rig source provenance and frame rules.
