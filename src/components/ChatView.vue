<template>
  <div class="chat-outer-wrapper" :class="$q.dark.isActive ? 'bg-dark' : 'bg-grey-1'">
    
    <!-- Стан завантаження сесії -->
    <div v-if="!store.isConnected && auth.activeSessionId" class="session-loading-overlay column flex-center">
      <q-spinner-cube color="primary" size="60px" />
      <div class="text-h6 q-mt-md text-grey-7 font-exo">Підключення до сесії...</div>
    </div>

    <div v-else class="chat-container column no-wrap mx-auto">
      
      <!-- Потік повідомлень -->
      <q-scroll-area ref="scrollArea" class="col chat-scroll-area">
        <div class="messages-list q-pa-lg">
          
          <!-- Початковий екран -->
          <welcome-screen v-if="store.messages.length === 0" />

          <!-- Список повідомлень -->
          <template v-for="msg in store.messages" :key="msg.id">
            <chat-message 
              :message="msg"
              :is-generating="!!(store.status === 'generating' && isCurrentlyStreaming(msg.id))"
              :thought="isCurrentlyStreaming(msg.id) ? store.currentThought : null"
              :status="store.status"
              :show-thinking="!!(isCurrentlyStreaming(msg.id) || (msg.thoughts && msg.thoughts.length > 0))"
            />
          </template>

          <!-- Системні тоасти (процеси, гачки, MCP) -->
          <status-bubble 
            v-for="toast in store.activeToasts" 
            :key="toast.id"
            :message="toast.message"
            :loading="!toast.finished"
            :icon="toast.finished ? 'check_circle' : undefined"
          />

          <!-- Головний індикатор завантаження (Thinking/Working) -->
          <status-bubble 
            v-if="showLoadingIndicator"
            :message="store.loadingIndicator.phrase || 'Працюю...'"
            :caption="`(esc для скасування, ${formatSeconds(store.loadingIndicator.elapsedTime)})`"
            loading
            can-cancel
            @cancel="store.stopGeneration()"
          />
        </div>
      </q-scroll-area>

      <!-- Область введення -->
      <div class="input-section q-pa-md" :class="$q.dark.isActive ? 'bg-grey-10' : 'bg-grey-1'">
        <div class="input-box-container mx-auto">
          <div class="input-box-wrapper" :class="$q.dark.isActive ? 'input-wrapper-dark' : 'input-wrapper-light'">
            <q-input 
              v-model="input" 
              borderless
              autogrow
              dense
              :dark="$q.dark.isActive"
              class="q-px-lg q-py-sm text-body1 main-input"
              placeholder="Запитайте що завгодно..." 
              @keydown.enter.prevent="send"
              @keydown.esc="store.stopGeneration()"
              :disable="!store.isConnected || isAwaiting"
            >
              <template v-slot:after>
                <q-btn 
                  round 
                  unelevated 
                  dense
                  :icon="isAwaiting ? 'stop' : 'arrow_upward'" 
                  size="14px"
                  :color="input.trim() || isAwaiting ? 'primary' : 'grey-4'" 
                  :text-color="input.trim() || isAwaiting ? 'white' : 'grey-7'"
                  @click="isAwaiting ? store.stopGeneration() : send()" 
                  :disable="!input.trim() && !isAwaiting"
                  class="q-mr-sm transition-all"
                />
              </template>
            </q-input>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, computed } from 'vue';
import { useGeminiStore } from '../stores/gemini';
import { useAuthStore } from '../stores/auth';
import { QScrollArea, useQuasar } from 'quasar';

// Компоненти
import ChatMessage from './Chat/ChatMessage.vue';
import WelcomeScreen from './Chat/WelcomeScreen.vue';
import StatusBubble from './Chat/StatusBubble.vue';

const $q = useQuasar();
const store = useGeminiStore();
const auth = useAuthStore();
const input = ref('');
const scrollArea = ref<QScrollArea | null>(null);

const isAwaiting = computed(() => store.status === 'generating' || store.status === 'thinking');

const showLoadingIndicator = computed(() => {
  return store.status !== 'idle';
});

function isCurrentlyStreaming(id: string) {
  const lastMsg = store.messages[store.messages.length - 1];
  return lastMsg && lastMsg.id === id && id.startsWith('stream-');
}

function formatSeconds(s: number) {
  if (s < 60) return `${s}с`;
  const m = Math.floor(s / 60);
  const rs = s % 60;
  return rs > 0 ? `${m}хв ${rs}с` : `${m}хв`;
}

function send() {
  if (!input.value.trim() || isAwaiting.value) return;
  store.sendMessage(input.value);
  input.value = '';
}

watch([() => store.messages.length, () => store.streamOutput, () => store.loadingIndicator.elapsedTime, () => store.activeToasts.length], () => {
  nextTick(() => {
    scrollArea.value?.setScrollPercentage('vertical', 1);
  }).catch(() => {});
}, { deep: true });
</script>

<style scoped>
.chat-outer-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
}

.chat-container {
  height: 100%;
  width: 100%;
  max-width: 1000px;
}

.chat-scroll-area {
  width: 100%;
}

.messages-list {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
}

.input-section {
  width: 100%;
  flex-shrink: 0;
  z-index: 10;
}

.input-box-container {
  max-width: 800px;
}

.input-box-wrapper {
  border-radius: 24px !important;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.input-wrapper-light {
  background: white;
  border: 1px solid rgba(0,0,0,0.08);
  box-shadow: 0 4px 15px rgba(0,0,0,0.05);
}

.input-wrapper-dark {
  background: #1e293b;
  border: 1px solid rgba(255,255,255,0.1);
}

.input-box-wrapper:focus-within {
  transform: translateY(-2px);
  border-color: rgba(var(--q-primary), 0.5);
}

.input-wrapper-light:focus-within {
  box-shadow: 0 8px 24px rgba(0,0,0,0.1);
}

.main-input {
  line-height: 1.5;
}

.session-loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 20;
  background: inherit;
}

.mx-auto {
  margin-left: auto;
  margin-right: auto;
}

.font-exo {
  font-family: 'Exo 2', sans-serif;
}

.transition-all {
  transition: all 0.2s ease;
}
</style>
