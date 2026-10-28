# Rave Experience first implementation — 2026-10-28

Approved for release with the Living Forest music/lighting update. All 112 tests and the production build pass; independent release review found no blockers.

## Rules

Every completed stage earns 20 XP + 2 per spark + 5 per smooth pass, plus 30 for qualification and 100 for completing Festival Run. Failed qualification retains XP. Exiting mid-stage grants no partial reward. Rehearsal grants no progression.

Ranks at 0/100/300/650/1200/2000 XP: Fresh Arrival, Forest Wanderer, Dancefloor Regular, Night Creature, Sunrise Soul, Forest Legend. Fresh saves start with the original wardrobe and Boots/Bracelet perk choices. Noodle joins at rank 1, Moth at rank 2; choices grow after the completed stage. Perks reset each run.

Six achievements: 50 cumulative sparks, 25 smooth passes, three clears (Quick Rush completions count), ten Flow pickups, five Bass Head activations, one completed Festival Run. Each awards a cosmetic. Other expanded pieces follow rank milestones. New flourishes: Firefly Sparkles (300 XP), Orbiting Stardust (festival completion), Prismatic Aura (2000 XP). They have fixed rendering budgets and no gameplay effects; reduced motion is static. Previewing a locked piece never equips or saves it.

## Persistence and migration

Existing v1 profiles and legacy score/sound saves keep access to all previously available pieces and all four perks. New flourishes require earning for everyone. No historical XP is inferred. Progress uses the existing device-local profile; offline operation and tracking consent are independent. Storage failures retain session state and show a notice when rewards are granted. The most recent 256 stage receipts prevent repeated completion awards across reloads; run UUID and state guards prevent UI resubmission of older runs. Multi-tab conflict resolution and cloud synchronization remain future work.

## Coverage

Automated coverage includes migration, zero-score legacy profiles, locked equip rejection, reward thresholds, duplicate completion/reload, malformed fields, blocked storage and rank-based perk choices. Browser coverage records new-player locks, legacy access, non-equipping flourish preview and two real Quick Rush completions, first-rank rewards becoming selectable, and XP surviving reload. Reward pacing, complete-festival achievement and sustained phone performance still need playtesting.
