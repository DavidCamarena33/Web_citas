import { defineStore } from 'pinia';
import axios from 'axios';

const API = 'http://localhost:3000/api';

export const usePlanesStore = defineStore('planes', {
  state: () => ({
    planes: [],
    misPlanes: [],
    favoritePlanIds: [],
    loading: false,
  }),
  actions: {
    async fetchPlanes(options = {}) {
      const normalizedOptions =
        typeof options === 'string'
          ? { orientacion: options }
          : options || {};
      const { orientacion = 'all', modalidad = null } = normalizedOptions;

      this.loading = true;
      try {
        const { data } = await axios.get(`${API}/planes`, {
          withCredentials: true,
          params: {
            ...(orientacion && orientacion !== 'all' ? { orientacion } : {}),
            ...(modalidad ? { modalidad } : {}),
          },
        });
        this.planes = data;
      } finally {
        this.loading = false;
      }
    },
    async fetchMisPlanes() {
      const { data } = await axios.get(`${API}/planes/mis-planes`, { withCredentials: true });
      this.misPlanes = data;
    },
    async fetchFavoritos() {
      const { data } = await axios.get(`${API}/favoritos`, { withCredentials: true });
      this.favoritePlanIds = data.map((item) => Number(item.id_plan)).filter(Boolean);
    },
    async toggleFavorito(id_plan) {
      const { data } = await axios.post(`${API}/planes/${id_plan}/favorito`, {}, {
        withCredentials: true,
      });

      const planId = Number(id_plan);
      if (data.favorite) {
        if (!this.favoritePlanIds.includes(planId)) {
          this.favoritePlanIds = [...this.favoritePlanIds, planId];
        }
      } else {
        this.favoritePlanIds = this.favoritePlanIds.filter((id) => id !== planId);
      }

      return data;
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
    async fetchRatingStatus(id_plan) {
      const { data } = await axios.get(`${API}/planes/${id_plan}/valoracion`, {
        withCredentials: true,
      });
      return data;
    },
    async submitRating(id_plan, payload) {
      const { data } = await axios.post(`${API}/planes/${id_plan}/valoracion`, payload, {
        withCredentials: true,
      });
      return data;
    },
  },
});
