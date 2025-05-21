<template>
  <div v-if="uc" class="uc-container">
    <div class="uc-header">
      <h1>[24/25] {{ uc.name }}</h1>
      <span>Docente: {{ teacherName }}</span>
    </div>

    <TabelaTurnosAl v-if="tipoUtilizador === 'student'" :shifts="ucShifts" :ucId="uc.id" />
    <TabelaTurnosDC v-else :shifts="ucShifts" />


    <div class="uc-footer" v-if="tipoUtilizador === 'director'">
      <button class="gestao-btn" @click="irParaGestaoUC">Gestão da UC</button>
    </div>
  </div>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router'
import { onMounted, ref, computed } from 'vue'
import TabelaTurnosAl from '@/components/TabelaTurnosAl.vue'
import TabelaTurnosDC from '@/components/TabelaTurnosDC.vue'
import axios from 'axios'

const route = useRoute()
const router = useRouter()

const uc = ref(null)
const ucShifts = ref([])
const teacherName = ref('Desconhecido')
const tipoUtilizador = route.params.userType

onMounted(async () => {
  const [teachersRes, shiftsRes, coursesRes] = await Promise.all([
    axios.get('http://localhost:3000/teachers'),
    axios.get('http://localhost:3000/shifts'),
    axios.get('http://localhost:3000/courses')
  ])

  const shifts = shiftsRes.data
  const courses = coursesRes.data
  const teachers = teachersRes.data

  const nomeUc = route.params.nome
  uc.value = courses.find(c => c.name === nomeUc)

  if (uc.value) {
    ucShifts.value = shifts.filter(s => s.courseId.toString() === uc.value.id.toString())
    const theoreticalShift = ucShifts.value.find(s => s.type === 'T')
    const teacher = theoreticalShift
      ? teachers.find(t => Number(t.id) === theoreticalShift.teacherId)
      : null
    teacherName.value = teacher ? teacher.name : 'Desconhecido'
  }
})

function irParaGestaoUC() {
  if (uc.value) {
    router.push(`/gestao-uc/${uc.value.name}`)
  }
}
</script>

<style scoped>
.uc-container {
  max-width: 1200px;
  margin: auto;
  background: #fdf9f9;
  padding: 30px;
  border-radius: 8px;
  position: relative;
  min-height: 90vh;
}

.uc-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.uc-header h1 {
  font-size: 26px;
  font-weight: 700;
  color: #1f2937;
}

.uc-header span {
  font-size: 16px;
  color: #444;
  text-decoration: underline;
}

.uc-footer {
  position: absolute;
  bottom: 30px;
  right: 30px;
}

.gestao-btn {
  background-color: #ffffff;
  border: 1px solid #d1d1d1;
  padding: 10px 30px;
  font-size: 15px;
  font-weight: 500;
  color: #444;
  border-radius: 3px;
  cursor: pointer;
  transition: background-color 0.3s, color 0.3s;
}

.gestao-btn:hover {
  background-color: #db8686;
  color: #fff;
}
</style>
