import { describe, expect, it } from 'vitest'
import type { GameState } from '../game.models'
import { applyMove, createInitialState, getLegalMoves, passTurn } from '../gameRules'

function stateWith(
  own: [number, number],
  rival: [number, number],
  turn: GameState['turn'] = 0,
): GameState {
  const players: GameState['players'] = [
    { left: own[0], right: own[1] },
    { left: rival[0], right: rival[1] },
  ]
  if (turn === 1) players.reverse()
  return { players, turn, winner: null }
}

describe('gameRules', () => {
  it('starts with one finger per hand and player 0 to move', () => {
    const state = createInitialState()

    expect(state.players).toEqual([
      { left: 1, right: 1 },
      { left: 1, right: 1 },
    ])
    expect(state.turn).toBe(0)
    expect(state.winner).toBeNull()
  })

  it('adds the attacking fingers to the touched hand and passes the turn', () => {
    const next = applyMove(createInitialState(), { type: 'attack', from: 'left', to: 'right' })

    expect(next.players[1]).toEqual({ left: 1, right: 2 })
    expect(next.players[0]).toEqual({ left: 1, right: 1 })
    expect(next.turn).toBe(1)
  })

  it('wraps around past five fingers', () => {
    const next = applyMove(stateWith([3, 1], [4, 1]), { type: 'attack', from: 'left', to: 'left' })

    expect(next.players[1].left).toBe(2)
  })

  it('kills a hand that reaches exactly five', () => {
    const next = applyMove(stateWith([3, 1], [2, 1]), { type: 'attack', from: 'left', to: 'left' })

    expect(next.players[1].left).toBe(0)
    expect(next.winner).toBeNull()
  })

  it('does not allow attacking with or against a dead hand', () => {
    const moves = getLegalMoves(stateWith([0, 3], [3, 0]))

    expect(moves).toEqual([{ type: 'attack', from: 'right', to: 'left' }])
    expect(() =>
      applyMove(stateWith([0, 3], [3, 0]), { type: 'attack', from: 'right', to: 'right' }),
    ).toThrow('Illegal move')
  })

  it.each([
    [[2, 0], 1],
    [[0, 4], 2],
  ] as const)('splits %j into %i fingers per hand', (own, half) => {
    const next = applyMove(stateWith([own[0], own[1]], [1, 1]), { type: 'split' })

    expect(next.players[0]).toEqual({ left: half, right: half })
    expect(next.turn).toBe(1)
  })

  it.each([
    [1, 1],
    [3, 0],
    [2, 1],
    [1, 0],
  ] as const)('does not allow splitting %i-%i', (left, right) => {
    const moves = getLegalMoves(stateWith([left, right], [1, 1]))

    expect(moves.some((move) => move.type === 'split')).toBe(false)
  })

  it('declares the attacker winner when the rival runs out of fingers', () => {
    const next = applyMove(stateWith([1, 3], [0, 2], 1), {
      type: 'attack',
      from: 'right',
      to: 'right',
    })

    expect(next.players[0]).toEqual({ left: 0, right: 0 })
    expect(next.winner).toBe(1)
    expect(getLegalMoves(next)).toEqual([])
  })
})

describe('passTurn', () => {
  it('hands the turn to the rival without touching the hands', () => {
    const state = stateWith([2, 3], [1, 4])

    const next = passTurn(state)

    expect(next.turn).toBe(1)
    expect(next.players).toEqual(state.players)
  })
})
