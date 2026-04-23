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

          <!-- Capacidad -->
          <div class="form-group">
            <label class="form-label">Capacidad máxima *</label>
            <input
              class="form-input"
              v-model.number="form.max_asistentes"
              type="number"
              min="2"
              max="100"
              step="1"
              required
            />
          </div>

          <!-- Ubicación -->
          <div class="form-group">
            <label class="form-label">Ubicación del plan *</label>
            <div class="location-summary" :class="{ 'location-summary-empty': !selectedAddress }">
              <p class="location-summary-title">
                {{ selectedAddress || "Haz clic en el mapa para elegir dónde será el plan" }}
              </p>
              <p v-if="form.lat && form.lng" class="location-summary-coords">
                Lat {{ Number(form.lat).toFixed(5) }} · Lng {{ Number(form.lng).toFixed(5) }}
              </p>
            </div>
            <div id="plan-location-map" class="plan-location-map"></div>
            <div class="location-row">
              <input
                class="form-input"
                v-model="form.lat"
                type="number"
                step="any"
                placeholder="Latitud"
                required
                readonly
              />
              <input
                class="form-input"
                v-model="form.lng"
                type="number"
                step="any"
                placeholder="Longitud"
                required
                readonly
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
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from "vue";
import NavBar from "../components/NavBar.vue";
import SideDrawer from "../components/SideDrawer.vue";
import { usePlanesStore } from "../stores/planesStore";
import { useAuthStore } from "../stores/authStore";
import { useRouter } from "vue-router";
import axios from "axios";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const drawerOpen = ref(false);
const router = useRouter();
const planesStore = usePlanesStore();
const authStore = useAuthStore();
const fileInput = ref(null);
const previews = ref([]);
const files = ref([]);
const submitting = ref(false);
const error = ref("");
const intereses = ref([]);
const selectedAddress = ref("");

let map = null;
let marker = null;

const form = ref({
  titulo: "",
  id_interes: "",
  descripcion: "",
  fecha_plan: "",
  max_asistentes: 8,
  lat: "",
  lng: "",
});

const API = "http://localhost:3000/api";

onMounted(async () => {
  try {
    const [{ data }, perfil] = await Promise.all([
      axios.get(`${API}/intereses`),
      loadUserProfileLocation(),
    ]);
    intereses.value = data;
    await nextTick();
    initializeMap(perfil);
  } catch (e) {}
});

onBeforeUnmount(() => {
  if (map) {
    map.remove();
    map = null;
  }
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
    updateSelectedLocation(pos.coords.latitude, pos.coords.longitude, true);
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

async function loadUserProfileLocation() {
  try {
    return await authStore.fetchPerfil();
  } catch (e) {
    return null;
  }
}

function initializeMap(perfil) {
  const defaultLat = Number(perfil?.lat) || 40.4168;
  const defaultLng = Number(perfil?.lng) || -3.7038;

  map = L.map("plan-location-map").setView([defaultLat, defaultLng], 13);

  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "&copy; OpenStreetMap",
  }).addTo(map);

  marker = L.marker([defaultLat, defaultLng]).addTo(map);

  if (perfil?.lat && perfil?.lng) {
    updateSelectedLocation(defaultLat, defaultLng, false);
  }

  map.on("click", async (e) => {
    await updateSelectedLocation(e.latlng.lat, e.latlng.lng, false);
  });

  setTimeout(() => map?.invalidateSize(), 200);
}

async function updateSelectedLocation(lat, lng, moveMap = false) {
  form.value.lat = Number(lat).toFixed(8);
  form.value.lng = Number(lng).toFixed(8);

  if (marker) {
    marker.setLatLng([lat, lng]).bindPopup("Ubicación del plan").openPopup();
  }

  if (moveMap && map) {
    map.setView([lat, lng], 14);
  }

  selectedAddress.value = await reverseGeocode(lat, lng);
}

async function reverseGeocode(lat, lng) {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`
    );
    const data = await response.json();
    return data.address?.road || data.display_name || "Ubicación seleccionada";
  } catch (e) {
    return "Ubicación seleccionada";
  }
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
.location-summary {
  margin-bottom: 0.9rem;
  padding: 1rem;
  border-radius: var(--radius-md);
  background: rgba(244, 63, 94, 0.08);
  border: 1px solid rgba(244, 63, 94, 0.12);
}
.location-summary-empty {
  background: #fff7f8;
}
.location-summary-title {
  font-weight: 700;
  color: var(--text);
}
.location-summary-coords {
  margin-top: 0.35rem;
  font-size: 0.85rem;
  color: var(--text-muted);
}
.plan-location-map {
  height: 280px;
  width: 100%;
  border-radius: var(--radius-md);
  border: 1px solid var(--card-border);
  margin-bottom: 0.9rem;
  overflow: hidden;
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

@media (max-width: 768px) {
  .crear-container {
    padding: 1.25rem 0 5.5rem;
    gap: 1.25rem;
  }

  .crear-form {
    padding: 1.25rem;
    gap: 1.25rem;
  }

  .form-actions {
    justify-content: stretch;
  }

  .form-actions .btn {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .location-row {
    flex-direction: column;
  }

  .location-row .form-input {
    min-width: 0;
    width: 100%;
  }

  .plan-location-map {
    height: 240px;
  }

  .foto-preview-wrap,
  .foto-add-more {
    width: 78px;
    height: 78px;
  }
}
</style>
