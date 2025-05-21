<template>
  <div class="main-content">
    <div class="header">
      <DropDownAlternarSem @select-semester="selectSemester" />
      <DropDownAlternarAnos v-model:year="selectedYear" />
      <BarraPesquisa v-model="searchQuery" placeholderText="Pesquisar pela Unidade Curricular" />
    </div>

    <!-- Agrupar cursos por ano -->
    <div v-for="year in filteredCourses" :key="year.year" class="year-container">
      <h2>{{ year.year }}º ano</h2>
      <div class="year-section">
        <div class="courses">
          <div v-for="course in year.courses" :key="course.id" class="course-card">
            <router-link :to="`/unidades/${session.type}/${course.name}`" class="course-name">
            <h4>{{ course.name }}</h4>
            </router-link>

            <!-- Docente e Turnos -->
            <div class="course-info">
              <p class="teacher-name">Docente: {{ getTeacherName(course.id) }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import BarraPesquisa from "@/components/BarraPesquisa.vue";
import trabalhodb from "@/database/trabalhodb.json";
import DropDownAlternarSem from "@/components/DropDownAlternarSem.vue";
import DropDownAlternarAnos from "@/components/DropDownAlternarAnos.vue";
import { useSessionStorage } from "@/stores/session.ts";

export default {
  components: {
    BarraPesquisa,
    DropDownAlternarSem,
    DropDownAlternarAnos,
  },
  data() {
    return {
      searchQuery: "",
      courses: trabalhodb.courses,
      shifts: trabalhodb.shifts,
      teachers: trabalhodb.teachers,
      students: trabalhodb.students, // necessário para buscar o enrolled
      selectedYear: null,
      selectedSemester: null,
      session: useSessionStorage(), 
    };
  },
  computed: {
    filteredCourses() {
      if (!this.selectedYear && !this.selectedSemester) {
        return this.groupedCourses;
      }

      return this.groupedCourses.filter((yearGroup) => {
        const yearMatch = !this.selectedYear || yearGroup.year === this.selectedYear;
        const semesterMatch = !this.selectedSemester ||
          yearGroup.courses.some(course => course.semester === this.selectedSemester);

        return yearMatch && semesterMatch;
      }).map(yearGroup => {
        return {
          year: yearGroup.year,
          courses: this.selectedSemester
            ? yearGroup.courses.filter(course => course.semester === this.selectedSemester)
            : yearGroup.courses
        };
      }).filter(yearGroup => yearGroup.courses.length > 0);
    },

    groupedCourses() {
      const years = [1, 2, 3];

      // Verificar tipo do utilizador
      const userType = this.session.type;
      const userId = this.session.id;

      let enrolledCourseIds = [];

      if (userType === "student") {
        // Se for estudante, buscar os cursos em que está inscrito
        const student = this.students.find(s => s.id === userId);
        if (student) {
          enrolledCourseIds = student.enrolled;
        }
      }

      return years.map((year) => {
        const coursesForYear = this.courses.filter((course) => {
          const matchesYear = course.year === year;
          const matchesSearch = course.name.toLowerCase().includes(this.searchQuery.toLowerCase());

          if (userType === "student") {
            // Se for aluno, só mostrar cursos que ele está inscrito
            return matchesYear && matchesSearch && enrolledCourseIds.includes(Number(course.id));
          } else {
            // Se for diretor, mostrar tudo
            return matchesYear && matchesSearch;
          }
        });

        return {
          year,
          courses: coursesForYear,
        };
      }).filter((yearGroup) => yearGroup.courses.length > 0);
    },
  },
  methods: {
    selectSemester(semester) {
      this.selectedSemester = semester;
    },
    getTeacherName(courseId) {
      const courseShifts = this.shifts.filter((shift) => shift.courseId === Number(courseId));
      if (courseShifts.length > 0) {
        const teacherId = courseShifts[0].teacherId;
        const teacher = this.teachers.find((teacher) => Number(teacher.id) === teacherId);
        return teacher ? teacher.name : "Professor desconhecido";
      }
      return "Sem docente atribuído";
    },
    checkRoutePermissions() {
      const routeUserType = this.$route.params.userType;
      if (routeUserType && routeUserType !== this.session.type) {
        console.log('Unauthorized access detected in component');
        this.$router.push('/not-found');
      }
    }
  },
  created() {
    this.checkRoutePermissions();
  },
  watch: {
    '$route'(to, from) {
      this.checkRoutePermissions();
    }
  }
};
</script>

<style scoped>
.main-content {
    flex-grow: 1;
    padding: 20px;
    max-width: 1400px;
    margin: 0 auto;
}

.header {
    display: flex;
    justify-content: flex-end;  
    align-items: center;
    margin-bottom: 62px; 
    width: 100%;
}

.header > * {
  margin-right: 40px; 
}

.year-container {
    margin-bottom: 30px;
}

.year-container h2 {
    font-size: 1.65rem;
    color: #000000;
    margin-bottom: 15px;
    padding-bottom: 5px;
}

.year-section {
    background-color: #f9f5f5; 
    padding: 44.2px;
    border: 1px solid #dad6d6;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.courses {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 57px;
}

.course-card {
    text-align: center;
    background-color: #ffffff;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    transition: transform 0.2s;
    display: flex;
    flex-direction: column;
    height: 100%;
    border: 1px solid #dad6d6;
    box-shadow: 0 4px 13px rgba(0, 0, 0, 0.1);
}

.course-card:hover {
    transform: translateY(-3px);
}

.course-name {
    padding: 12px 15px;
    background-color: #ffffff;
    flex-grow: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 80px;
}

.course-name h4 {
    font-size: 1.1rem;
    margin: 0;
    color: #333;
    font-weight: 650;
    text-decoration: none;
}

.course-info {
    background-color: #fceace; 
    padding: 10px 15px;
    width: 100%;
    box-sizing: border-box;
    position: relative;
}

.course-info::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background-color: #fceace;
}

.teacher-name,
.shifts {
    font-size: 0.9rem;
    color: #000000;
    margin: 5px 0;
    line-height: 1.3;
}

.search-bar {
    margin: 0;
}

h2 {
  font-weight: bold;
}
</style>