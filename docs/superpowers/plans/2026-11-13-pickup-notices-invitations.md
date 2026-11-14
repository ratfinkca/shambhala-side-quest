# Pickup notices and fresh invitations

User requested a follow-up pixel styling pass for on-field announcements, short message lifetimes, and a fresh invitation for every bonus visit. Fractal pyramid concepts are discussion only in this pass.

## Changes

- Use compact pixel notice cards for generic/SMF pickups. Restyle the invitation envelope/label and crowd reactions with the existing pixel rendering helpers and Silkscreen font.
- All SMF pickup/activity notices expire: 3 seconds of active play, or the existing 2.4 seconds for Flow/candy. Replacement messages own their lifetime. Pause freezes expiry; stage changes clear old text. Putting uses its monotonic activity clock instead of the looping music timer.
- Remove the duplicate persistent invitation banner. Keep delivery/putting objectives in the existing objective panel.
- Discovery remembers the venue's identity. Each qualifying parent-stage round must earn its own invitation; entering consumes that visit offer. Subsequent Festival runs and Endless loops require a fresh pickup. Catalogue cards reveal known places but no longer bypass the invitation requirement.
- Cosmetics remain permanent. Existing interrupted bonus visits still resume; an already-offered invitation from an old save remains valid once.

## Verification

- Regression coverage: message expiry, replacement, pauses, new rounds and putting clocks; invitations on discovered stages, consumption, repeated runs/Endless loops, old-save migration and recovery.
- Full test suite and both edition builds, followed by an isolated local browser check at phone size.
- No backend/score payload changes. This is a local preview; publishing requires a separate request.

### Completed checks

- All 926 tests passed; generic and SMF builds, asset allowlists and static references passed.
- Independent code review found no remaining blockers.
- Isolated browser playtest collected a real invitation, confirmed the post-expiry screen had no notice or duplicate banner, entered Rabbit Hole, and returned without a second visit offer. The discovered map card now requires a fresh invitation and has no bypass button.
- Checked the map and bonus flow at a 390 × 844 viewport; browser warnings/errors were empty. The active invitation notice was not captured before expiry; its duration is covered by the clock regression tests. Physical-phone readability and feel remain for user playtesting.

## Fractal pyramid proposal (not implemented)

**Prism Party** is the recommended direction. The party remains visible outside until the player walks up a short ramp; the near face becomes a cutaway and the camera settles on a triangular dancefloor. Dance through three illuminated sections over generous musical phrases, with a small crowd providing the navigation challenge. Each completed section charges a pyramid face; finishing lights the whole structure and earns a prism-themed cosmetic.

Alternatives: **Echo Dance**, repeating short sequences of floor lights, trades free movement for a memory puzzle; **Light Weaver**, charging neon edges through smooth passes, fits existing play well but is less distinct. Avoid new jumping/3D climbing physics, precision beat tapping, and leaderboard point inflation. Exact rules, reward and visual references remain undecided.
