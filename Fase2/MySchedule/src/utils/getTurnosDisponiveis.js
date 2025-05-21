import axios from 'axios';

export async function getTurnosDisponiveis(studentId, cursoId, tipoTurno, turnoAtualId) {
  try {
    const [shiftsRes, allocationsRes] = await Promise.all([
      axios.get('http://localhost:3000/shifts'),
      axios.get('http://localhost:3000/allocations')
    ]);

    const allShifts = shiftsRes.data;
    const allAllocations = allocationsRes.data;

    const alocacoesDoAluno = allAllocations
      .filter(a => a.studentId == studentId)
      .map(a => allShifts.find(s => s.id == a.shiftId))
      .filter(Boolean);

    return allShifts.filter(shift => {
      if (
        shift.courseId != cursoId ||
        shift.type !== tipoTurno ||
        shift.id == turnoAtualId
      ) return false;

      const conflitoHorario = alocacoesDoAluno.some(alocado =>
        alocado.day === shift.day &&
        (
          (shift.from < alocado.to && shift.from >= alocado.from) ||
          (shift.to > alocado.from && shift.to <= alocado.to) ||
          (shift.from <= alocado.from && shift.to >= alocado.to)
        )
      );

      return !conflitoHorario;
    });
  } catch (error) {
    console.error('Erro ao calcular turnos disponíveis:', error);
    return [];
  }
}
