# SMF secret and backstage direction

Date: 2026-11-10. Status: owner-selected content direction with isolated DEV-only previews for all five bonus spaces; remaining rules are identified below as proposals. This updates the venue/reward scope of the [edition split](2026-11-06-edition-split-design.md) and [route rules](2026-11-06-smf-route-rules-design.md). Production assets and scored rules remain unchanged. The normal catalogue still has nine entries with secrets concealed, and the six main rehearsals remain available. No preview implements persistent discovery or a full-tour visit.

## Owner decisions

The intended content now comprises six main venues and five optional secret/backstage visits. Keep each bonus venue's name and identifying art concealed until discovered. Match the main-stage art quality, using available real references and greater creative freedom for the bonus activity, animated setting and rewards. Thin or older references must remain labelled as such, not presented as confirmed 2026 structures.

| Parent | Secret / backstage | Owner-selected DJ identity | Activity direction |
|---|---|---|---|
| Living Room | Rabbit Hole | Hoola b2b Lioness | Previously welcomed lost-and-found party / trinket trails |
| Grove | Secret Garden | Footprints | Previously welcomed seed collection / garden bloom celebration |
| Pagoda | Ikigai Mori | Soup | Previously welcomed intimate crew afterparty / smooth-pass party meter |
| Village | Villagio | Subvert | Small putt-putt-themed dance area with a couple of holes and a twisty tube slide full of squawking chickens; two-hole putting now earns a temporary Golden Chicken Totem in rehearsal |
| AMP | Backstage vendor; final venue name undecided | S2 | Pick up a sandwich from the vendor and deliver it by smooth-passing its designated recipient. Wrong passes give it away without progress; bumps drop only the held sandwich. Successful deliveries earn your own grilled cheese and cheese totem. |

The DJ identities above are the owner's project direction. Their inclusion does not assert any specific recording, artwork or performer permission has been obtained. “The Melt” was a builder-suggested working name for AMP backstage, not an owner-selected name.

The owner also selected main soundtrack artist targets: KR3TURE / Living Room, The Funk Hunters / Fractal, Melo.Nade / Grove, AHEE / AMP, BTSM / Pagoda, and Phibes / Village. The linked track suggestions in the conversation are audition candidates, not selected/licensed soundtrack assets or analyzed cue sheets. Keep original synthesis and private local-file rehearsal available; choose and review phrase-complete excerpts before changing any canonical main clock.

## Approaches and current choices

- **Original three secrets:** the owner welcomed distinct small bonus parties with cosmetic rewards. Carry the earlier trinket / bloom / party-meter concepts into their design previews. Exact objectives, thresholds and reward artwork are still builder proposals to review in play.
- **Villagio:** a full golf game immediately versus a small themed dance space first. The owner's clarification selects the small space first, with a couple of holes; preserve room to add a simple cosmetic-winning putting activity later. The later mini-game request authorizes a first preview; its pull-back controls and eight-shot allowance are builder-selected playtest choices, not permanent release rules. The earlier three-hole proposal is superseded.
- **AMP backstage, latest owner refinement:** combine delivery with precision smooth passes. This supersedes both the generic sandwich-delivery suggestion and the subsequent untargeted pass-count challenge. The vendor supplies one sandwich for a specific, visibly recognizable recipient. Correct smooth pass delivers it; a wrong smooth pass gives it to the wrong dancer, who is happy but contributes no challenge progress; any bump drops the held sandwich. Neither mistake resets completed deliveries. Reuse familiar movement; cooking, multiple simultaneous orders and service-pressure queues are not part of this direction.

## Preview behavior and remaining rules

### Rabbit Hole, Secret Garden and Ikigai Mori

**Implemented isolated previews (2026-11-10):** `?rehearsal&bonus=rabbit-hole`, `secret-garden` or `ikigai-mori` in the DEV SMF build, with a shared selector that also includes Villagio. Rabbit Hole follows six sequential party trinkets and shows temporary rabbit ears. Secret Garden carries three individual seeds back to a planting bed and shows a glowing blossom. Ikigai Mori counts clean passes around five distinct dancers, lighting lanterns and showing a temporary lantern totem. Pausing freezes the visit; switching, restarting or reloading clears it. Music/effects controls use disposable rehearsal settings.

Replaceable generated illustrations and animated lamp, flower and lantern accents distinguish the rooms. They are creative interpretations, not confirmed 2026 structures. Each has an original synthesized phrase arrangement; the named DJ's recording is not included. All 448 tests, the production build and both edition checks passed. Native Chrome play completed Rabbit Hole and Secret Garden at 390×844 and Ikigai Mori on desktop. Physical-phone play, listening and the owner's venue-reference review remain open. [Implementation plan](../plans/2026-11-10-bonus-venue-previews.md).

The 6/3/5 activity targets and cosmetic sketches are first-preview choices. The rehearsal only displays its souvenir after completing its activity, with no permanent grant. This must **not** silently replace the original three's first-completed-visit souvenir release plan; final base souvenirs and optional challenge variants remain a separate integration decision.

### Villagio

**Implemented illustrated putting preview:** select Villagio or use `?rehearsal&bonus=villagio`. A replaceable illustrated miniature club surrounds two walkable putting greens and a glossy twisty tube, with native animated chickens, fountain glints and warm light chasers. This replaces the initial flat procedural art and matches the other illustrated bonus rooms. The original exploration checklist has been replaced with two sequential putting holes. Sink both within eight total shots to try the Golden Chicken Totem; merely entering or waiting never awards it. Original Subvert-labelled rehearsal synthesis is included; no Subvert recording is bundled. The owner's slide and golf theme are defining features; club facade, lights and exact motifs are creative proposals.

Pull-back/release controls work anywhere on the canvas, with a close view of the active green and optional button/keyboard controls. The music loops without a countdown. A player slide ride and squawk sounds are not implemented. The preview is disposable: the totem is displayed for this visit only; permanent qualification and receipts will be integrated with the tour. See the [putting design](2026-11-10-villagio-putting-design.md). A celebratory slide ride may supply the finale. Future chicken sounds must respect Effects volume and use brief cues; reduced motion needs a restrained slide/arrival alternative.

### AMP backstage

**Implemented isolated preview (2026-11-10):** the latest owner approval prioritized AMP ahead of the previous Rabbit Hole-first sequence. Open [AMP backstage rehearsal](http://127.0.0.1:5191/?rehearsal&backstage=amp) from the DEV SMF build or its venue-rehearsal link. The current challenge requires three deliveries within the existing 32-bar, 54.857-second AMP clock. Sunny wears a golden crown, Orbit mint headphones, and Violet a purple wizard hat. Following owner playtest feedback, costume portraits and short descriptions identify the recipient; floating badges have been removed. The floor now has ten dancers (three recipients and seven other dancers), up from six. These are first-preview targets and pacing, still subject to playtesting. The soundtrack is original AMP synthesis; S2 is the planned DJ identity, not a supplied or cleared recording.

Desktop play verified cart pickup, the three correct handoffs, temporary grilled-cheese/totem reward display, wrong recipient, retained progress after a bump, replacements, reset, pause freezing and arrow movement without page scrolling. Final checks passed 430 tests, the production build and dual-edition isolation. Phone-size (390×844) pickup/layout, unfinished-visit timeout without a prize, mute/effects controls and venue navigation were checked without browser errors. Physical-device playtesting and listening remain open. There are no profile/recovery writes, saved rewards, XP, telemetry or online requests; reload starts fresh. Full discovery, parent return/recovery and persistent unlocks remain unimplemented. The production catalogue and six main rehearsals are unchanged, with nothing published. See the [implementation plan](../plans/2026-11-10-amp-backstage-delivery.md) and [current handoff](../../PROJECT-HANDOFF.md#amp-backstage-delivery-preview).

**Owner-selected delivery loop:** get one sandwich from the vendor, navigate to the correct recipient, then smooth-pass them to hand it over. Recipients need distinct sprites/identities; any dancer cannot count as a valid delivery. The player must avoid both bumps and accidental smooth passes around other dancers while carrying.

| Event | Sandwich in hand | Delivery progress | Feedback |
|---|---|---|---|
| Collect from vendor while empty-handed | One fresh sandwich | Unchanged | Show the carried sandwich and intended recipient |
| Clean smooth pass around the designated recipient while carrying | Consumed by successful handoff | +1 completed delivery | Recipient celebrates; clear success cue |
| Smooth pass around another dancer while carrying | Given away / consumed | Unchanged | Wrong dancer is happy; show that the order is still outstanding |
| Bump into any dancer while carrying | Dropped / lost | Unchanged | Brief sandwich-on-ground animation; player is empty-handed |
| Pass or bump while empty-handed | Remains empty | Unchanged | No delivery or repeated loss event |

Already-completed deliveries are banked for that visit. A wrong recipient or bump costs only the current sandwich, never all progress. There is no handoff just for walking into a recipient or tapping their portrait. A replacement must come from the vendor; a ground-drop visual is not an additional collectible.

**Implemented preview choices:** three successful deliveries, retaining progress after mistakes. The same outstanding recipient remains after losing a sandwich, so the player returns for a replacement rather than rerolling the order. The next recipient is chosen only after a correct delivery. Exact delivery count, repeat-recipient policy, recipient movement and challenge duration remain playtest choices rather than frozen release rules.

**Readable target art:** use a small set of recognizable hungry-recipient sprites with different silhouettes/accessories. Match the current recipient's costume portrait and short outfit description to the actual dancer; distinct crown, headphones and wizard-hat silhouettes avoid colour-only recognition. The owner requested removing floating recipient icons after the first preview. Keep the costume portrait on the order card and vendor ticket, with no overhead target marker. Keep ordinary dancers visually distinct from order targets. A visible sandwich on the player makes carrying versus empty-handed clear. Use `Delivered 0 / 3` for the suggested counter, not the superseded generic `Smooth passes` count. Keep the arena free of persistent text labels and give targets enough surrounding space to complete a clean pass at phone size.

Use the familiar clean-pass distance feedback rather than introducing an unexplained tighter ring. Delivery classification needs a stable actual dancer identity; today's `round:closepass` does not include that ID. One sandwich can resolve only once, even if multiple encounter events occur close together. Track actual contact rather than only today's `round:bump` notification, which is throttled and can be suppressed by shields. A physical bump must not become a successful delivery because a perk suppressed its usual penalty; normal perk effects remain unchanged outside the held item. Collision versus handoff ordering and encounters already in progress at pickup need explicit tests before implementation acceptance. Save relevant encounter state with the order to prevent reloading from replaying a pass.

At the delivery goal the vendor awards the player's own grilled cheese and the cheese totem. The carried sandwich exists only inside this activity; neither it nor the final meal grants a main-run stat boost, extra XP or transferable inventory. For the later integrated visit, preserve the outstanding order, held/empty state, completed-delivery count and prize receipt through pause/recovery, so reload neither replenishes a lost sandwich nor repeats a delivery/prize. The current disposable preview freezes during pause but resets on reload. Exact cheese-totem artwork and final reward presentation remain to be reviewed.

## Reward and fairness boundaries

Preserve the original three secrets' agreed first-completed-visit souvenir, with additional cosmetic variants as optional challenges. Distinguish the persistent stage discovery from a prize earned within it.

For the new activity prizes, merely entering or waiting out a visit does **not** earn the challenge reward: AMP's cheese totem requires completed deliveries to the correct recipients using smooth passes; any later Villagio putting prize requires that mini-game's agreed success condition. The existing blanket souvenir-on-completion wording must not silently auto-award these activity prizes. Additional discovery stamps or participation souvenirs are not introduced by this clarification.

No main score, qualification, Rave XP, extra perk choice, Bass Head charge or temporary power carries out of a bonus visit. The main run is parked; leaving, timing out or not completing the activity does not fail it. Persist discovery, challenge completion and one-time cosmetic receipts atomically; repeats/recovery cannot duplicate an award. Reward feedback should acknowledge an already-owned item rather than drop a duplicate.

The existing parent-clear invitation/revisit flow remains the default for all five. With Villagio after the final Village clear, Festival completion is already earned: an optional visit returns to final results/save, not another main stage or a perk choice. In Endless it returns to the appropriate parked loop-transition decision. This terminal-parent handling must be covered explicitly when the visit flow is implemented.

## Delivery sequence and open details

1. Review all five local previews with the owner, including phone readability, activity pacing, venue details and listening. AMP's costume-led delivery was accepted; the four subsequent previews are now available for review. Keep thresholds provisional and normal catalogue identities concealed.
2. Playtest the implemented Villagio putting preview: two holes, eight shots, pull-back controls and a Golden Chicken Totem. Tune comfort and difficulty from feedback; a slide/sound finale remains later polish.
3. Connect the six-main run and all five optional detours with discovery, rewards, return/recovery and final-stage results. Preserve the original-three souvenir baseline and separate AMP/Villagio activity prizes. An isolated rehearsal is not evidence that this full journey works.

Open content details: final AMP backstage name; actual visual references for each small space; exact soundtrack selection/cues and permissions; final reward/recipient sprites; delivery target count and pacing; Villagio putting balance and final permanent qualification. None require inventing a DJ identity: all five have now been supplied by the owner.

No automatic publishing, artist outreach, account integration or production reward grants follow from this planning update.
