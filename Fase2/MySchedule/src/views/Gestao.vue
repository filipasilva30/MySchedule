<template>
  <div class="gestao-container">
    <div class="decoracao-fundo"></div>

    <Tabela
      titulo="Conflitos, Trocas de Turnos e Salas"
      :colunas="colunas"
      :campos="campos"
      :dados="dados"
      @atualizar="acaoAtualizar"
      @aceitar="acaoAceitar"
      @rejeitar="acaoRejeitar"
    />

    <h2 class="titulo-secao">Alocação Manual</h2>

    <p class="frase" style="display: inline-block; margin-left: 2rem; margin-top: 1rem; margin-right: 1rem;">
      Selecione o número de aluno para prosseguir para a alocação manual:
    </p>
    <div class="dropdown" style="display: inline-block;">
      <select v-model="alunoSelecionado" class="dropbox">
        <option disabled value="">Selecione</option>
        <option v-for="aluno in estudantes" :key="aluno.id" :value="aluno.num">
          {{ aluno.num }}
        </option>
      </select>
      <ChevronDown class="select-icon" />
    </div>

    <!-- Overlay Alocar -->
    <Alocar :visivel="overlayAberto" :aluno="alunoSelecionado" @fechar="overlayAberto = false" />
  </div>
</template>

<script setup>
import Tabela from '@/components/Tabela.vue';
import Alocar from '@/components/Alocar.vue'; // ajusta o caminho conforme necessário
import { ref, onMounted, watch } from 'vue';
import { useGestaoStore } from '@/stores/capacidade';
import { getTurnosDisponiveis } from '@/utils/getTurnosDisponiveis';
import { prepararShiftRequests } from '@/utils/prepararShiftRequests';  
import { aceitarTrocaTurno, rejeitarTrocaTurno, atualizarAlocacao } from '@/utils/gestaoAcoes';
import { prepararTrocasDeSala } from '@/utils/prepararTrocasdeSalas';
import { tratarConflitos } from '@/utils/tratarConflitos';
import { ChevronDown } from 'lucide-vue-next';
import axios from 'axios';

const gestaoStore = useGestaoStore();
const colunas = ['Tipo', 'Número', 'Estatuto', 'Unidade Curricular', 'Turno atual', 'Alteração', 'Capacidade', 'Decisão'];
const campos = ['tipo', 'numero', 'estatuto', 'uc', 'turnoAtual', 'alteracao', 'capacidade', 'decisao'];

const dados = ref([]);
const estudantes = ref([]);
const alunoSelecionado = ref('');
const overlayAberto = ref(false);

watch(alunoSelecionado, (novoValor) => {
  if (novoValor) {
    overlayAberto.value = true;
  }
});

function getStudentNumber(studentId) {
  const student = estudantes.value.find(s => s.id == studentId);
  return student ? student.num : 'Desconhecido';
}

function getStudentStatus(studentId) {
  const student = estudantes.value.find(s => s.id == studentId);
  return student ? (student.specialStatus ? 'Sim' : 'Não') : 'Desconhecido';
}

function notifyAllocationUpdated() {
  window.dispatchEvent(new Event('allocationsUpdated'));
}

onMounted(async () => {
  try {
    const [conflictsRes, shiftsRes, coursesRes, studentsRes, classroomsRes, 
           shiftRequestsRes, classroomRequestsRes, teachersRes] = await Promise.all([
      axios.get('http://localhost:3000/conflicts'),
      axios.get('http://localhost:3000/shifts'),
      axios.get('http://localhost:3000/courses'),
      axios.get('http://localhost:3000/students'),
      axios.get('http://localhost:3000/classrooms'),
      axios.get('http://localhost:3000/shiftRequests'),
      axios.get('http://localhost:3000/classroomRequests'),
      axios.get('http://localhost:3000/teachers')
    ]);

    const conflitos = conflictsRes.data;
    const shifts = shiftsRes.data;
    const courses = coursesRes.data;
    estudantes.value = studentsRes.data;
    const classrooms = classroomsRes.data;
    const shiftRequests = shiftRequestsRes.data;
    const classroomRequests = classroomRequestsRes.data;
    const teachers = teachersRes.data;
    
    const capacidadePorTurno = {};
    shifts.forEach(shift => {
      const sala = classrooms.find(c => c.id == shift.classroomId);
      if (sala) {
        capacidadePorTurno[Number(shift.id)] = `${shift.totalStudentsRegistered}/${sala.capacity}`;
      }
    });
    gestaoStore.setCapacidades(capacidadePorTurno);

    const conflitosCompletos = await tratarConflitos({ conflitos, shifts, courses, estudantes: estudantes.value, gestaoStore });
    const pedidosTroca = prepararShiftRequests({ shiftRequests, shifts, courses, estudantes: estudantes.value });
    const pedidosSala = prepararTrocasDeSala({ classroomRequests, shifts, classrooms, teachers, courses });

    dados.value = [...conflitosCompletos, ...pedidosTroca, ...pedidosSala];
  } catch (error) {
    console.error('Erro ao carregar dados:', error);
  }
});

async function acaoAtualizar(item) {
  await atualizarAlocacao(item, dados, notifyAllocationUpdated);
}

async function acaoAceitar(item) {
  try {
    await aceitarTrocaTurno(item, dados);
  } catch (error) {
    console.error('Erro ao aceitar pedido de troca:', error);
  }
}

async function acaoRejeitar(item) {
  try {
    await rejeitarTrocaTurno(item, dados);
  } catch (error) {
    console.error('Erro ao rejeitar pedido de troca:', error);
  }
}
</script>


<style scoped>
.gestao-container {
  padding: 0.5rem;
  position: relative;
  max-width: 100%;
  width: 100%;
  box-sizing: border-box;
}

.decoracao-fundo {
  background-color: #FDF7F7;
  position: absolute;
  top: 7rem;      
  left: 0;
  right: 0;
  height: 6rem;  
  z-index: 0;
  border-radius: 0.5rem;
}

.titulo-secao {
  font-size: 1.5rem;
  font-weight: bold;
  margin-top: 4rem;
  margin-left: 2rem;
  text-align: left;
  color: #333;
}

.frase {
  font-family: 'Inter', sans-serif;
  font-size: 1.10rem; 
  margin-top: 1rem;
  margin-left: 2rem;
  color: black;
}

.dropdown {
  position: relative;
  display: inline-block;
  width: 200px; 
  margin-top: 0.75rem;
}

.dropbox {
  width: 100%;
  background-color: white;
  border: 1px solid #CEC9C9;
  padding: 0.5rem 2rem 0.5rem 0.75rem;
  border-radius: 0.5rem;
  font-family: 'Inter', sans-serif;
  font-size: 1rem;
  cursor: pointer;
  appearance: none;
}

.select-icon {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  color: #BA7070;
  width: 1rem;
  height: 1rem;
}

::v-deep(.uc-cell) {
  width: 13.75rem; 
  white-space: normal;
  overflow: visible;
  text-overflow: initial;
}

::v-deep(th:nth-child(4)) {
  width: 13.75rem; 
}
</style>
