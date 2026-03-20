<template>
  <q-card style="min-width: 350px">
    <q-card-section class="row items-center">
      <div class="text-h6">System Resources</div>
      <q-space />
      <q-btn icon="close" flat round dense v-close-popup />
    </q-card-section>
    
    <q-card-section class="q-pt-none">
      <div v-if="gemini.projectInfo" class="q-mb-md">
        <div class="text-subtitle2 text-grey-7 uppercase">Project</div>
        <div class="text-weight-bold text-primary">{{ gemini.projectInfo.name }}</div>
        <div class="text-caption text-grey-6">{{ gemini.projectInfo.path }}</div>
        <div v-if="gemini.gitBranch" class="row items-center q-gutter-x-sm q-mt-xs">
          <q-icon name="hub" color="primary" />
          <span class="text-weight-bold">{{ gemini.gitBranch }}</span>
        </div>
      </div>

      <div class="text-subtitle2 q-mb-sm text-grey-7 uppercase row items-center">
        Session Statistics
        <q-space />
        <q-btn flat round dense icon="refresh" size="sm" @click="gemini.fetchStats()">
          <q-tooltip>Refresh Stats</q-tooltip>
        </q-btn>
      </div>

      <q-list bordered separator v-if="gemini.modelStats.length > 0">
        <q-item v-for="m in gemini.modelStats" :key="m.model" class="column q-py-sm">
          <div class="row items-center q-mb-xs">
            <div class="text-weight-bold text-primary col">{{ m.model }}</div>
            <div class="text-caption text-grey-7">{{ m.requests }} reqs</div>
          </div>
          
          <div class="row q-gutter-x-md text-caption text-grey-8 q-mb-sm">
            <div><span class="text-grey-6">In:</span> {{ m.inputTokens.toLocaleString() }}</div>
            <div><span class="text-grey-6">Out:</span> {{ m.outputTokens.toLocaleString() }}</div>
            <div><span class="text-grey-6">Cache:</span> {{ m.cacheReads.toLocaleString() }}</div>
          </div>

          <div v-if="m.quota" class="column q-gutter-y-xs">
            <div class="row items-center text-caption">
              <div class="col">Quota Usage</div>
              <div class="text-weight-bold" :class="m.quota.percentage > 80 ? 'text-negative' : 'text-grey-9'">
                {{ m.quota.percentage }}%
              </div>
            </div>
            <q-linear-progress 
              :value="m.quota.percentage / 100" 
              :color="m.quota.percentage > 80 ? 'negative' : 'primary'"
              size="4px"
              class="rounded-borders"
            />
            <div class="row items-center text-caption text-grey-6">
              <q-icon name="schedule" size="12px" class="q-mr-xs" />
              <span>Resets at {{ m.quota.resetTime }} ({{ m.quota.timeRemaining }})</span>
            </div>
          </div>
        </q-item>
      </q-list>
      <div v-else class="text-caption text-grey-5 italic q-pa-md text-center bordered rounded-borders">
        No stats available yet. Start a conversation!
      </div>

      <q-separator class="q-my-md" />

      <div class="text-subtitle2 q-mb-sm text-grey-7 uppercase">Active MCP Servers</div>
      <q-list bordered separator dense v-if="gemini.mcpServers.length > 0">
        <q-item v-for="srv in gemini.mcpServers" :key="srv">
          <q-item-section>{{ srv }}</q-item-section>
          <q-item-section side><q-badge color="positive">Active</q-badge></q-item-section>
        </q-item>
      </q-list>
      <div v-else class="text-caption text-grey-5 italic q-mb-md">No active MCP servers</div>
      
      <div class="text-subtitle2 q-mt-md q-mb-sm text-grey-7 uppercase">Available Agents</div>
      <div class="row q-gutter-xs" v-if="gemini.agents.length > 0">
        <q-chip 
          v-for="agt in gemini.agents" 
          :key="agt.name" 
          dense 
          outline 
          color="primary" 
          icon="smart_toy"
        >
          {{ agt.name }}
        </q-chip>
      </div>
      <div v-else class="text-caption text-grey-5 italic">No agents detected</div>
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
