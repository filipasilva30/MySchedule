<template>
  <transition name="fade">
    <div v-if="modelValue" class="overlay" @click="handleBackgroundClick">
      <div class="overlay-content">
        <!-- Botão Enviar -->
        <div class="send-button-container">
          <Botao @click="emitSend">
            <div class="content-button">
              <SendHorizontal class="icon" />
              <span class="text-button">Enviar</span>
            </div>
          </Botao>
        </div>

        <!-- Retângulo cinza -->
        <div class="caixa-cinza">
          <div class="campos-superiores">
            <!-- Campo Para -->
            <div class="campo">
              <div class="label-caixa">Para</div>
              <input v-model="para" type="text" class="linha-input" placeholder="" />
            </div>

            <!-- Campo Assunto -->
            <div class="campo">
              <div class="label-caixa">Assunto</div>
              <input v-model="assunto" type="text" class="linha-input" placeholder="" />
            </div>
          </div>

          <textarea
            v-model="mensagem"
            placeholder="Escreva a sua mensagem"
            class="textarea-mensagem"
          ></textarea>
        </div>

        <!-- Slot -->
        <slot />
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, watch } from 'vue';
import axios from 'axios';
import { defineEmits, defineProps } from 'vue';
import { SendHorizontal } from 'lucide-vue-next';
import Botao from '@/components/Botao.vue';
import { useSessionStorage } from '@/stores/session';

const session = useSessionStorage();

const props = defineProps({
  modelValue: Boolean,
  paraInicial: String
});

const emit = defineEmits(['update:modelValue', 'send', 'notificar']);

const mensagem = ref('');
const para = ref(props.paraInicial || '');
const assunto = ref('');

watch(() => props.paraInicial, (novoValor) => {
  para.value = novoValor || '';
});

function handleBackgroundClick(event) {
  if (event.target.classList.contains('overlay')) {
    emit('update:modelValue', false);
  }
}

async function emitSend() {
  if (para.value.trim() === '') {
    alert('Preencha o campo "Para" antes de enviar.');
    return;
  }

  if (assunto.value.trim() === '') {
    alert('Preencha o campo "Assunto" antes de enviar.');
    return;
  }

  try {
    // Buscar o nome da pessoa que está na sessão (diretor)
    const res = await axios.get(`http://localhost:3000/directors/${session.id}`);
    const nomeDiretor = res.data.name;

    // Conteúdo da mensagem (o assunto será o corpo da mensagem neste caso)
    const conteudo = mensagem.value.trim();

    // Criar mensagens
    const mensagemEnviada = {
      enviada: true,
      idPessoa: session.id,
      para: para.value,
      assunto: assunto.value,
      conteudo,
      lida: true
    };

    const mensagemRecebida = {
      enviada: false,
      idPessoa: para.value,
      de: nomeDiretor,
      assunto: assunto.value,
      conteudo,
      lida: false
    };

    // Enviar as mensagens
    const [resEnv, resRec] = await Promise.all([
      axios.post('http://localhost:3000/mensagens', mensagemEnviada),
      axios.post('http://localhost:3000/mensagens', mensagemRecebida)
    ]);

    console.log('Mensagem enviada criada:', resEnv.data);
    console.log('Mensagem recebida criada:', resRec.data);

    alert('Mensagem enviada com sucesso!');

    emit('send');
    emit('notificar');
    emit('update:modelValue', false);
  } catch (error) {
    console.error('Erro ao enviar a mensagem:', error);
    alert('Erro ao enviar a mensagem. Tente novamente.');
  }
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
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }
  
  .overlay-content {
    position: relative;
    background-color: white;
    padding: 30px 40px;
    border-radius: 10px;
    width: 920px;
    height: 585px;
    max-width: 95%;
    max-height: 90%;
    box-shadow: 0px 0px 20px rgba(0, 0, 0, 0.3);
    overflow: hidden;
  }
  
  /* Container do botão */
  .send-button-container {
    position: absolute;
    left: 45px;
    top: 35px;
  }
  
  /* Ajuste do botão */
  .send-button-container .botao {
    width: 140px;
    height: 50px;
    font-size: 17px;
    border-radius: 0;
    padding-left: 12px;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 8px;
  }
  
  /* Conteúdo interno (ícone + texto) */
  .content-button {
    display: flex;
    align-items: center;
    gap: 16px;
  }
  
  /* Ícone */
  .icon {
    width: 18px;
    height: 18px;
    color: #BA7070;
    transition: color 0.3s ease;
  }
  
  /* Texto */
  .text-button {
    color: rgba(0, 0, 0, 0.718);;
    font-weight: bold;
    transition: color 0.3s ease;
  }
  
  /* Hover no botão */
  .send-button-container .botao:hover {
    background-color: #DF9898;
  }
  
  .send-button-container .botao:hover .icon,
  .send-button-container .botao:hover .text-button {
    color: #FFFFFF;
  }
  
  /* Fade do fundo */
  .fade-enter-active, .fade-leave-active {
    transition: opacity 0.3s ease;
  }
  .fade-enter-from, .fade-leave-to {
    opacity: 0;
  }
  .fade-enter-to, .fade-leave-from {
    opacity: 1;
  }
  
  /* Retângulo cinza */
  .caixa-cinza {
    margin-top: 100px;
    width: 830px;
    height: 400px;
    background-color: #F8F8F8;
    border-radius: 8px;
    margin-left: auto;
    margin-right: auto;
    padding: 20px 30px;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
  }
  
  /* Área de texto */
  .textarea-mensagem {
    width: 100%;
    height: 100%;
    background-color: white;
    border: none;
    border-radius: 6px;
    padding: 12px;
    resize: none;
    font-size: 16px;
    font-family: 'Meera Inimai', sans-serif;
    color: black;
    box-shadow: 0px 0px 4px rgba(0,0,0,0.1);
  }
  
  /* Área de texto focada */
  .textarea-mensagem:focus {
    outline: none;
    box-shadow: 0 0 6px rgba(0,0,0,0.3);
  }

  .campos-superiores {
  display: flex;
  flex-direction: column;
  gap: 25px;
  margin-bottom: 20px;
}

/* Cada linha (Para / Assunto) */
.campo {
  display: flex;
  align-items: center;
  gap: 20px;
}

/* Retângulo pequeno "Para" e "Assunto" */
.label-caixa {
  background-color: #FFFBFB;
  border: 1px solid #CEC9C9;
  padding: 10px 16px;
  font-weight: bold;
  color: rgba(2, 2, 2, 0.6);
  border-radius: 4px;
  font-size: 16px;
  white-space: nowrap;
}

/* Linha para escrever */
.linha-input {
  width: 300px;
  height: 30px;
  background-color: #888;
  border: none;
  border-bottom: 1px solid #888;
  font-size: 16px;
  padding: 8px 4px;
  background: transparent;
  font-family: 'Meera Inimai', sans-serif;
}

/* Quando se escreve */
.linha-input:focus {
  outline: none;
  border-bottom: 2px solid #BA7070;
}

</style>
  