<template>
  <div class="page-layout">
    <NavBar @toggle-drawer="drawerOpen = true" />
    <SideDrawer :open="drawerOpen" @close="drawerOpen = false" />

    <main class="page-content">
      <div class="mensajes-layout" :class="{ 'chat-open': activeConv }">
        <!-- Sidebar: Conversations -->
        <aside class="conv-sidebar">
          <div class="conv-sidebar-header">
            <h2>Mensajes</h2>
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
              :key="conv.chat_key"
              class="conv-item"
              :class="{
                active: activeConv?.chat_key === conv.chat_key,
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
                <div v-if="conv.chat_type === 'group' && conv.participantes" class="conv-plan text-xs text-muted">
                  👥 {{ conv.participantes }}
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
              <div v-if="activeConv.chat_type === 'group' && activeConv.participantes" class="text-xs text-muted">
                {{ activeConv.participantes }}
              </div>
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
              :class="Number(msg.id_emisor) === myId ? 'msg-sent' : 'msg-recv'"
            >
              <span class="msg-sender text-xs" v-if="Number(msg.id_emisor) !== myId">{{
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
import { ref, onMounted, onBeforeUnmount, nextTick, computed } from "vue";
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
let pollingId = null;

const myId = computed(() => Number(auth.user?.id || 0));

const API = "http://localhost:3000/api";

onMounted(async () => {
  loading.value = true;
  try {
    if (!auth.user && !auth.isAuthenticated) {
      await auth.checkAuth();
    }
    await loadConversaciones();
    startPolling();
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
});

onBeforeUnmount(() => {
  stopPolling();
});

async function loadConversaciones() {
  const { data } = await axios.get(`${API}/mensajes/conversaciones`, {
    withCredentials: true,
  });
  conversaciones.value = data;

  if (activeConv.value) {
    const updatedConv = data.find(
      (conv) => conv.chat_key === activeConv.value.chat_key
    );
    activeConv.value = updatedConv || null;
  }
}

async function loadMensajes({ showLoader = false, keepScroll = true } = {}) {
  if (!activeConv.value) {
    mensajes.value = [];
    return;
  }

  const shouldStickToBottom = keepScroll ? isNearBottom() : true;
  if (showLoader) loadingMsgs.value = true;

  try {
    const { data } = await axios.get(`${API}/mensajes/${activeConv.value.chat_key}`, {
      withCredentials: true,
    });
    mensajes.value = data;
  } catch (e) {
    mensajes.value = [];
  } finally {
    if (showLoader) loadingMsgs.value = false;
  }

  await nextTick();
  if (shouldStickToBottom) {
    scrollToBottom();
  }
}

async function selectConv(conv) {
  activeConv.value = conv;
  await loadMensajes({ showLoader: true, keepScroll: false });
}

async function sendMsg() {
  if (!newMsg.value.trim() || !activeConv.value) return;
  try {
    await axios.post(
      `${API}/mensajes`,
      {
        chat_key: activeConv.value.chat_key,
        mensaje: newMsg.value.trim(),
      },
      { withCredentials: true },
    );
    newMsg.value = "";
    await Promise.all([loadConversaciones(), loadMensajes({ keepScroll: false })]);
  } catch (e) {
    console.error(e);
  }
}

function startPolling() {
  stopPolling();
  pollingId = window.setInterval(async () => {
    try {
      await loadConversaciones();
      if (activeConv.value) {
        await loadMensajes();
      }
    } catch (e) {
      console.error(e);
    }
  }, 2000);
}

function stopPolling() {
  if (pollingId) {
    window.clearInterval(pollingId);
    pollingId = null;
  }
}

function scrollToBottom() {
  if (messagesEl.value) {
    messagesEl.value.scrollTop = messagesEl.value.scrollHeight;
  }
}

function isNearBottom() {
  if (!messagesEl.value) return true;
  const { scrollTop, scrollHeight, clientHeight } = messagesEl.value;
  return scrollHeight - (scrollTop + clientHeight) < 80;
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
    height: calc(100vh - 76px);
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

  .conv-sidebar-header,
  .chat-header,
  .chat-input-row {
    padding-left: 1rem;
    padding-right: 1rem;
  }

  .chat-messages {
    padding: 1rem;
  }

  .msg-bubble {
    max-width: 88%;
  }
}

@media (max-width: 480px) {
  .conv-item {
    padding: 0.8rem 1rem;
  }

  .chat-input-row {
    flex-direction: column;
  }

  .chat-input-row .btn {
    width: 100%;
  }
}
</style>
