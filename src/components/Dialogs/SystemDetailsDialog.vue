<template>
  <q-card :class="$q.dark.isActive ? 'bg-grey-10 text-white' : 'bg-white text-black'" style="min-width: 450px; border-radius: 16px">
    <q-card-section class="row items-center q-pb-none">
      <q-avatar icon="analytics" color="primary-1" text-color="primary" size="md" />
      <div class="text-h6 q-ml-md font-exo">{{ $t('system.title') }}</div>
      <q-space />
      <q-btn icon="close" flat round dense v-close-popup color="grey-6" />
    </q-card-section>
    
    <q-card-section class="q-pa-md">
      <!-- Project Info -->
      <div v-if="gemini.projectInfo" class="project-banner q-pa-md rounded-borders q-mb-lg" :class="$q.dark.isActive ? 'bg-grey-9' : 'bg-grey-1'">
        <div class="row items-center q-mb-xs">
          <div class="text-overline text-grey-6 text-weight-bold">{{ $t('system.project') }}</div>
          <q-space />
          <q-badge v-if="gemini.gitBranch" color="primary" class="q-px-sm">
            <q-icon name="hub" size="12px" class="q-mr-xs" />
            {{ gemini.gitBranch }}
          </q-badge>
        </div>
        <div class="text-h6 text-weight-bold text-primary">{{ gemini.projectInfo.name }}</div>
        <div class="text-caption text-grey-6 ellipsis">{{ gemini.projectInfo.path }}</div>
      </div>

      <!-- Statistics Section -->
      <div class="row items-center q-mb-md">
        <div class="text-subtitle2 text-weight-bold uppercase">{{ $t('system.statistics') }}</div>
        <q-space />
        <q-btn flat round dense icon="refresh" size="sm" color="primary" @click="gemini.fetchStats()">
          <q-tooltip>{{ $t('system.refresh') }}</q-tooltip>
        </q-btn>
      </div>

      <div v-if="gemini.modelStats.length > 0" class="q-gutter-y-md">
        <q-card 
          v-for="m in gemini.modelStats" 
          :key="m.model" 
          flat 
          bordered 
          class="model-stat-card"
          :class="$q.dark.isActive ? 'bg-grey-9' : 'bg-white'"
        >
          <q-card-section class="q-pa-md">
            <div class="row items-center q-mb-md">
              <q-badge color="indigo" class="q-mr-sm">{{ m.requests }}</q-badge>
              <div class="text-weight-bold text-primary">{{ m.model }}</div>
            </div>
            
            <div class="row q-col-gutter-sm text-center q-mb-md">
              <div class="col-4">
                <div class="text-caption text-grey-6">In</div>
                <div class="text-weight-bold">{{ m.inputTokens.toLocaleString() }}</div>
              </div>
              <div class="col-4 border-sides">
                <div class="text-caption text-grey-6">Out</div>
                <div class="text-weight-bold">{{ m.outputTokens.toLocaleString() }}</div>
              </div>
              <div class="col-4">
                <div class="text-caption text-grey-6">Cache</div>
                <div class="text-weight-bold">{{ m.cacheReads.toLocaleString() }}</div>
              </div>
            </div>

            <div v-if="m.quota" class="column q-mt-sm">
              <div class="row items-center justify-between q-mb-xs">
                <div class="text-caption text-grey-7">{{ $t('system.quotaUsage') }}</div>
                <div class="text-weight-bold text-caption" :class="m.quota.percentage > 80 ? 'text-negative' : ''">
                  {{ m.quota.percentage }}%
                </div>
              </div>
              <q-linear-progress 
                :value="m.quota.percentage / 100" 
                :color="m.quota.percentage > 80 ? 'negative' : 'primary'"
                size="6px"
                rounded
              />
              <div v-if="m.quota.resetTime" class="text-right text-grey-6 q-mt-xs" style="font-size: 10px">
                {{ $t('system.resetsAt', { time: m.quota.resetTime }) }}
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
      <div v-else class="empty-stats q-pa-xl text-center border-dashed rounded-borders">
        <q-icon name="insights" size="48px" color="grey-4" />
        <div class="text-caption text-grey-6 q-mt-sm">{{ $t('system.noStats') }}</div>
      </div>

      <!-- Infrastructure -->
      <div class="row q-col-gutter-md q-mt-md">
        <!-- MCP Servers -->
        <div class="col-12 col-sm-6">
          <div class="text-subtitle2 q-mb-sm text-weight-bold uppercase">{{ $t('system.mcpServers') }}</div>
          <q-list bordered separator dense class="rounded-borders overflow-hidden" v-if="gemini.mcpServers.length > 0">
            <q-item v-for="srv in gemini.mcpServers" :key="srv" class="q-py-xs">
              <q-item-section class="text-caption">{{ srv }}</q-item-section>
              <q-item-section side><q-badge color="positive" rounded size="8px" /></q-item-section>
            </q-item>
          </q-list>
          <div v-else class="text-caption text-grey-5 italic">{{ $t('system.noMcp') }}</div>
        </div>

        <!-- Available Agents -->
        <div class="col-12 col-sm-6">
          <div class="text-subtitle2 q-mb-sm text-weight-bold uppercase">{{ $t('system.agents') }}</div>
          <div class="row q-gutter-xs" v-if="gemini.agents.length > 0">
            <q-chip 
              v-for="agt in gemini.agents" 
              :key="agt.name" 
              dense 
              outline 
              color="primary" 
              icon="smart_toy"
              class="agent-chip"
            >
              {{ agt.name }}
            </q-chip>
          </div>
          <div v-else class="text-caption text-grey-5 italic">{{ $t('system.noAgents') }}</div>
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useGeminiStore } from '../../stores/gemini';

const gemini = useGeminiStore();

onMounted(() => {
  gemini.fetchStats();
});
</script>

<style scoped>
.font-exo {
  font-family: 'Exo 2', sans-serif;
}

.bg-primary-1 {
  background: rgba(var(--q-primary), 0.1);
}

.project-banner {
  border: 1px solid rgba(var(--q-primary), 0.1);
}

.model-stat-card {
  border-radius: 12px;
  border: 1px solid rgba(0,0,0,0.05);
}

.body--dark .model-stat-card {
  border-color: rgba(255,255,255,0.05);
}

.border-sides {
  border-left: 1px solid rgba(0,0,0,0.05);
  border-right: 1px solid rgba(0,0,0,0.05);
}

.body--dark .border-sides {
  border-color: rgba(255,255,255,0.05);
}

.border-dashed {
  border: 2px dashed rgba(0,0,0,0.05);
}

.body--dark .border-dashed {
  border-color: rgba(255,255,255,0.05);
}

.agent-chip {
  font-size: 10px;
}

.uppercase {
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-size: 11px;
  color: #757575;
}
</style>
