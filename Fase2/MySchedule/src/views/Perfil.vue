  <template>
    <div class="perfil-container">
      <div class="top-bar">
        <div class="perfil-info">
          <User class="user-icon" />
          <span class="nome-utilizador">{{ diretor.name }}</span>
          <div class="botao-editar">
            <Botao
              v-if="!editando"
              label="Editar"
              @click="ativarEdicao"
            />
            <Botao
              v-else
              label="Guardar"
              @click="guardarAlteracoes"
            />
          </div>
        </div>
      </div>

      <!-- Conteúdo do perfil -->
      <div class="perfil-conteudo">
        <div class="perfil-colunas">
          <!-- Coluna da esquerda -->
          <div class="coluna">
            <div class="campo">
              <div class="label">Nome completo</div>
              <div class="valor">{{ diretor.name }}</div>
            </div>
            <div class="campo">
              <div class="label">Endereço eletrónico</div>
              <div class="valor">
                <input v-if="editando" v-model="novoEmail" />
                <span v-else>{{ diretor.email }}</span>
              </div>
            </div>
            <div class="campo">
              <div class="label">Data de nascimento</div>
              <div class="valor">{{ diretor.nascimento }}</div>
            </div>
            <div class="campo">
              <div class="label">Endereço postal</div>
              <div class="valor">
                <input v-if="editando" v-model="novaMorada" />
                <span v-else v-html="diretorWithFormat.moradaFormatada"></span>
              </div>
            </div>
            <div class="campo">
              <div class="label">Sexo</div>
              <div class="valor">{{ diretor.sexo }}</div>
            </div>
          </div>

          <!-- Coluna da direita -->
          <div class="coluna">
            <div class="campo">
              <div class="label">Cargos</div>
              <div class="valor">
                <div v-for="(cargo, i) in diretor.cargos" :key="i">
                  {{ cargo }}
                </div>
              </div>
            </div>
            <div class="campo">
              <div class="label">Departamento</div>
              <div class="valor">{{ diretor.departamento }}</div>
            </div>
            <div class="campo">
              <div class="label">Telefone</div>
              <div class="valor">
                <input v-if="editando" v-model="novoTelefone" />
                <span v-else>{{ diretor.telefone }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Círculo cinzento no canto inferior direito -->
      <div class="circulo"></div>
    </div>
  </template>


  <script setup>
  import { ref, onMounted, computed} from 'vue';
  import { User } from 'lucide-vue-next';
  import Botao from '@/components/Botao.vue';
  import { useSessionStorage } from '@/stores/session';
  import axios from 'axios';

  const session = useSessionStorage();

  const diretor = ref({
    name: '',
    email: '',
    nascimento: '',
    morada: '',
    sexo: '',
    telefone: '',
    departamento: '',
    cargos: []
  });

  const editando = ref(false);

  const diretorWithFormat = computed(() => ({
    ...diretor.value,
    moradaFormatada: diretor.value.morada?.replace(',', ',<br>') || '',
  }));

  // Campos editáveis
  const novoNome = ref('');
  const novoEmail = ref('');
  const novoNascimento = ref('');
  const novaMorada = ref('');
  const novoSexo = ref('');
  const novoTelefone = ref('');
  const novoDepartamento = ref('');
  const novosCargos = ref([]);

  // Buscar dados do utilizador
  onMounted(async () => {
    try {
      if (!session.id) {
        console.error('Nenhum ID de sessão encontrado.');
        return;
      }

      // Primeiro tenta buscar nos directors
      let response = await axios.get(`http://localhost:3000/directors?id=${session.id}`);
      let data = response.data;

      if (data.length > 0) {
        diretor.value = data[0];
      } else {
        // Se não encontrou nos directors, procura nos students
        response = await axios.get(`http://localhost:3000/students?id=${session.id}`);
        data = response.data;

        if (data.length > 0) {
          const aluno = data[0];
          diretor.value = {
            name: aluno.name,
            email: aluno.email,
            nascimento: aluno.nascimento,
            morada: aluno.morada,
            sexo: aluno.sexo,
            telefone: aluno.telefone,
            departamento: aluno.departamento,
            cargos: [aluno.cargo] 
          };
        } else {
          console.error('Utilizador não encontrado.');
        }
      }

      // Inicializar campos editáveis
      novoNome.value = diretor.value.name;
      novoEmail.value = diretor.value.email;
      novoNascimento.value = diretor.value.nascimento;
      novaMorada.value = diretor.value.morada;
      novoSexo.value = diretor.value.sexo;
      novoTelefone.value = diretor.value.telefone;
      novoDepartamento.value = diretor.value.departamento;
      novosCargos.value = [...diretor.value.cargos];
    } catch (error) {
      console.error('Erro ao buscar dados do utilizador:', error);
    }
  });

  function ativarEdicao() {
    editando.value = true;
  }

  // guardar alterações no servidor
  async function guardarAlteracoes() {
    const atualizados = {
      name: novoNome.value,
      email: novoEmail.value,
      nascimento: novoNascimento.value,
      morada: novaMorada.value,  
      sexo: novoSexo.value,
      telefone: novoTelefone.value,
      departamento: novoDepartamento.value,
      cargos: [...novosCargos.value]
    };

    try {
      if (diretor.value.cargos.length === 1 && diretor.value.cargos[0].startsWith('Aluno')) {
        // Atualizar no students
        await axios.patch(`http://localhost:3000/students/${session.id}`, {
          name: novoNome.value,
          email: novoEmail.value,
          nascimento: novoNascimento.value,
          morada: novaMorada.value,  
          sexo: novoSexo.value,
          telefone: novoTelefone.value,
          departamento: novoDepartamento.value,
          cargo: novosCargos.value[0] 
        });
      } else {
        // Atualizar no directors
        await axios.patch(`http://localhost:3000/directors/${session.id}`, atualizados);
      }

      // Atualizar localmente
      diretor.value = { ...diretor.value, ...atualizados };
      editando.value = false;
    } catch (error) {
      console.error('Erro ao salvar alterações:', error);
    }
  }
  </script>

  <style scoped>
  .perfil-container {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    min-height: 100vh;
    position: fixed;
    overflow: hidden;
    box-sizing: border-box;
    padding-bottom: 50px;
  }

  /* Top bar */
  .top-bar {
    margin-top: 10px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
    padding: 0 20px;
  }

  /* Ícone + nome */
  .perfil-info {
    margin-top: 30px;
    display: flex;
    align-items: center;
    gap: 20px;
  }

  /* Ícone User */
  .user-icon {
    width: 60px;
    height: 60px;
    color: #02020299;
  }

  /* Nome do utilizador */
  .nome-utilizador {
    font-size: 28px;
    font-weight: bold;
    color: #222;
  }

  /* Conteúdo do perfil */
  .perfil-conteudo {
    margin-top: 30px;
    padding: 20px;
    position: relative;
    z-index: 1;
  }

  /* Duas colunas */
  .perfil-colunas {
    display: flex;
    flex-wrap: wrap;
    gap: 50px;
    max-width: 100%;
  }

  .botao-editar {
    margin-left: 20px;
  }

  .botao-editar :deep(button) {
    font-size: 18px;
    padding: 6px 12px;
    background-color: #373737;
    color: #fff;
    border: none;
    border-radius: 10px;
    cursor: pointer;
  }

  .botao-editar :deep(button):hover {
    background-color: #222;
  }

  /* Cada coluna */
  .coluna {
    flex: 1;
    min-width: 300px;
    display: flex;
    flex-direction: column;
    gap: 40px;
  }

  /* Estilo dos campos */
  .campo .label {
    font-weight: bold;
    color: #222;
    font-size: 22px;
    margin-bottom: 5px;
  }

  .campo .valor {
    color: #444;
    font-size: 18px;
    max-width: 100%;
    word-wrap: break-word;
  }

  .campo input {
    width: 100%;
    max-width: 300px;
    padding: 8px;
    font-size: 16px;
    border: 1px solid #ddd;
    border-radius: 4px;
  }

  .circulo {
    position: fixed;
    bottom: -100px;
    right: -100px;
    width: 400px;
    height: 400px;
    background-color: #ebebeb;
    border-radius: 50%;
    z-index: 0;
  }

  @media (max-width: 768px) {
    .perfil-colunas {
      flex-direction: column;
      gap: 30px;
    }
    
    .coluna {
      min-width: auto;
    }
    
    .circulo {
      width: 300px;
      height: 300px;
    }
  }
  </style>