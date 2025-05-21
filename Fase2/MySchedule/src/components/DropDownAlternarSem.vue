<template>
  <div class="dropdown">
    <button @click="toggleMenu" class="dropdown-button">
      <ChevronDown size="28" class="dropdown-icon" />
      <span>Alternar entre semestres</span>
    </button>
    <div v-if="isOpen" class="dropdown-menu">
      <!-- Opção para "Todos os Semestres" -->
      <button @click="selectSemester(null)" class="dropdown-item">Todos os Semestres</button>
      <button @click="selectSemester(1)" class="dropdown-item">1º Semestre</button>
      <button @click="selectSemester(2)" class="dropdown-item">2º Semestre</button>
    </div>
  </div>
</template>

<script setup>
import { ref, defineEmits } from 'vue';
import { ChevronDown } from 'lucide-vue-next';

const emit = defineEmits(['select-semester']);
const isOpen = ref(false);

const toggleMenu = () => {
  isOpen.value = !isOpen.value;
};

const selectSemester = (semester) => {
  emit('select-semester', semester);
  isOpen.value = false;
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
  color: #676565;
}

.dropdown-icon {
  margin-right: 10px;
  color: #be7979; 
}
</style>
