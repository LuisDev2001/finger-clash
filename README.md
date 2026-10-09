# Finger Clash

A small finger-counting game (a take on "Chopsticks") built with Vue 3, TypeScript and Vite.

## Rules

- Each hand starts with one finger up.
- On your turn, pick one of your hands and tap a rival hand: it gains your fingers.
- Totals wrap around five (3 + 4 = 7 → 2). Exactly five knocks the hand out.
- Split: when one hand is empty and the other holds 2 or 4, share them evenly.
- Each turn has a time limit (20 s by default); when it runs out, that player loses the turn.
- Whoever runs out of fingers on both hands loses the round.
- If the same position (hands and turn) appears three times, the round is a draw.
- A match is played to 1, 3 (default) or 5 wins; the starting player alternates each round.

Play against the CPU (easy, medium or hard) or with two players on the same screen. Settings
(mode, CPU level, match length, turn time, music and effects volume) are stored in the browser.

Music and sound effects are synthesized at runtime with the Web Audio API, so there are no audio assets.

## Scripts

```sh
pnpm install
pnpm dev          # local dev server
pnpm test:unit    # Vitest
pnpm type-check
pnpm lint
pnpm build
```

## Structure

Screaming architecture: each business domain owns its views, components, composables, models and
utils. Imports always use the `@/` alias.

```
src/
  router/                  routes: / (home), /settings, /game
  assets/main.css          Tailwind CSS v4 entry and theme tokens
  shared/components/       BaseButton, HandArt (used by several modules)
  modules/
    home/                  HomeView, GameLogo, TermsDialog
    settings/              SettingsView, OptionGroup, useSettings, parseSettings
    game/                  GameView, PlayerHand, TurnTimer, useGame, useMoveAnimation,
                           useGameSounds, gameRules, gameSolver, cpuPlayer
    audio/                 audioEngine (Web Audio), useAppAudio
```

Stack: Vue 3, Vue Router, Tailwind CSS v4, TypeScript, Vite, Vitest.
