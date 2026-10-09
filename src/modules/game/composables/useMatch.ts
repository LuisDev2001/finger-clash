import { computed, ref, watch, type Ref } from 'vue'
import type { PlayerIndex, RoundResult } from '@/modules/game/models/game.models'
import { getOpponent } from '@/modules/game/utils/gameRules'

export interface MatchScore {
  wins: [number, number]
  draws: number
}

interface MatchOptions {
  targetWins: number
  roundResult: Ref<RoundResult | null>
  startRound: (firstTurn: PlayerIndex) => void
}

function createScore(): MatchScore {
  return { wins: [0, 0], draws: 0 }
}

export function useMatch({ targetWins, roundResult, startRound }: MatchOptions) {
  const score = ref<MatchScore>(createScore())
  const roundNumber = ref(1)
  const roundFirstTurn = ref<PlayerIndex>(0)

  const matchWinner = computed<PlayerIndex | null>(() => {
    const [first, second] = score.value.wins
    if (first >= targetWins) return 0
    if (second >= targetWins) return 1
    return null
  })
  const isMatchOver = computed(() => matchWinner.value !== null)

  watch(
    roundResult,
    (result, previous) => {
      if (!result || previous) return
      if (result.kind === 'win') score.value.wins[result.winner]++
      else score.value.draws++
    },
    { flush: 'sync' },
  )

  function nextRound() {
    if (isMatchOver.value) {
      restartMatch()
      return
    }
    roundNumber.value++
    roundFirstTurn.value = getOpponent(roundFirstTurn.value)
    startRound(roundFirstTurn.value)
  }

  function restartMatch() {
    score.value = createScore()
    roundNumber.value = 1
    roundFirstTurn.value = 0
    startRound(0)
  }

  return { score, roundNumber, matchWinner, isMatchOver, nextRound, restartMatch }
}
