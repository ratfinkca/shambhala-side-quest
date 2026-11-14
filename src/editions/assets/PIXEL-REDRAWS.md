# Main venue pixel redraws — v1

The six reference illustrations were redrawn using ImageGen for the pixel-art presentation. The original JPG plates remain alongside the replacements for comparison; they are not loaded by the current runtime. Reference-photograph credits and venue research for the original plates remain in README.md.

These are generated redraws rather than a pixelation filter over the paintings. Every output is 1536 × 1024 PNG, drawn at the same 960 × 640 world rectangle with its existing origin and depth. Stable texture keys preserve lifecycle handling. The existing mapped lights, screen surfaces, speaker cones and playable boundaries are unchanged. Texture sampling is nearest-neighbor locally; the global renderer and camera are unchanged.

The generation brief requested the exact reference camera and architecture, scenery concentrated in the upper 42%, preservation of all mapped-light coordinates, and an open low-detail dancefloor. The requested style was a 512 × 341-scale, 16-bit pixel-art composition with stepped edges, limited material palettes, clustered dithering, and dark screen surfaces for the animated overlays. No people, text, HUD or new obstacles. The rendered PNG dimensions are the actual output contract; no downsampling filter was applied after generation.

The following are provenance records and concise brief summaries, not a verbatim transcript of the generator prompts.

## living-room

- Original edit reference: `living-room-v1.jpg`
- PNG master: `living-room-pixel-v1.png`
- Lossless runtime plate: `living-room-pixel-v1.webp`
- Generated source: `/Users/mother/.codex/generated_images/01a1368f-7ce7-7722-a6bd-8509627b4e12/exec-a6cb99df-5b4f-4007-a7f1-f7b95901c2fa.png`
- Venue identity: Riverfront stage; timber facade, multilevel LED panels and leafy framing.

## pagoda

- Original edit reference: `pagoda-v1.jpg`
- PNG master: `pagoda-pixel-v1.png`
- Lossless runtime plate: `pagoda-pixel-v1.webp`
- Generated source: `/Users/mother/.codex/generated_images/01a1368f-7ce7-7722-a6bd-8509627b4e12/exec-b13b25c5-dd4b-4cd4-93d4-1c8b03455d46.png`
- Venue identity: Stacked roof silhouette and projection-mapped facade.

## fractal-forest

- Original edit reference: `fractal-forest-v1.jpg`
- PNG master: `fractal-forest-pixel-v1.png`
- Lossless runtime plate: `fractal-forest-pixel-v1.webp`
- Generated source: `/Users/mother/.codex/generated_images/01a1368f-7ce7-7722-a6bd-8509627b4e12/exec-7aaaac3e-98a2-4978-8efa-f1a698533f24.png`
- Venue identity: Large booth pyramid, smaller side pyramids and swooping neon support contours.

## grove

- Original edit reference: `grove-v1.jpg`
- PNG master: `grove-pixel-v1.png`
- Lossless runtime plate: `grove-pixel-v1.webp`
- Generated source: `/Users/mother/.codex/generated_images/01a1368f-7ce7-7722-a6bd-8509627b4e12/exec-5dffa79a-0842-42c3-a730-b4829b5df553.png`
- Venue identity: Flat floating mandala canopy, carved booth and purple horn speaker stacks.

## amp

- Original edit reference: `amp-v1.jpg`
- PNG master: `amp-pixel-v1.png`
- Lossless runtime plate: `amp-pixel-v1.webp`
- Generated source: `/Users/mother/.codex/generated_images/01a1368f-7ce7-7722-a6bd-8509627b4e12/exec-dd322a8c-8c94-4818-bc57-c6c2d9622326.png`
- Venue identity: Wide amphitheatre frame, side LED walls and central booth.

## village

- Original edit reference: `village-v1.jpg`
- PNG master: `village-pixel-v1.png`
- Lossless runtime plate: `village-pixel-v1.webp`
- Generated source: `/Users/mother/.codex/generated_images/01a1368f-7ce7-7722-a6bd-8509627b4e12/exec-58319412-70d3-403d-bf9b-a72d1ecc5f12.png`
- Venue identity: Flower-topped towers, carved wooden masks over screens and prominent speaker system.

Runtime delivery uses lossless WebP siblings. All 13 venue/title exports were decoded and compared byte-for-byte against their PNG masters; dimensions and every RGB channel match. See `src/pixel-art/assets/LOSSLESS-DELIVERY.json` for exact byte counts and decoded-pixel SHA-256 values. PNG masters remain the source artwork.
