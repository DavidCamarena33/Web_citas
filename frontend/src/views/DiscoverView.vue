<template>
  <div class="page-layout vibrant-gradient">
    <NavBar @toggle-drawer="drawerOpen = true" />
    <SideDrawer :open="drawerOpen" @close="drawerOpen = false" />

    <div class="discover-layout">
      <!-- LEFT SIDEBAR -->
      <aside class="discover-sidebar">
        <div class="discover-header">
          <h1 class="discover-title">Hora de descubrir planes</h1>
        </div>

        <div class="filter-bar">
          <button
            class="filter-toggle"
            @click="filtersExpanded = !filtersExpanded"
          >
            <span class="material-symbols-outlined">tune</span>
            Filtros
            <span v-if="activeFilterCount > 0" class="filter-badge">{{
              activeFilterCount
            }}</span>
            <span
              class="material-symbols-outlined filter-chevron"
              :class="{ rotated: filtersExpanded }"
              >expand_more</span
            >
          </button>

          <div class="filter-body" :class="{ collapsed: !filtersExpanded }">
            <div class="filter-section">
              <span class="filter-section-label">Categoría</span>
              <div class="chip-row">
                <button
                  v-for="cat in categoriasConTodas"
                  :key="cat"
                  class="chip"
                  :class="{ 'chip-active': selectedCategoria === cat }"
                  @click="selectCategoria(cat)"
                >
                  {{ cat === "all" ? "Todas" : cat }}
                </button>
              </div>
            </div>

            <div class="filter-section">
              <span class="filter-section-label">Modalidad</span>
              <div class="segmented-control">
                <button
                  v-for="mode in modalidadOptions"
                  :key="mode.value"
                  class="segmented-option"
                  :class="{
                    'segmented-active': selectedModalidad === mode.value,
                  }"
                  @click="selectedModalidad = mode.value"
                >
                  {{ mode.label }}
                </button>
              </div>
            </div>

            <div class="filter-section">
              <span class="filter-section-label">Favoritos</span>
              <div class="chip-row">
                <button
                  class="chip chip-icon"
                  :class="{ 'chip-active': showFavoritesOnly }"
                  @click="showFavoritesOnly = !showFavoritesOnly"
                >
                  <span
                    class="material-symbols-outlined chip-icon-left"
                    :class="{ 'chip-icon-white': showFavoritesOnly }"
                    >favorite</span
                  >
                  {{ showFavoritesOnly ? 'Solo favs' : 'Solo favs' }}
                </button>
              </div>
            </div>

            <div class="filter-section" v-if="userCoords">
              <span class="filter-section-label">Distancia</span>
              <div class="chip-row">
                <button
                  v-for="opt in distanceOptions"
                  :key="opt.value"
                  class="chip chip-icon"
                  :class="{ 'chip-active': selectedRadio === opt.value }"
                  @click="selectRadio(opt.value)"
                >
                  <span
                    class="material-symbols-outlined chip-icon-left"
                    :class="{ 'chip-icon-white': selectedRadio === opt.value }"
                  >
                    {{ opt.value === null ? "public" : "near_me" }}
                  </span>
                  {{ opt.label }}
                </button>
              </div>
            </div>

            <div class="filter-section">
              <span class="filter-section-label">Fechas</span>
              <div class="date-range">
                <div class="date-input-wrap">
                  <span class="material-symbols-outlined date-icon"
                    >calendar_today</span
                  >
                  <input
                    type="date"
                    v-model="fechaDesde"
                    class="date-input"
                    :max="fechaHasta || undefined"
                  />
                  <button
                    v-if="fechaDesde"
                    class="date-clear"
                    @click="fechaDesde = ''"
                  >
                    &times;
                  </button>
                </div>
                <span class="date-separator">—</span>
                <div class="date-input-wrap">
                  <span class="material-symbols-outlined date-icon"
                    >calendar_today</span
                  >
                  <input
                    type="date"
                    v-model="fechaHasta"
                    class="date-input"
                    :min="fechaDesde || today"
                  />
                  <button
                    v-if="fechaHasta"
                    class="date-clear"
                    @click="fechaHasta = ''"
                  >
                    &times;
                  </button>
                </div>
                <button
                  v-if="fechaDesde || fechaHasta"
                  class="chip chip-reset"
                  @click="resetDates"
                >
                  Limpiar
                </button>
              </div>
            </div>
          </div>
        </div>

        <PlanMap
          :planes="mapPlanes"
          :highlighted-plan-id="hoveredPlanId"
          :user-coords="userCoords"
          @select-plan="openPlanById"
        />
      </aside>

      <!-- RIGHT MAIN -->
      <main class="discover-main">
        <div
          class="results-info fade-in-up"
          v-if="!store.loading && filteredPlanes.length > 0"
        >
          <span class="material-symbols-outlined" style="font-size: 1rem"
            >travel_explore</span
          >
          <span
            >{{ filteredPlanes.length }} plan{{
              filteredPlanes.length !== 1 ? "es" : ""
            }}
            encontrado{{ filteredPlanes.length !== 1 ? "s" : "" }}</span
          >
        </div>

        <div v-if="store.loading" class="loading-center">
          <div class="spinner"></div>
        </div>
        <div v-else-if="filteredPlanes.length === 0" class="empty-state">
          <span class="empty-icon material-symbols-outlined">search_off</span>
          <p>No hay planes para este filtro.</p>
        </div>
        <div v-else class="plans-grid">
          <PlanCard
            v-for="plan in visiblePlanes"
            :key="plan.id"
            :plan="plan"
            :join-status="plan.joinStatus"
            :is-favorite="favoritePlanIds.has(Number(plan.id))"
            @click="openPlan"
            @join="handleJoin"
            @toggle-favorite="handleToggleFavorite"
            @hover="(id) => (hoveredPlanId = id)"
          />
        </div>

        <div class="flex justify-center mt-12 mb-20" v-if="canLoadMore">
          <button class="btn-load-more" @click="loadMorePlanes">
            Ver más actividades
            <span class="material-symbols-outlined">expand_more</span>
          </button>
        </div>
      </main>
    </div>

    <!-- FAB -->
    <button
      class="fab"
      @click="$router.push('/crear-plan')"
      title="Crear plan"
    >
      add
    </button>

    <!-- Toast -->
    <Transition name="toast">
      <div v-if="toast" class="toast">{{ toast }}</div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import NavBar from "../components/NavBar.vue";
import SideDrawer from "../components/SideDrawer.vue";
import PlanCard from "../components/PlanCard.vue";
import PlanMap from "../components/PlanMap.vue";
import { usePlanesStore } from "../stores/planesStore";
import { useAuthStore } from "../stores/authStore";
import { useRouter } from "vue-router";
import { calculateDistanceKm, formatDistanceKm } from "../utils/location";

const store = usePlanesStore();
const authStore = useAuthStore();
const router = useRouter();
const drawerOpen = ref(false);
const toast = ref("");
const selectedCategoria = ref("all");
const selectedModalidad = ref(null);
const selectedRadio = ref(null);
const fechaDesde = ref("");
const fechaHasta = ref("");
const filtersExpanded = ref(true);
const hoveredPlanId = ref(null);
const showFavoritesOnly = ref(false);
const intereses = ref([]);
const userCoords = ref(null);
const PLANES_BATCH_SIZE = 6;
const visiblePlanesCount = ref(PLANES_BATCH_SIZE);

const today = computed(() => new Date().toISOString().split("T")[0]);

const activeFilterCount = computed(() => {
  let count = 0;
  if (selectedCategoria.value !== "all") count++;
  if (selectedModalidad.value !== null) count++;
  if (selectedRadio.value !== null) count++;
  if (fechaDesde.value) count++;
  if (fechaHasta.value) count++;
  if (showFavoritesOnly.value) count++;
  return count;
});

const distanceOptions = [
  { label: "5 km", value: 5 },
  { label: "10 km", value: 10 },
  { label: "25 km", value: 25 },
  { label: "50 km", value: 50 },
  { label: "100 km", value: 100 },
  { label: "Todo", value: null },
];

const modalidadOptions = [
  { label: "Pareja", value: "pareja" },
  { label: "Todos", value: null },
  { label: "Grupo", value: "grupo" },
];

const joinStatusByPlanId = computed(() => {
  const map = new Map();
  store.misPlanes.forEach((plan) => {
    if (plan.tipo === "hosting") return;
    map.set(plan.id, plan.tipo);
  });
  return map;
});

const planes = computed(() =>
  store.planes.map((plan) => ({
    ...plan,
    joinStatus: joinStatusByPlanId.value.get(plan.id) || "",
    distanceLabel: formatDistanceKm(
      calculateDistanceKm(userCoords.value, { lat: plan.lat, lng: plan.lng })
    ),
  }))
);

const favoritePlanIds = computed(
  () => new Set(store.favoritePlanIds.map((id) => Number(id)))
);

const filteredPlanes = computed(() => {
  let result = planes.value.filter((plan) => {
    const matchesCategoria =
      selectedCategoria.value === "all" ||
      plan.categoria === selectedCategoria.value;

    return matchesCategoria;
  });

  if (showFavoritesOnly.value) {
    result = result.filter((plan) => favoritePlanIds.value.has(Number(plan.id)));
  }

  return result;
});

const mapPlanes = computed(() =>
  filteredPlanes.value.map((p) => ({
    id: p.id,
    lat: p.lat,
    lng: p.lng,
    titulo: p.titulo,
    direccion: p.direccion || p.distanceLabel || "",
  }))
);

const visiblePlanes = computed(() =>
  filteredPlanes.value.slice(0, visiblePlanesCount.value)
);

const canLoadMore = computed(
  () => visiblePlanesCount.value < filteredPlanes.value.length
);

const categorias = computed(() => {
  const uniques = new Set(
    intereses.value.map((interes) => interes.categoria).filter(Boolean)
  );
  return Array.from(uniques);
});

const categoriasConTodas = computed(() => ["all", ...categorias.value]);

onMounted(async () => {
  const [allIntereses] = await Promise.all([
    store.getIntereses(),
    store.fetchMisPlanes(),
    store.fetchFavoritos(),
    loadUserContext(),
  ]);
  intereses.value = allIntereses;
});

watch([selectedCategoria, showFavoritesOnly], () => {
  visiblePlanesCount.value = PLANES_BATCH_SIZE;
});

watch(
  [selectedModalidad, selectedRadio, fechaDesde, fechaHasta],
  () => {
    visiblePlanesCount.value = PLANES_BATCH_SIZE;
    refetchPlanes();
  }
);

function selectCategoria(cat) {
  selectedCategoria.value = cat;
}

function selectRadio(value) {
  selectedRadio.value = value;
}

function resetDates() {
  fechaDesde.value = "";
  fechaHasta.value = "";
}

function filtrar(categoria) {
  selectedCategoria.value = categoria;
}

function loadMorePlanes() {
  visiblePlanesCount.value += PLANES_BATCH_SIZE;
}

function openPlan(plan) {
  router.push(`/planes/${plan.id}`);
}

function openPlanById(id) {
  router.push(`/planes/${id}`);
}

async function handleJoin(plan) {
  try {
    await store.quickJoin(plan.id);
    await store.fetchMisPlanes();
    showToast("✅ ¡Solicitud enviada!");
  } catch (e) {
    const msg = e?.response?.data?.message || "Error al solicitar";
    showToast("⚠️ " + msg);
  }
}

async function handleToggleFavorite(plan) {
  try {
    const result = await store.toggleFavorito(plan.id);
    showToast(
      result.favorite ? "❤ Guardado en favoritos" : "Se quitó de favoritos"
    );
  } catch (e) {
    const msg =
      e?.response?.data?.message || "No se pudo actualizar favorito";
    showToast("⚠️ " + msg);
  }
}

function showToast(msg) {
  toast.value = msg;
  setTimeout(() => (toast.value = ""), 3000);
}

async function refetchPlanes() {
  await store.fetchPlanes({
    modalidad: selectedModalidad.value,
    radio: selectedRadio.value,
    lat: userCoords.value?.lat || null,
    lng: userCoords.value?.lng || null,
    fecha_desde: fechaDesde.value || null,
    fecha_hasta: fechaHasta.value || null,
  });
}

async function loadUserContext() {
  try {
    const perfil = await authStore.fetchPerfil();
    if (perfil?.id && !authStore.user?.id) {
      authStore.user = {
        id: perfil.id,
        nombre: perfil.nombre,
        email: perfil.email,
      };
    }

    if (perfil?.lat && perfil?.lng) {
      userCoords.value = {
        lat: Number(perfil.lat),
        lng: Number(perfil.lng),
      };
    }

    await refetchPlanes();
  } catch (e) {
    await store.fetchPlanes({});
  }
}
</script>

<style scoped>
.vibrant-gradient {
  background: linear-gradient(135deg, #f8f5f6 0%, #ffeef1 50%, #fdf2f4 100%);
  min-height: 100vh;
}

.page-layout {
  height: 100vh;
  overflow: hidden;
}

/* ==========================================
   TWO-COLUMN LAYOUT
   ========================================== */
.discover-layout {
  display: grid;
  grid-template-columns: 35% 1fr;
  flex: 1;
  min-height: 0;
  overflow: hidden;
  padding-top: 76px;
}

.discover-sidebar {
  overflow-y: auto;
  overflow-x: hidden;
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  padding: 1.5rem 1.25rem 1.5rem 1.5rem;
  margin: 0.75rem 0 0.75rem 0.75rem;
  border-radius: var(--radius-lg);
  box-shadow: 0 4px 24px rgba(244, 63, 94, 0.06);
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.discover-main {
  overflow-y: auto;
  overflow-x: hidden;
  padding: 1.5rem 2rem 5rem;
}

.discover-sidebar::-webkit-scrollbar {
  width: 4px;
}

.discover-sidebar::-webkit-scrollbar-thumb {
  background: rgba(244, 63, 94, 0.15);
  border-radius: 4px;
}

/* ==========================================
   HEADER
   ========================================== */
.discover-header {
  flex-shrink: 0;
  margin-bottom: 0.25rem;
}

.discover-title {
  font-size: 1.4rem;
  padding: 0;
  line-height: 1.2;
  margin-bottom: 0.5rem;
}

/* ==========================================
   FILTER BAR (sidebar version)
   ========================================== */
.filter-bar {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-toggle {
  display: none;
}

.filter-body {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  overflow: hidden;
  max-height: 800px;
  opacity: 1;
  transition: max-height 0.4s cubic-bezier(0.25, 1, 0.5, 1),
    opacity 0.3s ease;
}

.filter-section {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.filter-section-label {
  font-size: 0.65rem;
  font-weight: 800;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.filter-section-label-optional {
  color: var(--text-light);
  font-weight: 600;
}

/* Chips */
.chip-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.chip {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.4rem 0.8rem;
  border-radius: var(--radius-pill);
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--text-muted);
  background: rgba(15, 23, 42, 0.04);
  border: 1.5px solid transparent;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.25, 1, 0.5, 1);
  white-space: nowrap;
  user-select: none;
}

.chip-icon {
  padding-left: 0.55rem;
}

.chip-icon-left {
  font-size: 0.9rem;
  color: var(--text-muted);
  transition: color 0.2s ease;
}

.chip-icon-white {
  color: #fff;
}

.chip:hover {
  background: var(--primary-soft);
  color: var(--primary);
  border-color: rgba(244, 63, 94, 0.2);
}

.chip:hover .chip-icon-left {
  color: var(--primary);
}

.chip-active {
  background: var(--primary-gradient);
  color: #fff;
  border-color: transparent;
  box-shadow: 0 4px 14px rgba(244, 63, 94, 0.3);
}

.chip-active:hover {
  background: var(--primary-gradient);
  color: #fff;
  border-color: transparent;
}

.chip-active:hover .chip-icon-left {
  color: #fff;
}

.chip-reset {
  background: transparent;
  color: var(--text-muted);
  font-size: 0.73rem;
  padding: 0.4rem 0.7rem;
}

.chip-reset:hover {
  background: rgba(239, 68, 68, 0.08);
  color: #ef4444;
  border-color: rgba(239, 68, 68, 0.2);
}

/* Segmented Control */
.segmented-control {
  display: inline-flex;
  background: rgba(15, 23, 42, 0.05);
  border-radius: var(--radius-pill);
  padding: 0.22rem;
  gap: 0.1rem;
  width: fit-content;
}

.segmented-option {
  padding: 0.4rem 0.85rem;
  border-radius: var(--radius-pill);
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--text-muted);
  background: transparent;
  border: none;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.25, 1, 0.5, 1);
  white-space: nowrap;
}

.segmented-option:hover:not(.segmented-active) {
  color: var(--text);
  background: rgba(255, 255, 255, 0.5);
}

.segmented-active {
  background: var(--primary-gradient);
  color: #fff;
  box-shadow: 0 4px 14px rgba(244, 63, 94, 0.3);
}

/* Date Range */
.date-range {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.4rem;
}

.date-input-wrap {
  position: relative;
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 120px;
}

.date-icon {
  position: absolute;
  left: 0.55rem;
  font-size: 0.9rem;
  color: var(--text-muted);
  pointer-events: none;
  z-index: 1;
}

.date-input {
  width: 100%;
  padding: 0.45rem 1.8rem 0.45rem 1.8rem;
  border-radius: var(--radius-pill);
  border: 1.5px solid rgba(15, 23, 42, 0.08);
  background: rgba(255, 255, 255, 0.7);
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--text);
  font-family: inherit;
  outline: none;
  transition: all 0.2s ease;
}

.date-input:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px var(--primary-soft);
}

.date-input::-webkit-calendar-picker-indicator {
  cursor: pointer;
  opacity: 0.5;
}

.date-clear {
  position: absolute;
  right: 0.3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.1rem;
  height: 1.1rem;
  border-radius: 50%;
  border: none;
  background: rgba(15, 23, 42, 0.08);
  color: var(--text-muted);
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.15s ease;
  line-height: 1;
  z-index: 2;
}

.date-clear:hover {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
}

.date-separator {
  color: var(--text-muted);
  font-weight: 600;
  font-size: 0.8rem;
}

/* Filter badge */
.filter-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1.25rem;
  height: 1.25rem;
  padding: 0 0.3rem;
  border-radius: var(--radius-pill);
  background: var(--primary-gradient);
  color: #fff;
  font-size: 0.6rem;
  font-weight: 800;
}

/* ==========================================
   RESULTS & GRID
   ========================================== */
.results-info {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin-bottom: 1rem;
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--text-muted);
}

.plans-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.25rem;
}

.flex {
  display: flex;
}

.justify-center {
  justify-content: center;
}

.mt-12 {
  margin-top: 3rem;
}

.mb-20 {
  margin-bottom: 5rem;
}

.btn-load-more {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 2rem;
  background: rgba(255, 255, 255, 0.4);
  color: var(--primary);
  font-weight: 800;
  border-radius: var(--radius-pill);
  border: 1px solid rgba(244, 63, 94, 0.2);
  transition: all var(--transition);
}

.btn-load-more:hover {
  background: rgba(255, 255, 255, 0.6);
}

/* ==========================================
   FAB & TOAST
   ========================================== */
.fab {
  font-family: "Material Symbols Outlined";
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 56px;
  height: 56px;
  background: var(--primary);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  border: none;
  box-shadow: var(--shadow-primary);
  cursor: pointer;
  transition: all var(--transition);
  z-index: 100;
}

.fab:hover {
  transform: scale(1.1);
}

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
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(16px);
}

/* ==========================================
   RESPONSIVE: Mobile & Tablet
   ========================================== */
@media (max-width: 1024px) {
  .discover-layout {
    grid-template-columns: 1fr;
    overflow: auto;
    padding-top: 76px;
  }

  .discover-sidebar {
    overflow-y: visible;
    border-bottom: 1px solid rgba(244, 63, 94, 0.08);
    padding: 1.25rem 1.25rem 1rem;
    margin: 0.5rem 0.5rem 0 0.5rem;
    border-radius: var(--radius-lg);
    gap: 0.75rem;
    flex-shrink: 0;
    background: rgba(255, 255, 255, 0.55);
    position: sticky;
    top: 76px;
    z-index: 10;
    max-height: 70vh;
    overflow-y: auto;
  }

  .discover-main {
    padding: 1.25rem 1.25rem 5rem;
    overflow-y: visible;
  }

  .plans-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }

  .discover-title {
    font-size: 1.25rem;
  }

  .filter-toggle {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0;
    background: transparent;
    border: none;
    font-size: 0.85rem;
    font-weight: 700;
    color: var(--text);
    cursor: pointer;
    transition: color 0.2s ease;
  }

  .filter-toggle:hover {
    color: var(--primary);
  }

  .filter-toggle .material-symbols-outlined {
    font-size: 1.2rem;
  }

  .filter-chevron {
    margin-left: auto;
    font-size: 1.2rem;
    transition: transform 0.3s cubic-bezier(0.25, 1, 0.5, 1);
  }

  .filter-chevron.rotated {
    transform: rotate(180deg);
  }

  .filter-body.collapsed {
    max-height: 0;
    opacity: 0;
    overflow: hidden;
  }
}

@media (max-width: 640px) {
  .discover-layout {
    padding-top: 68px;
  }

  .discover-sidebar {
    padding: 1rem 1rem 0.75rem;
    margin: 0.4rem 0.4rem 0 0.4rem;
    border-radius: var(--radius-md);
    gap: 0.5rem;
    max-height: 55vh;
    top: 68px;
  }

  .discover-main {
    padding: 1rem 1rem 5rem;
  }

  .plans-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
  }

  .filter-section-label {
    font-size: 0.6rem;
  }

  .chip {
    font-size: 0.72rem;
    padding: 0.35rem 0.65rem;
  }

  .segmented-option {
    font-size: 0.72rem;
    padding: 0.35rem 0.65rem;
  }

  .date-input {
    font-size: 0.72rem;
    padding: 0.4rem 1.6rem 0.4rem 1.7rem;
  }

  .date-icon {
    font-size: 0.8rem;
    left: 0.5rem;
  }
}
</style>
