# Festival styles — Forest Freakout first

Status: user approved the three-theme direction and Forest Freakout as the first implementation. This written specification awaits review before the implementation plan.

## Goal and visual target

Give Shambhala Side Quest a distinctive psychedelic forest-festival identity while letting players choose their preferred style. All themes are free, purely visual, and share the same game, controls and layout.

The first displayed concept, Forest Freakout, is the visual target: handmade screenprinted festival poster, deep forest green, coral, butter yellow and violet; expressive rounded display lettering; illustrated moths, mushrooms, ferns and lanterns; printed collectible perk cards. Keep score numerals and instructions in a clear companion font. Decorative texture stays away from small text and the playable arena.

Reference image: `/Users/mother/.codex/generated_images/01a1368f-7ce7-7722-a6bd-8509627b4e12/exec-fadc217d-e1e4-4ab6-bddf-50947e7da24d.png`.

The reference is a board showing multiple screens, not one page to reproduce wholesale. Implement its title, HUD and perk-card treatments as separate real game screens. Other existing screens receive matching typography, colours and controls.

## Delivery sequence

1. Complete Forest Freakout, the reusable theme layer, saved style choice and per-run selection behavior.
2. Add Moonlit Mycelium with its own coherent artwork/fonts/palette using the same interface.
3. Add Neon Field Trip through that interface; verify switching and Surprise mode with all three complete.

This first slice does not claim the other themes are implemented. Show their concept previews as clearly labelled upcoming styles, not selectable incomplete palettes. Surprise mode samples only complete themes; while only Forest Freakout exists, explain that it is currently the only available style. Once others ship, they join the selection pool without changing save format or run logic.

## Player flow

Add a Festival Style entry to the title menu. The style screen presents preview art, name, a short description, selection state, and a Surprise me each run option. Forest Freakout is the default for new and existing players who have no preference.

Selecting a complete fixed theme updates the menus immediately and saves the preference. Selecting Surprise saves that mode, leaving the currently displayed menu theme in place until a new run starts.

Resolve a concrete theme exactly once when creating a new Quick Rush or Festival Run, including Replay. Hold it through gameplay, pause/settings, stage summaries, upgrade choices and results. Never re-roll at a stage transition, resize, render or pause. Surprise samples complete themes uniformly; repeats are allowed rather than implying a fixed rotation.

Style selection is available from the title, not during a run. After a run, the title retains the last resolved style until another selection or run begins. Reloading retains the saved preference; Surprise uses Forest Freakout for the initial menu until the first run is chosen. Reload still abandons an unfinished run, matching current behavior.

## Forest Freakout screens

### Title

Use original generated poster artwork with a distinct SHAMBHALA SIDE QUEST title treatment, lantern-lit forest and tiny festival characters. Festival Run becomes the primary action and Quick Rush the secondary action. Wardrobe, Festival Style, Settings and Scores remain clearly accessible. Buttons are real HTML controls, never flattened into a screenshot. Keep an accessible text title even if the decorative title lettering is an image.

### Gameplay HUD

Use a restrained printed frame and warm readable colours. Preserve score, combo/Flow progress, time, spark qualification, drop timing and Bass Head charge/activation. Keep Bass Head outside the playfield with its 44px minimum touch target. Maintain the arena's geometry and viewport fit. Distinguish stage identity from theme identity: Living Forest, Neon Grove and Sunrise still retain their stage palettes and scenery cues.

Do not recolour important hazards or pickups until their readability has been checked. The first slice themes HTML chrome and decorative edges; it does not replace the procedural gameplay entities or redesign collision geometry.

### Perk cards

Create four matching illustrated cards: Disco Boots, Pool Noodle, Moth Charm and Friendship Bracelet. Each has an item illustration, readable title, numerical effect and clear focus/hover/selection state. Show all available unowned perks, wrapping or scrolling on small screens. Bass Head remains a charged special and never becomes a perk card again.

### Supporting screens

Carry the same type, palette and button treatment through wardrobe, settings, rules, pause, summary, results and scores. Keep wardrobe/avatar preview functional. Maintain score entry, volume controls, settings persistence and discard confirmation.

## Implementation boundaries

Keep Phaser, Vite, plain JavaScript and GitHub Pages. Extend the existing project in place; do not initialize a replacement app.

- `src/themes.js`: registry of theme IDs, display names, readiness, preview/art URLs, font/palette metadata; normalization and pure per-run selection helpers.
- `src/profile.js` and `src/storage.js`: additive validated `themePreference` field in the existing version-1 profile. Old saves default safely without losing scores, audio or wardrobe. Invalid IDs fall back to Forest Freakout. Denied storage retains the selection in memory and reports session-only saving.
- `src/run.js`: store the resolved concrete theme ID on each run; theme metadata never enters scoring or movement rules.
- `src/main.js`: apply the active theme to the document, connect selection to persistence, and resolve it once in new-run creation.
- `src/screens.js`: style screen, themed title and perk presentation using shared screen transitions.
- Theme CSS and local assets: semantic colour/font/art tokens and stable component classes. Avoid copying the screen implementation for each theme.

Generated artwork and fonts are local build assets, with font license files included. Generate clean individual title/background/perk assets from the chosen reference rather than cropping functional buttons from the concept board. Compress appropriately, preload the active title assets, and defer inactive theme art. Keep dynamic descriptions, HUD values and controls as HTML. If an image fails, retain readable text and functional controls on a solid theme surface.

Preserve existing uncommitted Bass Head changes. No candy, music, scoring, unlock or balance changes belong to this slice. Richer music and reactive lighting remain the next roadmap milestone.

## Verification and acceptance

- Pure tests: old profile compatibility, invalid theme fallback, session-only persistence, fixed selection, Surprise sampling only complete themes, and per-run stability through stage transitions.
- Existing gameplay tests and production build pass.
- Browser-check title → style → selection → reload, both game modes, pause/settings, upgrade selection, results and replay.
- Compare Forest Freakout title, HUD and perk screens against the selected concept. Record intentional responsive adaptations; fix material discrepancies before handoff.
- Check desktop 1366×768, portrait 390×844 and landscape 844×390; verify scrolling, readable text, unclipped buttons, keyboard focus and arena fit.
- Check reduced motion, console errors and image/font loading. Keep transient effects subtle and preserve the existing reduced-motion behavior.
- First-slice handoff is a local playable Forest Freakout preview with an honest style menu. Deployment is a separate release step after review.

## Deferred decisions

Moonlit Mycelium and Neon Field Trip get their asset passes after Forest Freakout establishes the shared component structure. Rave-experience unlock rules, endless-mode perk limits, candy effects and richer music remain on their existing future tracks.
