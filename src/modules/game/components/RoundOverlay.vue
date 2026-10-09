<script setup lang="ts">
import BaseButton from '@/shared/components/BaseButton.vue'

defineProps<{
  emoji: string
  title: string
  detail?: string
  score?: { names: [string, string]; wins: [number, number]; draws: number }
  primaryLabel: string
}>()
const emit = defineEmits<{ primary: []; exit: [] }>()
</script>

<template>
  <div
    class="fixed inset-0 grid animate-fade-in place-items-center bg-overlay p-4"
    role="dialog"
    aria-modal="true"
    aria-labelledby="round-title"
  >
    <div
      class="animate-bounce-in rounded-[2rem] bg-surface px-10 py-8 text-center shadow-[0_12px_0_rgb(0_0_0/0.15)]"
    >
      <p class="text-6xl" aria-hidden="true">{{ emoji }}</p>
      <h2 id="round-title" class="mt-1 text-3xl font-bold">{{ title }}</h2>
      <p v-if="detail" class="mt-1 text-muted">{{ detail }}</p>
      <div v-if="score" class="mt-4 rounded-2xl bg-canvas px-5 py-3">
        <div class="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
          <span class="text-right text-sm font-semibold text-muted">{{ score.names[0] }}</span>
          <span class="text-3xl font-bold tabular-nums">
            {{ score.wins[0] }} <span class="text-muted">–</span> {{ score.wins[1] }}
          </span>
          <span class="text-left text-sm font-semibold text-muted">{{ score.names[1] }}</span>
        </div>
        <p v-if="score.draws" class="mt-1 text-xs text-muted">Empates: {{ score.draws }}</p>
      </div>
      <div class="mt-5 flex flex-wrap justify-center gap-3">
        <BaseButton variant="primary" size="md" @click="emit('primary')">
          {{ primaryLabel }}
        </BaseButton>
        <BaseButton size="md" @click="emit('exit')">Menú</BaseButton>
      </div>
    </div>
  </div>
</template>
