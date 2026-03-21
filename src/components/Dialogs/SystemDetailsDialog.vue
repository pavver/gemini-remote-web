<template>
  <q-card :class="$q.dark.isActive ? 'bg-grey-10 text-white' : 'bg-white text-black'" style="min-width: 600px; border-radius: 12px">
    <q-card-section class="row items-center q-pb-none">
      <div class="text-h6 text-weight-bold">{{ t('system.sessionStats') }}</div>
      <q-space />
      <q-btn icon="close" flat round dense v-close-popup color="grey-6" />
    </q-card-section>

    <q-card-section class="q-pa-md">
      <!-- Interaction Summary -->
      <div class="section-title text-grey-7 q-mb-sm">{{ t('system.interactionSummary') }}</div>
      <div class="summary-grid q-mb-lg">
        <div class="row q-py-xs">
          <div class="col-4 text-grey-6">{{ t('system.sessionId') }}:</div>
          <div class="col-8 text-weight-medium">{{ summary?.sessionId || '-' }}</div>
        </div>
        <div class="row q-py-xs">
          <div class="col-4 text-grey-6">{{ t('system.authMethod') }}:</div>
          <div class="col-8">
            {{ summary?.authMethod || '-' }} 
            <span v-if="summary?.userEmail" class="text-grey-6">({{ summary.userEmail }})</span>
          </div>
        </div>
        <div class="row q-py-xs">
          <div class="col-4 text-grey-6">{{ t('system.tier') }}:</div>
          <div class="col-8">{{ summary?.tier || '-' }}</div>
        </div>
        <div class="row q-py-xs">
          <div class="col-4 text-grey-6">{{ t('system.toolCalls') }}:</div>
          <div class="col-8">
            {{ summary?.toolCalls.total || 0 }} 
            <span class="text-grey-6">(</span>
            <span class="text-positive">✓ {{ summary?.toolCalls.success || 0 }}</span>
            <span class="text-grey-6"> x </span>
            <span class="text-negative">{{ summary?.toolCalls.fail || 0 }}</span>
            <span class="text-grey-6">)</span>
          </div>
        </div>
        <div class="row q-py-xs">
          <div class="col-4 text-grey-6">{{ t('system.successRate') }}:</div>
          <div class="col-8">{{ (summary?.successRate || 0).toFixed(1) }}%</div>
        </div>
      </div>

      <!-- Performance -->
      <div class="section-title text-grey-7 q-mb-sm">{{ t('system.performance') }}</div>
      <div class="summary-grid q-mb-lg">
        <div class="row q-py-xs">
          <div class="col-4 text-grey-6">{{ t('system.wallTime') }}:</div>
          <div class="col-8">{{ formatDuration(summary?.wallTimeSeconds || 0) }}</div>
        </div>
        <div class="row q-py-xs">
          <div class="col-4 text-grey-6">{{ t('system.agentActive') }}:</div>
          <div class="col-8">{{ formatDuration(summary?.agentActiveSeconds || 0) }}</div>
        </div>
        <div class="row q-py-xs pl-md">
          <div class="col-4 text-grey-6">» {{ t('system.apiTime') }}:</div>
          <div class="col-8">
            {{ formatDuration(summary?.apiTimeSeconds || 0) }} 
            <span class="text-grey-6">({{ calculatePercent(summary?.apiTimeSeconds, summary?.agentActiveSeconds) }}%)</span>
          </div>
        </div>
        <div class="row q-py-xs pl-md">
          <div class="col-4 text-grey-6">» {{ t('system.toolTime') }}:</div>
          <div class="col-8">
            {{ formatDuration(summary?.toolTimeSeconds || 0) }}
            <span class="text-grey-6">({{ calculatePercent(summary?.toolTimeSeconds, summary?.agentActiveSeconds) }}%)</span>
          </div>
        </div>
      </div>

      <!-- Model Stats Table -->
      <div class="model-stats-table">
        <div class="row text-grey-6 q-pb-sm border-b text-caption">
          <div class="col-4">{{ t('system.table.model') }}</div>
          <div class="col-1 text-center">{{ t('system.table.reqs') }}</div>
          <div class="col-4 text-center">{{ t('system.table.usage') }}</div>
          <div class="col-3 text-right">{{ t('system.table.resets') }}</div>
        </div>

        <div v-for="m in gemini.modelStats" :key="m.model" class="row items-center q-py-sm border-b-dashed">
          <div class="col-4 text-weight-bold text-primary">{{ m.model }}</div>
          <div class="col-1 text-center">{{ m.requests }}</div>
          <div class="col-4 q-px-sm">
            <div class="row items-center no-wrap">
              <q-linear-progress 
                :value="(m.quota?.percentage || 0) / 100" 
                color="primary" 
                track-color="grey-3"
                class="col rounded-borders"
                style="height: 8px"
              />
              <span class="q-ml-xs text-caption" style="min-width: 30px">{{ m.quota?.percentage || 0 }}%</span>
            </div>
          </div>
          <div class="col-3 text-right text-caption text-grey-7">
            <countdown-timer v-if="m.quota?.resetSeconds" :seconds="m.quota.resetSeconds" />
            <span v-else>-</span>
          </div>
        </div>
      </div>

      <div v-if="gemini.modelStats.length === 0" class="q-pa-lg text-center text-grey-6 italic">
        {{ t('system.noStats') }}
      </div>

      <!-- Footer Info (Project) -->
      <div class="row items-center q-mt-xl text-caption text-grey-6">
        <q-icon name="folder" size="14px" class="q-mr-xs" />
        <span class="ellipsis">{{ gemini.projectInfo?.path }}</span>
        <q-space />
        <q-badge v-if="gemini.gitBranch" outline color="grey-6">
          {{ gemini.gitBranch }}
        </q-badge>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useGeminiStore } from '../../stores/gemini';
import { useI18n } from 'vue-i18n';
import CountdownTimer from '../Common/CountdownTimer.vue';

const gemini = useGeminiStore();
const { t } = useI18n({ useScope: 'global' });

const summary = computed(() => gemini.sessionSummary);

onMounted(() => {
  gemini.fetchStats();
});

function formatDuration(seconds: number): string {
  if (seconds === 0) return `0${t('system.units.s')}`;
  
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  
  const parts = [];
  if (h > 0) parts.push(`${h}${t('system.units.h')}`);
  if (m > 0) parts.push(`${m}${t('system.units.m')}`);
  if (s > 0 || (h === 0 && m === 0)) parts.push(`${s}${t('system.units.s')}`);
  
  return parts.join(' ');
}

function calculatePercent(part?: number, total?: number): string {
  if (!part || !total || total === 0) return '0.0';
  return ((part / total) * 100).toFixed(1);
}
</script>

<style scoped>
.section-title {
  font-weight: bold;
  font-size: 13px;
  border-bottom: 1px solid rgba(0,0,0,0.05);
  padding-bottom: 4px;
}

.body--dark .section-title {
  border-bottom-color: rgba(255,255,255,0.05);
}

.summary-grid {
  font-size: 13px;
}

.pl-md {
  padding-left: 20px;
}

.border-b {
  border-bottom: 1px solid rgba(0,0,0,0.1);
}

.body--dark .border-b {
  border-bottom-color: rgba(255,255,255,0.1);
}

.border-b-dashed {
  border-bottom: 1px dashed rgba(0,0,0,0.05);
}

.body--dark .border-b-dashed {
  border-bottom-color: rgba(255,255,255,0.05);
}

.model-stats-table {
  font-size: 13px;
}
</style>
