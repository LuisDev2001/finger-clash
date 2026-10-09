import type { CpuLevel } from '@/modules/settings/models/settings.models'
import type { GameState, Move } from '@/modules/game/models/game.models'
import { applyMove, getLegalMoves, getOpponent } from '@/modules/game/utils/gameRules'
import { evaluatePosition } from '@/modules/game/utils/gameSolver'

type Random = () => number

export function chooseCpuMove(
  state: GameState,
  level: CpuLevel = 'medium',
  random: Random = Math.random,
): Move {
  const moves = getLegalMoves(state)
  if (moves.length === 0) throw new Error('No legal moves available')

  if (level === 'easy') return pickRandom(moves, random)
  if (level === 'hard') return chooseBestMove(state, moves, random)
  return chooseHeuristicMove(state, moves, random)
}

function chooseHeuristicMove(state: GameState, moves: Move[], random: Random): Move {
  const winningMove = moves.find((move) => applyMove(state, move).winner === state.turn)
  if (winningMove) return winningMove

  const safeMoves = moves.filter((move) => !canWinNextTurn(applyMove(state, move)))
  const candidates = safeMoves.length > 0 ? safeMoves : moves
  const handKillingMoves = candidates.filter((move) => killsRivalHand(state, move))

  return pickRandom(handKillingMoves.length > 0 ? handKillingMoves : candidates, random)
}

function chooseBestMove(state: GameState, moves: Move[], random: Random): Move {
  const scored = moves.map((move) => ({ move, score: scoreMove(state, move) }))
  const bestScore = Math.max(...scored.map(({ score }) => score))
  return pickRandom(
    scored.filter(({ score }) => score === bestScore).map(({ move }) => move),
    random,
  )
}

function scoreMove(state: GameState, move: Move): number {
  const next = applyMove(state, move)
  if (next.winner === state.turn) return 1000

  const { outcome, depth } = evaluatePosition(next)
  if (outcome === 'loss') return 1000 - depth
  if (outcome === 'win') return -1000 + depth
  return 0
}

function canWinNextTurn(state: GameState): boolean {
  return getLegalMoves(state).some((move) => applyMove(state, move).winner === state.turn)
}

function killsRivalHand(state: GameState, move: Move): boolean {
  if (move.type !== 'attack') return false
  const rival = getOpponent(state.turn)
  return applyMove(state, move).players[rival][move.to] === 0
}

function pickRandom(moves: Move[], random: Random): Move {
  return moves[Math.floor(random() * moves.length)] ?? moves[0]!
}
