<template>
    <transition name="fade">
    <div v-if="modelValue" class="overlay" @click="handleBackgroundClick">
    <div class="overlay-content">
        <!-- Botão Enviar -->
        <div class="send-button-container">
        <Botao @click="emitSend">
            <div class="content-button">
            <SendHorizontal class="icon" />
            <span class="text-button">Enviar</span>
            </div>
        </Botao>
        </div>
    
        <!-- Retângulo cinza -->
        <div class="caixa-cinza">
        <div class="campos-superiores">
            <!-- Campo Para -->
            <div class="campo">
            <div class="label-caixa">Para</div>
            <input v-model="para" type="text" class="linha-input" />
            </div>
    
            <!-- Campo Assunto com dropdowns em cascata na mesma linha -->
            <div class="campo campo-inline">
            <div class="label-caixa">Assunto</div>
    
            <div class="select-wrapper">
                <select v-model="tipoAssunto" class="custom-select">
                <option disabled value="">Seleciona</option>
                <option value="Troca de Turno">Troca de Turno</option>
                <option value="Outro">Outro</option>
                </select>
                <ChevronDown class="select-icon" />
            </div>
    
            <!-- Campo UC - aparece quando Troca de Turno é selecionado -->
            <div v-if="tipoAssunto === 'Troca de Turno'" class="select-wrapper ml-4">
                <select v-model="ucSelecionada" class="custom-select select-smaller">
                <option disabled value="">Selecione a UC</option>
                <option v-for="uc in listaUCs" :key="uc" :value="uc">{{ uc }}</option>
                </select>
                <ChevronDown class="select-icon" />
            </div>
    
            <!-- Campo Turno - aparece quando UC é selecionada -->
            <div v-if="tipoAssunto === 'Troca de Turno' && ucSelecionada" class="turno-container ml-4">
                <span class="turno-label">Turno desejado:</span>
                <div class="select-wrapper ml-2">
                <select v-model="turnoDesejado" class="custom-select select-smaller select-turno">
                    <option disabled value="">Selecione</option>
                    <option v-for="turno in turnosDisponiveis" :key="turno.id" :value="turno.name">
                        {{ turno.name }} ({{ turno.day }}, {{ turno.from }}h-{{ turno.to }}h)
                    </option>
                </select>
                <ChevronDown class="select-icon" />
                </div>
            </div>
    
            <!-- Campo Assunto Personalizado - aparece quando Outro é selecionado -->
            <input
                v-if="tipoAssunto === 'Outro'"
                v-model="assuntoPersonalizado"
                type="text"
                class="linha-input ml-4"
                placeholder="Escreva o assunto"
            />
            </div>
        </div>
    
        <textarea
            v-model="mensagem"
            placeholder="Escreva a sua mensagem"
            class="textarea-mensagem"
        ></textarea>
        </div>
    
        <slot />
    </div>
    </div>
    </transition>
    </template>
    
    <script setup>
    import { ref, watch, onMounted, computed } from 'vue';
    import axios from 'axios';
    import { defineProps, defineEmits } from 'vue';
    import { SendHorizontal, ChevronDown } from 'lucide-vue-next';
    import { useSessionStorage } from '@/stores/session';
    import Botao from '@/components/Botao.vue';
    import { getTurnosDisponiveis } from '@/utils/getTurnosDisponiveis';
    
    const session = useSessionStorage();
    
    const listaUCs = ref([]);
    const mapeamentoCursos = ref({}); // Mapeia nome do curso para seu ID
    const ucSelecionada = ref('');
    const turnoDesejado = ref('');
    const turnosDisponiveis = ref([]);
    
    const props = defineProps({
      modelValue: Boolean,
      paraInicial: String,
    });
    
    const emit = defineEmits(['update:modelValue', 'send', 'notificar']);
    
    const para = ref(props.paraInicial || '');
    const tipoAssunto = ref('Troca de Turno');
    const assuntoPersonalizado = ref('');
    const mensagem = ref('');
    
    watch(() => props.paraInicial, (novoValor) => {
      para.value = novoValor || '';
    });
    
    // Observar mudanças na UC selecionada para atualizar turnos disponíveis
    watch(() => ucSelecionada.value, async (novaUC) => {
      if (!novaUC) {
        turnosDisponiveis.value = [];
        turnoDesejado.value = '';
        return;
      }
      
      try {
        const cursoId = mapeamentoCursos.value[novaUC];
        if (!cursoId) {
          console.error('ID do curso não encontrado para:', novaUC);
          return;
        }
        
        // Buscar turnos do aluno atualmente nessa UC para não mostrar o turno atual
        const alocacoesRes = await axios.get(`http://localhost:3000/allocations`);
        const alocacoesDoAluno = alocacoesRes.data.filter(a => 
          a.studentId == session.id
        );
        
        // Buscar todos os shifts para encontrar o turno atual
        const shiftsRes = await axios.get(`http://localhost:3000/shifts`);
        const allShifts = shiftsRes.data;
        
        // Encontrar o turno atual do aluno nessa UC específica
        let turnoAtualId = null;
        for (const alocacao of alocacoesDoAluno) {
          const shift = allShifts.find(s => s.id == alocacao.shiftId);
          if (shift && shift.courseId == cursoId) {
            turnoAtualId = shift.id;
            break;
          }
        }
        
        // Buscar todos os turnos disponíveis usando a função de utilidade
        // Esta função já filtra por cursoId AND conflitos de horário
        const turnos = await getTurnosDisponiveis(session.id, cursoId, 'T', turnoAtualId);
        turnosDisponiveis.value = turnos;
        
        // Adicionar opções de turnos práticos (PL) se necessário
        const turnosPL = await getTurnosDisponiveis(session.id, cursoId, 'PL', null);
        if (turnosPL.length > 0) {
          turnosDisponiveis.value = [...turnosDisponiveis.value, ...turnosPL];
        }
        
        console.log('Turnos disponíveis para o curso', novaUC, ':', turnosDisponiveis.value);
      } catch (error) {
        console.error('Erro ao buscar turnos disponíveis:', error);
        turnosDisponiveis.value = [];
      }
    });
    
    onMounted(async () => {
      try {
        // Certifique-se de que há um ID de sessão válido
        if (!session.id) {
          console.error('ID de sessão não encontrado');
          return;
        }
    
        // Buscar o aluno logado
        const alunoRes = await axios.get(`http://localhost:3000/students/${session.id}`);
        const aluno = alunoRes.data;
        
        // Verificar se o aluno tem cursos matriculados
        if (!aluno.enrolled || aluno.enrolled.length === 0) {
          console.log('Aluno não está matriculado em nenhum curso');
          return;
        }
        
        // Buscar informações de cada curso matriculado individualmente para garantir
        const cursosMatriculados = [];
        
        for (const cursoId of aluno.enrolled) {
          try {
            const cursoRes = await axios.get(`http://localhost:3000/courses/${cursoId}`);
            if (cursoRes.data && cursoRes.data.name) {
              cursosMatriculados.push(cursoRes.data.name);
              // Armazenar o mapeamento de nome para ID
              mapeamentoCursos.value[cursoRes.data.name] = cursoRes.data.id;
            }
          } catch (err) {
            console.error(`Erro ao buscar curso ${cursoId}:`, err);
          }
        }
        
        // Atualizar a lista de UCs com apenas os cursos matriculados
        listaUCs.value = cursosMatriculados;
        console.log('UCs disponíveis:', listaUCs.value);
        
      } catch (error) {
        console.error('Erro ao carregar cursos do aluno:', error);
      }
    });
    
    function handleBackgroundClick(event) {
      if (event.target.classList.contains('overlay')) {
        emit('update:modelValue', false);
      }
    }
    
    async function emitSend() {
      if (para.value.trim() === '') {
        alert('Preencha o campo "Para" antes de enviar.');
        return;
      }
    
      if (tipoAssunto.value === 'Troca de Turno') {
        if (!ucSelecionada.value) {
          alert('Selecione uma UC antes de enviar.');
          return;
        }
        if (!turnoDesejado.value) {
          alert('Selecione um turno desejado antes de enviar.');
          return;
        }
    
        try {
          // Obter o id do turno desejado e o turno atual
          const turnoSelecionado = turnosDisponiveis.value.find(t => t.name === turnoDesejado.value);
          if (!turnoSelecionado) {
            alert('Erro ao encontrar o turno selecionado.');
            return;
          }
          
          const cursoId = mapeamentoCursos.value[ucSelecionada.value];
          
          // Encontrar o turno atual do aluno nesta UC
          const alocacoesRes = await axios.get(`http://localhost:3000/allocations`);
          const shiftsRes = await axios.get(`http://localhost:3000/shifts`);
          
          const alocacoesDoAluno = alocacoesRes.data.filter(a => a.studentId == session.id);
          const allShifts = shiftsRes.data;
          
          // Encontrar o turno atual do aluno nessa UC específica
          let turnoAtualId = null;
          for (const alocacao of alocacoesDoAluno) {
            const shift = allShifts.find(s => s.id == alocacao.shiftId);
            if (shift && shift.courseId == cursoId) {
              turnoAtualId = shift.id;
              break;
            }
          }
          
          if (!turnoAtualId) {
            alert('Você não está alocado em nenhum turno para esta UC.');
            return;
          }
          
          // Buscar informações do aluno para obter o nome
          const studentRes = await axios.get(`http://localhost:3000/students/${session.id}`);
          const studentName = studentRes.data.name;
          
          // Construir o assunto da mensagem
          const assuntoCompleto = `Troca de Turno - ${ucSelecionada.value} - Turno ${turnoDesejado.value}`;
          
          // 1. Criar a mensagem enviada
          const mensagemEnviada = {
            enviada: true,
            idPessoa: session.id,
            para: para.value,
            assunto: assuntoCompleto,
            conteudo: mensagem.value,
            lida: true
          };
          
          // 2. Criar a mensagem recebida
          const mensagemRecebida = {
            enviada: false,
            idPessoa: para.value,
            de: studentName,
            assunto: assuntoCompleto,
            conteudo: mensagem.value,
            lida: false
          };
          
          // 3. Criar o pedido de troca de turno
          const shiftRequest = {
            shiftId: turnoAtualId,
            studentId: session.id,
            alternativeShiftId: turnoSelecionado.id
          };
          
          // Enviar todos os dados para o servidor
          const [msgEnviadaRes, msgRecebidaRes, requestRes] = await Promise.all([
            axios.post('http://localhost:3000/mensagens', mensagemEnviada),
            axios.post('http://localhost:3000/mensagens', mensagemRecebida),
            axios.post('http://localhost:3000/shiftRequests', shiftRequest)
          ]);
          
          console.log('Mensagem enviada criada:', msgEnviadaRes.data);
          console.log('Mensagem recebida criada:', msgRecebidaRes.data);
          console.log('Pedido de troca de turno criado:', requestRes.data);
          
          // Informar o usuário
          alert('Pedido de troca de turno enviado com sucesso!');
          
          emit('send', {
            para: para.value,
            assunto: assuntoCompleto,
            conteudo: mensagem.value,
            uc: ucSelecionada.value,
            turno: turnoDesejado.value
          });
        } catch (error) {
          console.error('Erro ao enviar mensagens e pedido:', error);
          alert('Ocorreu um erro ao enviar o pedido. Por favor, tente novamente.');
          return;
        }
      } else {
        // Caso de mensagem comum (não é troca de turno)
        try {
          const assuntoFinal = tipoAssunto.value === 'Outro' ? assuntoPersonalizado.value.trim() : tipoAssunto.value;
    
          if (assuntoFinal === '') {
            alert('Preencha o campo "Assunto" antes de enviar.');
            return;
          }
          
          // Buscar informações do aluno para obter o nome
          const studentRes = await axios.get(`http://localhost:3000/students/${session.id}`);
          const studentName = studentRes.data.name;
          
          // 1. Criar a mensagem enviada
          const mensagemEnviada = {
            enviada: true,
            idPessoa: session.id,
            para: para.value,
            assunto: assuntoFinal,
            conteudo: mensagem.value,
            lida: true
          };
          
          // 2. Criar a mensagem recebida
          const mensagemRecebida = {
            enviada: false,
            idPessoa: para.value,
            de: studentName,
            assunto: assuntoFinal,
            conteudo: mensagem.value,
            lida: false
          };
          
          // Enviar as mensagens para o servidor
          const [msgEnviadaRes, msgRecebidaRes] = await Promise.all([
            axios.post('http://localhost:3000/mensagens', mensagemEnviada),
            axios.post('http://localhost:3000/mensagens', mensagemRecebida)
          ]);
          
          console.log('Mensagem enviada criada:', msgEnviadaRes.data);
          console.log('Mensagem recebida criada:', msgRecebidaRes.data);
          
          // Informar o usuário
          alert('Mensagem enviada com sucesso!');
    
          emit('send', {
            para: para.value,
            assunto: assuntoFinal,
            conteudo: mensagem.value
          });
        } catch (error) {
          console.error('Erro ao enviar mensagens:', error);
          alert('Ocorreu um erro ao enviar a mensagem. Por favor, tente novamente.');
          return;
        }
      }
    
      emit('update:modelValue', false);
      emit('notificar');
    }
    </script>

<style scoped>
/* Igual ao EnviarMensagem.vue – pode copiar os estilos diretamente se for partilhado */
.overlay {
position: fixed;
top: 0;
left: 0;
width: 100vw;
height: 100vh;
background-color: rgba(0, 0, 0, 0.5);
display: flex;
justify-content: center;
align-items: center;
z-index: 1000;
}

.overlay-content {
position: relative;
background-color: white;
padding: 30px 40px;
border-radius: 10px;
width: 920px;
height: 585px;
max-width: 95%;
max-height: 90%;
box-shadow: 0px 0px 20px rgba(0, 0, 0, 0.3);
overflow: hidden;
}

.send-button-container {
position: absolute;
left: 45px;
top: 35px;
}

.send-button-container .botao {
width: 140px;
height: 50px;
font-size: 17px;
border-radius: 0;
padding-left: 12px;
display: flex;
align-items: center;
justify-content: flex-start;
gap: 8px;
}

.content-button {
display: flex;
align-items: center;
gap: 16px;
}

.icon {
width: 18px;
height: 18px;
color: #BA7070;
transition: color 0.3s ease;
}

.text-button {
color: rgba(0, 0, 0, 0.718);;
font-weight: bold;
transition: color 0.3s ease;
}

.send-button-container .botao:hover {
background-color: #DF9898;
}

.send-button-container .botao:hover .icon,
.send-button-container .botao:hover .text-button {
color: #FFFFFF;
}

.fade-enter-active, .fade-leave-active {
transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
opacity: 0;
}
.fade-enter-to, .fade-leave-from {
opacity: 1;
}

.caixa-cinza {
margin-top: 100px;
width: 830px;
height: 400px;
background-color: #F8F8F8;
border-radius: 8px;
margin-left: auto;
margin-right: auto;
padding: 20px 30px;
box-sizing: border-box;
display: flex;
flex-direction: column;
}

.textarea-mensagem {
width: 100%;
height: 100%;
background-color: white;
border: none;
border-radius: 6px;
padding: 12px;
resize: none;
font-size: 16px;
font-family: 'Meera Inimai', sans-serif;
color: black;
box-shadow: 0px 0px 4px rgba(0,0,0,0.1);
}

.textarea-mensagem:focus {
outline: none;
box-shadow: 0 0 6px rgba(0,0,0,0.3);
}

.campos-superiores {
display: flex;
flex-direction: column;
gap: 25px;
margin-bottom: 20px;
}

.campo {
display: flex;
align-items: center;
gap: 20px;
}

.label-caixa {
background-color: #FFFBFB;
border: 1px solid #CEC9C9;
padding: 10px 16px;
font-weight: bold;
color: rgba(2, 2, 2, 0.6);
border-radius: 4px;
font-size: 16px;
white-space: nowrap;
}

.linha-input {
width: 300px;
height: 30px;
background-color: #888;
border: none;
border-bottom: 1px solid #888;
font-size: 16px;
padding: 8px 4px;
background: transparent;
font-family: 'Meera Inimai', sans-serif;
}

.linha-input:focus {
outline: none;
border-bottom: 2px solid #BA7070;
}

/* Estilos atualizados para o dropdown e layout inline */
.select-wrapper {
position: relative;
display: inline-block;
}

.custom-select {
appearance: none;
width: 200px; /* Reduzido de 250px */
height: 38px; /* Altura ajustada */
padding: 0 25px 0 10px; /* Adicionado padding lateral */
cursor: pointer;
background-color: #FFFBFB; /* Fundo claro como a label */
border: 1px solid #CEC9C9; /* Borda com a cor especificada */
border-radius: 4px; /* Cantos arredondados como a label */
font-size: 14px; /* Tamanho da fonte reduzido */
color: rgba(2, 2, 2, 0.6);
font-family: 'Meera Inimai', sans-serif;
}

/* Versão menor para os dropdowns secundários */
.select-smaller {
width: 160px; /* Largura menor para os dropdowns secundários */
}

.select-turno {
width: 100px; /* Dropdown do turno ainda menor */
}

.select-icon {
position: absolute;
right: 10px;
top: 50%;
transform: translateY(-50%);
pointer-events: none;
width: 16px;
height: 16px;
color: #888;
}

/* Estilize as opções do dropdown */
.custom-select option {
background-color: #FFFBFB;
color: rgba(2, 2, 2, 0.6);
padding: 8px;
font-size: 14px;
border: none;
}

/* Remover o contorno quando focado e manter a borda */
.custom-select:focus {
outline: none;
border: 1px solid #BA7070; /* Cor de destaque ao focar */
}

/* Ajuste para o campo de assunto personalizado */
input.linha-input[placeholder="Escreva o assunto"] {
width: 200px; /* Para corresponder à largura do dropdown */
margin-left: 0; /* Alinhamento */
height: 38px; /* Altura para corresponder ao dropdown */
border: 1px solid #CEC9C9;
border-radius: 4px;
padding: 0 10px;
background-color: #FFFBFB;
}

/* Campo inline e alinhamento */
.campo-inline {
display: flex;
flex-wrap: nowrap;
align-items: center;
}

.ml-2 {
margin-left: 8px;
}

.ml-4 {
margin-left: 16px;
}

/* Estilo especial para o turno */
.turno-container {
display: flex;
align-items: center;
}

.turno-label {
font-size: 14px;
font-weight: 500;
color: rgba(2, 2, 2, 0.6);
white-space: nowrap;
}
</style>