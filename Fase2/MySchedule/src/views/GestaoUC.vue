<template>
  <div class="gestao-container">
    <div class="decoracao-fundo"></div>
    <div v-if="isLoading"></div>

    <div v-else-if="dadosFiltrados.length === 0" class="overlay">
      <div class="overlay-content">
        <p>De momento, esta Unidade Curricular não apresenta conflitos, trocas de turnos nem trocas de sala!</p>
      </div>
    </div>

    <Tabela
      v-else
      titulo="Conflitos, Trocas de Turnos e Salas"
      :colunas="colunas"
      :campos="campos"
      :dados="dadosFiltrados"
      @atualizar="acaoAtualizar"
      @aceitar="acaoAceitar"
      @rejeitar="acaoRejeitar"
    />

  </div>
</template>

<script setup>
const isLoading = ref(true)
import { useRoute } from 'vue-router'
import Tabela from '@/components/Tabela.vue'
import { useGestaoStore } from '@/stores/capacidade'; 
import { prepararTrocasDeSala } from '@/utils/prepararTrocasdeSalas';
import { aceitarTrocaTurno, rejeitarTrocaTurno, atualizarAlocacao} from '@/utils/gestaoAcoes';
import axios from 'axios';
import { ref, onMounted } from 'vue';

const gestaoStore = useGestaoStore();
const route = useRoute();
const dadosFiltrados = ref([]);
const colunas = ['Tipo', 'Número', 'Estatuto', 'Turno atual', 'Alteração', 'Capacidade', 'Decisão']
const campos = ['tipo', 'numero', 'estatuto', 'turnoAtual', 'alteracao', 'capacidade', 'decisao']
let estudantes = [];

function getStudentNumber(studentId) {
  const student = estudantes.find(s => s.id == studentId);
  return student ? student.num : 'Desconhecido';
}

function getStudentStatus(studentId) {
  const student = estudantes.find(s => s.id == studentId);
  return student ? (student.specialStatus !== undefined ? (student.specialStatus ? 'Sim' : 'Não') : 'Não') : 'Desconhecido';
}

function notifyAllocationUpdated() {
  window.dispatchEvent(new Event('allocationsUpdated'));
}

onMounted(async () => {
  const [
    conflictsRes,
    shiftsRes,
    coursesRes,
    studentsRes,
    classroomsRes,
    classroomRequestsRes,
    shiftRequestsRes,
    teachersRes
  ] = await Promise.all([
    axios.get('http://localhost:3000/conflicts'),
    axios.get('http://localhost:3000/shifts'),
    axios.get('http://localhost:3000/courses'),
    axios.get('http://localhost:3000/students'),
    axios.get('http://localhost:3000/classrooms'),
    axios.get('http://localhost:3000/classroomRequests'),
    axios.get('http://localhost:3000/shiftRequests'),
    axios.get('http://localhost:3000/teachers')
  ]);

  const conflitos = conflictsRes.data;
  const shifts = shiftsRes.data;
  const courses = coursesRes.data;
  estudantes = studentsRes.data;
  const classrooms = classroomsRes.data;
  const shiftRequests = shiftRequestsRes.data;
  const classroomRequests = classroomRequestsRes.data;
  const teachers = teachersRes.data; 
  const nomeParam = route.params.nome?.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
  const uc = courses.find(c =>
    c.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") === nomeParam
  )

  const capacidadePorTurno = {};
  shifts.forEach(shift => {
    const sala = classrooms.find(c => c.id == shift.classroomId);
    if (sala) {
      capacidadePorTurno[Number(shift.id)] = `${shift.totalStudentsRegistered}/${sala.capacity}`;
    }
  });
  gestaoStore.setCapacidades(capacidadePorTurno);

  const todasTrocas = shiftRequests.map(req => {
    const shift = shifts.find(s => s.id == req.shiftId)
    const student = estudantes.find(s => s.id == req.studentId)
    const course = shift ? courses.find(c => c.id == shift.courseId) : null
    const altShift = shifts.find(s => s.id == req.alternativeShiftId);
    const shiftRequestId = req.id;
    const sala = shift ? classrooms.find(r => r.id == shift.classroomId) : null

    return shift && student && course ? {
      tipo: 'Troca de Turno',
      numero: student.num,
      estatuto: student.specialStatus ? 'Sim' : 'Não',
      turnoAtual: shift.name,
      alteracao: altShift.name,
      capacidade: `${shift.totalStudentsRegistered}/${sala?.capacity || '?'}`,
      decisao: 'Atualizar',
      ucId: course.id.toString(),
      studentId: student.id,
      turnoAtualId: shift.id,
      alternativeShiftId: altShift,
      shiftRequestId: shiftRequestId
    } : null
  }).filter(Boolean)

  const conflitosCompletos = [];

  for (const conflito of conflitos) {
    const studentId = conflito.studentId;
    const shiftIDs = conflito.shiftID;

    for (const shiftID of shiftIDs) {
      const shift = shifts.find(s => s.id == shiftID);
      if (shift) {
        const courseId = shift.courseId;
        const turno = shift.name;

        const turnosDisponiveis = shifts.filter(s => {
          const capacidadeTexto = gestaoStore.getCapacidadeById(s.id.toString());
          const [ocupadosStr, capacidadeStr] = capacidadeTexto?.split('/') || ['0', '0'];
          const ocupados = parseInt(ocupadosStr);
          const capacidade = parseInt(capacidadeStr);

          return (
            s.courseId == courseId &&
            s.type === shift.type &&
            s.id != shiftID &&
            !isNaN(ocupados) && !isNaN(capacidade) && ocupados < capacidade
          );
        }).map(s => ({ id: s.id, name: s.name }));

        conflitosCompletos.push({
          tipo: 'Conflito',
          numero: getStudentNumber(studentId),
          estatuto: getStudentStatus(studentId),
          turnoAtual: turno,
          alteracao: turnosDisponiveis,
          escolha: '',
          capacidade: '',
          decisao: 'Atualizar',
          ucId: courseId.toString(),
          studentId: studentId,
          turnoAtualId: shiftID, 
          conflitoId: conflito.id, 
          todosShifts: shiftIDs
        });
      }
    }
  }

  const pedidosSala = prepararTrocasDeSala({ classroomRequests, shifts, classrooms, teachers, courses });
  console.log (pedidosSala)

  dadosFiltrados.value = [...todasTrocas, ...conflitosCompletos, ...pedidosSala].filter(d => d.ucId === uc?.id?.toString());
  isLoading.value = false
})

async function acaoAtualizar(item) {
  await atualizarAlocacao(item, dadosFiltrados, notifyAllocationUpdated);
}

async function acaoAceitar(item) {
  try {
    await aceitarTrocaTurno(item, dadosFiltrados);
  } catch (error) {
    console.error('Erro ao aceitar pedido de troca:', error);
  }
}

async function acaoRejeitar(item) {
  try {
    await rejeitarTrocaTurno(item, dadosFiltrados);
  } catch (error) {
    console.error('Erro ao rejeitar pedido de troca:', error);
  }
}
</script>

<style scoped>
.gestao-container {
  padding: 2rem;
  position: relative;
  max-width: 100%;
  width: 100%;
  box-sizing: border-box;
}

.overlay {
  position: absolute;
  top: 250px;
  left: 50%;
  transform: translateX(-50%);
  background-color: #FDF7F7;
  border: 2px solid #b0a7a7;
  border-radius: 8px;
  padding: 30px 40px;
  font-size: 1.1rem;
  text-align: center;
  color: #444;
  box-shadow: 0 2px 12px rgba(0,0,0,0.1);
  z-index: 10;
}

.overlay-content {
  max-width: 700px;
}
</style>
