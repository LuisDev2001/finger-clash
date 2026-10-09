export const GAME_MODES = ['cpu', 'local'] as const

export type GameMode = (typeof GAME_MODES)[number]

export const CPU_LEVELS = ['easy', 'medium', 'hard'] as const

export type CpuLevel = (typeof CPU_LEVELS)[number]

export const TURN_SECONDS_OPTIONS = [0, 10, 20, 30] as const

export type TurnSeconds = (typeof TURN_SECONDS_OPTIONS)[number]

export const TARGET_WINS_OPTIONS = [1, 3, 5] as const

export type TargetWins = (typeof TARGET_WINS_OPTIONS)[number]

export interface Settings {
  mode: GameMode
  cpuLevel: CpuLevel
  turnSeconds: TurnSeconds
  targetWins: TargetWins
  musicVolume: number
  sfxVolume: number
  isMuted: boolean
}

export const DEFAULT_SETTINGS: Readonly<Settings> = {
  mode: 'cpu',
  cpuLevel: 'medium',
  turnSeconds: 20,
  targetWins: 3,
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
  medium: 'Medio',
  hard: 'Difícil',
}

export const CPU_LEVEL_HINTS: Record<CpuLevel, string> = {
  easy: 'Juega al azar: ideal para aprender.',
  medium: 'Aprovecha tus errores y evita los suyos.',
  hard: 'Calcula la partida completa: no se equivoca nunca.',
}

export function formatTurnSeconds(seconds: TurnSeconds): string {
  return seconds === 0 ? 'Sin límite' : `${seconds} s`
}

export function formatTargetWins(wins: TargetWins): string {
  return wins === 1 ? 'Partida única' : `A ${wins} victorias`
}
