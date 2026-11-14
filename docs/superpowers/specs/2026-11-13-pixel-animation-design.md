# Pixel Afterparty: first animation preview

The owner selected the Pixel Afterparty concept and authorized animated sprite-sheet work. Movement should dance-step normally and become a playful run when sprinting. This first deliverable is a disposable, playable art lab, not a replacement of the published art or gameplay.

## Direction

Use crisp frame-by-frame sprites, four visual facings and unrestricted travel directions. Mirror side-facing frames for this symmetric first costume; asymmetrical accessories will need separate layers/anchors. Preserve a consistent foot anchor, character proportions and scale across every frame. Movement changes immediately; it never waits for an animation to finish. Walk/run share cycle phase. Stopping decelerates into a neutral pose; decorative reactions never lock the controls.

The first character wears Forest Lime, a purple bucket hat and lavender shoes, without a held totem. The prototype sheet includes idle, dance, three facing dance-step clips and three facing run clips. Left mirrors right. Separate effects include sparks, golden Flow, friendship hearts and mint Bass Head rings. The preview presents enlarged clips and a small playable floor so generated-frame inconsistencies are visible before wider production.

## Architecture and boundaries

- ImageGen authors transparent art. Atlas metadata names and anchors frames; runtime clips/draws frames without baking movements into physics.
- A dev-only `?rehearsal&pixels` route loads the isolated lab. No profile, telemetry, score tickets, recovery, server calls, or persistent unlock changes.
- The first lab uses Canvas 2D with nearest-neighbor image sampling; the game uses Phaser, whose frame/atlas APIs support the same asset data. This avoids changing production rendering settings while comparing scales.
- Animation uses active elapsed time. Pause/background suspension freezes it; reduced motion quiets idle/dance and decorative effects. Genuine locomotion remains readable.
- Main-game controls, collisions, scoring, painted venue assets and camera behavior stay intact. Actual game integration follows acceptance of the moving art.
- The baked first costume is a proof of motion. The full wardrobe needs body/outfit, hat, held-object and flourish layers, frame-aligned head/hand/foot anchors and separately authored asymmetrical attachments. Do not multiply every costume combination into a separate atlas.

## Validation and next production gates

Inspect transparency, row/column counts, clipped poses, consistent scale and visible loop seams. Test idle/movement/run changes, facing hysteresis, pause/resume, reduced motion, keyboard/tap inputs and phone layout. Confirm production builds omit the lab and its images. Treat AI-generated sheet consistency as a quality risk to review in motion; these images are not automatically final production sprites.

Next: owner feedback on silhouette/cadence, then layered wardrobe production and main-game integration, followed by NPC personalities, item/effect migration and the coordinated environment pass.

References: [Phaser animations](https://docs.phaser.io/phaser/concepts/animations), [Phaser texture atlases](https://docs.phaser.io/phaser/concepts/textures).
