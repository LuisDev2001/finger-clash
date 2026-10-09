<script setup lang="ts">
import BaseButton from '@/shared/components/BaseButton.vue'

defineProps<{ title: string; isDefeat: boolean }>()
const emit = defineEmits<{ restart: []; exit: [] }>()
</script>

<template>
  <div
    class="fixed inset-0 grid animate-fade-in place-items-center bg-overlay p-4"
    role="dialog"
    aria-modal="true"
    aria-labelledby="winner-title"
  >
    <div
      class="animate-bounce-in rounded-[2rem] bg-surface px-10 py-8 text-center shadow-[0_12px_0_rgb(0_0_0/0.15)]"
    >
      <p class="text-6xl" aria-hidden="true">{{ isDefeat ? '🤖' : '🏆' }}</p>
      <h2 id="winner-title" class="mt-1 mb-5 text-3xl font-bold">{{ title }}</h2>
      <div class="flex flex-wrap justify-center gap-3">
        <BaseButton variant="primary" size="md" @click="emit('restart')">Jugar de nuevo</BaseButton>
        <BaseButton size="md" @click="emit('exit')">Menú</BaseButton>
      </div>
    </div>
  </div>
</template>
