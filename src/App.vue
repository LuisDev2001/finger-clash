<script setup lang="ts">
import { useAppAudio } from '@/modules/audio/composables/useAppAudio'

useAppAudio()
</script>

<template>
  <RouterView v-slot="{ Component }">
    <Transition
      mode="out-in"
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="translate-y-4 opacity-0"
      leave-active-class="transition duration-200 ease-in"
      leave-to-class="-translate-y-4 opacity-0"
    >
      <component :is="Component" />
    </Transition>
  </RouterView>
</template>
