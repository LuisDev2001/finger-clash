<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watchEffect } from 'vue'
import { setAudioLevels, startMusic, stopMusic, unlockAudio } from './modules/audio/audioEngine'
import GameBoard from './modules/game/components/GameBoard.vue'
import HomeScreen from './modules/home/components/HomeScreen.vue'
import { useSettings } from './modules/settings/useSettings'

type Screen = 'home' | 'game'

const screen = ref<Screen>('home')
const { settings } = useSettings()
const UNLOCK_EVENTS = ['pointerdown', 'keydown'] as const

watchEffect(() =>
  setAudioLevels({
    music: settings.value.musicVolume,
    sfx: settings.value.sfxVolume,
    isMuted: settings.value.isMuted,
  }),
)

function handleFirstInteraction() {
  unlockAudio()
  UNLOCK_EVENTS.forEach((type) => window.removeEventListener(type, handleFirstInteraction))
}

onMounted(() => {
  startMusic()
  UNLOCK_EVENTS.forEach((type) => window.addEventListener(type, handleFirstInteraction))
})

onBeforeUnmount(() => {
  stopMusic()
  UNLOCK_EVENTS.forEach((type) => window.removeEventListener(type, handleFirstInteraction))
})
</script>

<template>
  <Transition name="screen" mode="out-in">
    <HomeScreen v-if="screen === 'home'" @start="screen = 'game'" />
    <GameBoard v-else @exit="screen = 'home'" />
  </Transition>
</template>

<style scoped>
.screen-enter-active,
.screen-leave-active {
  transition:
    opacity 220ms ease,
    transform 220ms ease;
}

.screen-enter-from {
  opacity: 0;
  transform: translateY(16px);
}

.screen-leave-to {
  opacity: 0;
  transform: translateY(-16px);
}
</style>
