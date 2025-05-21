<template>
  <div class="seccao-horario">
    <h2 class="titulo-horario">{{ titulo }}</h2>
    <TabelaHorario :horario="horario" @turno-click="handleTurnoClick"/>
  </div>
</template>

<script setup>
import TabelaHorario from './TabelaHorario.vue';

defineProps({
  titulo: String,
  horario: Object
});

const emit = defineEmits(['navigate-to-course']);

const handleTurnoClick = (courseId) => {
  emit('navigate-to-course', courseId);
};
</script>

  <style scoped>
  .seccao-horario {
    margin-bottom: 2.5rem;
  }
  
  .titulo-horario {
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: 2rem;
    color: #3E3E3E
  }
  </style>