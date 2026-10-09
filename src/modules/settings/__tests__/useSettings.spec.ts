import { describe, expect, it } from 'vitest'
import { DEFAULT_SETTINGS } from '../settings.models'
import { parseSettings } from '../useSettings'

describe('parseSettings', () => {
  it('falls back to defaults for missing or malformed data', () => {
    expect(parseSettings(null)).toEqual(DEFAULT_SETTINGS)
    expect(parseSettings('oops')).toEqual(DEFAULT_SETTINGS)
  })

  it('keeps valid values and replaces invalid fields one by one', () => {
    const parsed = parseSettings({
      mode: 'local',
      cpuLevel: 'impossible',
      turnSeconds: 15,
      musicVolume: 140,
      sfxVolume: 35.6,
      isMuted: 'yes',
    })

    expect(parsed).toEqual({
      mode: 'local',
      cpuLevel: DEFAULT_SETTINGS.cpuLevel,
      turnSeconds: DEFAULT_SETTINGS.turnSeconds,
      musicVolume: 100,
      sfxVolume: 36,
      isMuted: DEFAULT_SETTINGS.isMuted,
    })
  })
})
