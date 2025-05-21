<template>
  <div class="uc-table-wrapper">
    <!-- POP-UP de sucesso -->
    <div v-if="showSuccessPopup" class="popup-success">
      <p>O pedido de troca de turno foi efetuado com sucesso.</p>
      <button class="popup-ok-btn" @click="fecharPopup">OK</button>
    </div>

    <!-- POP-UP de aviso -->
    <div v-if="showWarningPopup" class="popup-warning">
      <p>{{ warningMessage }}</p>
      <button class="popup-ok-btn" @click="fecharWarningPopup">OK</button>
    </div>

    <table class="uc-table">
      <thead>
        <tr>
          <th>Turno</th>
          <th>Sala</th>
          <th>Capacidade</th>
          <th>Taxa ocupação</th>
          <th>Nº alunos</th>
          <th>Hora</th>
          <th>Dia</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="shift in shifts"
          :key="shift.id"
          :class="{ highlight: alunoInscrito(shift.id.toString()) }"
        >
          <td>{{ shift.name }}</td>
          <td>{{ getClassroomName(shift.classroomId) }}</td>
          <td>{{ getClassroomCapacity(shift.classroomId) }}</td>
          <td>
            <span :class="getOccupancyClass(shift)">
              {{ calculateOccupancyRate(shift) }}%
            </span>
          </td>
          <td>{{ shift.totalStudentsRegistered }}</td>
          <td>{{ formatTime(shift.from) }} - {{ formatTime(shift.to) }}</td>
          <td>{{ translateDay(shift.day) }}</td>
          <td>
            <button
              v-if="!alunoInscrito(shift.id.toString())"
              class="swap-btn"
              @click="pedirTroca(shift.id, ucId)"
            >
              ⇄
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const alunoId = Number(sessionStorage.getItem("userId"))
console.log("ID do aluno em sessão:", alunoId)

defineProps({
  ucId: Number,
  shifts: Array
})

const alunoShifts = ref([])
const classrooms = ref([])
const buildings = ref([])
const allShifts = ref([])
const conflicts = ref([])

const showSuccessPopup = ref(false)
const showWarningPopup = ref(false)
const warningMessage = ref("")

onMounted(async () => {
  try {
    const [allocationsRes, classroomsRes, buildingsRes, shiftsRes, conflictsRes] = await Promise.all([
      axios.get("http://localhost:3000/allocations"),
      axios.get("http://localhost:3000/classrooms"),
      axios.get("http://localhost:3000/buildings"),
      axios.get("http://localhost:3000/shifts"),
      axios.get("http://localhost:3000/conflicts")
    ])

    alunoShifts.value = allocationsRes.data
      .filter(a => a.studentId.toString() === alunoId.toString())
      .map(a => a.shiftId.toString())

    classrooms.value = classroomsRes.data
    buildings.value = buildingsRes.data
    allShifts.value = shiftsRes.data
    conflicts.value = conflictsRes.data
  } catch (error) {
    console.error("Erro ao carregar dados:", error)
  }
})

function alunoInscrito(shiftId) {
  return alunoShifts.value.includes(shiftId.toString())
}

function getClassroomName(classroomId) {
  const room = classrooms.value.find(r => r.id.toString() === classroomId.toString())
  const building = room ? buildings.value.find(b => b.id.toString() === room.buildingId.toString()) : null
  return room && building ? `${building.abbreviation} - ${room.name}` : 'Desconhecida'
}

function getClassroomCapacity(classroomId) {
  const room = classrooms.value.find(r => r.id.toString() === classroomId.toString())
  return room ? room.capacity : 0
}

function calculateOccupancyRate(shift) {
  const room = classrooms.value.find(r => r.id.toString() === shift.classroomId.toString())
  if (!room || room.capacity === 0) return 0
  return Math.round((shift.totalStudentsRegistered / room.capacity) * 100)
}

function getOccupancyClass(shift) {
  const rate = calculateOccupancyRate(shift)
  if (rate >= 80) return 'high-occupancy'
  if (rate >= 50) return 'medium-occupancy'
  return 'low-occupancy'
}

function formatTime(hour) {
  return `${hour.toString().padStart(2, '0')}:00`
}

function translateDay(day) {
  const dias = {
    Monday: 'segunda-feira',
    Tuesday: 'terça-feira',
    Wednesday: 'quarta-feira',
    Thursday: 'quinta-feira',
    Friday: 'sexta-feira'
  }
  return dias[day] || day
}

async function pedirTroca(novoTurnoId, ucId) {
  const novoTurno = allShifts.value.find(s => s.id.toString() === novoTurnoId.toString())
  if (!novoTurno) {
    alert("O turno de destino não foi encontrado.")
    return
  }

  const tipoNovoTurno = novoTurno.type

  const turnoAtual = alunoShifts.value.find(id => {
    const turno = allShifts.value.find(s => s.id.toString() === id.toString())
    console.log("Verificando turno do aluno:", turno)
    return (
      turno &&
      turno.courseId.toString() === ucId.toString() &&
      turno.type?.toUpperCase() === tipoNovoTurno.toUpperCase() &&
      (tipoNovoTurno.toUpperCase() === "TP" || tipoNovoTurno.toUpperCase() === "PL")

    )
  })
  console.log("Turno atual compatível encontrado:", turnoAtual)

  if (!turnoAtual) {
    alert("Não foi encontrado um turno prático atual compatível para esta troca.")
    return
  }

  try {
    const pedidosExistentes = await axios.get("http://localhost:3000/shiftRequests")
    const pedidoDuplicado = pedidosExistentes.data.some(pedido => {
      if (pedido.studentId !== alunoId) return false

      const turnoOrigem = allShifts.value.find(s => s.id.toString() === pedido.shiftId.toString())
      const turnoDestino = allShifts.value.find(s => s.id.toString() === pedido.alternativeShiftId.toString())

      return (
        (turnoOrigem && turnoOrigem.courseId.toString() === ucId.toString()) ||
        (turnoDestino && turnoDestino.courseId.toString() === ucId.toString())
      )
    })

    if (pedidoDuplicado) {
      warningMessage.value = "Já existe um pedido de troca pendente nesta unidade curricular. Aguarde a resolução antes de fazer outro."
      showWarningPopup.value = true
      return
    }
  } catch (e) {
    console.error("Erro ao verificar pedidos existentes:", e)
    alert("Erro ao verificar pedidos existentes.")
    return
  }

  const conflitoDoAluno = conflicts.value.find(c => c.studentId.toString() === alunoId.toString())
  console.log(" Conflitos do aluno:", conflitoDoAluno)
  console.log(" ShiftIDs com conflito:", conflitoDoAluno?.shiftID)
  const haConflitoNaUC = conflitoDoAluno?.shiftID.some(conflictingShiftId => {
    const shift = allShifts.value.find(s => s.id.toString() === conflictingShiftId.toString())
    console.log("Verificando conflito com shift:", shift)
    return shift && shift.courseId.toString() === ucId.toString()
  })

  if (haConflitoNaUC) {
    warningMessage.value = "Não é possível fazer o pedido porque existem conflitos com turnos desta unidade curricular."
    showWarningPopup.value = true
    return
  }

  // Criar pedido
  const novoPedido = {
    shiftId: turnoAtual,
    studentId: alunoId,
    alternativeShiftId: novoTurnoId
  }

  try {
    await axios.post("http://localhost:3000/shiftRequests", novoPedido)
    showSuccessPopup.value = true
    console.log("Pedido de troca registado com sucesso!")
  } catch (e) {
    console.error("Erro ao criar pedido:", e)
    alert("Erro ao registar o pedido.")
  }
}

function fecharPopup() {
  showSuccessPopup.value = false
}

function fecharWarningPopup() {
  showWarningPopup.value = false
}
</script>

<style scoped>
.popup-success {
  position: fixed;
  top: 20px;
  right: 20px;
  background-color: #10b981;
  color: white;
  padding: 14px 20px;
  border-radius: 6px;
  font-weight: bold;
  box-shadow: 0 2px 10px rgba(0,0,0,0.15);
  z-index: 999;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.popup-warning {
  position: fixed;
  top: 60px;
  right: 20px;
  background-color: #c77f4c;
  color: white;
  padding: 14px 20px;
  border-radius: 6px;
  font-weight: bold;
  box-shadow: 0 2px 10px rgba(0,0,0,0.15);
  z-index: 999;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.popup-ok-btn {
  background-color: rgb(201, 191, 180);
  color: #333;
  border: 2px solid #645e5e;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.2s ease;
}

.popup-ok-btn:hover {
  background-color: #333;
  color: white;
}

.uc-table-wrapper {
  position: relative;
  padding: 2rem;
  background-color: #fdf7f7; 
  border-radius: 8px;
  overflow-x: auto;
  min-height: 100%; 
}

.uc-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 6px 8px;
}

.uc-table th,
.uc-table td {
  padding: 12px 16px;
  text-align: center;
  border: 1px solid #e0e0e0;
  background-color: white;
}

.uc-table th {
  background-color: #867D7D;
  color: rgb(10, 10, 10);
  text-align: center;
  font-weight: bold;
}

.highlight td {
  background-color: #F7E58F;
  font-weight: bold;
}

.high-occupancy {
  color: #dc2626;
  font-weight: bold;
}

.medium-occupancy {
  color: #f59e0b;
  font-weight: bold;
}

.low-occupancy {
  color: #10b981;
  font-weight: bold;
}

.swap-btn {
  background-color: #cda2a2;
  color: #fff;
  border: none;
  padding: 13px 10px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;               
  width: 80%;
  border-radius: 3px;
  font-weight: bold;
}

.swap-btn:hover {
  background-color: #ba7070;
}
</style>