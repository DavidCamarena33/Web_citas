import { createRouter, createWebHistory } from "vue-router";
import axios from 'axios'

import loginView from "../views/loginView.vue";
import registerView from "../views/registerView.vue";
import PerfilUsuario from "../views/PerfilUsuario.vue";
import Ubicacion from "../views/Ubicacion.vue";



const routes = [
    {path: '/', redirect: '/login'},
    {path: '/login', name: 'login', component: loginView},
    {path: '/registro', name: 'registro', component: registerView },
    {path: '/perfil', name: 'perfil', component: PerfilUsuario , meta: {requiresAuth: true}},
    {path: '/ubicacion', name: 'ubicacion', component: Ubicacion , meta: {requiresAuth: true}}
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

router.beforeEach(async (to) => {
  if (!to.meta.requiresAuth) return true;
  try {
      await axios.get('http://localhost:3000/api/verificar-sesion', { withCredentials: true });
      return true;
  } catch (error) {
      return { path: "/login", query: { next: to.fullPath } };
  }
});

export default router;