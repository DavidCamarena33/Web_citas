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
          <section class="perfil-header card fade-in-up">
            <div class="perfil-cover"></div>
            <div class="perfil-info">
              <div class="perfil-avatar-row">
                <div
                  class="avatar avatar-xl perfil-avatar"
                  title="Foto de perfil"
                >
                  <img
                    v-if="perfil.fotos.length"
                    :src="perfil.fotos[0]"
                    alt="Foto principal"
                    @error="removeBrokenPhoto(0)"
                  />
                  <span v-else>{{ initials }}</span>
                </div>
                <input
                  v-if="isOwnProfile"
                  ref="profilePhotoInput"
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  class="hidden-input"
                  @change="uploadProfilePhoto"
                />

                <div class="perfil-name-block">
                  <h1 class="perfil-name">
                    {{ perfil.nombre || "Perfil" }}<span class="perfil-age" v-if="edad">, {{ edad }}</span>
                  </h1>
                  <div class="perfil-location-row">
                    <p class="text-muted text-sm">
                      {{ perfil.direccion || "Ubicacion no establecida" }}
                    </p>
                    <button
                      v-if="isOwnProfile"
                      class="btn btn-primary btn-sm profile-photo-btn"
                      :disabled="isUploadingProfilePhoto"
                      @click="triggerProfilePhotoUpload"
                    >
                      {{ isUploadingProfilePhoto ? "Actualizando..." : "Cambiar foto de perfil" }}
                    </button>
                    <button
                      v-if="isOwnProfile"
                      class="btn btn-primary btn-sm location-btn"
                      @click="$router.push('/ubicacion')"
                    >
                      Cambiar ubicacion
                    </button>
                  </div>
                  <p
                    v-if="profileUploadMsg"
                    class="text-sm"
                    :class="profileUploadMsg === 'Foto de perfil actualizada' ? 'text-primary' : 'text-muted'"
                  >
                    {{ profileUploadMsg }}
                  </p>
                </div>
              </div>

              <div class="perfil-stats">
                <div class="stat-block">
                  <span class="stat-num">{{ perfil.stats?.planes_hosted || 0 }}</span>
                  <span class="stat-label">Planes creados</span>
                </div>
                <div class="stat-divider"></div>
                <div class="stat-block">
                  <span class="stat-num">{{ perfil.stats?.planes_joined || 0 }}</span>
                  <span class="stat-label">Planes unidos</span>
                </div>
                <div class="stat-divider"></div>
                <div class="stat-block">
                  <span class="stat-num text-primary">{{ averageRatingLabel }}</span>
                  <span class="stat-label">Valoracion</span>
                </div>
              </div>
            </div>
          </section>

          <section class="card perfil-bio-card fade-in-up">
            <div class="perfil-bio-header">
              <h3>Sobre mi</h3>
              <button
                v-if="isOwnProfile"
                class="btn btn-ghost btn-sm"
                @click="editingBio = !editingBio"
              >
                {{ editingBio ? "Cancelar" : "Editar" }}
              </button>
            </div>

            <div v-if="editingBio">
              <textarea
                v-model="bioText"
                class="form-textarea"
                placeholder="Escribe algo sobre ti..."
              ></textarea>
              <button class="btn btn-primary btn-sm perfil-bio-save" @click="saveBio">
                Guardar
              </button>
            </div>
            <p v-else class="text-muted">
              {{ perfil.descripcion || "Sin descripcion todavia." }}
            </p>
          </section>

          <section class="card perfil-sections-card fade-in-up">
            <div class="perfil-tabs" role="tablist" aria-label="Apartados del perfil">
              <button
                type="button"
                class="perfil-tab"
                :class="{ active: activeSection === 'fotos' }"
                @click="activeSection = 'fotos'"
              >
                {{ isOwnProfile ? "Mis fotos" : "Fotos" }}
              </button>
              <button
                type="button"
                class="perfil-tab"
                :class="{ active: activeSection === 'planes' }"
                @click="activeSection = 'planes'"
              >
                {{ isOwnProfile ? "Mis planes" : "Planes" }}
              </button>
            </div>

            <div v-if="activeSection === 'fotos'" class="perfil-section-panel">
              <div class="perfil-photos-header">
                <h3>{{ isOwnProfile ? "Mis fotos" : "Fotos" }}</h3>
                <label
                  v-if="isOwnProfile"
                  class="photo-publish-label"
                  :class="{ disabled: isUploadingGalleryPhoto }"
                >
                  <input
                    ref="galleryPhotoInput"
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    :disabled="isUploadingGalleryPhoto"
                    @change="uploadGalleryPhoto"
                  />
                  <span>{{ isUploadingGalleryPhoto ? "Publicando..." : "Publicar foto" }}</span>
                </label>
              </div>

              <div v-if="perfil.fotos.length" class="perfil-photos-grid">
                <img
                  v-for="(foto, i) in perfil.fotos"
                  :key="foto"
                  :src="foto"
                  :alt="i === 0 ? 'Foto principal' : `Foto ${i + 1}`"
                  class="perfil-photo"
                  @error="removeBrokenPhoto(i)"
                />
              </div>
              <p v-else class="text-muted text-sm">
                {{ isOwnProfile ? "Todavia no has subido fotos." : "Este usuario todavia no ha subido fotos." }}
              </p>
              <p
                v-if="galleryUploadMsg"
                class="text-sm"
                :class="galleryUploadMsg === 'Foto publicada' ? 'text-primary' : 'text-muted'"
              >
                {{ galleryUploadMsg }}
              </p>
            </div>

            <div v-else class="perfil-section-panel">
              <div class="perfil-planes-header">
                <h3>{{ isOwnProfile ? "Mis planes creados" : "Planes creados" }}</h3>
                <button
                  v-if="isOwnProfile && userHostedPlans.length"
                  class="btn btn-ghost btn-sm"
                  @click="$router.push('/mis-planes')"
                >
                  Ver todos
                </button>
              </div>

              <div v-if="plansLoading" class="loading-center perfil-planes-loading">
                <div class="spinner"></div>
              </div>
              <p v-else-if="!userHostedPlans.length" class="perfil-planes-empty text-muted">
                {{ isOwnProfile ? "Todavia no has creado planes." : "Este usuario todavia no ha creado planes." }}
              </p>
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
                    <span>{{ plan.interes?.charAt(0) || "+" }}</span>
                  </div>
                  <div class="perfil-plan-body">
                    <p class="perfil-plan-date">
                      {{ formatPlanDate(plan.fecha_plan) || "Fecha por definir" }}
                    </p>
                    <h4>{{ plan.titulo }}</h4>
                    <p class="text-muted text-sm">
                      {{ plan.interes || "Plan" }}
                    </p>
                  </div>
                </article>
              </div>
            </div>
          </section>
        </template>
      </div>
    </main>

    <button v-if="isOwnProfile" class="fab" @click="$router.push('/crear-plan')">+</button>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import NavBar from "../components/NavBar.vue";
import SideDrawer from "../components/SideDrawer.vue";
import axios from "axios";
import { usePlanesStore } from "../stores/planesStore";
import { useAuthStore } from "../stores/authStore";

const drawerOpen = ref(false);
const loading = ref(false);
const plansLoading = ref(false);
const isUploadingProfilePhoto = ref(false);
const isUploadingGalleryPhoto = ref(false);
const perfil = ref(createEmptyProfile());
const editingBio = ref(false);
const bioText = ref("");
const activeSection = ref("fotos");
const profilePhotoInput = ref(null);
const galleryPhotoInput = ref(null);
const profileUploadMsg = ref("");
const galleryUploadMsg = ref("");
const hostedPlans = ref([]);

const API = "http://localhost:3000/api";
const MAX_PHOTO_SIZE = 10 * 1024 * 1024;
const ALLOWED_PHOTO_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const planesStore = usePlanesStore();

function createEmptyProfile() {
  return { id: null, nombre: "", fotos: [], stats: {}, descripcion: "", direccion: "" };
}

const routeProfileId = computed(() => {
  const parsed = Number(route.params.id);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
});

const isOwnProfile = computed(() => {
  if (!routeProfileId.value) return true;
  return Number(authStore.user?.id) === routeProfileId.value;
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
  const age = Math.floor((Date.now() - birth.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
  return Number.isNaN(age) ? null : age;
});

const averageRatingLabel = computed(() => {
  const value = Number(perfil.value.stats?.average_rating || 0);
  return value ? value.toFixed(1) : "Nuevo";
});

const userHostedPlans = computed(() => {
  const source = isOwnProfile.value ? planesStore.misPlanes : hostedPlans.value;
  return [...(source || [])]
    .filter((plan) => plan.tipo === "hosting")
    .sort((a, b) => {
      const aTime = a.fecha_plan ? new Date(a.fecha_plan).getTime() : 0;
      const bTime = b.fecha_plan ? new Date(b.fecha_plan).getTime() : 0;
      return bTime - aTime;
    });
});

onMounted(async () => {
  if (!authStore.user && !authStore.isAuthenticated) {
    await authStore.checkAuth();
  }
  await loadProfileView();
});

watch(
  () => route.fullPath,
  async () => {
    await loadProfileView();
  }
);

async function loadProfileView() {
  loading.value = true;
  plansLoading.value = true;
  editingBio.value = false;
  profileUploadMsg.value = "";
  galleryUploadMsg.value = "";
  perfil.value = createEmptyProfile();
  hostedPlans.value = [];
  bioText.value = "";

  try {
    const profilePath = routeProfileId.value ? `/perfil/${routeProfileId.value}` : "/perfil";
    const profileResponse = await axios.get(`${API}${profilePath}`, { withCredentials: true });

    perfil.value = {
      ...createEmptyProfile(),
      ...profileResponse.data,
      fotos: Array.isArray(profileResponse.data?.fotos) ? profileResponse.data.fotos : [],
      stats: profileResponse.data?.stats || {},
    };
    bioText.value = perfil.value.descripcion || "";

    try {
      if (isOwnProfile.value) {
        await planesStore.fetchMisPlanes();
      } else {
        const plansResponse = await axios.get(`${API}/perfil/${routeProfileId.value}/planes`, {
          withCredentials: true,
        });
        hostedPlans.value = Array.isArray(plansResponse.data) ? plansResponse.data : [];
      }
    } catch (plansError) {
      console.error(plansError);
      hostedPlans.value = [];
    }
  } catch (e) {
    console.error(e);
    perfil.value = createEmptyProfile();
    hostedPlans.value = [];
    if (axios.isAxiosError(e) && e.response?.status === 404) {
      router.push("/discover");
    }
  } finally {
    plansLoading.value = false;
    loading.value = false;
  }
}

function triggerProfilePhotoUpload() {
  if (!isOwnProfile.value || isUploadingProfilePhoto.value) return;
  profilePhotoInput.value?.click();
}

function removeBrokenPhoto(index) {
  perfil.value.fotos = perfil.value.fotos.filter((_, i) => i !== index);
}

function validatePhoto(file) {
  if (!ALLOWED_PHOTO_TYPES.includes(file.type)) {
    return "Formato no permitido. Usa JPG, PNG, GIF o WEBP.";
  }
  if (file.size > MAX_PHOTO_SIZE) {
    return "La foto no puede superar 10 MB.";
  }
  return "";
}

async function uploadPhoto(e, { principal, mode }) {
  const input = e.target;
  const file = input.files?.[0];
  const isBusy = mode === "profile" ? isUploadingProfilePhoto : isUploadingGalleryPhoto;
  const message = mode === "profile" ? profileUploadMsg : galleryUploadMsg;
  const successMessage = mode === "profile" ? "Foto de perfil actualizada" : "Foto publicada";

  if (!file || isBusy.value) return;

  const error = validatePhoto(file);
  if (error) {
    message.value = error;
    input.value = "";
    setTimeout(() => (message.value = ""), 3000);
    return;
  }

  isBusy.value = true;
  message.value = mode === "profile" ? "Actualizando..." : "Publicando...";

  const fd = new FormData();
  fd.append("foto", file);
  fd.append("principal", String(principal));

  try {
    const { data } = await axios.post(`${API}/perfil/foto`, fd, { withCredentials: true });
    if (principal) {
      perfil.value.fotos = perfil.value.fotos.length
        ? [data.url, ...perfil.value.fotos.slice(1)]
        : [data.url];
    } else {
      perfil.value.fotos = [...perfil.value.fotos, data.url];
    }
    message.value = successMessage;
  } catch (err) {
    message.value = err.response?.data?.error || "Error al subir foto";
  } finally {
    isBusy.value = false;
    input.value = "";
    setTimeout(() => (message.value = ""), 3000);
  }
}

async function uploadProfilePhoto(e) {
  await uploadPhoto(e, { principal: true, mode: "profile" });
}

async function uploadGalleryPhoto(e) {
  await uploadPhoto(e, { principal: false, mode: "gallery" });
}

async function saveBio() {
  if (!isOwnProfile.value) return;
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

.perfil-header {
  overflow: hidden;
}
.perfil-cover {
  height: 120px;
  background: linear-gradient(135deg, var(--primary), var(--primary-dark), #7b1fa2);
}
.perfil-info {
  padding: 0 1.5rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.perfil-avatar-row {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-top: -50px;
  flex-wrap: wrap;
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
.perfil-avatar img {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
  object-position: center;
  border-radius: 50%;
}
.hidden-input {
  display: none;
}
.perfil-name-block {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  min-width: 0;
  padding-top: 58px;
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
.profile-photo-btn {
  width: fit-content;
  box-shadow: none;
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
  padding: 1rem 0 0;
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
.perfil-bio-card,
.perfil-sections-card {
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.perfil-sections-card {
  padding: 0;
  overflow: hidden;
}
.perfil-tabs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  border-bottom: 1px solid var(--card-border);
  background: #fff2f5;
}
.perfil-tab {
  position: relative;
  border: 0;
  background: transparent;
  color: var(--text-muted);
  font-size: 1rem;
  font-weight: 800;
  padding: 1rem;
  cursor: pointer;
  transition: color var(--transition), background var(--transition);
}
.perfil-tab.active {
  color: var(--primary);
  background: #fff;
}
.perfil-tab.active::after {
  content: "";
  position: absolute;
  left: 1rem;
  right: 1rem;
  bottom: -1px;
  height: 3px;
  border-radius: 999px;
  background: var(--primary);
}
.perfil-section-panel {
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.perfil-bio-header,
.perfil-photos-header,
.perfil-planes-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}
.perfil-bio-save {
  margin-top: 0.75rem;
}
.perfil-photos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(112px, 1fr));
  gap: 0.75rem;
}
.perfil-photo {
  width: 100%;
  aspect-ratio: 4 / 5;
  display: block;
  object-fit: cover;
  object-position: center;
  border-radius: var(--radius-sm);
  background: var(--primary-soft);
}
.photo-publish-label {
  display: inline-flex;
  cursor: pointer;
}
.photo-publish-label.disabled {
  cursor: wait;
  opacity: 0.7;
}
.photo-publish-label input {
  display: none;
}
.photo-publish-label span {
  background: var(--primary-gradient);
  color: #fff;
  border: 0;
  border-radius: var(--radius-pill);
  padding: 0.35rem 0.9rem;
  font-weight: 600;
  font-size: 0.8rem;
  box-shadow: var(--shadow-primary);
  transition: all var(--transition);
}
.photo-publish-label:hover span {
  transform: translateY(-2px);
  box-shadow: 0 12px 30px rgba(244, 63, 94, 0.45);
}
.perfil-planes-grid {
  display: grid;
  grid-template-columns: 1fr;
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
  font-weight: 800;
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
  .perfil-planes-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .perfil-cover {
    height: 100px;
  }
  .perfil-avatar-row {
    margin-top: -42px;
    align-items: flex-start;
  }
  .perfil-name-block {
    flex-basis: 100%;
    padding-top: 0;
  }
  .perfil-stats {
    gap: 0.75rem;
  }
  .stat-divider {
    display: none;
  }
  .photo-publish-label,
  .photo-publish-label span,
  .profile-photo-btn,
  .location-btn {
    width: 100%;
  }
  .photo-publish-label span {
    text-align: center;
  }
  .perfil-photos-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .perfil-tab {
    font-size: 0.92rem;
    padding: 0.9rem 0.5rem;
  }
}
</style>
