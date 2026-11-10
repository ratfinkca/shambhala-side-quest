# Rehearsal audio mix — 2026-11-10

Local implementation of the [rehearsal mixer plan](plans/2026-11-10-rehearsal-audio-mix.md). No backend or public deployment changes.

## Result

- Music / Effects sliders, percentages, Reset mix and Test effects are visible below the practice arena. The test alternates the real pickup and near-miss sounds without altering the run or recording.
- Rehearsal defaults are music 20%, effects 100%; normal-game defaults and saved preferences are unchanged. Levels survive master mute and source/venue changes within the page, then reset on reload.
- Music controls original synthesis, local recording and the comparison clip. Native comparison volume changes update Music; native unmute cannot bypass Sound off.
- First-use effects tests await audio readiness. Mute, pause/restart, hidden page and disposal invalidate pending tests; failures receive a useful status message.

## Evidence

397 automated tests passed. Default production build and both edition build/asset-isolation checks passed. Existing large-chunk warning remains. Independent review found the comparison-volume bypass during development; synchronization and its regression test resolved it, and re-review found no further actionable issue.

In-app browser checks at 390×844 and 1280×900 used the owner's actual Hellhound WAV at 132.4 seconds. Verified first-click test, both feedback variants, independent zero-level controls, unchanged music progress while testing, master mute, pause, source changes and preserved cue/mix. Comparison clip rendered; its native mute updated Music to 0%, and native unmute while master-off remained muted. No console warnings/errors or horizontal overflow were observed. Viewport override was reset and preview left paused with the recording selected.

Screenshots:

- `/Users/mother/.codex/visualizations/2026/10/13/01a1368f-7ce7-7722-a6bd-8509627b4e12/rehearsal-mixer-phone.png`
- `/Users/mother/.codex/visualizations/2026/10/13/01a1368f-7ce7-7722-a6bd-8509627b4e12/rehearsal-mixer-desktop.png`

These are routing, numerical and UI/playback checks, not a claim of listening to the mixed output or physical-phone acceptance. The WAV remains outside the repository. Exact track-to-light synchronization is still future work; see the [service research and proposed soundtrack direction](../research/music-service-options-2026-11-10.md).
