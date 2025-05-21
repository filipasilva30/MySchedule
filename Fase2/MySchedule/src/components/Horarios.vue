<template>
  <div class="pagina-horarios">
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
    <HorarioAno v-for="(horario, index) in processedHorarios" :key="index" :titulo="horario.titulo" :horario="horario" @navigate-to-course="handleNavigateToCourse"/>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import HorarioAno from './HorarioAno.vue';
import { useRouter } from 'vue-router';
const router = useRouter();

const emit = defineEmits(['navigate-to-course']);

// Dias da semana para a tabela
const dias = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

// Horas para a tabela
const horas = [];
for (let i = 9; i <= 18; i++) {
  horas.push(i === 9 ? `0${i}:00` : `${i}:00`);
}

// Dados carregados do json-server
const courses = ref([]);
const shifts = ref([]);
const classrooms = ref([]);
const buildings = ref([]);

// Carregar os dados ao montar o componente
onMounted(async () => {
  const [resCourses, resShifts, resClassrooms, resBuildings] = await Promise.all([
    fetch('http://localhost:3000/courses'),
    fetch('http://localhost:3000/shifts'),
    fetch('http://localhost:3000/classrooms'),
    fetch('http://localhost:3000/buildings')
  ]);

  courses.value = await resCourses.json();
  shifts.value = await resShifts.json();
  classrooms.value = await resClassrooms.json();
  buildings.value = await resBuildings.json(); 
});

// Processar horários agrupados por ano/semestre
const processedHorarios = computed(() => {
  const result = [];

  const coursesByYear = {};
  courses.value.forEach(course => {
    const key = `${course.year}-${course.semester}`;
    if (!coursesByYear[key]) {
      coursesByYear[key] = [];
    }
    coursesByYear[key].push(course);
  });

  Object.keys(coursesByYear).forEach(yearSem => {
    const [year, semester] = yearSem.split('-');

    const courseIds = coursesByYear[yearSem].map(c => Number(c.id));
    const yearShifts = shifts.value.filter(s => courseIds.includes(s.courseId));

    result.push({
      titulo: `${year}º Ano - ${semester}º Semestre`,
      dias,
      horas,
      shifts: yearShifts,
      courses: courses.value,
      classrooms: classrooms.value,
      buildings: buildings.value 
    });
  });

  return result;
});

const handleNavigateToCourse = (courseName) => {
  router.push(`/unidades/director/${courseName}`);
};
</script>

  
  <style scoped>
  .pagina-horarios {
  max-width: 80%;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
}

  .legenda {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 0.5rem;
  }
  
  .legenda-item {
    display: flex;
    gap: 0.5rem;
    min-width: 180px;
  }

  .legenda-item span {
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

  @media (max-width: 768px) {
  .pagina-horarios {
    padding: 0.5rem;
  }

  .legenda {
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
    gap: 1rem;
  }

  .legenda-item {
    min-width: auto;
    font-size: 0.85rem;
  }
}
  </style>