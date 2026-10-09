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
    class="app-dialog"
    :aria-label="title"
    @close="emit('close')"
    @click="closeOnBackdrop"
  >
    <div class="dialog-panel">
      <header class="dialog-header">
        <h2>{{ title }}</h2>
        <button type="button" class="close-button" aria-label="Cerrar" @click="dialogRef?.close()">
          ✕
        </button>
      </header>
      <div class="dialog-body">
        <slot />
      </div>
      <footer v-if="$slots.footer" class="dialog-footer">
        <slot name="footer" />
      </footer>
    </div>
  </dialog>
</template>

<style scoped>
.app-dialog {
  width: min(100% - 2rem, 520px);
  max-height: min(100dvh - 2rem, 720px);
  padding: 0;
  border: none;
  border-radius: 1.75rem;
  background: var(--surface);
  color: var(--text);
  text-align: left;
  box-shadow: 0 14px 0 rgb(0 0 0 / 18%);
}

.app-dialog[open] {
  animation: dialog-in 260ms cubic-bezier(0.34, 1.56, 0.64, 1);
}

.app-dialog::backdrop {
  background: rgb(20 16 40 / 60%);
}

.dialog-panel {
  display: flex;
  flex-direction: column;
  max-height: inherit;
}

.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.25rem 1.5rem 0.75rem;
}

.dialog-header h2 {
  margin: 0;
  font-size: 1.5rem;
}

.close-button {
  width: 2.4rem;
  height: 2.4rem;
  border: none;
  border-radius: 999px;
  background: var(--outline);
  color: var(--text);
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}

.dialog-body {
  padding: 0.25rem 1.5rem 1rem;
  overflow-y: auto;
}

.dialog-footer {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1rem 1.5rem 1.25rem;
  border-top: 2px solid var(--outline);
}

button:focus-visible {
  outline: 3px solid var(--focus-ring);
  outline-offset: 2px;
}

@keyframes dialog-in {
  from {
    transform: scale(0.9);
    opacity: 0;
  }
}
</style>
