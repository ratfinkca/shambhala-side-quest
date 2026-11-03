# M1: Endless insights design

Approved direction: review playtest coverage and add optional Endless measurement before building stage variations. Preserve score posting/analytics separation, existing consent and offline play. This is a small extension of the current event service, not a new analytics provider or public dashboard.

## Approach

Extend the existing private event stream, rather than deriving player behavior from leaderboard entries or introducing session recordings. Boards represent voluntary submissions and cannot explain failed/abandoned runs. Aggregate gameplay events answer that question without coordinates/initials. Existing Rush/Festival events stay schema1; Endless uses schema2 with strict mode-specific limits.

## Measured behavior

Endless run_start/replay, stage_start/stage_end (same numerical counters as other modes), perk_choice and run_end. Terminal outcomes: banked for voluntary finish, failed for a missed target, exit for explicit discard before a completed stage. Missing end remains unknown. A partially played stage is observed only as stage_start; it never gains a fabricated stage_end. Do not change XP, scoring or scoreboards.

perk_choice payload: stageIndex of the completed stage, action add/swap/keep, perk or null, replaced or null, activePerks (max4 distinct allowlisted IDs). Record one accepted choice per completed stage; cancelled swaps/duplicate clicks do not count. For swap, validate a4-perk active result, new perk present and replaced perk absent. Full cross-event authenticity is not promised for client telemetry.

## Bounds and privacy

Endless summaries retain only the current stage; sequential index is tracked separately. Accept stage indices 0–999,999 and cleared counts0–1,000,000, with safe integer totalScore. This is a schema guard, not a gameplay cap. Original Rush/Festival limits remain. Existing queue/batch/body/rate/retention bounds remain; slow networks may drop samples, and reports state that limitation. All payload fields are allowlisted. No extra identifiers, precise screen size, trajectories, initials or XP profiles.

Consent-off/config-off emits nothing; accepting mid-run applies next run; opt-out discards measurement/queue immediately. Score posting and input classification continue independently. The notice explicitly mentions Endless finish outcomes and perk choices; provider settings remain dated to their last actual review.

## Backend/reporting

Add a forward migration replacing the private metrics view, preserving columns/grants/daily maintenance. Add banked_runs/failed_runs and perk add/swap/keep counts. Preserve old completed_runs/explicit_exits/unknown semantics. Provide read-only private SQL for UTC/build-scoped run coverage, stage/loop qualification/active-time sample sizes, choice counts and taken-perk frequency. No IDs in output. Do not invoke retention maintenance during reporting.

Review existing production aggregates only with available authenticated read access. An unavailable management interface or empty/missing sample is an observation gap, never permission to make up balance findings. Do not deploy a new reporting RPC solely to bypass that gap.

## Acceptance/release

Test real session→schema→HTTP/SQL behavior, original-mode compatibility, late/stale/duplicate events, failed/banked/exit outcomes, consent changes, stage>2, bounded long-run memory, invalid personal fields and aggregate migration preservation. Browser rehearsal checks no scores/XP/tracking; normal/dev test backend checks actual consent and choice emission. No production synthetic writes. Release separately: analytics migration/playtest function first, then frontend after full CI and public consent/UI checks.
