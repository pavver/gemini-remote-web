<template>
  <div v-if="gemini.uiSettings.showThoughts && thought" class="thinking-container q-mb-sm">
    <div 
      class="thinking-header row items-center cursor-pointer q-pa-sm rounded-borders transition-all"
      @click="isExpanded = !isExpanded"
      :class="$q.dark.isActive ? 'bg-grey-9 text-grey-5' : 'bg-grey-2 text-grey-7'"
    >
      <q-icon 
        name="psychology" 
        size="18px" 
        class="q-mr-sm"
        :class="status === 'thinking' ? 'animate-pulse' : ''" 
      />
      <div class="text-caption text-weight-medium ellipsis">
        {{ thought.subject || 'Процес мислення...' }}
      </div>
      <q-space />
      <q-icon 
        :name="isExpanded ? 'expand_less' : 'expand_more'" 
        size="16px" 
      />
    </div>
    
    <q-slide-transition>
      <div v-show="isExpanded" class="thinking-content q-pa-md text-caption">
        <div class="thought-text text-grey-6 italic">
          {{ thought.summary }}
        </div>
      </div>
    </q-slide-transition>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useQuasar } from 'quasar';
import { useGeminiStore } from '../../stores/gemini';
import type { ThoughtInfo, AgentStatus } from '../../types/protocol';

defineProps<{
  thought: ThoughtInfo | null;
  status: AgentStatus;
}>();

const $q = useQuasar();
const gemini = useGeminiStore();
const isExpanded = ref(false);
</script>

<style scoped>
.thinking-container {
  max-width: 600px;
}

.thinking-header {
  border: 1px solid transparent;
  opacity: 0.8;
}

.thinking-header:hover {
  opacity: 1;
}

.thinking-content {
  border-left: 2px solid var(--q-primary);
  margin-left: 12px;
  background: rgba(var(--q-primary), 0.03);
}

.thought-text {
  line-height: 1.4;
  white-space: pre-wrap;
}

.animate-pulse {
  animation: pulse-indigo 2s infinite;
}

@keyframes pulse-indigo {
  0% { color: #5c6bc0; opacity: 1; }
  50% { color: #3f51b5; opacity: 0.5; }
  100% { color: #5c6bc0; opacity: 1; }
}

.transition-all {
  transition: all 0.2s ease;
}
</style>
