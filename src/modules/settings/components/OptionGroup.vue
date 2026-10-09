<script setup lang="ts" generic="T extends string | number">
defineProps<{
  legend: string
  name: string
  options: readonly { value: T; label: string }[]
  hint?: string
  isDisabled?: boolean
}>()

const model = defineModel<T>({ required: true })
</script>

<template>
  <fieldset class="min-w-0 disabled:opacity-45" :disabled="isDisabled">
    <legend class="mb-2 font-bold">{{ legend }}</legend>
    <div class="flex flex-wrap gap-1 rounded-2xl bg-canvas p-1 ring-2 ring-outline ring-inset">
      <label v-for="option in options" :key="option.value" class="relative flex-auto">
        <input
          v-model="model"
          class="peer sr-only"
          type="radio"
          :name="name"
          :value="option.value"
        />
        <span
          class="block cursor-pointer rounded-xl px-3 py-2 text-center font-semibold text-muted transition-colors peer-checked:bg-accent peer-checked:text-accent-ink peer-focus-visible:outline-3 peer-focus-visible:outline-focus peer-disabled:cursor-not-allowed"
        >
          {{ option.label }}
        </span>
      </label>
    </div>
    <p v-if="hint" class="mt-1.5 text-sm text-muted">{{ hint }}</p>
  </fieldset>
</template>
