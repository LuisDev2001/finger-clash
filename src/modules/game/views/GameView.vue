<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { playSfx } from '@/modules/audio/utils/audioEngine'
import PlayerHand from '@/modules/game/components/PlayerHand.vue'
import RulesSummary from '@/modules/game/components/RulesSummary.vue'
import TurnTimer from '@/modules/game/components/TurnTimer.vue'
import WinnerOverlay from '@/modules/game/components/WinnerOverlay.vue'
import { CPU, HUMAN, useGame, type GameEvent } from '@/modules/game/composables/useGame'
import { useGameSounds } from '@/modules/game/composables/useGameSounds'
import { useMoveAnimation } from '@/modules/game/composables/useMoveAnimation'
import type { HandSide, PlayerIndex } from '@/modules/game/models/game.models'
import { addFingers, getOpponent, HAND_SIDES } from '@/modules/game/utils/gameRules'
import {
  CPU_LEVEL_LABELS,
  formatTurnSeconds,
  MODE_LABELS,
} from '@/modules/settings/models/settings.models'
import { useSettings } from '@/modules/settings/composables/useSettings'
import { ROUTE_NAMES } from '@/router'
import BaseButton from '@/shared/components/BaseButton.vue'

const router = useRouter()
const { settings, toggleMute } = useSettings()
const { mode, cpuLevel, turnSeconds } = settings.value
const options = { mode, cpuLevel, turnSeconds }

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
const isCpuMode = mode === 'cpu'

useMoveAnimation(boardRef, activeMove)
useGameSounds({
  state,
  selectedHand,
  activeMove,
  lastEvent,
  remainingSeconds,
  cpuPlayer: isCpuMode ? CPU : null,
})

const SIDE_LABELS: Record<HandSide, string> = { left: 'izquierda', right: 'derecha' }
const CUFF_COLORS: Record<PlayerIndex, string> = {
  0: 'var(--color-player)',
  1: 'var(--color-rival)',
}
const PLAYERS_TOP_DOWN: PlayerIndex[] = [CPU, HUMAN]

const playerNames: Record<PlayerIndex, string> = isCpuMode
  ? { 0: 'Tú', 1: 'CPU' }
  : { 0: 'Jugador 1', 1: 'Jugador 2' }

const matchLabel = [
  MODE_LABELS[mode],
  isCpuMode ? CPU_LEVEL_LABELS[cpuLevel] : null,
  formatTurnSeconds(turnSeconds),
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
const isHumanDefeated = computed(() => isCpuMode && state.value.winner === CPU)
const showWinner = computed(() => state.value.winner !== null && !activeMove.value)

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
  const result = addFingers(current, added)
  const equation =
    sum >= 5 ? `${current} + ${added} = ${sum} → ${result}` : `${current} + ${added} = ${sum}`
  return `${name}: ${equation}${result === 0 ? ' ¡mano fuera!' : ''}`
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

function handleToggleMute() {
  toggleMute()
  playSfx('click')
}

function restartMatch() {
  playSfx('start')
  restart()
}

function exitToMenu() {
  playSfx('click')
  router.push({ name: ROUTE_NAMES.home })
}
</script>

<template>
  <main
    ref="boardRef"
    class="mx-auto grid min-h-dvh w-full max-w-180 grid-rows-[auto_1fr_auto_1fr_auto] gap-3 p-4"
  >
    <header class="flex flex-wrap items-center justify-between gap-2">
      <BaseButton @click="exitToMenu">← Menú</BaseButton>
      <p
        class="rounded-full bg-surface px-3.5 py-1.5 text-sm font-semibold text-muted ring-2 ring-outline ring-inset"
      >
        {{ matchLabel }}
      </p>
      <div class="flex gap-2">
        <BaseButton
          size="icon"
          :aria-pressed="settings.isMuted"
          :aria-label="settings.isMuted ? 'Activar sonido' : 'Silenciar'"
          @click="handleToggleMute"
        >
          <span aria-hidden="true">{{ settings.isMuted ? '🔇' : '🔊' }}</span>
        </BaseButton>
        <BaseButton @click="restartMatch">Reiniciar</BaseButton>
      </div>
    </header>

    <section
      v-for="player in PLAYERS_TOP_DOWN"
      :key="player"
      class="flex items-center justify-center gap-1 rounded-[2rem] px-2 py-3 transition-shadow duration-250"
      :class="[
        player === CPU
          ? 'order-1 flex-col-reverse bg-rival-zone'
          : 'order-3 flex-col bg-player-zone',
        { 'ring-3 ring-focus ring-inset': state.turn === player },
      ]"
    >
      <p class="flex items-center gap-1.5 text-lg font-bold text-muted">
        {{ playerNames[player] }}
        <span
          v-if="isCpuMode && player === CPU"
          class="rounded-full bg-rival px-2 py-0.5 text-xs text-white"
        >
          {{ CPU_LEVEL_LABELS[cpuLevel] }}
        </span>
      </p>
      <div
        class="flex justify-center gap-[clamp(1rem,10vw,4rem)]"
        :class="player === CPU ? 'flex-row-reverse' : 'flex-row'"
      >
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

    <section class="order-2 flex flex-col items-center gap-2 text-center">
      <TurnTimer
        v-if="turnSeconds > 0"
        :remaining-ms="remainingMs"
        :remaining-seconds="remainingSeconds"
        :total-seconds="turnSeconds"
      />
      <p class="min-h-[1.5em] text-lg font-semibold" aria-live="polite">{{ statusText }}</p>
      <div class="grid min-h-10 place-items-center">
        <p
          v-if="eventSummary"
          :key="lastEvent?.id"
          class="animate-pop-in rounded-full bg-surface px-3.5 py-1.5 font-semibold ring-2 ring-outline ring-inset"
        >
          {{ eventSummary }}
        </p>
      </div>
      <BaseButton variant="primary" size="md" :disabled="!canSplitNow" @click="split">
        Dividir
        <span v-if="canSplitNow" class="rounded-full bg-white/25 px-2 py-0.5 text-sm">
          {{ splitTotal }} → {{ splitTotal / 2 }} + {{ splitTotal / 2 }}
        </span>
      </BaseButton>
    </section>

    <RulesSummary class="order-4" :turn-seconds="turnSeconds" />

    <WinnerOverlay
      v-if="showWinner"
      :title="winnerTitle"
      :is-defeat="isHumanDefeated"
      @restart="restartMatch"
      @exit="exitToMenu"
    />
  </main>
</template>
