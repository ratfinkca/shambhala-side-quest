# Optional playtest data and arcade scores

Status: proposed design for review. No service has been provisioned.

## Intent and decisions

Understand how real players experience the game and let them compare scores without accounts. The user approved offering optional playtest tracking to everyone with the game link and starting with an arcade board using initials.

Near misses should reward skilled play while remaining a delightful accidental discovery for beginners. Measurements should help evaluate that goal without changing scoring in this work.

Keep the game on GitHub Pages. Add a small managed Supabase backend for private playtest summaries and public score records. Moving the whole game to a custom server adds unnecessary operations; a separate analytics vendor plus score backend adds another service without helping this initial scope.

## Player experience

- Offer “Share playtest data” with equally clear accept and decline actions. The default is off; play is never gated. Explain what is collected and provide a settings toggle.
- Record consent locally. Do not collect retroactively. Turning it off immediately clears unsent analytics and stops further collection.
- Preserve existing local scores. Add explicit “Post online” on results, with three uppercase letters or digits and a preview of the information that will be public.
- Score posting works without analytics consent. Only information necessary to submit and validate a score goes to that endpoint.
- Show separate Quick Rush and Festival boards, initially the top 50 entries for the current scoring rules. Label actual input used: mouse, touch, keyboard, or mixed. Do not split boards by input yet.
- Online failures never interrupt play or prevent local saving. Show a brief error and explicit retry; do not automatically publish an offline score later.
- No login, profile, cross-device progression, custom analytics dashboard, or itch.io release in this scope.

## Hosting and trust boundaries

The static client calls HTTPS server functions. Those functions validate requests and write to the database. Browser builds contain no database administrator credentials. Direct public writes to tables are denied; private analytics are not publicly readable. Public leaderboard responses expose only approved display fields.

Use a short-lived, server-issued guest run ticket bound to mode and scoring version. This is a session capability, not a player account. Obtain it when online play starts, independent of optional analytics. Failure leaves the run playable locally but ineligible for this first online board. Explain that limitation on results.

Tickets, rate limits, request size limits, expiry, and unique run IDs reduce spam and duplicate submissions. They cannot prove a browser score is genuine. This is a casual board, with an owner-only ability to hide suspicious entries. Stronger replay verification is deferred.

Production endpoints allow the published game origin; local development uses a separate environment. Origin checks supplement validation and are not authentication. Rehearsal mode must never submit production scores or analytics.

## Playtest measurements

Collect compact events and per-stage/run summaries, never pointer streams, screenshots, or session recordings:

- Run started, stage started/finished, completed run, explicit exit, and replay.
- Score, sparks, bumps, close-pass count and closest-clearance distribution.
- Combo and Flow usage; bass-zone time, charge earned, and activations.
- Perk selections, candy pickups/effect types, and resolved theme.
- Actual input categories, broad viewport class, build ID, and scoring version.
- A small allowlist of menu actions such as instructions opened and theme changed.

Use a random installation identifier only after opt-in, plus independent session and run IDs. This is pseudonymous data, not a promise of anonymity. Do not attach public initials to analytics. Avoid precise device fingerprints or logging arbitrary request bodies.

Batch during play with a bounded in-memory queue, flush at stage boundaries, and make a best-effort flush on page hiding. Lost events are acceptable. An unmatched start is “completion unknown,” not evidence of frustration or an intentional exit. Only a deliberate in-game exit produces an explicit-exit event.

Initial retention proposal: delete raw playtest data after 30 days; retain aggregate counts without installation/session IDs. Document hosting request-log retention separately before release. Present a short player-facing data notice with a contact method before enabling collection.

Initial analysis uses private database queries/exports: stage completion, replay rate, close passes versus bumps by input, perk choices, and Bass Head usage. Show sample sizes and unknown completions alongside rates.

## Score records and validation

Private submission records contain server run ID, ticket reference, mode, scoring version, build ID, score, stages cleared, active duration, stage summaries, input category, and server receipt time. Public records contain initials, score, stages cleared, input label, mode, scoring version, and server receipt time. No public installation IDs or tickets.

Validate initials, numeric bounds, supported versions/modes, legal stage progression, plausible durations and score components, and single submission per ticket. Derive acceptance limits from actual rules rather than arbitrary guessed maximum scores. Treat all client summaries as untrusted claims.

Retries are idempotent: the same run and payload return the original outcome; conflicting resubmissions are rejected. Rank by score descending, stages cleared descending, then server receipt time ascending. Initials are a display name, not a unique identity; multiple entries per person are permitted initially.

Separate scoring version from build ID. Cosmetic releases keep the board; changes materially affecting score potential create a new scoring version. Older boards remain identifiable rather than silently mixing incompatible rules.

## Integration boundaries

- Keep `src/run.js` responsible for run lifecycle and gameplay rules.
- Add isolated input classification and run-summary collection, driven by actual accepted game actions.
- Keep consent and networking separate from gameplay. Analytics collection is inactive without consent.
- Extend profile normalization in `src/profile.js` and persistence in `src/storage.js` without discarding existing audio, wardrobe, theme, or local scores.
- Wire lifecycle events and result actions in `src/main.js`; keep HTTP requests outside the scene update loop.
- Use `src/screens.js` for consent, settings, submission states, and board presentation.
- Store backend migrations, function code, environment documentation, and validation tests in the repository.

## Delivery order

1. Implement local consent, input classification, and run summaries with a test transport. Preserve gameplay behavior.
2. Add hosted ingestion and private reporting queries; verify with a staging environment before offering tracking publicly.
3. Add guest run tickets, validated submissions, public boards, and offline/error UI.
4. Verify production configuration and privacy notice, then release through the existing GitHub Pages workflow.

Near-miss visual feedback remains a separate gameplay change. These measurements can evaluate it once introduced.

## Acceptance checks

- Declining tracking sends no analytics and creates no analytics identifier; opting out discards pending analytics.
- Posting a score without tracking consent succeeds without creating playtest records.
- Existing saved settings and local boards survive profile migration; unavailable storage/network does not block play.
- Rehearsal is excluded; stage transitions and retries do not double-count or duplicate scores.
- Mouse/touch/keyboard/mixed labels reflect actions, not device detection.
- Anonymous callers cannot read playtest data or write score tables directly.
- Expired/forged tickets, malformed scores, unsupported versions, excessive payloads, and conflicting retries are rejected.
- Published public fields omit private identifiers. Rate limiting and owner-only moderation are verified.
- A browser playtest covers mobile layout, consent, declined consent plus score posting, successful submission, retry, offline play, and board loading.

## Setup needed before hosted rollout

An owner-controlled Supabase project, deployment access, separate development configuration, and a player-facing contact address. Select project region and review current service limits/costs before provisioning. No purchase or external project creation is implied by this document.
