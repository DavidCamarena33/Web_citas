<template>
  <div class="page-layout">
    <NavBar @toggle-drawer="drawerOpen = true" />
    <SideDrawer :open="drawerOpen" @close="drawerOpen = false" />

    <main class="page-content">
      <div class="container comunidades-container">
        <div class="comunidades-header fade-in-up">
          <h1>Comunidades</h1>
          <p class="text-muted">Descubre planes por categoría de interés</p>
        </div>

        <!-- Filters -->
        <div class="tabs fade-in-up">
          <button
            class="tab"
            :class="{ active: filtro === 'all' }"
            @click="filtro = 'all'"
          >
            Todas
          </button>
          <button
            v-for="tab in categoryTabs"
            :key="tab.key"
            class="tab"
            :class="{ active: filtro === tab.key }"
            @click="filtro = tab.key"
          >
            {{ tab.label }}
          </button>
        </div>

        <div v-if="loading" class="loading-center">
          <div class="spinner"></div>
        </div>

        <!-- Category Cards -->
        <div v-else class="comunidades-grid fade-in-up">
          <div
            v-for="cat in filteredCats"
            :key="cat.categoria"
            class="comunidad-card card"
            @click="selectCat(cat)"
          >
            <div
              class="comunidad-img"
              :style="{ background: catGradient(cat.categoria) }"
            >
              <span class="comunidad-emoji">{{ catEmoji(cat.categoria) }}</span>
            </div>
            <div class="comunidad-body">
              <h3>{{ cat.categoria }}</h3>
              <p class="text-sm text-muted">
                {{ cat.count }} intereses ·
                {{ planesCount(cat.categoria) }} planes
              </p>
              <div class="comunidad-tags">
                <span
                  v-for="i in cat.intereses.slice(0, 3)"
                  :key="i.id"
                  class="badge badge-new text-xs"
                  >{{ i.nombre }}</span
                >
                <span v-if="cat.intereses.length > 3" class="text-xs text-muted"
                  >+{{ cat.intereses.length - 3 }} más</span
                >
              </div>
            </div>
          </div>
        </div>

        <!-- Selected category plans -->
        <div
          v-if="selectedCat"
          ref="planesSection"
          class="cat-plans-section fade-in-up"
        >
          <div class="cat-plans-header">
            <h2>Planes de {{ selectedCat }}</h2>
            <button class="btn btn-ghost btn-sm" @click="selectedCat = null">
              ✕
            </button>
          </div>
          <div v-if="catPlanes.length === 0" class="empty-state">
            <span class="empty-icon">🗓️</span>
            <p>Sin planes en esta categoría aún.</p>
            <button
              class="btn btn-primary"
              @click="$router.push('/crear-plan')"
            >
              Crear plan
            </button>
          </div>
          <div v-else class="plans-grid">
            <PlanCard
              v-for="plan in visibleCatPlanes"
              :key="plan.id"
              :plan="plan"
              :join-status="plan.joinStatus"
              @click="$router.push(`/planes/${plan.id}`)"
              @join="handleJoin"
            />
          </div>
          <div
            v-if="canLoadMoreCatPlanes"
            class="flex justify-center mt-12 mb-20"
          >
            <button class="btn-load-more" @click="loadMoreCatPlanes">
              Ver más actividades
              <span class="material-symbols-outlined">expand_more</span>
            </button>
          </div>
        </div>
      </div>
    </main>
    <button class="fab" @click="$router.push('/crear-plan')">+</button>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from "vue";
import NavBar from "../components/NavBar.vue";
import SideDrawer from "../components/SideDrawer.vue";
import PlanCard from "../components/PlanCard.vue";
import axios from "axios";
import { usePlanesStore } from "../stores/planesStore";
import { useAuthStore } from "../stores/authStore";
import { calculateDistanceKm, formatDistanceKm } from "../utils/location";

const drawerOpen = ref(false);
const loading = ref(false);
const filtro = ref("all");
const intereses = ref([]);
const selectedCat = ref(null);
const planesSection = ref(null);
const planesStore = usePlanesStore();
const authStore = useAuthStore();
const userCoords = ref(null);
const PLANES_BATCH_SIZE = 6;
const visibleCatPlanesCount = ref(PLANES_BATCH_SIZE);

const API = "http://localhost:3000/api";

onMounted(async () => {
  loading.value = true;
  try {
    const [intRes] = await Promise.all([
      axios.get(`${API}/intereses`),
      planesStore.fetchPlanes({ modalidad: "grupo" }),
      planesStore.fetchMisPlanes(),
      loadUserCoords(),
    ]);
    intereses.value = intRes.data;
  } catch (e) {
    console.error(e);
  }
  loading.value = false;
});

// Group interests by category
const categories = computed(() => {
  const map = {};
  intereses.value.forEach((i) => {
    if (!map[i.categoria])
      map[i.categoria] = { categoria: i.categoria, intereses: [], count: 0 };
    map[i.categoria].intereses.push(i);
    map[i.categoria].count++;
  });
  return Object.values(map);
});

function normalizeCategory(value) {
  return String(value || "")
    .replaceAll("Ã¡", "a")
    .replaceAll("Ã©", "e")
    .replaceAll("Ã­", "i")
    .replaceAll("Ã³", "o")
    .replaceAll("Ãº", "u")
    .replaceAll("Ã±", "n")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

const categoryLabelMap = {
  deporte: "Deporte",
  gastronomia: "Gastronomia",
  cultura: "Cultura",
  ocio: "Ocio",
  lifestyle: "Lifestyle",
  fiesta: "Fiesta",
};

const categoryTabs = computed(() => {
  const desiredOrder = [
    "deporte",
    "gastronomia",
    "cultura",
    "ocio",
    "lifestyle",
    "fiesta",
  ];

  const availableKeys = new Set(
    categories.value.map((c) => normalizeCategory(c.categoria))
  );

  return desiredOrder
    .filter((key) => availableKeys.has(key))
    .map((key) => ({ key, label: categoryLabelMap[key] || key }));
});

const filteredCats = computed(() => {
  if (filtro.value === "all") return categories.value;
  return categories.value.filter(
    (c) => normalizeCategory(c.categoria) === filtro.value
  );
});

const joinStatusByPlanId = computed(() => {
  const map = new Map();
  planesStore.misPlanes.forEach((plan) => {
    if (plan.tipo === "hosting") return;
    map.set(plan.id, plan.tipo);
  });
  return map;
});

const catPlanes = computed(() => {
  if (!selectedCat.value) return [];
  return planesStore.planes
    .filter((p) => p.categoria === selectedCat.value)
    .map((plan) => ({
      ...plan,
      joinStatus: joinStatusByPlanId.value.get(plan.id) || "",
      distanceLabel: formatDistanceKm(
        calculateDistanceKm(userCoords.value, { lat: plan.lat, lng: plan.lng })
      ),
    }));
});
const visibleCatPlanes = computed(() =>
  catPlanes.value.slice(0, visibleCatPlanesCount.value)
);
const canLoadMoreCatPlanes = computed(
  () => visibleCatPlanesCount.value < catPlanes.value.length
);

function planesCount(cat) {
  return planesStore.planes.filter((p) => p.categoria === cat).length;
}

async function selectCat(cat) {
  selectedCat.value = cat.categoria;
  visibleCatPlanesCount.value = PLANES_BATCH_SIZE;
  await nextTick();
  planesSection.value?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}

function loadMoreCatPlanes() {
  visibleCatPlanesCount.value += PLANES_BATCH_SIZE;
}

async function handleJoin(plan) {
  try {
    await planesStore.quickJoin(plan.id);
    await planesStore.fetchMisPlanes();
  } catch (e) {}
}

const gradients = {
  deporte: "linear-gradient(135deg, #FF6B35, #F7931E)",
  gastronomia: "linear-gradient(135deg, #E91E63, #FF5722)",
  cultura: "linear-gradient(135deg, #9C27B0, #673AB7)",
  ocio: "linear-gradient(135deg, #2196F3, #03A9F4)",
  lifestyle: "linear-gradient(135deg, #4CAF50, #8BC34A)",
  fiesta: "linear-gradient(135deg, #FF4081, #E91E63)",
};
const emojis = {
  deporte: "🏃",
  gastronomia: "🍽️",
  cultura: "🎭",
  ocio: "🎮",
  lifestyle: "🌿",
  fiesta: "🎉",
};
function catGradient(cat) {
  return (
    gradients[normalizeCategory(cat)] ||
    "linear-gradient(135deg, #607D8B, #90A4AE)"
  );
}
function catEmoji(cat) {
  return emojis[normalizeCategory(cat)] || "📌";
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

watch(selectedCat, () => {
  visibleCatPlanesCount.value = PLANES_BATCH_SIZE;
});
</script>

<style scoped>
.comunidades-container {
  padding: 2rem 0 6rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}
.comunidades-header {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.comunidades-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 1.25rem;
}
.comunidad-card {
  cursor: pointer;
}
.comunidad-img {
  height: 130px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.comunidad-emoji {
  font-size: 3.5rem;
  filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.2));
}
.comunidad-body {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.comunidad-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.cat-plans-section {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}
.cat-plans-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.plans-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(270px, 1fr));
  gap: 1.25rem;
}
.mt-12 {
  margin-top: 3rem;
}
.mb-20 {
  margin-bottom: 5rem;
}
.flex {
  display: flex;
}
.justify-center {
  justify-content: center;
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

@media (max-width: 768px) {
  .comunidades-container {
    padding: 1.25rem 0 5.5rem;
    gap: 1.5rem;
  }

  .comunidades-grid,
  .plans-grid {
    grid-template-columns: 1fr;
  }

  .cat-plans-header {
    align-items: flex-start;
    gap: 0.75rem;
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .comunidad-body {
    padding: 0.9rem;
  }

  .comunidad-img {
    height: 110px;
  }

  .comunidad-emoji {
    font-size: 3rem;
  }
}
</style>
