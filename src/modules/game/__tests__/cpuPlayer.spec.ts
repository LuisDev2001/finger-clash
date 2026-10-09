import { describe, expect, it } from 'vitest'
import type { GameState } from '../game.models'
import { chooseCpuMove } from '../cpuPlayer'
import { applyMove, getLegalMoves } from '../gameRules'
import { evaluatePosition } from '../gameSolver'

function cpuTurn(human: [number, number], cpu: [number, number]): GameState {
  return {
    players: [
      { left: human[0], right: human[1] },
      { left: cpu[0], right: cpu[1] },
    ],
    turn: 1,
    winner: null,
  }
}

describe('chooseCpuMove', () => {
  it.each(['normal', 'hard'] as const)('takes an immediate win on %s', (level) => {
    const state = cpuTurn([0, 2], [1, 3])

    const move = chooseCpuMove(state, level, () => 0)

    expect(applyMove(state, move).winner).toBe(1)
  })

  it('avoids moves that let the human win next turn on normal', () => {
    const state = cpuTurn([1, 3], [0, 1])

    for (const roll of [0, 0.5, 0.99]) {
      expect(chooseCpuMove(state, 'normal', () => roll)).toEqual({
        type: 'attack',
        from: 'right',
        to: 'left',
      })
    }
  })

  it('prefers the outcome the solver rates best on hard', () => {
    const rank = { loss: 2, draw: 1, win: 0 }
    const state = cpuTurn([1, 3], [0, 1])
    const bestRank = Math.max(
      ...getLegalMoves(state).map((move) => rank[evaluatePosition(applyMove(state, move)).outcome]),
    )

    for (const roll of [0, 0.5, 0.99]) {
      const next = applyMove(
        state,
        chooseCpuMove(state, 'hard', () => roll),
      )
      expect(rank[evaluatePosition(next).outcome]).toBe(bestRank)
    }
  })

  it.each(['easy', 'normal', 'hard'] as const)(
    'always returns a legal move on %s even when every option loses',
    (level) => {
      const state = cpuTurn([4, 4], [0, 1])

      const move = chooseCpuMove(state, level, () => 0.5)

      expect(getLegalMoves(state)).toContainEqual(move)
    },
  )
})

describe('evaluatePosition', () => {
  it('rates a position with an immediate win as a win in one move', () => {
    expect(evaluatePosition(cpuTurn([0, 2], [1, 3]))).toEqual({ outcome: 'win', depth: 1 })
  })

  it('rates a position as lost when every move hands the rival a win', () => {
    expect(evaluatePosition(cpuTurn([4, 4], [0, 1])).outcome).toBe('loss')
  })
})
