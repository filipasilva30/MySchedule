    import { defineStore } from 'pinia';
    import { ref } from 'vue';

    export const useGestaoStore = defineStore('gestao', () => {
      const capacidades = ref<Record<number, string>>({});

      function setCapacidades(novasCapacidades: Record<number, string>) {
        console.log('setCapacidades chamado com:', novasCapacidades);
        capacidades.value = novasCapacidades;
        console.log('capacidades atualizadas:', capacidades.value);
      }

      function getCapacidadeById(turnoId: number | string): string {
        const id = Number(turnoId);
        const resultado = capacidades.value[id];
        console.log(`getCapacidadeById(${id}) → ${resultado}`);
        return resultado;
      }

      return { capacidades, setCapacidades, getCapacidadeById };
    });
