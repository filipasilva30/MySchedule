<template>
  <div class="horario-page-container">
    <div class="botoes-container">
      <button
        :class="{ ativo: vistaAtual === 'pessoal' }"
        @click="vistaAtual = 'pessoal'"
      >
        Horário Pessoal
      </button>
      <button
        :class="{ ativo: vistaAtual === 'curso' }"
        @click="vistaAtual = 'curso'"
      >
        Horário do Curso
      </button>
    </div>

    <div class="horario-content">
      <HorarioPessoalAluno v-if="vistaAtual === 'pessoal'" :studentId="studentId" />
      <HorarioCursoAluno v-else :studentId="studentId" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
 
import HorarioPessoalAluno from '@/components/HorarioPessoalAluno.vue';
import HorarioCursoAluno from '@/components/HorarioCursoAluno.vue';
import { useSessionStorage } from '@/stores/session';

const session = useSessionStorage();
const studentId = computed(() => Number(session.id));

const vistaAtual = ref('pessoal');
</script>

<style scoped>
.horario-page-container {
  width: 100%;
  height: 80vh; 
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
}

.horario-content {
  width: 100%;
}

.botoes-container {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 3rem;
}

button {
  padding: 0.75rem 1.25rem;
  background-color: #FFFBFB;
  border: 2px solid #CEC9C9;
  cursor: pointer;
  transition: background-color 0.3s, color 0.3s;
  width: 200px;
  height: 50px;
  font-size: 1rem;  
  color: #727272;
}

button.ativo {
  background-color: #DF9898;
  color: white;
}

button:hover {
  background-color: #DF9898;
  color: white;
}

@media (max-width: 768px) {
  .horario-page-container {
    padding: 1rem;
  }

  .botoes-container {
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
  }

  button {
    width: 100%;
    max-width: 300px;
  }
}
</style>