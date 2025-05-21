<template>
  <div class="dropdown">
    <button @click="toggleMenu" class="dropdown-button">
      <ChevronDown size="28" class="dropdown-icon" />
      <span>Alternar entre anos</span>
    </button>
    <div v-if="isOpen" class="dropdown-menu">
      <!-- Opção para "Todos os Anos" -->
      <button @click="selectYear(null)" class="dropdown-item">Todos os Anos</button>
      <button @click="selectYear(1)" class="dropdown-item">1º Ano</button>
      <button @click="selectYear(2)" class="dropdown-item">2º Ano</button>
      <button @click="selectYear(3)" class="dropdown-item">3º Ano</button>
    </div>
  </div>
</template>

<script setup>
import { ref, defineEmits } from 'vue';
import { ChevronDown } from 'lucide-vue-next';

// emitir o evento para o componente pai
const emit = defineEmits(['update:year']);

const isOpen = ref(false); // controlo do estado do menu dropdown
const selectedYear = ref(null); // ano selecionado

// alternar o menu de opções
const toggleMenu = () => {
  isOpen.value = !isOpen.value;
};

const selectYear = (year) => {
  selectedYear.value = year; // atualiza o ano selecionado ou "null" para todos os anos
  emit('update:year', year); // emite o evento para o componente pai
  isOpen.value = false; // fecha o menu após a seleção
};
</script>

<style scoped>

.dropdown {
  position: relative;
  width: 315px;
}

.dropdown-button {
  width: 100%;
  height: 53px;
  background-color: #FFFBFB;
  border: 1px solid #dad6d6;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  font-size: 14px;
  font-family: "Meera Inimai", sans-serif;
  cursor: pointer;
  padding: 0 10px;
  color: #676565; 
}

.dropdown-button:hover {
  background-color: #e6f7ff;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  background-color: #FFFBFB;
  border: 1px solid #dad6d6;
  display: flex;
  flex-direction: column;
  z-index: 1;
}

.dropdown-item {
  width: 100%;
  height: 40px;
  padding-left: 20px;
  background-color: #FFFBFB;
  border: none;
  text-align: left;
  font-size: 14px;
  cursor: pointer;
  color: #676565;
}

.dropdown-item:hover {
  background-color: #f0f0f0;
}


.dropdown-icon {
  margin-right: 10px; 
  color: #be7979;
}
</style>
