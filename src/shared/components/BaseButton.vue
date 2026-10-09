<script setup lang="ts">
type ButtonVariant = 'primary' | 'ghost'
type ButtonSize = 'icon' | 'sm' | 'md' | 'lg'

withDefaults(defineProps<{ variant?: ButtonVariant; size?: ButtonSize }>(), {
  variant: 'ghost',
  size: 'sm',
})

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    'bg-accent text-accent-ink shadow-[0_4px_0_var(--color-accent-shadow)] active:enabled:translate-y-0.5 active:enabled:shadow-[0_1px_0_var(--color-accent-shadow)]',
  ghost:
    'bg-surface text-ink shadow-[inset_0_0_0_2px_var(--color-outline)] hover:enabled:-translate-y-0.5',
}

const SIZE_CLASSES: Record<ButtonSize, string> = {
  icon: 'size-11 rounded-full text-lg',
  sm: 'rounded-full px-4 py-2',
  md: 'rounded-full px-6 py-2.5 text-lg',
  lg: 'w-full rounded-2xl px-5 py-3.5 text-xl',
}
</script>

<template>
  <button
    type="button"
    class="inline-flex items-center justify-center gap-2 font-semibold transition disabled:cursor-not-allowed disabled:opacity-35"
    :class="[VARIANT_CLASSES[variant], SIZE_CLASSES[size]]"
  >
    <slot />
  </button>
</template>
