<script setup lang="ts">
import AppSidebar from './components/layout/AppSidebar.vue';
import AppHeader from './components/layout/AppHeader.vue';
import ChatArea from './components/chat/ChatArea.vue';
import ChatInput from './components/chat/ChatInput.vue';
import NewSessionModal from './components/NewSessionModal.vue';

const { isConnected, connect, startSession, stopSession, sendMessage, stopGeneration } = useOrchestrator();
const sessionStore = useSessionStore();

const isNewSessionModalOpen = ref(false);
const isStartingSession = ref(false);
const isSidebarOpen = ref(true);

onMounted(() => {
  connect();
  if (typeof window !== 'undefined' && window.innerWidth < 1024) {
    isSidebarOpen.value = false;
  }
});

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
    <div class="flex h-screen bg-[var(--color-vsc-bg)] text-[var(--color-vsc-foreground)] overflow-hidden font-sans">
      <AppSidebar 
        :is-open="isSidebarOpen"
        :is-connected="isConnected"
        @open-new-session="isNewSessionModalOpen = true"
        @select-session="id => sessionStore.activeSessionId = id"
        @stop-session="stopSession"
        @toggle-sidebar="isSidebarOpen = !isSidebarOpen"
      />

      <main class="flex-1 flex flex-col relative overflow-hidden bg-[var(--color-vsc-bg)]">
        <AppHeader 
          :sidebar-open="isSidebarOpen"
          @toggle-sidebar="isSidebarOpen = !isSidebarOpen"
        />

        <ChatArea 
          :history="enrichedHistory"
          :is-responding="sessionStore.activeSession?.streamingState === 'responding'"
          @stop-generation="stopGeneration"
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
