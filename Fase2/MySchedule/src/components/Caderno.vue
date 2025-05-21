<template>
  <div class="overlay" @click.self="fechar">
    <transition name="slide">
      <div v-if="mostrar && podeAcessar" class="caderno">
        <div class="cabecalho">Anotações</div>
        <div class="bloco-branco">
          <textarea
            v-model="texto"
            class="textarea-linhas"
            placeholder="Escreva aqui as suas anotações..."
          ></textarea>
        </div>
        <button @click="limparTexto" class="limpar-button">
          Limpar
        </button>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useSessionStorage } from '@/stores/session.ts';
import { updateCaderno, updateTeacherCaderno } from '../api.ts';  

const session = useSessionStorage();
const usuarioLogado = ref(session); 

const texto = ref(usuarioLogado.value.caderno || ''); 
const mostrar = ref(false);

// determina se o user pode acessar as anotações
const podeAcessar = computed(() => {
  return usuarioLogado.value.type === 'teacher' || usuarioLogado.value.type === 'director';
});

const emit = defineEmits(['fechar']);

onMounted(() => {
  mostrar.value = true;
});

function fechar() {
  mostrar.value = false;

  if (usuarioLogado.value.type === 'teacher') {
    updateTeacherCaderno(usuarioLogado.value.id, texto.value).then(response => {
      console.log('Caderno do professor atualizado:', response);
      session.updateCaderno(texto.value);  // Atualiza o caderno na store local
    }).catch(error => {
      console.error('Erro ao atualizar caderno do professor:', error);
    });
  } else if (usuarioLogado.value.type === 'director') {
    updateCaderno(usuarioLogado.value.id, texto.value).then(response => {
      console.log('Caderno do diretor atualizado:', response);
      session.updateCaderno(texto.value);  // Atualiza o caderno na store local
    }).catch(error => {
      console.error('Erro ao atualizar caderno do diretor:', error);
    });
  }

  setTimeout(() => emit('fechar'), 500);
}


function limparTexto() {
  texto.value = ''; 
}
</script>

<style scoped>
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5); 
  z-index: 9999;
  display: flex;
  justify-content: flex-end;
  align-items: stretch;
  overflow: hidden;
}

.caderno {
  width: 40%;
  height: 90%;
  margin: auto 0;
  background-color: #373737;
  padding: 20px;
  box-shadow: -4px 0 10px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.cabecalho {
  color: white;
  font-size: 20px;
  font-weight: bold;
  padding-bottom: 7px;
  text-align: center;
}

.bloco-branco {
  background-color: white;
  flex: 1;
  padding: 20px;
  overflow: hidden;
  display: flex;
}

.textarea-linhas {
  width: 100%;
  height: 100%;
  resize: none;
  border: none;
  outline: none;
  font-size: 15px;
  font-family: 'Courier New', monospace;
  padding: 4px 8px 8px 8px;
  line-height: 24px;
  background: repeating-linear-gradient(to bottom, white, white 23px, #ccc 24px);
}

.limpar-button {
  width: 35%; 
  margin: 20px auto 0 auto; 
  padding: 8px;
  background-color: white;
  color: black;
  border: none;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold; 
  display: flex;
  align-items: center;
  justify-content: center; 
  border-radius: 4px;
  transition: background-color 0.3s ease, color 0.3s ease;
}

.limpar-button:hover {
  background-color: #a9a7a7;
}

.trash-icon {
  width: 16px;
  height: 16px;
  margin-left: 8px;
  background-color: white;
  clip-path: url(#trash-icon);
}

svg {
  display: none;
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.45s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
}
</style>
