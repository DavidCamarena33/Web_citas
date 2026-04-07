<template>
  <div class="page-layout vibrant-gradient">
    <NavBar @toggle-drawer="drawerOpen = true" />
    <SideDrawer :open="drawerOpen" @close="drawerOpen = false" />

    <main class="page-content px-6 lg-px-20 py-8">
      
      <!-- Featured Card Stack Section -->
      <section class="mb-12 fade-in-up">
        <div class="flex items-end justify-between mb-6">
          <div>
            <span class="text-xs font-bold uppercase tracking-widest text-primary">Today's Highlights</span>
            <h2 class="text-3xl font-black tracking-tight text-slate-900">Featured Experiences</h2>
          </div>
          <div class="flex gap-2">
            <button class="nav-arrow-btn">
              <span class="material-symbols-outlined">chevron_left</span>
            </button>
            <button class="nav-arrow-btn">
              <span class="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </div>

        <!-- Featured Grid (Top 3 Plans) -->
        <div class="grid grid-cols-1 md-grid-cols-2 lg-grid-cols-3 gap-8">
          <div v-for="plan in featuredPlanes" :key="'featured-'+plan.id" class="featured-card group" @click="openPlan(plan)">
            <div class="fc-img-wrap">
              <div class="fc-overlay"></div>
              <img v-if="plan.foto" :src="plan.foto" class="fc-img" />
              <div v-else class="fc-img" style="background:var(--primary-soft)"></div>
              <div class="fc-badge-wrap cursor-pointer" @click.stop="$emit('like')">
                <span class="fc-badge">{{ plan.categoria || 'Highlight' }}</span>
                <h3 class="fc-title">{{ plan.titulo }}</h3>
              </div>
            </div>
            
            <div class="fc-body">
              <div class="fc-avatar-overlap">
                <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuBptQoq_a2-6HT5SkUcsmrgTbsum47FGsjJEDXDnIhaPTkZGNC6yy4eZVWisi0odjVVSorev3wao81N9a7-QkRh6qc1BngdqRz4Bta54K2bCpRlfylCzJp-b7GPnUgXnFv9eBk-JiWXjAxKi4mA5Ux0nmrd_NaTG1l7hvjFn3dNuDLS6NXjjyit9XuBIhWnBwqq40H9Btvfo9lVnRjYrlZV38fIEynyKzwZz1Ux7ocYRv5-b3kjGoyqf5olCLp4LsFPNpGs_-lTjv8" class="fc-avatar" />
              </div>
              <div class="fc-location mb-2">
                <span class="material-symbols-outlined text-base">location_on</span>
                <p>{{ plan.direccion || 'Madrid' }} • {{ formatDate(plan.fecha_plan) }}</p>
              </div>
              <p class="fc-desc mb-6">{{ excerpt(plan.descripcion) }}</p>
              <div class="fc-actions mt-auto">
                <div class="fc-spots">
                  <span class="text-primary">{{ spotsLeft(plan) }} spots</span> left
                </div>
                <button class="fc-btn" @click.stop="handleJoin(plan)">Quick Join</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Filters Section -->
      <div class="mb-8 filter-chips-wrap fade-in-up">
        <button class="filter-chip active-chip">
          <span class="material-symbols-outlined text-lg">grid_view</span> All Activities
        </button>
        <button class="filter-chip outline-chip" v-for="cat in categorias" :key="cat.id" @click="filtrar(cat.id)">
          {{ cat.name }}
        </button>
        
        <button class="tune-btn">
          <span class="material-symbols-outlined">tune</span>
        </button>
      </div>

      <!-- Grid Feed -->
      <section class="fade-in-up">
        <div v-if="store.loading" class="loading-center">
          <div class="spinner"></div>
        </div>
        <div v-else-if="planes.length === 0" class="empty-state">
          <span class="empty-icon material-symbols-outlined">search_off</span>
          <p>No hay planes disponibles todavía.</p>
        </div>
        <div v-else class="plans-grid">
          <PlanCard
            v-for="plan in regularPlanes"
            :key="plan.id"
            :plan="plan"
            @click="openPlan"
            @join="handleJoin"
          />
        </div>
        
        <!-- Load More -->
        <div class="flex justify-center mt-12 mb-20" v-if="planes.length > 0">
          <button class="btn-load-more">
            Load More Activities
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

const planes = computed(() => store.planes);

const featuredPlanes = computed(() => {
  return planes.value.slice(0, 3);
});

const regularPlanes = computed(() => {
  return planes.value.slice(3);
});

const categorias = ref([
  { id: '1', name: 'Coffee & Brunch' },
  { id: '2', name: 'Nightlife' },
  { id: '3', name: 'Sports & Fitness' },
  { id: '4', name: 'Art & Culture' },
  { id: '5', name: 'Board Games' }
]);

onMounted(() => store.fetchPlanes());

function filtrar(id) {
  // logic to filter by category
  showToast("Filtrando planes...");
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

function excerpt(d) {
  return d && d.length > 120 ? d.slice(0, 120) + "…" : d || "";
}
function spotsLeft(plan) {
  return Math.max(0, 8 - (plan.spots_filled || 0));
}
function formatDate(d) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("es-ES", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}
</script>

<style scoped>
.vibrant-gradient {
  background: linear-gradient(135deg, #f8f5f6 0%, #ffeef1 50%, #fdf2f4 100%);
  min-height: 100vh;
}

.px-6 { padding-left: 1.5rem; padding-right: 1.5rem; }
.lg-px-20 { max-width: 1300px; margin: 0 auto; }
@media (min-width: 1024px) {
  .lg-px-20 { padding-left: 5rem; padding-right: 5rem; }
}
.py-8 { padding-top: 2rem; padding-bottom: 2rem; }

/* Featured Section Headers */
.mb-12 { margin-bottom: 3rem; }
.mb-6 { margin-bottom: 1.5rem; }
.flex { display: flex; }
.items-end { align-items: flex-end; }
.justify-between { justify-content: space-between; }
.gap-2 { gap: 0.5rem; }
.text-xs { font-size: 0.75rem; }
.font-bold { font-weight: 700; }
.uppercase { text-transform: uppercase; }
.tracking-widest { letter-spacing: 0.1em; }
.text-primary { color: var(--primary); }
.text-3xl { font-size: 1.875rem; line-height: 2.25rem; }
.font-black { font-weight: 900; }
.tracking-tight { letter-spacing: -0.025em; }
.text-slate-900 { color: #0f172a; }

.nav-arrow-btn {
  display: flex; align-items: center; justify-content: center;
  width: 2.5rem; height: 2.5rem; border-radius: 50%;
  background: #fff; color: #0f172a; box-shadow: var(--shadow-sm); border: none; cursor: pointer;
  transition: all 0.2s;
}
.nav-arrow-btn:hover { background: var(--primary); color: #fff; }

/* Featured Grid */
.grid { display: grid; }
.grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
.gap-8 { gap: 2rem; }
@media (min-width: 768px) { .md-grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (min-width: 1024px) { .lg-grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); } }

.featured-card {
  position: relative; display: flex; flex-direction: column; overflow: hidden;
  border-radius: 0.75rem; background: #fff; box-shadow: 0 20px 25px -5px rgba(244, 63, 94, 0.05);
  transition: transform 0.3s; cursor: pointer; border: 1px solid rgba(244,63,94,0.05);
}
.featured-card:hover { transform: translateY(-0.25rem); }

.fc-img-wrap { position: relative; height: 16rem; width: 100%; overflow: hidden; }
.fc-overlay { position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,0.6), transparent); z-index: 10; }
.fc-img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s; }
.featured-card:hover .fc-img { transform: scale(1.05); }

.fc-badge-wrap { position: absolute; bottom: 1rem; left: 1rem; color: #fff; z-index: 20; }
.fc-badge { display: inline-block; border-radius: 9999px; background: var(--primary); padding: 0.25rem 0.75rem; font-size: 0.625rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.5rem; }
.fc-title { font-size: 1.25rem; font-weight: 700; }

.fc-body { position: relative; display: flex; flex: 1; flex-direction: column; padding: 1.5rem; padding-top: 2.5rem; }
.fc-avatar-overlap { position: absolute; top: -2rem; left: 1.5rem; width: 4rem; height: 4rem; overflow: hidden; border-radius: 50%; border: 4px solid #fff; box-shadow: var(--shadow-md); z-index: 30; }
.fc-avatar { width: 100%; height: 100%; object-fit: cover; }

.fc-location { display: flex; align-items: center; gap: 0.5rem; font-size: 0.875rem; color: #64748b; }
.mb-2 { margin-bottom: 0.5rem; }
.mb-6 { margin-bottom: 1.5rem; }
.fc-desc { font-size: 0.875rem; line-height: 1.625; color: #475569; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }

.fc-actions { display: flex; align-items: center; justify-content: space-between; }
.mt-auto { margin-top: auto; }
.fc-spots { font-size: 0.875rem; font-weight: 500; color: #0f172a; }
.fc-btn { border-radius: 9999px; background: var(--primary); padding: 0.5rem 1.25rem; font-size: 0.75rem; font-weight: 700; color: #fff; box-shadow: 0 10px 15px -3px rgba(244, 63, 94, 0.2); border: none; cursor: pointer; transition: background 0.2s; }
.fc-btn:hover { background: var(--primary-dark); }

/* Filters Section (Chips) */
.filter-chips-wrap {
  display: flex; flex-wrap: wrap; align-items: center; gap: 0.75rem; margin-bottom: 2rem;
}
.filter-chip {
  display: flex; align-items: center; gap: 0.5rem; border-radius: 9999px; padding: 0.5rem 1.25rem; font-size: 0.875rem; font-weight: 500; cursor: pointer; transition: all 0.2s; border: none;
}
.active-chip {
  border: 2px solid var(--primary); background: rgba(244, 63, 94, 0.1); color: var(--primary); font-weight: 700; box-shadow: 0 1px 2px 0 rgba(244, 63, 94, 0.1);
}
.outline-chip {
  border: 1px solid #e2e8f0; background: #fff; color: #475569;
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
