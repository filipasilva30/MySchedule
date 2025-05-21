import axios from 'axios';

export async function aceitarTrocaTurno(item, dadosRef) {
  const { studentId, turnoAtualId, alternativeShiftId, shiftRequestId } = item;
  const novoShiftId = typeof alternativeShiftId === 'object'
    ? Number(alternativeShiftId.id)
    : Number(alternativeShiftId);

  const resAlocacoes = await axios.get('http://localhost:3000/allocations');
  const alocacoes = resAlocacoes.data;

  const alocacao = alocacoes.find(
    a => a.studentId == studentId && a.shiftId == Number(turnoAtualId)
  );

  if (alocacao) {
    await axios.patch(`http://localhost:3000/allocations/${Number(alocacao.id)}`, {
      shiftId: novoShiftId
    });
  }
  await axios.delete(`http://localhost:3000/shiftRequests/${shiftRequestId}`);
  dadosRef.value = dadosRef.value.filter(d => d !== item);
}

export async function rejeitarTrocaTurno(item, dadosRef) {
  const { shiftRequestId } = item;

  await axios.delete(`http://localhost:3000/shiftRequests/${shiftRequestId}`);
  dadosRef.value = dadosRef.value.filter(d => d !== item);
}

export async function atualizarAlocacao(item, dadosRef, notifyFn) {
  const {
    tipo,
    studentId,
    turnoAtualId,
    classroomRequestId,
    shiftId,
    novaSalaId,
    escolha
  } = item;

  try {
    if (tipo === 'Troca de Sala') {
      await axios.delete(`http://localhost:3000/classroomRequests/${Number(classroomRequestId)}`);
      await axios.patch(`http://localhost:3000/shifts/${Number(shiftId)}`, {
        classroomId: Number(novaSalaId)
      });
      dadosRef.value = dadosRef.value.filter(d => d !== item);
      return;
    }

    if (!escolha) {
      alert('Por favor, selecione um turno para alteração.');
      return;
    }

    const novoShiftId = Number(escolha);

    const resAlocacoes = await axios.get('http://localhost:3000/allocations');
    const alocacoes = resAlocacoes.data;

    const alocacao = alocacoes.find(a =>
      a.studentId == studentId && a.shiftId == turnoAtualId
    );

    if (!alocacao) {
      console.error('Alocação não encontrada');
      return;
    }

    await axios.patch(`http://localhost:3000/allocations/${Number (alocacao.id)}`, {
      shiftId: novoShiftId
    });

    const turnoAtual = (await axios.get(`http://localhost:3000/shifts/${turnoAtualId}`)).data;
    const novoTurno = (await axios.get(`http://localhost:3000/shifts/${novoShiftId}`)).data;

    if (turnoAtual.totalStudentsRegistered > 0) {
      await axios.patch(`http://localhost:3000/shifts/${turnoAtualId}`, {
        totalStudentsRegistered: turnoAtual.totalStudentsRegistered - 1
      });
    }

    await axios.patch(`http://localhost:3000/shifts/${novoShiftId}`, {
      totalStudentsRegistered: (novoTurno.totalStudentsRegistered || 0) + 1
    });

    if (notifyFn) notifyFn();

    const conflitos = (await axios.get('http://localhost:3000/conflicts')).data;
    const conflito = conflitos.find(c =>
      c.studentId == studentId &&
      Array.isArray(c.shiftID) &&
      c.shiftID.includes(Number(turnoAtualId))
    );

    if (conflito) {
      const indexTurnoAtual = conflito.shiftID.indexOf(Number(turnoAtualId));
      
      if (indexTurnoAtual !== -1) {
        const indexTurnoPar = indexTurnoAtual % 2 === 0 
          ? indexTurnoAtual + 1  
          : indexTurnoAtual - 1; 

        const turnoPar = indexTurnoPar >= 0 && indexTurnoPar < conflito.shiftID.length 
          ? conflito.shiftID[indexTurnoPar] 
          : null;

        if (conflito.shiftID.length === 2) {
          await axios.delete(`http://localhost:3000/conflicts/${conflito.id}`);
          dadosRef.value = dadosRef.value.filter(d => d !== item);
        } else {
          let novosShifts = [...conflito.shiftID];

          if (indexTurnoAtual % 2 === 0 && indexTurnoPar < novosShifts.length) {
            novosShifts.splice(indexTurnoPar, 1);
            novosShifts.splice(indexTurnoAtual, 1); 
          } else {
            novosShifts.splice(indexTurnoAtual, 1); 
            novosShifts.splice(indexTurnoPar, 1); 
          }

          await axios.patch(`http://localhost:3000/conflicts/${conflito.id}`, {
            shiftID: novosShifts
          });

          dadosRef.value = dadosRef.value.filter(d => {
            if (d === item) return false;

            if (turnoPar && d.studentId == studentId && Number(d.turnoAtualId) === turnoPar) {
              return false;
            }
            
            return true;
          });
        }
      } else {
        dadosRef.value = dadosRef.value.filter(d => d !== item);
      }
    } else {
      dadosRef.value = dadosRef.value.filter(d => d !== item);
    }

  } catch (error) {
    console.error('Erro ao atualizar alocação:', error);
    alert(`Erro: ${error.message}`);
  }
}