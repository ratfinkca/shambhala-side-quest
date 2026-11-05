# M4 bass communication and activation preview

User approved: on-field Bass Head button, partial charge activation and clearer speaker/player visuals. **Keep the slowdown as is.** This is a local preview; publication requires a separate ship request.

- Move the native Bass Head button from the footer into an arena corner, with a thumb-sized touch target, visible charge ring and short available-duration label. Keep keyboard B and native Enter/Space activation. Normal pointer/touch movement must not receive button presses. No double-tap or two-finger gesture in this slice.
- Minimum charge is 25% (2,500 ms of the existing 10,000 ms meter). Spend the entire available meter for proportional protection: 25% → 1.5 s, 50% → 3 s, 100% → 6 s. No charging during activation. Retain existing bass immunity, double zone-spark points, Bass Battery rate and stage carry rules.
- Preserve the six-second exposure buildup, three-second cooldown, radial slowdown, post-ability pressure and mud/bump behavior exactly. The observed expiry speed cliff is deliberately not tuned here.
- Draw restrained expanding ripples from speaker cones. Give the player a matching amber pressure cue near their feet, building with existing exposure. While Bass Head is active, draw a distinct mint protective aura and steady the player's decorative shake. Objects in bass still vibrate. No field labels, broad opaque zone fills, strobing or hitbox changes.
- Reduced motion uses stable speaker/player marks; functional charge/pressure/remaining-time state still updates. Keep graphics bounded and compatible with Canvas.
- Add DEV-only Bass lab scenarios for fresh pressure, 25/50/100% charge and outside-zone use. Practice uses real rules with a disposable profile and score/XP/analytics disabled; production excludes fixtures.
- Existing arcade point components remain unchanged. Verify partial-boost scores with current validators and preserve playtest event schema. No new packages, migrations or backend functions expected.

Implementation calls: retain the existing procedural art and native DOM button; keep the layout stationary so players can build muscle memory; use separate amber pressure/mint protection colours with distinct shapes and accessible button descriptions.

Alternatives discussed: an on-field button was selected over two-finger touch activation for discoverability and input parity. Double-tap activation was rejected because it conflicts with destination steering. Full-meter-only activation was replaced by the approved 25% minimum/proportional duration.

Preview placement decision: use upper-right scenery after phone QA showed the lower-right control covering normal spark space. Smaller screens retain a minimum 56px target; the smallest layout straddles the arena edge slightly. This is a placement choice, not an extra gameplay rule.
