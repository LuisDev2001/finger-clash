<script setup lang="ts">
import { computed } from 'vue'
import HandArt from '@/components/HandArt.vue'
import type { HandSide } from '../game.models'

const props = defineProps<{
  count: number
  side: HandSide
  label: string
  isFlipped?: boolean
  isSelected?: boolean
  isSelectable?: boolean
  isTarget?: boolean
  cuffColor: string
}>()

const emit = defineEmits<{ select: [] }>()

const isDead = computed(() => props.count === 0)
const isInteractive = computed(() => props.isSelectable || props.isTarget)
const ariaLabel = computed(
  () => `${props.label}: ${props.count} ${props.count === 1 ? 'dedo' : 'dedos'}`,
)
</script>

<template>
  <button
    type="button"
    class="player-hand"
    :class="{
      'is-flipped': isFlipped,
      'is-selected': isSelected,
      'is-selectable': isSelectable,
      'is-target': isTarget,
      'is-dead': isDead,
    }"
    :aria-label="ariaLabel"
    :aria-pressed="isSelected"
    :disabled="!isInteractive"
    @click="emit('select')"
  >
    <span class="hand-motion">
      <HandArt :count="count" :side="side" :cuff-color="cuffColor" />
    </span>
    <span class="count-badge">{{ count }}</span>
  </button>
</template>

<style scoped>
.player-hand {
  --hand-size: clamp(96px, 26vw, 168px);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.35rem;
  padding: 0.4rem;
  border: none;
  border-radius: 1.5rem;
  background: transparent;
  font: inherit;
  color: inherit;
  cursor: default;
  -webkit-tap-highlight-color: transparent;
}

.player-hand.is-flipped {
  flex-direction: column-reverse;
}

.player-hand:disabled {
  cursor: default;
}

.player-hand.is-selectable,
.player-hand.is-target {
  cursor: pointer;
}

.player-hand:focus-visible {
  outline: 3px solid var(--focus-ring);
  outline-offset: 2px;
}

.hand-motion {
  display: block;
  width: var(--hand-size);
  transition: transform 180ms ease;
}

.is-flipped .hand-art {
  transform: rotate(180deg);
}

.is-selectable:hover .hand-motion {
  transform: translateY(-6px);
}

.is-flipped.is-selectable:hover .hand-motion {
  transform: translateY(6px);
}

.is-selected .hand-motion {
  transform: translateY(-14px) scale(1.04);
}

.is-flipped.is-selected .hand-motion {
  transform: translateY(14px) scale(1.04);
}

.is-selected .hand-art {
  filter: drop-shadow(0 0 0.6rem var(--selected-glow)) drop-shadow(0 6px 0 rgb(0 0 0 / 12%));
}

.is-target .hand-art {
  animation: target-pulse 1s ease-in-out infinite;
}

.is-dead .hand-art {
  filter: grayscale(1);
  opacity: 0.35;
}

.count-badge {
  display: grid;
  place-items: center;
  min-width: 2.4rem;
  height: 2.4rem;
  border-radius: 999px;
  background: var(--badge-bg);
  color: var(--badge-text);
  font-size: 1.35rem;
  font-weight: 700;
  box-shadow: 0 3px 0 rgb(0 0 0 / 15%);
}

.is-dead .count-badge {
  background: var(--dead-badge);
}

@keyframes target-pulse {
  0%,
  100% {
    filter: drop-shadow(0 0 0 transparent) drop-shadow(0 6px 0 rgb(0 0 0 / 12%));
  }
  50% {
    filter: drop-shadow(0 0 0.7rem var(--target-glow)) drop-shadow(0 6px 0 rgb(0 0 0 / 12%));
  }
}

@media (prefers-reduced-motion: reduce) {
  .hand-motion {
    transition: none;
  }
  .is-target .hand-art {
    animation: none;
  }
}
</style>
