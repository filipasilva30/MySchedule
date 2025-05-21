<template>
  <div class="not-found">
    <h1>Página não encontrada</h1>
    <p>Desculpe, a página que você está a tentar aceder não existe ou então você não tem permissão para visualizá-la.</p>
    <div class="actions">
      <button @click="goHome" class="home-button">Regressar ao Login</button>
    </div>
  </div>
</template>

<script>
import { useSessionStorage } from '@/stores/session.ts';

export default {
  methods: {
    goHome() {
      const session = useSessionStorage();
      
      // If logged in, go to appropriate home page based on user type
      if (session.isLoggedIn) {
        if (session.type === 'student') {
          this.$router.push('/unidades/student');
        } else if (session.type === 'director') {
          this.$router.push('/unidades/director');
        } else {
          // Fallback for other user types
          this.$router.push('/');
        }
      } else {
        // If not logged in, go to login page
        this.$router.push('/login');
      }
    }
  }
}
</script>

<style scoped>
.not-found {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  text-align: center;
  min-height: 50vh;
}

h1 {
  font-size: 2.5rem;
  color: #676766;
  margin-bottom: 1rem;
}

p {
  font-size: 1.2rem;
  color: #716D6D;
  margin-bottom: 2rem;
  max-width: 600px;
}

.actions {
  display: flex;
  gap: 1rem;
}

button {
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  cursor: pointer;
  border-radius: 0.5rem;
  transition: all 0.3s ease;
}

.home-button {
  background-color: #676766;
  color: white;
  border: none;
}

.home-button:hover {
  background-color: #4b5563;
}
</style>
