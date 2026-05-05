<template>
  <div class="page-layout">
    <NavBar @toggle-drawer="drawerOpen = true" />
    <SideDrawer :open="drawerOpen" @close="drawerOpen = false" />

    <main class="page-content">
      <div class="container perfil-container">
        <div v-if="loading" class="loading-center" style="padding: 4rem">
          <div class="spinner"></div>
        </div>

        <template v-else>
          <!-- Profile Header -->
          <div class="perfil-header card fade-in-up">
            <div class="perfil-cover"></div>
            <div class="perfil-info">
              <div class="perfil-avatar-row">
                <div class="perfil-avatar-wrap">
                  <div class="avatar avatar-xl perfil-avatar">
                    <img
                      v-if="perfil.fotos && perfil.fotos.length"
                      :src="perfil.fotos[0]"
                      alt="foto de perfil"
                    />
                    <span v-else>{{ initials }}</span>
                  </div>
                </div>
                <div class="perfil-avatar-actions">
                  <button
                    class="btn btn-primary btn-sm"
                    type="button"
                    @click="triggerUpload"
                  >
                    {{ hasFotoPrincipal ? "Cambiar foto" : "Añadir foto" }}
                  </button>
                  <p class="text-muted text-sm">
                    {{ hasFotoPrincipal ? "Esta será tu foto principal." : "Sube tu primera foto de perfil." }}
                  </p>
                </div>
              </div>
              <input
                ref="fileInput"
                type="file"
                accept="image/*"
                class="hidden-input"
                @change="uploadFotoPrincipal"
              />

              <div class="perfil-name-block">
                <h1 class="perfil-name">
                  {{ perfil.nombre
                  }}<span class="perfil-age" v-if="edad">, {{ edad }}</span>
                </h1>
                <div class="perfil-location-row">
                  <p class="text-muted text-sm">
                    {{ perfil.direccion || "Ubicación no establecida" }}
                  </p>
                  <button
                    class="btn btn-primary btn-sm location-btn"
                    @click="$router.push('/ubicacion')"
                  >
                    Cambiar ubicacion
                  </button>
                </div>
                <div class="perfil-about-block">
                  <div class="perfil-bio-header">
                    <h3>Sobre mí</h3>
                    <button
                      class="btn btn-ghost btn-sm"
                      @click="editingBio = !editingBio"
                    >
                      {{ editingBio ? "Cancelar" : "✏️ Editar" }}
                    </button>
                  </div>
                  <div v-if="editingBio">
                    <textarea
                      class="form-textarea"
                      v-model="bioText"
                      placeholder="Escribe algo sobre ti..."
                    ></textarea>
                    <button
                      class="btn btn-primary btn-sm perfil-bio-save"
                      @click="saveBio"
                    >
                      Guardar
                    </button>
                  </div>
                  <p v-else class="text-muted">
                    {{ perfil.descripcion || "Sin descripción todavía." }}
                  </p>
                </div>
              </div>

              <!-- Stats -->
              <div class="perfil-stats">
                <div class="stat-block">
                  <span class="stat-num">{{
                    perfil.stats?.planes_hosted || 0
                  }}</span>
                  <span class="stat-label">Planes creados</span>
                </div>
                <div class="stat-divider"></div>
                <div class="stat-block">
                  <span class="stat-num">{{
                    perfil.stats?.planes_joined || 0
                  }}</span>
                  <span class="stat-label">Planes unidos</span>
                </div>
                <div class="stat-divider"></div>
                <div class="stat-block">
                  <span class="stat-num text-primary">⭐ 4.9</span>
                  <span class="stat-label">Valoración</span>
                </div>
              </div>
            </div>
          </div>

          <div class="card perfil-sections-card fade-in-up">
            <div class="perfil-tabs">
              <button
                class="perfil-tab"
                :class="{ active: activeSection === 'fotos' }"
                @click="activeSection = 'fotos'"
              >
                Mis fotos
              </button>
              <button
                class="perfil-tab"
                :class="{ active: activeSection === 'planes' }"
                @click="activeSection = 'planes'"
              >
                Mis planes
              </button>
            </div>

            <div v-if="activeSection === 'fotos'" class="perfil-photos-card">
              <div class="perfil-photos-header">
                <p class="text-muted text-sm">Añade más fotos para que se queden guardadas en tu perfil.</p>
                <label class="photo-upload-label">
                  <input type="file" accept="image/*" @change="uploadFotoSecundaria" />
                  <span>+ Añadir foto</span>
                </label>
              </div>
              <div class="perfil-photos-grid">
                <p v-if="!perfil.fotos?.length" class="perfil-photos-empty text-muted text-sm">
                  Todavía no has subido fotos.
                </p>
                <img
                  v-for="(foto, i) in perfil.fotos"
                  :key="i"
                  :src="foto"
                  :alt="'foto ' + i"
                  class="perfil-photo"
                />
              </div>
              <p
                v-if="uploadMsg"
                class="text-sm"
                :class="
                  uploadMsg.startsWith('✅') ? 'text-primary' : 'text-muted'
                "
              >
                {{ uploadMsg }}
              </p>
            </div>

            <div v-else class="perfil-planes-card">
              <div class="perfil-planes-header">
                <p class="text-muted text-sm">Aquí se muestran los planes que estás organizando.</p>
                <button
                  v-if="userHostedPlans.length"
                  class="btn btn-ghost btn-sm"
                  @click="$router.push('/mis-planes')"
                >
                  Ver todos
                </button>
              </div>

              <div v-if="plansLoading" class="loading-center perfil-planes-loading">
                <div class="spinner"></div>
              </div>

              <div v-else-if="!userHostedPlans.length" class="perfil-planes-empty text-muted">
                Todavía no has creado planes.
              </div>

              <div v-else class="perfil-planes-grid">
                <article
                  v-for="plan in userHostedPlans"
                  :key="plan.id"
                  class="perfil-plan-card"
                  @click="$router.push(`/planes/${plan.id}`)"
                >
                  <img
                    v-if="plan.foto"
                    :src="plan.foto"
                    :alt="plan.titulo"
                    class="perfil-plan-image"
                  />
                  <div v-else class="perfil-plan-image perfil-plan-placeholder">
                    <span class="material-symbols-outlined">join_inner</span>
                  </div>
                  <div class="perfil-plan-body">
                    <p class="perfil-plan-date">
                      {{ formatPlanDate(plan.fecha_plan) || "Fecha por definir" }}
                    </p>
                    <h4>{{ plan.titulo }}</h4>
                    <p class="text-muted text-sm">
                      {{ plan.direccion || "Ubicación pendiente" }}
                    </p>
                  </div>
                </article>
              </div>
            </div>
          </div>
        </template>
      </div>
    </main>
    <button class="fab" @click="$router.push('/crear-plan')">+</button>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import NavBar from "../components/NavBar.vue";
import SideDrawer from "../components/SideDrawer.vue";
import axios from "axios";
import { usePlanesStore } from "../stores/planesStore";

const drawerOpen = ref(false);
const loading = ref(false);
const perfil = ref({ nombre: "", fotos: [], stats: {} });
const editingBio = ref(false);
const bioText = ref("");
const fileInput = ref(null);
const uploadMsg = ref("");
const plansLoading = ref(false);
const activeSection = ref("fotos");

const API = "http://localhost:3000/api";
const planesStore = usePlanesStore();

onMounted(async () => {
  loading.value = true;
  plansLoading.value = true;
  try {
    const [{ data }] = await Promise.all([
      axios.get(`${API}/perfil`, {
        withCredentials: true,
      }),
      planesStore.fetchMisPlanes(),
    ]);
    perfil.value = data;
    bioText.value = data.descripcion || "";
  } catch (e) {
    console.error(e);
  } finally {
    plansLoading.value = false;
    loading.value = false;
  }
});

const initials = computed(() => {
  return (perfil.value.nombre || "?")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
});

const edad = computed(() => {
  if (!perfil.value.edad) return null;
  const birth = new Date(perfil.value.edad);
  const age = Math.floor(
    (Date.now() - birth.getTime()) / (365.25 * 24 * 60 * 60 * 1000),
  );
  return isNaN(age) ? null : age;
});

const hasFotoPrincipal = computed(() => (perfil.value.fotos || []).length > 0);
const userHostedPlans = computed(() =>
  [...planesStore.misPlanes]
    .filter((plan) => plan.tipo === "hosting")
    .sort((a, b) => {
      const aTime = a.fecha_plan ? new Date(a.fecha_plan).getTime() : Number.MAX_SAFE_INTEGER;
      const bTime = b.fecha_plan ? new Date(b.fecha_plan).getTime() : Number.MAX_SAFE_INTEGER;
      return aTime - bTime;
    })
);

function triggerUpload() {
  fileInput.value?.click();
}

async function uploadFotoPrincipal(e) {
  const file = e.target.files?.[0];
  if (!file) return;
  uploadMsg.value = hasFotoPrincipal.value
    ? "⏳ Cambiando foto principal..."
    : "⏳ Subiendo foto principal...";
  const fd = new FormData();
  fd.append("foto", file);
  try {
    const { data } = await axios.put(`${API}/perfil/foto-principal`, fd, {
      withCredentials: true,
      headers: { "Content-Type": "multipart/form-data" },
    });
    if (hasFotoPrincipal.value) {
      const fotosActuales = [...(perfil.value.fotos || [])];
      fotosActuales[0] = data.url;
      perfil.value.fotos = fotosActuales;
    } else {
      perfil.value.fotos = [data.url, ...(perfil.value.fotos || [])];
    }
    uploadMsg.value = "✅ Foto principal actualizada";
  } catch (err) {
    uploadMsg.value = "❌ Error al actualizar la foto principal";
  }
  e.target.value = "";
  setTimeout(() => (uploadMsg.value = ""), 3000);
}

async function uploadFotoSecundaria(e) {
  const file = e.target.files?.[0];
  if (!file) return;
  uploadMsg.value = "⏳ Subiendo foto...";
  const fd = new FormData();
  fd.append("foto", file);
  try {
    const { data } = await axios.post(`${API}/perfil/foto`, fd, {
      withCredentials: true,
      headers: { "Content-Type": "multipart/form-data" },
    });
    perfil.value.fotos = [...(perfil.value.fotos || []), data.url];
    uploadMsg.value = "✅ Foto añadida al perfil";
  } catch (err) {
    uploadMsg.value = "❌ Error al añadir la foto";
  }
  e.target.value = "";
  setTimeout(() => (uploadMsg.value = ""), 3000);
}

async function saveBio() {
  try {
    await axios.put(
      `${API}/perfil/descripcion`,
      { descripcion: bioText.value },
      { withCredentials: true },
    );
    perfil.value.descripcion = bioText.value;
    editingBio.value = false;
  } catch (e) {
    console.error(e);
  }
}

function formatPlanDate(date) {
  if (!date) return "";
  return new Date(date).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}
</script>

<style scoped>
.perfil-container {
  padding: 2rem 0 6rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Header card */
.perfil-header {
  overflow: hidden;
}
.perfil-cover {
  height: 120px;
  background: linear-gradient(
    135deg,
    var(--primary),
    var(--primary-dark),
    #7b1fa2
  );
}
.perfil-info {
  padding: 0 1.5rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.perfil-avatar-row {
  margin-top: -50px;
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}
.perfil-avatar-wrap {
  position: relative;
  width: fit-content;
}
.perfil-avatar {
  border: 4px solid white;
  box-shadow: var(--shadow-md);
  position: relative;
  overflow: hidden;
  background: var(--primary-soft);
  color: var(--primary);
  font-size: 2.2rem;
  font-weight: 700;
}
.perfil-avatar-actions {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}
.perfil-avatar img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 50%;
  background: #fff;
}
.hidden-input {
  display: none;
}

.perfil-name-block {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}
.perfil-location-row {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  flex-wrap: wrap;
}
.location-btn {
  width: fit-content;
  box-shadow: none;
}
.perfil-about-block {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding-top: 0.25rem;
}
.perfil-bio-save {
  margin-top: 0.75rem;
}
.perfil-name {
  font-size: 1.6rem;
  font-weight: 800;
}
.perfil-age {
  color: var(--text-muted);
  font-weight: 400;
}

.perfil-stats {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1rem 0;
  border-top: 1px solid var(--card-border);
}
.stat-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.1rem;
}
.stat-num {
  font-size: 1.4rem;
  font-weight: 800;
}
.stat-label {
  font-size: 0.75rem;
  color: var(--text-muted);
  font-weight: 500;
  text-align: center;
}
.stat-divider {
  width: 1px;
  height: 40px;
  background: var(--card-border);
}

.perfil-bio-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.perfil-sections-card {
  padding: 0;
  overflow: hidden;
}
.perfil-tabs {
  display: flex;
  align-items: center;
  gap: 0;
  padding: 0;
  border-bottom: 1px solid var(--card-border);
  background: #fff2f5;
}
.perfil-tab {
  position: relative;
  border: 0;
  background: transparent;
  flex: 1;
  color: #60708c;
  font-size: 1.15rem;
  font-weight: 700;
  padding: 1rem 0 0.95rem;
  cursor: pointer;
  text-align: center;
}
.perfil-tab.active {
  color: #ff1b64;
}
.perfil-tab.active::after {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  bottom: -1px;
  height: 3px;
  border-radius: 999px;
  background: #ff1b64;
}

/* Photos */
.perfil-photos-card {
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.perfil-photos-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}
.perfil-photos-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.85rem;
}
.perfil-photos-empty {
  grid-column: 1 / -1;
  margin: 0;
}
.perfil-photo {
  width: 100%;
  aspect-ratio: 1 / 1.15;
  object-fit: contain;
  border-radius: var(--radius-sm);
  background: #fff;
  border: 1px solid var(--card-border);
}

.photo-upload-label {
  display: inline-flex;
  cursor: pointer;
}
.photo-upload-label input {
  display: none;
}
.photo-upload-label span {
  background: var(--primary-soft);
  color: var(--primary);
  border: 2px dashed var(--primary-light);
  border-radius: var(--radius-md);
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  font-size: 0.9rem;
  transition: all var(--transition);
}
.photo-upload-label:hover span {
  background: var(--primary);
  color: #fff;
  border-style: solid;
}

.perfil-planes-card {
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.perfil-planes-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}
.perfil-planes-loading,
.perfil-planes-empty {
  padding: 1rem 0;
}
.perfil-planes-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}
.perfil-plan-card {
  border: 1px solid var(--card-border);
  border-radius: var(--radius-md);
  overflow: hidden;
  background: #fff;
  cursor: pointer;
  transition: transform var(--transition), box-shadow var(--transition);
}
.perfil-plan-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}
.perfil-plan-image {
  width: 100%;
  height: 180px;
  object-fit: cover;
  display: block;
}
.perfil-plan-placeholder {
  background: var(--primary-soft);
  color: var(--primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
}
.perfil-plan-body {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}
.perfil-plan-body h4 {
  margin: 0;
  font-size: 1rem;
}
.perfil-plan-date {
  margin: 0;
  color: var(--primary);
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
}

@media (max-width: 768px) {
  .perfil-container {
    padding: 1.25rem 0 5.5rem;
  }

  .perfil-info {
    padding: 0 1.1rem 1.1rem;
  }

  .perfil-avatar-row {
    margin-top: -42px;
  }

  .perfil-name {
    font-size: 1.35rem;
  }

  .perfil-stats {
    gap: 1rem;
    justify-content: space-between;
  }

  .stat-block {
    flex: 1;
  }

  .perfil-photos-grid {
    gap: 0.7rem;
  }

  .perfil-planes-grid {
    grid-template-columns: 1fr;
  }

  .perfil-tab {
    font-size: 1.05rem;
  }
}

@media (max-width: 480px) {
  .perfil-cover {
    height: 100px;
  }

  .perfil-avatar-row {
    align-items: flex-start;
  }

  .perfil-bio-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }

  .perfil-stats {
    gap: 0.75rem;
  }

  .stat-divider {
    display: none;
  }

  .photo-upload-label,
  .photo-upload-label span {
    width: 100%;
  }

  .photo-upload-label span {
    text-align: center;
  }

  .perfil-photos-header {
    flex-direction: column;
    align-items: stretch;
  }

  .perfil-photos-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .perfil-tabs {
    padding: 0;
  }

  .perfil-tab {
    font-size: 0.98rem;
    padding: 0.9rem 0 0.8rem;
  }

  .perfil-location-row {
    align-items: stretch;
  }

  .location-btn {
    width: 100%;
  }
}
</style>
