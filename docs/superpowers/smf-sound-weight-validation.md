# SMF sound weight — local validation

2026-11-09. [Plan](plans/2026-11-09-smf-sound-weight.md). Branch `codex/edition-split-plan`; local rehearsal only, no release or backend changes.

## Result

All six main venues have fuller original synthesized arrangements and a shared native Web Audio instrument rack. Kicks retain low body after their pitch attack; snares combine pitched body and filtered snap; centred sub is supported by audible bass harmonics for the owner's primary laptop-speaker listening. Filtered stereo chords/leads and finite short echoes provide space. Venue-specific rhythms/notes retain their canonical clocks, with phrase-end lifts, brief rhythm gaps and impacts preparing drops. Musical drops continue beyond the separate four-second scoring bonus.

The rack is injected only into SMF venue rehearsal through the existing lazy audio adapter. Generic music and feedback effects retain their path. Source counts are bounded at 96; stop/mute/pause/stage changes dispose the entire musical graph, including wet tails. No dependencies, recorded music assets, scoring, timing or lighting changes.

The collapsed Sound Check panel renders the same eight-bar build/drop with either the new graph/arrangement or a frozen original sketch. Clips are produced locally, matched to a common RMS target with peak headroom, played using native controls and downloadable as WAV. Rendering and clip playback pause gameplay. Start/resume (including Escape), venue changes, sound toggles and hiding the page stop the clip. Temporary URLs/listeners are removed on disposal.

## Verification

- Full suite: **351 passing**. Focused coverage includes bounded layered voices, scheduled filter onset, deterministic noise, finite envelopes/tails, graph cancellation, lazy adapter injection, generic isolation, playback/keyboard listener lifecycle, musical structure, exact 128-step comparison windows, onset ordering and stereo WAV output.
- Default production build passed. Generic and SMF build/asset isolation checks passed; invalid edition rejected. Existing large Phaser bundle warning remains.
- Independent review issues resolved: anchor filter automation at note onset; reject partial offline scheduling failures without leaving suspension gates blocked; avoid fractional-tempo excerpts including a ninth bar; sort swung events by actual onset; pause live gameplay when a prepared clip is played. Final follow-up review found no new blocker.
- Actual native OfflineAudioContext renders succeeded for one eight-bar build/drop passage in **each of the six venues**. Every sample was finite; no clipping or dropped voices. At the live default music-bus gain, peaks ranged 0.161–0.199 and RMS 0.043–0.057. Peak simultaneous sources 26–29, below 96; all sources ended by the render tail. These are excerpt renders, not whole-track audio renders.
- AMP's original sketch also rendered successfully. Both versions use the same passage and matched average comparison level. The delivered fuller AMP WAV is stereo 44.1 kHz, 14.214 seconds, measured RMS 0.075 and peak 0.260 after comparison gain.
- Live browser: sample playback advanced from 0.156 to 4.593 seconds while gameplay stayed paused. Sound off stopped it. Resume continued gameplay with the clip paused. Starting the sample during gameplay paused the game; Start fresh stopped the clip and reset active time to 0. Escape from the focused arena resumed gameplay with the clip paused. Phone width 390×844 had no horizontal overflow, one canvas and fully visible comparison controls. No console warnings/errors in the final session.
- Final tab: AMP paused, fuller clip prepared, viewport override reset. Preview: `http://127.0.0.1:5191/?rehearsal&venues`.

## Artifacts and acceptance limits

Artifacts in `/Users/mother/.codex/visualizations/2026/10/13/01a1368f-7ce7-7722-a6bd-8509627b4e12`:

- `smf-amp-full-sound-check.wav`: final audible preview.
- `smf-sound-render-metrics.json`: all-six browser render diagnostics.
- `smf-sound-check-phone.jpg`: phone-width comparison panel and arena.

Waveform checks and functioning playback do not establish perceived sound quality. Owner listening on laptop speakers, headphones and larger systems remains the acceptance step. Phone-sized browser inspection does not establish physical-phone audio/CPU performance. Future visual spectacle/lasers are intentionally a later pass. Nothing was pushed, merged or deployed.
