<template>
  <div class="page-layout">
    <NavBar @toggle-drawer="drawerOpen = true" />
    <SideDrawer :open="drawerOpen" @close="drawerOpen = false" />

    <main class="page-content">
      <div class="container crear-container">
        <div class="crear-header fade-in-up">
          <button class="btn btn-ghost btn-sm" @click="$router.back()">
            ← Volver
          </button>
          <h1>Crear un Plan</h1>
          <p class="text-muted">
            Organiza una actividad y encuentra personas con quien compartirla.
          </p>
        </div>

        <form class="crear-form card fade-in-up" @submit.prevent="crearPlan">
          <!-- Título -->
          <div class="form-group">
            <label class="form-label">Título del plan *</label>
            <input
              class="form-input"
              v-model="form.titulo"
              placeholder="Ej: Senderismo por la Sierra"
              required
              maxlength="150"
            />
          </div>

          <!-- Interés -->
          <div class="form-group">
            <label class="form-label">Tipo de actividad *</label>
            <select class="form-select" v-model="form.id_interes" required>
              <option value="" disabled>Selecciona una categoría</option>
              <optgroup
                v-for="cat in groupedIntereses"
                :key="cat.categoria"
                :label="cat.categoria"
              >
                <option v-for="i in cat.intereses" :key="i.id" :value="i.id">
                  {{ i.nombre }}
                </option>
              </optgroup>
            </select>
          </div>

          <!-- Descripción -->
          <div class="form-group">
            <label class="form-label">Descripción *</label>
            <textarea
              class="form-textarea"
              v-model="form.descripcion"
              placeholder="Describe el plan, qué haréis, qué llevar..."
              required
            ></textarea>
          </div>

          <!-- Fecha -->
          <div class="form-group">
            <label class="form-label">Fecha y hora</label>
            <input
              class="form-input"
              v-model="form.fecha_plan"
              type="datetime-local"
            />
          </div>

          <!-- Ubicación -->
          <div class="form-group">
            <label class="form-label">Ubicación (Lat, Lng) *</label>
            <div class="location-row">
              <input
                class="form-input"
                v-model="form.lat"
                type="number"
                step="any"
                placeholder="Latitud"
                required
              />
              <input
                class="form-input"
                v-model="form.lng"
                type="number"
                step="any"
                placeholder="Longitud"
                required
              />
              <button
                type="button"
                class="btn btn-ghost btn-sm"
                @click="useMyLocation"
              >
                📍 Posición
              </button>
            </div>
          </div>

          <!-- Fotos -->
          <div class="form-group">
            <label class="form-label">Fotos (máx. 5)</label>
            <div class="fotos-upload-area" @click="fileInput.click()">
              <input
                ref="fileInput"
                type="file"
                multiple
                accept="image/*"
                @change="handleFiles"
                style="display: none"
              />
              <div class="fotos-grid" v-if="previews.length">
                <div
                  v-for="(p, i) in previews"
                  :key="i"
                  class="foto-preview-wrap"
                >
                  <img :src="p" class="foto-preview" />
                  <button
                    type="button"
                    class="foto-remove"
                    @click.stop="removeFile(i)"
                  >
                    ✕
                  </button>
                </div>
                <div
                  class="foto-add-more"
                  v-if="previews.length < 5"
                  @click.stop="fileInput.click()"
                >
                  +
                </div>
              </div>
              <div v-else class="fotos-placeholder">
                <span>🖼️</span>
                <p>Haz clic para añadir fotos</p>
                <p class="text-xs text-muted">
                  JPG, PNG, WEBP – hasta 10MB por foto
                </p>
              </div>
            </div>
          </div>

          <!-- Submit -->
          <div class="form-actions">
            <button
              type="submit"
              class="btn btn-primary"
              :disabled="submitting"
            >
              {{ submitting ? "Creando..." : "✨ Publicar plan" }}
            </button>
          </div>

          <p v-if="error" class="form-error text-sm">⚠️ {{ error }}</p>
        </form>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import NavBar from "../components/NavBar.vue";
import SideDrawer from "../components/SideDrawer.vue";
import { usePlanesStore } from "../stores/planesStore";
import { useRouter } from "vue-router";
import axios from "axios";

const drawerOpen = ref(false);
const router = useRouter();
const planesStore = usePlanesStore();
const fileInput = ref(null);
const previews = ref([]);
const files = ref([]);
const submitting = ref(false);
const error = ref("");
const intereses = ref([]);

const form = ref({
  titulo: "",
  id_interes: "",
  descripcion: "",
  fecha_plan: "",
  lat: "",
  lng: "",
});

const API = "http://localhost:3000/api";

onMounted(async () => {
  try {
    const { data } = await axios.get(`${API}/intereses`);
    intereses.value = data;
  } catch (e) {}
});

const groupedIntereses = computed(() => {
  const map = {};
  intereses.value.forEach((i) => {
    if (!map[i.categoria])
      map[i.categoria] = { categoria: i.categoria, intereses: [] };
    map[i.categoria].intereses.push(i);
  });
  return Object.values(map);
});

function handleFiles(e) {
  const newFiles = Array.from(e.target.files || []).slice(
    0,
    5 - files.value.length,
  );
  newFiles.forEach((f) => {
    files.value.push(f);
    const reader = new FileReader();
    reader.onload = (ev) => previews.value.push(ev.target.result);
    reader.readAsDataURL(f);
  });
}

function removeFile(i) {
  files.value.splice(i, 1);
  previews.value.splice(i, 1);
}

function useMyLocation() {
  if (!navigator.geolocation) return;
  navigator.geolocation.getCurrentPosition((pos) => {
    form.value.lat = pos.coords.latitude;
    form.value.lng = pos.coords.longitude;
  });
}

async function crearPlan() {
  error.value = "";
  submitting.value = true;
  try {
    const fd = new FormData();
    Object.entries(form.value).forEach(([k, v]) => {
      if (v) fd.append(k, v);
    });
    files.value.forEach((f) => fd.append("fotos", f));
    await planesStore.crearPlan(fd);
    router.push("/mis-planes");
  } catch (e) {
    error.value =
      e?.response?.data?.message ||
      "Error al crear el plan. Revisa los campos.";
  }
  submitting.value = false;
}
</script>

<style scoped>
.crear-container {
  padding: 2rem 0 4rem;
  max-width: 680px;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
.crear-header {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.crear-form {
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
.location-row {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}
.location-row .form-input {
  flex: 1;
  min-width: 120px;
}

.fotos-upload-area {
  border: 2px dashed var(--primary-light);
  border-radius: var(--radius-md);
  min-height: 140px;
  cursor: pointer;
  padding: 1rem;
  transition: all var(--transition);
}
.fotos-upload-area:hover {
  border-color: var(--primary);
  background: var(--primary-soft);
}
.fotos-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  font-size: 2rem;
  padding: 1rem;
}
.fotos-placeholder p {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--primary);
}

.fotos-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}
.foto-preview-wrap {
  position: relative;
  width: 90px;
  height: 90px;
}
.foto-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: var(--radius-sm);
}
.foto-remove {
  position: absolute;
  top: -6px;
  right: -6px;
  width: 22px;
  height: 22px;
  background: var(--primary);
  color: #fff;
  border: none;
  border-radius: 50%;
  font-size: 0.7rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}
.foto-add-more {
  width: 90px;
  height: 90px;
  background: var(--primary-soft);
  color: var(--primary);
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  cursor: pointer;
  font-weight: 700;
  border: 2px dashed var(--primary-light);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
}
.form-error {
  color: var(--primary);
}
</style>
