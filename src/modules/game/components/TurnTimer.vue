<script setup lang="ts">
import { computed } from 'vue'
import { URGENT_SECONDS } from '@/modules/game/composables/useGame'

const props = defineProps<{
  remainingMs: number | null
  remainingSeconds: number | null
  totalSeconds: number
}>()

const progress = computed(() =>
  props.remainingMs === null ? 0 : props.remainingMs / (props.totalSeconds * 1000),
)
const isIdle = computed(() => props.remainingSeconds === null)
const isUrgent = computed(() => !isIdle.value && props.remainingSeconds! <= URGENT_SECONDS)
const ariaLabel = computed(() =>
  isIdle.value ? 'Tiempo en pausa' : `Quedan ${props.remainingSeconds} segundos`,
)
</script>

<template>
  <div
    class="flex w-full max-w-xs items-center gap-2.5 transition-opacity duration-200"
    :class="{ 'opacity-40': isIdle }"
    role="timer"
    :aria-label="ariaLabel"
  >
    <span
      class="min-w-13 text-left font-bold tabular-nums"
      :class="{ 'animate-urgent-pulse text-timer-urgent motion-reduce:animate-none': isUrgent }"
      aria-hidden="true"
    >
      ⏱ {{ remainingSeconds ?? '–' }}
    </span>
    <span class="h-2.5 flex-1 overflow-hidden rounded-full bg-outline">
      <span
        class="block h-full origin-left rounded-full transition-[transform,background-color] duration-100 ease-linear"
        :class="isUrgent ? 'bg-timer-urgent' : 'bg-timer-ok'"
        :style="{ transform: `scaleX(${progress})` }"
      />
    </span>
  </div>
</template>
