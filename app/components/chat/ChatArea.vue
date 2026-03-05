<script setup lang="ts">
import { ref, onMounted, onUpdated, watch, nextTick, onUnmounted } from 'vue';
import ChatMessageUser from './ChatMessageUser.vue';
import ChatMessageGemini from './ChatMessageGemini.vue';
import ChatMessageThinking from './ChatMessageThinking.vue';
import ChatMessageSystem from './ChatMessageSystem.vue';
import ChatMessageGeminiContent from './ChatMessageGeminiContent.vue';
import ChatMessageToolGroup from './ChatMessageToolGroup.vue';
import ChatMessageConfirmation from './ChatMessageConfirmation.vue';
import type { ConfirmationRequest } from '../../types/api';

const sessionStore = useSessionStore();
const emit = defineEmits(['stop-generation', 'confirm-action', 'load-history']);

const props = defineProps<{
  history: any[];
  isResponding: boolean;
  activeConfirmation?: ConfirmationRequest;
  lastToast?: { id: number; message: string; severity: string } | null;
  responseStartTime?: number | null;
}>();

// ... existing timer logic ...

const scrollContainer = ref<HTMLElement | null>(null);
const userHasScrolledUp = ref(false);
const isLoadingHistory = ref(false);
const prevScrollHeight = ref(0);

const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
  if (!scrollContainer.value) return;
  scrollContainer.value.scrollTo({
    top: scrollContainer.value.scrollHeight,
    behavior
  });
};

const handleScroll = () => {
  if (!scrollContainer.value) return;
  
  const { scrollTop, scrollHeight, clientHeight } = scrollContainer.value;
  // Threshold of 50px to account for small deviations or elastic scrolling
  const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
  
  userHasScrolledUp.value = !isAtBottom;

  // Load history when reaching the top
  if (scrollTop < 50 && !isLoadingHistory.value && props.history.length > 0) {
    isLoadingHistory.value = true;
    prevScrollHeight.value = scrollHeight;
    emit('load-history', props.history.length);
    
    // Reset loading state after a delay or when history changes
    setTimeout(() => {
      isLoadingHistory.value = false;
    }, 1000);
  }
};

// Initial scroll to bottom on mount
onMounted(() => {
  userHasScrolledUp.value = false;
  nextTick(() => {
    scrollToBottom('auto');
  });
});

// Watch for history changes and respond state to auto-scroll if needed
watch([() => props.history, () => props.isResponding, () => props.activeConfirmation], async (newVal, oldVal) => {
  const newHistory = newVal[0];
  const oldHistory = oldVal ? oldVal[0] : [];
  
  // If we just loaded old history items (prepended)
  if (newHistory.length > oldHistory.length && newHistory[newHistory.length - 1]?.id === oldHistory[oldHistory.length - 1]?.id) {
    await nextTick();
    if (scrollContainer.value) {
      // Maintain scroll position relative to the "old" first item
      scrollContainer.value.scrollTop = scrollContainer.value.scrollHeight - prevScrollHeight.value;
    }
    return;
  }

  // If history was empty and now has items, or if the session changed (history replaced), reset sticky
  if (newHistory.length > 0 && (oldHistory.length === 0 || newHistory[0]?.id !== oldHistory[0]?.id)) {
    userHasScrolledUp.value = false;
  }

  if (!userHasScrolledUp.value) {
    await nextTick();
    scrollToBottom();
  }
}, { deep: true });
</script>

<template>
  <div 
    ref="scrollContainer"
    class="flex-1 overflow-y-auto p-4 sm:p-8 flex flex-col gap-6 scroll-smooth bg-[var(--color-vsc-bg)]"
    @scroll="handleScroll"
  >
    <!-- Empty State -->
    <div v-if="history.length === 0 && !activeConfirmation" class="h-full flex flex-col items-center justify-center text-neutral-600">
      <div class="w-20 h-20 bg-[var(--color-vsc-sidebar)] rounded-full flex items-center justify-center mb-6 border border-[var(--color-vsc-border)]">
        <UIcon name="i-heroicons-command-line" class="w-10 h-10 text-neutral-700" />
      </div>
      <h3 class="text-lg font-bold text-neutral-500">Ready to Orchestrate</h3>
      <p class="text-sm">Start a new session to begin.</p>
    </div>

    <template v-else>
      <template v-for="(item, index) in history" :key="item.id">
        <!-- Message list remains the same -->
        <div :class="{ 
          'mt-6': item.type === 'user' && index > 0,
          '-mt-1': item.type === 'gemini_content' && history[index-1]?.type === 'gemini_content'
        }">
          <ChatMessageUser 
            v-if="item.type === 'user'" 
            :text="item.text || ''" 
          />
          <ChatMessageGemini 
            v-else-if="item.type === 'gemini'" 
            :text="item.text || ''" 
            :model-name="item.contextModel"
          />
          <ChatMessageGeminiContent
            v-else-if="item.type === 'gemini_content'"
            :text="item.text || ''"
          />
          <ChatMessageToolGroup
            v-else-if="item.type === 'tool_group'"
            :tools="item.tools || []"
          />
          <ChatMessageThinking 
            v-else-if="item.type === 'thinking'" 
            :thought="item.thought || { summary: '' }" 
          />
          <ChatMessageSystem 
            v-else 
            :type="item.type" 
            :text="item.text"
          />
        </div>
      </template>

      <!-- Active Confirmation -->
      <ChatMessageConfirmation
        v-if="activeConfirmation"
        :request="activeConfirmation"
        @respond="data => emit('confirm-action', data)"
      />

      <!-- Pending History Item -->
      <div v-if="sessionStore.activeSession?.pendingHistoryItem" class="mt-2 opacity-80 grayscale-[0.5]">
        <ChatMessageUser 
          v-if="sessionStore.activeSession.pendingHistoryItem.type === 'user'" 
          :text="sessionStore.activeSession.pendingHistoryItem.text || ''" 
        />
        <ChatMessageGemini 
          v-else-if="sessionStore.activeSession.pendingHistoryItem.type === 'gemini'" 
          :text="sessionStore.activeSession.pendingHistoryItem.text || ''" 
        />
        <ChatMessageToolGroup
          v-else-if="sessionStore.activeSession.pendingHistoryItem.type === 'tool_group'"
          :tools="sessionStore.activeSession.pendingHistoryItem.tools || []"
        />
        <ChatMessageThinking 
          v-else-if="sessionStore.activeSession.pendingHistoryItem.type === 'thinking'" 
          :thought="sessionStore.activeSession.pendingHistoryItem.thought || { summary: '' }" 
        />
      </div>
      
      <!-- Thinking indicator / Toast with Stop Button -->
      <div v-if="isResponding" class="flex flex-col gap-2 mt-2 mb-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
         <div class="flex items-center gap-3">
           <div class="flex items-center gap-2 bg-[var(--color-vsc-sidebar)] border border-[var(--color-vsc-border)] p-2 sm:p-3 rounded-2xl rounded-tl-none shadow-2xl">
             
             <!-- Toast Message or Dots -->
             <div v-if="lastToast" class="px-2 text-sm text-neutral-300 flex items-center gap-2 max-w-[300px] sm:max-w-[500px]">
               <UIcon :name="lastToast.severity === 'error' ? 'i-heroicons-exclamation-circle' : 'i-heroicons-information-circle'" 
                      :class="['w-4 h-4 shrink-0', lastToast.severity === 'error' ? 'text-red-400' : 'text-[var(--color-vsc-blue)]']" />
               <span class="truncate">{{ lastToast.message }}</span>
             </div>
             <div v-else class="flex gap-1.5 px-2">
               <div class="w-1.5 h-1.5 bg-[var(--color-vsc-blue)] rounded-full animate-bounce"></div>
               <div class="w-1.5 h-1.5 bg-[var(--color-vsc-blue)] rounded-full animate-bounce [animation-delay:0.2s]"></div>
               <div class="w-1.5 h-1.5 bg-[var(--color-vsc-blue)] rounded-full animate-bounce [animation-delay:0.4s]"></div>
             </div>

             <!-- Timer (always show if > 0) -->
             <div v-if="elapsedTime > 0" class="border-l border-[var(--color-vsc-border)] pl-3 pr-1 text-[10px] font-mono text-neutral-500 tabular-nums">
               {{ elapsedTime }}s
             </div>
           </div>
           
           <UButton
             icon="i-heroicons-stop-circle"
             color="error"
             variant="soft"
             size="sm"
             label="Stop"
             class="rounded-full font-bold text-[10px] uppercase tracking-wider h-8"
             @click="emit('stop-generation')"
           />
         </div>
      </div>
    </template>
  </div>
</template>
