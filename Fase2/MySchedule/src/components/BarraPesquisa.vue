<template>
  <div class="search-bar">
    <Search size="24" class="search-icon" color="#be7979" /> 
    <input
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      type="text"
      :placeholder="placeholderText || 'Pesquise por um utilizador'"
    />
  </div>
</template>

<script setup>
import { Search } from 'lucide-vue-next'; 

defineProps(['modelValue', 'placeholderText']); 
defineEmits(['update:modelValue']);
</script>

<style scoped>
.search-bar {
  width: 315px;
  height: 53px;
  background-color: #FFFBFB;
  border: 1px solid #dad6d6;

  display: flex;
  align-items: center;
  padding: 0 6px;
  position: relative;
}

.search-bar input {
  flex-grow: 1;
  border: none;
  background: none;
  font-size: 15px;
  margin-bottom: -2px;

  color: #020202;
  outline: none;
  font-family: "Meera Inimai", sans-serif;
  padding-left: 30px;
}

.search-icon {
  width: 21px;
  height: 21px; 
  position: absolute;
  left: 10px;
}

.search-bar input::placeholder {
  color: #676565;
}

.search-bar input:focus::placeholder {
  visibility: hidden;
}
</style>
