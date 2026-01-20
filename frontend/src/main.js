import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './routes/routes';

createApp(App)
  .use(router) // activa router
  .mount("#app"); 
