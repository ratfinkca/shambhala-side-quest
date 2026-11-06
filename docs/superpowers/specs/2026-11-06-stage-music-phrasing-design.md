# Stage music and atmosphere — phrased original arrangements

Date: 2026-11-06. Status: proposed, pending design approval. Baseline: recovery PR #19 /67c44e0.

## Intent and decisions

The user selected more stage atmosphere/music, chose richer original synthesized music over recorded tracks, and explicitly requested proper electronic music phrasing/structure across genres. Build a local listening/play preview for the existing three stages. Musical variety comes from rhythm, harmony, sound design and form, rather than arbitrary pitches or louder versions of one loop.

### Approaches considered

1. **Original synthesized arrangements — selected by the user.** Retains reactive layers, optional offline synthesis and original assets. Requires composition and a modest improvement to musical scheduling/timbres.
2. Full recorded tracks/stems. Could provide more polished production, but introduces track creation/licensing, downloads, looping and reactive-stem work. Deferred by the user's choice.
3. A fourth stage is outside this slice: it would also affect stage rotation and score validation. Existing-stage atmosphere is the builder's recommended first scope.

## Musical grid — proposed builder choice

Use **128 BPM, 4/4**, with a shared sixteenth-note grid. One beat is468.75ms, one bar1.875s, eight bars15s, sixteen bars30s, and32bars exactly60s. Gameplay drop starts at15/30/45s therefore land on bars9/17/25 without moving any scoring window or timer. This tempo is a deliberate fit for the chosen first three genre directions, not a claim that every electronic genre should use128BPM. Faster drum-and-bass or differently paced dubstep/psytrance would need their own later timing design.

Each stage is a composed32-bar game-length excerpt, not a sped-up attempt to fit an entire club track into a minute. Eight-bar phrases develop across a larger16-bar harmonic/melodic arc. Use short4-bar subphrases for call/response and restrained fills, with clear rests and releases. Main section changes, bass/harmonic changes and fills follow the grid. Avoid a fill every bar or a build/drop loop every few seconds.

Suggested form:

- Bars1–8: establish the stage's motif/groove, introduce layers deliberately, phrase-end preparation.
- Bars9–16: main groove A, with a complementary response in its second four bars.
- Bars17–24: musically related B/contrast, with its own texture/rhythm change rather than resetting the intro.
- Bars25–32: main payoff/return with a developing hook; resolve in the final one or two bars so the stage ends cleanly at60s.

This form is the builder's call, subject to listening feedback. Not every gameplay bonus window is a full musical section: retain the existing four-second2× period. Musical accents begin on its15/30/45s boundaries; the rhythmic phrase continues naturally after the bonus ends. Do not abruptly cut a note or harmonic phrase just because that four-second scoring period expired. Existing HUD/drop cues remain the authority for scoring.

## Three stage identities — proposed first collection

- **Living Forest: organic/dubby house.** Grounded four-on-the-floor kick, warm syncopated sub, woody/shaker percussion, sparse dub-style responses and evolving pads. A coherent D-minor palette, for example Dm7–Bbmaj7–Fmaj7–C(add9), with smooth voicings. Space and low-end warmth, not constant lead notes.
- **Neon Grove: electro/breakbeat bass.** Deliberately programmed syncopated kicks, recognizable backbeat, clipped bass call/response and metallic/plucked motifs. F-minor palette, for example Fm7–Dbmaj7–Eb–Cm7. A controlled half-time-feel passage may contrast the breakbeat without changing the underlying tempo or grid.
- **Sunrise Clearing: melodic/progressive house.** Rolling bass, brighter percussion, spacious chords and a memorable original bell/pluck hook. C-major palette, for example Cmaj9–Gsus2–Am7–Fmaj9. Build a16-bar melodic arc and an uplifting final phrase rather than arpeggiating continuously.

Keys/progressions and exact motifs are builder proposals, not user-specified references. Use equal-tempered note/scale/chord definitions with deliberate voice leading; frequency glides/noise sweeps are intentional sound design, not substitutes for harmony. No imitation of a commercial track or artist recording. No voice samples or downloaded music.

## Synthesis, scheduling and mix

Keep the existing lazy Web Audio context and separate music/effects volume controls. Extend it only where composition needs it: better envelopes, filtered bass/plucks and bounded stereo/space, using existing browser primitives and no packages. Bass/kick make room for each other; leave headroom and keep collectible/warning sounds intelligible. More notes or more loudness is not the goal. Delay/reverb is optional for this first pass and must not leave tails running after pause/mute/end.

Schedule grid events against AudioContext time with a small bounded lookahead; active stage time remains the transport position. Sixteenth notes, restrained intentional swing and phrase fills should not depend on a lucky rendered frame. On a stall, skip missed events rather than firing a burst. On pause/mute/stage-end, cancel every scheduled music source; reset scheduling on resume at the saved phrase position rather than restarting the intro. Keep immediate sound effects independent of lookahead. Bound active voices and disconnect ended nodes.

The base composition works at multiplier1. Combo/Flow may add a harmonically compatible embellishment, not determine whether the track sounds complete. Musical layer entries/changes land on a suitable beat/bar; effects, scoring and Flow duration remain immediate and unchanged. Never emit a queued Flow layer after the effect ended or a run paused. Keep short attacks/releases click-free and finish or fade any final-stage notes within60s.

## Coordinated lighting

One arrangement clock supplies bar/phrase/energy cues to audio and lighting. The existing six beams and canopy pools get phrase-level choreography: establishing/open fans, groove sweeps, contrasting/crossed patterns and a wider final payoff, with stage-specific pacing/palette. Beat-level breathing supports the groove; every subdivision need not flash.

Keep field coverage broad, pickups/dancers readable, no harsh strobing and no field-wide bright overlay. Keep current light alpha bounds and smooth interpolation. Reduced motion uses stable marks/lighting; it does not mute the music. Update speaker/cone/ripple beat timing to the shared128BPM clock without changing zone geometry, pressure, meter charge rates or active durations. Menu themes remain independent of stage music identity.

## Preview and acceptance

- DEV-only atmosphere lab: choose any of the three complete60s arrangements and audition opening, main groove, contrast and finale, with pause/resume/restart and current bar/phrase visible. Use temporary profiles, no real scores/XP/analytics or online tickets; fixtures/controls are excluded from production. Existing rehearsal/recovery isolation stays intact.
- Listening acceptance matters: provide all three audible previews for user comparison, not only tests proving that notes were emitted. Check ordinary speakers and headphones when available, and distinguish captured/rendered audio from a real phone listening test.
- Tests pin bar/phrase arithmetic, rhythm/harmony continuity, genre-specific accents, bounded notes/levels/voices, no missing or duplicate grid events, stalled-frame handling, cancellation, volume/mute and stage/Flow transitions.
- Browser-check play, pause, mute, menu/stage changes, reduced motion and mid-stage recovery. Recovery uses the saved elapsed time and concrete stage; it neither restarts music atbar1 nor replays missed notes. Stage rules/layouts, score validation, timers, targets, drops, candy, perks, XP and wardrobe are unchanged.
- No backend/schema/scoring-version change expected; verify this before release. Full tests/build, browser/audio evidence and independent review precede the local preview handoff. Publishing needs a separate ship request.

## Scope and open review

This is a project-sized composition/audio/lighting pass. First preview includes all three stages using a common transport and full32-bar arrangements. Defer new stages, new genres needing different tempo clocks, live-service music, loop-dependent remix systems and extra reward/balance changes.

Builder latitude: original note choices, restrained swing, instrument envelopes and fills, per-stage mix/lighting choreography, scheduler module boundaries and precise lookahead value. The user should approve the128BPM/common-grid proposal and these initial genre directions before implementation; changing gameplay timing is not authorized by this design.

## References

[Ableton Learning Music: song structure](https://learningmusic.ableton.com/song-structure/song-structure.html) explains larger sections assembled from4/8/16-bar patterns; [bars](https://learningmusic.ableton.com/make-beats/bars.html) explains the4-beat grouping used here. These support deliberate phrasing; the tempo, keys, genre choices and game-length form above are this project's proposals, not universal genre rules.
