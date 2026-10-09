export type HandSide = 'left' | 'right'

export type PlayerIndex = 0 | 1

export interface Hands {
  left: number
  right: number
}

export type Move = { type: 'attack'; from: HandSide; to: HandSide } | { type: 'split' }

export interface GameState {
  players: [Hands, Hands]
  turn: PlayerIndex
  winner: PlayerIndex | null
}

export type RoundResult = { kind: 'win'; winner: PlayerIndex } | { kind: 'draw' }
