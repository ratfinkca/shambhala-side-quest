# Main-game crowd and friendship implementation plan

**Goal:** Promote the owner-approved collision/friendship experiment into normal gameplay, preserving complete runs, bonus activities, recovery and both editions.

**Architecture:** A shared crowd-social controller attaches the tested per-person swept collision solver to GameScene movement, records completed encounters and paints restrained personal-space/progress feedback. Existing ordered dancer IDs and layouts remain stable. Recovery persists four-step friendship inside existing encounter snapshots.

**Tech stack:** Existing Phaser/Vite JavaScript, Node tests, Supabase shared validation. No new dependencies. Local implementation only; backend migration/functions must precede the eventual frontend release.

**Spec:** Owner approval in this conversation and [mixed-crowd experiment](2026-11-13-crowd-collision-preview.md).

## Constraints and decisions

- Default combined radii18/26/34 on every main and bonus dancefloor; four clean passes with the same dancer scale their radius75/50/25/0%. Only player/NPC collision; NPC paths never repel one another.
- Keep48 entry,58 exit,24 driven travel,3s cooldown, existing points, bump shield/slowdown and bonus delivery semantics. Friendship adds no points and bumps do not undo progress.
- New stage/visit resets friendship; pause, camera/control switches and valid recovery preserve it. Existing checkpoints with no friendship fields restore as strangers.
- Preserve authored stage geometry and current density progression: generic10/14/18, SMF10/12/14/16/18/20; Endless+2 per revisit up to22. Recon confirmed no underfill. Do not regenerate old layouts or drop saved runs.
- Generic compatibility and SMF main/bonus parity both matter. Villagio walking uses crowds; putting stays isolated from player movement. Prototype remains available and overrides production crowd controller to compare Off/density/settings.
- Owner approved a new crowd season: new runs use `arcade-v2` / `smf-v2`. Preserve the original boards under an explicit season switch. Existing checkpoints, tickets and pending posts stay pinned to v1 and finish with original pass-through rules. Score arithmetic stays unchanged; versions separate the different opportunities.
- Separate local bests/board retention by season as well as online queries. Playtest events identify the pinned run season; consent remains opt-in. This task builds locally; publishing needs a later release request, with backend first.

## Tasks and interfaces

- [x] Root: add `createCrowdSocial(scene)` in `src/crowd-social.js`: `reset(passes,elapsed)`, `beforeMove(delta)`, `afterEncounters(results)`, `captureCounts()`, `destroy()`, `.friendships`. Set optional scene resolver/measurement hooks; no duplicate movement or scoring. Attach from GameScene creation, reset/start, before movement, after Crowd.update, restore/capture and teardown. Test lifecycle and real collision/pass transitions before integration.
- [x] Recovery agent: constructor `createCrowdFriendships(people,{passes=[]})`; optional encounter `friendPasses` integer0–4 in generic/SMF validators and generic capture whitelist; sum <= round.closePasses. Test invalid and legacy values plus main/bonus reloads.
- [x] Presentation agent: extract shared `createCrowdSocialView(scene)` with `paint(friendships,{enabled,debug})`, `update(encounters,elapsed,friendships,{reducedMotion,enabled,debug,reactions})`, `reset()`, `destroy()`. Use current colored inner rings, progress dots/hearts, fixed outer pass rings and short reactions. No always-on labels or global HUD expansion. Root replaces prototype duplication and adds main help copy.
- [x] Backend agent: expand generic playtest clearance acceptance from21 to48 in client summary + server validator; test old/current values, upper-bound rejection. Review score limits and note release needs; do not deploy.
- [x] Backend agent: additive v2 ticket allowlists, compatible score/board/playtest routes, migration checks proving v1 rows/tickets remain valid and partitions stay separate.
- [x] Frontend agents: pin season in new runs/recovery/posting, normalize old missing versions to v1, preserve old local boards, and add current/original season selection. Root gates collision by the pinned run version and tags generic telemetry.
- [x] Root: add real scene, bonus integration, density progression and resume regression coverage; run full suite and edition isolation/build checks once integrated; inspect normal main gameplay in portrait/landscape and one delivery/putting flow without writing production telemetry/scores.
- [x] Update handoff/roadmap with actual local status, checks and remaining phone feel/release needs. Leave current branch unmerged.

## Review focus

Recovery must neither erase learned friendship nor invent it; zero-radius exact-center overlap must not spoil a pass; simultaneous NPC contacts cannot move through scenery; delivered/lit/planting targets retain IDs and physical-contact rules; bonus musical-clock wrap must not reset friendship or teleport the crowd's collision timeline.


## Local verification — 2026-11-13

- `npm test`: 822/822 pass; both `npm run check:editions` builds, asset allowlists and static references pass. No new packages.
- Real scene tests cover all five bonus visits, earned four-pass friendship, exact paused restore, stage resets, legacy pass-through rules and unchanged score arithmetic. NPC paths remain independent; only the player resolves crowd contacts.
- Review fixed Villagio walking/snapshot clock alignment, historical crowd movement replay after putting, hidden hearts/reactions, and cooldowns over music wraps. Putting clears unfinished encounters without removing friendships; completed friendships do not announce again after a wrap.
- In-app browser: SMF390×844 portrait,844×390 landscape and generic1280×800 desktop. Tested tap, thumbstick and swipe, rotation pause, recovery after reload, guarded stage finish, separate Current/Original boards, an isolated local test result, and Villagio walking→zoomed green→shot. No relevant console errors. Rehearsal data stays separate; no production scores or telemetry sent.
- Opening Scores from a run selects that run's season, avoiding an old archive filter hiding a newly saved result.
- Physical iPhone feel/performance remains owner playtest work. Browser input inspection does not establish real-device multitouch or latency acceptance.

## Release order

1. Apply `supabase/migrations/202611130002_scoring_seasons.sql`. It only extends ticket version allowlists; existing rows and original boards stay intact.
2. Deploy `run-ticket`, `submit-score`, `leaderboard`, `playtest`, `smf-run-ticket`, `smf-submit-score`, `smf-leaderboard`, `smf-playtest`. Shared validators accept both seasons; generic playtest clearance accepts the new legitimate0–48 range.
3. Harmlessly verify current/legacy board reads and invalid-ticket rejections, then PR/CI/merge/frontend publish. Recheck public season selection and new-run behavior after deployment.

The owner authorized publication after accepting the preview. [Release verification](../crowd-season-release-validation.md) records backend rollout and delivery status.

Local entry points: SMF `http://127.0.0.1:5194/?rehearsal&tour`; same-network phone `http://192.168.14.143:5194/?rehearsal&tour`; generic `http://127.0.0.1:5195/?rehearsal`. The original collision comparison lab remains at `?rehearsal&collision`.
