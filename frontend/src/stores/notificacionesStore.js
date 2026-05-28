import { defineStore } from "pinia";
import axios from "axios";
import { useAuthStore } from "./authStore";

const API = "http://localhost:3000/api";

function storageKey(userId) {
  return `notifications:lastSeen:${userId}`;
}

export const useNotificacionesStore = defineStore("notificaciones", {
  state: () => ({
    items: [],
    loading: false,
    lastSeenId: 0,
    initializedForUserId: null,
  }),
  getters: {
    unreadCount(state) {
      return state.items.filter((item) => Number(item.id) > Number(state.lastSeenId)).length;
    },
    latestUnread(state) {
      return state.items.find((item) => Number(item.id) > Number(state.lastSeenId)) || null;
    },
  },
  actions: {
    initializeForUser(userId, notifications = []) {
      if (!userId) return;

      this.items = notifications;
      this.initializedForUserId = Number(userId);

      const savedValue = Number(window.localStorage.getItem(storageKey(userId)) || 0);
      if (savedValue > 0) {
        this.lastSeenId = savedValue;
        return;
      }

      const latestId = Number(notifications[0]?.id || 0);
      this.lastSeenId = latestId;
      window.localStorage.setItem(storageKey(userId), String(latestId));
    },

    async fetchNotifications({ silent = false } = {}) {
      const authStore = useAuthStore();
      const userId = Number(authStore.user?.id);

      if (!userId) {
        this.items = [];
        this.lastSeenId = 0;
        this.initializedForUserId = null;
        return [];
      }

      if (!silent) {
        this.loading = true;
      }

      try {
        const previousIds = new Set(this.items.map((item) => Number(item.id)));
        const { data } = await axios.get(`${API}/notificaciones`, {
          withCredentials: true,
        });

        if (this.initializedForUserId !== userId) {
          this.initializeForUser(userId, data);
          return [];
        }

        this.items = data;
        return data.filter((item) => !previousIds.has(Number(item.id)));
      } finally {
        this.loading = false;
      }
    },

    markAllAsSeen() {
      const authStore = useAuthStore();
      const userId = Number(authStore.user?.id);
      if (!userId) return;

      const latestId = Number(this.items[0]?.id || 0);
      this.lastSeenId = latestId;
      window.localStorage.setItem(storageKey(userId), String(latestId));
    },
  },
});
