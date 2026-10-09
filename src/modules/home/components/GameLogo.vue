<script setup lang="ts">
import HandArt from '@/components/HandArt.vue'
</script>

<template>
  <div class="game-logo" role="img" aria-label="Finger Clash">
    <div class="logo-art" aria-hidden="true">
      <svg class="logo-burst" viewBox="-50 -50 100 100">
        <polygon
          points="0,-48 9,-20 34,-34 22,-8 48,0 22,8 34,34 9,20 0,48 -9,20 -34,34 -22,8 -48,0 -22,-8 -34,-34 -9,-20"
        />
        <circle r="10" />
      </svg>
      <div class="logo-hand logo-hand-left">
        <HandArt :count="1" side="right" cuff-color="var(--player-color)" />
      </div>
      <div class="logo-hand logo-hand-right">
        <HandArt :count="1" side="left" cuff-color="var(--rival-color)" />
      </div>
    </div>
    <p class="logo-word" aria-hidden="true">
      <span class="word-finger">Finger</span>
      <span class="word-clash">Clash!</span>
    </p>
  </div>
</template>

<style scoped>
.game-logo {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.logo-art {
  position: relative;
  width: min(84vw, 380px);
  aspect-ratio: 2 / 1;
}

.logo-burst {
  position: absolute;
  top: 35%;
  left: 50%;
  width: 34%;
  translate: -50% -50%;
  overflow: visible;
  animation: burst 1.6s ease-in-out infinite;
}

.logo-burst polygon {
  fill: var(--logo-burst);
  stroke: var(--logo-burst-line);
  stroke-width: 3;
  stroke-linejoin: round;
}

.logo-burst circle {
  fill: #fff;
  opacity: 0.85;
}

.logo-hand {
  position: absolute;
  top: 50%;
  width: 36%;
}

.logo-hand-left {
  left: 12%;
  animation: clash-left 1.6s ease-in-out infinite;
}

.logo-hand-right {
  right: 12%;
  animation: clash-right 1.6s ease-in-out infinite;
}

.logo-word {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0 0.35em;
  margin: clamp(-3rem, -6vw, -1.5rem) 0 0;
  font-family: 'Lilita One', 'Fredoka', ui-rounded, system-ui, sans-serif;
  font-size: clamp(2.8rem, 13vw, 5rem);
  line-height: 1;
  letter-spacing: 0.02em;
  transform: rotate(-4deg);
}

.logo-word span {
  -webkit-text-stroke: 0.08em var(--logo-ink);
  paint-order: stroke fill;
  text-shadow: 0 0.09em 0 var(--logo-ink);
}

.word-finger {
  color: var(--player-color);
}

.word-clash {
  color: var(--logo-burst);
}

@keyframes clash-left {
  0%,
  100% {
    transform: translateY(-50%) rotate(90deg) translateY(0);
  }
  45% {
    transform: translateY(-50%) rotate(90deg) translateY(-7%);
  }
  55% {
    transform: translateY(-50%) rotate(84deg) translateY(1%);
  }
}

@keyframes clash-right {
  0%,
  100% {
    transform: translateY(-50%) rotate(-90deg) translateY(0);
  }
  45% {
    transform: translateY(-50%) rotate(-90deg) translateY(-7%);
  }
  55% {
    transform: translateY(-50%) rotate(-84deg) translateY(1%);
  }
}

@keyframes burst {
  0%,
  40%,
  100% {
    scale: 0.85;
    rotate: 0deg;
  }
  52% {
    scale: 1.15;
    rotate: 12deg;
  }
}

@media (prefers-reduced-motion: reduce) {
  .logo-burst,
  .logo-hand-left,
  .logo-hand-right {
    animation: none;
  }
  .logo-hand-left {
    transform: translateY(-50%) rotate(90deg);
  }
  .logo-hand-right {
    transform: translateY(-50%) rotate(-90deg);
  }
}
</style>
