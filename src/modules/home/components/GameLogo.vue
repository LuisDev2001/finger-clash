<script setup lang="ts">
import HandArt from '@/shared/components/HandArt.vue'

const HAND_CLASS = 'absolute top-1/2 w-[36%] drop-shadow-[0_6px_0_rgb(0_0_0/0.12)]'
const WORD_CLASS =
  '[-webkit-text-stroke:0.08em_var(--color-logo-ink)] [paint-order:stroke_fill] [text-shadow:0_0.09em_0_var(--color-logo-ink)]'
</script>

<template>
  <div class="flex flex-col items-center" role="img" aria-label="Finger Clash">
    <div class="relative aspect-[2/1] w-[min(84vw,380px)]" aria-hidden="true">
      <svg
        class="absolute top-[35%] left-1/2 w-[34%] -translate-1/2 animate-burst overflow-visible motion-reduce:animate-none"
        viewBox="-50 -50 100 100"
      >
        <polygon
          class="fill-burst stroke-burst-line stroke-3 [stroke-linejoin:round]"
          points="0,-48 9,-20 34,-34 22,-8 48,0 22,8 34,34 9,20 0,48 -9,20 -34,34 -22,8 -48,0 -22,-8 -34,-34 -9,-20"
        />
        <circle class="fill-white/85" r="10" />
      </svg>
      <div
        :class="HAND_CLASS"
        class="left-[12%] [transform:translateY(-50%)_rotate(90deg)] animate-clash-left motion-reduce:animate-none"
      >
        <HandArt :count="1" side="right" cuff-color="var(--color-player)" />
      </div>
      <div
        :class="HAND_CLASS"
        class="right-[12%] [transform:translateY(-50%)_rotate(-90deg)] animate-clash-right motion-reduce:animate-none"
      >
        <HandArt :count="1" side="left" cuff-color="var(--color-rival)" />
      </div>
    </div>
    <p
      class="-mt-[clamp(1.5rem,6vw,3rem)] flex -rotate-4 flex-wrap justify-center gap-x-[0.35em] font-display text-[clamp(2.8rem,13vw,5rem)] leading-none tracking-wide"
      aria-hidden="true"
    >
      <span class="text-player" :class="WORD_CLASS">Finger</span>
      <span class="text-burst" :class="WORD_CLASS">Clash!</span>
    </p>
  </div>
</template>
