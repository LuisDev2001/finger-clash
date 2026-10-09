<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { playSfx } from '@/modules/audio/utils/audioEngine'
import GameLogo from '@/modules/home/components/GameLogo.vue'
import TermsDialog from '@/modules/home/components/TermsDialog.vue'
import { useSettings } from '@/modules/settings/composables/useSettings'
import {
  CPU_LEVEL_LABELS,
  formatTurnSeconds,
  MODE_LABELS,
} from '@/modules/settings/models/settings.models'
import { ROUTE_NAMES } from '@/router'
import BaseButton from '@/shared/components/BaseButton.vue'

const router = useRouter()
const { settings, toggleMute } = useSettings()
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

function startGame() {
  playSfx('start')
  router.push({ name: ROUTE_NAMES.game })
}

function openSettings() {
  playSfx('click')
  router.push({ name: ROUTE_NAMES.settings })
}

function openTerms() {
  playSfx('click')
  isTermsOpen.value = true
}

function handleToggleMute() {
  toggleMute()
  playSfx('click')
}
</script>

<template>
  <main
    class="relative flex min-h-dvh flex-col items-center justify-center gap-4 px-4 py-8 text-center"
  >
    <BaseButton
      size="icon"
      class="absolute top-4 right-4"
      :aria-pressed="settings.isMuted"
      :aria-label="settings.isMuted ? 'Activar sonido' : 'Silenciar'"
      @click="handleToggleMute"
    >
      <span aria-hidden="true">{{ settings.isMuted ? '🔇' : '🔊' }}</span>
    </BaseButton>

    <h1 class="sr-only">Finger Clash</h1>
    <GameLogo />
    <p class="mt-2 text-lg font-semibold text-muted">Suma, divide y deja a tu rival sin dedos.</p>

    <nav class="mt-2 grid w-full max-w-xs gap-3" aria-label="Menú principal">
      <BaseButton
        variant="primary"
        size="lg"
        class="animate-invite motion-reduce:animate-none"
        @click="startGame"
      >
        <span aria-hidden="true">▶</span> Comenzar
      </BaseButton>
      <BaseButton size="lg" @click="openSettings">
        <span aria-hidden="true">⚙️</span> Configuraciones
      </BaseButton>
      <BaseButton size="lg" @click="openTerms">
        <span aria-hidden="true">📜</span> Términos y condiciones
      </BaseButton>
    </nav>

    <p
      class="mt-1 rounded-full bg-surface px-3.5 py-1.5 text-sm font-semibold text-muted ring-2 ring-outline ring-inset"
    >
      {{ settingsSummary }}
    </p>
    <footer class="text-sm text-muted">© 2026 LuisDev2001</footer>

    <TermsDialog :is-open="isTermsOpen" @close="isTermsOpen = false" />
  </main>
</template>
