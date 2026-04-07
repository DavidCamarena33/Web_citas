import { defineStore } from 'pinia';
import axios from 'axios';

const API = 'http://localhost:3000/api';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    isAuthenticated: false,
  }),
  actions: {
    async checkAuth() {
      try {
        const { data } = await axios.get(`${API}/verificar-sesion`, { withCredentials: true });
        this.isAuthenticated = data.auth;
        this.user = data.user?.user || null;
      } catch {
        this.isAuthenticated = false;
        this.user = null;
      }
    },
    async login(email, contrasena) {
      const { data } = await axios.post(`${API}/login`, { email, contrasena }, { withCredentials: true });
      this.isAuthenticated = true;
      this.user = data.user;
      return data;
    },
    async logout() {
      await axios.post(`${API}/logout`, {}, { withCredentials: true }).catch(() => {});
      this.isAuthenticated = false;
      this.user = null;
    },
    async fetchPerfil() {
      const { data } = await axios.get(`${API}/perfil`, { withCredentials: true });
      return data;
    },
  },
});
