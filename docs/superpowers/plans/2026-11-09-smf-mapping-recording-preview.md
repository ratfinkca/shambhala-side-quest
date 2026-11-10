# SMF projection energy and local recording preview

**Goal:** Respond to the owner's next visual pass and make a private real-track comparison possible during venue practice.

**Design:** Project bolder moving colour onto the existing measured venue surfaces. Grove's cloth stays physically attached while mapped petals and coloured waves create motion; timber inlays receive larger moving patterns. AMP has saturated filled tunnel bands rather than faint outlines. Pagoda has animated facet projections, preserving arch openings. Village keeps fixed wooden masks with larger negative spaces and higher-contrast light behind them. Preserve the current floor boundaries, no frantic strobes, frozen reduced motion and musical-clock pause behaviour.

**Music:** The requested track is Moontricks — Hellhound (Woofax & Bryx Remix), listed by Woofax as a free download. The official Hypeddit path requires account support actions. The owner supplied the officially downloaded WAV after completing the follow/repost gate. A DEV-only local file selector replaces synthesized practice music, retains gameplay sounds, and provides a cue offset. The file stays in memory on that device, with no upload, persistence or bundled recording. It is an audition: canonical scoring/light timing stays unchanged until the actual recording is analyzed and authored cues are approved. Public reuse permission has not been verified. No automatic song download or production integration.

## Tasks

- [x] Add surface-confined Grove/Pagoda projection helpers and integrate measured canopy/timber/facade regions; preserve static architecture.
- [x] Strengthen AMP screen visual composition and enlarge Village openings with bounded geometry tests.
- [x] Add private local-track audition controls and lifecycle adapter; verify source switching, pause/resume, restart, mute, hidden-tab/cleanup and isolation from ordinary play.
- [x] Inspect actual phone/desktop rendering and interactions; run focused/full tests and both edition checks. Record the remaining file/analysis and physical-phone limits.
- [x] Update handoff/roadmap and save local work. No deployment requested.

## Review focus

- The canopy and projection animation must be obvious at phone width without hiding venue structure or game actors.
- Saturated light remains within the mapped panels. Timber mask shape is fixed; illuminated negative space moves behind it.
- Sound source switches cannot double-play synth and recording, leave audio running while paused, or retry blocked play each frame.
- Local file selection must never send a recording to a service or include it in builds. Canonical stage rhythm is not represented as synchronized to an unanalyzed recording.
- Reduced motion, scene disposal and generic edition boundaries stay intact.

## Supplied reference recording

Moontricks — Hellhound (Woofax & Bryx Remix), supplied as a local WAV outside the repository. Verified metadata: stereo, 44.1 kHz, 16-bit PCM, 254.454694 seconds. Numerical onset-envelope analysis supports approximately 174 BPM (87 BPM half-time); long-period estimates were 173.994–174.012 BPM. Inferred energy changes align near 66.207s, 132.414s, 154.483s and 220.690s. These are waveform-derived candidates, not a listening-certified cue sheet or claims about vocals.

First audition cue: 132.4s, approximately 16 bars before the second full-energy section. A 48-bar selection at 174 BPM lasts 66.207s. The current canonical Village rehearsal remains 172 BPM / 48 bars, so this first comparison preserves timing and does not claim beat-locked lights or scoring. A later accepted recorded-track integration needs an authored cue sheet and rights confirmation for publication; no recording is distributed in this preview.

## Verification

- 388 automated tests pass; default build and generic/SMF edition allowlist/reference checks pass. Existing large-bundle advisory remains. Independent mapping and audition reviews found no blockers.
- Four revised venues inspected in the running browser at390×844 and1280×900. Pagoda received a second contrast correction after the initial pastel treatment remained hard to see. Canopy motion is projected light; the illustration remains physically fixed.
- Actual supplied WAV loaded through the ordinary local file chooser, selected at132.4s and shown playing. Pause held139.2s across observations; resume/mute/restart exercised. Restart returned to132.4s. The round finished at66.977s and stopped the recording at199.3s. Original music switching and returning to the recording were verified. Phone controls fit390px without horizontal overflow; final browser console had no warnings/errors. Village is left paused with the actual recording selected at132.4s, and the temporary viewport override is reset. This proves native playback state and integration, not subjective listening acceptance.
- Live validation caught two cue/status UI edge cases. Pause status now notifies immediately even when native media events arrive later at the same position. Draft cue text survives native media updates and is explicitly committed by Use this track, rather than depending on blur/change ordering. Both have regression coverage and the real-file flow was retested.
- Physical-phone/Safari audio and sustained graphics performance remain unmeasured. No recording asset was added to the repository, no backend changed, and nothing was deployed. The supplied WAV must be reselected after closing/reloading the preview.
