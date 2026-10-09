<script setup lang="ts">
import { playSfx } from '@/modules/audio/audioEngine'
import {
  CPU_LEVEL_LABELS,
  formatTurnSeconds,
  MODE_LABELS,
  TURN_SECONDS_OPTIONS,
  type CpuLevel,
  type GameMode,
} from '@/modules/settings/settings.models'
import { useSettings } from '@/modules/settings/useSettings'
import AppDialog from './AppDialog.vue'

defineProps<{ isOpen: boolean }>()
const emit = defineEmits<{ close: [] }>()

const { settings, resetSettings } = useSettings()

const modeOptions = Object.entries(MODE_LABELS) as [GameMode, string][]
const levelOptions = Object.entries(CPU_LEVEL_LABELS) as [CpuLevel, string][]
const LEVEL_HINTS: Record<CpuLevel, string> = {
  easy: 'Juega al azar: ideal para aprender.',
  normal: 'Aprovecha tus errores y evita los suyos.',
  hard: 'Calcula la partida completa. ¡Suerte!',
}
</script>

<template>
  <AppDialog :is-open="isOpen" title="Configuraciones" @close="emit('close')">
    <form class="settings-form" @submit.prevent="emit('close')" @change="playSfx('click')">
      <fieldset class="setting">
        <legend>Modo de juego</legend>
        <div class="segmented">
          <label v-for="[value, label] in modeOptions" :key="value">
            <input v-model="settings.mode" type="radio" name="mode" :value="value" />
            <span>{{ label }}</span>
          </label>
        </div>
      </fieldset>

      <fieldset class="setting" :disabled="settings.mode !== 'cpu'">
        <legend>Nivel de la CPU</legend>
        <div class="segmented">
          <label v-for="[value, label] in levelOptions" :key="value">
            <input v-model="settings.cpuLevel" type="radio" name="cpu-level" :value="value" />
            <span>{{ label }}</span>
          </label>
        </div>
        <p class="hint">
          {{
            settings.mode === 'cpu' ? LEVEL_HINTS[settings.cpuLevel] : 'Solo aplica contra la CPU.'
          }}
        </p>
      </fieldset>

      <fieldset class="setting">
        <legend>Tiempo por turno</legend>
        <div class="segmented">
          <label v-for="seconds in TURN_SECONDS_OPTIONS" :key="seconds">
            <input
              v-model="settings.turnSeconds"
              type="radio"
              name="turn-seconds"
              :value="seconds"
            />
            <span>{{ formatTurnSeconds(seconds) }}</span>
          </label>
        </div>
        <p class="hint">Si se acaba el tiempo, ese jugador pierde el turno.</p>
      </fieldset>

      <fieldset class="setting">
        <legend>Sonido</legend>
        <label class="slider">
          <span>Música</span>
          <input v-model.number="settings.musicVolume" type="range" min="0" max="100" step="5" />
          <output>{{ settings.musicVolume }}%</output>
        </label>
        <label class="slider">
          <span>Efectos</span>
          <input v-model.number="settings.sfxVolume" type="range" min="0" max="100" step="5" />
          <output>{{ settings.sfxVolume }}%</output>
        </label>
        <label class="toggle">
          <input v-model="settings.isMuted" type="checkbox" />
          <span>Silenciar todo</span>
        </label>
      </fieldset>
    </form>

    <template #footer>
      <button type="button" class="secondary-button" @click="resetSettings">Restablecer</button>
      <button type="button" class="primary-button" @click="emit('close')">Listo</button>
    </template>
  </AppDialog>
</template>

<style scoped>
.settings-form {
  display: grid;
  gap: 1.1rem;
}

.setting {
  margin: 0;
  padding: 0;
  border: none;
  min-width: 0;
}

.setting:disabled {
  opacity: 0.45;
}

.setting legend {
  margin-bottom: 0.5rem;
  padding: 0;
  font-weight: 700;
}

.segmented {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  padding: 0.25rem;
  border-radius: 1rem;
  background: var(--bg);
  box-shadow: inset 0 0 0 2px var(--outline);
}

.segmented label {
  flex: 1 1 auto;
  position: relative;
}

.segmented input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.segmented span {
  display: block;
  padding: 0.5rem 0.75rem;
  border-radius: 0.8rem;
  text-align: center;
  font-weight: 600;
  color: var(--text-muted);
  cursor: pointer;
  transition:
    background 150ms ease,
    color 150ms ease;
}

.segmented input:checked + span {
  background: var(--accent);
  color: var(--accent-text);
}

.segmented input:focus-visible + span {
  outline: 3px solid var(--focus-ring);
  outline-offset: 1px;
}

.setting:disabled .segmented span {
  cursor: not-allowed;
}

.hint {
  margin: 0.4rem 0 0;
  font-size: 0.9rem;
  color: var(--text-muted);
}

.slider {
  display: grid;
  grid-template-columns: 4.5rem 1fr 3rem;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.slider input {
  width: 100%;
  accent-color: var(--accent);
}

.slider output {
  text-align: right;
  font-variant-numeric: tabular-nums;
  color: var(--text-muted);
}

.toggle {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  cursor: pointer;
}

.toggle input {
  width: 1.2rem;
  height: 1.2rem;
  accent-color: var(--accent);
}

.primary-button,
.secondary-button {
  padding: 0.6rem 1.3rem;
  border: none;
  border-radius: 999px;
  font: inherit;
  font-weight: 600;
  cursor: pointer;
}

.primary-button {
  background: var(--accent);
  color: var(--accent-text);
  box-shadow: 0 4px 0 var(--accent-shadow);
}

.secondary-button {
  background: transparent;
  color: var(--text);
  box-shadow: inset 0 0 0 2px var(--outline);
}

button:focus-visible {
  outline: 3px solid var(--focus-ring);
  outline-offset: 2px;
}
</style>
