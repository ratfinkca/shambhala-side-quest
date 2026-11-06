# Endless recovery preview — 2026-11-05

Published baseline remains Bass Head PR #18 /41148ee. Recovery is a local preview on `codex/run-recovery`, not a deployment. No backend, dependency, analytics schema or scoring-version changes.

- Baseline 178 tests passed. New tests cover logical roundtrips, malformed data, score reconciliation, 257-stage receipt boundaries, 1441-stage local overflow/2 MiB rejection, atomic/quota-failing profile writes, duplicate stage/score prevention, exclusive ownership, paused scene restoration, unknown/pending/successful/expired posting, immutable retries/original build, recovered analytics suppression and disposable practice isolation.
- Browser IAB checks: desktop 1280×720, portrait 390×844 and landscape 844×390. Forest/Moonlit/Neon recovery flows render. Resume/discard/cancel, reload and second-tab owner-close retry work. No horizontal overflow on portrait; controls fit landscape with the practice panel collapsed. Viewport overrides reset.
- A saved Bass Head 3s / Dizzy 4s / stage timer40s returned unchanged and paused after reload. Explicit resume advanced to39s; reload retained the new state. No timing advances while on recovery/pause screens.
- Pending perk swap survived reload; replacing Moth with Surfer then reloading preserved the next-stage build/rules. A real practice stage end awarded116 XP and restored the same116 XP after reload. Finish/save preserved partial initialsZX, local saved state and the existing finish/results flow; returning to title cleared recovery.
- Recovery lab has an isolated persistent namespace; other labs are temporary. Analytics and online services are disabled throughout practice. No production scores or analytics were written.
- Screenshots outside repo: `/tmp/recovery-paused.png`, `/tmp/recovery-phone.png`, `/tmp/recovery-landscape.png`, `/tmp/recovery-moonlit.png`, `/tmp/recovery-neon.png`. Final CSS specificity check confirms the restored arena is visible under the pause panel, with its clock unchanged. Immediate next-stage start/reload restored60s paused and the correct stage6/loop2 label. Final handoff screenshot: `/tmp/recovery-ready.png`.
- Remaining physical checks: browser/OS termination without lifecycle events, actual background eviction, hardware touch reach, audio interruptions, sustained phone performance. Web Locks-unavailable and quota failure paths are automated checks, not claims about every device.

## Final verification

207 tests pass, production build passes with the existing Phaser bundle-size advisory. Production fixture exclusion, documentation links and diff checks pass. The 1441-stage capture/validation microcheck averaged9.29ms on this Mac across10 runs; this is not a phone performance claim.

Independent read-only review of41148ee..48e6421 found four Important and three Minor issues, addressed in the final fix pass:

- Failed saves now throttle capture/validation/write attempts as well as successes; quota regression observed RED→GREEN.
- Beyond the retained1440-stage history, known legal current perks are not compared against an obsolete prefix; stage1441 decisions/results regression RED→GREEN.
- Decoder rejects mismatched encounter point pairs, incomplete active encounters, non-array history and invalid/inherited reward categories before they reach gameplay/rendering; regressions RED→GREEN.
- Unsupported locking cannot clear a pre-existing recovery while playing another mode; regression RED→GREEN.
- Force a checkpoint after initializing each new stage; immediate browser start/reload returns60s paused instead of pre-start rules.
- Durably stored reward notices acknowledge durability in the same atomic write; direct abrupt-reload storage/render regression RED→GREEN.
- The uncertain-post test uses relative future expiry, preserving the product's expiry semantics after the calendar advances.

Additional QA fixes: recovered arena visibility beats the theme's hidden-arena rule; stage labels are shared by normal starts/restoration; interrupted between-stage exit confirmation preserves its original perk screen. No deferred findings remain.

Review boundaries retained: busy tabs may read a non-mutating profile copy but cannot play/write/request tickets; reacquisition reloads authoritative state. Transient particles/ring fades are cosmetic and reset, while scoring encounters/timers persist. Incomplete recovered analytics are deliberately suppressed. Real-device termination, eviction and sustained performance remain playtests; production posting/deployment were not attempted for this preview. No backend deployment is needed.
