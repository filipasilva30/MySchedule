// Utilizadores
export type Director = {
    id: number
    name: string
    email: string
    password: string
  }
  
  export type Teacher = {
    id: number
    name: string
    email: string
    password: string
  }
  
  export type Student = {
    id: number
    name: string
    email: string
    password: string
    specialStatus?: boolean
    enrolled: number[]
  }
  
  // Cursos e Graus
  export type Degree = {
    id: number
    name: string
    abbreviation: string
    directorId: number
  }
  
  export type Course = {
    id: number
    name: string
    abbreviation: string
    year: number
    semester: number
    degreeId: number
  }
  
  // Turnos
  export type Shift = {
    id: number
    courseId: number
    classroomId: number
    day: string
    from: number
    to: number
    type: string // T, PL, TP
    name: string
    teacherId: number
    totalStudentsRegistered: number
  }
  
  // Alocações (student x shift)
  export type Allocation = {
    id: number
    shiftId: number
    studentId: number
  }
  
  // Conflitos
  export type Conflict = {
    id: number
    studentId: number
    courseIDs: number[]
  }
  
  // Edifícios e Salas
  export type Building = {
    id: number
    name: string
    abbreviation: string
  }
  
  export type Classroom = {
    id: number
    name: string
    capacity: number
    buildingId: number
  }
  
  // Pedidos
  export type ClassroomRequest = {
    id: number
    classroomId: number
    teacherId: number
    response: string // "ok" | "rejected" | etc.
    responseSeenByTeacher: boolean
  }
  
  export type ShiftRequest = {
    id: number
    shiftId: number
    studentId: number
    response: string // "ok" | "rejected" | etc.
    alternativeShiftId: number | null
    responseSeenByStudent: boolean
  }
  