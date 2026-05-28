<template>
  <div class="detail-page-layout">
    <NavBar @toggle-drawer="drawerOpen = true" />
    <SideDrawer :open="drawerOpen" @close="drawerOpen = false" />

    <div v-if="!loading && plan" class="detail-scroll">
      <!-- Hero Image -->
      <div class="detail-hero">
        <img
          v-if="plan.foto"
          :src="plan.foto"
          :alt="plan.titulo"
          class="detail-hero-img"
        />
        <div v-else class="detail-hero-img detail-hero-placeholder">
          <span class="material-symbols-outlined" style="font-size:4rem">event</span>
        </div>
        <div class="detail-hero-overlay">
          <button class="detail-back-btn" @click="$router.back()">
            <span class="material-symbols-outlined">arrow_back</span>
          </button>
        </div>
      </div>

      <div class="detail-container">
        <!-- Info Card -->
        <div class="detail-info-card glass-panel">
          <span class="detail-badge">{{ plan.interes }}</span>
          <h1 class="detail-title">{{ plan.titulo }}</h1>

          <div class="detail-meta">
            <div class="detail-meta-item">
              <span class="material-symbols-outlined detail-meta-icon">calendar_today</span>
              <span>{{ formatDate(plan.fecha_plan) || 'Fecha por definir' }}</span>
            </div>
            <div class="detail-meta-item" v-if="plan.direccion">
              <span class="material-symbols-outlined detail-meta-icon">location_on</span>
              <span>{{ plan.direccion }}</span>
            </div>
            <div class="detail-meta-item" v-if="distanceLabel">
              <span class="material-symbols-outlined detail-meta-icon">near_me</span>
              <span>{{ distanceLabel }}</span>
            </div>
          </div>

          <!-- Spots & Capacity -->
          <div class="detail-spots-bar">
            <div class="detail-spots-stat">
              <span class="detail-spots-num">{{ spotsLeft }}</span>
              <span class="detail-spots-label">plazas libres</span>
            </div>
            <div class="detail-spots-divider"></div>
            <div class="detail-spots-stat">
              <span class="detail-spots-num">{{ plan.max_asistentes }}</span>
              <span class="detail-spots-label">total plazas</span>
            </div>
          </div>
        </div>

        <!-- Host Card -->
        <button
          class="detail-host-card card"
          :class="{ 'detail-host-clickable': !isOwnPlan }"
          type="button"
          @click="openHostProfile"
        >
          <div class="detail-host-avatar">{{ hostInitial }}</div>
          <div class="detail-host-info">
            <span class="detail-host-label">Organizado por</span>
            <span class="detail-host-name">{{ plan.host_nombre }}</span>
          </div>
          <span
            v-if="!isOwnPlan"
            class="material-symbols-outlined detail-host-arrow"
            >chevron_right</span
          >
        </button>

        <!-- Description -->
        <div class="detail-section">
          <h3 class="detail-section-title">Sobre este plan</h3>
          <p class="detail-desc">{{ plan.descripcion }}</p>
        </div>

        <!-- Map -->
        <div v-if="hasPlanLocation" class="detail-section">
          <h3 class="detail-section-title">Ubicación</h3>
          <div id="plan-detail-map" class="detail-map"></div>
        </div>

        <!-- Solicitudes (own plan) -->
        <div v-if="isOwnPlan" class="detail-section">
          <div class="detail-requests-head">
            <div>
              <h3 class="detail-section-title">Solicitudes</h3>
              <p class="text-muted text-sm">Gestiona quién puede unirse</p>
            </div>
            <span class="detail-requests-badge">{{ solicitudes.length }}</span>
          </div>

          <div v-if="loadingSolicitudes" class="loading-center">
            <div class="spinner"></div>
          </div>

          <div v-else-if="solicitudes.length === 0" class="empty-state">
            <span class="material-symbols-outlined empty-icon">inbox</span>
            <p>Todavía no tienes solicitudes.</p>
          </div>

          <div v-else class="detail-requests-list">
            <div
              v-for="solicitud in solicitudes"
              :key="solicitud.id"
              class="detail-request-item"
            >
              <div class="detail-request-user">
                <div class="detail-request-avatar">
                  {{ (solicitud.solicitante_nombre || "?")[0]?.toUpperCase() }}
                </div>
                <div class="detail-request-info">
                  <p class="detail-request-name">
                    {{ solicitud.solicitante_nombre || "Usuario" }}
                  </p>
                  <p class="detail-request-status">
                    <span class="detail-status-badge" :class="'status-' + solicitud.estado">
                      {{ solicitud.estado }}
                    </span>
                    · {{ formatRequestDate(solicitud.fecha_creacion) }}
                  </p>
                  <p v-if="solicitud.mensaje" class="detail-request-msg">
                    {{ solicitud.mensaje }}
                  </p>
                </div>
              </div>

              <div class="detail-request-actions" v-if="solicitud.estado === 'pendiente'">
                <button
                  class="btn btn-ghost btn-sm"
                  @click="updateSolicitud(solicitud.id, 'rechazada')"
                  :disabled="processingSolicitudId === solicitud.id"
                >
                  Rechazar
                </button>
                <button
                  class="btn btn-primary btn-sm"
                  @click="updateSolicitud(solicitud.id, 'aceptada')"
                  :disabled="processingSolicitudId === solicitud.id"
                >
                  {{ processingSolicitudId === solicitud.id ? '...' : 'Aceptar' }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Ratings -->
        <div v-if="showRatingsSection" class="detail-section detail-ratings">
          <h3 class="detail-section-title">Valoraciones</h3>

          <div class="detail-ratings-summary">
            <div class="detail-ratings-stars-row">
              <div class="detail-ratings-big">{{ averageRatingDisplay }}</div>
              <div class="detail-ratings-star-icons">
                <span
                  v-for="s in 5"
                  :key="s"
                  class="material-symbols-outlined detail-star"
                  :class="{ filled: s <= Math.round(averageRating) }"
                >star</span>
              </div>
            </div>
            <span class="text-muted text-sm">{{ ratingsCountText }}</span>
          </div>

          <div v-if="canRatePlan" class="detail-rating-form">
            <p class="text-sm text-muted">{{ ratingFormTitle }}</p>
            <div class="detail-rating-input">
              <button
                v-for="star in 5"
                :key="star"
                type="button"
                class="detail-rating-star-btn"
                :class="{ active: star <= ratingForm.puntuacion }"
                @click="ratingForm.puntuacion = star"
              >
                <span class="material-symbols-outlined">
                  {{ star <= ratingForm.puntuacion ? 'star' : 'star' }}
                </span>
              </button>
            </div>
            <textarea
              v-model="ratingForm.comentario"
              class="form-textarea"
              placeholder="Cuéntanos qué tal fue el plan"
              rows="2"
            ></textarea>
            <button
              class="btn btn-primary"
              :disabled="ratingSubmitting || !ratingForm.puntuacion"
              @click="submitRating"
            >
              {{ ratingSubmitting ? "Guardando..." : userRating ? "Actualizar" : "Enviar valoración" }}
            </button>
          </div>
        </div>
      </div>

      <!-- Bottom Action Bar -->
      <div class="detail-bottom-bar glass-panel">
        <button
          class="btn btn-primary detail-join-btn"
          :class="{ 'detail-join-disabled': isJoinDisabled }"
          @click="handleJoin"
          :disabled="joining || isJoinDisabled"
        >
          <span class="material-symbols-outlined" style="font-size:1.2rem">person_add</span>
          {{ joinButtonLabel }}
        </button>
      </div>
    </div>

    <div v-else class="loading-center detail-loading">
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
const ratingSubmitting = ref(false);
const ratingStatus = ref({ canRate: false, userRating: null, averageRating: null, ratingsCount: 0 });
const ratingForm = ref({ puntuacion: 0, comentario: "" });
let map = null;
let marker = null;

onMounted(async () => {
  try {
    if (!authStore.user && !authStore.isAuthenticated) {
      await authStore.checkAuth();
    }
    await Promise.all([loadPlan(), store.fetchMisPlanes(), loadUserCoords()]);
    await loadRatingStatus();
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
const occupiedSpots = computed(() => 1 + Number(plan.value?.spots_filled || 0));
const spotsLeft = computed(() => {
  const max = Number(plan.value?.max_asistentes || 8);
  return Math.max(0, max - occupiedSpots.value);
});
const isPlanFull = computed(() => spotsLeft.value <= 0);
const isPlanEnded = computed(() => {
  if (!plan.value?.fecha_plan) return false;
  return new Date(plan.value.fecha_plan) < new Date();
});
const isJoinDisabled = computed(
  () =>
    isOwnPlan.value ||
    isPlanEnded.value ||
    isPlanFull.value ||
    currentJoinStatus.value === "pendiente" ||
    currentJoinStatus.value === "aceptada"
);
const joinButtonLabel = computed(() => {
  if (isOwnPlan.value) return "Es tu plan";
  if (isPlanEnded.value) return "Plan finalizado";
  if (isPlanFull.value) return "Plan completo";
  if (currentJoinStatus.value === "aceptada") return "Ya estás dentro";
  if (currentJoinStatus.value === "pendiente") return "Solicitud enviada";
  return joining.value ? "Uniendo..." : "Unirme al plan";
});
const canRatePlan = computed(() => Boolean(ratingStatus.value?.canRate));
const userRating = computed(() => ratingStatus.value?.userRating || null);
const ratingsCount = computed(() => Number(ratingStatus.value?.ratingsCount || plan.value?.ratings_count || 0));
const averageRating = computed(() => Number(ratingStatus.value?.averageRating ?? plan.value?.average_rating ?? 0));
const averageRatingDisplay = computed(() => averageRating.value ? averageRating.value.toFixed(1) : "—");
const showRatingsSection = computed(() => isPlanEnded.value || ratingsCount.value > 0);
const ratingsCountText = computed(() => {
  if (!ratingsCount.value) return "Sé el primero en valorar";
  return `${ratingsCount.value} valoración${ratingsCount.value !== 1 ? "es" : ""}`;
});
const ratingFormTitle = computed(() =>
  userRating.value ? "Puedes actualizar tu valoración" : "Comparte tu experiencia"
);
const distanceLabel = computed(() =>
  formatDistanceKm(calculateDistanceKm(userCoords.value, { lat: plan.value?.lat, lng: plan.value?.lng }))
);

function openHostProfile() {
  if (isOwnPlan.value) { router.push("/perfil"); return; }
  const hostId = Number(plan.value?.host_id ?? plan.value?.id_usuario);
  if (hostId) router.push(`/perfil/${hostId}`);
}

async function handleJoin() {
  if (isJoinDisabled.value) {
    if (isOwnPlan.value) showToast("No puedes unirte a tu propio plan");
    else if (isPlanEnded.value) showToast("Este plan ya ha finalizado");
    else if (isPlanFull.value) showToast("Este plan está completo");
    else if (currentJoinStatus.value === "pendiente") showToast("Ya enviaste una solicitud");
    else if (currentJoinStatus.value === "aceptada") showToast("Ya formas parte de este plan");
    return;
  }
  joining.value = true;
  try {
    await store.quickJoin(plan.value.id);
    await store.fetchMisPlanes();
    showToast("¡Solicitud enviada!");
    setTimeout(() => router.push("/mis-planes"), 1500);
  } catch (e) {
    showToast(e?.response?.data?.message || "Error al solicitar");
  } finally {
    joining.value = false;
  }
}

async function loadPlan() {
  const { data } = await axios.get(`http://localhost:3000/api/planes/${route.params.id}`, { withCredentials: true });
  plan.value = data;
}

async function loadRatingStatus() {
  try {
    const data = await store.fetchRatingStatus(route.params.id);
    ratingStatus.value = data;
    if (data?.userRating) {
      ratingForm.value = { puntuacion: Number(data.userRating.puntuacion || 0), comentario: data.userRating.comentario || "" };
    }
  } catch (e) {
    ratingStatus.value = { canRate: false, userRating: null, averageRating: plan.value?.average_rating || null, ratingsCount: plan.value?.ratings_count || 0 };
  }
}

function initializeMap() {
  if (!hasPlanLocation.value || map) return;
  const el = document.getElementById("plan-detail-map");
  if (!el) return;
  const lat = Number(plan.value.lat);
  const lng = Number(plan.value.lng);
  map = L.map("plan-detail-map", { zoomControl: false, dragging: true, scrollWheelZoom: false }).setView([lat, lng], 14);
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19, attribution: "&copy; OpenStreetMap" }).addTo(map);
  marker = L.circleMarker([lat, lng], { radius: 8, fillColor: "#f43f5e", color: "#fff", weight: 2.5, fillOpacity: 0.9 }).addTo(map);
  setTimeout(() => map?.invalidateSize(), 200);
}

async function loadSolicitudes() {
  loadingSolicitudes.value = true;
  try {
    const { data } = await axios.get(`http://localhost:3000/api/solicitudes/plan/${route.params.id}`, { withCredentials: true });
    solicitudes.value = data;
  } finally { loadingSolicitudes.value = false; }
}

async function loadUserCoords() {
  try {
    const perfil = await authStore.fetchPerfil();
    if (perfil?.lat && perfil?.lng) userCoords.value = { lat: Number(perfil.lat), lng: Number(perfil.lng) };
  } catch (e) {}
}

async function updateSolicitud(id, estado) {
  processingSolicitudId.value = id;
  try {
    const { data } = await axios.put(`http://localhost:3000/api/solicitudes/${id}`, { estado }, { withCredentials: true });
    showToast(data.message);
    await Promise.all([loadPlan(), loadSolicitudes()]);
  } catch (e) {
    showToast(e?.response?.data?.message || "Error al actualizar");
  } finally { processingSolicitudId.value = null; }
}

async function submitRating() {
  if (!ratingForm.value.puntuacion) { showToast("Elige una puntuación"); return; }
  ratingSubmitting.value = true;
  try {
    await store.submitRating(route.params.id, { puntuacion: ratingForm.value.puntuacion, comentario: ratingForm.value.comentario });
    await Promise.all([loadPlan(), loadRatingStatus(), store.fetchMisPlanes()]);
    showToast("Valoración guardada");
  } catch (e) {
    showToast(e?.response?.data?.message || "Error al guardar");
  } finally { ratingSubmitting.value = false; }
}

function showToast(msg) { toast.value = msg; setTimeout(() => (toast.value = ""), 3000); }
function formatDate(d) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" });
}
function formatRequestDate(d) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("es-ES", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}
</script>

<style scoped>
.detail-page-layout {
  min-height: 100vh;
  background: var(--bg);
  display: flex;
  flex-direction: column;
}

.detail-scroll {
  flex: 1;
  overflow-y: auto;
  padding-top: 72px;
}

.detail-loading {
  height: 100vh;
}

/* Hero */
.detail-hero {
  position: relative;
  height: 38vh;
  min-height: 240px;
  width: 100%;
}

.detail-hero-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.detail-hero-placeholder {
  background: var(--primary-gradient);
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.7);
}

.detail-hero-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  padding: 1rem;
  padding-top: 1rem;
  background: linear-gradient(to bottom, rgba(15, 23, 42, 0.45) 0%, transparent 60%);
}

.detail-back-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(8px);
  border: none;
  color: #fff;
  cursor: pointer;
  transition: all 0.2s ease;
}

.detail-back-btn:hover {
  background: rgba(255, 255, 255, 0.4);
}

.detail-back-btn .material-symbols-outlined {
  font-size: 1.3rem;
}

/* Container */
.detail-container {
  max-width: 720px;
  margin: 0 auto;
  padding: 0 1.25rem 1rem;
  position: relative;
  z-index: 10;
}

/* Info Card */
.detail-info-card {
  margin-top: -48px;
  padding: 1.75rem 1.5rem;
  border-radius: var(--radius-xl);
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  margin-bottom: 1.25rem;
}

.detail-badge {
  display: inline-flex;
  align-self: flex-start;
  padding: 0.3rem 0.85rem;
  border-radius: var(--radius-pill);
  background: var(--primary-soft);
  color: var(--primary);
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.detail-title {
  font-size: 1.7rem;
  font-weight: 800;
  color: var(--text);
  line-height: 1.2;
  margin: 0;
}

.detail-meta {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

.detail-meta-item {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text);
}

.detail-meta-icon {
  font-size: 1.15rem;
  color: var(--primary);
  flex-shrink: 0;
}

/* Spots Bar */
.detail-spots-bar {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  padding: 1rem 1.25rem;
  background: rgba(244, 63, 94, 0.05);
  border-radius: var(--radius-md);
}

.detail-spots-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
}

.detail-spots-num {
  font-size: 1.6rem;
  font-weight: 800;
  color: var(--primary);
  line-height: 1;
}

.detail-spots-label {
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-top: 0.2rem;
}

.detail-spots-divider {
  width: 1px;
  height: 2.2rem;
  background: rgba(244, 63, 94, 0.15);
  flex-shrink: 0;
}

/* Host Card */
.detail-host-card {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 1rem 1.25rem;
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  width: 100%;
  text-align: left;
  margin-bottom: 1.25rem;
}

.detail-host-clickable {
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.detail-host-clickable:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.detail-host-avatar {
  width: 2.75rem;
  height: 2.75rem;
  border-radius: 50%;
  background: var(--primary-gradient);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 1.1rem;
  flex-shrink: 0;
}

.detail-host-info {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.detail-host-label {
  font-size: 0.7rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  font-weight: 700;
}

.detail-host-name {
  font-weight: 700;
  font-size: 1rem;
  color: var(--text);
}

.detail-host-arrow {
  color: var(--text-muted);
  font-size: 1.2rem;
}

/* Sections */
.detail-section {
  margin-bottom: 1.5rem;
}

.detail-section-title {
  font-size: 1rem;
  font-weight: 800;
  color: var(--text);
  margin-bottom: 0.75rem;
}

.detail-desc {
  line-height: 1.75;
  color: var(--dark-2);
  font-size: 0.95rem;
}

/* Map */
.detail-map {
  width: 100%;
  height: 240px;
  border-radius: var(--radius-lg);
  overflow: hidden;
  border: 1px solid var(--card-border);
}

/* Requests */
.detail-requests-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.detail-requests-badge {
  min-width: 1.75rem;
  height: 1.75rem;
  border-radius: 999px;
  background: var(--primary-soft);
  color: var(--primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 0.8rem;
}

.detail-requests-list {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.detail-request-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem 0;
  border-top: 1px solid var(--card-border);
}

.detail-request-item:first-child {
  border-top: none;
  padding-top: 0.25rem;
}

.detail-request-user {
  display: flex;
  gap: 0.75rem;
  flex: 1;
}

.detail-request-avatar {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background: var(--primary-soft);
  color: var(--primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 0.9rem;
  flex-shrink: 0;
}

.detail-request-info {
  flex: 1;
  min-width: 0;
}

.detail-request-name {
  font-weight: 700;
  color: var(--text);
  font-size: 0.9rem;
}

.detail-request-status {
  margin-top: 0.15rem;
  display: flex;
  align-items: center;
  gap: 0.35rem;
  color: var(--text-muted);
  font-size: 0.8rem;
}

.detail-status-badge {
  display: inline-block;
  padding: 0.1rem 0.5rem;
  border-radius: var(--radius-pill);
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: capitalize;
}

.status-pendiente {
  background: #fff3e0;
  color: #e65100;
}

.status-aceptada {
  background: #e8f5e9;
  color: #2e7d32;
}

.status-rechazada {
  background: #fbe9e7;
  color: #bf360c;
}

.detail-request-msg {
  margin-top: 0.4rem;
  color: var(--text);
  font-size: 0.85rem;
  line-height: 1.4;
}

.detail-request-actions {
  display: flex;
  gap: 0.5rem;
  flex-shrink: 0;
}

/* Ratings */
.detail-ratings {
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: var(--radius-lg);
  padding: 1.25rem 1.5rem;
}

.detail-ratings-summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.detail-ratings-stars-row {
  display: flex;
  align-items: center;
  gap: 0.65rem;
}

.detail-ratings-big {
  font-size: 2.2rem;
  font-weight: 800;
  color: var(--text);
  line-height: 1;
}

.detail-ratings-star-icons {
  display: flex;
  gap: 0.15rem;
}

.detail-star {
  font-size: 1.3rem;
  color: #e2e8f0;
  font-variation-settings: 'FILL' 0;
}

.detail-star.filled {
  color: #f59e0b;
  font-variation-settings: 'FILL' 1;
}

.detail-rating-form {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid var(--card-border);
}

.detail-rating-input {
  display: flex;
  gap: 0.4rem;
}

.detail-rating-star-btn {
  border: none;
  background: transparent;
  cursor: pointer;
  padding: 0;
  transition: transform 0.15s ease;
}

.detail-rating-star-btn:hover {
  transform: scale(1.12);
}

.detail-rating-star-btn .material-symbols-outlined {
  font-size: 2rem;
  color: #e2e8f0;
  font-variation-settings: 'FILL' 0;
}

.detail-rating-star-btn.active .material-symbols-outlined {
  color: #f59e0b;
  font-variation-settings: 'FILL' 1;
}

/* Bottom Bar */
.detail-bottom-bar {
  position: sticky;
  bottom: 0;
  padding: 1rem 1.25rem;
  display: flex;
  justify-content: center;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(12px);
  border-top: 1px solid rgba(244, 63, 94, 0.08);
  z-index: 50;
}

.detail-join-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.8rem 2.5rem;
  font-size: 1rem;
  font-weight: 700;
  width: 100%;
  max-width: 360px;
  justify-content: center;
}

.detail-join-disabled,
.detail-join-disabled:hover {
  background: #e2e8f0 !important;
  color: #94a3b8 !important;
  box-shadow: none !important;
  cursor: not-allowed;
  transform: none !important;
}

/* Shared */
.text-muted { color: var(--text-muted); }
.text-sm { font-size: 0.85rem; }

.toast {
  position: fixed;
  bottom: 5rem;
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

@media (max-width: 768px) {
  .detail-hero { height: 30vh; min-height: 200px; }
  .detail-container { padding: 0 1rem 1rem; }
  .detail-info-card { padding: 1.4rem 1.1rem; margin-top: -36px; }
  .detail-title { font-size: 1.4rem; }
  .detail-request-item { flex-direction: column; }
  .detail-request-actions { justify-content: flex-end; }
}

@media (max-width: 480px) {
  .detail-hero { height: 28vh; min-height: 180px; }
  .detail-info-card { padding: 1.2rem 1rem; margin-top: -28px; gap: 1rem; }
  .detail-spots-bar { padding: 0.85rem 1rem; gap: 1rem; }
  .detail-spots-num { font-size: 1.4rem; }
  .detail-map { height: 200px; }
}
</style>
