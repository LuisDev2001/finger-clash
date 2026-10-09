<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'

const props = defineProps<{ isOpen: boolean; title: string }>()
const emit = defineEmits<{ close: [] }>()

const dialogRef = ref<HTMLDialogElement | null>(null)

function syncOpenState(isOpen: boolean) {
  const dialog = dialogRef.value
  if (!dialog) return
  if (isOpen && !dialog.open) dialog.showModal?.()
  if (!isOpen && dialog.open) dialog.close()
}

function closeOnBackdrop(event: MouseEvent) {
  if (event.target === dialogRef.value) dialogRef.value?.close()
}

watch(() => props.isOpen, syncOpenState)
onMounted(() => syncOpenState(props.isOpen))
</script>

<template>
  <dialog
    ref="dialogRef"
    class="m-auto max-h-[min(100dvh-2rem,720px)] w-[min(100%-2rem,520px)] rounded-[1.75rem] bg-surface p-0 text-left text-ink shadow-[0_14px_0_rgb(0_0_0/0.18)] backdrop:bg-overlay open:animate-bounce-in"
    :aria-label="title"
    @close="emit('close')"
    @click="closeOnBackdrop"
  >
    <div class="flex max-h-[inherit] flex-col">
      <header class="flex items-center justify-between gap-4 px-6 pt-5 pb-3">
        <h2 class="text-2xl font-bold">{{ title }}</h2>
        <button
          type="button"
          class="size-10 rounded-full bg-outline font-bold"
          aria-label="Cerrar"
          @click="dialogRef?.close()"
        >
          ✕
        </button>
      </header>
      <div class="overflow-y-auto px-6 pt-1 pb-4">
        <slot />
      </div>
      <footer
        v-if="$slots.footer"
        class="flex flex-wrap justify-end gap-3 border-t-2 border-outline px-6 pt-4 pb-5"
      >
        <slot name="footer" />
      </footer>
    </div>
  </dialog>
</template>
