# Endless run recovery — first preview design

Date: 2026-11-05. Status: approved by the user on 2026-11-05. Baseline: Bass Head PR #18 /41148ee. No implementation or release is authorized by this document alone.

## Intent and decisions

Protect a long Endless run when the page reloads or the phone/browser suspends it. The user chose **resume mid-stage**, initially paused, preserving the saved time, points, perks and pickups. The first preview is same browser/device and Endless only. The builder proposes the detailed defaults below; they are not additional user decisions.

### Approaches

1. **Persist the live stage and restore it paused — selected by the user.** Preserves the encounter and partial progress, but requires explicit state serialization, validation and safe reward/submission boundaries.
2. Restart the current stage from a between-stage checkpoint. Simpler, but loses partial progress and permits stage retries; the user chose mid-stage restoration instead.
3. Cloud saves/accounts. Useful for cross-device recovery, but adds account, storage and conflict work unrelated to this first slice; deferred.

## Player behavior

- Keep one recoverable Endless run on this browser. Start recording when its first stage actually begins; unstarted rules do not create an empty save.
- On reopening, show a recovery prompt before allowing another run to replace it: stage/loop, completed stages, total points including the saved partial stage, remaining time, and when last saved. Primary **Resume run**, secondary **Discard run**. Discard needs a clear confirmation and never removes already earned XP/cosmetics or saved scores. No automatic play or online post.
- Resume a playing stage into a dedicated paused state with the saved scene visible. Timer, crowd, music, effects and movement remain frozen until explicit Resume. Clear held keys and destination targets. Time away consumes no active time; sound starts only after the user's resume interaction.
- Between stages, restore the original summary, perk-choice or next-stage rules screen. Preserve an unfinished swap selection. A paused Settings/exit-confirmation view restores to ordinary pause; do not replay a destructive confirmation. Wardrobe, score-list and settings browsing need not be restored.
- Preserve ended but unsaved results and initials. Reloading results returns to the existing save/post flow, without replaying stage rewards. Once either local saving or online posting succeeds, the recovery prompt may still offer results until the player explicitly leaves; leaving saved results clears recovery. Leaving unsaved results keeps the existing confirmation.
- Starting a new run requires resolving the existing recovery prompt first. Discarding an interrupted run does not bank its partial score; Resume then **Finish run & save score** remains the route for banking completed stages.
- A small, non-blocking notice appears if recovery cannot save: **Run recovery unavailable; keep this page open.** Gameplay continues in memory. Do not claim it is saved. Unsupported coordination/storage must not prevent ordinary play.

## Save cadence and durability

- Save at most once per second of active play, after a complete update tick, plus immediately on pause/visibility loss/pagehide, stage completion, perk add/swap/keep, start of the next stage, initials edits, local save and online submission transitions.
- Do not rely on unload/pagehide alone: mobile termination can skip lifecycle events. A sudden termination may lose the latest unsaved interval; no exact crash-moment guarantee. Avoid per-frame storage serialization.
- Use the existing local profile record with one optional, versioned recovery field. A single synchronous storage write atomically replaces profile progress and its recovery checkpoint. The rest of the profile survives a corrupt recovery field. No new packages, account, database or server is proposed.
- Stage completion computes final run totals, XP/achievement receipt and next-screen recovery state before that one profile write. Never persist an ended round as an unfinished playable round. Restoring does not call ordinary start/finish handlers that award or randomize state.
- A failed write keeps coherent current state in memory and reports degraded recovery. Later successful writes include all current progress and recovery state, never a stale profile copy. Previously persisted state remains the fallback after an unexpected close.

## Snapshot contract

Use explicit allowlists, a recovery format/rules revision and the scoring version. Do not serialize Phaser nodes, functions, arbitrary objects or effect tweens. New code may accept an old snapshot only when its recovery rules revision is compatible; do not tie compatibility to every cosmetic deployment. Preserve the original run build ID for posting. Invalid/incompatible records are not executed or silently restarted; offer dismissal/new run while preserving normal profile data.

Persist:

- Run UUID, original build/scoring identity, concrete theme, Endless stage index, score totals/clears, equipped/available perks, pending swap/remix identity, status, capped score history and overflow flag, banked charge, submitted/result/initials state.
- Live round: remaining active time, score components, pickup/pass counters, combo/multiplier/grace, Flow duration/taken slots, shields/bump slowdown, Surfer duration, complete Bass Head charge/exposure/active duration, candy schedule/phase/wrapper/effect/start time and progression counters such as Bass Head uses.
- Logical player position; all twelve spark positions; candy placement/position; crowd encounter state/cooldowns/protected contact needed to preserve collision and clean-pass scoring. Crowd world positions derive from stage and saved active time. Cosmetic ring fades/particles may be dropped.
- Original online ticket and expiry, immutable attempted submission payload if any, posting outcome and result timestamp/outfit. Persist only the run-scoped score capability, never Supabase service credentials.
- Input classification independently of analytics consent, so a recovered mouse/touch/keyboard run retains its actual control label.

Normalize non-finite runtime sentinels (e.g. Infinity since last pickup) explicitly and restore their meaning. Reconstruct rules/layout from trusted registries; validate counts, finite positions/timers, legal phase/status combinations, score reconciliation, perk history and expected array sizes. Bound the recovery field to 2 MiB and existing history limits; oversized snapshots disable recovery with a visible notice, never terminate local play. Overflow runs remain locally playable and ineligible online, as today. Reject unknown future versions. Do not silently repair a score history into a different run.

## Ownership and duplicate prevention

- Existing stage receipt IDs remain `${runId}:${stageIndex}`. Combine award and checkpoint persistence in one write so recovery cannot replay a persisted reward from an older playable checkpoint. Never re-award receipts on restore. Existing capped receipts do not become a general historical replay mechanism.
- Coordinate participating game tabs with one exclusive Web Lock for persisted profile/run ownership. Acquire it before loading mutable profile state; a second tab displays **Game open in another tab** and does not mutate profile/recovery, request score tickets or play. Offer an explicit retry after the other tab closes. No lock stealing or timer-based takeover of a merely suspended tab. Release on pagehide; on pageshow/reacquisition reload authoritative profile/recovery rather than writing an old in-memory copy. This may require presenting the saved paused recovery flow after back/forward restoration.
- If Web Locks are absent/unavailable, do not enable recovery or claim multi-tab safety. Ordinary gameplay keeps its existing storage behavior with the recovery-unavailable notice. Old deployed tabs that do not participate cannot be retroactively coordinated; incompatible legacy writes remain a documented preview limit.
- Resume retains the same run ID/ticket; never request a replacement ticket for that run. A reload before ticket issuance completed makes online posting unavailable for that recovered run; local saving still works.
- Preserve original build ID, payload and initials once posting was attempted. A previously pending request becomes **Posting not confirmed — Retry**; retries send the exact same payload using the existing backend's idempotency. Never auto-submit on reopen. Confirmed success stays success.
- An expired unused ticket prevents a new post, with existing clear local-save guidance. A previously attempted request may still be retried exactly after expiry to discover the existing receipt; the backend already handles that idempotently. Local saving remains independent, and run duration can exceed ticket eligibility.
- Local score save and `submitted` result state persist together in the profile checkpoint. Recovery must not depend only on whether an entry still ranks in the local top ten.

## Playtest data and practice

Recovery is local gameplay storage, not consent to transmit it. No positions, pickup map, score ticket or recovery snapshot goes to analytics. Existing opt-in remains unchanged.

For this first slice, after a full page reload the recovered run does **not** resume analytics emission. Already transmitted events remain partial/unknown; do not fabricate a second run_start, complete stage_end or clean run_end from incomplete measurements. Preserve input classification separately for scores. A new run starts normal consent-gated measurement. Ordinary pause/resume within the existing page continues current measurement. Document the resulting observation gap; richer analytics continuation is separate work, not a backend schema change hidden inside recovery.

All existing rehearsal labs remain save/progression/analytics free and must never load or overwrite the real recovery. A separate DEV recovery lab uses a persistent, namespaced disposable profile across reloads, fake/offline score service and no production requests; **Reset recovery practice** clears only that namespace. Production excludes fixtures and controls.

## Acceptance and preview

1. Mid-stage roundtrip preserves time, points, pickups, spark/candy positions, combo, Flow, partial/active Bass Head, pressure, shields, encounter cooldowns and concrete theme. Paused restore does not advance or collect until resumed; old input is cleared.
2. Summary/perk/swap/ready/results roundtrips preserve boundaries and initials. Crash-window tests around stage awards and local saving show no duplicate XP/achievements or scores. Include runs longer than 256 stages and the existing online history cap.
3. Fake backend tests cover ready/unknown pending/succeeded/expired tickets, original build ID, exact retry payload and a response arriving around persistence. No production test score or analytics writes.
4. Corrupt/non-finite/oversized/incompatible saves, denied/quota storage and unavailable locks degrade visibly without damaging profile progression. Two tabs cannot resume/mutate the same participating profile; pagehide/pageshow and owner-close retry are covered.
5. Consent off/on/changed across reload never transmits recovery content or generates duplicate/imputed recovered-run analytics. New-run tracking remains correct. Practice isolation survives reload/reset.
6. Browser preview: desktop, phone portrait/landscape, all theme compatibility, keyboard/native button focus, resume/discard/cancel, pause and timer evidence, reload during a drop/effect, recovery near stage-end and results. Record console checks and screenshots. Physical OS termination/storage eviction and sustained phone performance remain real-device tests.
7. Full tests/build, documentation/fixture exclusion and independent review before claiming preview ready. Backend deployment is not expected; verify that remains true. Publishing requires a later user ship request.

## Scope and builder latitude

This is a project-sized feature with a local preview first. Do not add cloud sync, offline installation, refresh-based stage restarts, new score rules, balance tuning, automatic online posting or new analytics collection. Browser storage eviction/clearing cannot be recovered.

The builder can choose module/function boundaries, minor visual treatment using current themes, exact validation helpers and a lower save frequency if measured synchronous write cost requires it. Any material reduction in preserved gameplay state, ownership guarantees or local/online safety must return for a decision. Recovery status wording and formatting can be adjusted for accessibility without adding extra onboarding.

## Browser references

- [MDN Web Locks API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Locks_API): same-origin exclusive ownership; secure-context requirement.
- [MDN pagehide](https://developer.mozilla.org/en-US/docs/Web/API/Window/pagehide_event): lifecycle saving is supplemental, not the sole mobile durability mechanism.
