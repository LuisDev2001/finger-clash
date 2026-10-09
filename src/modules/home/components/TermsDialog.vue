<script setup lang="ts">
import AppDialog from './AppDialog.vue'

defineProps<{ isOpen: boolean }>()
const emit = defineEmits<{ close: [] }>()
</script>

<template>
  <AppDialog :is-open="isOpen" title="Términos y condiciones" @close="emit('close')">
    <div class="terms">
      <p class="updated">Última actualización: 9 de octubre de 2026</p>

      <h3>1. Aceptación</h3>
      <p>Al jugar Finger Clash aceptas estos términos. Si no estás de acuerdo, no uses el juego.</p>

      <h3>2. Uso del juego</h3>
      <p>
        Finger Clash es un juego gratuito de entretenimiento y práctica de sumas, pensado para uso
        personal y sin fines comerciales. No hay compras, anuncios ni cuentas de usuario.
      </p>

      <h3>3. Datos y privacidad</h3>
      <p>
        No recopilamos datos personales. Tus preferencias (modo, nivel, tiempo y volumen) se guardan
        solo en tu navegador y puedes borrarlas limpiando los datos del sitio. Las tipografías se
        cargan desde Google Fonts, que puede registrar datos técnicos como tu dirección IP.
      </p>

      <h3>4. Contenido</h3>
      <p>
        Los gráficos son originales y la música y los efectos se generan por código en tu
        dispositivo. Finger Clash se inspira en un juego tradicional de manos de dominio público.
      </p>

      <h3>5. Juego limpio y garantías</h3>
      <p>
        El juego se ofrece "tal cual", sin garantías de ningún tipo. El autor no se responsabiliza
        por pérdidas de partidas, ni por revanchas exigidas en la mesa.
      </p>

      <h3>6. Cambios</h3>
      <p>Estos términos pueden actualizarse; la fecha de arriba indica la versión vigente.</p>
    </div>

    <template #footer>
      <button type="button" class="primary-button" @click="emit('close')">Entendido</button>
    </template>
  </AppDialog>
</template>

<style scoped>
.terms {
  line-height: 1.55;
}

.updated {
  margin-top: 0;
  font-size: 0.9rem;
  color: var(--text-muted);
}

.terms h3 {
  margin: 1rem 0 0.25rem;
  font-size: 1.05rem;
}

.terms p {
  margin: 0;
}

.primary-button {
  padding: 0.6rem 1.3rem;
  border: none;
  border-radius: 999px;
  background: var(--accent);
  color: var(--accent-text);
  font: inherit;
  font-weight: 600;
  box-shadow: 0 4px 0 var(--accent-shadow);
  cursor: pointer;
}

.primary-button:focus-visible {
  outline: 3px solid var(--focus-ring);
  outline-offset: 2px;
}
</style>
