<template>
  <div class="page-layout vibrant-gradient">
    <NavBar @toggle-drawer="drawerOpen = true" />
    <SideDrawer :open="drawerOpen" @close="drawerOpen = false" />

    <main class="page-content px-6 lg-px-20 py-8">
      <div class="discover-header fade-in-up">
        <h1 class="discover-title">Hora de descubrir planes</h1>
      </div>

      <!-- Filters Section -->
      <div class="mb-8 filter-chips-wrap fade-in-up">
        <button
          class="filter-chip"
          :class="selectedCategoria === 'all' ? 'active-chip' : 'outline-chip'"
          @click="selectedCategoria = 'all'"
        >
          <span class="material-symbols-outlined text-lg">grid_view</span> Todas
        </button>
        <button
          class="filter-chip"
          :class="selectedCategoria === cat ? 'active-chip' : 'outline-chip'"
          v-for="cat in categorias"
          :key="cat"
          @click="filtrar(cat)"
        >
          {{ cat }}
        </button>
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
            v-for="plan in filteredPlanes"
            :key="plan.id"
            :plan="plan"
            @click="openPlan"
            @join="handleJoin"
          />
        </div>
        
        <!-- Load More -->
        <div class="flex justify-center mt-12 mb-20" v-if="filteredPlanes.length > 0">
          <button class="btn-load-more">
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
import { ref, computed, onMounted } from "vue";
import NavBar from "../components/NavBar.vue";
import SideDrawer from "../components/SideDrawer.vue";
import PlanCard from "../components/PlanCard.vue";
import { usePlanesStore } from "../stores/planesStore";
import { useRouter } from "vue-router";

const store = usePlanesStore();
const router = useRouter();
const drawerOpen = ref(false);
const toast = ref("");
const selectedCategoria = ref("all");

const planes = computed(() => store.planes);
const filteredPlanes = computed(() => {
  if (selectedCategoria.value === "all") return planes.value;
  return planes.value.filter((plan) => plan.categoria === selectedCategoria.value);
});

const categorias = computed(() => {
  const uniques = new Set(
    planes.value
      .map((plan) => plan.categoria)
      .filter(Boolean),
  );
  return Array.from(uniques);
});

onMounted(() => store.fetchPlanes());

function filtrar(categoria) {
  selectedCategoria.value = categoria;
}

function openPlan(plan) {
  router.push(`/planes/${plan.id}`);
}

async function handleJoin(plan) {
  try {
    await store.quickJoin(plan.id);
    showToast("✅ ¡Solicitud enviada!");
  } catch (e) {
    const msg = e?.response?.data?.message || "Error al solicitar";
    showToast("⚠️ " + msg);
  }
}

function showToast(msg) {
  toast.value = msg;
  setTimeout(() => (toast.value = ""), 3000);
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
.filter-chips-wrap {
  display: flex; flex-wrap: wrap; align-items: center; gap: 0.75rem; margin-bottom: 2rem;
}
.filter-chip {
  display: flex; align-items: center; gap: 0.5rem; border-radius: 9999px; padding: 0.5rem 1.25rem; font-size: 0.875rem; font-weight: 700; cursor: pointer; transition: all 0.2s;
  border: 2px solid transparent;
}
.active-chip {
  border-color: var(--primary); background: rgba(244, 63, 94, 0.1); color: var(--primary); box-shadow: 0 1px 2px 0 rgba(244, 63, 94, 0.1);
}
.outline-chip {
  border-color: #e2e8f0; background: #fff; color: #475569;
}
.outline-chip:hover { border-color: rgba(244, 63, 94, 0.3); }

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
