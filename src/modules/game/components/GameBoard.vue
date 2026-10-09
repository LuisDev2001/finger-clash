<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { playSfx } from '@/modules/audio/audioEngine'
import {
  CPU_LEVEL_LABELS,
  formatTurnSeconds,
  MODE_LABELS,
} from '@/modules/settings/settings.models'
import { useSettings } from '@/modules/settings/useSettings'
import type { HandSide, PlayerIndex } from '../game.models'
import { getOpponent, HAND_SIDES } from '../gameRules'
import {
  CPU,
  HUMAN,
  MOVE_CONTACT_MS,
  MOVE_DURATION_MS,
  useGame,
  type ActiveMove,
  type GameEvent,
} from '../useGame'
import PlayerHand from './PlayerHand.vue'

const emit = defineEmits<{ exit: [] }>()

const { settings } = useSettings()
const options = {
  mode: settings.value.mode,
  cpuLevel: settings.value.cpuLevel,
  turnSeconds: settings.value.turnSeconds,
}

const {
  state,
  selectedHand,
  activeMove,
  lastEvent,
  remainingMs,
  remainingSeconds,
  isCpuTurn,
  isInputLocked,
  canSplitNow,
  selectHand,
  split,
  restart,
} = useGame(options)

const boardRef = ref<HTMLElement | null>(null)

const SIDE_LABELS: Record<HandSide, string> = { left: 'izquierda', right: 'derecha' }
const CUFF_COLORS: Record<PlayerIndex, string> = {
  0: 'var(--player-color)',
  1: 'var(--rival-color)',
}
const URGENT_SECONDS = 5

const isCpuMode = options.mode === 'cpu'
const hasTurnLimit = options.turnSeconds > 0
const playerNames: Record<PlayerIndex, string> = isCpuMode
  ? { 0: 'Tú', 1: 'CPU' }
  : { 0: 'Jugador 1', 1: 'Jugador 2' }

const matchLabel = [
  MODE_LABELS[options.mode],
  isCpuMode ? CPU_LEVEL_LABELS[options.cpuLevel] : null,
  formatTurnSeconds(options.turnSeconds),
]
  .filter(Boolean)
  .join(' · ')

const splitTotal = computed(() => {
  const hands = state.value.players[state.value.turn]
  return hands.left + hands.right
})

const statusText = computed(() => {
  const { turn, winner } = state.value
  if (winner !== null) return ''
  if (isCpuTurn.value) return 'La CPU está pensando…'
  const prefix = isCpuMode ? 'Tu turno' : `Turno de ${playerNames[turn]}`
  if (selectedHand.value) return `${prefix}: toca una mano rival`
  return `${prefix}: elige una de tus manos`
})

const eventSummary = computed(() => (lastEvent.value ? describeEvent(lastEvent.value) : ''))

const timerProgress = computed(() =>
  remainingMs.value === null ? 0 : remainingMs.value / (options.turnSeconds * 1000),
)
const isTimerUrgent = computed(
  () => remainingSeconds.value !== null && remainingSeconds.value <= URGENT_SECONDS,
)

const isHumanDefeated = computed(() => isCpuMode && state.value.winner === CPU)

const winnerTitle = computed(() => {
  const { winner } = state.value
  if (winner === null) return ''
  if (isCpuMode) return winner === HUMAN ? '¡Ganaste!' : 'Ganó la CPU'
  return `¡Ganó ${playerNames[winner]}!`
})

function describeEvent(event: GameEvent): string {
  const name = playerNames[event.player]
  if (event.kind === 'timeout') return `⏰ ${name} se quedó sin tiempo: pierde el turno`

  const { player, move, before } = event
  const own = before.players[player]
  if (move.type === 'split') {
    const half = (own.left + own.right) / 2
    return `${name} dividió: ${own.left + own.right} → ${half} y ${half}`
  }
  const added = own[move.from]
  const current = before.players[getOpponent(player)][move.to]
  const sum = current + added
  const result = sum % 5
  const equation =
    sum >= 5 ? `${current} + ${added} = ${sum} → ${result}` : `${current} + ${added} = ${sum}`
  const outcome = result === 0 ? ' ¡mano fuera!' : ''
  return `${name}: ${equation}${outcome}`
}

function handLabel(player: PlayerIndex, side: HandSide): string {
  const owner = isCpuMode && player === HUMAN ? 'Tu mano' : `Mano de ${playerNames[player]}`
  return `${owner} ${SIDE_LABELS[side]}`
}

function isSelectable(player: PlayerIndex, side: HandSide): boolean {
  return (
    !isInputLocked.value && player === state.value.turn && state.value.players[player][side] > 0
  )
}

function isTarget(player: PlayerIndex, side: HandSide): boolean {
  return (
    !isInputLocked.value &&
    selectedHand.value !== null &&
    player !== state.value.turn &&
    state.value.players[player][side] > 0
  )
}

function toggleMute() {
  settings.value.isMuted = !settings.value.isMuted
  playSfx('click')
}

function restartMatch() {
  playSfx('start')
  restart()
}

function exitToMenu() {
  playSfx('click')
  emit('exit')
}

function findHand(player: PlayerIndex, side: HandSide): HTMLElement | null {
  return (
    boardRef.value?.querySelector<HTMLElement>(`[data-hand="${player}-${side}"] .hand-motion`) ??
    null
  )
}

function centerOf(element: HTMLElement) {
  const rect = element.getBoundingClientRect()
  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
}

function lunge(element: HTMLElement, dx: number, dy: number) {
  element.animate?.(
    [
      { transform: 'translate(0, 0)' },
      {
        transform: `translate(${dx}px, ${dy}px) scale(1.06)`,
        offset: MOVE_CONTACT_MS / MOVE_DURATION_MS,
      },
      { transform: 'translate(0, 0)' },
    ],
    { duration: MOVE_DURATION_MS, easing: 'ease-in-out' },
  )
}

function bump(element: HTMLElement) {
  element.animate?.(
    [
      { transform: 'scale(1)' },
      { transform: 'scale(0.9) rotate(-5deg)' },
      { transform: 'scale(1.05) rotate(4deg)' },
      { transform: 'scale(1)' },
    ],
    { duration: 360, delay: MOVE_CONTACT_MS - 40, easing: 'ease-out' },
  )
}

function animateMove({ player, move }: ActiveMove) {
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return

  if (move.type === 'attack') {
    const attacker = findHand(player, move.from)
    const target = findHand(getOpponent(player), move.to)
    if (!attacker || !target) return
    const from = centerOf(attacker)
    const to = centerOf(target)
    lunge(attacker, (to.x - from.x) * 0.72, (to.y - from.y) * 0.72)
    bump(target)
    return
  }

  const left = findHand(player, 'left')
  const right = findHand(player, 'right')
  if (!left || !right) return
  const gap = (centerOf(right).x - centerOf(left).x) * 0.32
  lunge(left, gap, 0)
  lunge(right, -gap, 0)
}

function playMoveSound({ player, move, before }: ActiveMove) {
  if (move.type === 'split') {
    playSfx('split')
    return
  }
  const touched = before.players[getOpponent(player)][move.to]
  const result = (touched + before.players[player][move.from]) % 5
  const delay = MOVE_CONTACT_MS / 1000
  if (result === 0) playSfx('knockout', { delay })
  else playSfx('hit', { delay, level: result - 1 })
}

watch(activeMove, (entry) => {
  if (!entry) return
  animateMove(entry)
  playMoveSound(entry)
})

watch(selectedHand, (side) => {
  if (side) playSfx('select')
})

watch(lastEvent, (event) => {
  if (event?.kind === 'timeout') playSfx('timeout')
})

watch(remainingSeconds, (seconds, previous) => {
  if (seconds !== null && seconds !== previous && seconds > 0 && seconds <= URGENT_SECONDS) {
    playSfx('tick')
  }
})

watch(
  () => state.value.winner,
  (winner) => {
    if (winner !== null) playSfx(isHumanDefeated.value ? 'lose' : 'win', { delay: 0.35 })
  },
)
</script>

<template>
  <main ref="boardRef" class="game-board">
    <header class="board-header">
      <button type="button" class="ghost-button" @click="exitToMenu">← Menú</button>
      <p class="match-chip">{{ matchLabel }}</p>
      <div class="header-actions">
        <button
          type="button"
          class="ghost-button icon-button"
          :aria-pressed="settings.isMuted"
          :aria-label="settings.isMuted ? 'Activar sonido' : 'Silenciar'"
          @click="toggleMute"
        >
          <span aria-hidden="true">{{ settings.isMuted ? '🔇' : '🔊' }}</span>
        </button>
        <button type="button" class="ghost-button" @click="restartMatch">Reiniciar</button>
      </div>
    </header>

    <section
      v-for="player in [CPU, HUMAN] as PlayerIndex[]"
      :key="player"
      class="player-zone"
      :class="[
        player === HUMAN ? 'zone-player' : 'zone-rival',
        { 'is-turn': state.turn === player },
      ]"
    >
      <p class="player-name">
        {{ playerNames[player] }}
        <span v-if="isCpuMode && player === CPU" class="level-tag">
          {{ CPU_LEVEL_LABELS[options.cpuLevel] }}
        </span>
      </p>
      <div class="hands-row" :class="{ 'is-mirrored': player === CPU }">
        <PlayerHand
          v-for="side in HAND_SIDES"
          :key="side"
          :data-hand="`${player}-${side}`"
          :count="state.players[player][side]"
          :side="side"
          :label="handLabel(player, side)"
          :is-flipped="player === CPU"
          :is-selected="state.turn === player && selectedHand === side"
          :is-selectable="isSelectable(player, side)"
          :is-target="isTarget(player, side)"
          :cuff-color="CUFF_COLORS[player]"
          @select="selectHand(player, side)"
        />
      </div>
    </section>

    <section class="board-center">
      <div
        v-if="hasTurnLimit"
        class="turn-timer"
        :class="{ 'is-urgent': isTimerUrgent, 'is-idle': remainingSeconds === null }"
        role="timer"
        :aria-label="
          remainingSeconds === null ? 'Tiempo en pausa' : `Quedan ${remainingSeconds} segundos`
        "
      >
        <span class="timer-label" aria-hidden="true">⏱ {{ remainingSeconds ?? '–' }}</span>
        <span class="timer-track">
          <span class="timer-fill" :style="{ transform: `scaleX(${timerProgress})` }" />
        </span>
      </div>
      <p class="status" aria-live="polite">{{ statusText }}</p>
      <div class="summary-slot">
        <p v-if="eventSummary" :key="lastEvent?.id" class="move-summary">{{ eventSummary }}</p>
      </div>
      <button type="button" class="split-button" :disabled="!canSplitNow" @click="split">
        Dividir
        <span v-if="canSplitNow" class="split-detail">
          {{ splitTotal }} → {{ splitTotal / 2 }} + {{ splitTotal / 2 }}
        </span>
      </button>
    </section>

    <details class="rules">
      <summary>¿Cómo se juega?</summary>
      <ul>
        <li>Cada mano empieza con 1 dedo.</li>
        <li>En tu turno elige una de tus manos y toca una mano rival: le sumas tus dedos.</li>
        <li>
          Si pasa de 5 se vuelve a contar desde 0 (3 + 4 = 7 → 2). Con 5 exactos la mano queda
          fuera.
        </li>
        <li>Dividir: si una mano está en 0 y la otra tiene 2 o 4, repártelos a partes iguales.</li>
        <li v-if="hasTurnLimit">
          Tienes {{ options.turnSeconds }} segundos por turno; si se acaban, pierdes el turno.
        </li>
        <li>Pierde quien se queda sin dedos en ambas manos.</li>
      </ul>
    </details>

    <div
      v-if="state.winner !== null && !activeMove"
      class="winner-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="winner-title"
    >
      <div class="winner-card">
        <p class="winner-emoji" aria-hidden="true">{{ isHumanDefeated ? '🤖' : '🏆' }}</p>
        <h2 id="winner-title">{{ winnerTitle }}</h2>
        <div class="winner-actions">
          <button type="button" class="play-again" @click="restartMatch">Jugar de nuevo</button>
          <button type="button" class="ghost-button" @click="exitToMenu">Menú</button>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
.game-board {
  position: relative;
  display: grid;
  grid-template-areas:
    'header'
    'rival'
    'center'
    'player'
    'rules';
  grid-template-rows: auto 1fr auto 1fr auto;
  gap: 0.75rem;
  width: min(100%, 720px);
  min-height: 100dvh;
  margin: 0 auto;
  padding: 1rem;
}

.board-header {
  grid-area: header;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.header-actions {
  display: flex;
  gap: 0.5rem;
}

.match-chip {
  margin: 0;
  padding: 0.35rem 0.85rem;
  border-radius: 999px;
  background: var(--surface);
  color: var(--text-muted);
  font-weight: 600;
  font-size: 0.9rem;
  box-shadow: inset 0 0 0 2px var(--outline);
}

.ghost-button,
.split-button,
.play-again {
  border: none;
  border-radius: 999px;
  font: inherit;
  font-weight: 600;
  cursor: pointer;
}

.ghost-button {
  padding: 0.5rem 1rem;
  background: var(--surface);
  color: var(--text);
  box-shadow: inset 0 0 0 2px var(--outline);
}

.icon-button {
  padding-inline: 0.75rem;
}

.player-zone {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  padding: 0.75rem 0.5rem;
  border-radius: 2rem;
  transition:
    background 250ms ease,
    box-shadow 250ms ease;
}

.zone-rival {
  grid-area: rival;
  flex-direction: column-reverse;
  background: var(--rival-zone);
}

.zone-player {
  grid-area: player;
  background: var(--player-zone);
}

.player-zone.is-turn {
  box-shadow: inset 0 0 0 3px var(--turn-ring);
}

.player-name {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin: 0;
  font-weight: 700;
  font-size: 1.1rem;
  color: var(--text-muted);
}

.level-tag {
  padding: 0.1rem 0.55rem;
  border-radius: 999px;
  background: var(--rival-color);
  color: #fff;
  font-size: 0.75rem;
}

.hands-row {
  display: flex;
  justify-content: center;
  gap: clamp(1rem, 10vw, 4rem);
}

.hands-row.is-mirrored {
  flex-direction: row-reverse;
}

.board-center {
  grid-area: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  text-align: center;
}

.turn-timer {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  width: min(100%, 320px);
  transition: opacity 200ms ease;
}

.turn-timer.is-idle {
  opacity: 0.4;
}

.timer-label {
  min-width: 3.2rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  text-align: left;
}

.timer-track {
  flex: 1;
  height: 0.6rem;
  overflow: hidden;
  border-radius: 999px;
  background: var(--outline);
}

.timer-fill {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: var(--timer-ok);
  transform-origin: left center;
  transition:
    transform 100ms linear,
    background 200ms ease;
}

.is-urgent .timer-fill {
  background: var(--timer-urgent);
}

.is-urgent .timer-label {
  color: var(--timer-urgent);
  animation: urgent-pulse 1s ease-in-out infinite;
}

.status {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 600;
  min-height: 1.5em;
}

.summary-slot {
  display: grid;
  place-items: center;
  min-height: 2.5rem;
}

.move-summary {
  margin: 0;
  padding: 0.35rem 0.9rem;
  border-radius: 999px;
  background: var(--surface);
  font-weight: 600;
  box-shadow: inset 0 0 0 2px var(--outline);
  animation: pop-in 260ms ease-out;
}

.split-button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.65rem 1.4rem;
  background: var(--accent);
  color: var(--accent-text);
  font-size: 1.05rem;
  box-shadow: 0 4px 0 var(--accent-shadow);
  transition:
    transform 120ms ease,
    opacity 200ms ease;
}

.split-button:active:not(:disabled) {
  transform: translateY(3px);
  box-shadow: 0 1px 0 var(--accent-shadow);
}

.split-button:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.split-detail {
  padding: 0.1rem 0.5rem;
  border-radius: 999px;
  background: rgb(255 255 255 / 25%);
  font-size: 0.9rem;
}

.rules {
  grid-area: rules;
  padding: 0.6rem 1rem;
  border-radius: 1rem;
  background: var(--surface);
  box-shadow: inset 0 0 0 2px var(--outline);
}

.rules summary {
  font-weight: 600;
  cursor: pointer;
}

.rules ul {
  margin: 0.5rem 0 0;
  padding-left: 1.2rem;
  line-height: 1.5;
}

.winner-overlay {
  position: fixed;
  inset: 0;
  display: grid;
  place-items: center;
  padding: 1rem;
  background: rgb(20 16 40 / 55%);
  animation: fade-in 200ms ease-out;
}

.winner-card {
  padding: 2rem 2.5rem;
  border-radius: 2rem;
  background: var(--surface);
  text-align: center;
  box-shadow: 0 12px 0 rgb(0 0 0 / 15%);
  animation: pop-in 300ms cubic-bezier(0.34, 1.56, 0.64, 1);
}

.winner-emoji {
  margin: 0;
  font-size: 3.5rem;
}

.winner-card h2 {
  margin: 0.25rem 0 1.25rem;
  font-size: 2rem;
}

.winner-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.75rem;
}

.play-again {
  padding: 0.75rem 1.6rem;
  background: var(--accent);
  color: var(--accent-text);
  font-size: 1.1rem;
  box-shadow: 0 4px 0 var(--accent-shadow);
}

button:focus-visible {
  outline: 3px solid var(--focus-ring);
  outline-offset: 2px;
}

@keyframes pop-in {
  from {
    transform: scale(0.85);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes fade-in {
  from {
    opacity: 0;
  }
}

@keyframes urgent-pulse {
  50% {
    transform: scale(1.15);
  }
}
</style>
