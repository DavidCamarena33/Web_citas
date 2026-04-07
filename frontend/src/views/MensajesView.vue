<template>
  <div class="page-layout">
    <NavBar @toggle-drawer="drawerOpen = true" />
    <SideDrawer :open="drawerOpen" @close="drawerOpen = false" />

    <main class="page-content">
      <div class="mensajes-layout" :class="{ 'chat-open': activeConv }">
        <!-- Sidebar: Conversations -->
        <aside class="conv-sidebar">
          <div class="conv-sidebar-header">
            <h2>Messages</h2>
          </div>
          <div v-if="loading" class="loading-center">
            <div class="spinner"></div>
          </div>
          <div v-else-if="conversaciones.length === 0" class="empty-state">
            <span class="empty-icon">💬</span>
            <p>No tienes conversaciones aún.</p>
          </div>
          <div v-else class="conv-list">
            <div
              v-for="conv in conversaciones"
              :key="conv.solicitud_id"
              class="conv-item"
              :class="{
                active: activeConv?.solicitud_id === conv.solicitud_id,
              }"
              @click="selectConv(conv)"
            >
              <div class="avatar avatar-md conv-avatar">
                {{ conv.contacto_nombre?.[0] }}
              </div>
              <div class="conv-info">
                <div class="conv-name font-bold">
                  {{ conv.contacto_nombre }}
                </div>
                <div class="conv-plan text-xs text-muted">
                  📋 {{ conv.plan_titulo }}
                </div>
                <div class="conv-last text-sm text-muted">
                  {{ conv.ultimo_mensaje || "Sin mensajes" }}
                </div>
              </div>
              <span
                v-if="conv.ultima_fecha"
                class="conv-time text-xs text-muted"
              >
                {{ timeAgo(conv.ultima_fecha) }}
              </span>
            </div>
          </div>
        </aside>

        <!-- Chat Window -->
        <section v-if="activeConv" class="chat-window">
          <div class="chat-header">
            <button class="btn-icon" @click="activeConv = null">←</button>
            <div class="avatar avatar-md">
              {{ activeConv.contacto_nombre?.[0] }}
            </div>
            <div>
              <div class="font-bold">{{ activeConv.contacto_nombre }}</div>
              <div class="text-xs text-muted">{{ activeConv.plan_titulo }}</div>
            </div>
          </div>

          <div class="chat-messages" ref="messagesEl">
            <div v-if="loadingMsgs" class="loading-center">
              <div class="spinner"></div>
            </div>
            <div
              v-for="msg in mensajes"
              :key="msg.id"
              class="msg-bubble"
              :class="msg.id_emisor === myId ? 'msg-sent' : 'msg-recv'"
            >
              <span class="msg-sender text-xs" v-if="msg.id_emisor !== myId">{{
                msg.emisor_nombre
              }}</span>
              {{ msg.mensaje }}
              <span class="msg-time text-xs">{{
                formatTime(msg.fecha_creacion)
              }}</span>
            </div>
          </div>

          <div class="chat-input-row">
            <input
              v-model="newMsg"
              class="form-input chat-input"
              placeholder="Escribe un mensaje..."
              @keydown.enter="sendMsg"
            />
            <button
              class="btn btn-primary"
              @click="sendMsg"
              :disabled="!newMsg.trim()"
            >
              Enviar
            </button>
          </div>
        </section>

        <!-- Welcome state -->
        <section v-else class="chat-welcome">
          <div class="empty-state">
            <span class="empty-icon">💬</span>
            <h3>Selecciona una conversación</h3>
            <p>Tus chats de planes aparecerán aquí.</p>
          </div>
        </section>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, computed } from "vue";
import NavBar from "../components/NavBar.vue";
import SideDrawer from "../components/SideDrawer.vue";
import axios from "axios";
import { useAuthStore } from "../stores/authStore";

const auth = useAuthStore();
const drawerOpen = ref(false);
const loading = ref(false);
const loadingMsgs = ref(false);
const conversaciones = ref([]);
const activeConv = ref(null);
const mensajes = ref([]);
const newMsg = ref("");
const messagesEl = ref(null);

const myId = computed(() => auth.user?.id);

const API = "http://localhost:3000/api";

onMounted(async () => {
  loading.value = true;
  try {
    const { data } = await axios.get(`${API}/mensajes/conversaciones`, {
      withCredentials: true,
    });
    conversaciones.value = data;
  } catch (e) {
    console.error(e);
  }
  loading.value = false;
});

async function selectConv(conv) {
  activeConv.value = conv;
  loadingMsgs.value = true;
  try {
    const { data } = await axios.get(`${API}/mensajes/${conv.solicitud_id}`, {
      withCredentials: true,
    });
    mensajes.value = data;
  } catch (e) {
    mensajes.value = [];
  }
  loadingMsgs.value = false;
  await nextTick();
  if (messagesEl.value)
    messagesEl.value.scrollTop = messagesEl.value.scrollHeight;
}

async function sendMsg() {
  if (!newMsg.value.trim() || !activeConv.value) return;
  try {
    await axios.post(
      `${API}/mensajes`,
      {
        id_solicitud: activeConv.value.solicitud_id,
        mensaje: newMsg.value.trim(),
      },
      { withCredentials: true },
    );
    newMsg.value = "";
    await selectConv(activeConv.value);
  } catch (e) {
    console.error(e);
  }
}

function timeAgo(d) {
  const diff = Date.now() - new Date(d).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "ahora";
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return new Date(d).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
  });
}
function formatTime(d) {
  return new Date(d).toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  });
}
</script>

<style scoped>
.mensajes-layout {
  display: grid;
  grid-template-columns: 340px 1fr;
  height: calc(100vh - 68px);
}

.conv-sidebar {
  display: flex;
  flex-direction: column;
  border-right: 1px solid var(--card-border);
  background: var(--card-bg);
  overflow: hidden;
}
.conv-sidebar-header {
  padding: 1.5rem;
  border-bottom: 1px solid var(--card-border);
}
.conv-list {
  overflow-y: auto;
  flex: 1;
}
.conv-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.9rem 1.25rem;
  cursor: pointer;
  border-bottom: 1px solid var(--card-border);
  transition: background var(--transition);
}
.conv-item:hover,
.conv-item.active {
  background: var(--primary-soft);
}
.conv-avatar {
  background: var(--primary-soft);
  color: var(--primary);
  font-weight: 700;
}
.conv-info {
  flex: 1;
  min-width: 0;
}
.conv-name {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.conv-plan,
.conv-last {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.conv-time {
  flex-shrink: 0;
}

.chat-window {
  display: flex;
  flex-direction: column;
  background: var(--bg);
}
.chat-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
  background: var(--card-bg);
  border-bottom: 1px solid var(--card-border);
}
.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.msg-bubble {
  max-width: 70%;
  padding: 0.65rem 1rem;
  border-radius: var(--radius-md);
  font-size: 0.95rem;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}
.msg-sent {
  background: var(--primary);
  color: #fff;
  align-self: flex-end;
  border-bottom-right-radius: 4px;
}
.msg-recv {
  background: var(--card-bg);
  color: var(--text);
  align-self: flex-start;
  border-bottom-left-radius: 4px;
  box-shadow: var(--shadow-sm);
}
.msg-sender {
  opacity: 0.7;
  font-weight: 600;
}
.msg-time {
  opacity: 0.6;
  align-self: flex-end;
}

.chat-input-row {
  display: flex;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  background: var(--card-bg);
  border-top: 1px solid var(--card-border);
}
.chat-input {
  flex: 1;
}

.chat-welcome {
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg);
}

@media (max-width: 700px) {
  .mensajes-layout {
    grid-template-columns: 1fr;
  }
  .chat-window {
    display: none;
  }
  .mensajes-layout.chat-open .conv-sidebar {
    display: none;
  }
  .mensajes-layout.chat-open .chat-window {
    display: flex;
  }
}
</style>
