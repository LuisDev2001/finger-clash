<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  count: number
  side: 'left' | 'right'
  cuffColor: string
}>()

const FINGER_BASE_Y = 92
const FOLDED_HEIGHT = 32
const FINGERS = [
  { x: 31, height: 64 },
  { x: 51, height: 74 },
  { x: 71, height: 68 },
  { x: 91, height: 54 },
]

const fingers = computed(() =>
  FINGERS.map((finger, index) => {
    const fullHeight = finger.height + 6
    const isRaised = index < props.count
    return {
      ...finger,
      y: FINGER_BASE_Y - fullHeight,
      fullHeight,
      isRaised,
      scale: isRaised ? 1 : FOLDED_HEIGHT / fullHeight,
    }
  }),
)
</script>

<template>
  <svg class="block h-auto w-full overflow-visible" viewBox="0 0 140 184" aria-hidden="true">
    <g :class="{ 'origin-[70px_0] -scale-x-100': side === 'left' }">
      <rect
        v-for="(finger, index) in fingers"
        :key="index"
        class="origin-bottom stroke-skin-line stroke-3 transition-[transform,fill] duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] [transform-box:fill-box] motion-reduce:transition-none"
        :class="finger.isRaised ? 'fill-skin' : 'fill-skin-shade'"
        :x="finger.x"
        :y="finger.y"
        width="18"
        :height="finger.fullHeight + 10"
        rx="9"
        :style="{ transform: `scaleY(${finger.scale})` }"
      />
      <rect
        v-for="(finger, index) in fingers"
        :key="`nail-${index}`"
        class="fill-nail transition-opacity duration-150"
        :class="finger.isRaised ? 'opacity-100 delay-100' : 'opacity-0'"
        :x="finger.x + 4"
        :y="finger.y + 5"
        width="10"
        height="12"
        rx="5"
      />
      <rect
        class="fill-skin stroke-skin-line stroke-3"
        x="14"
        y="98"
        width="26"
        height="46"
        rx="13"
        transform="rotate(16 27 142)"
      />
      <rect
        class="fill-skin stroke-skin-line stroke-3"
        x="26"
        y="78"
        width="88"
        height="78"
        rx="28"
      />
      <path
        class="fill-none stroke-skin-line stroke-[2.5] opacity-45 [stroke-linecap:round]"
        d="M38 96 q6 -4 12 0 M58 96 q6 -4 12 0 M78 96 q6 -4 12 0 M98 96 q5 -3 9 0"
      />
      <rect
        class="stroke-black/25 stroke-3"
        x="34"
        y="146"
        width="72"
        height="36"
        rx="10"
        :style="{ fill: cuffColor }"
      />
      <rect class="fill-white/35" x="34" y="146" width="72" height="8" rx="4" />
    </g>
  </svg>
</template>
