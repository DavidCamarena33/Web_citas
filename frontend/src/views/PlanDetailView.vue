<template>
  <div class="page-layout detail-page">
    <NavBar @toggle-drawer="drawerOpen = true" />
    <SideDrawer :open="drawerOpen" @close="drawerOpen = false" />

    <main class="page-content" v-if="!loading && plan">
      <!-- Immersive Header -->
      <div class="detail-header">
        <img v-if="plan.foto" :src="plan.foto" :alt="plan.titulo" class="detail-img" />
        <div v-else class="detail-img placeholder-img">🗓️</div>
        <div class="detail-overlay">
          <button class="btn-icon back-btn" @click="$router.back()">←</button>
        </div>
      </div>

      <div class="container detail-content">
        <!-- Floating Info Card -->
        <div class="glass-panel main-info-card">
          <span class="badge badge-new">{{ plan.interes }}</span>
          <h1 class="detail-title">{{ plan.titulo }}</h1>
          
          <div class="detail-meta-row">
            <div class="meta-item">
              <span class="meta-icon">📍</span>
              <span class="meta-text">{{ plan.direccion || 'Ubicación oculta' }}</span>
            </div>
            <div class="meta-item" v-if="plan.fecha_plan">
              <span class="meta-icon">🗓️</span>
              <span class="meta-text">{{ formatDate(plan.fecha_plan) }}</span>
            </div>
          </div>
        </div>

        <!-- Host Info -->
        <div class="host-section card">
          <div class="avatar avatar-md">{{ hostInitial }}</div>
          <div class="host-details">
            <span class="host-label">Organizado por</span>
            <span class="host-name">{{ plan.host_nombre }}</span>
          </div>
        </div>

        <!-- Description -->
        <div class="description-section">
          <h3>Sobre este plan</h3>
          <p class="detail-desc">{{ plan.descripcion }}</p>
        </div>
      </div>

      <!-- Bottom Action Bar -->
      <div class="bottom-action-bar glass-panel">
        <div class="spots-info">
          <span class="spots-count">{{ spotsLeft }}</span>
          <span class="spots-label">plazas libres</span>
        </div>
        <button class="btn btn-primary join-btn" @click="handleJoin" :disabled="joining">
          {{ joining ? 'Uniendo...' : 'Unirme al plan' }}
        </button>
      </div>
    </main>

    <div v-else class="loading-center full-height">
      <div class="spinner"></div>
    </div>
    
    <!-- Toast -->
    <Transition name="toast">
      <div v-if="toast" class="toast">{{ toast }}</div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import axios from "axios";
import NavBar from "../components/NavBar.vue";
import SideDrawer from "../components/SideDrawer.vue";
import { usePlanesStore } from "../stores/planesStore";

const route = useRoute();
const router = useRouter();
const store = usePlanesStore();

const drawerOpen = ref(false);
const plan = ref(null);
const loading = ref(true);
const joining = ref(false);
const toast = ref("");

onMounted(async () => {
  try {
    const { data } = await axios.get(`http://localhost:3000/api/planes/${route.params.id}`);
    plan.value = data;
  } catch (err) {
    console.error(err);
    showToast("Error al cargar el plan");
  } finally {
    loading.value = false;
  }
});

const hostInitial = computed(() => (plan.value?.host_nombre || "?")[0].toUpperCase());
const spotsLeft = computed(() => {
  const maxAsistentes = Number(plan.value?.max_asistentes || 8);
  const ocupadas = Number(plan.value?.spots_filled || 0);
  return Math.max(0, maxAsistentes - ocupadas);
});

async function handleJoin() {
  joining.value = true;
  try {
    await store.quickJoin(plan.value.id);
    showToast("✅ ¡Solicitud enviada!");
    setTimeout(() => {
      router.push('/mis-planes');
    }, 1500);
  } catch (e) {
    const msg = e?.response?.data?.message || "Error al solicitar";
    showToast("⚠️ " + msg);
  } finally {
    joining.value = false;
  }
}

function showToast(msg) {
  toast.value = msg;
  setTimeout(() => (toast.value = ""), 3000);
}

function formatDate(d) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("es-ES", {
    weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit"
  });
}
</script>

<style scoped>
.page-layout.detail-page {
  padding-bottom: 100px; /* Space for action bar */
  background: var(--bg);
}
.page-content {
  padding-top: 0;
}

.detail-header {
  position: relative;
  height: 48vh;
  width: 100%;
}
.detail-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.placeholder-img {
  background: var(--primary-gradient);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 5rem;
}
.detail-overlay {
  position: absolute;
  top: 0; left: 0; right: 0;
  padding: 1.5rem;
  padding-top: calc(1.5rem + 72px);
  background: linear-gradient(to bottom, rgba(15,23,42,0.6), transparent);
}
.back-btn {
  background: rgba(255,255,255,0.2) !important;
  backdrop-filter: blur(8px);
  color: white !important;
  border: none !important;
}

.detail-content {
  margin-top: -60px;
  position: relative;
  z-index: 10;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.main-info-card {
  padding: 2rem;
  border-radius: var(--radius-xl);
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.detail-title {
  font-size: 1.8rem;
  font-weight: 800;
  color: var(--text);
  line-height: 1.2;
}

.detail-meta-row {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  margin-top: 0.5rem;
}
.meta-item {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}
.meta-icon {
  width: 36px;
  height: 36px;
  background: var(--card-bg);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-sm);
  font-size: 1.1rem;
}
.meta-text {
  font-weight: 600;
  color: var(--text);
}

.host-section {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.2rem 1.5rem;
}
.host-details {
  display: flex;
  flex-direction: column;
}
.host-label {
  font-size: 0.75rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 700;
}
.host-name {
  font-weight: 700;
  font-size: 1.1rem;
}

.description-section {
  padding: 1rem 0 2rem;
}
.description-section h3 {
  margin-bottom: 1rem;
}
.detail-desc {
  line-height: 1.8;
  color: var(--text);
  font-size: 1.05rem;
}

.bottom-action-bar {
  position: fixed;
  bottom: 0; left: 0; right: 0;
  background: rgba(255,255,255,0.9);
  padding: 1.2rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 -4px 20px rgba(0,0,0,0.06);
  z-index: 100;
}
.spots-info {
  display: flex;
  flex-direction: column;
}
.spots-count {
  font-size: 1.4rem;
  font-weight: 800;
  color: var(--primary);
  line-height: 1;
}
.spots-label {
  font-size: 0.8rem;
  color: var(--text-muted);
  font-weight: 600;
}
.join-btn {
  padding: 0.8rem 2rem;
  font-size: 1.1rem;
}

.full-height {
  height: 80vh;
}

/* Toast */
.toast {
  position: fixed;
  bottom: 6rem;
  left: 50%;
  transform: translateX(-50%);
  background: var(--dark);
  color: #fff;
  padding: 0.75rem 1.5rem;
  border-radius: var(--radius-pill);
  font-weight: 600;
  font-size: 0.9rem;
  z-index: 999;
  box-shadow: var(--shadow-lg);
}
.toast-enter-active,
.toast-leave-active { transition: all 0.3s ease; }
.toast-enter-from,
.toast-leave-to { opacity: 0; transform: translateX(-50%) translateY(16px); }
</style>
