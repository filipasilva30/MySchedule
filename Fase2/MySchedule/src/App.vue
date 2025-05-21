<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { RouterView, useRoute, useRouter } from 'vue-router';
import Sidebar from '@/components/Navegacao.vue';
import Caderno from '@/components/Caderno.vue';
import TerminarSessao from '@/components/TerminarSessao.vue';
import { useMensagensStore } from '@/stores/useMensagensStore';
import { useSessionStorage } from '@/stores/session.ts';

const store = useMensagensStore();
const session = useSessionStorage(); // Aceder à sessão
const mensagensNaoLidas = computed(() => {
  return session.id ? store.mensagensNaoLidasPorUtilizador(session.id).value : 0;
});
const mostrarCaderno = ref(false);
const route = useRoute();
const router = useRouter();
const mostrarLogout = ref(false);

// Dinâmico: tipo do utilizador
const tipoUtilizador = computed(() => session.type); // student / teacher / director

function toggleCaderno() {
  mostrarCaderno.value = !mostrarCaderno.value;
}

function abrirLogout() {
  mostrarLogout.value = true;
}

function confirmarLogout() {
  const session = useSessionStorage();
  session.logout();
  mostrarLogout.value = false;
  router.push('/login');
}

let intervalo: number;

onMounted(() => {
  store.carregarMensagens();
  intervalo = setInterval(() => {
    store.carregarMensagens();
  }, 5000);
});

onUnmounted(() => {
  clearInterval(intervalo);
});
</script>


<template>
  <div :class="['app-container', { 'no-sidebar': route.name === 'Login' }]">
    <Sidebar
    v-if="route.name !== 'Login'"
    :mensagensNaoLidas="mensagensNaoLidas"
    :tipoUtilizador="tipoUtilizador" 
    @abrir-caderno="toggleCaderno"
    @terminar-sessao="abrirLogout" 
   />

   <TerminarSessao
    :visible="mostrarLogout"
    @confirmar="confirmarLogout"
    @cancelar="mostrarLogout = false"
  />

    <div class="main-wrapper">
      <main class="main-content">
        <RouterView />
      </main>
    </div>

    <Caderno v-if="mostrarCaderno" @fechar="toggleCaderno" />
  </div>
</template>

<style scoped>
/* Layout base */
.app-container {
  display: flex;
  min-height: 100vh;
  width: 100%;
}

/* Estilo padrão com sidebar */
.main-wrapper {
  flex: 1;
  margin-left: 150px;
  background-color: #fff;
  padding: 2rem;
}

/* Override para login */
.app-container.no-sidebar .main-wrapper {
  margin-left: 0;
  padding: 0;
}


.caderno-wrapper {
  position: fixed;
  right: 0;
  top: 0;
  z-index: 1000;
}

@media (max-width: 768px) {
  .main-wrapper {
    margin-left: 100px;
    padding: 1rem;
  }
}
</style>
