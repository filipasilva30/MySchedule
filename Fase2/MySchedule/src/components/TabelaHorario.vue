<template>
  <div class="tabela-wrapper" v-if="horario && horario.dias && horario.horas">
    <table class="tabela-horario">
      <thead>
        <tr>
          <th class="divisao"></th>
          <th class="dias" v-for="dia in horario.dias" :key="dia">{{ dia }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(hora, horaIndex) in horario.horas" :key="hora">
          <td class="hora-coluna">{{ hora }}</td>
          <template v-for="(dia, diaIndex) in horario.dias">
            <td v-if="!isCelulaOcupada(horaIndex, diaIndex)" :key="`${hora}-${dia}`" :rowspan="getRowspan(horaIndex, diaIndex)">
              <div class="aulas-container">
                <div v-for="(aula, index) in getAulas(hora, dia)" :key="index" class="aula" :class="{
                    'aula-total': aula.capacidade === 'total',
                    'aula-parcial': aula.capacidade === 'parcial',
                    'aula-livre': !aula.capacidade || aula.capacidade === 'livre',
                    'aula-pessoal': props.tipo === 'pessoal'
                  }"
                  :title="`Capacidade: ${aula.inscritos}/${aula.capacidadeMax}`"
                  @click="handleTurnoClick(aula)"  
                >
                  {{ aula.disciplina }}<br />
                  {{ aula.tp }}<br />
                  Ed {{ aula.edificio }} - Sala {{ aula.sala }}
                </div>
              </div>
            </td>
          </template>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  horario: Object,
  tipo: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['turno-click']);

// Matriz de células ocupadas por rowspans
const celulaOcupada = computed(() => {
  const matriz = {};

  if (!props.horario || !props.horario.shifts) return matriz;

  props.horario.shifts.forEach(shift => {
    const horaInicio = shift.from;
    const duracao = shift.to - shift.from;
    const diaIndex = props.horario.dias.indexOf(shift.day);
    
    if (duracao > 1 && diaIndex >= 0) {
      for (let i = 0; i < props.horario.horas.length; i++) {
        const hora = parseInt(props.horario.horas[i].split(':')[0]);
        if (hora > horaInicio && hora < shift.to) {
          const key = `${i}-${diaIndex}`;
          matriz[key] = true;
        }
      }
    }
  });

  return matriz;
});

function isCelulaOcupada(horaIndex, diaIndex) {
  return celulaOcupada.value[`${horaIndex}-${diaIndex}`] === true;
}

function getAulas(hora, dia) {
  if (!props.horario || !props.horario.shifts) return [];
  
  const horaNum = parseInt(hora.split(':')[0]);
  
  return props.horario.shifts.filter(shift => shift.from === horaNum && shift.day === dia).map(shift => {
      // Encontrar informações relacionadas
      const course = props.horario.courses.find(c => Number(c.id) === shift.courseId) || {};
      const classroom = props.horario.classrooms.find(c => Number(c.id) === shift.classroomId) || {};
      const building = props.horario.buildings.find(b => Number(b.id) == classroom.buildingId) || {};
      
      // Determinar capacidade com base em totalStudentsRegistered
      let capacidade = 'livre';
      if (shift.totalStudentsRegistered > 25) {
        capacidade = shift.totalStudentsRegistered >= classroom.capacity ? 'total' : 'parcial';
      }
      
      return {
        disciplina: course.name || 'Unknown',
        tp: `${shift.name}`,
        sala: classroom.name || 'Unknown',
        edificio: building.id || '',
        capacidade,
        duracao: shift.to - shift.from,
        inscritos: shift.totalStudentsRegistered || 0,
        capacidadeMax: classroom.capacity || 0
      };
    });
}

function getRowspan(horaIndex, diaIndex) {
  const hora = props.horario.horas[horaIndex];
  const dia = props.horario.dias[diaIndex];
  
  const aulas = getAulas(hora, dia);
  if (aulas.length === 0) return 1;
  
  // Calcula o rowspan para a célula atual
  const duracaoMaxima = Math.max(...aulas.map(aula => aula.duracao || 1));
  
  // Verifica se há horas suficientes na tabela para o rowspan
  const horasRestantes = props.horario.horas.length - horaIndex;
  return Math.min(duracaoMaxima, horasRestantes);
}

// Função para lidar com o clique em um turno
const handleTurnoClick = (aula) => {
  emit('turno-click', aula.disciplina);
};

</script>

<style scoped>
.tabela-wrapper {
  width: 100%;
  max-width: 100%;
  margin: 0 auto;
  margin-bottom: 30px;
}

.tabela-horario {
  table-layout: fixed;
  border-collapse: collapse;
  width: 100%;
  text-align: center;
  font-size: 0.875rem;
  color: #000000;
}

th,
td {
  width: 120px;
  height: 60px;
  border: 1px solid #727272;
  white-space: nowrap;
  overflow: hidden;
  padding: 6px;
  vertical-align: top;
}

.divisao{
  background-color: white;
  border : 0px;
}

.dias{
  font-weight: bold;
  background-color: #B9B9B9;
}

.hora-coluna {
  font-weight: bold;
  background-color: #B9B9B9;
  width: 80px;
}

.aulas-container {
  display: flex;
  gap: 5px;
  height: 100%;
  width: 100%;
}

.aula {
  flex: 1;
  padding: 6px;
  border-radius: 6px;
  font-size: 0.75rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-width: 0;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid #3E390A;
}

.aula-total {
  background-color: #fca5a5;
}

.aula-parcial {
  background-color: #fde68a;
}

.aula-livre {
  background-color: #EBE7E1;
}

.aula-pessoal {
  background-color: #DFB698;
  border: 2px solid #3E390A;
}
</style>