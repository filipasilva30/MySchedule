<template>
  <div class="container">
    <div class="left">
      <img src="/src/assets/main_logo.png" alt="Login Image" class="background-image" />
    </div>
    <div class="separator"></div>
    <!-- Form on the right -->
    <div class="right">
      <div class="form-container">
        <!-- Title -->
        <div class="title">
          <h1 class="heading">
            My<span class="highlight">Schedule</span><sup class="subscript">®</sup>
          </h1>
          <p class="description">Solution to schedule and class logistics</p>
        </div>

        <!-- Login Form -->
        <form class="login-form" @submit.prevent="login">
          <div class="input-group">
            <label for="email" class="sr-only">Email</label>
            <div class="input-wrapper">
           
              <input
                type="email"
                id="email"
                required
                class="input-field"
                placeholder="Insira o seu endereço eletrónico"
                v-model="email"
              />
              <div class="bottom-border"></div>
            </div>
          </div>

          <!-- Password Field -->
          <div class="input-group">
            <label for="password" class="sr-only">Password</label>
            <div class="input-wrapper">
            
              <input
                type="password"
                id="password"
                required
                class="input-field"
                placeholder="Insira a sua palavra-passe"
                v-model="password"
              />
              <div class="bottom-border"></div>  
            </div>
          </div>

          <!-- Success Message -->
          <div v-if="mensagemTemp" class="success-message">
            {{ mensagemTemp }}
          </div>

          <!-- Login Button -->
          <button type="submit" class="login-button">Iniciar Sessão</button>

          <!-- Error Message -->
          <p v-if="error" class="error-message">{{ error }}</p>
        </form>
      </div>
    </div>
  </div>
</template>


<script lang="ts">
import * as api from '../api.ts'; 
import { useSessionStorage } from '@/stores/session.ts'; 
import { useMensagensStore } from '@/stores/useMensagensStore';

export default {
  data() {
    return {
      email: '',
      password: '',
      error: ''
    };
  },

  computed: {
    mensagemTemp() {
      const store = useMensagensStore();
      return store.mensagemTemp;
    }
  },

  methods: {
    async login() {
      this.error = ''; 
      try {
        let user = null;
        let userType = '';

        user = await api.loginStudent(this.email, this.password);
        if (user) {
          userType = 'student';
        }

        if (!user) {
          user = await api.loginDirector(this.email, this.password);
          if (user) {
            userType = 'director';
          }
        }

        if (user) {
          this.handleLogin(user, userType);
        } else {
          this.error = 'Endereço eletrónico ou palavra-passe inválidos';
        }
      } catch (error) {
        this.error = 'Ocorreu um erro ao tentar fazer login. Tente novamente.';
      }
    },

    handleLogin(user: any, type: string) {
      const session = useSessionStorage();
      session.id = user.id;
      session.name = user.name;
      session.type = type;

      sessionStorage.setItem('userId', user.id);
      sessionStorage.setItem('tipoUtilizador', type);


      this.error = '';

      if(type == 'teacher')   this.error = 'Endereço eletrónico ou palavra-passe inválidos';

      this.error = '';

      if (type === 'student' || type === 'director'){
        this.$router.push(`/unidades/${type}`);
      } else {
        this.$router.push('/login');
      }
    }
  },

  beforeDestroy() {
    const store = useMensagensStore();
    store.limparMensagemTemp(); 
  }
};
</script>


<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  height: 100%;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  overflow-x: hidden; 
}

.container {
  display: flex;
  height: 100vh;
  width: 100%;
  overflow: hidden;
}

.left {
  display: none;
  width: 50%;
  background-color: #f5f1e9;
}

.background-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.right {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  background-color: #ffffff;
  padding: 1rem;
}

.form-container {
  width: 100%;
  max-width: 450px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}

.title {
  text-align: center;
  width: 100%;
}

.heading {
  font-size: clamp(2.5rem, 5vw, 4rem);
  font-weight: bold;
  color: #A6A6A6;
  line-height: 1.2;
}

.highlight { /* schedule */ 
  font-weight: bolder;
  color: #545050;
}

.subscript {
  font-size: clamp(0.75rem, 1vw, 1rem);
  color: #6b7280;
  vertical-align: super;
}

.description {
  font-size: clamp(1rem, 2vw, 1.25rem);
  color: #716D6D;
  margin-top: 0.5rem;
}

.login-form {
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 1.5rem;
}

.input-group {
  width: 100%;
  margin-top: 1rem;
}

.input-wrapper {
  position: relative;
  width: 100%;
}

.input-wrapper i {
  position: absolute;
  top: 50%;
  left: 1rem;
  transform: translateY(-50%);
  color: #9f9e9e; 
  font-size: 1.2rem;
  pointer-events: none; 
}

.bottom-border {
  width: 100%; 
  height: 2px;
  background-color: #9f9e9e; 
  position: absolute; 
  bottom: 0; 
  left: 0; 
}

.input-field {
  width: 100%;
  height: 3rem;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  background-color: #f5f3f3;
  border: 1px solid #e8e4da;
  border-bottom: none;
  font-size: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.input-field::placeholder {
  font-size: clamp(0.875rem, 1.5vw, 1rem);
  color: #b8b6b6;   
}

.input-field:focus {
  outline: none;
}

.login-button {
  width: 100%;
  height: 3.5rem;
  background-color: #676766;
  color: white;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  font-size: clamp(1.25rem, 2vw, 1.5rem);
  transition: background-color 0.3s;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 2rem;
}

.login-button:hover {
  background-color: #4b5563;
}

.error-message {
  color: #be0000;
  font-size: 0.9rem;
  text-align: center;
  width: 100%;
}

.success-message {
  font-size: 1rem;
  color: #c5bda6;
  margin-bottom: 1rem;
  text-align: center;
  width: 100%;
}

.separator {
  width: 10px; 
  background-color: #878376; 
  height: 100%;
  display: none;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

@media (min-width: 768px) {
  .left {
    display: block;
  }
  
  .separator {
    display: block;
  }

  .right {
    width: 50%;
  }
  
  .form-container {
    padding: 0 1rem;
  }
}

@media (max-width: 767px) {
  .form-container {
    padding: 0 1.5rem;
  }
  
  .login-button {
    margin-top: 1.5rem;
  }
}

@media (max-width: 480px) {
  .heading {
    font-size: 2.5rem;
  }
  
  .description {
    font-size: 1rem;
  }
  
  .input-field {
    height: 2.75rem;
  }
  
  .login-button {
    height: 3rem;
    font-size: 1.25rem;
  }
}
</style>