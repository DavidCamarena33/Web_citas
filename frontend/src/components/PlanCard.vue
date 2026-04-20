<template>
  <div class="plan-card" @click="$emit('click', plan)">
    <div class="pc-img-wrap">
      <img
        v-if="plan.foto"
        :src="plan.foto"
        :alt="plan.titulo"
        class="pc-img"
      />
      <div v-else class="pc-img pc-placeholder">
        <span class="material-symbols-outlined" style="font-size:3rem">join_inner</span>
      </div>
      <div class="pc-fav-btn">
        <span class="material-symbols-outlined" style="font-size: 1.125rem">favorite</span>
      </div>
    </div>

    <div class="pc-body">
      <div class="pc-host">
        <div class="pc-host-avatar"></div>
        <span class="pc-host-name">Plan de {{ hostName }}</span>
      </div>

      <h4 class="pc-title">{{ plan.titulo }}</h4>

      <div class="pc-date">
        <span class="material-symbols-outlined" style="font-size: 0.875rem">schedule</span>
        {{ formatDate(plan.fecha_plan) || 'Por definir' }}
      </div>

      <p class="pc-location">{{ locationLabel }}</p>

      <button class="pc-btn" @click.stop="$emit('join', plan)">
        Unirme al plan
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  plan: { type: Object, required: true },
  maxSpots: { type: Number, default: 8 },
});
defineEmits(["click", "join"]);

const hostName = computed(() => props.plan.host_nombre || "Usuario");

const excerpt = computed(() => {
  const d = props.plan.descripcion || "";
  return d.length > 80 ? d.slice(0, 80) + "…" : d;
});

const spotsLeft = computed(() => {
  const filled = props.plan.spots_filled || 0;
  return Math.max(0, props.maxSpots - filled);
});

const locationLabel = computed(() => props.plan.direccion || "Por determinar");

const badgeClass = computed(() => {
  const cat = (props.plan.categoria || "").toLowerCase();
  const map = {
    deporte: "badge-sport",
    gastronomía: "badge-food",
    gastronomia: "badge-food",
    cultura: "badge-culture",
    ocio: "badge-new",
    lifestyle: "badge-health",
    fiesta: "badge-food",
  };
  return map[cat] || "badge-new";
});

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
.plan-card {
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 0.75rem; /* xl */
  padding: 0.75rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); /* shadow-md */
  border: 1px solid rgba(244, 63, 94, 0.05);
  cursor: pointer;
  transition: all var(--transition);
}
.plan-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.pc-img-wrap {
  position: relative;
  height: 12rem; /* 48 */
  width: 100%;
  overflow: hidden;
  border-radius: 0.5rem; /* lg */
}
.pc-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.pc-placeholder {
  background: var(--primary-soft);
  color: var(--primary);
  display: flex; align-items: center; justify-content: center;
}

.pc-fav-btn {
  position: absolute;
  top: 0.5rem; right: 0.5rem;
  display: flex; align-items: center; justify-content: center;
  width: 2rem; height: 2rem;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.2);
  color: #fff;
  backdrop-filter: blur(4px);
}

.pc-body {
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  padding: 0 0.25rem;
  flex: 1;
}

.pc-host {
  display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem;
}
.pc-host-avatar {
  width: 1.5rem; height: 1.5rem; border-radius: 50%;
  background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuACBENzfqcdZgOcmKmMFE3HoqnMtBuQjNTL3MTTjSx0sPEmZGLb5r8zYY-XM_eCfTOywlfI4o6ovu2C4hwrKJuRg_8OJX7BzA5UCB6DRgGeGcXiY1-ZgHbrk5aOnurV4HscDnlPseq386xZgvJaQO73LULfKtV6Tdvsog91PLhbNv23feZeiBdbYaS6LtCiWf4bI0KqYjI9RaVIPp9PTq59mQpNgAeM9Es5bD1ZS5-_bYkgv_hHb1V4qnrCMIIiVIMDZ6Et0BRosCg');
  background-size: cover;
  background-position: center;
}
.pc-host-name {
  font-size: 0.75rem; font-weight: 600; color: #64748b; /* slate-500 */
}

.pc-title {
  font-weight: 700;
  color: #0f172a; /* slate-900 */
  line-height: 1.375;
}

.pc-date {
  margin-top: 0.5rem; display: flex; align-items: center; gap: 0.25rem;
  font-size: 0.6875rem; /* ~11px */
  font-weight: 700;
  color: var(--primary);
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.pc-location {
  margin-top: 0.25rem;
  font-size: 0.75rem;
  color: #64748b; /* slate-500 */
}

.pc-btn {
  margin-top: auto;
  padding-top: 1rem;
  width: 100%;
  border-radius: 0.5rem;
  background: rgba(244, 63, 94, 0.1);
  padding: 0.5rem;
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--primary);
  border: none;
  cursor: pointer;
  transition: background 0.2s;
}
.pc-btn:hover {
  background: rgba(244, 63, 94, 0.2);
}
</style>
