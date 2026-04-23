<template>
  <Teleport to="body">
    <Transition name="drawer">
      <div v-if="open" class="drawer-overlay" @click.self="$emit('close')">
        <div class="drawer-panel">
          <div class="drawer-header">
            <span class="drawer-logo">
              <span class="logo-icon">♥</span>
              <span>Link<strong>&Plan</strong></span>
            </span>
            <button class="btn-icon" @click="$emit('close')">✕</button>
          </div>

          <nav class="drawer-nav">
            <RouterLink
              to="/discover"
              class="drawer-link"
              @click="$emit('close')"
            >
              <span class="drawer-link-icon">🔍</span> Descubrir
            </RouterLink>
            <RouterLink
              to="/mis-planes"
              class="drawer-link"
              @click="$emit('close')"
            >
              <span class="drawer-link-icon">📋</span> Mis planes
            </RouterLink>
            <RouterLink
              to="/mensajes"
              class="drawer-link"
              @click="$emit('close')"
            >
              <span class="drawer-link-icon">💬</span> Mensajes
            </RouterLink>
            <RouterLink
              to="/comunidades"
              class="drawer-link"
              @click="$emit('close')"
            >
              <span class="drawer-link-icon">🏘️</span> Comunidades
            </RouterLink>
          </nav>

          <div class="drawer-footer">
            <RouterLink
              to="/perfil"
              class="drawer-profile-link"
              @click="$emit('close')"
            >
              <div class="avatar avatar-md drawer-avatar">
                <span>{{ initials }}</span>
              </div>
              <div>
                <div class="font-bold">{{ userName }}</div>
                <div class="text-sm text-muted">Ver perfil</div>
              </div>
            </RouterLink>
            <button class="btn btn-primary btn-sm drawer-logout-btn" @click="cerrarSesion">
              Cerrar sesion
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/authStore";

defineProps({ open: Boolean });
const emit = defineEmits(["close"]);

const auth = useAuthStore();
const router = useRouter();
const userName = computed(() => auth.user?.nombre || "Usuario");
const initials = computed(() => {
  const n = userName.value;
  return n
    .split(" ")
    .map((x) => x[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
});

onMounted(async () => {
  if (!auth.user && !auth.isAuthenticated) {
    await auth.checkAuth();
  }
});

async function cerrarSesion() {
  await auth.logout();
  emit("close");
  router.push("/login");
}
</script>

<style scoped>
.drawer-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: 500;
  display: flex;
  justify-content: flex-end;
}
.drawer-panel {
  width: min(340px, 90vw);
  height: 100%;
  background: var(--card-bg);
  display: flex;
  flex-direction: column;
  padding: 1.5rem;
  gap: 2rem;
  box-shadow: -8px 0 40px rgba(0, 0, 0, 0.15);
}
.drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.drawer-logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.2rem;
  font-weight: 600;
}
.logo-icon {
  width: 36px;
  height: 36px;
  background: var(--primary);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 0.95rem;
}
.drawer-logo strong {
  color: var(--primary);
}

.drawer-nav {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
}
.drawer-link {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.9rem 1rem;
  border-radius: var(--radius-md);
  font-size: 1.05rem;
  font-weight: 600;
  color: var(--text);
  transition: all var(--transition);
}
.drawer-link:hover,
.drawer-link.router-link-active {
  background: var(--primary-soft);
  color: var(--primary);
}
.drawer-link-icon {
  font-size: 1.2rem;
  width: 28px;
  text-align: center;
}

.drawer-footer {
  border-top: 1px solid var(--card-border);
  padding-top: 1.5rem;
}
.drawer-logout-btn {
  margin-top: 1rem;
  width: 100%;
  justify-content: center;
}
.drawer-profile-link {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  border-radius: var(--radius-md);
  transition: background var(--transition);
}
.drawer-profile-link:hover {
  background: var(--bg);
}
.drawer-avatar {
  background: var(--primary-soft);
  color: var(--primary);
}

/* Transition */
.drawer-enter-active,
.drawer-leave-active {
  transition: opacity 0.25s ease;
}
.drawer-enter-from,
.drawer-leave-to {
  opacity: 0;
}
.drawer-enter-active .drawer-panel,
.drawer-leave-active .drawer-panel {
  transition: transform 0.28s cubic-bezier(0.4, 0, 0.2, 1);
}
.drawer-enter-from .drawer-panel {
  transform: translateX(100%);
}
.drawer-leave-to .drawer-panel {
  transform: translateX(100%);
}
</style>
