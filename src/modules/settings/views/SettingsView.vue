<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { playSfx } from '@/modules/audio/utils/audioEngine'
import OptionGroup from '@/modules/settings/components/OptionGroup.vue'
import { useSettings } from '@/modules/settings/composables/useSettings'
import {
  CPU_LEVEL_HINTS,
  CPU_LEVEL_LABELS,
  CPU_LEVELS,
  formatTargetWins,
  formatTurnSeconds,
  GAME_MODES,
  MODE_LABELS,
  TARGET_WINS_OPTIONS,
  TURN_SECONDS_OPTIONS,
} from '@/modules/settings/models/settings.models'
import { ROUTE_NAMES } from '@/router'
import BaseButton from '@/shared/components/BaseButton.vue'

const router = useRouter()
const { settings, resetSettings } = useSettings()

const modeOptions = GAME_MODES.map((value) => ({ value, label: MODE_LABELS[value] }))
const levelOptions = CPU_LEVELS.map((value) => ({ value, label: CPU_LEVEL_LABELS[value] }))
const timeOptions = TURN_SECONDS_OPTIONS.map((value) => ({
  value,
  label: formatTurnSeconds(value),
}))

const matchOptions = TARGET_WINS_OPTIONS.map((value) => ({
  value,
  label: formatTargetWins(value),
}))

const isCpuMode = computed(() => settings.value.mode === 'cpu')
const levelHint = computed(() =>
  isCpuMode.value ? CPU_LEVEL_HINTS[settings.value.cpuLevel] : 'Solo aplica contra la CPU.',
)

const VOLUME_SLIDERS = [
  { key: 'musicVolume', label: 'Música' },
  { key: 'sfxVolume', label: 'Efectos' },
] as const

function goTo(name: (typeof ROUTE_NAMES)[keyof typeof ROUTE_NAMES]) {
  playSfx(name === ROUTE_NAMES.game ? 'start' : 'click')
  router.push({ name })
}

function handleReset() {
  resetSettings()
  playSfx('click')
}
</script>

<template>
  <main class="mx-auto flex min-h-dvh w-full max-w-xl flex-col gap-5 px-4 py-6">
    <header class="flex items-center justify-between gap-3">
      <BaseButton @click="goTo(ROUTE_NAMES.home)">← Volver</BaseButton>
      <h1 class="text-3xl font-bold">Configuraciones</h1>
      <span class="w-24" aria-hidden="true" />
    </header>

    <form
      class="grid gap-5 rounded-[1.75rem] bg-surface p-6 shadow-[0_14px_0_rgb(0_0_0/0.18)]"
      @submit.prevent="goTo(ROUTE_NAMES.game)"
      @change="playSfx('click')"
    >
      <OptionGroup
        v-model="settings.mode"
        legend="Modo de juego"
        name="mode"
        :options="modeOptions"
      />
      <OptionGroup
        v-model="settings.cpuLevel"
        legend="Nivel de la CPU"
        name="cpu-level"
        :options="levelOptions"
        :hint="levelHint"
        :is-disabled="!isCpuMode"
      />
      <OptionGroup
        v-model="settings.targetWins"
        legend="Duración de la partida"
        name="target-wins"
        :options="matchOptions"
        hint="Gana quien llegue primero a esas victorias. Repetir 3 veces la misma posición es empate."
      />
      <OptionGroup
        v-model="settings.turnSeconds"
        legend="Tiempo por turno"
        name="turn-seconds"
        :options="timeOptions"
        hint="Si se acaba el tiempo, ese jugador pierde el turno."
      />

      <fieldset class="min-w-0">
        <legend class="mb-2 font-bold">Sonido</legend>
        <label
          v-for="slider in VOLUME_SLIDERS"
          :key="slider.key"
          class="mb-2 grid grid-cols-[4.5rem_1fr_3rem] items-center gap-3 font-semibold"
        >
          <span>{{ slider.label }}</span>
          <input
            v-model.number="settings[slider.key]"
            class="w-full accent-accent"
            type="range"
            min="0"
            max="100"
            step="5"
          />
          <output class="text-right text-muted tabular-nums">{{ settings[slider.key] }}%</output>
        </label>
        <label class="inline-flex cursor-pointer items-center gap-2 font-semibold">
          <input v-model="settings.isMuted" class="size-5 accent-accent" type="checkbox" />
          <span>Silenciar todo</span>
        </label>
      </fieldset>

      <div class="flex flex-wrap justify-end gap-3 border-t-2 border-outline pt-4">
        <BaseButton @click="handleReset">Restablecer</BaseButton>
        <BaseButton variant="primary" type="submit">▶ Jugar</BaseButton>
      </div>
    </form>
  </main>
</template>
