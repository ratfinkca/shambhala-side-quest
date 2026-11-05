# Bass-zone baseline and player feedback — 2026-11-04

Published baseline: candy release PR #17 /d00ee62. Investigation only; no bass gameplay changes made.

## Current behavior

- Pressure builds over six active seconds in a bass zone; outside it cools over three seconds. Outside speed is immediately normal. Entering with zero exposure starts at 90% speed.
- At full exposure, core/middle/outer-edge movement is 20%/35%/50%. The zone ends at 110 pixels from each speaker cone; overlap uses the strongest slowdown. Solid cabinets still require navigation around them.
- Ten seconds in bass charges six seconds of Bass Head; Bass Battery multiplies charging by 1.5. Charge is retained outside the zone and between stages. No charging during activation. Activation currently requires 100% and consumes the meter.
- Bass Head restores movement against bass pressure and doubles spark points when both player and spark are in bass. It does not remove mud or bump slowdown. Flow attracts sparks; it does not grant bass immunity.
- Exposure still accumulates during Bass Head. A deterministic inner-zone simulation recorded speed 100% with 1 ms remaining, then 20% at expiry. This is an observation, not proof of a player-reported problem.

## User feedback and design questions

The user's immediate concerns are discoverability for players who skip instructions and an activation button outside the play area. They requested stronger visual communication of the speaker effect, alternatives for activating Bass Head, and consideration of spending a partially filled meter for a shorter ability.

Prioritize communication and control access before changing the baseline slowdown. Earlier preferences still apply: subtle speaker-cone ripples, no permanent mud/bass labels cluttering the field, no harsh strobing, and equal mouse/touch controls.

Activation options under discussion: an accessible floating button inside a low-traffic arena corner, or a two-finger touch shortcut (with discoverability/device tradeoffs). Avoid a double-tap movement gesture that could delay normal destination taps or trigger accidental movement.

Partial spending is a proposal, not implemented: a 25% minimum would buy 1.5 seconds, 50% buys 3 seconds, and a full meter buys the existing 6 seconds. Consume the available charge, keep double zone-spark points, and prohibit recharge while active. The threshold and control approach need selection before implementation. The existing server validates point components rather than the charge timeline; any scoring-policy implication should be reviewed before release, without inventing a stronger anti-cheat guarantee.
