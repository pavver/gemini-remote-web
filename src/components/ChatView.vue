<template>
  <div class="chat-outer-wrapper" :class="$q.dark.isActive ? 'bg-grey-10' : 'bg-grey-1'">
    <div v-if="!store.isConnected && auth.activeSessionId" class="session-loading-overlay column flex-center">
      <q-spinner-cube color="primary" size="60px" />
      <div class="text-h6 q-mt-md text-grey-7">Підключення до сесії...</div>
      <div class="text-caption text-grey-6">Це може зайняти кілька секунд</div>
    </div>

    <div v-else class="chat-container column no-wrap mx-auto">
      
      <!-- Messages Flow -->
      <q-scroll-area ref="scrollArea" class="col chat-scroll-area">
        <div class="messages-list q-pa-lg">
          
          <!-- Empty state -->
          <div v-if="store.messages.length === 0" 
               class="welcome-screen column flex-center text-grey-6">
            <q-icon name="auto_awesome" size="80px" class="q-mb-md" />
            <div class="text-h4 text-weight-light">Gemini CLI</div>
            <div class="text-subtitle1 q-mt-sm">Чим я можу допомогти вам сьогодні?</div>
          </div>

          <div v-for="msg in store.messages" :key="msg.id" class="q-mb-xl">
            <!-- User Message -->
            <div v-if="msg.type === 'user'" class="row justify-end">
              <div class="message-bubble user-bubble shadow-2">
                <div class="content-text">{{ msg.content[0]?.text }}</div>
              </div>
            </div>

            <!-- Gemini / Info / Error Message -->
            <div v-else class="row justify-start items-start no-wrap">
              <div class="avatar-col q-mr-md">
                <q-avatar 
                  size="36px" 
                  :color="msg.type === 'gemini' ? 'primary' : (msg.type === 'error' ? 'red' : 'grey-8')" 
                  text-color="white" 
                  :icon="msg.type === 'gemini' ? 'auto_awesome' : (msg.type === 'error' ? 'report_problem' : 'info')"
                  class="shadow-2"
                />
              </div>
              <div class="message-content col">
                <div class="agent-name q-mb-xs text-caption text-grey-7 text-weight-bold">
                  {{ msg.type === 'gemini' ? (msg.model || 'Gemini') : (msg.type === 'error' ? 'Помилка' : (msg.type === 'warning' ? 'Попередження' : 'Система')) }}
                </div>
                <div class="message-bubble bot-bubble" 
                     :class="{ 'error-bubble': msg.type === 'error', 'warning-bubble': msg.type === 'warning', 'info-bubble': msg.type === 'info' }">
                  <pre class="content-text">{{ msg.content[0]?.text }}</pre>
                  
                  <!-- Streaming Progress -->
                  <q-linear-progress 
                    v-if="msg.type === 'gemini' && store.status === 'generating' && isLastGeminiMessage(msg.id)" 
                    indeterminate 
                    color="primary" 
                    size="2px" 
                    class="q-mt-md" 
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- System Toasts (Transient events) -->
          <div v-if="activeToasts.length > 0" class="system-toasts-container q-mt-md">
            <div v-for="toast in activeToasts" :key="toast.id" class="system-toast row items-center no-wrap q-mb-sm shadow-1">
              <q-spinner v-if="!toast.finished" size="14px" color="primary" class="q-mr-sm" />
              <q-icon v-else name="check_circle" color="positive" size="14px" class="q-mr-sm" />
              <div class="text-caption text-grey-8">{{ toast.message }}</div>
            </div>
          </div>

          <!-- Thinking Spinner -->
          <div v-if="store.status === 'thinking' && !store.loadingIndicator.phrase" class="row justify-start items-center q-mt-lg">
            <q-avatar size="36px" color="primary" text-color="white" icon="auto_awesome" class="q-mr-md shadow-2" />
            <q-spinner-dots color="primary" size="2em" />
          </div>

          <!-- New Loading Indicator (Loader + Text + Timer) -->
          <div v-if="store.status !== 'idle' && store.status !== 'generating' || (store.status === 'generating' && !store.messages.some(m => m.type === 'gemini'))" class="row justify-start items-center q-mt-lg q-ml-sm">
            <q-spinner-ios color="primary" size="24px" class="q-mr-md" />
            <div class="column">
              <div class="text-caption text-grey-8 text-weight-medium">{{ store.loadingIndicator.phrase || 'Працюю...' }}</div>
              <div class="text-caption text-grey-6">(esc для скасування, {{ formatSeconds(store.loadingIndicator.elapsedTime) }})</div>
            </div>
          </div>
        </div>
      </q-scroll-area>

      <!-- Input Area -->
      <div class="input-section q-pa-md" :class="$q.dark.isActive ? 'bg-grey-10' : 'bg-grey-1'">
        <div class="input-box-container mx-auto">
          <div class="input-box-wrapper shadow-4" :class="$q.dark.isActive ? 'bg-grey-9' : 'bg-white'">
            <q-input 
              v-model="input" 
              borderless
              autogrow
              dense
              :dark="$q.dark.isActive"
              class="q-px-lg q-py-sm text-body1"
              placeholder="Введіть повідомлення для Gemini..." 
              @keydown.enter.prevent="send"
              :disable="!store.isConnected || store.status === 'generating' || store.status === 'thinking'"
            >
              <template v-slot:after>
                <q-btn 
                  round 
                  unelevated 
                  dense
                  icon="arrow_upward" 
                  size="12px"
                  :color="input.trim() ? 'primary' : 'grey-4'" 
                  :text-color="input.trim() ? 'white' : 'grey-7'"
                  @click="send" 
                  :disable="!input.trim() || store.status === 'generating'"
                  class="q-mr-sm"
                />
              </template>
            </q-input>
          </div>
          <div class="text-center q-mt-xs text-caption text-grey-6">
            Gemini може помилятися. Перевіряйте важливу інформацію.
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

const $q = useQuasar();
const store = useGeminiStore();
const auth = useAuthStore();
const input = ref('');
const scrollArea = ref<QScrollArea | null>(null);

// System toasts logic
const activeToasts = computed(() => store.activeToasts);

function isLastGeminiMessage(id: string) {
  const geminiMessages = store.messages.filter(m => m.type === 'gemini');
  const lastGemini = geminiMessages[geminiMessages.length - 1];
  return lastGemini !== undefined && lastGemini.id === id;
}

function formatSeconds(s: number) {
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  const rs = s % 60;
  return rs > 0 ? `${m}m ${rs}s` : `${m}m`;
}

function send() {
  if (!input.value.trim() || store.status === 'generating' || store.status === 'thinking') return;
  store.sendMessage(input.value);
  input.value = '';
}

// Auto-scroll logic
watch([() => store.messages.length, () => store.streamOutput, () => store.activeToasts.length, () => store.loadingIndicator.elapsedTime], () => {
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
  max-width: 900px;
}

.chat-scroll-area {
  width: 100%;
}

.messages-list {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
}

.message-bubble {
  padding: 14px 20px;
  border-radius: 18px;
  line-height: 1.5;
  font-size: 16px;
  white-space: pre-wrap;
  word-wrap: break-word;
  max-width: 85%;
}

.user-bubble {
  background-color: var(--q-primary);
  color: white;
  border-bottom-right-radius: 4px;
}

.bot-bubble {
  background-color: transparent;
  padding-left: 0;
  padding-top: 0;
  max-width: 100%;
}

.body--dark .bot-bubble { color: #ececec; }
.body--light .bot-bubble { color: #1f1f1f; }

.error-bubble { 
  color: #d32f2f; 
  background: rgba(211, 47, 47, 0.05);
  padding: 8px 12px;
  border-radius: 12px;
}
.warning-bubble { 
  color: #f57c00; 
  background: rgba(245, 124, 0, 0.05);
  padding: 8px 12px;
  border-radius: 12px;
}
.info-bubble { 
  opacity: 0.9; 
  font-style: italic; 
  background: rgba(0, 0, 0, 0.03);
  padding: 8px 12px;
  border-radius: 12px;
}
.body--dark .info-bubble { background: rgba(255, 255, 255, 0.05); }

.avatar-col {
  flex-shrink: 0;
}

.content-text {
  margin: 0;
  font-family: inherit;
  white-space: pre-wrap;
}

.input-section {
  width: 100%;
  flex-shrink: 0;
}

.input-box-container {
  max-width: 800px;
}

.input-box-wrapper {
  border-radius: 28px !important;
  overflow: hidden;
  transition: box-shadow 0.2s;
}

.input-box-wrapper:focus-within {
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.system-toasts-container {
  padding-left: 52px;
}

.system-toast {
  background: rgba(0,0,0,0.05);
  padding: 6px 12px;
  border-radius: 12px;
  display: inline-flex;
}

.body--dark .system-toast {
  background: rgba(255,255,255,0.05);
}

.welcome-screen {
  margin-top: 10vh;
  opacity: 0.7;
}

.mx-auto {
  margin-left: auto;
  margin-right: auto;
}

.session-loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 10;
  background: inherit;
}
</style>
