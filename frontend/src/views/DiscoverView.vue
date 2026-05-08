<template>
  <div class="page-layout vibrant-gradient">
    <NavBar @toggle-drawer="drawerOpen = true" />
    <SideDrawer :open="drawerOpen" @close="drawerOpen = false" />

    <main class="page-content px-6 lg-px-20 py-8">
      <div class="discover-header fade-in-up">
        <h1 class="discover-title">Hora de descubrir planes</h1>
      </div>

      <!-- Filters Section -->
      <div class="discover-filters fade-in-up">
        <div class="category-filter">
          <label class="filter-label" for="category-filter">Tipo de plan</label>
          <div class="select-wrap">
            <select
              id="category-filter"
              v-model="selectedCategoria"
              class="filter-select"
            >
              <option value="all">Todas</option>
              <option v-for="cat in categorias" :key="cat" :value="cat">
                {{ cat }}
              </option>
            </select>
            <span class="select-icon material-symbols-outlined">expand_more</span>
          </div>
        </div>
      </div>

      <!-- Grid Feed -->
      <section class="fade-in-up">
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
          />
        </div>
        
        <!-- Load More -->
        <div class="flex justify-center mt-12 mb-20" v-if="canLoadMore">
          <button class="btn-load-more" @click="loadMorePlanes">
            Ver más actividades
            <span class="material-symbols-outlined">expand_more</span>
          </button>
        </div>
      </section>

    </main>
    <!-- FAB -->
    <button class="fab" @click="$router.push('/crear-plan')" title="Crear plan">
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
const intereses = ref([]);
const userCoords = ref(null);
const userGenero = ref("");
const userOrientacion = ref("all");
const PLANES_BATCH_SIZE = 6;
const visiblePlanesCount = ref(PLANES_BATCH_SIZE);

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
const filteredPlanes = computed(() => {
  return planes.value.filter((plan) => {
    const matchesCategoria =
      selectedCategoria.value === "all" || plan.categoria === selectedCategoria.value;
    const matchesOrientacion =
      userOrientacion.value === "all" ||
      normalizeOrientacion(plan.host_orientacion) === userOrientacion.value;
    const matchesGenero = matchesGeneroDeseado(plan.host_genero);

    return matchesCategoria && matchesOrientacion && matchesGenero;
  });
});
const visiblePlanes = computed(() =>
  filteredPlanes.value.slice(0, visiblePlanesCount.value)
);
const canLoadMore = computed(
  () => visiblePlanesCount.value < filteredPlanes.value.length
);
const favoritePlanIds = computed(
  () => new Set(store.favoritePlanIds.map((id) => Number(id)))
);

const categorias = computed(() => {
  const uniques = new Set(
    intereses.value
      .map((interes) => interes.categoria)
      .filter(Boolean),
  );
  return Array.from(uniques);
});

onMounted(async () => {
  const [allIntereses] = await Promise.all([
    store.getIntereses(),
    store.fetchMisPlanes(),
    store.fetchFavoritos(),
    loadUserContext(),
  ]);
  intereses.value = allIntereses;
});

watch(selectedCategoria, () => {
  visiblePlanesCount.value = PLANES_BATCH_SIZE;
});

function filtrar(categoria) {
  selectedCategoria.value = categoria;
}

function loadMorePlanes() {
  visiblePlanesCount.value += PLANES_BATCH_SIZE;
}

function openPlan(plan) {
  router.push(`/planes/${plan.id}`);
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
    showToast(result.favorite ? "❤ Guardado en favoritos" : "Se quitó de favoritos");
  } catch (e) {
    const msg = e?.response?.data?.message || "No se pudo actualizar favorito";
    showToast("⚠️ " + msg);
  }
}

function normalizeOrientacion(orientacion) {
  if (!orientacion) return "all";

  const normalized = String(orientacion).trim().toLowerCase();

  if (normalized === "homosexual" || normalized === "gay") return "gay";
  if (normalized === "heterosexual" || normalized === "hetero") return "hetero";
  if (normalized === "bisexual" || normalized === "bi") return "bi";

  return normalized;
}

function normalizeGenero(genero) {
  if (!genero) return "";
  return String(genero).trim().toLowerCase();
}

function matchesGeneroDeseado(hostGenero) {
  const generoUsuario = normalizeGenero(userGenero.value);
  const generoHost = normalizeGenero(hostGenero);

  if (!generoUsuario || !generoHost || userOrientacion.value === "all") return true;

  if (userOrientacion.value === "bi") {
    return true;
  }

  if (userOrientacion.value === "hetero") {
    return generoUsuario !== generoHost;
  }

  if (userOrientacion.value === "gay") {
    return generoUsuario === generoHost;
  }

  return true;
}

function showToast(msg) {
  toast.value = msg;
  setTimeout(() => (toast.value = ""), 3000);
}

async function loadUserContext() {
  try {
    const perfil = await authStore.fetchPerfil();
    const orientacionPerfil = perfil?.orientacion || "all";

    userGenero.value = normalizeGenero(perfil?.genero);
    userOrientacion.value = normalizeOrientacion(orientacionPerfil);

    if (perfil?.lat && perfil?.lng) {
      userCoords.value = {
        lat: Number(perfil.lat),
        lng: Number(perfil.lng),
      };
    }

    await store.fetchPlanes({
      orientacion: orientacionPerfil,
      modalidad: "pareja",
    });
  } catch (e) {
    await store.fetchPlanes({ modalidad: "pareja" });
  }
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

.px-6 { padding-left: 1.5rem; padding-right: 1.5rem; }
.lg-px-20 {
  max-width: 1300px;
  margin: 0 auto;
  padding-left: 1.5rem;
  padding-right: 1.5rem;
}
.py-8 { padding-top: 2rem; padding-bottom: 2rem; }

.flex { display: flex; }
.justify-between { justify-content: space-between; }

.discover-header {
  margin-bottom: 1.25rem;
}

.discover-title {
  padding: 0.25rem 0;
}

/* Filters Section (Chips) */
.discover-filters {
  display: flex;
  flex-wrap: wrap;
  align-items: end;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 2rem;
}
.category-filter,
.orientation-filter {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  min-width: 220px;
}

.filter-label {
  font-size: 0.8rem;
  font-weight: 700;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.select-wrap {
  position: relative;
  min-width: 220px;
}

.filter-select {
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  width: 100%;
  border: 1px solid rgba(244, 63, 94, 0.18);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(255, 244, 246, 0.98) 100%);
  color: #0f172a;
  border-radius: 1rem;
  padding: 0.95rem 3.2rem 0.95rem 1rem;
  font-size: 0.95rem;
  font-weight: 700;
  box-shadow:
    0 12px 30px rgba(15, 23, 42, 0.05),
    inset 0 1px 0 rgba(255, 255, 255, 0.75);
  transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
  cursor: pointer;
}

.filter-select:hover {
  border-color: rgba(244, 63, 94, 0.38);
  box-shadow:
    0 14px 34px rgba(244, 63, 94, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
}

.filter-select:focus {
  outline: none;
  border-color: rgba(244, 63, 94, 0.5);
  box-shadow:
    0 0 0 4px rgba(244, 63, 94, 0.12),
    0 12px 30px rgba(244, 63, 94, 0.09);
}

.select-icon {
  position: absolute;
  right: 0.85rem;
  top: 50%;
  transform: translateY(-50%);
  width: 2rem;
  height: 2rem;
  border-radius: 999px;
  background: rgba(244, 63, 94, 0.12);
  color: var(--primary);
  pointer-events: none;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tune-btn {
  margin-left: auto; display: flex; width: 2.5rem; height: 2.5rem; align-items: center; justify-content: center; border-radius: 50%; background: #fff; color: #475569; box-shadow: var(--shadow-sm); border: 1px solid #f1f5f9; cursor: pointer;
}

/* Grid */
.plans-grid {
  display: grid;
  grid-template-columns: repeat(1, minmax(0, 1fr));
  gap: 1.5rem;
}
@media (min-width: 640px) { .plans-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (min-width: 1024px) { .plans-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); } }
.mt-12 { margin-top: 3rem; }
.mb-20 { margin-bottom: 5rem; }
.flex { display: flex; }
.justify-center { justify-content: center; }

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

@media (max-width: 768px) {
  .discover-filters {
    align-items: stretch;
  }

  .category-filter,
  .orientation-filter {
    width: 100%;
    min-width: 0;
  }

  .page-content.py-8 {
    padding-top: calc(76px + 1.25rem);
    padding-bottom: 5.5rem;
  }
}

@media (max-width: 480px) {
  .px-6,
  .lg-px-20 {
    padding-left: 1rem;
    padding-right: 1rem;
  }
}

.fab {
  font-family: 'Material Symbols Outlined';
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 56px; height: 56px;
  background: var(--primary);
  color: white;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
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
.toast-leave-active {
  transition: all 0.3s ease;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(16px);
}
</style>
