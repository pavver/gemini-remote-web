<script setup lang="ts">
import AppSidebar from './components/layout/AppSidebar.vue';
import AppHeader from './components/layout/AppHeader.vue';
import ChatArea from './components/chat/ChatArea.vue';
import ChatInput from './components/chat/ChatInput.vue';
import NewSessionModal from './components/NewSessionModal.vue';
import LoginForm from './components/LoginForm.vue';
import ConfirmationModal from './components/ConfirmationModal.vue';

const { 
  isConnected, 
  isAuthenticated, 
  authError, 
  activeConfirmation,
  connect, 
  startSession, 
  stopSession, 
  sendMessage, 
  stopGeneration,
  sendConfirmation
} = useOrchestrator();
const sessionStore = useSessionStore();

const isNewSessionModalOpen = ref(false);
const isStartingSession = ref(false);
const isSidebarOpen = ref(true);
const isAuthConnecting = ref(false);
const isAppInitializing = ref(true);
const initialAuthData = ref<any>(null);

onMounted(async () => {
  if (import.meta.client && window.innerWidth < 1024) {
    isSidebarOpen.value = false;
  }

  // Check for saved credentials
  const saved = import.meta.client ? localStorage.getItem('gemini_remote_auth') : null;
  if (saved) {
    try {
      initialAuthData.value = JSON.parse(saved);
      // Attempt auto-connect
      handleAuthConnect({ ...initialAuthData.value, remember: true });
    } catch (e) {
      console.error('Failed to parse saved auth', e);
      isAppInitializing.value = false;
    }
  } else {
    // No saved credentials, show login form immediately
    isAppInitializing.value = false;
  }
});

function handleAuthConnect(data: any) {
  isAuthConnecting.value = true;
  
  if (data.remember) {
    localStorage.setItem('gemini_remote_auth', JSON.stringify({
      url: data.url,
      login: data.login,
      password: data.password
    }));
  } else {
    localStorage.removeItem('gemini_remote_auth');
  }
  
  connect(data.url, data.login, data.password);
}

// Watch for authentication results
watch([isConnected, isAuthenticated, authError], ([connected, authenticated, err], [oldConnected]) => {
  // If we got authenticated, hide splash and login
  if (authenticated) {
    isAppInitializing.value = false;
    isAuthConnecting.value = false;
    return;
  }

  // If we got a specific error from the server
  if (err) {
    isAppInitializing.value = false;
    isAuthConnecting.value = false;
    return;
  }

  // If we were trying to connect and the connection was closed (failed attempt)
  if (oldConnected === true && !connected && !authenticated && isAuthConnecting.value) {
    isAppInitializing.value = false;
    isAuthConnecting.value = false;
  }
});

function handleLogout() {
  localStorage.removeItem('gemini_remote_auth');
  window.location.reload();
}

// Watch for active session change to close modal
watch(() => sessionStore.activeSessionId, (newId) => {
  if (newId && isStartingSession.value) {
    isStartingSession.value = false;
    isNewSessionModalOpen.value = false;
  }
});

const enrichedHistory = computed(() => {
  if (!sessionStore.activeSession) return [];
  
  const history = sessionStore.activeSession.history;
  const toolArgsCache = sessionStore.activeSession.toolArgsCache;
  let currentModel = '';
  const result = [];
  
  for (const item of history) {
    if (item.type === 'model') {
      currentModel = item.model || '';
      continue;
    }
    
    // Hide technical messages
    if (item.type?.includes('tool_call') || item.type === 'tool_result' || item.type === 'tool_call_request') {
      continue;
    }

    let processedItem = { ...item, contextModel: currentModel };
    
    if (item.type === 'info' && typeof item.payload === 'object' && item.payload?.message) {
      processedItem.text = item.payload.message;
    }

    if (item.type === 'tool_group' && item.tools) {
      processedItem.tools = item.tools.map((t: any) => ({
        ...t,
        args: t.args || toolArgsCache[t.name.toLowerCase().replace(/_/g, '')]
      }));
    }
    
    result.push(processedItem);
  }
  
  return result;
});

function handleNewSession(path: string) {
  isStartingSession.value = true;
  startSession(path);
}
</script>

<template>
  <UApp>
    <!-- Splash Screen / Initial Loader -->
    <div v-if="isAppInitializing" class="flex flex-col items-center justify-center min-h-screen bg-[var(--color-vsc-bg)]">
      <div class="flex flex-col items-center gap-6">
        <UIcon name="i-heroicons-cpu-chip" class="w-16 h-16 text-[var(--color-vsc-blue)] animate-pulse" />
        <div class="flex items-center gap-3 bg-[var(--color-vsc-sidebar)] px-6 py-3 rounded-full border border-[var(--color-vsc-border)] shadow-xl">
          <UIcon name="i-heroicons-arrow-path" class="w-4 h-4 text-[var(--color-vsc-blue)] animate-spin" />
          <span class="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em]">Initializing System</span>
        </div>
      </div>
    </div>

    <LoginForm
      v-else-if="!isAuthenticated"
      :error="authError"
      :is-connecting="isAuthConnecting"
      :initial-data="initialAuthData"
      @connect="handleAuthConnect"
    />

    <div v-else class="flex h-screen bg-[var(--color-vsc-bg)] text-[var(--color-vsc-foreground)] overflow-hidden font-sans">
      <AppSidebar 
        :is-open="isSidebarOpen"
        :is-connected="isConnected"
        @open-new-session="isNewSessionModalOpen = true"
        @select-session="id => sessionStore.activeSessionId = id"
        @stop-session="stopSession"
        @toggle-sidebar="isSidebarOpen = !isSidebarOpen"
        @logout="handleLogout"
      />

      <main class="flex-1 flex flex-col relative overflow-hidden bg-[var(--color-vsc-bg)]">
        <AppHeader 
          :sidebar-open="isSidebarOpen"
          @toggle-sidebar="isSidebarOpen = !isSidebarOpen"
        />

        <ChatArea 
          :history="enrichedHistory"
          :is-responding="sessionStore.activeSession?.streamingState === 'responding'"
          :active-confirmation="activeConfirmation"
          :last-toast="sessionStore.activeSession?.lastToast"
          :response-start-time="sessionStore.activeSession?.responseStartTime"
          @stop-generation="stopGeneration"
          @confirm-action="({ id, confirmed, choice }) => sendConfirmation(id, confirmed, choice)"
        />

        <ChatInput 
          v-if="sessionStore.activeSession"
          :disabled="sessionStore.activeSession.streamingState === 'responding'"
          @send="sendMessage"
        />
      </main>
    </div>

    <NewSessionModal 
      v-model:open="isNewSessionModalOpen" 
      :loading="isStartingSession"
      @submit="handleNewSession" 
    />
  </UApp>
</template>

<style>
body { margin: 0; padding: 0; }
</style>
