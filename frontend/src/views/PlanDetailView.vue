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
            <div class="meta-item" v-if="distanceLabel">
              <span class="meta-icon">📏</span>
              <span class="meta-text">{{ distanceLabel }}</span>
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

        <div v-if="isOwnPlan" class="requests-section card">
          <div class="requests-header">
            <div>
              <h3>Solicitudes</h3>
              <p class="requests-subtitle">Gestiona quién puede unirse a tu plan</p>
            </div>
            <span class="requests-count">{{ solicitudes.length }}</span>
          </div>

          <div v-if="loadingSolicitudes" class="loading-center">
            <div class="spinner"></div>
          </div>

          <div v-else-if="solicitudes.length === 0" class="empty-state compact-empty">
            <span class="empty-icon">📭</span>
            <p>Todavía no tienes solicitudes para este plan.</p>
          </div>

          <div v-else class="requests-list">
            <div v-for="solicitud in solicitudes" :key="solicitud.id" class="request-item">
              <div class="request-main">
                <div class="request-avatar">
                  {{ (solicitud.solicitante_nombre || "?")[0]?.toUpperCase() }}
                </div>
                <div class="request-info">
                  <p class="request-name">{{ solicitud.solicitante_nombre || "Usuario" }}</p>
                  <p class="request-meta">
                    Estado: {{ solicitud.estado }} · {{ formatRequestDate(solicitud.fecha_creacion) }}
                  </p>
                  <p v-if="solicitud.mensaje" class="request-message">{{ solicitud.mensaje }}</p>
                </div>
              </div>

              <div class="request-actions">
                <button
                  class="btn btn-ghost btn-sm"
                  @click="updateSolicitud(solicitud.id, 'rechazada')"
                  :disabled="processingSolicitudId === solicitud.id || solicitud.estado === 'rechazada'"
                >
                  Rechazar
                </button>
                <button
                  class="btn btn-primary btn-sm"
                  @click="updateSolicitud(solicitud.id, 'aceptada')"
                  :disabled="processingSolicitudId === solicitud.id || solicitud.estado === 'aceptada'"
                >
                  {{ processingSolicitudId === solicitud.id ? 'Guardando...' : 'Aceptar' }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div v-if="hasPlanLocation" class="location-map-section card">
          <div class="section-head">
            <h3>Donde es el plan</h3>
            <p class="text-muted">Ubicacion aproximada del encuentro</p>
          </div>
          <div id="plan-detail-map" class="plan-detail-map"></div>
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
        <button class="btn btn-primary join-btn" :class="{ 'join-btn-disabled': isJoinDisabled }" @click="handleJoin" :disabled="joining || isJoinDisabled">
          {{ joinButtonLabel }}
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
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from "vue";
import { useRoute, useRouter } from "vue-router";
import axios from "axios";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import NavBar from "../components/NavBar.vue";
import SideDrawer from "../components/SideDrawer.vue";
import { usePlanesStore } from "../stores/planesStore";
import { useAuthStore } from "../stores/authStore";
import { calculateDistanceKm, formatDistanceKm } from "../utils/location";

const route = useRoute();
const router = useRouter();
const store = usePlanesStore();
const authStore = useAuthStore();

const drawerOpen = ref(false);
const plan = ref(null);
const loading = ref(true);
const joining = ref(false);
const toast = ref("");
const solicitudes = ref([]);
const loadingSolicitudes = ref(false);
const processingSolicitudId = ref(null);
const userCoords = ref(null);
let map = null;
let marker = null;

onMounted(async () => {
  try {
    if (!authStore.user && !authStore.isAuthenticated) {
      await authStore.checkAuth();
    }

    await Promise.all([loadPlan(), store.fetchMisPlanes(), loadUserCoords()]);
    if (isOwnPlan.value) {
      await loadSolicitudes();
    }
  } catch (err) {
    console.error(err);
    showToast("Error al cargar el plan");
  } finally {
    loading.value = false;
    await nextTick();
    initializeMap();
  }
});

onBeforeUnmount(() => {
  if (map) {
    map.remove();
    map = null;
    marker = null;
  }
});

const hostInitial = computed(() => (plan.value?.host_nombre || "?")[0].toUpperCase());
const hasPlanLocation = computed(() => Boolean(plan.value?.lat && plan.value?.lng));
const isOwnPlan = computed(() => {
  const currentUserId = Number(authStore.user?.id);
  const hostId = Number(plan.value?.host_id ?? plan.value?.id_usuario);

  if (!currentUserId || !hostId) return false;
  return currentUserId === hostId;
});
const currentJoinStatus = computed(() => {
  if (!plan.value?.id) return "";
  const existing = store.misPlanes.find((item) => item.id === plan.value.id);
  if (!existing || existing.tipo === "hosting") return "";
  return existing.tipo;
});
const isJoinDisabled = computed(() => {
  return (
    isOwnPlan.value ||
    currentJoinStatus.value === "pendiente" ||
    currentJoinStatus.value === "aceptada"
  );
});
const joinButtonLabel = computed(() => {
  if (isOwnPlan.value) return "Es tu plan";
  if (currentJoinStatus.value === "aceptada") return "Ya unido";
  if (currentJoinStatus.value === "pendiente") return "Solicitud enviada";
  return joining.value ? "Uniendo..." : "Unirme al plan";
});
const distanceLabel = computed(() =>
  formatDistanceKm(
    calculateDistanceKm(userCoords.value, {
      lat: plan.value?.lat,
      lng: plan.value?.lng,
    })
  )
);
const spotsLeft = computed(() => {
  const maxAsistentes = Number(plan.value?.max_asistentes || 8);
  const ocupadas = Number(plan.value?.spots_filled || 0);
  return Math.max(0, maxAsistentes - ocupadas);
});

async function handleJoin() {
  if (isJoinDisabled.value) {
    if (isOwnPlan.value) {
      showToast("⚠️ No puedes unirte a un plan creado por ti");
    } else if (currentJoinStatus.value === "pendiente") {
      showToast("⚠️ Ya has enviado una solicitud para este plan");
    } else if (currentJoinStatus.value === "aceptada") {
      showToast("⚠️ Ya formas parte de este plan");
    }
    return;
  }

  joining.value = true;
  try {
    await store.quickJoin(plan.value.id);
    await store.fetchMisPlanes();
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

async function loadPlan() {
  const { data } = await axios.get(`http://localhost:3000/api/planes/${route.params.id}`, {
    withCredentials: true,
  });
  plan.value = data;
}

function initializeMap() {
  if (!hasPlanLocation.value || map) return;

  const lat = Number(plan.value.lat);
  const lng = Number(plan.value.lng);

  map = L.map("plan-detail-map", {
    zoomControl: true,
    dragging: true,
    scrollWheelZoom: false,
  }).setView([lat, lng], 14);

  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "&copy; OpenStreetMap",
  }).addTo(map);

  marker = L.marker([lat, lng]).addTo(map);
  marker.bindPopup(plan.value.direccion || plan.value.titulo || "Ubicación del plan");

  setTimeout(() => {
    map?.invalidateSize();
  }, 200);
}

async function loadSolicitudes() {
  loadingSolicitudes.value = true;
  try {
    const { data } = await axios.get(`http://localhost:3000/api/solicitudes/plan/${route.params.id}`, {
      withCredentials: true,
    });
    solicitudes.value = data;
  } finally {
    loadingSolicitudes.value = false;
  }
}

async function loadUserCoords() {
  try {
    const perfil = await authStore.fetchPerfil();
    if (perfil?.lat && perfil?.lng) {
      userCoords.value = {
        lat: Number(perfil.lat),
        lng: Number(perfil.lng),
      };
    }
  } catch (e) {}
}

async function updateSolicitud(id, estado) {
  processingSolicitudId.value = id;
  try {
    const { data } = await axios.put(
      `http://localhost:3000/api/solicitudes/${id}`,
      { estado },
      { withCredentials: true }
    );
    showToast(`✅ ${data.message}`);
    await Promise.all([loadPlan(), loadSolicitudes()]);
  } catch (e) {
    const msg = e?.response?.data?.message || "Error al actualizar la solicitud";
    showToast("⚠️ " + msg);
  } finally {
    processingSolicitudId.value = null;
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

function formatRequestDate(d) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
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
.location-map-section {
  padding: 1.5rem;
}
.section-head {
  margin-bottom: 1rem;
}
.plan-detail-map {
  width: 100%;
  height: 280px;
  border-radius: var(--radius-lg);
  overflow: hidden;
  border: 1px solid var(--card-border);
}
.requests-section {
  padding: 1.5rem;
}
.requests-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1rem;
}
.requests-subtitle {
  margin-top: 0.25rem;
  color: var(--text-muted);
}
.requests-count {
  min-width: 2rem;
  height: 2rem;
  border-radius: 999px;
  background: rgba(244, 63, 94, 0.1);
  color: var(--primary);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
}
.requests-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.request-item {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 0;
  border-top: 1px solid var(--card-border);
}
.request-item:first-child {
  border-top: none;
  padding-top: 0.25rem;
}
.request-main {
  display: flex;
  gap: 0.875rem;
  flex: 1;
}
.request-avatar {
  width: 2.75rem;
  height: 2.75rem;
  border-radius: 50%;
  background: var(--primary-soft);
  color: var(--primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
}
.request-info {
  flex: 1;
}
.request-name {
  font-weight: 700;
  color: var(--text);
}
.request-meta {
  margin-top: 0.2rem;
  color: var(--text-muted);
  font-size: 0.9rem;
}
.request-message {
  margin-top: 0.5rem;
  color: var(--text);
  line-height: 1.5;
}
.request-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.compact-empty {
  padding: 1rem 0 0;
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
.join-btn-disabled,
.join-btn-disabled:hover {
  background: #e2e8f0 !important;
  color: #64748b !important;
  box-shadow: none !important;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .detail-header {
    height: 38vh;
  }

  .detail-content {
    margin-top: -36px;
    gap: 1rem;
  }

  .main-info-card,
  .host-section,
  .location-map-section,
  .requests-section {
    padding: 1.1rem;
  }

  .detail-title {
    font-size: 1.45rem;
  }

  .request-item {
    flex-direction: column;
  }

  .request-actions {
    justify-content: flex-end;
  }

  .bottom-action-bar {
    padding: 1rem;
    gap: 1rem;
  }

  .join-btn {
    padding: 0.8rem 1.2rem;
    font-size: 1rem;
  }
}

@media (max-width: 480px) {
  .detail-header {
    height: 32vh;
  }

  .plan-detail-map {
    height: 220px;
  }

  .detail-overlay {
    padding: 1rem;
    padding-top: calc(1rem + 72px);
  }

  .host-section {
    align-items: flex-start;
  }

  .bottom-action-bar {
    flex-direction: column;
    align-items: stretch;
  }

  .spots-info {
    text-align: center;
  }

  .request-actions {
    flex-direction: column;
  }

  .request-actions .btn {
    width: 100%;
  }
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
