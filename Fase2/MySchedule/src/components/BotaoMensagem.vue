<template>
    <button class="botao" @click="onClick">
      <slot>
        {{ label }}
      </slot>
    </button>
  </template>
  
  <script setup lang="ts">
  import { defineProps, defineEmits } from 'vue';
  
  const props = defineProps({
    label: {
      type: String,
      required: true
    }
  });
  
  const emit = defineEmits(['click']);
  
  function onClick() {
    emit('click');
  }
  </script>
  
  <style scoped>
.botao {
  width: 250px;
  height: 53px;
  background-color: #FFFBFB;
  border: 1px solid #CEC9C9; 
  color: #676565;
  font-family: "Meera Inimai", sans-serif; /* Aplique a mesma fonte da BarraPesquisa.vue */
  font-size: 15px; /* Aplique o mesmo tamanho de fonte */
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s, color 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
  
.botao:hover {
  background-color: #DF9898;
  color: #FFFFFF;
}

  </style>