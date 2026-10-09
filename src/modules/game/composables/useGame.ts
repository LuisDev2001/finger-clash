import { computed, onScopeDispose, ref } from 'vue'
import type { CpuLevel, GameMode } from '@/modules/settings/models/settings.models'
import type {
  GameState,
  HandSide,
  Move,
  PlayerIndex,
  RoundResult,
} from '@/modules/game/models/game.models'
import {
  applyMove,
  createInitialState,
  getLegalMoves,
  getOpponent,
  getPositionKey,
  passTurn,
  REPETITION_LIMIT,
} from '@/modules/game/utils/gameRules'
import { chooseCpuMove } from '@/modules/game/utils/cpuPlayer'

export interface GameOptions {
  mode: GameMode
  cpuLevel: CpuLevel
  turnSeconds: number
}

export interface ActiveMove {
  id: number
  player: PlayerIndex
  move: Move
  before: GameState
}

export type GameEvent =
  ({ kind: 'move' } & ActiveMove) | { kind: 'timeout'; id: number; player: PlayerIndex }

export const HUMAN: PlayerIndex = 0
export const CPU: PlayerIndex = 1
export const MOVE_CONTACT_MS = 320
export const MOVE_DURATION_MS = 640
export const URGENT_SECONDS = 5
const CPU_THINK_MS = 650
const TIMER_TICK_MS = 100

export function useGame(options: GameOptions) {
  const state = ref<GameState>(createInitialState())
  const isDraw = ref(false)
  const repetitionCount = ref(0)
  const positionCounts = new Map<string, number>()
  const selectedHand = ref<HandSide | null>(null)
  const activeMove = ref<ActiveMove | null>(null)
  const lastEvent = ref<GameEvent | null>(null)
  const turnDeadline = ref<number | null>(null)
  const now = ref(Date.now())
  const timers = new Set<ReturnType<typeof setTimeout>>()
  let turnTicker: ReturnType<typeof setInterval> | undefined
  let eventCount = 0

  const roundResult = computed<RoundResult | null>(() => {
    if (state.value.winner !== null) return { kind: 'win', winner: state.value.winner }
    return isDraw.value ? { kind: 'draw' } : null
  })
  const isRoundOver = computed(() => roundResult.value !== null)
  const isCpuTurn = computed(
    () => options.mode === 'cpu' && state.value.turn === CPU && !isRoundOver.value,
  )
  const isInputLocked = computed(
    () => activeMove.value !== null || isCpuTurn.value || isRoundOver.value,
  )
  const canSplitNow = computed(
    () => !isInputLocked.value && getLegalMoves(state.value).some((move) => move.type === 'split'),
  )
  const remainingMs = computed(() =>
    turnDeadline.value === null ? null : Math.max(0, turnDeadline.value - now.value),
  )
  const remainingSeconds = computed(() =>
    remainingMs.value === null ? null : Math.ceil(remainingMs.value / 1000),
  )

  function later(ms: number, callback: () => void) {
    const id = setTimeout(() => {
      timers.delete(id)
      callback()
    }, ms)
    timers.add(id)
  }

  function clearTimers() {
    timers.forEach(clearTimeout)
    timers.clear()
    stopTurnTimer()
  }

  function setState(next: GameState) {
    state.value = next
    const key = getPositionKey(next)
    const count = (positionCounts.get(key) ?? 0) + 1
    positionCounts.set(key, count)
    repetitionCount.value = count
    if (next.winner === null && count >= REPETITION_LIMIT) isDraw.value = true
  }

  function startTurnTimer() {
    stopTurnTimer()
    if (options.turnSeconds <= 0 || isRoundOver.value || isCpuTurn.value) return

    now.value = Date.now()
    turnDeadline.value = now.value + options.turnSeconds * 1000
    turnTicker = setInterval(() => {
      now.value = Date.now()
      if (turnDeadline.value !== null && now.value >= turnDeadline.value) timeOut()
    }, TIMER_TICK_MS)
  }

  function stopTurnTimer() {
    clearInterval(turnTicker)
    turnTicker = undefined
    turnDeadline.value = null
  }

  function timeOut() {
    stopTurnTimer()
    lastEvent.value = { kind: 'timeout', id: ++eventCount, player: state.value.turn }
    selectedHand.value = null
    setState(passTurn(state.value))
    beginTurn()
  }

  function beginTurn() {
    if (isRoundOver.value) return
    if (isCpuTurn.value) {
      later(CPU_THINK_MS, () => play(chooseCpuMove(state.value, options.cpuLevel)))
      return
    }
    startTurnTimer()
  }

  function play(move: Move) {
    stopTurnTimer()
    const before = state.value
    const entry: ActiveMove = { id: ++eventCount, player: before.turn, move, before }
    activeMove.value = entry
    lastEvent.value = { kind: 'move', ...entry }
    selectedHand.value = null

    later(MOVE_CONTACT_MS, () => {
      setState(applyMove(before, move))
    })
    later(MOVE_DURATION_MS, () => {
      activeMove.value = null
      beginTurn()
    })
  }

  function selectHand(player: PlayerIndex, side: HandSide) {
    if (isInputLocked.value) return

    const current = state.value.turn
    if (player === current) {
      if (state.value.players[current][side] === 0) return
      selectedHand.value = selectedHand.value === side ? null : side
      return
    }

    const isTargetAlive = state.value.players[getOpponent(current)][side] > 0
    if (selectedHand.value && isTargetAlive) {
      play({ type: 'attack', from: selectedHand.value, to: side })
    }
  }

  function split() {
    if (canSplitNow.value) play({ type: 'split' })
  }

  function restart(firstTurn: PlayerIndex = 0) {
    clearTimers()
    positionCounts.clear()
    isDraw.value = false
    setState(createInitialState(firstTurn))
    selectedHand.value = null
    activeMove.value = null
    lastEvent.value = null
    beginTurn()
  }

  setState(state.value)
  beginTurn()
  onScopeDispose(clearTimers)

  return {
    state,
    selectedHand,
    activeMove,
    lastEvent,
    roundResult,
    repetitionCount,
    remainingMs,
    remainingSeconds,
    isCpuTurn,
    isInputLocked,
    canSplitNow,
    selectHand,
    split,
    restart,
  }
}
