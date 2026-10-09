import {
  CPU_LEVELS,
  DEFAULT_SETTINGS,
  GAME_MODES,
  TURN_SECONDS_OPTIONS,
  type Settings,
  type TurnSeconds,
} from '@/modules/settings/models/settings.models'

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
