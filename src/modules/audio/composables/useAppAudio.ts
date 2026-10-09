import { onBeforeUnmount, onMounted, watchEffect } from 'vue'
import {
  setAudioLevels,
  startMusic,
  stopMusic,
  unlockAudio,
} from '@/modules/audio/utils/audioEngine'
import { useSettings } from '@/modules/settings/composables/useSettings'

const UNLOCK_EVENTS = ['pointerdown', 'keydown'] as const

export function useAppAudio() {
  const { settings } = useSettings()

  watchEffect(() =>
    setAudioLevels({
      music: settings.value.musicVolume,
      sfx: settings.value.sfxVolume,
      isMuted: settings.value.isMuted,
    }),
  )

  function removeUnlockListeners() {
    UNLOCK_EVENTS.forEach((type) => window.removeEventListener(type, handleFirstInteraction))
  }

  function handleFirstInteraction() {
    unlockAudio()
    removeUnlockListeners()
  }

  onMounted(() => {
    startMusic()
    UNLOCK_EVENTS.forEach((type) => window.addEventListener(type, handleFirstInteraction))
  })

  onBeforeUnmount(() => {
    stopMusic()
    removeUnlockListeners()
  })
}
