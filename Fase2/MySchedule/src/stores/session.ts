import { defineStore } from 'pinia'

export const useSessionStorage = defineStore('session', {
  state: () => ({
    id: '',
    name: '',
    surnames: '',
    email: '',
    telephone: '',
    birthdate: '',
    department: '',
    gender: '',
    address: '',
    type: '',
    caderno: ''  
  }),
  actions: {
    login(id: string, name: string, surnames: string, email: string, telephone: string, department: string, address: string, type: string, birthdate: string, gender: string, caderno: string = '') {
      this.id = id
      this.name = name
      this.surnames = surnames
      this.telephone = telephone
      this.address = address
      this.department = department
      this.email = email 
      this.type = type
      this.birthdate = birthdate
      this.gender = gender
      this.caderno = caderno 
    },
    logout() {
      this.id = ''
      this.name = ''
      this.surnames = ''
      this.telephone = ''
      this.address = ''
      this.department = ''
      this.email = '' 
      this.type = ''
      this.birthdate = ''
      this.gender = ''
      this.caderno = ''  
    },
    updateCaderno(caderno: string) {
      this.caderno = caderno  
    }
  },
  getters: {
    isLoggedIn(state) {
      return state.id && state.name && state.email && state.type && state.surnames && state.department && state.telephone && state.address && state.birthdate && state.gender
    }
  },
  persist: true
})
