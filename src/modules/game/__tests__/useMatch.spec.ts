import { describe, expect, it, vi } from 'vitest'
import { effectScope, nextTick, ref } from 'vue'
import { useMatch } from '@/modules/game/composables/useMatch'
import type { PlayerIndex, RoundResult } from '@/modules/game/models/game.models'

function setup(targetWins = 3) {
  const scope = effectScope()
  const roundResult = ref<RoundResult | null>(null)
  const startRound = vi.fn<(firstTurn: PlayerIndex) => void>(() => {
    roundResult.value = null
  })
  const match = scope.run(() => useMatch({ targetWins, roundResult, startRound }))!

  async function finishRound(result: RoundResult) {
    roundResult.value = result
    await nextTick()
  }

  return { match, scope, startRound, finishRound }
}

describe('useMatch', () => {
  it('counts wins and draws and alternates who starts each round', async () => {
    const { match, scope, startRound, finishRound } = setup()

    await finishRound({ kind: 'win', winner: 1 })
    match.nextRound()
    await finishRound({ kind: 'draw' })
    match.nextRound()

    expect(match.score.value).toEqual({ wins: [0, 1], draws: 1 })
    expect(match.roundNumber.value).toBe(3)
    expect(startRound.mock.calls).toEqual([[1], [0]])
    expect(match.isMatchOver.value).toBe(false)
    scope.stop()
  })

  it('ends the match when a player reaches the target and restarts on the next round', async () => {
    const { match, scope, startRound, finishRound } = setup(2)

    await finishRound({ kind: 'win', winner: 0 })
    match.nextRound()
    await finishRound({ kind: 'win', winner: 0 })

    expect(match.matchWinner.value).toBe(0)
    expect(match.isMatchOver.value).toBe(true)

    match.nextRound()
    expect(match.score.value).toEqual({ wins: [0, 0], draws: 0 })
    expect(match.roundNumber.value).toBe(1)
    expect(startRound).toHaveBeenLastCalledWith(0)
    scope.stop()
  })
})
