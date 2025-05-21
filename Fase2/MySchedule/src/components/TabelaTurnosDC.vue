<template>
  <div class="uc-table-container">
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
        </tr>
      </thead>
      <tbody>
        <tr v-for="shift in shifts" :key="shift.id">
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
        </tr>
      </tbody>
    </table>
  </div>
</template>
  
<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { defineProps } from 'vue'

const props = defineProps({
  shifts: Array
})

const classrooms = ref([])
const buildings = ref([])

onMounted(async () => {
  try {
    const [classroomsRes, buildingsRes] = await Promise.all([
      axios.get("http://localhost:3000/classrooms"),
      axios.get("http://localhost:3000/buildings")
    ])
    classrooms.value = classroomsRes.data
    buildings.value = buildingsRes.data
  } catch (error) {
    console.error("Erro ao carregar dados de salas e edifícios:", error)
  }
})

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
</script>

<style scoped>
.uc-table-container {
  overflow-x: auto;
  padding: 1rem;
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
</style>