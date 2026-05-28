<template>
  <nav class="navbar glass-header">
    <div class="navbar-inner px-6 lg-px-20">
      
      <!-- Group Left: Logo & Nav Links -->
      <div class="navbar-left">
        <!-- Logo -->
        <RouterLink to="/discover" class="navbar-logo">
          <div class="logo-box shadow-primary">
            <span class="material-symbols-outlined">favorite</span>
          </div>
          <h1 class="logo-text">Link&amp;Plan</h1>
        </RouterLink>

        <!-- Nav Links (desktop) -->
        <div class="navbar-links hidden-mobile">
          <RouterLink to="/discover" class="nav-link" active-class="nav-link-active">
            Descubrir
          </RouterLink>
          <RouterLink to="/mis-planes" class="nav-link" active-class="nav-link-active">
            Mis planes
          </RouterLink>
          <RouterLink to="/mensajes" class="nav-link" active-class="nav-link-active">
            Mensajes
          </RouterLink>
          <RouterLink to="/comunidades" class="nav-link" active-class="nav-link-active">
            Comunidades
          </RouterLink>
        </div>
      </div>

      <!-- Group Right: Search, Notifications, Avatar -->
      <div class="navbar-right">
        <!-- Search Bar (hidden on mobile) -->
        <div class="navbar-search hidden-mobile">
          <span class="search-icon material-symbols-outlined">search</span>
          <input 
            type="text" 
            placeholder="Buscar actividades..." 
            class="search-input"
          />
        </div>

        <div class="notifications-wrap hidden-mobile">
          <button
            class="nav-btn-icon shadow-sm notifications-btn"
            @click="toggleNotifications"
            :aria-expanded="notificationsOpen"
            aria-label="Abrir notificaciones"
          >
            <span class="material-symbols-outlined">notifications</span>
            <span v-if="notificationsStore.unreadCount" class="notification-badge">
              {{ notificationsStore.unreadCount > 9 ? "9+" : notificationsStore.unreadCount }}
            </span>
          </button>

          <div v-if="notificationsOpen" class="notifications-panel shadow-sm">
            <div class="notifications-head">
              <strong>Notificaciones</strong>
              <button
                v-if="notificationsStore.unreadCount"
                class="mark-read-btn"
                @click="markNotificationsAsSeen"
              >
                Marcar vistas
              </button>
            </div>

            <div v-if="notificationsStore.items.length === 0" class="notifications-empty">
              Aun no tienes notificaciones.
            </div>

            <button
              v-for="notification in notificationsStore.items"
              :key="notification.id"
              class="notification-item"
              :class="{ unread: isUnread(notification.id) }"
              @click="openNotification(notification)"
            >
              <p class="notification-title">{{ notificationTitle(notification) }}</p>
              <p class="notification-text">{{ notificationMessage(notification) }}</p>
              <span class="notification-date">{{ formatNotificationDate(notification.fecha_creacion) }}</span>
            </button>
          </div>
        </div>

        <button class="btn btn-ghost btn-sm hidden-mobile logout-btn" @click="cerrarSesion">
          Cerrar sesion
        </button>

        <!-- Avatar -->
        <RouterLink to="/perfil">
          <div class="avatar navbar-avatar shadow-sm border-white"></div>
        </RouterLink>
        
        <!-- Mobile menu toggle -->
        <button class="hamburger-btn mobile-only" @click="$emit('toggle-drawer')">
          <span class="material-symbols-outlined">menu</span>
        </button>
      </div>
      
    </div>
  </nav>

  <Transition name="toast">
    <div v-if="toastMessage" class="nav-toast">{{ toastMessage }}</div>
  </Transition>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/authStore";
import { useNotificacionesStore } from "../stores/notificacionesStore";

defineEmits(["toggle-drawer", "notification"]);

const auth = useAuthStore();
const notificationsStore = useNotificacionesStore();
const router = useRouter();
const notificationsOpen = ref(false);
const toastMessage = ref("");
let pollingId = null;
let toastTimeoutId = null;

onMounted(async () => {
  if (!auth.user && !auth.isAuthenticated) {
    await auth.checkAuth();
  }

  if (!auth.isAuthenticated) return;

  await notificationsStore.fetchNotifications();
  pollingId = window.setInterval(async () => {
    const freshNotifications = await notificationsStore.fetchNotifications({ silent: true });
    const latestRelevant = freshNotifications.find((item) =>
      item.tipo === "aceptada" || item.tipo === "rechazada"
    );

    if (latestRelevant) {
      showToast(notificationMessage(latestRelevant));
    }
  }, 10000);
});

onBeforeUnmount(() => {
  if (pollingId) {
    window.clearInterval(pollingId);
  }
  if (toastTimeoutId) {
    window.clearTimeout(toastTimeoutId);
  }
});

async function cerrarSesion() {
  await auth.logout();
  router.push("/login");
}

function toggleNotifications() {
  notificationsOpen.value = !notificationsOpen.value;
  if (notificationsOpen.value) {
    markNotificationsAsSeen();
  }
}

function markNotificationsAsSeen() {
  notificationsStore.markAllAsSeen();
}

function isUnread(notificationId) {
  return Number(notificationId) > Number(notificationsStore.lastSeenId);
}

function openNotification(notification) {
  markNotificationsAsSeen();
  notificationsOpen.value = false;

  if (notification?.id_plan) {
    router.push(`/planes/${notification.id_plan}`);
  }
}

function notificationTitle(notification) {
  if (notification.tipo === "aceptada") {
    return "Tu solicitud fue aceptada";
  }
  if (notification.tipo === "rechazada") {
    return "Tu solicitud no fue aceptada";
  }
  return "Nueva solicitud recibida";
}

function notificationMessage(notification) {
  if (notification.tipo === "aceptada") {
    return `${notification.host_nombre} te ha aceptado en "${notification.plan_titulo}".`;
  }
  if (notification.tipo === "rechazada") {
    return `${notification.host_nombre} ha rechazado tu solicitud para "${notification.plan_titulo}".`;
  }
  return `${notification.solicitante_nombre} quiere unirse a "${notification.plan_titulo}".`;
}

function formatNotificationDate(date) {
  if (!date) return "";
  return new Date(date).toLocaleString("es-ES", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function showToast(message) {
  toastMessage.value = message;
  if (toastTimeoutId) {
    window.clearTimeout(toastTimeoutId);
  }
  toastTimeoutId = window.setTimeout(() => {
    toastMessage.value = "";
  }, 3500);
}
</script>

<style scoped>
.glass-header {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 200;
  border-bottom: 1px solid rgba(244, 63, 94, 0.1); /* primary/10 */
  box-shadow: none;
}
.px-6 { padding-left: 1.5rem; padding-right: 1.5rem; }
.lg-px-20 { max-width: 1300px; margin: 0 auto; }
@media (min-width: 1024px) {
  .lg-px-20 { padding-left: 5rem; padding-right: 5rem; }
}

.navbar-inner {
  height: 76px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

/* LEFT SIDE */
.navbar-left {
  display: flex;
  align-items: center;
  gap: 2.5rem;
}
.navbar-logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--primary);
  text-decoration: none;
}
.logo-box {
  display: flex; align-items: center; justify-content: center;
  width: 40px; height: 40px; border-radius: 12px;
  background: var(--primary); color: #fff;
}
.shadow-primary {
  box-shadow: 0 4px 14px 0 rgba(244, 63, 94, 0.39);
}
.logo-text {
  color: var(--text);
  font-size: 1.25rem;
  font-weight: 900;
  letter-spacing: -0.02em;
}

.navbar-links {
  display: flex;
  align-items: center;
  gap: 2rem;
}
.nav-link {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-muted);
  transition: color var(--transition);
  text-decoration: none;
}
.nav-link:hover {
  color: var(--primary);
}
.nav-link-active {
  color: var(--primary);
}

/* RIGHT SIDE */
.navbar-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}
/* SEARCH */
.navbar-search {
  position: relative;
  width: 256px;
}
.search-icon {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8; /* slate-400 */
}
.search-input {
  width: 100%;
  padding: 0.5rem 1rem 0.5rem 2.5rem;
  background: rgba(244, 63, 94, 0.05); /* primary/5 */
  border: none;
  border-radius: var(--radius-pill);
  color: var(--text);
  font-size: 0.875rem;
  transition: all var(--transition);
}
.search-input:focus {
  background: #fff;
  outline: none;
  box-shadow: 0 0 0 2px rgba(244, 63, 94, 0.2);
}
.search-input::placeholder {
  color: #94a3b8;
}

.nav-btn-icon {
  display: flex; align-items: center; justify-content: center;
  width: 40px; height: 40px; border-radius: 50%;
  background: #fff; border: 1px solid var(--card-border);
  color: var(--text-muted); cursor: pointer;
}
.nav-btn-icon:hover { color: var(--primary); }
.notifications-wrap {
  position: relative;
}
.notifications-btn {
  position: relative;
}
.notification-badge {
  position: absolute;
  top: -4px;
  right: -2px;
  min-width: 18px;
  height: 18px;
  padding: 0 0.3rem;
  border-radius: 999px;
  background: var(--primary);
  color: #fff;
  font-size: 0.7rem;
  font-weight: 700;
  line-height: 18px;
}
.notifications-panel {
  position: absolute;
  top: calc(100% + 0.75rem);
  right: 0;
  width: 360px;
  max-height: 420px;
  overflow-y: auto;
  padding: 0.85rem;
  border: 1px solid var(--card-border);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.98);
  box-shadow: 0 20px 50px rgba(15, 23, 42, 0.12);
}
.notifications-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.85rem;
}
.mark-read-btn {
  border: none;
  background: none;
  color: var(--primary);
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
}
.notifications-empty {
  padding: 1rem 0.35rem;
  color: var(--text-muted);
  font-size: 0.92rem;
}
.notification-item {
  width: 100%;
  display: block;
  text-align: left;
  padding: 0.85rem;
  margin-bottom: 0.65rem;
  border: 1px solid rgba(226, 232, 240, 0.85);
  border-radius: 14px;
  background: #fff;
  cursor: pointer;
}
.notification-item:last-child {
  margin-bottom: 0;
}
.notification-item.unread {
  border-color: rgba(244, 63, 94, 0.35);
  background: rgba(255, 241, 242, 0.78);
}
.notification-title {
  margin: 0 0 0.3rem;
  color: var(--text);
  font-weight: 700;
  font-size: 0.92rem;
}
.notification-text {
  margin: 0;
  color: var(--text-muted);
  font-size: 0.87rem;
  line-height: 1.4;
}
.notification-date {
  display: inline-block;
  margin-top: 0.45rem;
  color: #94a3b8;
  font-size: 0.78rem;
}
.logout-btn {
  white-space: nowrap;
}

/* AVATAR */

.navbar-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid rgba(244, 63, 94, 0.2);
  background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuCgfth6u_0d3-W-XESicQ_idDCOqXEA1eBOG_D5myo900SMUOOdWtROCb-DzuZCKN8nHzrfWP8jHGNPRoendRUHNw-g0_2ZZL0DgynghxRf2qOcM3jXJnCBW5oL_4nFUfNS7u3rp-fLe_0-sTSqaaF7OjZ-UvXsXx8rd2QOOjKo7UgUi6taPLUXgO-cztHyaeIzJ5A8zdVW7rR1OpskXIHGVRj7PC_RK_QBuM9fwbmH3ISUL0gBIMxUhKJnUyBtcHnIe6e1U5dvFFs');
  background-size: cover;
  background-position: center;
}

.mobile-only {
  display: none;
}
.hamburger-btn {
  background: none;
  border: none;
  color: var(--text);
  font-size: 1.5rem;
  cursor: pointer;
}

@media (max-width: 1023px) {
  .hidden-mobile {
    display: none !important;
  }
  .mobile-only {
    display: block;
  }
}

.nav-toast {
  position: fixed;
  top: 96px;
  right: 24px;
  z-index: 260;
  max-width: 320px;
  padding: 0.95rem 1.1rem;
  border-radius: 16px;
  background: rgba(15, 23, 42, 0.92);
  color: #fff;
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.28);
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.25s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
