<template>
    <div class="pagina">
      <div class="legenda">
      <div class="legenda-item">
        <div class="cor-example capacidade-total"></div>
        <span>Capacidade Total</span>
      </div>
      <div class="legenda-item">
        <div class="cor-example capacidade-parcial"></div>
        <span>Capacidade Parcial</span>
      </div>
    </div> 
      <TabelaHorario :horario="horarioCurso" tipo="curso"/>
    </div>
  </template>
  
  <script setup>
import { ref, computed, onMounted } from 'vue'
import TabelaHorario from '@/components/TabelaHorario.vue'
  
const props = defineProps({
  studentId: {
    type: Number,
    required: true
  }
})

  const dias = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
  
  const horas = []
  for (let i = 9; i <= 18; i++) {
    horas.push((i < 10 ? "0" : "") + i + ":00")
  }
  
// variáveis para guardar os dados da API
const students = ref([]);
const courses = ref([]);
const shifts = ref([]);
const classrooms = ref([]);
const buildings = ref([]);

// Fetch dados
onMounted(async () => {
  const [resStudents, resCourses, resShifts, resClassrooms, resBuildings] = await Promise.all([
    fetch('http://localhost:3000/students'),
    fetch('http://localhost:3000/courses'),
    fetch('http://localhost:3000/shifts'),
    fetch('http://localhost:3000/classrooms'),
    fetch('http://localhost:3000/buildings')
  ]);

  students.value = await resStudents.json();
  courses.value = await resCourses.json();
  shifts.value = await resShifts.json();
  classrooms.value = await resClassrooms.json();
  buildings.value = await resBuildings.json(); 
});

// Primeiro, descobrir quais são as UCs onde o aluno está inscrito
const ucsAluno = computed(() => {
  const aluno = students.value.find(s => Number(s.id) === props.studentId);
  return aluno ? aluno.enrolled : [];
});

// Depois, buscar TODOS os turnos dessas UCs
const turnosCurso = computed(() => {
  return shifts.value.filter(s => ucsAluno.value.includes(s.courseId));
});

// Finalmente, montar o horário
const horarioCurso = computed(() => ({
  dias,
  horas,
  shifts: turnosCurso.value,
  courses: courses.value,
  classrooms: classrooms.value,
  buildings: buildings.value 
}));
</script>
  
  <style scoped>
  .pagina {
    width: 100%;
  }

  .legenda {
    display: flex;
    gap: 0.5rem;
    flex-direction: column; 
    position: fixed;
    top: 35px;  
    left: 1375px;
  }
  
  .legenda-item {
    display: flex;
    gap: 0.5rem;
  }

  .legenda-item span {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #3E3E3E
  }
  
  .cor-example {
    width: 20px;
    height: 20px;
    border-radius: 4px;
  }
  
  .capacidade-total {
    background-color: #fca5a5;
  }
  
  .capacidade-parcial {
    background-color: #fde68a;
  }
  </style>
  