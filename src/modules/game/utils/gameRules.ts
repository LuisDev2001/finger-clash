import type {
  GameState,
  HandSide,
  Hands,
  Move,
  PlayerIndex,
} from '@/modules/game/models/game.models'

export const FINGERS_PER_HAND = 5
export const HAND_SIDES: readonly HandSide[] = ['left', 'right']
export const REPETITION_LIMIT = 3

export function createInitialState(firstTurn: PlayerIndex = 0): GameState {
  return {
    players: [
      { left: 1, right: 1 },
      { left: 1, right: 1 },
    ],
    turn: firstTurn,
    winner: null,
  }
}

export function getOpponent(player: PlayerIndex): PlayerIndex {
  return player === 0 ? 1 : 0
}

export function addFingers(current: number, added: number): number {
  return (current + added) % FINGERS_PER_HAND
}

export function canSplit(hands: Hands): boolean {
  const total = hands.left + hands.right
  const hasEmptyHand = hands.left === 0 || hands.right === 0
  return hasEmptyHand && total > 0 && total % 2 === 0
}

export function isOutOfFingers(hands: Hands): boolean {
  return hands.left === 0 && hands.right === 0
}

export function getLegalMoves(state: GameState): Move[] {
  if (state.winner !== null) return []

  const own = state.players[state.turn]
  const rival = state.players[getOpponent(state.turn)]
  const moves: Move[] = []

  for (const from of HAND_SIDES) {
    if (own[from] === 0) continue
    for (const to of HAND_SIDES) {
      if (rival[to] > 0) moves.push({ type: 'attack', from, to })
    }
  }
  if (canSplit(own)) moves.push({ type: 'split' })

  return moves
}

export function isLegalMove(state: GameState, move: Move): boolean {
  return getLegalMoves(state).some((legal) => isSameMove(legal, move))
}

export function applyMove(state: GameState, move: Move): GameState {
  if (!isLegalMove(state, move)) {
    throw new Error(`Illegal move: ${JSON.stringify(move)}`)
  }

  const turn = state.turn
  const opponent = getOpponent(turn)
  const players: [Hands, Hands] = [{ ...state.players[0] }, { ...state.players[1] }]
  const own = players[turn]
  const rival = players[opponent]

  if (move.type === 'attack') {
    rival[move.to] = addFingers(rival[move.to], own[move.from])
  } else {
    const half = (own.left + own.right) / 2
    own.left = half
    own.right = half
  }

  return {
    players,
    turn: opponent,
    winner: isOutOfFingers(rival) ? turn : null,
  }
}

export function getPositionKey({ players, turn }: GameState): string {
  const [first, second] = players
  return `${turn}:${first.left}${first.right}-${second.left}${second.right}`
}

export function passTurn(state: GameState): GameState {
  if (state.winner !== null) return state
  return { ...state, turn: getOpponent(state.turn) }
}

function isSameMove(a: Move, b: Move): boolean {
  if (a.type === 'split' || b.type === 'split') return a.type === b.type
  return a.from === b.from && a.to === b.to
}
