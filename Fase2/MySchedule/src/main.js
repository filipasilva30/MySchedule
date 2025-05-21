import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import '@fortawesome/fontawesome-free/css/all.css';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faUser, faKey } from '@fortawesome/free-solid-svg-icons'; 


import App from './App.vue'
import router from './router'

library.add(faUser, faKey);

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
