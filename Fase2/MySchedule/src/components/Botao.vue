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
  width: 100px;
  height: 30px;
  background-color: #FFFBFB;
  border: 1px solid #CEC9C9;
  color: #02020299;
  font-family: 'Roboto', sans-serif;


  font-size: 16px;
  font-weight: bold;
  border-radius: 20px;
  cursor: pointer;
  transition: background-color 0.3s, color 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;

}

.botao:hover {
  background-color: #DF9898;
  color: #FFFFFF;
}
</style>
