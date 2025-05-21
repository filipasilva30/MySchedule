<template>
  <div class="horarios-container">
    <Horarios @navigate-to-course="navigateToCourse" />
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import Horarios from '@/components/Horarios.vue';

const router = useRouter();

// Função para navegar para a página da UC quando um turno for clicado
const navigateToCourse = (courseId) => {
  router.push(`/unidades/director/${courseId}`);
};
</script>

<style scoped>
.horarios-container {
  height: 100%;
  width: 100%;
  overflow: hidden; 
  position: relative;
}

@media (max-width: 768px) {
  .horarios-container {
    padding: 1rem;
  }
}
</style>