import { defineStore } from 'pinia';
import axios from 'axios';

const API = 'http://localhost:3000/api';

export const usePlanesStore = defineStore('planes', {
  state: () => ({
    planes: [],
    misPlanes: [],
    loading: false,
  }),
  actions: {
    async fetchPlanes() {
      this.loading = true;
      try {
        const { data } = await axios.get(`${API}/planes`, { withCredentials: true });
        this.planes = data;
      } finally {
        this.loading = false;
      }
    },
    async fetchMisPlanes() {
      const { data } = await axios.get(`${API}/planes/mis-planes`, { withCredentials: true });
      this.misPlanes = data;
    },
    async crearPlan(formData) {
      const { data } = await axios.post(`${API}/planes`, formData, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data;
    },
    async getIntereses() {
      const { data } = await axios.get(`${API}/intereses`);
      return data;
    },
    async quickJoin(id_plan, mensaje = '') {
      const { data } = await axios.post(`${API}/solicitudes`, { id_plan, mensaje }, { withCredentials: true });
      return data;
    },
  },
});
