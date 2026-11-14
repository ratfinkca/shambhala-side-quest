# Rave names, character slots and challenge boards

The user requested public names, required first-play naming, editable names, device-only saved characters, three challenge levels, candy/Flow frequency perks and a Fractal concept. Separate online boards for all three challenge levels were explicitly selected. The Prism Party concept remains a discussion artifact; this implementation does not add that bonus.

## Identity

Require a valid 2–16 character rave name before a new production run, including returning players without a name. Resume existing runs without discarding progress. Use the existing character screen; names can be edited afterward. Four local character slots save names, appearance/outfit and SMF souvenir; progress, unlocked ownership, settings and scores remain shared. Reject locked cosmetics on slot load. No slots/appearance or names in playtest telemetry. Public names are posted only with the existing voluntary score action. Old scores keep initials. New submissions snapshot names; edits never rewrite past scores. Duplicates are allowed because this is not an account identity system.

Use one bounded name validator on client and server. Normalize whitespace and Unicode form; reject markup/control characters, inappropriate names and common separator/number evasions. Filtering is an imperfect English-language guard, backed by existing score hiding. Distinguish invalid-name rejection (allow correction) from uncertain network outcomes (retry original immutable payload).

## Challenge

First-timer: 0.7× crowd/targets and 2 friendship passes. Been-around: current crowd/targets and 4 passes. Seasoned-vet: 1.3× crowd/targets and 6 passes. Keep mixed NPC sizes and baseline movement unchanged. Lock selection for the entire run; persist through recovery; Endless caps 16/22/28 dancers. Round targets scale after base musical-duration calculation. Handcrafted bonus objectives remain unchanged for this first pass.

New arcade-v3 / smf-v3 seasons carry challenge on server-issued tickets, receipts, local records, online records and board filters. Existing v1/v2 boards and interrupted saves retain their old rules/contracts. Separate challenge boards were chosen over a shared multiplier board because density and friendship change scoring opportunities nonlinearly. Keep existing mode/venue partitions.

## Perks

Candy Magnet (`candy-magnet`): guarantees the first candy and gives a 50% chance of a second, maximum two per stage. Space actual effects and additional opportunities apart. Flow Finder (`flow-finder`): up to three opportunities; never allow an additional active pickup during Flow and require eight seconds after actual Flow expiry before another appears. Skip opportunities that cannot leave a useful pickup/effect window before the round ends. Both unlock with rave experience (ranks 3 and 4 respectively), cannot stack duplicates, and obey the existing four-perk limit. Preserve deterministic schedules and consumed states through recovery.

## Delivery

Implement and verify locally, preserving the existing invitation/message pass. No publication is requested in this turn. Backend migration/functions must be deployed and verified before a future frontend release. Test both editions, old saves/contracts, difficulty partitioning, profanity rejection and correction, local persistence failures, and perk scheduling under duration boosts. Review responsive first-play, character slots, challenge selection and scores in a disposable local preview.
