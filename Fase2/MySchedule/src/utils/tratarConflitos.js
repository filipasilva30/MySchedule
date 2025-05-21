import { reactive } from 'vue';
import { getTurnosDisponiveis } from '@/utils/getTurnosDisponiveis';

export async function tratarConflitos({ conflitos, shifts, courses, estudantes, gestaoStore }) {
  const conflitosCompletos = [];

  function getStudentNumber(studentId) {
    const student = estudantes.find(s => s.id == studentId);
    return student ? student.num : 'Desconhecido';
  }

  function getStudentStatus(studentId) {
    const student = estudantes.find(s => s.id == studentId);
    return student ? (student.specialStatus ? 'Sim' : 'Não') : 'Desconhecido';
  }

  for (const conflito of conflitos) {
    const studentId = conflito.studentId;
    const shiftIDs = conflito.shiftID;
    const conflitoId = conflito.id;

    for (const shiftID of shiftIDs) {
      const shift = shifts.find(s => s.id == shiftID);
      if (shift) {
        const courseId = shift.courseId;
        const turno = shift.name;
        const uc = courses.find(c => c.id == courseId)?.name || 'Desconhecido';

        const turnosDisponiveis = await getTurnosDisponiveis(studentId, courseId, shift.type, shiftID);

        const turnos = turnosDisponiveis.filter(s => {
          const capacidadeTexto = gestaoStore.getCapacidadeById(s.id);
          const [ocupadosStr, capacidadeStr] = capacidadeTexto?.split('/') || [];
          const ocupados = parseInt(ocupadosStr);
          const capacidade = parseInt(capacidadeStr);
          return (
            s.courseId == courseId &&
            s.type === shift.type &&
            s.id != shiftID &&
            !isNaN(ocupados) && !isNaN(capacidade) && ocupados < capacidade
          );
        }).map(s => ({ id: s.id, name: s.name }));

        conflitosCompletos.push(reactive({
          tipo: 'Conflito',
          numero: getStudentNumber(studentId),
          estatuto: getStudentStatus(studentId),
          uc: uc,
          turnoAtual: turno,
          alteracao: turnos,
          escolha: '',
          decisao: 'Atualizar',
          studentId: studentId,
          turnoAtualId: shiftID,
          conflitoId: conflitoId,
          todosShifts: shiftIDs
        }));
      }
    }
  }

  return conflitosCompletos;
}
