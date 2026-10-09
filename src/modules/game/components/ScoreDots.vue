<script setup lang="ts">
defineProps<{ wins: number; target: number; label: string }>()
</script>

<template>
  <span class="flex items-center gap-1" role="img" :aria-label="label">
    <span
      v-for="slot in target"
      :key="slot"
      class="size-3 rounded-full ring-2 transition-colors duration-300"
      :class="slot <= wins ? 'bg-focus ring-focus' : 'bg-transparent ring-muted/60'"
    />
  </span>
</template>
