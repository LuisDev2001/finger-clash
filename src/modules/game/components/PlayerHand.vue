<script setup lang="ts">
import { computed } from 'vue'
import HandArt from '@/shared/components/HandArt.vue'
import type { HandSide } from '@/modules/game/models/game.models'

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

const BASE_SHADOW = 'drop-shadow-[0_6px_0_rgb(0_0_0/0.12)]'

const isDead = computed(() => props.count === 0)
const isInteractive = computed(() => props.isSelectable || props.isTarget)
const ariaLabel = computed(
  () => `${props.label}: ${props.count} ${props.count === 1 ? 'dedo' : 'dedos'}`,
)

const motionClass = computed(() => {
  if (props.isSelected)
    return props.isFlipped ? 'translate-y-3.5 scale-105' : '-translate-y-3.5 scale-105'
  if (props.isSelectable)
    return props.isFlipped ? 'group-hover:translate-y-1.5' : 'group-hover:-translate-y-1.5'
  return ''
})

const artClass = computed(() => {
  if (isDead.value) return 'opacity-35 grayscale'
  if (props.isSelected) return 'drop-shadow-[0_0_0.6rem_var(--color-focus)]'
  if (props.isTarget) return `${BASE_SHADOW} animate-target-pulse motion-reduce:animate-none`
  return BASE_SHADOW
})
</script>

<template>
  <button
    type="button"
    class="group flex items-center gap-1.5 rounded-3xl bg-transparent p-1.5 [-webkit-tap-highlight-color:transparent] disabled:cursor-default"
    :class="isFlipped ? 'flex-col-reverse' : 'flex-col'"
    :aria-label="ariaLabel"
    :aria-pressed="isSelected"
    :disabled="!isInteractive"
    @click="emit('select')"
  >
    <span
      data-hand-motion
      class="block w-[clamp(96px,26vw,168px)] transition-transform duration-200 motion-reduce:transition-none"
      :class="motionClass"
    >
      <HandArt
        :count="count"
        :side="side"
        :cuff-color="cuffColor"
        class="transition-[filter] duration-200"
        :class="[artClass, { 'rotate-180': isFlipped }]"
      />
    </span>
    <span
      class="grid h-10 min-w-10 place-items-center rounded-full text-xl font-bold shadow-[0_3px_0_rgb(0_0_0/0.15)]"
      :class="isDead ? 'bg-dead text-badge-ink' : 'bg-badge text-badge-ink'"
    >
      {{ count }}
    </span>
  </button>
</template>
