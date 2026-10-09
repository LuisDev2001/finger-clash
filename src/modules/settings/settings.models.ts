export type GameMode = 'cpu' | 'local'

export type CpuLevel = 'easy' | 'normal' | 'hard'

export const TURN_SECONDS_OPTIONS = [0, 10, 20, 30] as const

export type TurnSeconds = (typeof TURN_SECONDS_OPTIONS)[number]

export interface Settings {
  mode: GameMode
  cpuLevel: CpuLevel
  turnSeconds: TurnSeconds
  musicVolume: number
  sfxVolume: number
  isMuted: boolean
}

export const DEFAULT_SETTINGS: Readonly<Settings> = {
  mode: 'cpu',
  cpuLevel: 'normal',
  turnSeconds: 20,
  musicVolume: 40,
  sfxVolume: 70,
  isMuted: false,
}

export const MODE_LABELS: Record<GameMode, string> = {
  cpu: 'vs CPU',
  local: '2 jugadores',
}

export const CPU_LEVEL_LABELS: Record<CpuLevel, string> = {
  easy: 'Fácil',
  normal: 'Normal',
  hard: 'Difícil',
}

export function formatTurnSeconds(seconds: TurnSeconds): string {
  return seconds === 0 ? 'Sin límite' : `${seconds} s`
}
