# Pixel Afterparty — full visual pass

The owner accepted the animated pixel study and explicitly authorized the direction across the game: “Let it rip on everything.” Extend that approved direction into the two game editions while preserving the functioning game.

## Scope and decisions

- Replace player and crowd bodies with frame-based pixel actors: four facings, dance-step normal movement and playful sprinting. Preserve the stride phase on speed changes and actual movement as the animation signal. Do not rotate the entire raster sprite.
- Keep all wardrobe IDs, unlocked choices and saved profiles. Compose outfit color/pattern, headwear, held totems and decorative effects using a shared animation base plus cached runtime layers; no combinatorial atlas explosion.
- Replace sparks, Flow, mystery candy, friendship and Bass Head presentation with the accepted pixel vocabulary. Bonus delivery costumes and carried-object objectives remain recognizable.
- Redraw the six main SMF venue plates and four raster bonus plates in pixel art. Preserve source composition, screen rectangles, canopy/tower anchors and playable space. AMP backstage and generic scenery receive native pixel drawing updates.
- Give HUD/menu controls a cohesive block-edged treatment and pixel display typography while keeping body text readable, the three themes, all modes, settings, score seasons and guarded stage-end controls.
- Keep tap, swipe, stick, stamina, collisions/friendship, music clocks, secrets, mini-golf, progression, recovery, local and online scoring unchanged. No new season or backend migration is needed for visual changes.

## Implementation boundaries

New shared art lives in `src/pixel-art/`. The original art lab remains available in development. Public builds may contain production pixel assets but must still exclude the lab itself. SMF venue/bonus assets remain excluded from the generic build.

Generated images are source artwork, with explicit atlas dimensions and anchors. Runtime layers and palette application are game rendering behavior. Cache small textures, avoid per-frame image processing, dispose scene listeners and ignore late image callbacks for destroyed scenes.

Old plate sources remain for reference; import pixel siblings. Existing static backdrop art is not a new physical object. All light/mapping geometry, hazard positions and touch coordinate transforms retain their current coordinate systems.

## Acceptance

Test real gameplay and wardrobe on desktop and phone-sized portrait/landscape; inspect both editions, named venues, bonus activity targets, pause/recovery and stage-end menus. Check that pixel outfits remain distinct and that UI scaling does not obscure controls. Run relevant focused tests, full suite and both edition build/asset-isolation checks. Review source changes independently. The deliverable is a local playable full visual preview; publishing remains a separate owner request.
