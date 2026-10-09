import { ref, watch } from 'vue'
import { DEFAULT_SETTINGS, type Settings } from '@/modules/settings/models/settings.models'
import { parseSettings } from '@/modules/settings/utils/parseSettings'

const STORAGE_KEY = 'finger-clash:settings'

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

  function toggleMute() {
    settings.value.isMuted = !settings.value.isMuted
  }

  return { settings, resetSettings, toggleMute }
}
