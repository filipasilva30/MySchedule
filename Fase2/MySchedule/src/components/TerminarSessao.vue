<template>
  <div class="modal-overlay" v-if="visible">
    <div class="modal-content">
      <p>Deseja terminar sessão?</p>
      <div class="botoes">
        <button @click="confirmar">Sim</button>
        <button @click="cancelar">Não</button>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  visible: Boolean
});
const emit = defineEmits(['confirmar', 'cancelar']);

function confirmar() {
  emit('confirmar');
}

function cancelar() {
  emit('cancelar');
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 600px;  
  left: 160px;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  box-shadow: 0 0 8px rgba(0,0,0,0.2);
  max-width: 250px;
  text-align: center;
}

.botoes {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 1rem;
}

button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

button:first-child {
  background-color: #dc2626;
  color: white;
}

button:last-child {
  background-color: #e5e5e5;
}
</style>