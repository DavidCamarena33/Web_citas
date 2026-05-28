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
          <div class="perfil-header card fade-in-up">
            <div class="perfil-cover"></div>
            <div class="perfil-info">
              <div class="perfil-avatar-wrap">
                <button
                  type="button"
                  class="avatar avatar-xl perfil-avatar"
                  :disabled="uploading"
                  @click="triggerUpload"
                  title="Cambiar foto principal"
                >
                  <img
                    v-if="perfil.fotos && perfil.fotos.length"
                    :src="perfil.fotos[0]"
                    alt="Foto principal"
                    @error="removeBrokenPhoto(0)"
                  />
                  <span v-else>{{ initials }}</span>
                  <span class="perfil-avatar-overlay">Cambiar</span>
                </button>
                <input
                  ref="fileInput"
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  class="hidden-input"
                  @change="uploadFoto($event, true)"
                />
              </div>

              <div class="perfil-name-block">
                <h1 class="perfil-name">
                  {{ perfil.nombre
                  }}<span class="perfil-age" v-if="edad">, {{ edad }}</span>
                </h1>
                <p class="text-muted text-sm">
                  {{ perfil.direccion || "Ubicacion no establecida" }}
                </p>
                <button
                  class="btn btn-primary btn-sm location-btn"
                  @click="$router.push('/ubicacion')"
                >
                  Cambiar ubicacion
                </button>
              </div>

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
                  <span class="stat-num text-primary">4.9</span>
                  <span class="stat-label">Valoracion</span>
                </div>
              </div>
            </div>
          </div>

          <div class="card perfil-bio-card fade-in-up">
            <div class="perfil-bio-header">
              <h3>Sobre mi</h3>
              <button
                class="btn btn-ghost btn-sm"
                @click="editingBio = !editingBio"
              >
                {{ editingBio ? "Cancelar" : "Editar" }}
              </button>
            </div>
            <div v-if="editingBio">
              <textarea
                class="form-textarea"
                v-model="bioText"
                placeholder="Escribe algo sobre ti..."
              ></textarea>
              <button
                class="btn btn-primary btn-sm"
                style="margin-top: 0.75rem"
                @click="saveBio"
              >
                Guardar
              </button>
            </div>
            <p v-else class="text-muted">
              {{ perfil.descripcion || "Sin descripcion todavia." }}
            </p>
          </div>

          <div
            class="card perfil-photos-card fade-in-up"
            v-if="perfil.fotos && perfil.fotos.length > 1"
          >
            <h3>Mis fotos</h3>
            <div class="perfil-photos-grid">
              <img
                v-for="(foto, i) in perfil.fotos"
                :key="foto"
                :src="foto"
                :alt="i === 0 ? 'Foto principal' : `Foto ${i + 1}`"
                class="perfil-photo"
                @error="removeBrokenPhoto(i)"
              />
            </div>
          </div>

          <div class="card perfil-addphoto-card fade-in-up">
            <h3>Agregar foto</h3>
            <label class="photo-upload-label" :class="{ disabled: uploading }">
              <input
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                :disabled="uploading"
                @change="uploadFoto($event, false)"
              />
              <span>{{ uploading ? "Subiendo..." : "+ Subir foto" }}</span>
            </label>
            <p
              v-if="uploadMsg"
              class="text-sm"
              :class="uploadMsg === 'Foto subida' ? 'text-primary' : 'text-muted'"
            >
              {{ uploadMsg }}
            </p>
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

const drawerOpen = ref(false);
const loading = ref(false);
const uploading = ref(false);
const perfil = ref({ nombre: "", fotos: [], stats: {} });
const editingBio = ref(false);
const bioText = ref("");
const fileInput = ref(null);
const uploadMsg = ref("");

const API = "http://localhost:3000/api";
const MAX_PHOTO_SIZE = 10 * 1024 * 1024;
const ALLOWED_PHOTO_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];

onMounted(async () => {
  loading.value = true;
  try {
    const { data } = await axios.get(`${API}/perfil`, {
      withCredentials: true,
    });
    perfil.value = data;
    bioText.value = data.descripcion || "";
  } catch (e) {
    console.error(e);
  }
  loading.value = false;
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

function triggerUpload() {
  fileInput.value?.click();
}

function removeBrokenPhoto(index) {
  perfil.value.fotos = (perfil.value.fotos || []).filter((_, i) => i !== index);
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

async function uploadFoto(e, principal = false) {
  const input = e.target;
  const file = input.files?.[0];
  if (!file || uploading.value) return;

  const error = validatePhoto(file);
  if (error) {
    uploadMsg.value = error;
    input.value = "";
    setTimeout(() => (uploadMsg.value = ""), 3000);
    return;
  }

  uploading.value = true;
  uploadMsg.value = "Subiendo...";

  const fd = new FormData();
  fd.append("foto", file);
  fd.append("principal", String(principal));

  try {
    const { data } = await axios.post(`${API}/perfil/foto`, fd, {
      withCredentials: true,
    });

    const currentPhotos = perfil.value.fotos || [];
    perfil.value.fotos = principal
      ? [data.url, ...currentPhotos]
      : [...currentPhotos, data.url];
    uploadMsg.value = "Foto subida";
  } catch (err) {
    uploadMsg.value = err.response?.data?.error || "Error al subir foto";
  } finally {
    uploading.value = false;
    input.value = "";
    setTimeout(() => (uploadMsg.value = ""), 3000);
  }
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
.perfil-avatar-wrap {
  margin-top: -50px;
  position: relative;
  width: fit-content;
}
.perfil-avatar {
  cursor: pointer;
  border: 4px solid white;
  box-shadow: var(--shadow-md);
  position: relative;
  overflow: hidden;
  background: var(--primary-soft);
  color: var(--primary);
  font-size: 2.2rem;
  font-weight: 700;
}
.perfil-avatar:disabled {
  cursor: wait;
  opacity: 0.8;
}
.perfil-avatar img {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
  object-position: center;
  border-radius: 50%;
}
.perfil-avatar-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity var(--transition);
  border-radius: 50%;
  font-size: 0.78rem;
  font-weight: 800;
}
.perfil-avatar:hover .perfil-avatar-overlay {
  opacity: 1;
}
.hidden-input {
  display: none;
}

.perfil-name-block {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}
.location-btn {
  width: fit-content;
  margin-top: 0.35rem;
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

.perfil-bio-card {
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.perfil-bio-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.perfil-photos-card {
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
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

.perfil-addphoto-card {
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.photo-upload-label {
  display: inline-flex;
  cursor: pointer;
}
.photo-upload-label.disabled {
  cursor: wait;
  opacity: 0.7;
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
}

@media (max-width: 480px) {
  .perfil-cover {
    height: 100px;
  }

  .perfil-avatar-wrap {
    margin-top: -42px;
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
}
</style>
