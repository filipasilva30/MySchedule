import { reactive } from 'vue';

export function prepararShiftRequests({ shiftRequests, shifts, courses, estudantes }) {
  const pedidos = [];

  for (const pedido of shiftRequests) {
    const studentId = pedido.studentId;
    const turnoAtual = shifts.find(s => s.id == pedido.shiftId);
    const turnoAlternativo = shifts.find(s => s.id == pedido.alternativeShiftId);
    const student = estudantes.find(e => e.id == studentId);

    if (!turnoAtual || !turnoAlternativo || !student) continue;

    const curso = courses.find(c => c.id == turnoAtual.courseId);

    pedidos.push(reactive({
      tipo: 'Troca de Turno',
      numero: student.num,
      estatuto: student.specialStatus ? 'Sim' : 'Não',
      uc: curso?.name || 'Desconhecido',
      turnoAtual: turnoAtual.name,
      alteracao: turnoAlternativo.name,
      escolha: pedido.alternativeShiftId, // usado para compatibilidade com acaoAtualizar
      decisao: 'Atualizar',
      studentId: studentId,
      turnoAtualId: pedido.shiftId,
      alternativeShiftId: pedido.alternativeShiftId,
      shiftRequestId: pedido.id
    }));
  }

  return pedidos;
}
