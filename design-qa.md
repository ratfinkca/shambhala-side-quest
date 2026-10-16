# Forest Freakout visual QA — 2026-10-16

Status: passed for the implemented first-theme scope. Local preview only; no deployment.

Reference: `/Users/mother/.codex/generated_images/01a1368f-7ce7-7722-a6bd-8509627b4e12/exec-fadc217d-e1e4-4ab6-bddf-50947e7da24d.png`.

Evidence: `docs/qa/forest-freakout/` contains title, mobile-title, landscape-title, styles, HUD, perks and mobile-perks screenshots. Desktop 1366×768; portrait 390×844; landscape 844×390. Rehearsal buttons in HUD/perk screenshots are development-only.

Compared reference and rendered title/HUD/perk screenshots together. Retained forest print art, warm yellow/coral/violet palette, illustrated perk silhouettes, prominent Festival Run button, chunky typography and dark readable surfaces. Intentional responsive adaptations: desktop title splits art/actions; phone stacks them; four real perks replace the concept's two example cards; HUD preserves the existing arena and gameplay layout. This is an implementation of the visual direction, not a pixel clone of the concept board. Stage scenery and animated lighting remain future work.

Verified through browser UI: saved Surprise selection survives reload; upcoming previews disabled; Festival Run starts, qualifies into four illustrated choices, accepts Disco Boots and advances; pause/settings/back/resume work; results and replay return to a fresh first stage. Quick Rush starts on short landscape. Phone title and two-column perk grid remain usable with scrolling. Console reports no errors/warnings.

Fixed during QA: selected-theme focus was overwritten by generic menu focus; scroll containers now reset on screen changes; shortened landscape title spacing; restored Bass Head's 44px minimum target after independent code review. Final title/perks and HUD checked against the reference. No unresolved material code-review findings.

Limits: viewport checks are desktop browser emulation, not physical phone playtests. Not every screen was repeated at every size. Blocked-storage behavior has automated coverage; missing image fallback and reduced-motion rules were source-reviewed, not browser fault-injected. Online scores, other completed themes and physical touch/audio testing are not claimed.

# Moonlit Mycelium addition — 2026-10-16

final result: passed

Reference: `/Users/mother/.codex/generated_images/01a1368f-7ce7-7722-a6bd-8509627b4e12/exec-d856f848-787d-4d7d-ac47-61a0d903f973.png`. Compared alongside final rendered title, perk and HUD captures in one inspection. Evidence: `docs/qa/moonlit-mycelium/{title,perks,hud,mobile-title,mobile-perks,landscape-title}.png`.

The completed theme carries the reference's midnight forest, luminous mushrooms, cloaked wanderer, pale-gold serif title, luna moth, woven charms, silver borders and restrained sage accents. Intentional adaptations retain the established shared responsive layout: desktop art/actions split, four vertical perk cards instead of two horizontal examples, and existing compact HUD/arena geometry. Stage visuals and Bass Head mechanics remain unchanged; the concept's old Bass Head wording was not copied. No material visual issues found in the final comparison.

Verified at 1366×768 desktop, 390×844 portrait and 844×390 landscape. Both fixed themes switch immediately; Moonlit persists on reload. Surprise offers two available styles and resolved to Moonlit at run start in the browser check. Automated boundary tests verify both outcomes and exclusion of Neon. Moonlit Festival Run completed a rehearsal stage, displayed all four loaded perk images, accepted Moth Charm, advanced to stage two, paused, opened settings, resumed, reached results and replayed with Moonlit retained. Quick Rush starts on landscape. Final reload reports no console errors/warnings; all displayed images loaded. Earlier missing masthead art during asset generation resolved before final capture.

Independent code review found no actionable defects. 66 tests and production build pass. Physical-device touch/audio and every supporting screen at every breakpoint remain outside this pass. No new animation added; existing reduced-motion behavior is preserved. No deployment.

# Neon Field Trip — 2026-10-16

final result: passed

Reference: `/Users/mother/.codex/generated_images/01a1368f-7ce7-7722-a6bd-8509627b4e12/exec-fe1296ea-37a8-4885-8f45-05930c9916cc.png`. Compared in the same inspection with final rendered title, perks and HUD captures. Evidence: `docs/qa/neon-field-trip/` (title, styles, perks, HUD, phone title/perks, landscape title).

Retained acid lime/hot pink/purple screenprint palette, playful happy moth and mushrooms, bold title, bright sticker-like perk cards and readable contrasting HUD values. Intentional shared-layout adaptations: desktop split art/actions and four cards instead of the board's two; phone stacks title and uses a scrollable two-column perk grid. The arena remains unchanged, as approved. No material visual discrepancies within this scope.

Browser checks: all three fixed themes selectable and switch immediately; Neon survives reload; selector reports three Surprise choices. Neon Festival Run starts, qualifies via rehearsal, shows four fully loaded illustrations, accepts Pool Noodle, advances to stage two, pauses/settings/resumes, reaches results and replays with Neon retained. Quick Rush starts in landscape. Checked 1366×768, 390×844 and 844×390; final console has no warnings/errors. Initial missing moth during generation resolved before final capture. Code review found no actionable bugs.

68 tests pass, including persistence and per-run stability for all three themes, all three Surprise outcomes and availability of every referenced completed-theme illustration. Production build and diff whitespace check pass; existing large Phaser bundle warning remains. Not physical-device QA, not every screen at every breakpoint, no browser storage fault injection, and no deployment. Existing reduced-motion behavior retained; no new animations.
