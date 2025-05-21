import { createRouter, createWebHistory } from 'vue-router'
import HorariosDC from '@/views/HorariosDC.vue'
import Mensagens from '@/views/Mensagens.vue' 
import HorarioAluno from '@/views/HorarioAluno.vue'
import Perfil from '@/views/Perfil.vue'
import DetalheUC from '@/views/DetalheUC.vue'
import Gestao from '@/views/Gestao.vue'
import GestaoUC from '@/views/GestaoUC.vue' 
import Login from '@/views/Login.vue' 
import Unidades from '@/views/Unidades.vue' 
import BarraPesquisa from '@/components/BarraPesquisa.vue' 
import DropDownAlternarSem from '@/components/DropDownAlternarSem.vue' 
import DropDownAlternarAnos from '@/components/DropDownAlternarAnos.vue' 
import NotFoundPage from '@/components/NotFoundPage.vue'



const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/login'
    },
    {
      path: '/login',
      name: 'Login',
      component: Login,
    },
    {
      path: '/unidades',
      name: 'Unidades',
      component: Unidades,
    },
    {
      path: '/horarios-dc',
      name: 'Horarios',
      component: HorariosDC,
    },
    {
      path: '/mensagens',
      name: 'Mensagens',
      component: Mensagens,
    },

    // {
    //   path: '/unidades/:nome',
    //   name: 'DetalheUC',
    //   component: DetalheUC,
    // },
    {
      path: '/unidades/:userType/:nome',
      name: 'DetalheUC',
      component: DetalheUC,
    },
    

    {
      path: '/unidades/:userType',
      name: 'UnidadesPorTipo',
      component: Unidades,
    },

    {
      path: '/perfil',
      name: 'Perfil',
      component: Perfil,
    },
    {
      path: '/gestao',
      name: 'Gestao',
      component: Gestao,
    },
    {
      path: '/gestao-uc/:nome', 
      name: 'GestaoUC',
      component: GestaoUC,
    },
    {
      path: '/horario-aluno',
      name: 'HorarioAluno',
      component: HorarioAluno,
    },
    {
      path: '/:notFoundPage(.*)',
      name: 'NotFoundPage',
      component: NotFoundPage,
    }
  ],
})

export default router
