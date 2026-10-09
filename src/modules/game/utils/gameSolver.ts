import type { GameState, Hands } from '@/modules/game/models/game.models'
import {
  applyMove,
  FINGERS_PER_HAND,
  getLegalMoves,
  isOutOfFingers,
} from '@/modules/game/utils/gameRules'

export type Outcome = 'win' | 'loss' | 'draw'

export interface Evaluation {
  outcome: Outcome
  depth: number
}

let solvedPositions: Map<number, Evaluation> | null = null

export function evaluatePosition(state: GameState): Evaluation {
  const mover = state.players[state.turn]
  const rival = state.players[state.turn === 0 ? 1 : 0]
  return getSolvedPositions().get(encode(mover, rival)) ?? { outcome: 'draw', depth: 0 }
}

function encode(mover: Hands, rival: Hands): number {
  const base = FINGERS_PER_HAND
  return ((mover.left * base + mover.right) * base + rival.left) * base + rival.right
}

function getSolvedPositions(): Map<number, Evaluation> {
  solvedPositions ??= solveAllPositions()
  return solvedPositions
}

function solveAllPositions(): Map<number, Evaluation> {
  const evaluations = new Map<number, Evaluation>()
  const successors = new Map<number, number[]>()

  for (const [mover, rival] of allPositions()) {
    const key = encode(mover, rival)
    if (isOutOfFingers(mover)) {
      evaluations.set(key, { outcome: 'loss', depth: 0 })
    } else if (isOutOfFingers(rival)) {
      evaluations.set(key, { outcome: 'win', depth: 0 })
    } else {
      const state: GameState = { players: [mover, rival], turn: 0, winner: null }
      const next = getLegalMoves(state).map((move) => {
        const { players } = applyMove(state, move)
        return encode(players[1], players[0])
      })
      successors.set(key, next)
    }
  }

  let hasChanges = true
  while (hasChanges) {
    const updates: [number, Evaluation][] = []

    for (const [key, next] of successors) {
      if (evaluations.has(key)) continue
      const known = next.map((successor) => evaluations.get(successor))
      const losingForRival = known.filter((evaluation) => evaluation?.outcome === 'loss')

      if (losingForRival.length > 0) {
        const depth = 1 + Math.min(...losingForRival.map((evaluation) => evaluation!.depth))
        updates.push([key, { outcome: 'win', depth }])
      } else if (known.every((evaluation) => evaluation?.outcome === 'win')) {
        const depth = 1 + Math.max(...known.map((evaluation) => evaluation!.depth))
        updates.push([key, { outcome: 'loss', depth }])
      }
    }

    updates.forEach(([key, evaluation]) => evaluations.set(key, evaluation))
    hasChanges = updates.length > 0
  }

  for (const key of successors.keys()) {
    if (!evaluations.has(key)) evaluations.set(key, { outcome: 'draw', depth: 0 })
  }
  return evaluations
}

function* allPositions(): Generator<[Hands, Hands]> {
  const values = Array.from({ length: FINGERS_PER_HAND }, (_, index) => index)
  for (const a of values)
    for (const b of values)
      for (const c of values)
        for (const d of values)
          yield [
            { left: a, right: b },
            { left: c, right: d },
          ]
}
