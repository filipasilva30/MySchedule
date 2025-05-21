import axios from 'axios'
import * as types from './types'

const API = axios.create({
  baseURL: 'http://localhost:3000',
  responseType: 'json',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Diretores
export async function loginDirector(email: string, password: string) {
  const response = await API.get(`/directors?email=${email}`)
  const director = response.data[0]
  if (director && director.password === password) {
    return director
  }
  return false
}

// Professores
export async function listTeachers() {
  const response = await API.get('/teachers')
  return response.data
}

export async function loginTeacher(email: string, password: string) {
  const response = await API.get(`/teachers?email=${email}`)
  const teacher = response.data[0]
  if (teacher && teacher.password === password) {
    return teacher
  }
  return false
}

// Estudantes
export async function listStudents() {
  const response = await API.get('/students')
  return response.data
}

export async function loginStudent(email: string, password: string) {
  const response = await API.get(`/students?email=${email}`)
  const student = response.data[0]
  if (student && student.password === password) {
    return student
  }
  return false
}

// Cursos e Graus
export async function listCourses() {
  const response = await API.get('/courses')
  return response.data
}

export async function listDegrees() {
  const response = await API.get('/degrees')
  return response.data
}

// Turnos
export async function listShifts() {
  const response = await API.get('/shifts')
  return response.data
}

export async function updateShift(id: number, data: any) {
  const response = await API.patch(`/shifts/${id}`, data)
  return response.data
}

// Alocações
export async function listAllocations() {
  const response = await API.get('/allocations')
  return response.data
}

// Conflitos
export async function listConflicts() {
  const response = await API.get('/conflicts')
  return response.data
}

// Salas
export async function listClassrooms() {
  const response = await API.get('/classrooms')
  return response.data
}

export async function listBuildings() {
  const response = await API.get('/buildings')
  return response.data
}

// Pedidos de sala
export async function listClassroomRequests() {
  const response = await API.get('/classroomRequests')
  return response.data
}

export async function updateClassroomRequest(id: number, data: any) {
  const response = await API.patch(`/classroomRequests/${id}`, data)
  return response.data
}

// Pedidos de troca de turno
export async function listShiftRequests() {
  const response = await API.get('/shiftRequests')
  return response.data
}

export async function updateShiftRequest(id: number, data: any) {
  const response = await API.patch(`/shiftRequests/${id}`, data)
  return response.data
}

// Caderno 

// Atualiza as anotações do Diretor
export async function updateCaderno(id: number, caderno: string) {
  const response = await API.patch(`/directors/${id}`, { caderno });
  return response.data;
}

// Atualiza as anotações do Professor
export async function updateTeacherCaderno(id: number, caderno: string) {
  const response = await API.patch(`/teachers/${id}`, { caderno });
  return response.data;
}