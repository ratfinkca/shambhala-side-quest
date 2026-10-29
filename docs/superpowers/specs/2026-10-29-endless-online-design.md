# Online Endless arcade board

Extend the existing anonymous Supabase arcade service and existing score screens. This is the approach approved in chat; a separate service would duplicate tickets, moderation and initials handling. Accounts and authoritative replay verification remain out of scope.

Endless gets a separate top-50 tab, ranked stages cleared descending, score descending, server receipt time ascending, then stable ID. Initials remain three A–Z/0–9 characters; input type stays visible. Posting is explicit, independent of local saves and analytics consent. Offline play and local ranking continue unchanged.

Capture each completed stage's existing award counters and selected perks, including the final failed stage. Validate target scaling (20/25/30 +3 each loop, capped45), totals, earned multipliers, four distinct perk slots, and legal keep/add/swap transitions. A run only ends on a missed target. No analytics expansion.

Builder decisions: reuse arcade-v1 because point awards are unchanged; retain 24-hour tickets. Bound online history to 1440 stages and submission bodies to 1 MiB (other endpoints remain32KiB); exceeding the history bound disables online posting for that run but never ends gameplay or local saving. Explain the ticket window in Endless instructions. Schema migration is additive, preserves existing scores, permissions, retry behavior and Rush/Festival ordering. Deploy backend before enabling the frontend release.
