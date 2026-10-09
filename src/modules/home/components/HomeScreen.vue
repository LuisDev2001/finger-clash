<script setup lang="ts">
import { computed, ref } from 'vue'
import { playSfx } from '@/modules/audio/audioEngine'
import {
  CPU_LEVEL_LABELS,
  formatTurnSeconds,
  MODE_LABELS,
} from '@/modules/settings/settings.models'
import { useSettings } from '@/modules/settings/useSettings'
import GameLogo from './GameLogo.vue'
import SettingsDialog from './SettingsDialog.vue'
import TermsDialog from './TermsDialog.vue'

const emit = defineEmits<{ start: [] }>()

const { settings } = useSettings()
const isSettingsOpen = ref(false)
const isTermsOpen = ref(false)

const settingsSummary = computed(() =>
  [
    MODE_LABELS[settings.value.mode],
    settings.value.mode === 'cpu' ? `CPU ${CPU_LEVEL_LABELS[settings.value.cpuLevel]}` : null,
    `⏱ ${formatTurnSeconds(settings.value.turnSeconds)}`,
  ]
    .filter(Boolean)
    .join(' · '),
)

function start() {
  playSfx('start')
  emit('start')
}

function openSettings() {
  playSfx('click')
  isSettingsOpen.value = true
}

function openTerms() {
  playSfx('click')
  isTermsOpen.value = true
}

function toggleMute() {
  settings.value.isMuted = !settings.value.isMuted
  playSfx('click')
}
</script>

<template>
  <main class="home-screen">
    <button
      type="button"
      class="mute-button"
      :aria-pressed="settings.isMuted"
      :aria-label="settings.isMuted ? 'Activar sonido' : 'Silenciar'"
      @click="toggleMute"
    >
      <span aria-hidden="true">{{ settings.isMuted ? '🔇' : '🔊' }}</span>
    </button>

    <h1 class="visually-hidden">Finger Clash</h1>
    <GameLogo />
    <p class="tagline">Suma, divide y deja a tu rival sin dedos.</p>

    <nav class="menu" aria-label="Menú principal">
      <button type="button" class="menu-button is-primary" @click="start">
        <span aria-hidden="true">▶</span> Comenzar
      </button>
      <button type="button" class="menu-button" @click="openSettings">
        <span aria-hidden="true">⚙️</span> Configuraciones
      </button>
      <button type="button" class="menu-button" @click="openTerms">
        <span aria-hidden="true">📜</span> Términos y condiciones
      </button>
    </nav>

    <p class="settings-summary">{{ settingsSummary }}</p>
    <footer class="credits">© 2026 LuisDev2001</footer>

    <SettingsDialog :is-open="isSettingsOpen" @close="isSettingsOpen = false" />
    <TermsDialog :is-open="isTermsOpen" @close="isTermsOpen = false" />
  </main>
</template>

<style scoped>
.home-screen {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  min-height: 100dvh;
  padding: 2rem 1rem;
  text-align: center;
}

.mute-button {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 2.8rem;
  height: 2.8rem;
  border: none;
  border-radius: 999px;
  background: var(--surface);
  font-size: 1.2rem;
  box-shadow: inset 0 0 0 2px var(--outline);
  cursor: pointer;
}

.tagline {
  margin: 0.5rem 0 0;
  font-size: 1.15rem;
  font-weight: 600;
  color: var(--text-muted);
}

.menu {
  display: grid;
  gap: 0.75rem;
  width: min(100%, 320px);
  margin-top: 0.5rem;
}

.menu-button {
  padding: 0.85rem 1.25rem;
  border: none;
  border-radius: 1.25rem;
  background: var(--surface);
  color: var(--text);
  font: inherit;
  font-size: 1.1rem;
  font-weight: 600;
  box-shadow:
    inset 0 0 0 2px var(--outline),
    0 4px 0 var(--outline);
  cursor: pointer;
  transition: transform 120ms ease;
}

.menu-button:hover {
  transform: translateY(-2px);
}

.menu-button:active {
  transform: translateY(2px);
}

.menu-button.is-primary {
  background: var(--accent);
  color: var(--accent-text);
  font-size: 1.35rem;
  box-shadow: 0 5px 0 var(--accent-shadow);
  animation: invite 2.4s ease-in-out infinite;
}

.settings-summary {
  margin: 0.25rem 0 0;
  padding: 0.35rem 0.9rem;
  border-radius: 999px;
  background: var(--surface);
  color: var(--text-muted);
  font-size: 0.9rem;
  font-weight: 600;
  box-shadow: inset 0 0 0 2px var(--outline);
}

.credits {
  font-size: 0.85rem;
  color: var(--text-muted);
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}

button:focus-visible {
  outline: 3px solid var(--focus-ring);
  outline-offset: 3px;
}

@keyframes invite {
  0%,
  100% {
    scale: 1;
  }
  50% {
    scale: 1.04;
  }
}

@media (prefers-reduced-motion: reduce) {
  .menu-button.is-primary {
    animation: none;
  }
}
</style>
