# Endless finish and save plan

User approved: Finish run & save score opens results with completed stages/points; unfinished stage excluded; prominent local/online actions before navigation; confirmation before leaving unsaved results.

1. Test-first: finishRun(run) can end Endless from upgrade/ready/playing after at least one completed stage, preserves totals/history, rejects duplicates/other modes/no stages. Backend accepts all-qualified completed Endless histories while retaining incomplete stage, counter and transition checks. No schema change.
2. Screen state: finish confirmation leads to results; unsaved-results navigation routes through leave confirmation with cancel. Posting pending cannot leave; save/post flags decide whether a warning is necessary. Preserve typed initials across renders/navigation.
3. UI: Finish run & save score on Endless summary, pause, later-stage rules and perk selection. Explain exclusion of current stage at confirmation. Results lead with initials, local-save and public-post actions, then navigation; XP/passport secondary. No automatic public posting. No finished stage retains explicit discard path.
4. Run unit/database/HTTP suite, build and browser checks for summary finish, paused partial-stage finish, cancel and unsaved leave; phone layout and independent review. Backend submit-score update must deploy before frontend release. No publishing until requested.

Completed locally:145tests, production build, desktop/390x844browser checks and independent review pass. Intentional navigation detail: the non-destructive View scores path preserves the run during posting; replay/title cannot abandon a pending post. No deployment in this task.
