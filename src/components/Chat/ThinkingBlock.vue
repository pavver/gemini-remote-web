<template>
  <div v-if="gemini.uiSettings.showThoughts && hasThoughts" class="thinking-container q-mb-xs">
    <div 
      class="thinking-header row items-center cursor-pointer q-pa-xs rounded-borders transition-all"
      @click="isExpanded = !isExpanded"
      :class="$q.dark.isActive ? 'bg-grey-9 text-grey-5' : 'bg-grey-2 text-grey-7'"
    >
      <q-icon 
        name="psychology" 
        size="14px" 
        class="q-mr-sm"
        :class="status === 'thinking' ? 'animate-pulse' : ''" 
      />
      <div class="text-caption text-weight-medium ellipsis" style="font-size: 10px">
        {{ headerText }}
      </div>
      <q-space />
      <q-icon 
        :name="isExpanded ? 'expand_less' : 'expand_more'" 
        size="14px" 
      />
    </div>
    
    <q-slide-transition>
      <div v-show="isExpanded" class="thinking-content q-mt-xs q-pa-sm rounded-borders">
        <div v-for="(t, idx) in allThoughts" :key="idx" class="thought-item q-mb-sm">
          <div class="row items-center justify-between q-mb-xs">
            <div class="text-weight-bold text-primary" style="font-size: 10px">{{ t.subject }}</div>
            <div class="text-grey-6" style="font-size: 8px">{{ formatTime(t.timestamp) }}</div>
          </div>
          <div class="thought-text text-grey-7 italic">
            {{ t.summary || t.description }}
          </div>
          <q-separator v-if="idx < allThoughts.length - 1" class="q-my-xs opacity-20" />
        </div>
      </div>
    </q-slide-transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useQuasar } from 'quasar';
import { useGeminiStore } from '../../stores/gemini';
import type { ThoughtInfo, AgentStatus } from '../../types/protocol';

const props = defineProps<{
  thought?: ThoughtInfo | null;
  thoughts?: ThoughtInfo[] | undefined;
  status: AgentStatus;
}>();

const $q = useQuasar();
const gemini = useGeminiStore();
const isExpanded = ref(false);

const allThoughts = computed(() => {
  if (props.thoughts && props.thoughts.length > 0) return props.thoughts;
  if (props.thought) return [props.thought];
  return [];
});

const hasThoughts = computed(() => allThoughts.value.length > 0);

const headerText = computed(() => {
  if (props.status === 'thinking') return 'Модель міркує...';
  if (allThoughts.value.length > 1) return `Роздуми (${allThoughts.value.length} кроки)`;
  return allThoughts.value[0]?.subject || 'Роздуми моделі';
});

function formatTime(iso: string) {
  try {
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  } catch { return ''; }
}
</script>

<style scoped>
.thinking-container {
  max-width: 100%;
}

.thinking-header {
  border: 1px solid transparent;
  opacity: 0.7;
  user-select: none;
}

.thinking-header:hover {
  opacity: 1;
  background: rgba(var(--q-primary), 0.05);
}

.thinking-content {
  border-left: 2px solid var(--q-primary);
  background: rgba(var(--q-primary), 0.02);
  margin-left: 6px;
}

.thought-text {
  font-size: 11px;
  line-height: 1.4;
  white-space: pre-wrap;
}

.animate-pulse {
  animation: pulse-primary 2s infinite;
}

@keyframes pulse-primary {
  0% { color: var(--q-primary); opacity: 1; }
  50% { color: var(--q-primary); opacity: 0.4; }
  100% { color: var(--q-primary); opacity: 1; }
}

.transition-all {
  transition: all 0.2s ease;
}
</style>
