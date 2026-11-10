# Villagio putting preview

## Intent and scope

The owner approved building the little two-hole Villagio putting game so players can win a cosmetic. Preserve the accepted illustrated clubhouse, two greens and chicken tube. This is the next disposable DEV-only SMF rehearsal; permanent wardrobe receipts and full-tour discovery/return remain later work. No production deployment, backend, score, XP or profile writes.

## Approaches and first-preview choices

1. **Pull back and release (selected builder default):** drag anywhere on the canvas; direction opposite the drag aims the ball and distance sets power. Zoom the active green to make the ball and cup legible on phones. One gesture gives mouse and touch the same normalized control, without requiring a finger on the ball.
2. **Tap aim plus separate power:** more explicit but adds controls and an extra interaction for every shot. Retain as a possible playtest follow-up.

The owner requested implementation and had previously approved the two-hole setting and earned cosmetic. Controls, eight-shot allowance, no deadline and golden chicken totem are explicit builder proposals for this reversible first preview, not previously settled release rules. The owner responded to the control/rule proposal: “Choose what feels best and build it.” Proceed with the recommended default and use playtesting to refine the feel.

## Play loop

- Start visit opens hole one in a close view. The existing illustrated green is the course; its low rim rebounds the ball. Hole two reverses the tee/cup approach. Decorative flags, flowers and dancers never obstruct a shot.
- Drag anywhere inside the canvas, opposite the desired shot. A line at the ball and a power indicator show the result. Release inside the canvas to shoot. Short taps cancel without spending a stroke; dragging back to the origin cancels. Only one gesture and one rolling ball at a time.
- Eight total strokes for the two holes. A cup accepts a slow ball within its mouth; a fast pass does not automatically sink. A sunk first hole banks progress and offers an explicit Next green button. No automatic camera move during a drag or while the ball rolls.
- Sinking both holes by the eighth stroke wins the **Golden Chicken Totem**, displayed on the avatar back in the full room and in a clear reward card. The eighth stroke is allowed to finish before deciding failure. Merely visiting, waiting or walking over the cup never wins.
- Exhausting the allowance without both cups shows an encouraging retry result; Start fresh resets both holes and strokes. No permanent prize in this rehearsal; copy must say the cosmetic is for trying here, not saved.
- No countdown: the original 24-bar Villagio arrangement loops on complete phrases. Pausing/tab hiding freezes ball, camera, music and lighting. Switching venue, restart, pause or pointer cancellation discards any pending shot without charging a stroke.

## Controls and presentation

- Zoomed active-green view uses the existing raster artwork, no new flat course backdrop. The full club returns for the prize.
- HUD shows holes sunk, current hole and shots remaining. Guidance is short and visible. Preview is playable with touch/mouse plus keyboard aim/power and a Putt button.
- Pointer power uses canvas-normalized distance, not device pixels or camera zoom. Reject second fingers, non-primary mouse buttons and release outside the canvas. Pause during rolling preserves motion for resume; pause during aiming cancels that aim.
- Add a clear ball shadow, a cup marker exactly aligned to the painted cup and a restrained aiming line. Native vector marks are functional overlays. Reduced motion disables decorative movement and camera tweening (use direct camera framing for all players initially).
- Reuse separate Music and Effects controls; ball-hit, cup and reward cues respect Effects/mute. No chicken squawk/slide ride in this step.

## Implementation boundaries

Use a pure deterministic putting model with fixed time steps, bounded shots, ellipse rim collision and low-speed cup capture. Rendering/input live in a dedicated module; the shared bonus entry coordinates it. Keep ordinary GameScene movement/scoring/timer inactive for Villagio, so shots cannot move the dancer or time out. Other bonus rooms retain their existing round behavior.

Builder owns physics feel, exact tee/rim/cup measurements, camera framing and totem drawing. Align those to the accepted asset and validate by playing both holes at desktop and 390px phone viewport. Automated tests must cover actual successful shots, overspeed misses, rebounds, final-stroke outcome, pause/cancel/reset, duplicate reward prevention and deterministic frame splitting. Production builds must continue excluding bonus code/assets.
