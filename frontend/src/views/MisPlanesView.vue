<template>
  <div class="page-layout vibrant-gradient">
    <NavBar @toggle-drawer="drawerOpen = true" />
    <SideDrawer :open="drawerOpen" @close="drawerOpen = false" />

    <main class="page-content px-6 lg-px-20 py-8">
      <div class="container mx-auto">
        
        <!-- Header -->
        <div class="mb-10 flex flex-col md-row justify-between gap-4 fade-in-up">
          <div>
            <span class="section-label">Resumen</span>
            <h1 class="misplanes-title">Mis planes</h1>
            <p class="text-muted mt-2">Gestiona tus planes y sigue tus actividades próximas.</p>
          </div>
          <div class="flex gap-3">
            <button class="btn btn-ghost history-btn" @click="tab = 'past'">
              <span class="material-symbols-outlined">history</span> Historial
            </button>
            <button class="btn btn-primary shadow-primary" @click="$router.push('/crear-plan')">
              <span class="material-symbols-outlined">add_circle</span> Crear plan
            </button>
          </div>
        </div>

        <!-- 3 Stats Cards -->
        <div class="mb-10 grid-3 fade-in-up">
          <div class="stat-box">
            <div class="stat-icon bg-orange text-orange">
              <span class="material-symbols-outlined">calendar_month</span>
            </div>
            <div>
              <p class="stat-label">Próximos</p>
              <p class="stat-value">{{ totalUpcoming }} planes</p>
            </div>
          </div>
          <div class="stat-box">
            <div class="stat-icon bg-blue text-blue">
              <span class="material-symbols-outlined">hourglass_top</span>
            </div>
            <div>
              <p class="stat-label">Pendientes</p>
              <p class="stat-value">{{ totalPending }} solicitudes</p>
            </div>
          </div>
          <div class="stat-box">
            <div class="stat-icon bg-pink text-primary">
              <span class="material-symbols-outlined">volunteer_activism</span>
            </div>
            <div>
              <p class="stat-label">Organizando</p>
              <p class="stat-value">{{ totalHosting }} planes</p>
            </div>
          </div>
        </div>

        <!-- Tabs Underline -->
        <div class="mb-8 tabs-underline-container">
          <div class="tabs-row">
            <button class="tab-underline" :class="{ active: tab === 'upcoming' }" @click="tab = 'upcoming'">
              Próximos
            </button>
            <button class="tab-underline" :class="{ active: tab === 'hosting' }" @click="tab = 'hosting'">
              Organizando
            </button>
            <button class="tab-underline" :class="{ active: tab === 'pending' }" @click="tab = 'pending'">
              Pendientes
            </button>
            <button class="tab-underline" :class="{ active: tab === 'past' }" @click="tab = 'past'">
              Pasados
            </button>
          </div>
        </div>

        <div class="after-tabs-spacing">
          <!-- Loading -->
          <div v-if="loading" class="loading-center">
            <div class="spinner"></div>
          </div>

          <!-- Empty -->
          <div v-else-if="filteredPlanes.length === 0" class="empty-state">
            <span class="empty-icon material-symbols-outlined">search_off</span>
            <p>No hay planes en esta categoría.</p>
            <button class="btn btn-primary mt-4" @click="$router.push('/discover')">
              Explorar planes
            </button>
          </div>

          <!-- Plans List Horizontal -->
          <div v-else class="flex-col gap-6 fade-in-up">
            <div v-for="plan in filteredPlanes" :key="plan.id" class="horizontal-plan-card" @click="openPlan(plan)">
              <div class="h-img-wrap">
                <img v-if="plan.foto" :src="plan.foto" :alt="plan.titulo" class="h-img" />
                <div v-else class="h-img placeholder-img">
                  <span class="material-symbols-outlined text-4xl">join_inner</span>
                </div>
                <div class="spots-pill" v-if="plan.tipo !== 'pasado'">
                  <span class="text-primary">{{ spotsFilled(plan) }}</span> / {{ maxAsistentes(plan) }} plazas ocupadas
                </div>
              </div>

              <div class="h-body">
                <div class="flex-1">
                  <div class="h-meta-top">
                    <span class="badge" :class="tipoBadgeClass(plan.tipo)">
                      <span class="material-symbols-outlined mr-1" style="font-size: 14px;">{{ tipoIcon(plan.tipo) }}</span>
                      {{ tipoLabel(plan.tipo) }}
                    </span>
                    <span class="text-xs text-muted font-semibold">Creado recientemente</span>
                  </div>
                  
                  <h3 class="h-title">{{ plan.titulo }}</h3>
                  
                  <div class="h-meta-bottom">
                    <div class="flex items-center gap-1">
                      <span class="material-symbols-outlined text-base">calendar_today</span>
                      <span v-if="plan.fecha_plan">{{ formatDate(plan.fecha_plan) }}</span>
                      <span v-else>Fecha por fijar</span>
                    </div>
                    <div class="flex items-center gap-1" v-if="plan.direccion || plan.lat">
                      <span class="material-symbols-outlined text-base">location_on</span>
                      <span>{{ plan.direccion || 'Ubicación oculta' }}</span>
                    </div>
                  </div>
                </div>

                <!-- Actions on the right -->
                <div class="h-actions">
                  <button v-if="plan.tipo === 'hosting'" class="btn-manage" @click.stop="$router.push(`/planes/${plan.id}`)">
                    Gestionar solicitudes
                  </button>
                  <button v-else-if="plan.tipo === 'aceptada'" class="btn-chat" @click.stop="$router.push('/mensajes')">
                    <span class="material-symbols-outlined text-lg">chat</span> Chat
                  </button>
                  <button v-else-if="plan.tipo === 'pendiente'" class="btn-pending-action" disabled>
                    Solicitud enviada
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import NavBar from "../components/NavBar.vue";
import SideDrawer from "../components/SideDrawer.vue";
import { usePlanesStore } from "../stores/planesStore";

const store = usePlanesStore();
const router = useRouter();
const drawerOpen = ref(false);
const tab = ref("upcoming");
const loading = ref(false);

onMounted(async () => {
  loading.value = true;
  await store.fetchMisPlanes();
  loading.value = false;
});

const allPlanes = computed(() => store.misPlanes);

const filteredPlanes = computed(() => {
  const now = new Date();
  return allPlanes.value.filter((p) => {
    const fecha = p.fecha_plan ? new Date(p.fecha_plan) : null;
    if (tab.value === "hosting") return p.tipo === "hosting";
    if (tab.value === "pending") return p.tipo === "pendiente";
    if (tab.value === "past") return fecha && fecha < now;
    if (tab.value === "upcoming") return !fecha || fecha >= now;
    return true;
  });
});

const totalHosting = computed(() => allPlanes.value.filter((p) => p.tipo === "hosting").length);
const totalJoined = computed(() => allPlanes.value.filter((p) => p.tipo === "aceptada").length);
const totalPending = computed(() => allPlanes.value.filter((p) => p.tipo === "pendiente").length);
const totalUpcoming = computed(() => allPlanes.value.filter((p) => p.tipo !== 'pasado').length);

function spotsFilled(plan) {
  return plan.spots_filled || 0;
}
function maxAsistentes(plan) {
  return plan.max_asistentes || 8;
}

function openPlan(plan) {
  router.push(`/planes/${plan.id}`);
}

function tipoBadgeClass(tipo) {
  if (tipo === "hosting") return "badge-hosting text-purple-700 bg-purple-100";
  if (tipo === "aceptada") return "badge-confirmed text-emerald-700 bg-emerald-100";
  return "badge-pending text-amber-700 bg-amber-100";
}
function tipoLabel(tipo) {
  if (tipo === "hosting") return "Organizas";
  if (tipo === "aceptada") return "Aceptado";
  return "Pendiente";
}
function tipoIcon(tipo) {
  if (tipo === 'hosting') return 'star';
  if (tipo === 'aceptada') return 'check_circle';
  return 'hourglass_empty';
}
function formatDate(d) {
  return new Date(d).toLocaleDateString("es-ES", {
    weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
  });
}
</script>

<style scoped>
.vibrant-gradient {
  background: linear-gradient(135deg, #f8f5f6 0%, #ffeef1 50%, #fdf2f4 100%);
  min-height: 100vh;
}

.page-content.py-8 {
  padding-top: calc(76px + 2rem);
}

.mx-auto { max-width: 1200px; margin: 0 auto; }
.px-6 { padding-left: 1.5rem; padding-right: 1.5rem; }
.lg-px-20 { max-width: 1300px; margin: 0 auto; }
@media (min-width: 1024px) {
  .lg-px-20 { padding-left: 5rem; padding-right: 5rem; }
}
.py-8 { padding-top: 2rem; padding-bottom: 2rem; }

.flex-col { display: flex; flex-direction: column; }
.md-row { display: flex; flex-direction: column; }
@media (min-width: 768px) {
  .md-row { flex-direction: row; align-items: flex-end; }
}
.mb-10 { margin-bottom: 2.5rem; }
.mt-2 { margin-top: 0.5rem; }
.mt-4 { margin-top: 1rem; }
.gap-4 { gap: 1rem; }
.gap-6 { gap: 1.5rem; }

.history-btn {
  background: #fff; border: 1px solid var(--card-border);
}
.history-btn:hover {
  border-color: rgba(244, 63, 94, 0.3);
  color: var(--primary);
}

.misplanes-title {
  padding: 0.25rem 0;
}

/* 3 Stats Grid */
.grid-3 {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}
@media (min-width: 640px) { .grid-3 { grid-template-columns: repeat(3, 1fr); } }
.stat-box {
  background: #fff;
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  border: 1px solid var(--card-border);
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: var(--shadow-sm);
}
.stat-icon {
  width: 48px; height: 48px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
}
.bg-orange { background: #ffedd5; } .text-orange { color: #ea580c; }
.bg-blue { background: #dbeafe; } .text-blue { color: #2563eb; }
.bg-pink { background: #fce7f3; } 
.stat-label { font-size: 0.75rem; font-weight: 700; text-transform: uppercase; color: var(--text-light); letter-spacing: 0.05em; margin-bottom: 0.1rem; }
.stat-value { font-size: 1.5rem; font-weight: 900; color: var(--text); line-height: 1.1; }

/* Tabs Underline */
.tabs-underline-container {
  border-bottom: 1px solid var(--card-border);
  padding-top: 0.5rem;
}
.tabs-row {
  display: flex;
  gap: 1.5rem;
  padding: 0 0.25rem;
  flex-wrap: wrap;
}
.after-tabs-spacing {
  padding-top: 1rem;
}
.tab-underline {
  position: relative;
  padding-bottom: 1rem;
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--text-muted);
  background: transparent; border: none; cursor: pointer;
  transition: color var(--transition);
}
.tab-underline:hover { color: var(--text); }
.tab-underline.active { color: var(--primary); }
.tab-underline.active::after {
  content: ''; position: absolute; bottom: 0; left: 0; width: 100%; height: 2px;
  background: var(--primary);
}

/* Horizontal Plan Card */
.horizontal-plan-card {
  display: flex; flex-direction: column;
  background: #fff;
  border-radius: var(--radius-lg);
  border: 1px solid var(--card-border);
  padding: 1.25rem;
  gap: 1.5rem;
  box-shadow: var(--shadow-sm);
  cursor: pointer;
  transition: all var(--transition);
}
.horizontal-plan-card:hover {
  box-shadow: var(--shadow-md);
}
@media (min-width: 768px) {
  .horizontal-plan-card { flex-direction: row; align-items: center; }
}

.h-img-wrap {
  position: relative; width: 100%; height: 180px; flex-shrink: 0;
  border-radius: var(--radius-sm); overflow: hidden;
}
@media (min-width: 768px) {
  .h-img-wrap { width: 192px; height: 128px; }
}
.h-img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s ease; }
.placeholder-img {
  background: var(--primary-soft); color: var(--primary);
  display: flex; align-items: center; justify-content: center;
}
.horizontal-plan-card:hover .h-img { transform: scale(1.05); }

.spots-pill {
  position: absolute; top: 0.5rem; left: 0.5rem;
  background: rgba(255, 255, 255, 0.9); backdrop-filter: blur(4px);
  padding: 0.25rem 0.5rem; border-radius: var(--radius-sm);
  font-size: 0.75rem; font-weight: 700; color: var(--text);
  box-shadow: var(--shadow-sm);
}

.h-body {
  display: flex; flex: 1; flex-direction: column; gap: 1rem; justify-content: space-between;
}
@media (min-width: 768px) {
  .h-body { flex-direction: row; align-items: center; }
}

.h-meta-top { margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.75rem; }
.badge { display: inline-flex; align-items: center; padding: 0.1rem 0.6rem; border-radius: var(--radius-pill); font-size: 0.75rem; font-weight: 700; }
.bg-purple-100 { background: #f3e8ff; } .text-purple-700 { color: #7e22ce; }
.bg-emerald-100 { background: #d1fae5; } .text-emerald-700 { color: #047857; }
.bg-amber-100 { background: #fef3c7; } .text-amber-700 { color: #b45309; }

.h-title { font-size: 1.125rem; font-weight: 800; color: var(--text); }
.h-meta-bottom { margin-top: 0.25rem; display: flex; flex-wrap: wrap; gap: 1rem; font-size: 0.875rem; color: var(--text-muted); }

.h-actions { display: flex; flex-direction: column; gap: 0.75rem; width: 100%; }
@media (min-width: 768px) { .h-actions { width: 250px; align-items: flex-end; } }

.btn-manage {
  width: 100%; padding: 0.65rem 1rem; border-radius: var(--radius-sm);
  background: var(--primary); color: #fff; font-weight: 700; font-size: 0.875rem;
  border: none; box-shadow: var(--shadow-primary); transition: all 0.2s; cursor: pointer;
}
.btn-manage:hover { background: var(--primary-dark); }
.btn-chat {
  width: 100%; display: flex; align-items: center; justify-content: center; gap: 0.5rem;
  padding: 0.65rem 1rem; border-radius: var(--radius-sm); border: 2px solid var(--card-border);
  background: #fff; color: var(--text-muted); font-weight: 700; font-size: 0.875rem; transition: all 0.2s; cursor: pointer;
}
.btn-chat:hover { border-color: var(--primary-soft); background: var(--bg); }
.btn-pending-action {
  width: 100%; padding: 0.65rem 1rem; border-radius: var(--radius-sm);
  background: var(--bg); color: var(--text-light); font-weight: 700; font-size: 0.875rem;
  border: none; cursor: not-allowed;
}

</style>
