<script setup lang="ts">
defineProps<{ turnSeconds: number; targetWins: number }>()
</script>

<template>
  <details class="rounded-2xl bg-surface px-4 py-2.5 ring-2 ring-outline ring-inset">
    <summary class="cursor-pointer font-semibold">¿Cómo se juega?</summary>
    <ul class="mt-2 list-disc space-y-0.5 pl-5 leading-relaxed">
      <li>Cada mano empieza con 1 dedo.</li>
      <li>En tu turno elige una de tus manos y toca una mano rival: le sumas tus dedos.</li>
      <li>
        Si pasa de 5 se vuelve a contar desde 0 (3 + 4 = 7 → 2). Con 5 exactos la mano queda fuera.
      </li>
      <li>Dividir: si una mano está en 0 y la otra tiene 2 o 4, repártelos a partes iguales.</li>
      <li v-if="turnSeconds > 0">
        Tienes {{ turnSeconds }} segundos por turno; si se acaban, pierdes el turno.
      </li>
      <li>Pierde la ronda quien se queda sin dedos en ambas manos.</li>
      <li>Si la misma posición se repite 3 veces, la ronda termina en empate.</li>
      <li v-if="targetWins > 1">
        Gana la partida quien llegue primero a {{ targetWins }} victorias.
      </li>
    </ul>
  </details>
</template>
