<template>
  <div class="pagina">
    <TabelaHorario :horario="horarioPessoal" tipo="pessoal"/>
  </div>
</template> 
  
  <script setup>
import { ref, computed, onMounted } from 'vue';
import TabelaHorario from './TabelaHorario.vue'
import { useSessionStorage } from '@/stores/session';
  
const props = defineProps({
  studentId: {
    type: Number,
    required: true
  }
});

const dias = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
  
const horas = []
for (let i = 9; i <= 18; i++) {
  horas.push((i < 10 ? "0" : "") + i + ":00")
}

const session = useSessionStorage();

const courses = ref([]);
const shifts = ref([]);
const classrooms = ref([]);
const allocations = ref([]);
const buildings = ref([]);

// Fetch dados
onMounted(async () => {
  const [resCourses, resShifts, resClassrooms, resAllocations, resBuildings] = await Promise.all([
    fetch('http://localhost:3000/courses'),
    fetch('http://localhost:3000/shifts'),
    fetch('http://localhost:3000/classrooms'),
    fetch('http://localhost:3000/allocations'),
    fetch('http://localhost:3000/buildings')
  ]);

  courses.value = await resCourses.json();
  shifts.value = await resShifts.json();
  classrooms.value = await resClassrooms.json();
  allocations.value = await resAllocations.json();
  buildings.value = await resBuildings.json(); 
});

// Processar horário pessoal
const horarioPessoal = computed(() => {
  if (!props.studentId) return null;

  const studentAllocations = allocations.value.filter(a => a.studentId === props.studentId);
  const shiftIds = studentAllocations.map(a => a.shiftId);
  const studentShifts = shifts.value.filter(s => shiftIds.includes(Number(s.id)));

  return {
    dias,
    horas,
    shifts: studentShifts,
    courses: courses.value,
    classrooms: classrooms.value,
    buildings: buildings.value 
  };
});
</script> 
  
<style scoped>
  .pagina {
    width: 100%;
  }
</style>  