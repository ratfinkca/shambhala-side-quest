# SMF sound weight implementation plan

**Goal:** Make the six original SMF arrangements feel fuller and more exciting, especially through laptop speakers, while retaining proper genre-specific phrasing and the established clocks.

**Context:** The owner chose richer original synthesis earlier, now reports the sketches as small/tinny and prioritizes sound before another flashier lighting/laser pass. Native browser synthesis remains the selected direction. No recorded track assets, new dependencies or scoring/timing changes are needed.

**Architecture:** Keep the lazy shared audio adapter, independent effects/music volumes and active-time transport. Inject a DEV-only SMF instrument rack through the venue configuration; generic audio stays on its current path. Original sketch notes are retained only for a local matched-level comparison.

## Tasks

- [x] Add layered instrument synthesis: rapid kick pitch attack with sustained low body; tonal snare and filtered snap; mono sub plus laptop-audible bass harmonics; filtered stereo chords/leads and short, filtered space. Bound sources and flush all playing/scheduled notes and wet tails on stop/mute/pause/stage change.
- [x] Refine six arrangements using their existing 4/8/16-bar vocabulary and genre identities. Prepare canonical drops with controlled rises, phrase-end fills and short dry gaps; keep the musical section running after the four-second scoring bonus.
- [x] Inject the rack only into venue rehearsal. Test lazy construction, volume routing, scheduling offsets and cancellation without changing generic sound effects.
- [x] Add a collapsed rehearsal Sound Check: render the same eight-bar build/drop using the real OfflineAudioContext graph, compare fuller mix/original sketch at matched average listening level with peak headroom, and save a local WAV. No network or player-data collection.
- [x] Render all six venues, inspect actual waveform peaks/RMS and source-budget diagnostics, test preview mute/pause/restart/switches, and provide audible clips for owner review. Run focused regressions, full suite, production build and edition-isolation checks. Distinguish generated audio validation from actual human listening/physical-device acceptance.

## Review focus

- Laptop audibility comes from the 100–400Hz bass body and drum transients, while deep fundamentals remain centred for larger speakers.
- Notes/envelopes fit canonical stage ends. Bass/phrase gaps create impact without changing gameplay or extending a round.
- Offline rendering feeds short chunks so it exercises the live voice limit without queueing an entire song into the source registry.
- Shared delay nodes are finite and stop discards their generation; resume cannot leak a previous stage's tail.
- Sound Check pauses gameplay and its player pauses on venue/start/resume/hidden-tab changes. Rendering stays bounded, catches errors and cleans up temporary object URLs.

## References

The existing [venue research](../../research/smf-stage-identities-2026-11-06.md) sets the six musical identities. Native nodes and offline rendering follow the [Web Audio specification](https://www.w3.org/TR/webaudio/). Synthesis choices and original notes are builder decisions, not attempts to reproduce a particular artist or recorded set.

Next visual work: greater spectacle, lasers and more animated architectural light, preserving readable gameplay and a reduced-motion presentation. No lighting changes in this sound pass.

## Delivery

Implemented and locally validated; see [sound validation](../smf-sound-weight-validation.md). Owner listening and physical-device acceptance remain open. No public release.
