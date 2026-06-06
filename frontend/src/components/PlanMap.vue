<template>
  <div class="plan-map-wrap">
    <div ref="mapContainer" class="plan-map"></div>
    <button
      v-if="userCoords"
      class="map-my-location"
      @click="flyToUser"
      title="Centrar en mi ubicación"
    >
      <span class="material-symbols-outlined">my_location</span>
    </button>
    <div v-if="!userCoords" class="map-no-location">
      <span class="material-symbols-outlined">location_off</span>
      <span>Configura tu ubicación para ver distancias</span>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted, nextTick } from "vue";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";

const props = defineProps({
  planes: { type: Array, default: () => [] },
  highlightedPlanId: { type: [Number, null], default: null },
  userCoords: { type: Object, default: null },
});

const emit = defineEmits(["select-plan"]);

const mapContainer = ref(null);
let map = null;
let markerClusterGroup = null;
const markerMap = new Map();
let highlightedPlanId = null;

const DEFAULT_CENTER = [40.4168, -3.7038];
const DEFAULT_ZOOM = 6;

function buildPopupContent(plan) {
  const dir = plan.direccion || "";
  const dirHtml = dir ? `<span style="color:#64748b;font-size:0.78rem">${dir}</span><br>` : "";
  return (
    `<strong style="color:#0f172a;font-size:0.88rem">${plan.titulo || "Plan"}</strong><br>` +
    dirHtml +
    `<button class="map-popup-btn" data-plan-id="${plan.id}" style="margin-top:0.35rem;padding:0.3rem 0.7rem;border-radius:9999px;background:linear-gradient(135deg,#f43f5e,#ff7b93);color:#fff;font-size:0.75rem;font-weight:700;border:none;cursor:pointer">Ver plan →</button>`
  );
}

function initMap() {
  if (!mapContainer.value) return;

  map = L.map(mapContainer.value, {
    zoomControl: true,
    attributionControl: false,
  }).setView(DEFAULT_CENTER, DEFAULT_ZOOM);

  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "&copy; OpenStreetMap",
  }).addTo(map);

  L.control.attribution({ position: "bottomright", prefix: false }).addTo(map);

  markerClusterGroup = L.markerClusterGroup({
    chunkedLoading: true,
    maxClusterRadius: 50,
    iconCreateFunction: function (cluster) {
      const count = cluster.getChildCount();
      let size = "small";
      if (count >= 20) size = "large";
      else if (count >= 8) size = "medium";

      return L.divIcon({
        html: `<div class="cluster-icon cluster-${size}"><span>${count}</span></div>`,
        className: "cluster-container",
        iconSize: L.point(40, 40),
      });
    },
  });

  map.addLayer(markerClusterGroup);
  setTimeout(() => map.invalidateSize(), 200);

  window.addEventListener("resize", onResize);

  map.on("popupopen", () => {
    setTimeout(() => {
      document.querySelectorAll(".map-popup-btn").forEach((btn) => {
        if (!btn.hasAttribute("data-listener")) {
          btn.setAttribute("data-listener", "1");
          btn.addEventListener("click", (e) => {
            e.stopPropagation();
            const planId = Number(btn.getAttribute("data-plan-id"));
            if (planId) emit("select-plan", planId);
          });
        }
      });
    }, 10);
  });
}

function clearMarkers() {
  if (!markerClusterGroup) return;
  markerClusterGroup.clearLayers();
  markerMap.clear();
  highlightedPlanId = null;
}

function buildMarkers() {
  if (!markerClusterGroup || !map) return;

  clearMarkers();

  const validPlanes = props.planes
    .filter((p) => p.lat && p.lng)
    .map((p) => ({ ...p, lat: Number(p.lat), lng: Number(p.lng) }));

  if (validPlanes.length === 0) {
    map.setView(DEFAULT_CENTER, DEFAULT_ZOOM);
    return;
  }

  validPlanes.forEach((plan) => {
    const marker = L.circleMarker([plan.lat, plan.lng], {
      radius: 8,
      fillColor: "#f43f5e",
      color: "#ffffff",
      weight: 2.5,
      opacity: 1,
      fillOpacity: 0.9,
    });

    marker.bindPopup(buildPopupContent(plan));

    markerClusterGroup.addLayer(marker);
    markerMap.set(plan.id, marker);
  });

  try {
    const bounds = L.latLngBounds(validPlanes.map((p) => [p.lat, p.lng]));
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [25, 25], maxZoom: 14 });
    }
  } catch (_) {}
}

function applyHighlight(planId) {
  if (highlightedPlanId != null && markerMap.has(highlightedPlanId)) {
    markerMap.get(highlightedPlanId).setStyle({
      radius: 8,
      fillColor: "#f43f5e",
      fillOpacity: 0.9,
    });
  }

  highlightedPlanId = planId;

  if (planId != null && markerMap.has(planId)) {
    markerMap.get(planId).setStyle({
      radius: 14,
      fillColor: "#fbbf24",
      fillOpacity: 1,
    });
  }
}

watch(
  () => props.planes,
  () => {
    if (map) {
      nextTick(() => {
        buildMarkers();
        if (props.highlightedPlanId != null) {
          nextTick(() => applyHighlight(props.highlightedPlanId));
        }
      });
    }
  },
  { deep: true }
);

watch(
  () => props.highlightedPlanId,
  (newId) => {
    if (map) applyHighlight(newId);
  }
);

onMounted(() => {
  nextTick(() => {
    initMap();
    nextTick(() => buildMarkers());
  });
});

onUnmounted(() => {
  window.removeEventListener("resize", onResize);
  if (map) {
    map.remove();
    map = null;
    markerClusterGroup = null;
    markerMap.clear();
  }
});

function onResize() {
  if (map) map.invalidateSize();
}

function flyToUser() {
  if (!map || !props.userCoords) return;
  const { lat, lng } = props.userCoords;
  map.flyTo([Number(lat), Number(lng)], 14, { duration: 1.2 });
}
</script>

<style>
.plan-map-wrap {
  height: 320px;
  flex-shrink: 0;
  border-radius: var(--radius-lg);
  overflow: hidden;
  position: relative;
  border: 1px solid rgba(244, 63, 94, 0.1);
  box-shadow: 0 4px 20px rgba(15, 23, 42, 0.04);
}

.plan-map {
  width: 100%;
  height: 100%;
}

.map-my-location {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(244, 63, 94, 0.15);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: all 0.2s ease;
  color: var(--text-muted);
}

.map-my-location:hover {
  background: var(--primary);
  color: #fff;
  border-color: var(--primary);
  box-shadow: 0 4px 14px rgba(244, 63, 94, 0.3);
}

.map-my-location .material-symbols-outlined {
  font-size: 1.1rem;
}

.map-no-location {
  position: absolute;
  top: 0.75rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.4rem 0.85rem;
  border-radius: var(--radius-pill);
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(6px);
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--text-muted);
  z-index: 1000;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
  white-space: nowrap;
}

.map-no-location .material-symbols-outlined {
  font-size: 1rem;
  color: var(--primary);
}

/* Cluster styles */
.cluster-container {
  background: transparent !important;
  border: none !important;
}

.cluster-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  font-weight: 800;
  color: #fff;
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.18);
  font-size: 0.8rem;
}

.cluster-small {
  background: linear-gradient(135deg, #f43f5e, #fb7185);
  width: 35px;
  height: 35px;
  font-size: 0.75rem;
}

.cluster-medium {
  background: linear-gradient(135deg, #e11d48, #f43f5e);
}

.cluster-large {
  background: linear-gradient(135deg, #be123c, #e11d48);
  width: 46px;
  height: 46px;
  font-size: 0.9rem;
}

/* Override Leaflet popup */
.leaflet-popup-content-wrapper {
  border-radius: 12px !important;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.12) !important;
}

.leaflet-popup-content {
  margin: 10px 14px !important;
  font-family: "Inter", sans-serif !important;
  font-size: 0.85rem !important;
  line-height: 1.4 !important;
}

@media (max-width: 640px) {
  .plan-map-wrap {
    height: 220px;
    border-radius: var(--radius-md);
  }
}
</style>
