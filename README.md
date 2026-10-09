# Finger Clash

A small finger-counting game (a take on "Chopsticks") built with Vue 3, TypeScript and Vite.

## Rules

- Each hand starts with one finger up.
- On your turn, pick one of your hands and tap a rival hand: it gains your fingers.
- Totals wrap around five (3 + 4 = 7 → 2). Exactly five knocks the hand out.
- Split: when one hand is empty and the other holds 2 or 4, share them evenly.
- Each turn has a time limit (20 s by default); when it runs out, that player loses the turn.
- Whoever runs out of fingers on both hands loses.

Play against the CPU (easy, normal or hard) or with two players on the same screen. Settings
(mode, CPU level, turn time, music and effects volume) are stored in the browser.

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

- `src/modules/game`: rules (`gameRules.ts`), solver for the hard CPU (`gameSolver.ts`), CPU levels
  (`cpuPlayer.ts`), turn flow and timer (`useGame.ts`) and the board components.
- `src/modules/home`: start screen, logo, settings and terms dialogs.
- `src/modules/settings`: persisted settings.
- `src/modules/audio`: Web Audio music loop and sound effects.
