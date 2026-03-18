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
      </div>

      <q-space />

      <!-- Quota -->
      <div v-if="gemini.quota && gemini.quota.remaining !== undefined && gemini.quota.limit !== undefined" class="row items-center q-gutter-x-sm">
        <span class="text-grey-7 hide-on-mobile">TOKENS:</span>
        <span class="text-weight-bold">{{ gemini.quota.remaining.toLocaleString() }}</span>
        <q-linear-progress 
          :value="gemini.quota.remaining / gemini.quota.limit" 
          color="primary" 
          style="width: 60px; height: 3px" 
          class="rounded-borders"
        />
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
</script>

<style scoped>
.border-t { border-top: 1px solid rgba(0,0,0,0.1); }
@media (max-width: 600px) { .hide-on-mobile { display: none; } }
</style>
