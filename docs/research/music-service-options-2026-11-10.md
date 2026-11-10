# Music service options for the SMF edition

Verified: **2026-11-10 07:28 UTC**. Status: research and proposed direction; no service integration or public music licence obtained. Provider policies can change.

## Findings

- **Account access is not music permission.** SoundCloud supports OAuth 2.1 with PKCE, including user authorization and server-side token exchange. Signing in enables account-scoped operations; it does not clear music for game use. [Official API guide](https://developers.soundcloud.com/docs/api/guide)
- **SoundCloud is not an automatically cleared game catalogue.** Its help page lists mixing music into games among unsupported public-API uses. Its more specific terms allow game/audiovisual incorporation only with all relevant rightsholder licences, including synchronization licences. Commercial use is separately restricted; case-by-case approval is possible. SoundCloud Go content requires a separate written agreement. Resolve the intended use with SoundCloud before building around its API. [Public API guidance](https://help.soundcloud.com/hc/en-us/articles/115003446727-SoundCloud-Public-APIs), [API terms](https://developers.soundcloud.com/docs/api/terms-of-use)
- **Metadata is not a lighting cue sheet.** The official SoundCloud schema includes tempo, key, duration and waveform URL fields. No beat-grid, bar or section-analysis endpoint was found in the inspected specification. Do not assume these fields provide reliable drops or phrase boundaries. API terms also restrict ripping/copying, persistent downloads, fingerprints and AI processing. [Official OpenAPI specification](https://developers.soundcloud.com/docs/api/explorer/api.json)
- **Spotify is unsuitable for this integration under its published developer policy.** It prohibits games, audiovisual synchronization, mixing/overlapping its content with other audio, and content analysis. Player login or Premium does not remove those restrictions. [Developer policy](https://developer.spotify.com/policy)

## Recommended next steps

1. Keep **local-file rehearsal** for private auditioning. The user supplied the Moontricks “Hellhound” Woofax/Bryx remix after following its free-download path. That supplies a local file; it does **not by itself establish permission to distribute or synchronize it in the public game**. No public permission has been verified.
2. Build a small **SMF artist-approved soundtrack catalogue**, starting with one suitable track per venue. Obtain permission from the relevant recording and composition rightsholders for game use, distribution, visual synchronization and planned analysis. Deliver cleared files through our own storage/CDN, with artist credits and official listening links.
3. Prepare a reviewed cue sheet per track: tempo, downbeat offset, phrase boundaries, breakdowns, builds, drops and playable excerpt. Add live frequency/energy response for movement; use authored cues for deliberate show structure.
4. Drive lighting from actual audio playback time so pause, seek and buffering remain aligned. Keep music selection separate from fair, deterministic gameplay rules.

This architecture is a design recommendation, not a provider guarantee. No third-party catalogue was verified as offering an off-the-shelf licence covering this game's soundtrack and analysis requirements.
