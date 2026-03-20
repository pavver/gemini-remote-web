<template>
  <q-footer elevated :class="$q.dark.isActive ? 'bg-grey-10 text-grey-4' : 'bg-white text-grey-9'" class="border-t" style="height: 28px">
    <div class="row items-center full-height q-px-sm no-wrap" style="font-size: 11px">
      <!-- Status -->
      <div class="row items-center q-gutter-x-sm cursor-pointer" @click="showSystemDetails = true">
        <q-icon name="circle" :color="statusColor" size="8px" />
        <span class="text-weight-bold uppercase">{{ gemini.status }}</span>
      </div>
      
      <q-separator vertical class="q-mx-sm" :dark="$q.dark.isActive" />
      
      <!-- Resource Stats -->
      <div class="row items-center q-gutter-x-md hide-on-mobile">
        <div v-if="gemini.ramUsage" class="row items-center q-gutter-x-xs">
          <q-icon name="memory" size="14px" />
          <span>{{ gemini.ramUsage }}</span>
        </div>
        <div v-if="gemini.memory" class="row items-center q-gutter-x-xs">
          <q-icon name="description" size="14px" />
          <span>{{ gemini.memory.fileCount }} files</span>
        </div>
        <div v-if="gemini.activeEditor" class="row items-center q-gutter-x-xs">
          <q-icon name="edit" size="14px" />
          <span>{{ gemini.activeEditor }}</span>
        </div>
        <div v-if="gemini.gitBranch" class="row items-center q-gutter-x-xs text-primary">
          <q-icon name="hub" size="14px" />
          <span>{{ gemini.gitBranch }}</span>
        </div>
        <div v-if="gemini.tokens.total > 0" class="row items-center q-gutter-x-xs">
          <q-icon name="toll" size="14px" />
          <span>{{ gemini.tokens.total.toLocaleString() }} tokens</span>
        </div>
      </div>

      <q-space />

      <!-- Context Usage -->
      <div 
        v-if="gemini.tokens.total > 0" 
        class="row items-center q-gutter-x-sm q-mr-md hide-on-mobile cursor-pointer"
        @click="showSystemDetails = true"
      >
        <span class="text-grey-7">CONTEXT:</span>
        <span class="text-weight-bold" :class="contextUsageColor">{{ contextUsagePercent }}%</span>
        <q-linear-progress 
          :value="gemini.tokens.total / gemini.tokensLimit" 
          :color="contextUsageColor" 
          style="width: 80px; height: 4px" 
          class="rounded-borders"
        >
          <q-tooltip>
            Context Usage: {{ gemini.tokens.total.toLocaleString() }} / {{ gemini.tokensLimit.toLocaleString() }} tokens. Click for full stats.
          </q-tooltip>
        </q-linear-progress>
      </div>

      <!-- Quota -->
      <div v-if="gemini.quota && gemini.quota.remaining !== undefined && gemini.quota.limit !== undefined" class="row items-center q-gutter-x-sm">
        <span class="text-grey-7 hide-on-mobile">TOKENS:</span>
        <span class="text-weight-bold">{{ gemini.quota.remaining.toLocaleString() }}</span>
        <span v-if="quotaResetTime" class="text-caption text-grey-6 hide-on-mobile">
          (resets in {{ quotaResetTime }})
        </span>
        <q-linear-progress 
          :value="gemini.quota.remaining / gemini.quota.limit" 
          color="primary" 
          style="width: 60px; height: 3px" 
          class="rounded-borders"
        >
          <q-tooltip v-if="gemini.quota.resetTime">
            Reset time: {{ gemini.quota.resetTime }}
          </q-tooltip>
        </q-linear-progress>
      </div>
    </div>

    <!-- System Details Dialog (Triggered from Status) -->
    <q-dialog v-model="showSystemDetails">
      <system-details-dialog />
    </q-dialog>
  </q-footer>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useGeminiStore } from '../../stores/gemini';
import SystemDetailsDialog from '../Dialogs/SystemDetailsDialog.vue';

const gemini = useGeminiStore();
const showSystemDetails = ref(false);

const statusColor = computed(() => {
  switch (gemini.status) {
    case 'idle': return 'positive';
    case 'busy': return 'orange';
    case 'thinking': return 'indigo';
    case 'generating': return 'primary';
    default: return 'grey';
  }
});

const contextUsagePercent = computed(() => {
  if (!gemini.tokensLimit || gemini.tokensLimit === 0) return 0;
  return Math.round((gemini.tokens.total / gemini.tokensLimit) * 100);
});

const contextUsageColor = computed(() => {
  const p = contextUsagePercent.value;
  if (p > 85) return 'negative';
  if (p > 60) return 'orange';
  return 'positive';
});

const quotaResetTime = computed(() => {
  if (!gemini.quota || !gemini.quota.resetTime) return null;
  
  // resetTime is usually a ISO string or a locale time string from CLI
  // We'll try to parse it. If it's just a time like "3:33 PM", we'll use it as is
  // for display, but for a real countdown we'd need a full date.
  // For now, let's just display the reset time string itself if it's available.
  return gemini.quota.resetTime;
});
</script>

<style scoped>
.border-t { border-top: 1px solid rgba(0,0,0,0.1); }
@media (max-width: 600px) { .hide-on-mobile { display: none; } }
</style>
