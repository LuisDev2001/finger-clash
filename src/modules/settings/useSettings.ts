import { ref, watch } from 'vue'
import {
  DEFAULT_SETTINGS,
  TURN_SECONDS_OPTIONS,
  type CpuLevel,
  type GameMode,
  type Settings,
  type TurnSeconds,
} from './settings.models'

const STORAGE_KEY = 'finger-clash:settings'
const GAME_MODES: readonly GameMode[] = ['cpu', 'local']
const CPU_LEVELS: readonly CpuLevel[] = ['easy', 'normal', 'hard']

export function parseSettings(raw: unknown): Settings {
  if (typeof raw !== 'object' || raw === null) return { ...DEFAULT_SETTINGS }
  const value = raw as Record<string, unknown>

  return {
    mode: pickOption(value.mode, GAME_MODES, DEFAULT_SETTINGS.mode),
    cpuLevel: pickOption(value.cpuLevel, CPU_LEVELS, DEFAULT_SETTINGS.cpuLevel),
    turnSeconds: pickOption<TurnSeconds>(
      value.turnSeconds,
      TURN_SECONDS_OPTIONS,
      DEFAULT_SETTINGS.turnSeconds,
    ),
    musicVolume: pickVolume(value.musicVolume, DEFAULT_SETTINGS.musicVolume),
    sfxVolume: pickVolume(value.sfxVolume, DEFAULT_SETTINGS.sfxVolume),
    isMuted: typeof value.isMuted === 'boolean' ? value.isMuted : DEFAULT_SETTINGS.isMuted,
  }
}

function pickOption<T>(value: unknown, options: readonly T[], fallback: T): T {
  return options.includes(value as T) ? (value as T) : fallback
}

function pickVolume(value: unknown, fallback: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback
  return Math.min(100, Math.max(0, Math.round(value)))
}

function readStoredSettings(): Settings {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return parseSettings(stored ? JSON.parse(stored) : null)
  } catch {
    return { ...DEFAULT_SETTINGS }
  }
}

const settings = ref<Settings>(readStoredSettings())

watch(
  settings,
  (value) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
    } catch {
      // Storage can be unavailable (private mode); settings still work for this session.
    }
  },
  { deep: true },
)

export function useSettings() {
  function resetSettings() {
    settings.value = { ...DEFAULT_SETTINGS }
  }

  return { settings, resetSettings }
}
