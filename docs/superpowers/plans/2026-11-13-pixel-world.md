# Pixel world implementation plan

> For agentic workers: use subagent-driven development for independent actor, item and venue work, with root integration and validation.

**Goal:** Apply the approved animated pixel direction across characters, wardrobe, gameplay objects, stages and presentation.

**Architecture:** Shared cached pixel actors/items, preserved scene contracts, source-aligned ImageGen venue redraws, isolated edition asset imports. No mechanics/storage/backend changes.

**Tech Stack:** Phaser, Canvas textures, JavaScript modules, Vite, ImageGen, Node tests.

**Spec:** `docs/superpowers/specs/2026-11-13-pixel-world-design.md`.

## Review focus

- Collision origin remains at the same world point even as art/hat/totem bounds change.
- Late asynchronous texture loads cannot mutate a destroyed scene.
- Bonus costume targets and rewards retain their gameplay meaning.
- Production camera/touch coordinates stay unchanged; nearest-neighbor sampling applies to art textures.
- Generic build never includes SMF-only venues or bonuses; neither build includes the isolated art lab.

## Tasks

- [x] Generate neutral actor base, props atlas, six main pixel plates and four bonus pixel plates; inspect and record provenance.
- [x] Actor worker: layered wardrobe, all actor facings/animation and crowd personalities; root wires actual displacement and sprint state into GameScene.
- [x] Items worker: pickups, candy, reactions, cosmetic and bonus props; root wires active-clock updates into GameScene.
- [x] Venue worker: pixel sibling imports and preserved stage/mapping placement; root updates generic scenery, hazards and coherent HUD/menu presentation.
- [x] Root: review API boundaries, source disposal, portable atlas alignment, edition allowlists and full preview navigation.
- [x] Validate focused/full tests and both builds; inspect desktop and phone gameplay, wardrobe, representative bonus activities and all venue plates; address review findings.
- [x] Update handoff/roadmap with preview scope and actual validation. Leave the branch ready for owner playtesting without publishing.

## Preview outcome

Delivered locally. Validation and remaining physical-phone/sideways-pose/first-load work are recorded in [pixel-world-validation.md](../pixel-world-validation.md). All six main venues and five bonus spaces use the new direction. The owner reported choppy frames during implementation; the audit corrected repeated same-foot poses and excessive cadence, with explicit per-clip ordering and slow playback inspection. No release performed.
