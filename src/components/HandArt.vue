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
  <svg class="hand-art" :class="`hand-${side}`" viewBox="0 0 140 184" aria-hidden="true">
    <g class="hand-figure">
      <rect
        v-for="(finger, index) in fingers"
        :key="index"
        class="finger"
        :class="{ 'is-raised': finger.isRaised }"
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
        class="nail"
        :class="{ 'is-visible': finger.isRaised }"
        :x="finger.x + 4"
        :y="finger.y + 5"
        width="10"
        height="12"
        rx="5"
      />
      <rect
        class="thumb"
        x="14"
        y="98"
        width="26"
        height="46"
        rx="13"
        transform="rotate(16 27 142)"
      />
      <rect class="palm" x="26" y="78" width="88" height="78" rx="28" />
      <path
        class="knuckles"
        d="M38 96 q6 -4 12 0 M58 96 q6 -4 12 0 M78 96 q6 -4 12 0 M98 96 q5 -3 9 0"
      />
      <rect
        class="cuff"
        x="34"
        y="146"
        width="72"
        height="36"
        rx="10"
        :style="{ fill: cuffColor }"
      />
      <rect class="cuff-band" x="34" y="146" width="72" height="8" rx="4" />
    </g>
  </svg>
</template>

<style scoped>
.hand-art {
  display: block;
  width: 100%;
  height: auto;
  overflow: visible;
  filter: drop-shadow(0 6px 0 rgb(0 0 0 / 12%));
  transition: filter 200ms ease;
}

.hand-left .hand-figure {
  transform: scaleX(-1);
  transform-origin: 70px 0;
}

.finger,
.palm,
.thumb {
  fill: var(--skin);
  stroke: var(--skin-line);
  stroke-width: 3;
}

.finger {
  fill: var(--skin-shade);
  transform-box: fill-box;
  transform-origin: 50% 100%;
  transition:
    transform 260ms cubic-bezier(0.34, 1.56, 0.64, 1),
    fill 200ms ease;
}

.finger.is-raised {
  fill: var(--skin);
}

.nail {
  fill: var(--nail);
  opacity: 0;
  transition: opacity 160ms ease;
}

.nail.is-visible {
  opacity: 1;
  transition-delay: 120ms;
}

.knuckles {
  fill: none;
  stroke: var(--skin-line);
  stroke-width: 2.5;
  stroke-linecap: round;
  opacity: 0.45;
}

.cuff {
  stroke: rgb(0 0 0 / 25%);
  stroke-width: 3;
}

.cuff-band {
  fill: rgb(255 255 255 / 35%);
}

@media (prefers-reduced-motion: reduce) {
  .finger {
    transition: none;
  }
}
</style>
