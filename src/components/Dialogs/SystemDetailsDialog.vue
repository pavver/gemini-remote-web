<template>
  <q-card style="min-width: 350px">
    <q-card-section class="row items-center">
      <div class="text-h6">System Resources</div>
      <q-space />
      <q-btn icon="close" flat round dense v-close-popup />
    </q-card-section>
    
    <q-card-section class="q-pt-none">
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
import { useGeminiStore } from '../../stores/gemini';

const gemini = useGeminiStore();
</script>
