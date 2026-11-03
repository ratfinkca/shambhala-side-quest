# M2 stage variation release evidence — 2026-11-03

Scope: six deterministic speaker/mud/crowd layouts alternate from loop two; first-loop/Festival/Rush layouts, target/count/speed caps, scoring, stage music and perk rules remain. User approved the first playable preview before shipping.

155 automated tests, production build and independent review passed. Geometry coverage includes safe spawn/Flow, connected pickup region, seeded spark positions and dancer clearance throughout stage motion. Browser loaded all six in the local practice selector; phone HUD/picker, pause/resume, steering, finish and reload were checked. Practice saves/XP/analytics are disabled; production output excludes practice controls. Physical-device balance and sustained performance remain ongoing playtest work.

Backend deployed before frontend: playtest/index.ts and shared/http.js, playtest.js, variations.js downloaded from production match reviewed sources. Pure checks against the downloaded validator accept all six correct layout identities, original first-loop identity and legacy untagged schema2 payloads. Mismatched IDs fail. Live wrong-stage/personal-field requests are rejected, disallowed origin denied, production OPTIONS succeeds. No synthetic production events or scores inserted. No database migration, arcade-validator update or scoring-version change was required.

Final PR/CI, merge, Pages deployment and public build smoke results are recorded on the release PR. New consenting samples can be grouped by layout through the updated private report; legacy records remain separate as legacy-unknown. Do not infer representative touch balance from rehearsal geometry checks.
