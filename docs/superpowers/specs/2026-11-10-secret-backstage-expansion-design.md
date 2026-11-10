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
| AMP | Backstage vendor; final venue name undecided | S2 | Grilled-cheese vendor offers a smooth-pass challenge; success earns grilled cheese and a cheese totem |

The DJ identities above are the owner's project direction. Their inclusion does not assert any specific recording, artwork or performer permission has been obtained. “The Melt” was a builder-suggested working name for AMP backstage, not an owner-selected name.

The owner also selected main soundtrack artist targets: KR3TURE / Living Room, The Funk Hunters / Fractal, Melo.Nade / Grove, AHEE / AMP, BTSM / Pagoda, and Phibes / Village. The linked track suggestions in the conversation are audition candidates, not selected/licensed soundtrack assets or analyzed cue sheets. Keep original synthesis and private local-file rehearsal available; choose and review phrase-complete excerpts before changing any canonical main clock.

## Approaches and current choices

- **Original three secrets:** the owner welcomed distinct small bonus parties with cosmetic rewards. Carry the earlier trinket / bloom / party-meter concepts into their design previews. Exact objectives, thresholds and reward artwork are still builder proposals to review in play.
- **Villagio:** a full golf game immediately versus a small themed dance space first. The owner's clarification selects the small space first, with a couple of holes; preserve room to add a simple cosmetic-winning putting activity later. Do not make golf physics, three holes, stroke limits or a particular aiming control an already-approved requirement. The earlier three-hole proposal is superseded.
- **AMP backstage:** the earlier sandwich-delivery proposal is superseded by the owner's smooth-pass challenge. Reuse the existing movement and near-pass feedback, with the vendor awarding the sandwich and totem. Do not add sandwich routing, cooking, order queues or timed service pressure.

## Proposed first-preview behavior

### Villagio

Build a compact dance clearing with two visible putting holes, playful miniature lounge details and the chicken tube slide. The owner's slide and golf theme are defining features; extra fountains, gold signage, reward names and exact motifs are creative proposals. Check readability at phone size and preserve clear dance routes around the greens.

For the first art/space preview, no putting challenge or reward can be represented as implemented. The later mini-game should remain short, approachable with mouse or touch and optional; controls, success criteria and cosmetic are still to be settled. A celebratory slide ride may supply the finale. Chicken sounds must respect Effects volume and use brief cues; reduced motion needs a restrained slide/arrival alternative.

### AMP backstage

Suggested initial challenge: accept the vendor's invitation and make **three smooth passes around three different dancers** during that visit. Use the existing successful near-pass event; do not invent an unexplained tighter distance threshold. A visible `Smooth passes 0 / 3` counter and familiar rings make the objective understandable without reading a long help screen.

Three distinct dancers and non-resetting progress are builder recommendations, not selected balance values. Bumping should not erase all successful passes in this forgiving bonus activity. Show the vendor's success cue, sandwich celebration and cheese-totem unlock when the challenge completes. The sandwich is a reward presentation, not a new main-run stat boost or consumable inventory item. Exact cheese-totem art remains to be reviewed.

## Reward and fairness boundaries

Preserve the original three secrets' agreed first-completed-visit souvenir, with additional cosmetic variants as optional challenges. Distinguish the persistent stage discovery from a prize earned within it.

For the new activity prizes, merely entering or waiting out a visit does **not** earn the challenge reward: AMP's cheese totem requires its smooth-pass objective; any later Villagio putting prize requires that mini-game's agreed success condition. The existing blanket souvenir-on-completion wording must not silently auto-award these activity prizes. Additional discovery stamps or participation souvenirs are not introduced by this clarification.

No main score, qualification, Rave XP, extra perk choice, Bass Head charge or temporary power carries out of a bonus visit. The main run is parked; leaving, timing out or not completing the activity does not fail it. Persist discovery, challenge completion and one-time cosmetic receipts atomically; repeats/recovery cannot duplicate an award. Reward feedback should acknowledge an already-owned item rather than drop a duplicate.

The existing parent-clear invitation/revisit flow remains the default for all five. With Villagio after the final Village clear, Festival completion is already earned: an optional visit returns to final results/save, not another main stage or a perk choice. In Endless it returns to the appropriate parked loop-transition decision. This terminal-parent handling must be covered explicitly when the visit flow is implemented.

## Delivery sequence and open details

1. Prepare reference-led concepts for the original three; build Rabbit Hole's first disposable art/activity/reward preview, then Secret Garden and Ikigai Mori. Names remain concealed in normal player-facing catalogues until actual discovery is wired.
2. Add the two new backstage spaces with their owner-selected DJ identities. Villagio's initial slice is its small themed area; AMP's slice includes the vendor/smooth-pass reward interaction.
3. Settle and build Villagio's putting mini-game as its own small follow-up. Its control scheme and reward condition remain open, not prerequisites to the first art preview.
4. Integrate all five with the six-main run, discovery, rewards, return/recovery and final-stage results. An isolated rehearsal is not evidence that this full journey works.

Open content details: final AMP backstage name; actual visual references for each small space; exact soundtrack selection/cues and permissions; final reward sprites; near-pass target balance; Villagio putting controls/qualification/timing. None require inventing a DJ identity: all five have now been supplied by the owner.

No automatic publishing, artist outreach, account integration or production reward grants follow from this planning update.
