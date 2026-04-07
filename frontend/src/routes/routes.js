import { createRouter, createWebHistory } from "vue-router";
import axios from 'axios';

import loginView from "../views/loginView.vue";
import registerView from "../views/registerView.vue";
import PerfilUsuario from "../views/PerfilUsuario.vue";
import Ubicacion from "../views/Ubicacion.vue";
import DiscoverView from "../views/DiscoverView.vue";
import MisPlanesView from "../views/MisPlanesView.vue";
import MensajesView from "../views/MensajesView.vue";
import ComunidadesView from "../views/ComunidadesView.vue";
import CrearPlanView from "../views/CrearPlanView.vue";
import PlanDetailView from "../views/PlanDetailView.vue";

const routes = [
  { path: '/', redirect: '/discover' },
  { path: '/login', name: 'login', component: loginView },
  { path: '/registro', name: 'registro', component: registerView },
  { path: '/ubicacion', name: 'ubicacion', component: Ubicacion, meta: { requiresAuth: true } },

  // Main app
  { path: '/discover', name: 'discover', component: DiscoverView, meta: { requiresAuth: true } },
  { path: '/mis-planes', name: 'mis-planes', component: MisPlanesView, meta: { requiresAuth: true } },
  { path: '/mensajes', name: 'mensajes', component: MensajesView, meta: { requiresAuth: true } },
  { path: '/comunidades', name: 'comunidades', component: ComunidadesView, meta: { requiresAuth: true } },
  { path: '/perfil', name: 'perfil', component: PerfilUsuario, meta: { requiresAuth: true } },
  { path: '/crear-plan', name: 'crear-plan', component: CrearPlanView, meta: { requiresAuth: true } },
  { path: '/planes/:id', name: 'plan-detail', component: PlanDetailView, meta: { requiresAuth: true } },
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