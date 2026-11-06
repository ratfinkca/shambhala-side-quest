# Endless recovery preview — 2026-11-05

Published baseline remains Bass Head PR #18 /41148ee. Recovery is a local preview on `codex/run-recovery`, not a deployment. No backend, dependency, analytics schema or scoring-version changes.

- Baseline 178 tests passed. New tests cover logical roundtrips, malformed data, score reconciliation, 257-stage receipt boundaries, 1441-stage local overflow/2 MiB rejection, atomic/quota-failing profile writes, duplicate stage/score prevention, exclusive ownership, paused scene restoration, unknown/pending/successful/expired posting, immutable retries/original build, recovered analytics suppression and disposable practice isolation.
- Browser IAB checks: desktop 1280×720, portrait 390×844 and landscape 844×390. Forest/Moonlit/Neon recovery flows render. Resume/discard/cancel, reload and second-tab owner-close retry work. No horizontal overflow on portrait; controls fit landscape with the practice panel collapsed. Viewport overrides reset.
- A saved Bass Head 3s / Dizzy 4s / stage timer40s returned unchanged and paused after reload. Explicit resume advanced to39s; reload retained the new state. No timing advances while on recovery/pause screens.
- Pending perk swap survived reload; replacing Moth with Surfer then reloading preserved the next-stage build/rules. A real practice stage end awarded116 XP and restored the same116 XP after reload. Finish/save preserved partial initialsZX, local saved state and the existing finish/results flow; returning to title cleared recovery.
- Recovery lab has an isolated persistent namespace; other labs are temporary. Analytics and online services are disabled throughout practice. No production scores or analytics were written.
- Screenshots outside repo: `/tmp/recovery-paused.png`, `/tmp/recovery-phone.png`, `/tmp/recovery-landscape.png`, `/tmp/recovery-moonlit.png`, `/tmp/recovery-neon.png`. Paused-background visual verification follows the final layout adjustment.
- Remaining physical checks: browser/OS termination without lifecycle events, actual background eviction, hardware touch reach, audio interruptions, sustained phone performance. Web Locks-unavailable and quota failure paths are automated checks, not claims about every device.

Full final test/build, production fixture exclusion, diff/link checks and independent whole-branch review are recorded below after completion.
