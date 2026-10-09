import { watch, type Ref } from 'vue'
import type { HandSide, PlayerIndex } from '@/modules/game/models/game.models'
import {
  MOVE_CONTACT_MS,
  MOVE_DURATION_MS,
  type ActiveMove,
} from '@/modules/game/composables/useGame'
import { getOpponent } from '@/modules/game/utils/gameRules'

const ATTACK_REACH = 0.72
const SPLIT_REACH = 0.32

export function useMoveAnimation(
  boardRef: Ref<HTMLElement | null>,
  activeMove: Ref<ActiveMove | null>,
) {
  function findHand(player: PlayerIndex, side: HandSide): HTMLElement | null {
    return (
      boardRef.value?.querySelector<HTMLElement>(
        `[data-hand="${player}-${side}"] [data-hand-motion]`,
      ) ?? null
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
      lunge(attacker, (to.x - from.x) * ATTACK_REACH, (to.y - from.y) * ATTACK_REACH)
      bump(target)
      return
    }

    const left = findHand(player, 'left')
    const right = findHand(player, 'right')
    if (!left || !right) return
    const gap = (centerOf(right).x - centerOf(left).x) * SPLIT_REACH
    lunge(left, gap, 0)
    lunge(right, -gap, 0)
  }

  watch(activeMove, (entry) => {
    if (entry) animateMove(entry)
  })
}
