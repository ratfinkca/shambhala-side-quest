# SMF secret and backstage direction

Date: 2026-11-10. Status: owner-selected content direction with implementation details identified below as proposals. This updates the venue/reward scope of the [edition split](2026-11-06-edition-split-design.md) and [route rules](2026-11-06-smf-route-rules-design.md); it does not change game code, production assets or scored rules. The current catalogue still has nine entries and playable rehearsal still has only the six main venues.

## Owner decisions

The intended content now comprises six main venues and five optional secret/backstage visits. Keep each bonus venue's name and identifying art concealed until discovered. Match the main-stage art quality, using available real references and greater creative freedom for the bonus activity, animated setting and rewards. Thin or older references must remain labelled as such, not presented as confirmed 2026 structures.

| Parent | Secret / backstage | Owner-selected DJ identity | Activity direction |
|---|---|---|---|
| Living Room | Rabbit Hole | Hoola b2b Lioness | Previously welcomed lost-and-found party / trinket trails; first full bonus preview |
| Grove | Secret Garden | Footprints | Previously welcomed seed collection / garden bloom celebration |
| Pagoda | Ikigai Mori | Soup | Previously welcomed intimate crew afterparty / smooth-pass party meter |
| Village | Villagio | Subvert | Small putt-putt-themed dance area with a couple of holes and a twisty tube slide full of squawking chickens; a putting mini-game to earn its cosmetic is a likely later addition |
| AMP | Backstage vendor; final venue name undecided | S2 | Pick up a sandwich from the vendor and deliver it by smooth-passing its designated recipient. Wrong passes give it away without progress; bumps drop only the held sandwich. Successful deliveries earn your own grilled cheese and cheese totem. |

The DJ identities above are the owner's project direction. Their inclusion does not assert any specific recording, artwork or performer permission has been obtained. “The Melt” was a builder-suggested working name for AMP backstage, not an owner-selected name.

The owner also selected main soundtrack artist targets: KR3TURE / Living Room, The Funk Hunters / Fractal, Melo.Nade / Grove, AHEE / AMP, BTSM / Pagoda, and Phibes / Village. The linked track suggestions in the conversation are audition candidates, not selected/licensed soundtrack assets or analyzed cue sheets. Keep original synthesis and private local-file rehearsal available; choose and review phrase-complete excerpts before changing any canonical main clock.

## Approaches and current choices

- **Original three secrets:** the owner welcomed distinct small bonus parties with cosmetic rewards. Carry the earlier trinket / bloom / party-meter concepts into their design previews. Exact objectives, thresholds and reward artwork are still builder proposals to review in play.
- **Villagio:** a full golf game immediately versus a small themed dance space first. The owner's clarification selects the small space first, with a couple of holes; preserve room to add a simple cosmetic-winning putting activity later. Do not make golf physics, three holes, stroke limits or a particular aiming control an already-approved requirement. The earlier three-hole proposal is superseded.
- **AMP backstage, latest owner refinement:** combine delivery with precision smooth passes. This supersedes both the generic sandwich-delivery suggestion and the subsequent untargeted pass-count challenge. The vendor supplies one sandwich for a specific, visibly recognizable recipient. Correct smooth pass delivers it; a wrong smooth pass gives it to the wrong dancer, who is happy but contributes no challenge progress; any bump drops the held sandwich. Neither mistake resets completed deliveries. Reuse familiar movement; cooking, multiple simultaneous orders and service-pressure queues are not part of this direction.

## Proposed first-preview behavior

### Villagio

Build a compact dance clearing with two visible putting holes, playful miniature lounge details and the chicken tube slide. The owner's slide and golf theme are defining features; extra fountains, gold signage, reward names and exact motifs are creative proposals. Check readability at phone size and preserve clear dance routes around the greens.

For the first art/space preview, no putting challenge or reward can be represented as implemented. The later mini-game should remain short, approachable with mouse or touch and optional; controls, success criteria and cosmetic are still to be settled. A celebratory slide ride may supply the finale. Chicken sounds must respect Effects volume and use brief cues; reduced motion needs a restrained slide/arrival alternative.

### AMP backstage

**Owner-selected delivery loop:** get one sandwich from the vendor, navigate to the correct recipient, then smooth-pass them to hand it over. Recipients need distinct sprites/identities; any dancer cannot count as a valid delivery. The player must avoid both bumps and accidental smooth passes around other dancers while carrying.

| Event | Sandwich in hand | Delivery progress | Feedback |
|---|---|---|---|
| Collect from vendor while empty-handed | One fresh sandwich | Unchanged | Show the carried sandwich and intended recipient |
| Clean smooth pass around the designated recipient while carrying | Consumed by successful handoff | +1 completed delivery | Recipient celebrates; clear success cue |
| Smooth pass around another dancer while carrying | Given away / consumed | Unchanged | Wrong dancer is happy; show that the order is still outstanding |
| Bump into any dancer while carrying | Dropped / lost | Unchanged | Brief sandwich-on-ground animation; player is empty-handed |
| Pass or bump while empty-handed | Remains empty | Unchanged | No delivery or repeated loss event |

Already-completed deliveries are banked for that visit. A wrong recipient or bump costs only the current sandwich, never all progress. There is no handoff just for walking into a recipient or tapping their portrait. A replacement must come from the vendor; a ground-drop visual is not an additional collectible.

**Builder recommendations for the preview:** start with three successful deliveries, retaining progress after mistakes. Keep the same outstanding recipient after losing a sandwich, so the player can return for a replacement rather than reroll the order. Choose the next recipient only after a correct delivery. Exact delivery count, repeat-recipient policy, recipient movement and challenge duration remain playtest choices, not owner-selected values.

**Readable target art:** use a small set of recognizable hungry-recipient sprites with different silhouettes/accessories. Match the current recipient's portrait and a shape/icon on the vendor's order cue and the recipient's overhead badge; do not rely on colour alone. Keep ordinary dancers visually distinct from order targets. A visible sandwich on the player makes carrying versus empty-handed clear. Use `Delivered 0 / 3` for the suggested counter, not the superseded generic `Smooth passes` count. Keep the arena free of persistent text labels and give targets enough surrounding space to complete a clean pass at phone size.

Use the familiar clean-pass distance feedback rather than introducing an unexplained tighter ring. Delivery classification needs a stable actual dancer identity; today's `round:closepass` does not include that ID. One sandwich can resolve only once, even if multiple encounter events occur close together. Track actual contact rather than only today's `round:bump` notification, which is throttled and can be suppressed by shields. A physical bump must not become a successful delivery because a perk suppressed its usual penalty; normal perk effects remain unchanged outside the held item. Collision versus handoff ordering and encounters already in progress at pickup need explicit tests before implementation acceptance. Save relevant encounter state with the order to prevent reloading from replaying a pass.

At the delivery goal the vendor awards the player's own grilled cheese and the cheese totem. The carried sandwich exists only inside this activity; neither it nor the final meal grants a main-run stat boost, extra XP or transferable inventory. Preserve the outstanding order, held/empty state, completed-delivery count and prize receipt through pause/recovery, so reload neither replenishes a lost sandwich nor repeats a delivery/prize. Exact cheese-totem artwork and final reward presentation remain to be reviewed.

## Reward and fairness boundaries

Preserve the original three secrets' agreed first-completed-visit souvenir, with additional cosmetic variants as optional challenges. Distinguish the persistent stage discovery from a prize earned within it.

For the new activity prizes, merely entering or waiting out a visit does **not** earn the challenge reward: AMP's cheese totem requires completed deliveries to the correct recipients using smooth passes; any later Villagio putting prize requires that mini-game's agreed success condition. The existing blanket souvenir-on-completion wording must not silently auto-award these activity prizes. Additional discovery stamps or participation souvenirs are not introduced by this clarification.

No main score, qualification, Rave XP, extra perk choice, Bass Head charge or temporary power carries out of a bonus visit. The main run is parked; leaving, timing out or not completing the activity does not fail it. Persist discovery, challenge completion and one-time cosmetic receipts atomically; repeats/recovery cannot duplicate an award. Reward feedback should acknowledge an already-owned item rather than drop a duplicate.

The existing parent-clear invitation/revisit flow remains the default for all five. With Villagio after the final Village clear, Festival completion is already earned: an optional visit returns to final results/save, not another main stage or a perk choice. In Endless it returns to the appropriate parked loop-transition decision. This terminal-parent handling must be covered explicitly when the visit flow is implemented.

## Delivery sequence and open details

1. Prepare reference-led concepts for the original three; build Rabbit Hole's first disposable art/activity/reward preview, then Secret Garden and Ikigai Mori. Names remain concealed in normal player-facing catalogues until actual discovery is wired.
2. Add the two new backstage spaces with their owner-selected DJ identities. Villagio's initial slice is its small themed area; AMP's slice includes vendor pickup, recognizable recipients, sandwich handoffs/losses and delivery reward interaction.
3. Settle and build Villagio's putting mini-game as its own small follow-up. Its control scheme and reward condition remain open, not prerequisites to the first art preview.
4. Integrate all five with the six-main run, discovery, rewards, return/recovery and final-stage results. An isolated rehearsal is not evidence that this full journey works.

Open content details: final AMP backstage name; actual visual references for each small space; exact soundtrack selection/cues and permissions; final reward/recipient sprites; delivery target count and pacing; Villagio putting controls/qualification/timing. None require inventing a DJ identity: all five have now been supplied by the owner.

No automatic publishing, artist outreach, account integration or production reward grants follow from this planning update.
