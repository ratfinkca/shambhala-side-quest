# Rave names, challenge boards and invitations release

The owner authorized publication for remote phone play after accepting the local preview. Baseline: PR #25 / `55a0f0f`. This release includes the pending pixel pickup-notice and consumed-invitation pass, required/editable rave names, four device-local character presets, three challenge levels with separate v3 boards, and Candy Magnet / Flow Finder perks. Prism Party remains a concept.

## Reviewed implementation

- 978/978 tests passed. Generic and SMF edition builds, asset allowlists and static references passed; invalid editions rejected. Diff whitespace checks passed.
- Independent backend, gameplay/recovery, identity/UI and release reviews found no remaining blockers. Legacy score shapes, retry receipts and recovered runs retain their original season.
- Disposable browser checks covered blank/disallowed names, two saved character presets and restoring them, paused recovery, named local saving, difficulty-separated boards, old season selection and generic first-play onboarding. Phone-size browser review covered portrait and landscape; physical iPhone acceptance remains with the owner.

## Backend-first rollout

- Dry run identified only `202611130003_names_challenges.sql`; the additive migration was applied successfully.
- Deployed all eight functions: `run-ticket`, `submit-score`, `leaderboard`, `playtest`, `smf-run-ticket`, `smf-submit-score`, `smf-leaderboard`, `smf-playtest`.
- Downloaded sources: all 22 reachable source files exactly matched the reviewed implementation.
- Read-only hosted SQL confirmed migration history, challenge-aware RPCs, service-role-only permissions, private-table RLS, preserved expiry/retention and active cleanup jobs whose latest observed runs succeeded.
- The smoke-test sentinel ticket was confirmed absent in both editions before HTTP validation. Verification does not create production tickets, scores or analytics events. Rejected score requests may update normal rate-limit buckets.

## Publication evidence

The release PR records hosted HTTP results, CI/integration status, merge revision, Pages deployment and final public UI/build checks. These are separate gates; this file's pre-merge status is not a claim that the frontend is already live.
