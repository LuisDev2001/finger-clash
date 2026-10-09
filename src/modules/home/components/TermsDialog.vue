<script setup lang="ts">
import AppDialog from '@/modules/home/components/AppDialog.vue'
import BaseButton from '@/shared/components/BaseButton.vue'

defineProps<{ isOpen: boolean }>()
const emit = defineEmits<{ close: [] }>()

const SECTIONS = [
  {
    title: '1. Aceptación',
    body: 'Al jugar Finger Clash aceptas estos términos. Si no estás de acuerdo, no uses el juego.',
  },
  {
    title: '2. Uso del juego',
    body: 'Finger Clash es un juego gratuito de entretenimiento y práctica de sumas, pensado para uso personal y sin fines comerciales. No hay compras, anuncios ni cuentas de usuario.',
  },
  {
    title: '3. Datos y privacidad',
    body: 'No recopilamos datos personales. Tus preferencias (modo, nivel, tiempo y volumen) se guardan solo en tu navegador y puedes borrarlas limpiando los datos del sitio. Las tipografías se cargan desde Google Fonts, que puede registrar datos técnicos como tu dirección IP.',
  },
  {
    title: '4. Contenido',
    body: 'Los gráficos son originales y la música y los efectos se generan por código en tu dispositivo. Finger Clash se inspira en un juego tradicional de manos de dominio público.',
  },
  {
    title: '5. Juego limpio y garantías',
    body: 'El juego se ofrece "tal cual", sin garantías de ningún tipo. El autor no se responsabiliza por pérdidas de partidas, ni por revanchas exigidas en la mesa.',
  },
  {
    title: '6. Cambios',
    body: 'Estos términos pueden actualizarse; la fecha de arriba indica la versión vigente.',
  },
]
</script>

<template>
  <AppDialog :is-open="isOpen" title="Términos y condiciones" @close="emit('close')">
    <div class="leading-relaxed">
      <p class="text-sm text-muted">Última actualización: 9 de octubre de 2026</p>
      <section v-for="section in SECTIONS" :key="section.title">
        <h3 class="mt-4 mb-1 text-lg font-bold">{{ section.title }}</h3>
        <p>{{ section.body }}</p>
      </section>
    </div>

    <template #footer>
      <BaseButton variant="primary" @click="emit('close')">Entendido</BaseButton>
    </template>
  </AppDialog>
</template>
