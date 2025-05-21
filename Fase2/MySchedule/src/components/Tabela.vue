<template>
  <div class="gestao-container">
    <div class="decoracao-fundo"></div>

    <h1 class="titulo">{{ titulo }}</h1>

    <div class="tabela-wrapper">
      <table class="tabela-gestao">
        <thead>
          <tr>
            <th v-for="(coluna, index) in colunas" :key="index">{{ coluna }}</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="(item, index) in dados" :key="index">
            <td
              v-for="(campo, i) in campos"
              :key="i"
              :class="campo === 'uc' ? 'uc-cell' : ''"
            >
          <!-- Decisão -->
          <template v-if="campo === 'decisao'">
            <template v-if="item.tipo === 'Troca de Turno'">
              <span class="acoes">
                <span class="acao aceitar" @click="$emit('aceitar', item)">✔</span>
                <span class="acao rejeitar" @click="$emit('rejeitar', item)">✖</span>
              </span>
            </template>
            <template v-else>
              <span class="acao atualizar" @click="$emit('atualizar', item)">
                Atualizar
              </span>
            </template>
          </template>


              <!-- Alteração (com dropdown) -->
              <template v-else-if="campo === 'alteracao' && Array.isArray(item[campo])">
                <select v-model="item.escolha" class="dropdown">
                  <option disabled value="">Seleciona uma opção</option>
                  <option v-for="op in item[campo]" :key="op.id" :value="op.id">
                    {{ op.name }}
                  </option>
                </select>
              </template>

              <!-- Capacidade dinâmica a partir da store -->
              <template v-else-if="campo === 'capacidade'">
                <span>
                  {{ item.capacidade || gestaoStore.getCapacidadeById(Number(item.escolha)) || '---' }}
                </span>
              </template>

              <!-- Campo normal -->
              <template v-else>
                {{ item[campo] }}
              </template>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { watch } from 'vue';
import { useGestaoStore } from '@/stores/capacidade';

const gestaoStore = useGestaoStore();

const props = defineProps({
  titulo: String,
  colunas: Array,
  campos: Array,
  dados: Array
});

const emit = defineEmits(['atualizar', 'aceitar', 'rejeitar']);

watch(
  () => props.dados,
  (novosDados) => {
    if (novosDados) {
      novosDados.forEach((item, index) => {
        watch(
          () => item.escolha,
          (novaEscolha) => {
            if (novaEscolha) {
              console.log(`Linha ${index} - Escolha: ${novaEscolha}`);
              console.log(`Capacidade: ${gestaoStore.getCapacidadeById(Number(novaEscolha))}`);
            }
          },
          { immediate: true }
        );
      });
    }
  },
  { immediate: true, deep: true }
);
</script>

<style scoped>
.gestao-container {
  padding: 2rem;
  position: relative;
  max-width: 100%;
  width: 100%;
  box-sizing: border-box;
}

.decoracao-fundo {
  background-color: #FDF7F7;
  position: absolute;
  top: 165px;
  left: 0;
  right: 0;
  height: 370px;
  z-index: 0;
  border-radius: 8px;
}

.titulo {
  margin-top: 50px;
  font-family: 'Inter', sans-serif;
  font-weight: 800;
  font-size: 1.75rem;
  margin-bottom: 1.5rem;
  color: #000;
  position: relative;
  z-index: 1;
  text-align: left;
}

.tabela-wrapper {
  margin-top: 60px;
  overflow-y: auto;
  overflow-x: auto;
  max-height: 310px;
  position: relative;
  z-index: 1;
  border-radius: 6px;
}

.tabela-gestao {
  width: 100%;
  min-width: 850px;
  border-collapse: collapse;
  table-layout: fixed;
}

.tabela-gestao th,
.tabela-gestao td {
  padding: 0.5rem;
  border: 1px solid #ddd;
  text-align: center;
  font-size: 0.875rem;
  color: #000;
  background-color: white;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tabela-gestao th {
  padding: 0.75rem 0.5rem;
}

.tabela-gestao thead th {
  background-color: #867D7D;
  color: black;
  font-weight: bold;
  position: sticky;
  top: 0;
  z-index: 2;
}

.uc-cell {
  white-space: normal !important;
  overflow: visible !important;
  text-overflow: initial !important;
}

.acao {
  cursor: pointer;
  margin: 0 5px;
  transition: color 0.2s ease;
}

.atualizar:hover {
  color: #3576E7;
}

.aceitar:hover {
  color: #4DAE54;
}

.rejeitar:hover {
  color: #B52525;
}

.dropdown {
  padding: 4px;
  border-radius: 4px;
  font-size: 0.85rem;
  width: 100%;
  box-sizing: border-box;
}

@media (max-width: 768px) {
  .titulo {
    font-size: 1.4rem;
    margin-top: 40px;
  }

  .tabela-gestao {
    font-size: 0.75rem;
    min-width: 700px;
  }

  .tabela-wrapper {
    max-height: 260px;
  }

  .gestao-container {
    padding: 1rem;
  }
}
</style>
