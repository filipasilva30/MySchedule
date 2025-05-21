<template>
  <div class="messages-container">
    <div class="top-bar">
      <BotaoMensagem label="Nova Mensagem" @click="abrirOverlay" />
      <SearchBar v-model="termoPesquisa" />
    </div>

    <div class="messages-boxes">
      <!-- RECEBIDAS -->
      <div class="message-box received">
        <div class="header">Recebidas</div>
        <div class="message-list">
          <div
            v-for="mensagem in mensagensRecebidasFiltradas"
            :key="mensagem.id"
            :class="['message-item', { lida: mensagem.lida }]"
            @click="abrirMensagem(mensagem)"
          >
            <div class="message-content">
              <p><strong>De:</strong> {{ mensagem.de }}</p>
              <p><strong>Assunto:</strong> {{ mensagem.assunto }}</p>
              <p>{{ mensagem.conteudo }}</p>
            </div>
            <div class="message-actions" @click.stop>
              <button
                v-if="!mensagem.lida"
                class="icon-button"
                title="Mensagem não lida"
              >
                <MailWarning :size="22" />
              </button>
              <button
                class="icon-button trash"
                title="Apagar mensagem"
                @click="eliminarMensagem(mensagem.id)"
              >
                <Trash2 :size="26" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- ENVIADAS -->
      <div class="message-box sent">
        <div class="header">Enviadas</div>
        <div class="message-list">
          <div
            v-for="mensagem in mensagensEnviadasFiltradas"
            :key="mensagem.id"
            :class="['message-item', { lida: mensagem.lida }]"
            @click="abrirMensagem(mensagem)"
          >
            <div class="message-content">
              <p><strong>Para:</strong> {{ mensagem.para }}</p>
              <p><strong>Assunto:</strong> {{ mensagem.assunto }}</p>
              <p>{{ mensagem.conteudo }}</p>
            </div>
            <div class="message-actions" @click.stop>
              <button
                class="icon-button trash"
                title="Apagar mensagem"
                @click="eliminarMensagem(mensagem.id)"
              >
                <Trash2 :size="26" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

<!-- Overlay para Diretor -->
<EnviarMensagem 
  v-if="showOverlay && session.type === 'director'"
  v-model="showOverlay" 
  :paraInicial="destinatarioResposta"
  @send="enviarMensagem"
  @notificar="mostrarNotificacaoTemporaria"
/>

<!-- Overlay para Aluno -->
<EnviarMensagemAluno 
  v-if="showOverlay && session.type === 'student'"
  v-model="showOverlay" 
  :paraInicial="destinatarioResposta"
  @send="enviarMensagem"
  @notificar="mostrarNotificacaoTemporaria"
/>
    <Mensagem
      v-if="mostrarMensagem"
      v-model="mostrarMensagem"
      :de="mensagemSelecionada.de"
      :para="mensagemSelecionada.para"
      :assunto="mensagemSelecionada.assunto"
      :conteudo="mensagemSelecionada.conteudo"
      :enviada="mensagemSelecionada.enviada"
      @apagar="eliminarMensagem(mensagemSelecionada.id)"
      @responder="responderMensagem"
      @fechado="mostrarMensagem = false"
    />

    <!-- Notificação de sucesso -->
    <div v-if="showNotificacao" class="notificacao">
      Mensagem enviada
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { Trash2, MailWarning } from 'lucide-vue-next';
import SearchBar from '@/components/BarraPesquisa.vue';
import BotaoMensagem from '@/components/BotaoMensagem.vue';
import EnviarMensagem from '@/components/EnviarMensagemDiretor.vue';
import EnviarMensagemAluno from '@/components/EnviarMensagemAluno.vue';
import Mensagem from '@/components/Mensagem.vue';
import { useMensagensStore } from '@/stores/useMensagensStore';
import axios from 'axios'; 
import { useSessionStorage } from '@/stores/session';


const store = useMensagensStore();
const session = useSessionStorage();

const showOverlay = ref(false);
const showNotificacao = ref(false);
const mostrarMensagem = ref(false);
const mensagemSelecionada = ref({ de: '', assunto: '', conteudo: '' });
const destinatarioResposta = ref('');
const termoPesquisa = ref('');

// Carregar mensagens diretamente do json-server com Axios
onMounted(async () => {
  try {
    await store.carregarMensagens();
  } catch (error) {
    console.error('Erro ao carregar as mensagens:', error);
  }
});

const mensagens = computed(() => store.mensagens);
const mensagensNaoLidas = computed(() => store.mensagensNaoLidas);

function normalizar(texto) {
  return texto.normalize("NFD").replace(/\p{Diacritic}/gu, '').toLowerCase();
}

const mensagensRecebidasFiltradas = computed(() =>
  mensagens.value.filter(
    m =>
      !m.enviada && m.idPessoa === session.id && // só mostra mensagens recebidas pelo utilizador com sessão
      (termoPesquisa.value === '' || normalizar(m.de).includes(normalizar(termoPesquisa.value)))
  )
);

const mensagensEnviadasFiltradas = computed(() =>
  mensagens.value.filter(
    m =>
      m.enviada && m.idPessoa === session.id && // só mostra mensagens enviadas pelo utilizador com sessão
      (termoPesquisa.value === '' || normalizar(m.para).includes(normalizar(termoPesquisa.value)))
  )
);


function abrirOverlay() {
  showOverlay.value = true;
}

function mostrarNotificacaoTemporaria() {
  showNotificacao.value = true;
  setTimeout(() => {
    showNotificacao.value = false;
  }, 3000);
}

function abrirMensagem(mensagem) {
  if (!mensagem.lida) {
    store.marcarComoLida(mensagem.id);
  }
  mensagemSelecionada.value = { ...mensagem };
  mostrarMensagem.value = true;
}

function eliminarMensagem(id) {
  store.eliminarMensagem(id);
}

function responderMensagem(destinatario) {
  destinatarioResposta.value = destinatario;
  showOverlay.value = true;
  mostrarMensagem.value = false;
}
</script>

<style scoped>
.messages-container {
  display: flex;
  flex-direction: column;
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto; 
  box-sizing: border-box;
}

.top-bar {
  display: flex;
  width: 100%;
  justify-content: flex-end;
  gap: 20px;
  align-items: center;
  margin-bottom: 20px;
}

.messages-boxes {
  display: flex;
  justify-content: center;
  gap: 150px; 
  margin-top: 50px;
  flex-wrap: wrap;
}

.message-box {
  width: 488px;
  height: 535px;
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
  position: relative;
  flex-shrink: 0;
}

/* Media query for medium screens */
@media (max-width: 1200px) {
  .messages-boxes {
    padding: 0 20px;
  }
}

/* Media query for mobile devices */
@media (max-width: 768px) {
  .messages-boxes {
    gap: 50px;
    flex-direction: column;
    align-items: center;
  }
  
  .message-box {
    margin-bottom: 30px;
  }
}

/* Rest of your existing styles remain unchanged */
.message-box .header {
  width: 146px;
  height: 32px;
  background-color: #ba7070;
  color: white;
  text-align: center;
  line-height: 32px;
  margin: 0 0 0 20px;
  font-size: 18px;
  font-weight: bold;
  position: absolute;
  top: -10px;
  left: 0;
  border-radius: 10px 10px 0 0;
}

.message-list {
  padding: 15px;
  max-height: 400px;
  overflow-y: auto;
}

.message-item {
  margin-top: 20px;
  display: flex;
  justify-content: space-between;
  align-items: start;
  background-color: #fceace;
  border: 1px solid #c9c3c3;
  padding: 6px 10px;
  margin-bottom: 0px;
  min-height: 60px;
  font-size: 13px;
}

.message-item.lida {
  background-color: #faf6ea;
}

.message-item:not(:first-child) {
  margin-top: 4px;
}

.message-content {
  max-width: 85%;
  color: #000;
}

.message-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.icon-button {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
}

.icon-button.trash:hover {
  color: #ba7070;
  transition: color 0.3s ease;
}

.message-content strong {
  font-size: 13px;
  font-weight: bold;
}

.received .header {
  background-color: #ba7070;
}

.sent .header {
  background-color: #ba7070;
}

.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  width: 150px;
  height: 100vh;
  background-color: #373737;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 90px;
  justify-content: flex-start;
}

.nav-links {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.nav-link {
  padding: 1.5rem;
  text-decoration: none;
  color: white;
  font-weight: bold;
  text-align: center;
  border-bottom: 1px solid #444;
  transition: background-color 0.3s, color 0.3s;
}

.nav-link:hover {
  background-color: #ffffff;
  color: #373737;
}

.nav-link.router-link-exact-active {
  background-color: #ffffff;
  color: #373737;
}

.message-content p:last-child {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: block;
  max-width: 100%;
}

.notificacao {
  position: fixed;
  top: 30px;
  right: 30px;
  background-color: #8cc378;
  color: white;
  padding: 12px 20px;
  border-radius: 8px;
  font-weight: bold;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  z-index: 9999;
  animation: fadein 0.4s ease;
}



@keyframes fadein {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
