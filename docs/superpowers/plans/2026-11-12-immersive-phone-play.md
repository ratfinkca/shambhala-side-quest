# Immersive phone play implementation plan

> **For agentic workers:** Use subagent-driven-development for the independent UI, movement and action-button tasks; root integrates the run lifecycle and verifies the playable result.

**Goal:** Make the existing SMF game fill the available display while playing, with floating HUD/actions and a touch-origin joystick, in portrait and landscape.

**Architecture:** Retain the existing Festival/Quick Rush/Endless and bonus scenes. Expand the live arena to the visual viewport; overlay existing HUD elements, pause and action buttons. Retain the fixed gameplay world and existing follow camera. Shared input owns each touch separately. No separate replacement game or route that drops established features.

**Tech Stack:** Existing Phaser, DOM/CSS and Vite. No new packages.

**Spec:** Approved conversation design: edge-to-edge game world, floating score/stamina/pause/Bass Head, settings inside Pause, portrait/landscape reframing of the same run, floating joystick at finger contact. Prior approved faster bursts/stamina and completed screen-direction swipes remain.

## Global constraints

- Local preview only, no commit, merge or public deployment requested.
- Preserve all current dirty work, both edition build isolation, scores, consent, progression, recovery and stage-end click gating.
- SMF full game is the phone preview; generic remains compatible with shared controls.
- Keep tap, swipe and keyboard selectable. No optional swipe pad.
- Treat iPhone Home Screen launch as browser-free presentation; ordinary Safari still retains its own browser chrome.
- No rotation lock, camera tilt or camera rotation. Rotation pauses a live run and clears held input without resetting progress.
- Real-device multitouch and installed iOS acceptance remain distinct from emulated browser sizing.

## Review focus

- Secondary Bass touch must not steal/cancel the steering finger; synthesized click must not activate twice.
- Rotation during movement or putting must clear the old gesture and preserve the run.
- Safe areas, portrait/short landscape and large text must leave Pause and all action targets reachable.
- Bonus objectives/putting controls and stage-end Proceed remain visible and deliberate.
- Menus/settings must remain scrollable; the live canvas must not scroll the page or capture button touches.

## Tasks

### 1. Immersive HUD and shell
- [x] Update `src/smf-tour/ui.js` and styles: floating compact HUD, Pause, bottom action space, readable bonus objectives, pause settings entry and stable IDs.
- [x] Keep title/mode/upgrade/results flows intact; live scene consumes the display and menu screens can scroll.
- [x] Verify existing UI tests and desktop/390×844/844×390 browser layouts.

### 2. Floating joystick and handedness
- [x] Update shared movement input and controller: clearly marked outer sprint ring, inner precision movement, independent touch ownership and mirrored actions.
- [x] Add hand preference/settings, retain sensitivity and current control selections. Preserve swipe semantics and normal movement with empty stamina.
- [x] Add behavioral tests for outer-ring transitions, release/cancellation, handedness validation and prior movement regressions.

### 3. Multitouch action button
- [x] Add reusable pointer-owned action binding with secondary-touch activation, cancellation and keyboard/AT click fallback.
- [x] Test steering held while Bass is pressed/released, no duplicate activation and stale release after pause.
- [x] Root wires Bass in SMF, generic and practice without changing Bass charge/effect balance.

### 4. Viewport and run integration
- [x] Root updates SMF entry/layout to size the live arena to the visual viewport, set presentation/hand states, and pause safely on actual orientation changes.
- [x] Provide a DEV rehearsal link that opens the real game with joystick/follow defaults for this preview, leaving normal saved preferences alone.
- [x] Preserve pause/settings return, bonus transitions and the separate stage-finish confirmation.
- [x] Validate run-preserving rotation and viewport helper behavior, full tests and both edition builds.

### 5. Handoff
- [x] Browser playtest real Quick Rush in portrait/landscape, compare swipe/stick through Pause, inspect screenshots/logs, leave phone preview running.
- [x] Record exact local URLs and limits; no claim of physical iPhone acceptance until owner tests.

## Verification — 2026-11-12

- Full automated suite: 660 passed; generic and SMF edition build/asset-isolation checks passed. After moving the LAN storage notice into Pause, 27 focused action/viewport/UI checks passed.
- Live browser: real Quick Rush at 390×844 and 844×390, joystick and swipe movement, mirrored actions, Pause → Settings → Back → Resume, Bass Head activation, active rotation preserving timer/progress, and protected stage-end Continue → results all observed. No warnings/errors in the checked phone-preview tab.
- LAN URL responds and renders the immersive game: `http://192.168.14.143:5194/?rehearsal&tour&phone`. Local Mac URL: `http://127.0.0.1:5193/?rehearsal&tour&phone`.
- Phone preview uses a separate practice profile, joystick/follow defaults and disabled online services. LAN HTTP lacks browser locking, so keep the page open; its session-saving warning stays on menus and inside Pause, not over live play.
- Multitouch pointer ownership/cancellation is covered by automated input tests; physical iPhone two-thumb feel, safe areas and installed Home Screen behavior await the owner's test.
- Bonus/putting overlay stacking and short-viewport scrolling received a separate code review; no new end-to-end bonus-route browser playthrough in this pass. Existing regression suite passed.
- No commit, PR, merge or public deployment performed.

## Phone playtest follow-up — 2026-11-13

The owner accepted fullscreen framing, edge panning and all three movement styles on their iPhone. Feedback requests a deliberate progressive joystick sprint and reports an enduring Flow message. Quick Rush venue variety was raised as a question, not a rules migration request.

- [x] Fix the status announcement lifecycle: Flow and candy messages briefly announce pickup, expire on active play time/effect expiry and never erase later bonus instructions. Verify the actual Flow timer independently.
- [x] Preserve normal movement through a wider joystick range. Builder tuning at 100% sensitivity: normal speed by 42px, sprint starts at 76px, smooth ramp reaches the unchanged 480 maximum at 112px. Sensitivity rescales all radii; Shift/explicit Sprint still means full boost. Test proportional stamina, easing back, empty stamina and independent touch ownership.
- [x] Add optional `movementMode` (`tap`, `swipe`, `stick`) to SMF stage/run playtest summaries and update the public notice. Record selected style at summary time only; do not infer session-wide usage or effectiveness. Preserve opt-in and rehearsal upload suppression. Keep old event shapes valid.
- [x] Run focused regressions, full suite, both builds and native browser Flow collection/expiry. Leave the existing Wi-Fi preview available for another physical phone sprint-feel test.

Release note: deploy the updated `smf-playtest` validator before a frontend release using this metadata. The existing private JSON event storage can retain it without a migration. This follow-up does not deploy services or frontend. Generic telemetry is unchanged.

Quick Rush remains the authored Pagoda 60-second/32-bar profile. Other venues have different phrase durations and crowd layouts; a future shuffled route needs persisted venue identity, matching score validation and fair per-venue scoring/boards before release. Proposed experience: shuffled six venues with no immediate repeat; do not silently mix those scores into today's Pagoda board.


Follow-up verification: 676/676 tests passed, both edition builds/asset checks passed and diff checks passed. Native browser Quick Rush pickup confirmed the Flow announcement was already cleared while the boost HUD still showed 1 second; afterward the HUD returned to Find Flow with no enduring announcement. No browser warnings/errors. Settings displayed the progressive sprint guidance. Final review also fixed a mixed keyboard/joystick case: a newly touched stick is released when held keyboard movement owns steering, without accidentally promoting partial boost to full sprint. Physical iPhone tuning of the new 76–112px range remains the next owner playtest. All changes remain local.
