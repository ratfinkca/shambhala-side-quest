# Arcade welcome

Approved in chat: finish pixel menus, default new profiles to Neon, redraw AMP backstage, visual help and optional demo, first-play Character confirmation, brief skippable arrival and menu music. Fractal's future bonus and theme unlocks remain deferred.

## Experience

- New profiles use Neon Field Trip; valid saved preferences, Surprise and recovered-run themes remain intact.
- First Play opens Character once with a prominent “That's me — let's go!” action; existing appearance is retained and accepting a starter takes one tap. Full customization remains available. Pending mode is retained without creating a scored run until confirmation. Resume is never gated.
- Replace long mandatory rules with an objective and three illustrated essentials: sparks, smooth passes, Bass Head. Controls match the selected input. Advanced rules remain available through expandable tips.
- Optional Show me opens a short replayable, skippable demonstration using production sprites. It never writes progress, starts online runs or produces playtest events.
- A brief skippable animated welcome and original phrase-structured menu loop make the title feel alive. Sound starts from a gesture, respects mute and separate volumes, stops when hidden and never overlaps gameplay. Reduced-motion users receive a static alternative.
- Pixel styling covers secondary controls and labels while copy stays readable. Phone portrait/landscape and keyboard operation remain first-class.
- Added during implementation: title-screen Install / Add to Home Screen help, with short iOS, Android and desktop instructions and native installation only when the browser offers it. Already-installed sessions are acknowledged. No forced prompt.
- AMP backstage gets a rich illustrated pixel plate with grilled-cheese vendor, S2 booth, warm light/steam and a clear readable floor. Delivery routes, scoring, recipients and challenge behavior stay unchanged.

## Approach

Use existing DOM menus, modular character sprites, Web Audio and Phaser renderers. A standalone scripted demo is smaller and safer than shipping developer rehearsals. A compact first-play confirmation avoids mandatory customization or a long tutorial. Reuse the existing settings/audio lifecycle rather than introducing another independent soundtrack.

## Boundaries

Both editions keep isolated profiles and all modes, pause/recovery, opt-in sharing and old scores. No backend changes, leaderboard reset, secret-stage spoilers, new Fractal venue or style locks. Preview locally; publishing is a separate request.
