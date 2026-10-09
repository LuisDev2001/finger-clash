import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { effectScope } from 'vue'
import { MOVE_DURATION_MS, useGame, type GameOptions } from '@/modules/game/composables/useGame'

function setup(options: Partial<GameOptions> = {}) {
  const scope = effectScope()
  const game = scope.run(() =>
    useGame({ mode: 'local', cpuLevel: 'medium', turnSeconds: 20, ...options }),
  )!
  return { game, scope }
}

describe('useGame turn timer', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('passes the turn when the time runs out', () => {
    const { game, scope } = setup()
    game.selectHand(0, 'left')

    vi.advanceTimersByTime(19_000)
    expect(game.remainingSeconds.value).toBe(1)
    expect(game.state.value.turn).toBe(0)

    vi.advanceTimersByTime(1_100)
    expect(game.state.value.turn).toBe(1)
    expect(game.selectedHand.value).toBeNull()
    expect(game.lastEvent.value).toMatchObject({ kind: 'timeout', player: 0 })
    expect(game.remainingSeconds.value).toBe(20)
    scope.stop()
  })

  it('restarts the clock for the next player after a move', () => {
    const { game, scope } = setup()

    vi.advanceTimersByTime(15_000)
    game.selectHand(0, 'left')
    game.selectHand(1, 'right')
    expect(game.remainingSeconds.value).toBeNull()

    vi.advanceTimersByTime(MOVE_DURATION_MS)
    expect(game.state.value.turn).toBe(1)
    expect(game.remainingSeconds.value).toBe(20)
    scope.stop()
  })

  it('does not run a clock when the time limit is off', () => {
    const { game, scope } = setup({ turnSeconds: 0 })

    vi.advanceTimersByTime(60_000)

    expect(game.remainingSeconds.value).toBeNull()
    expect(game.state.value.turn).toBe(0)
    scope.stop()
  })
})
