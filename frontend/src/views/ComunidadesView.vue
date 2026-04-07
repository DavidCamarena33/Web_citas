<template>
  <div class="page-layout">
    <NavBar @toggle-drawer="drawerOpen = true" />
    <SideDrawer :open="drawerOpen" @close="drawerOpen = false" />

    <main class="page-content">
      <div class="container comunidades-container">
        <div class="comunidades-header fade-in-up">
          <h1>Communities</h1>
          <p class="text-muted">Descubre planes por categoría de interés</p>
        </div>

        <!-- Filters -->
        <div class="tabs fade-in-up">
          <button
            class="tab"
            :class="{ active: filtro === 'all' }"
            @click="filtro = 'all'"
          >
            All
          </button>
          <button
            class="tab"
            :class="{ active: filtro === 'Deporte' }"
            @click="filtro = 'Deporte'"
          >
            Deporte
          </button>
          <button
            class="tab"
            :class="{ active: filtro === 'Gastronomía' }"
            @click="filtro = 'Gastronomía'"
          >
            Gastronomía
          </button>
          <button
            class="tab"
            :class="{ active: filtro === 'Cultura' }"
            @click="filtro = 'Cultura'"
          >
            Cultura
          </button>
          <button
            class="tab"
            :class="{ active: filtro === 'Ocio' }"
            @click="filtro = 'Ocio'"
          >
            Ocio
          </button>
          <button
            class="tab"
            :class="{ active: filtro === 'Lifestyle' }"
            @click="filtro = 'Lifestyle'"
          >
            Lifestyle
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
        <div v-if="selectedCat" class="cat-plans-section fade-in-up">
          <div class="cat-plans-header">
            <h2>Upcoming Plans – {{ selectedCat }}</h2>
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
              v-for="plan in catPlanes"
              :key="plan.id"
              :plan="plan"
              @join="handleJoin"
            />
          </div>
        </div>
      </div>
    </main>
    <button class="fab" @click="$router.push('/crear-plan')">+</button>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import NavBar from "../components/NavBar.vue";
import SideDrawer from "../components/SideDrawer.vue";
import PlanCard from "../components/PlanCard.vue";
import axios from "axios";
import { usePlanesStore } from "../stores/planesStore";

const drawerOpen = ref(false);
const loading = ref(false);
const filtro = ref("all");
const intereses = ref([]);
const selectedCat = ref(null);
const planesStore = usePlanesStore();

const API = "http://localhost:3000/api";

onMounted(async () => {
  loading.value = true;
  try {
    const [intRes] = await Promise.all([
      axios.get(`${API}/intereses`),
      planesStore.fetchPlanes(),
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

const filteredCats = computed(() => {
  if (filtro.value === "all") return categories.value;
  return categories.value.filter((c) => c.categoria === filtro.value);
});

const catPlanes = computed(() => {
  if (!selectedCat.value) return [];
  return planesStore.planes.filter((p) => p.categoria === selectedCat.value);
});

function planesCount(cat) {
  return planesStore.planes.filter((p) => p.categoria === cat).length;
}

function selectCat(cat) {
  selectedCat.value = cat.categoria;
}

async function handleJoin(plan) {
  try {
    await planesStore.quickJoin(plan.id);
  } catch (e) {}
}

const gradients = {
  Deporte: "linear-gradient(135deg, #FF6B35, #F7931E)",
  Gastronomía: "linear-gradient(135deg, #E91E63, #FF5722)",
  Cultura: "linear-gradient(135deg, #9C27B0, #673AB7)",
  Ocio: "linear-gradient(135deg, #2196F3, #03A9F4)",
  Lifestyle: "linear-gradient(135deg, #4CAF50, #8BC34A)",
  Fiesta: "linear-gradient(135deg, #FF4081, #E91E63)",
};
const emojis = {
  Deporte: "🏃",
  Gastronomía: "🍽️",
  Cultura: "🎭",
  Ocio: "🎮",
  Lifestyle: "🌿",
  Fiesta: "🎉",
};
function catGradient(cat) {
  return gradients[cat] || "linear-gradient(135deg, #607D8B, #90A4AE)";
}
function catEmoji(cat) {
  return emojis[cat] || "📌";
}
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
</style>
