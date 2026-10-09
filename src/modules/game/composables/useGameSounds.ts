import { watch, type Ref } from 'vue'
import { playSfx } from '@/modules/audio/utils/audioEngine'
import type { GameState, HandSide, PlayerIndex } from '@/modules/game/models/game.models'
import {
  MOVE_CONTACT_MS,
  URGENT_SECONDS,
  type ActiveMove,
  type GameEvent,
} from '@/modules/game/composables/useGame'
import { addFingers, getOpponent } from '@/modules/game/utils/gameRules'

interface GameSoundSources {
  state: Ref<GameState>
  selectedHand: Ref<HandSide | null>
  activeMove: Ref<ActiveMove | null>
  lastEvent: Ref<GameEvent | null>
  remainingSeconds: Ref<number | null>
  cpuPlayer: PlayerIndex | null
}

export function useGameSounds(sources: GameSoundSources) {
  function playMoveSound({ player, move, before }: ActiveMove) {
    if (move.type === 'split') {
      playSfx('split')
      return
    }
    const touched = before.players[getOpponent(player)][move.to]
    const result = addFingers(touched, before.players[player][move.from])
    const delay = MOVE_CONTACT_MS / 1000
    if (result === 0) playSfx('knockout', { delay })
    else playSfx('hit', { delay, level: result - 1 })
  }

  watch(sources.activeMove, (entry) => {
    if (entry) playMoveSound(entry)
  })

  watch(sources.selectedHand, (side) => {
    if (side) playSfx('select')
  })

  watch(sources.lastEvent, (event) => {
    if (event?.kind === 'timeout') playSfx('timeout')
  })

  watch(sources.remainingSeconds, (seconds, previous) => {
    if (seconds !== null && seconds !== previous && seconds > 0 && seconds <= URGENT_SECONDS) {
      playSfx('tick')
    }
  })

  watch(
    () => sources.state.value.winner,
    (winner) => {
      if (winner === null) return
      playSfx(winner === sources.cpuPlayer ? 'lose' : 'win', { delay: 0.35 })
    },
  )
}
