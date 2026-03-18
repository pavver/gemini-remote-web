<template>
  <q-header 
    elevated 
    :class="$q.dark.isActive ? 'bg-grey-10 text-white' : 'bg-white text-grey-9'" 
    height-hint="50"
  >
    <q-toolbar class="q-px-md" style="height: 50px">
      <q-btn flat dense round icon="menu" @click="$emit('toggle-left')" class="q-mr-sm" />
      
      <q-toolbar-title class="row items-center no-wrap">
        <div class="text-weight-bold text-h6 q-mr-sm">Gemini CLI</div>
        <q-badge outline color="primary" class="hide-on-mobile">
          {{ gemini.activeModel || 'Direct' }}
        </q-badge>
      </q-toolbar-title>

      <q-space />

      <div class="row items-center q-gutter-x-sm">
        <!-- Theme Toggle -->
        <q-btn 
          flat 
          round 
          dense 
          :icon="$q.dark.isActive ? 'light_mode' : 'dark_mode'" 
          @click="$q.dark.toggle()"
          :color="$q.dark.isActive ? 'amber' : 'grey-7'"
        >
          <q-tooltip>{{ $q.dark.isActive ? 'Switch to Light' : 'Switch to Dark' }}</q-tooltip>
        </q-btn>

        <!-- Settings Toggle -->
        <q-btn 
          flat 
          round 
          dense 
          icon="settings" 
          color="grey-7"
          @click="$emit('open-settings')"
        >
          <q-tooltip>Settings</q-tooltip>
        </q-btn>

        <q-separator vertical inset class="q-mx-sm" :dark="$q.dark.isActive" />

        <!-- Thought Toggle -->
        <q-btn 
          flat 
          round 
          dense 
          icon="psychology" 
          :color="gemini.status === 'thinking' ? 'indigo' : ($q.dark.isActive ? 'grey-4' : 'grey-7')" 
          @click="$emit('toggle-right')"
        >
          <q-tooltip>Model Thoughts</q-tooltip>
          <q-badge v-if="gemini.currentThought" floating color="red" rounded size="8px" />
        </q-btn>
      </div>
    </q-toolbar>
  </q-header>
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar';
import { useGeminiStore } from '../stores/gemini';

const $q = useQuasar();
const gemini = useGeminiStore();

defineEmits(['toggle-left', 'toggle-right', 'open-settings']);
</script>

<style scoped>
@media (max-width: 600px) {
  .hide-on-mobile {
    display: none;
  }
}
</style>
