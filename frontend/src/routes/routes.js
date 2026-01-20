import { createRouter, createWebHistory } from "vue-router";
import loginView from "../views/loginView.vue";
import registerView from "../views/registerView.vue";

const routes = [
    {path: '/', redirect: '/login'},
    {path: '/login', name: 'login', component: loginView},
    {path: '/registro', name: 'registro', component: registerView}
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;